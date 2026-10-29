const { z } = require('zod');

const positiveIntFromString = z.coerce.number().int().positive();

const isoDateTimeWithOffset = z.iso.datetime({ offset: true });

const reservationParamsSchema = z.object({
  id: positiveIntFromString,
});

const listReservationsQuerySchema = z.object({
  roomId: positiveIntFromString.optional(),
});

const createReservationBodySchema = z.strictObject({
  roomId: z.number().int().positive(),
  reservedBy: z.string().trim().min(3).max(100),
  participants: z.number().int().positive(),
  startTime: isoDateTimeWithOffset,
  endTime: isoDateTimeWithOffset,
});

module.exports = { reservationParamsSchema, listReservationsQuerySchema, createReservationBodySchema };
