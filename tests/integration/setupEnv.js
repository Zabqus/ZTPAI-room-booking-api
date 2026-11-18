require('dotenv').config({ quiet: true });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl || !new URL(testDatabaseUrl).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must point to a database whose name ends with _test');
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET = 'integration-tests-jwt-secret-min-32-chars';
process.env.JWT_EXPIRES_IN = '15m';
process.env.SEED_ADMIN_PASSWORD = 'integration-tests-admin';
