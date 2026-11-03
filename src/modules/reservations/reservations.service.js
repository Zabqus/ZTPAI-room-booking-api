const { ValidationError, ForbiddenError, NotFoundError, ConflictError } = require('../../errors/errors');

const MINUTE_MS = 60 * 1000;
const MIN_DURATION_MS = 15 * MINUTE_MS;
const MAX_DURATION_MS = 8 * 60 * MINUTE_MS;

const STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
};

const ALLOWED_TRANSITIONS = {
  [STATUS.CONFIRMED]: [STATUS.CANCELLED],
  [STATUS.CANCELLED]: [],
};

function canTransition(from, to) {
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}

function overlaps(a, b) {
  return a.start < b.end && b.start < a.end;
}

// Logika rezerwacji - repositories i zegar wstrzykiwane jako parametry
function createReservationsService({ reservationsRepository, runInTransaction, now = () => new Date() }) {
  function assertValidTimeRange(start, end) {
    if (end <= start) {
      throw new ValidationError('endTime must be later than startTime', undefined, 'INVALID_TIME_RANGE');
    }

    const duration = end - start;
    if (duration < MIN_DURATION_MS || duration > MAX_DURATION_MS) {
      throw new ValidationError('Reservation must last between 15 minutes and 8 hours', undefined, 'INVALID_DURATION');
    }

    if (start < now().getTime()) {
      throw new ValidationError('startTime cannot be in the past', undefined, 'START_TIME_IN_PAST');
    }
  }

  // Cudza rezerwacja dla USERa daje 404 - nie zdradzamy, że istnieje
  async function getReservation(id, currentUser) {
    const reservation = await reservationsRepository.findById(id);
    const isVisible = reservation && (currentUser.role === 'ADMIN' || reservation.userId === currentUser.id);
    if (!isVisible) throw new NotFoundError(`Reservation ${id} not found`, 'RESERVATION_NOT_FOUND');
    return reservation;
  }

  return {
    async listReservations(filters, currentUser) {
      if (currentUser.role === 'ADMIN') return reservationsRepository.findAll(filters);

      if (filters.userId !== undefined) {
        throw new ForbiddenError('Only ADMIN can filter reservations by userId');
      }
      return reservationsRepository.findAll({ ...filters, userId: currentUser.id });
    },

    getReservation,

    async createReservation({ roomId, participants, startTime, endTime }, currentUser) {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      assertValidTimeRange(start, end);

      return runInTransaction(async ({ roomsRepository, reservationsRepository }) => {
        // Blokada wiersza sali szereguje równoległe rezerwacje tej samej sali do końca transakcji
        const room = await roomsRepository.findByIdForUpdate(roomId);
        if (!room) throw new NotFoundError(`Room ${roomId} not found`, 'ROOM_NOT_FOUND');

        if (participants > room.capacity) {
          throw new ConflictError(
            `Room ${room.name} has capacity ${room.capacity}, requested ${participants}`,
            'ROOM_CAPACITY_EXCEEDED',
          );
        }

        const activeReservations = await reservationsRepository.findConfirmedByRoomId(roomId);
        const conflict = activeReservations.find((r) =>
          overlaps({ start, end }, { start: r.startTime.getTime(), end: r.endTime.getTime() }));
        if (conflict) {
          throw new ConflictError(
            `Room ${room.name} is already booked in this time range (reservation ${conflict.id})`,
            'ROOM_ALREADY_BOOKED',
          );
        }

        return reservationsRepository.create({
          roomId,
          userId: currentUser.id,
          participants,
          startTime: new Date(start),
          endTime: new Date(end),
          status: STATUS.CONFIRMED,
          createdAt: now(),
          cancelledAt: null,
          internalNote: 'created via API v2',
        });
      });
    },

    async cancelReservation(id, currentUser) {
      const reservation = await getReservation(id, currentUser);
      const target = STATUS.CANCELLED;

      if (reservation.status === target) return reservation;

      if (!canTransition(reservation.status, target)) {
        throw new ConflictError(
          `Cannot change status from ${reservation.status} to ${target}`,
          'INVALID_STATUS_TRANSITION',
        );
      }

      const currentTime = now();
      if (reservation.startTime.getTime() <= currentTime.getTime()) {
        throw new ConflictError('Reservation has already started and cannot be cancelled', 'RESERVATION_ALREADY_STARTED');
      }

      return reservationsRepository.update(id, { status: target, cancelledAt: currentTime });
    },
  };
}

module.exports = { createReservationsService };
