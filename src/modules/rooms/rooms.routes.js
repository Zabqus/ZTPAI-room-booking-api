const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { roomParamsSchema } = require('./rooms.schemas');

function createRoomsRouter({ roomsController }) {
  const router = Router();

  router.get('/', roomsController.list);
  router.get('/:id', validate({ params: roomParamsSchema }), roomsController.getById);

  return router;
}

module.exports = { createRoomsRouter };
