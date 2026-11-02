const { z } = require('zod');

const registerBodySchema = z.strictObject({
  email: z.email().max(255).toLowerCase(),
  password: z.string().min(10).max(72),
});

const loginBodySchema = z.strictObject({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

module.exports = { registerBodySchema, loginBodySchema };
