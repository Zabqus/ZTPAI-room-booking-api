const COLUMNS = {
  roomId: 'room_id',
  reservedBy: 'reserved_by',
  participants: 'participants',
  startTime: 'start_time',
  endTime: 'end_time',
  status: 'status',
  cancelledAt: 'cancelled_at',
  createdAt: 'created_at',
};

function toRow(data) {
  const row = {};
  for (const [field, column] of Object.entries(COLUMNS)) {
    if (data[field] !== undefined) row[column] = data[field];
  }
  return row;
}

function toReservation(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    reservedBy: row.reserved_by,
    participants: row.participants,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    room: {
      id: row.room_id,
      name: row.room_name,
      building: { id: row.building_id, name: row.building_name },
    },
  };
}

function createReservationsRepository(db) {
  function reservationsWithRoom() {
    return db('reservations')
      .join('rooms', 'rooms.id', 'reservations.room_id')
      .join('buildings', 'buildings.id', 'rooms.building_id')
      .select('reservations.*', 'rooms.name as room_name', 'rooms.building_id', 'buildings.name as building_name')
      .orderBy('reservations.id');
  }

  async function findById(id) {
    const row = await reservationsWithRoom().where('reservations.id', id).first();
    return row ? toReservation(row) : null;
  }

  return {
    async findAll({ roomId } = {}) {
      const query = reservationsWithRoom();
      if (roomId !== undefined) query.where('reservations.room_id', roomId);
      const rows = await query;
      return rows.map(toReservation);
    },

    findById,

    async findConfirmedByRoomId(roomId) {
      const rows = await reservationsWithRoom()
        .where('reservations.room_id', roomId)
        .where('reservations.status', 'CONFIRMED');
      return rows.map(toReservation);
    },

    async create(data) {
      const [row] = await db('reservations').insert(toRow(data)).returning('id');
      return findById(row.id);
    },

    async update(id, changes) {
      const [row] = await db('reservations').where({ id }).update(toRow(changes)).returning('id');
      return row ? findById(row.id) : null;
    },
  };
}

module.exports = { createReservationsRepository };
