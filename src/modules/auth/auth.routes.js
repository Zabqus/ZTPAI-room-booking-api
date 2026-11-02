const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { registerBodySchema } = require('./auth.schemas');

function createAuthRouter({ authController }) {
  const router = Router();

  router.post('/register', validate({ body: registerBodySchema }), authController.register);

  return router;
}

module.exports = { createAuthRouter };
