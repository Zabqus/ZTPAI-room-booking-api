const { z } = require('zod');

const buildingParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createBuildingBodySchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1).max(200),
});

module.exports = { buildingParamsSchema, createBuildingBodySchema };
