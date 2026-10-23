// Repozytorium rezerwacji w pamięci - jedyne miejsce, gdzie istnieje tablica z rezerwacjami
function createReservationsRepository() {
  // Seed: rezerwacja, która była poprawna przy tworzeniu, ale już się rozpoczęła
  const reservations = [
    {
      id: 1,
      roomId: 2,
      reservedBy: 'Anna Nowak',
      participants: 8,
      startTime: new Date('2026-01-15T09:00:00.000Z'),
      endTime: new Date('2026-01-15T11:00:00.000Z'),
      status: 'CONFIRMED',
      createdAt: new Date('2026-01-10T12:00:00.000Z'),
      cancelledAt: null,
      internalNote: 'seed data',
    },
  ];
  let nextId = 2;

  return {
    async findAll({ roomId } = {}) {
      if (roomId === undefined) return reservations;
      return reservations.filter((r) => r.roomId === roomId);
    },

    async findById(id) {
      return reservations.find((r) => r.id === id) ?? null;
    },

    async findConfirmedByRoomId(roomId) {
      return reservations.filter((r) => r.roomId === roomId && r.status === 'CONFIRMED');
    },

    async create(data) {
      const reservation = { id: nextId++, ...data };
      reservations.push(reservation);
      return reservation;
    },

    async update(id, changes) {
      const reservation = reservations.find((r) => r.id === id);
      if (!reservation) return null;
      Object.assign(reservation, changes);
      return reservation;
    },
  };
}

module.exports = { createReservationsRepository };
