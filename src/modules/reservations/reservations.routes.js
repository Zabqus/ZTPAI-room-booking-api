const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const {
  reservationParamsSchema,
  listReservationsQuerySchema,
  createReservationBodySchema,
} = require('./reservations.schemas');

function createReservationsRouter({ reservationsController }) {
  const router = Router();

  router.get('/', validate({ query: listReservationsQuerySchema }), reservationsController.list);
  router.get('/:id', validate({ params: reservationParamsSchema }), reservationsController.getById);
  router.post('/', validate({ body: createReservationBodySchema }), reservationsController.create);
  router.patch('/:id/cancel', validate({ params: reservationParamsSchema }), reservationsController.cancel);

  return router;
}

module.exports = { createReservationsRouter };
