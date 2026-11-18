const config = require('./config');
const knex = require('knex');
const knexConfig = require('../knexfile');
const { createApp } = require('./app');
const { createRepositories } = require('./repositories');
const { createEventBus } = require('./events/eventBus');
const { registerListeners } = require('./events/listeners');

const db = knex(knexConfig);
const repositories = createRepositories(db);
const eventBus = createEventBus();
registerListeners({ eventBus, ...repositories });

const app = createApp({
  ...repositories,
  runInTransaction: (callback) => db.transaction((trx) => callback(createRepositories(trx))),
  eventBus,
  jwtSecret: config.JWT_SECRET,
  jwtExpiresIn: config.JWT_EXPIRES_IN,
});

const server = app.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    console.log('HTTP server closed');
    await db.destroy();
    console.log('Database pool closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
