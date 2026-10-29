function createReservationsRepository(roomsRepository) {
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

  async function withRoom(reservation) {
    const room = await roomsRepository.findById(reservation.roomId);
    return { ...reservation, room: { id: room.id, name: room.name, building: room.building } };
  }

  return {
    async findAll({ roomId } = {}) {
      const result = roomId === undefined ? reservations : reservations.filter((r) => r.roomId === roomId);
      return Promise.all(result.map(withRoom));
    },

    async findById(id) {
      const reservation = reservations.find((r) => r.id === id);
      return reservation ? withRoom(reservation) : null;
    },

    async findConfirmedByRoomId(roomId) {
      return reservations.filter((r) => r.roomId === roomId && r.status === 'CONFIRMED');
    },

    async create(data) {
      const reservation = { id: nextId++, ...data };
      reservations.push(reservation);
      return withRoom(reservation);
    },

    async update(id, changes) {
      const reservation = reservations.find((r) => r.id === id);
      if (!reservation) return null;
      Object.assign(reservation, changes);
      return withRoom(reservation);
    },
  };
}

module.exports = { createReservationsRepository };
