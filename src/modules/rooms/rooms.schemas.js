const { z } = require('zod');

const roomParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = { roomParamsSchema };
