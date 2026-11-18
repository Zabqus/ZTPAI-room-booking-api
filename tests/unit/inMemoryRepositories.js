function createInMemoryRepositories({ rooms = [], reservations = [] } = {}) {
  const roomsData = rooms.map((room) => ({ ...room }));
  const reservationsData = reservations.map((reservation) => ({ ...reservation }));
  let nextId = Math.max(0, ...reservationsData.map((r) => r.id)) + 1;

  const roomsRepository = {
    async findByIdForUpdate(id) {
      const room = roomsData.find((r) => r.id === id);
      return room ? { ...room } : null;
    },
  };

  const reservationsRepository = {
    async findById(id) {
      const reservation = reservationsData.find((r) => r.id === id);
      return reservation ? { ...reservation } : null;
    },

    async findConfirmedByRoomId(roomId) {
      return reservationsData
        .filter((r) => r.roomId === roomId && r.status === 'CONFIRMED')
        .map((r) => ({ ...r }));
    },

    async create(data) {
      const reservation = { id: nextId++, ...data };
      reservationsData.push(reservation);
      return { ...reservation };
    },

    async update(id, changes) {
      const reservation = reservationsData.find((r) => r.id === id);
      if (!reservation) return null;
      Object.assign(reservation, changes);
      return { ...reservation };
    },
  };

  const runInTransaction = (callback) => callback({ roomsRepository, reservationsRepository });

  return { roomsRepository, reservationsRepository, runInTransaction };
}

module.exports = { createInMemoryRepositories };
