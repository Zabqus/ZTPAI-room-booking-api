const express = require('express');
const { requestLogger } = require('./middleware/requestLogger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { createAuthenticate } = require('./middleware/authenticate');
const { createBuildingsService } = require('./modules/buildings/buildings.service');
const { createBuildingsController } = require('./modules/buildings/buildings.controller');
const { createBuildingsRouter } = require('./modules/buildings/buildings.routes');
const { createRoomsService } = require('./modules/rooms/rooms.service');
const { createRoomsController } = require('./modules/rooms/rooms.controller');
const { createRoomsRouter } = require('./modules/rooms/rooms.routes');
const { createReservationsService } = require('./modules/reservations/reservations.service');
const { createReservationsController } = require('./modules/reservations/reservations.controller');
const { createReservationsRouter } = require('./modules/reservations/reservations.routes');
const { createAuthService } = require('./modules/auth/auth.service');
const { createAuthController } = require('./modules/auth/auth.controller');
const { createAuthRouter } = require('./modules/auth/auth.routes');


function createApp({
  buildingsRepository,
  roomsRepository,
  reservationsRepository,
  usersRepository,
  runInTransaction,
  jwtSecret,
  jwtExpiresIn,
  now = () => new Date(),
}) {
  const authService = createAuthService({ usersRepository, jwtSecret, jwtExpiresIn });
  const authenticate = createAuthenticate({ jwtSecret });
  const buildingsService = createBuildingsService({ buildingsRepository, roomsRepository });
  const roomsService = createRoomsService({ roomsRepository, buildingsRepository });
  const reservationsService = createReservationsService({ reservationsRepository, runInTransaction, now });

  const app = express();

  app.use(requestLogger);
  app.use(express.json());

  app.use('/api/auth', createAuthRouter({ authController: createAuthController({ authService }), authenticate }));
  app.use(
    '/api/buildings',
    createBuildingsRouter({ buildingsController: createBuildingsController({ buildingsService }) }),
  );
  app.use('/api/rooms', createRoomsRouter({ roomsController: createRoomsController({ roomsService }) }));
  app.use(
    '/api/reservations',
    createReservationsRouter({ reservationsController: createReservationsController({ reservationsService }) }),
  );


  app.get('/api/debug/crash', () => {
    throw new Error('boom');
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
