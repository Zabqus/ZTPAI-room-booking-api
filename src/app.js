const express = require('express');
const { requestLogger } = require('./middleware/requestLogger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { createRoomsService } = require('./modules/rooms/rooms.service');
const { createRoomsController } = require('./modules/rooms/rooms.controller');
const { createRoomsRouter } = require('./modules/rooms/rooms.routes');
const { createReservationsService } = require('./modules/reservations/reservations.service');
const { createReservationsController } = require('./modules/reservations/reservations.controller');
const { createReservationsRouter } = require('./modules/reservations/reservations.routes');

// Buduje aplikację z wstrzykniętych zależności, ale jej nie uruchamia
function createApp({ roomsRepository, reservationsRepository, now = () => new Date() }) {
  const roomsService = createRoomsService({ roomsRepository });
  const reservationsService = createReservationsService({ reservationsRepository, roomsRepository, now });

  const app = express();

  app.use(requestLogger);
  app.use(express.json());

  app.use('/api/rooms', createRoomsRouter({ roomsController: createRoomsController({ roomsService }) }));
  app.use(
    '/api/reservations',
    createReservationsRouter({ reservationsController: createReservationsController({ reservationsService }) }),
  );

  // Tymczasowy endpoint do pokazania obsługi błędu 500
  app.get('/api/debug/crash', () => {
    throw new Error('boom');
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
