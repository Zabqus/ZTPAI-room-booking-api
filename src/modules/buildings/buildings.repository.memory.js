function createBuildingsRepository(getRooms) {
  const buildings = [
    { id: 1, name: 'Budynek A', address: 'ul. Warszawska 24, Kraków', createdAt: new Date('2026-10-01T08:00:00.000Z') },
    { id: 2, name: 'Budynek B', address: 'ul. Podchorążych 2, Kraków', createdAt: new Date('2026-10-01T08:00:00.000Z') },
  ];
  let nextId = 3;

  return {
    async findAll() {
      const rooms = await getRooms();
      return buildings.map((b) => ({ ...b, roomsCount: rooms.filter((r) => r.buildingId === b.id).length }));
    },

    async findById(id) {
      return buildings.find((b) => b.id === id) ?? null;
    },

    async create({ name, address }) {
      const building = { id: nextId++, name, address, createdAt: new Date() };
      buildings.push(building);
      return building;
    },
  };
}

module.exports = { createBuildingsRepository };
