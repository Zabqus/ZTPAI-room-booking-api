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
  };
}

function createReservationsRepository(db) {
  return {
    async findAll({ roomId } = {}) {
      const query = db('reservations').select('*').orderBy('id');
      if (roomId !== undefined) query.where({ room_id: roomId });
      const rows = await query;
      return rows.map(toReservation);
    },

    async findById(id) {
      const row = await db('reservations').where({ id }).first();
      return row ? toReservation(row) : null;
    },

    async findConfirmedByRoomId(roomId) {
      const rows = await db('reservations').where({ room_id: roomId, status: 'CONFIRMED' });
      return rows.map(toReservation);
    },

    async create(data) {
      const [row] = await db('reservations').insert(toRow(data)).returning('*');
      return toReservation(row);
    },

    async update(id, changes) {
      const [row] = await db('reservations').where({ id }).update(toRow(changes)).returning('*');
      return row ? toReservation(row) : null;
    },
  };
}

module.exports = { createReservationsRepository };
