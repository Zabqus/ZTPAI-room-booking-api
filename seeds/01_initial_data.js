const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const config = require('../src/config');

const randomPasswordHash = () => bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

exports.seed = async function (knex) {
  await knex.raw('TRUNCATE TABLE reservations, rooms, buildings, users RESTART IDENTITY CASCADE');

  await knex('users').insert({
    email: 'admin@example.com',
    password_hash: await bcrypt.hash(config.SEED_ADMIN_PASSWORD, 12),
    role: 'ADMIN',
    created_at: '2026-10-01T08:00:00Z',
  });

  // Właściciele rezerwacji z poprzednich zadań - tak samo jak w migracji user_id
  for (let i = 1; i <= 5; i++) {
    await knex('users').insert({
      email: `legacy-${i}@example.com`,
      password_hash: await randomPasswordHash(),
      role: 'USER',
      created_at: '2026-10-01T08:00:00Z',
    });
  }

  await knex('buildings').insert([
    { name: 'Budynek A', address: 'ul. Warszawska 24, Kraków', created_at: '2026-10-01T08:00:00Z' },
    { name: 'Budynek B', address: 'ul. Podchorążych 2, Kraków', created_at: '2026-10-01T08:00:00Z' },
  ]);

  await knex('rooms').insert([
    { building_id: 1, name: '101', capacity: 30, created_at: '2026-10-02T08:00:00Z' },
    { building_id: 1, name: '102', capacity: 15, created_at: '2026-10-02T08:00:00Z' },
    { building_id: 1, name: '201', capacity: 50, created_at: '2026-10-02T08:00:00Z' },
    { building_id: 2, name: '101', capacity: 20, created_at: '2026-10-02T08:00:00Z' },
    { building_id: 2, name: '202', capacity: 10, created_at: '2026-10-02T08:00:00Z' },
  ]);

  await knex('reservations').insert([
    {
      room_id: 1,
      user_id: 3,
      participants: 20,
      start_time: '2026-11-10T10:00:00Z',
      end_time: '2026-11-10T12:00:00Z',
      status: 'CONFIRMED',
      created_at: '2026-10-20T08:00:00Z',
    },
    {
      room_id: 2,
      user_id: 2,
      participants: 10,
      start_time: '2026-11-12T09:00:00Z',
      end_time: '2026-11-12T11:00:00Z',
      status: 'CONFIRMED',
      created_at: '2026-10-21T08:00:00Z',
    },
    {
      room_id: 3,
      user_id: 5,
      participants: 40,
      start_time: '2026-11-15T13:00:00Z',
      end_time: '2026-11-15T15:00:00Z',
      status: 'CANCELLED',
      cancelled_at: '2026-10-25T10:00:00Z',
      created_at: '2026-10-22T08:00:00Z',
    },
    {
      room_id: 4,
      user_id: 4,
      participants: 15,
      start_time: '2026-10-27T09:00:00Z',
      end_time: '2026-10-27T11:00:00Z',
      status: 'CONFIRMED',
      created_at: '2026-10-23T08:00:00Z',
    },
    {
      room_id: 5,
      user_id: 6,
      participants: 8,
      start_time: '2026-11-20T14:00:00Z',
      end_time: '2026-11-20T16:00:00Z',
      status: 'CONFIRMED',
      created_at: '2026-10-24T08:00:00Z',
    },
  ]);
};
