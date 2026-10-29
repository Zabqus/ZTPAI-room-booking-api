// Repozytorium sal w pamięci - jedyne miejsce, gdzie istnieje tablica z salami
function createRoomsRepository(buildingsRepository) {
  const rooms = [
    { id: 1, buildingId: 1, name: 'A101', capacity: 30 },
    { id: 2, buildingId: 1, name: 'B202', capacity: 15 },
    { id: 3, buildingId: 2, name: 'C303', capacity: 50 },
    { id: 4, buildingId: 2, name: 'D404', capacity: 10 },
  ];
  let nextId = 5;

  async function withBuilding(room) {
    const building = await buildingsRepository.findById(room.buildingId);
    return { ...room, building: { id: building.id, name: building.name } };
  }

  return {
    async findAll() {
      return Promise.all(rooms.map(withBuilding));
    },

    async findById(id) {
      const room = rooms.find((r) => r.id === id);
      return room ? withBuilding(room) : null;
    },

    async findByBuildingId(buildingId) {
      return Promise.all(rooms.filter((r) => r.buildingId === buildingId).map(withBuilding));
    },

    async create({ buildingId, name, capacity }) {
      const room = { id: nextId++, buildingId, name, capacity, createdAt: new Date() };
      rooms.push(room);
      return withBuilding(room);
    },
  };
}

module.exports = { createRoomsRepository };
