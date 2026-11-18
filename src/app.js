const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { openapiSpec } = require('./docs/openapi');
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
const { createAuditService } = require('./modules/audit/audit.service');
const { createAuditController } = require('./modules/audit/audit.controller');
const { createAuditRouter } = require('./modules/audit/audit.routes');


function createApp({
  buildingsRepository,
  roomsRepository,
  reservationsRepository,
  usersRepository,
  auditRepository,
  runInTransaction,
  eventBus,
  jwtSecret,
  jwtExpiresIn,
  now = () => new Date(),
}) {
  const authService = createAuthService({ usersRepository, jwtSecret, jwtExpiresIn });
  const authenticate = createAuthenticate({ jwtSecret });
  const buildingsService = createBuildingsService({ buildingsRepository, roomsRepository });
  const roomsService = createRoomsService({ roomsRepository, buildingsRepository });
  const reservationsService = createReservationsService({ reservationsRepository, runInTransaction, eventBus, now });
  const auditService = createAuditService({ auditRepository });

  const app = express();

  app.use(requestLogger);
  app.use(express.json());

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.use('/api/auth', createAuthRouter({ authController: createAuthController({ authService }), authenticate }));
  app.use(
    '/api/buildings',
    authenticate,
    createBuildingsRouter({ buildingsController: createBuildingsController({ buildingsService }) }),
  );
  app.use('/api/rooms', authenticate, createRoomsRouter({ roomsController: createRoomsController({ roomsService }) }));
  app.use(
    '/api/reservations',
    authenticate,
    createReservationsRouter({ reservationsController: createReservationsController({ reservationsService }) }),
  );

  app.use('/api/admin', authenticate, createAuditRouter({ auditController: createAuditController({ auditService }) }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
