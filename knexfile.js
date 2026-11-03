const config = require('./src/config');

module.exports = {
  client: 'pg',
  connection: config.DATABASE_URL,
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};
