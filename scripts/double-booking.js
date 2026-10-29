require('dotenv').config();
const knex = require('knex');
const knexConfig = require('../knexfile');

const API_URL = `http://localhost:${process.env.PORT || 3000}/api/reservations`;
const REQUESTS = 10;
const ROOM_ID = 1;
const START_TIME = '2026-12-15T10:00:00.000Z';
const END_TIME = '2026-12-15T12:00:00.000Z';

async function sendReservation() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomId: ROOM_ID,
      reservedBy: 'Jan Kowalski',
      participants: 5,
      startTime: START_TIME,
      endTime: END_TIME,
    }),
  });
  return response.status;
}

function reservationsInSlot(db) {
  return db('reservations')
    .where('room_id', ROOM_ID)
    .where('start_time', '<', END_TIME)
    .where('end_time', '>', START_TIME);
}

async function main() {
  const db = knex(knexConfig);
  await reservationsInSlot(db).del();

  const statuses = await Promise.all(Array.from({ length: REQUESTS }, () => sendReservation()));
  statuses.forEach((status, i) => console.log(`Request ${i + 1}: ${status}`));

  const created = statuses.filter((s) => s === 201).length;
  const conflicts = statuses.filter((s) => s === 409).length;
  const other = REQUESTS - created - conflicts;
  console.log(`\n201: ${created}, 409: ${conflicts}, inne: ${other}`);

  const [{ count }] = await reservationsInSlot(db).where('status', 'CONFIRMED').count('id as count');
  console.log(`Rezerwacje CONFIRMED w bazie (sala ${ROOM_ID}, ${START_TIME} - ${END_TIME}): ${count}`);

  await db.destroy();
}

main();
