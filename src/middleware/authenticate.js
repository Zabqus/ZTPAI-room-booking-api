const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors/errors');

function createAuthenticate({ jwtSecret }) {
  return (req, res, next) => {
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('Missing or invalid Authorization header', 'INVALID_TOKEN');
    }

    try {
      const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
      req.user = { id: Number(payload.sub), role: payload.role };
    } catch (err) {
      if (err.name === 'TokenExpiredError') throw new UnauthorizedError('Token expired', 'TOKEN_EXPIRED');
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }

    next();
  };
}

module.exports = { createAuthenticate };
