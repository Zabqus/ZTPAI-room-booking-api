const bcrypt = require('bcryptjs');
const { ConflictError } = require('../../errors/errors');

const BCRYPT_COST = 12;

function createAuthService({ usersRepository }) {
  return {
    async register({ email, password }) {
      const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

      try {
        return await usersRepository.create({ email, passwordHash, role: 'USER' });
      } catch (err) {
        // 23505 - email zajęty; constraint UNIQUE obsługuje też równoległe rejestracje
        if (err.code === '23505') throw new ConflictError('Email is already taken', 'EMAIL_TAKEN');
        throw err;
      }
    },
  };
}

module.exports = { createAuthService };
