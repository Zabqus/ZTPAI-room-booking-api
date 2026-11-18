function toAuditEntry(row) {
  return {
    id: row.id,
    eventType: row.event_type,
    payload: row.payload,
    createdAt: row.created_at,
  };
}

function createAuditRepository(db) {
  return {
    async create({ eventType, payload }) {
      const [row] = await db('audit_log').insert({ event_type: eventType, payload }).returning('*');
      return toAuditEntry(row);
    },

    async findAll({ eventType, page, limit }) {
      const query = db('audit_log');
      if (eventType !== undefined) query.where('event_type', eventType);

      const [{ count }] = await query.clone().count('id as count');

      const rows = await query
        .select('*')
        .orderBy('created_at', 'desc')
        .orderBy('id', 'desc')
        .limit(limit)
        .offset((page - 1) * limit);

      return { entries: rows.map(toAuditEntry), total: Number(count) };
    },
  };
}

module.exports = { createAuditRepository };
