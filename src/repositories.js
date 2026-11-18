const { createBuildingsRepository } = require('./modules/buildings/buildings.repository.knex');
const { createRoomsRepository } = require('./modules/rooms/rooms.repository.knex');
const { createReservationsRepository } = require('./modules/reservations/reservations.repository.knex');
const { createUsersRepository } = require('./modules/users/users.repository.knex');
const { createAuditRepository } = require('./modules/audit/audit.repository.knex');

function createRepositories(db) {
  return {
    buildingsRepository: createBuildingsRepository(db),
    roomsRepository: createRoomsRepository(db),
    reservationsRepository: createReservationsRepository(db),
    usersRepository: createUsersRepository(db),
    auditRepository: createAuditRepository(db),
  };
}

module.exports = { createRepositories };
