require('dotenv').config();
const knex = require('knex');
const knexConfig = require('../knexfile');
const { createApp } = require('./app');
const { createBuildingsRepository } = require('./modules/buildings/buildings.repository.knex');
const { createRoomsRepository } = require('./modules/rooms/rooms.repository.knex');
const { createReservationsRepository } = require('./modules/reservations/reservations.repository.knex');
const { createUsersRepository } = require('./modules/users/users.repository.knex');

const PORT = process.env.PORT || 3000;

function createRepositories(db) {
  return {
    buildingsRepository: createBuildingsRepository(db),
    roomsRepository: createRoomsRepository(db),
    reservationsRepository: createReservationsRepository(db),
    usersRepository: createUsersRepository(db),
  };
}

const db = knex(knexConfig);

const app = createApp({
  ...createRepositories(db),
  runInTransaction: (callback) => db.transaction((trx) => callback(createRepositories(trx))),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
