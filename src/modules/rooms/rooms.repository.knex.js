function toRoom(row) {
  return {
    id: row.id,
    buildingId: row.building_id,
    name: row.name,
    capacity: row.capacity,
    createdAt: row.created_at,
    building: { id: row.building_id, name: row.building_name },
  };
}

function createRoomsRepository(db) {
  function roomsWithBuilding() {
    return db('rooms')
      .join('buildings', 'buildings.id', 'rooms.building_id')
      .select('rooms.*', 'buildings.name as building_name')
      .orderBy('rooms.id');
  }

  async function findById(id) {
    const row = await roomsWithBuilding().where('rooms.id', id).first();
    return row ? toRoom(row) : null;
  }

  return {
    async findAll() {
      const rows = await roomsWithBuilding();
      return rows.map(toRoom);
    },

    findById,

    async findByBuildingId(buildingId) {
      const rows = await roomsWithBuilding().where('rooms.building_id', buildingId);
      return rows.map(toRoom);
    },

    async create({ buildingId, name, capacity }) {
      const [row] = await db('rooms').insert({ building_id: buildingId, name, capacity }).returning('id');
      return findById(row.id);
    },
  };
}

module.exports = { createRoomsRepository };
