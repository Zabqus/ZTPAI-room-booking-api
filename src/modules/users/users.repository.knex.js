function toUser(row) {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

function createUsersRepository(db) {
  return {
    async findById(id) {
      const row = await db('users').where({ id }).first();
      return row ? toUser(row) : null;
    },

    async findByEmail(email) {
      const row = await db('users').where({ email }).first();
      return row ? toUser(row) : null;
    },

    async create({ email, passwordHash, role }) {
      const [row] = await db('users').insert({ email, password_hash: passwordHash, role }).returning('*');
      return toUser(row);
    },
  };
}

module.exports = { createUsersRepository };
