require('dotenv').config({ quiet: true });
const { z } = require('zod');

const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, 'Expected format like 15m, 10s, 1h').default('15m'),
  SEED_ADMIN_PASSWORD: z.string().min(10).max(72),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid configuration:');
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

module.exports = result.data;
