const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { buildingParamsSchema, createBuildingBodySchema } = require('./buildings.schemas');

function createBuildingsRouter({ buildingsController }) {
  const router = Router();

  router.get('/', buildingsController.list);
  router.get('/:id', validate({ params: buildingParamsSchema }), buildingsController.getById);
  router.get('/:id/rooms', validate({ params: buildingParamsSchema }), buildingsController.listRooms);
  router.post('/', validate({ body: createBuildingBodySchema }), buildingsController.create);

  return router;
}

module.exports = { createBuildingsRouter };
