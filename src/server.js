const config = require('./config');
const knex = require('knex');
const knexConfig = require('../knexfile');
const { createApp } = require('./app');
const { createRepositories } = require('./repositories');

const db = knex(knexConfig);

const app = createApp({
  ...createRepositories(db),
  runInTransaction: (callback) => db.transaction((trx) => callback(createRepositories(trx))),
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
