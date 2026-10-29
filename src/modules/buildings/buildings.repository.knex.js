function toBuilding(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    createdAt: row.created_at,
  };
}

function createBuildingsRepository(db) {
  return {
    async findAll() {
      const rows = await db('buildings')
        .leftJoin('rooms', 'rooms.building_id', 'buildings.id')
        .select('buildings.*')
        .count('rooms.id as rooms_count')
        .groupBy('buildings.id')
        .orderBy('buildings.id');
      return rows.map((row) => ({ ...toBuilding(row), roomsCount: Number(row.rooms_count) }));
    },

    async findById(id) {
      const row = await db('buildings').where({ id }).first();
      return row ? toBuilding(row) : null;
    },

    async create({ name, address }) {
      const [row] = await db('buildings').insert({ name, address }).returning('*');
      return toBuilding(row);
    },
  };
}

module.exports = { createBuildingsRepository };
