const COLUMNS = {
  roomId: 'room_id',
  userId: 'user_id',
  participants: 'participants',
  startTime: 'start_time',
  endTime: 'end_time',
  status: 'status',
  cancelledAt: 'cancelled_at',
  createdAt: 'created_at',
};

const SORT_COLUMNS = {
  startTime: 'reservations.start_time',
  createdAt: 'reservations.created_at',
  participants: 'reservations.participants',
};

const SELECT_COLUMNS = [
  'reservations.*',
  'rooms.name as room_name',
  'rooms.building_id',
  'buildings.name as building_name',
  'users.email as user_email',
];

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
    userId: row.user_id,
    user: { id: row.user_id, email: row.user_email },
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
      .join('users', 'users.id', 'reservations.user_id');
  }

  async function findById(id) {
    const row = await reservationsWithRoom().select(SELECT_COLUMNS).where('reservations.id', id).first();
    return row ? toReservation(row) : null;
  }

  return {
    async findAll({ roomId, buildingId, userId, status, from, to, page, limit, sort }) {
      const query = reservationsWithRoom();
      if (roomId !== undefined) query.where('reservations.room_id', roomId);
      if (buildingId !== undefined) query.where('rooms.building_id', buildingId);
      if (userId !== undefined) query.where('reservations.user_id', userId);
      if (status !== undefined) query.where('reservations.status', status);
      if (from !== undefined) query.where('reservations.end_time', '>', from);
      if (to !== undefined) query.where('reservations.start_time', '<', to);

      const [{ count }] = await query.clone().count('reservations.id as count');

      const direction = sort.startsWith('-') ? 'desc' : 'asc';
      const rows = await query
        .select(SELECT_COLUMNS)
        .orderBy(SORT_COLUMNS[sort.replace('-', '')], direction)
        .orderBy('reservations.id', 'asc')
        .limit(limit)
        .offset((page - 1) * limit);

      return { reservations: rows.map(toReservation), total: Number(count) };
    },

    findById,

    async findConfirmedByRoomId(roomId) {
      const rows = await reservationsWithRoom()
        .select(SELECT_COLUMNS)
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
