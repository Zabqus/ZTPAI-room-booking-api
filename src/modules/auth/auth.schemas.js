const { z } = require('zod');

const registerBodySchema = z.strictObject({
  email: z.email().max(255).toLowerCase(),
  password: z.string().min(10).max(72),
});

module.exports = { registerBodySchema };
