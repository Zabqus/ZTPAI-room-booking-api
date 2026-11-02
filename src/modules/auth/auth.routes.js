const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { registerBodySchema, loginBodySchema } = require('./auth.schemas');

function createAuthRouter({ authController, authenticate }) {
  const router = Router();

  router.post('/register', validate({ body: registerBodySchema }), authController.register);
  router.post('/login', validate({ body: loginBodySchema }), authController.login);
  router.get('/me', authenticate, authController.me);

  return router;
}

module.exports = { createAuthRouter };
