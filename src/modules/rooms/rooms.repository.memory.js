// Repozytorium sal w pamięci - jedyne miejsce, gdzie istnieje tablica z salami
function createRoomsRepository() {
  const rooms = [
    { id: 1, buildingId: 1, name: 'A101', capacity: 30 },
    { id: 2, buildingId: 1, name: 'B202', capacity: 15 },
    { id: 3, buildingId: 2, name: 'C303', capacity: 50 },
    { id: 4, buildingId: 2, name: 'D404', capacity: 10 },
  ];
  let nextId = 5;

  return {
    async findAll() {
      return rooms;
    },

    async findById(id) {
      return rooms.find((r) => r.id === id) ?? null;
    },

    async create({ buildingId, name, capacity }) {
      const room = { id: nextId++, buildingId, name, capacity, createdAt: new Date() };
      rooms.push(room);
      return room;
    },
  };
}

module.exports = { createRoomsRepository };
