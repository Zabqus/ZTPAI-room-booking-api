const { toUserResponse } = require('../users/users.mapper');

function createAuthController({ authService }) {
  return {
    async register(req, res) {
      const user = await authService.register(req.validated.body);
      res.status(201).json(toUserResponse(user));
    },
  };
}

module.exports = { createAuthController };
