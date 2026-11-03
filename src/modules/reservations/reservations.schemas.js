const { z } = require('zod');

const positiveIntFromString = z.coerce.number().int().positive();

const isoDateTimeWithOffset = z.iso.datetime({ offset: true });

const reservationParamsSchema = z.object({
  id: positiveIntFromString,
});

const listReservationsQuerySchema = z
  .object({
    roomId: positiveIntFromString.optional(),
    buildingId: positiveIntFromString.optional(),
    userId: positiveIntFromString.optional(),
    status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
    from: isoDateTimeWithOffset.optional(),
    to: isoDateTimeWithOffset.optional(),
    page: positiveIntFromString.default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z
      .enum(['startTime', '-startTime', 'createdAt', '-createdAt', 'participants', '-participants'])
      .default('startTime'),
  })
  .refine((q) => !q.from || !q.to || new Date(q.from) < new Date(q.to), {
    message: 'from must be earlier than to',
    path: ['from'],
  });

const createReservationBodySchema = z.strictObject({
  roomId: z.number().int().positive(),
  participants: z.number().int().positive(),
  startTime: isoDateTimeWithOffset,
  endTime: isoDateTimeWithOffset,
});

module.exports = { reservationParamsSchema, listReservationsQuerySchema, createReservationBodySchema };
