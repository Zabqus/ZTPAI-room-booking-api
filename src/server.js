require('dotenv').config();
const knex = require('knex');
const knexConfig = require('../knexfile');
const { createApp } = require('./app');
const memoryBuildings = require('./modules/buildings/buildings.repository.memory');
const memoryRooms = require('./modules/rooms/rooms.repository.memory');
const memoryReservations = require('./modules/reservations/reservations.repository.memory');
const knexBuildings = require('./modules/buildings/buildings.repository.knex');
const knexRooms = require('./modules/rooms/rooms.repository.knex');
const knexReservations = require('./modules/reservations/reservations.repository.knex');

const PORT = process.env.PORT || 3000;

function createKnexRepositories(db) {
  return {
    buildingsRepository: knexBuildings.createBuildingsRepository(db),
    roomsRepository: knexRooms.createRoomsRepository(db),
    reservationsRepository: knexReservations.createReservationsRepository(db),
  };
}

function createRepositories() {
  if (process.env.REPOSITORY === 'memory') {
    const buildingsRepository = memoryBuildings.createBuildingsRepository(() => roomsRepository.findAll());
    const roomsRepository = memoryRooms.createRoomsRepository(buildingsRepository);
    const reservationsRepository = memoryReservations.createReservationsRepository(roomsRepository);
    const repositories = { buildingsRepository, roomsRepository, reservationsRepository };
    return { ...repositories, runInTransaction: (callback) => callback(repositories) };
  }

  const db = knex(knexConfig);
  return {
    ...createKnexRepositories(db),
    runInTransaction: (callback) => db.transaction((trx) => callback(createKnexRepositories(trx))),
  };
}

const app = createApp(createRepositories());

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
