const request = require('supertest');
const bcrypt = require('bcryptjs');
const knex = require('knex');
const config = require('../../src/config');
const knexConfig = require('../../knexfile');
const { createApp } = require('../../src/app');
const { createRepositories } = require('../../src/repositories');

const NOW = new Date('2026-12-01T08:00:00Z');
const PASSWORD = 'integration-password';

const db = knex(knexConfig);

const app = createApp({
  ...createRepositories(db),
  runInTransaction: (callback) => db.transaction((trx) => callback(createRepositories(trx))),
  jwtSecret: config.JWT_SECRET,
  jwtExpiresIn: config.JWT_EXPIRES_IN,
  now: () => NOW,
});

let roomId;

async function createUser(email, role = 'USER') {
  const [user] = await db('users')
    .insert({ email, password_hash: await bcrypt.hash(PASSWORD, 4), role })
    .returning('id');
  return user.id;
}

async function login(email) {
  const res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
  return res.body.accessToken;
}

async function insertReservation(userId, startTime, endTime) {
  const [reservation] = await db('reservations')
    .insert({ room_id: roomId, user_id: userId, participants: 5, start_time: startTime, end_time: endTime })
    .returning('id');
  return reservation.id;
}

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db.raw('TRUNCATE TABLE reservations, rooms, buildings, users RESTART IDENTITY CASCADE');
  const [building] = await db('buildings').insert({ name: 'Budynek A', address: 'ul. Testowa 1' }).returning('id');
  const [room] = await db('rooms').insert({ building_id: building.id, name: '101', capacity: 10 }).returning('id');
  roomId = room.id;
});

afterAll(async () => {
  await db.destroy();
});

test('rejestracja, logowanie i GET /api/auth/me', async () => {
  const register = await request(app)
    .post('/api/auth/register')
    .send({ email: 'jan@example.com', password: 'bardzo-dlugie-haslo' });
  expect(register.status).toBe(201);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'jan@example.com', password: 'bardzo-dlugie-haslo' });
  expect(loginRes.status).toBe(200);

  const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${loginRes.body.accessToken}`);
  expect(me.status).toBe(200);
  expect(me.body).toMatchObject({ id: register.body.id, email: 'jan@example.com', role: 'USER' });
});

test('POST /api/reservations zwraca 201, Location i zapisuje rekord w bazie', async () => {
  const userId = await createUser('jan@example.com');
  const token = await login('jan@example.com');

  const res = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${token}`)
    .send({ roomId, participants: 5, startTime: '2026-12-01T10:00:00Z', endTime: '2026-12-01T11:00:00Z' });

  expect(res.status).toBe(201);
  expect(res.headers.location).toBe(`/api/reservations/${res.body.id}`);

  const row = await db('reservations').where({ id: res.body.id }).first();
  expect(row).toMatchObject({ room_id: roomId, user_id: userId, participants: 5, status: 'CONFIRMED' });
});

test('400 z details dla błędnego body', async () => {
  await createUser('jan@example.com');
  const token = await login('jan@example.com');

  const res = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${token}`)
    .send({ roomId: 'abc', participants: 5, startTime: '2026-12-01T10:00:00Z', reservedBy: 'Jan' });

  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
  expect(res.body.error.details.map((d) => d.field).sort()).toEqual(['endTime', 'reservedBy', 'roomId']);
});

test('401 bez tokenu', async () => {
  const res = await request(app).get('/api/reservations');

  expect(res.status).toBe(401);
  expect(res.body.error.code).toBe('INVALID_TOKEN');
});

test('403 dla USER tworzącego salę', async () => {
  await createUser('jan@example.com');
  const token = await login('jan@example.com');

  const res = await request(app)
    .post('/api/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({ buildingId: 1, name: '102', capacity: 20 });

  expect(res.status).toBe(403);
  expect(res.body.error.code).toBe('FORBIDDEN');
});

test('404 dla USER pobierającego cudzą rezerwację', async () => {
  const ownerId = await createUser('anna@example.com');
  const reservationId = await insertReservation(ownerId, '2026-12-01T10:00:00Z', '2026-12-01T11:00:00Z');
  await createUser('jan@example.com');
  const token = await login('jan@example.com');

  const res = await request(app).get(`/api/reservations/${reservationId}`).set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(404);
  expect(res.body.error.code).toBe('RESERVATION_NOT_FOUND');
});

test('409 ROOM_ALREADY_BOOKED dla nakładającej się rezerwacji', async () => {
  const ownerId = await createUser('anna@example.com');
  await insertReservation(ownerId, '2026-12-01T10:00:00Z', '2026-12-01T12:00:00Z');
  await createUser('jan@example.com');
  const token = await login('jan@example.com');

  const res = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${token}`)
    .send({ roomId, participants: 5, startTime: '2026-12-01T11:00:00Z', endTime: '2026-12-01T13:00:00Z' });

  expect(res.status).toBe(409);
  expect(res.body.error.code).toBe('ROOM_ALREADY_BOOKED');
});

test('pagination: meta.total i liczba elementów w data dla limit=2', async () => {
  const userId = await createUser('jan@example.com');
  await insertReservation(userId, '2026-12-01T10:00:00Z', '2026-12-01T11:00:00Z');
  await insertReservation(userId, '2026-12-01T12:00:00Z', '2026-12-01T13:00:00Z');
  await insertReservation(userId, '2026-12-01T14:00:00Z', '2026-12-01T15:00:00Z');
  const token = await login('jan@example.com');

  const res = await request(app).get('/api/reservations?limit=2').set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body.data).toHaveLength(2);
  expect(res.body.meta).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
});
