const { z } = require('zod');

const listAuditLogQuerySchema = z.object({
  eventType: z.enum(['reservation.created', 'reservation.cancelled']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { listAuditLogQuerySchema };
