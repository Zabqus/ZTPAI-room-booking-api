const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ConflictError, UnauthorizedError } = require('../../errors/errors');

const BCRYPT_COST = 12;

function createAuthService({ usersRepository, jwtSecret, jwtExpiresIn }) {
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

    async login({ email, password }) {
      const user = await usersRepository.findByEmail(email);
      const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));
      if (!passwordMatches) throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');

      const accessToken = jwt.sign({ role: user.role }, jwtSecret, {
        algorithm: 'HS256',
        subject: String(user.id),
        expiresIn: jwtExpiresIn,
      });

      return { accessToken, tokenType: 'Bearer', expiresIn: jwtExpiresIn };
    },

    async getCurrentUser(id) {
      const user = await usersRepository.findById(id);
      if (!user) throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
      return user;
    },
  };
}

module.exports = { createAuthService };
