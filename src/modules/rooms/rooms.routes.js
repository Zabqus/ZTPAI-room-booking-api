const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { roomParamsSchema, createRoomBodySchema } = require('./rooms.schemas');

function createRoomsRouter({ roomsController }) {
  const router = Router();

  router.get('/', roomsController.list);
  router.get('/:id', validate({ params: roomParamsSchema }), roomsController.getById);
  router.post('/', validate({ body: createRoomBodySchema }), roomsController.create);

  return router;
}

module.exports = { createRoomsRouter };
