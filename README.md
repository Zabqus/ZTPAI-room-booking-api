# Room Booking API

REST API do rezerwacji sal (Node.js, Express, PostgreSQL, Knex).

## Uruchomienie od zera (Docker Compose)

Wymagany Docker z Docker Compose.

```bash
git clone https://github.com/Zabqus/ZTPAI-room-booking-api.git
cd ZTPAI-room-booking-api
cp .env.example .env
docker compose up --build
```

Migracje uruchamiają się automatycznie przy starcie kontenera `api`.

- API: http://localhost:3000/api
- Swagger UI: http://localhost:3000/api/docs

Konto ADMIN i dane przykładowe (seed) - w drugim terminalu:

```bash
docker compose exec api npx knex seed:run
```

Login ADMIN: `admin@example.com`, hasło: wartość `SEED_ADMIN_PASSWORD` z `.env`.

Zatrzymanie:

```bash
docker compose down
```

## Testy

Testy uruchamia się lokalnie (Node.js 22+) przy działającej bazie z Docker Compose.
Testy integracyjne używają osobnej bazy `room_booking_test` (`TEST_DATABASE_URL` w `.env`):

```bash
npm ci
docker compose exec db createdb -U booking room_booking_test
npm run test:unit
npm run test:integration
npm test
```
