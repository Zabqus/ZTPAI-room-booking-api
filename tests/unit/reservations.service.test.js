const { createReservationsService } = require('../../src/modules/reservations/reservations.service');
const { createInMemoryRepositories } = require('./inMemoryRepositories');

const NOW = new Date('2026-12-01T08:00:00Z');
const USER = { id: 1, role: 'USER' };
const OTHER_USER = { id: 2, role: 'USER' };
const ADMIN = { id: 3, role: 'ADMIN' };
const ROOM = { id: 1, name: '101', capacity: 10 };
const OTHER_ROOM = { id: 2, name: '102', capacity: 10 };

const at = (time) => `2026-12-01T${time}:00Z`;

function existingReservation(overrides = {}) {
  return {
    id: 1,
    roomId: ROOM.id,
    userId: USER.id,
    participants: 5,
    startTime: new Date(at('10:00')),
    endTime: new Date(at('12:00')),
    status: 'CONFIRMED',
    cancelledAt: null,
    ...overrides,
  };
}

function setup(reservations = [], now = () => NOW) {
  const repositories = createInMemoryRepositories({ rooms: [ROOM, OTHER_ROOM], reservations });
  return createReservationsService({ ...repositories, now });
}

function newReservation(startTime, endTime, overrides = {}) {
  return { roomId: ROOM.id, participants: 5, startTime: at(startTime), endTime: at(endTime), ...overrides };
}

describe('createReservation - nakładanie się', () => {
  test('odrzuca rezerwację nakładającą się częściowo', async () => {
    const service = setup([existingReservation()]);

    await expect(service.createReservation(newReservation('11:00', '13:00'), USER))
      .rejects.toMatchObject({ code: 'ROOM_ALREADY_BOOKED' });
  });

  test('odrzuca rezerwację zawartą w istniejącej', async () => {
    const service = setup([existingReservation()]);

    await expect(service.createReservation(newReservation('10:30', '11:30'), USER))
      .rejects.toMatchObject({ code: 'ROOM_ALREADY_BOOKED' });
  });

  test('pozwala na rezerwację stykającą się z istniejącą', async () => {
    const service = setup([existingReservation()]);

    const reservation = await service.createReservation(newReservation('12:00', '13:00'), USER);

    expect(reservation.status).toBe('CONFIRMED');
  });

  test('pozwala na rezerwację innej sali w tym samym czasie', async () => {
    const service = setup([existingReservation()]);

    const reservation = await service.createReservation(
      newReservation('10:00', '12:00', { roomId: OTHER_ROOM.id }),
      USER,
    );

    expect(reservation.roomId).toBe(OTHER_ROOM.id);
  });

  test('anulowana rezerwacja nie blokuje przedziału', async () => {
    const service = setup([existingReservation({ status: 'CANCELLED', cancelledAt: NOW })]);

    const reservation = await service.createReservation(newReservation('10:00', '12:00'), USER);

    expect(reservation.status).toBe('CONFIRMED');
  });
});

describe('createReservation - pojemność', () => {
  test('pozwala, gdy participants == capacity', async () => {
    const service = setup();

    const reservation = await service.createReservation(
      newReservation('10:00', '11:00', { participants: ROOM.capacity }),
      USER,
    );

    expect(reservation.participants).toBe(ROOM.capacity);
  });

  test('odrzuca, gdy participants == capacity + 1', async () => {
    const service = setup();

    await expect(
      service.createReservation(newReservation('10:00', '11:00', { participants: ROOM.capacity + 1 }), USER),
    ).rejects.toMatchObject({ code: 'ROOM_CAPACITY_EXCEEDED' });
  });
});

describe('createReservation - czas trwania', () => {
  test.each([
    ['dokładnie 15 min', '10:15'],
    ['dokładnie 8 h', '18:00'],
  ])('pozwala: %s', async (_, endTime) => {
    const service = setup();

    const reservation = await service.createReservation(newReservation('10:00', endTime), USER);

    expect(reservation.status).toBe('CONFIRMED');
  });

  test.each([
    ['14 min', '10:14'],
    ['8 h 1 min', '18:01'],
  ])('odrzuca: %s', async (_, endTime) => {
    const service = setup();

    await expect(service.createReservation(newReservation('10:00', endTime), USER))
      .rejects.toMatchObject({ code: 'INVALID_DURATION' });
  });
});

describe('cancelReservation', () => {
  test('odrzuca anulowanie rozpoczętej rezerwacji', async () => {
    const service = setup([existingReservation({ startTime: new Date(at('07:30')), endTime: new Date(at('09:00')) })]);

    await expect(service.cancelReservation(1, USER))
      .rejects.toMatchObject({ code: 'RESERVATION_ALREADY_STARTED' });
  });

  test('podwójne anulowanie jest idempotentne (cancelledAt bez zmian)', async () => {
    let currentTime = NOW;
    const service = setup([existingReservation()], () => currentTime);

    const first = await service.cancelReservation(1, USER);
    currentTime = new Date(at('09:00'));
    const second = await service.cancelReservation(1, USER);

    expect(first.status).toBe('CANCELLED');
    expect(second.status).toBe('CANCELLED');
    expect(second.cancelledAt).toEqual(NOW);
  });
});

describe('cancelReservation - ownership', () => {
  test('obcy USER nie może anulować rezerwacji', async () => {
    const service = setup([existingReservation()]);

    await expect(service.cancelReservation(1, OTHER_USER))
      .rejects.toMatchObject({ code: 'RESERVATION_NOT_FOUND' });
  });

  test('ADMIN może anulować cudzą rezerwację', async () => {
    const service = setup([existingReservation()]);

    const reservation = await service.cancelReservation(1, ADMIN);

    expect(reservation.status).toBe('CANCELLED');
    expect(reservation.cancelledAt).toEqual(NOW);
  });
});
