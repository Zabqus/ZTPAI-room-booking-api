const { z } = require('zod');

const positiveIntFromString = z.coerce.number().int().positive();

// Data ISO 8601 wymagająca strefy czasowej (Z albo np. +01:00)
const isoDateTimeWithOffset = z.iso.datetime({ offset: true });

const reservationParamsSchema = z.object({
  id: positiveIntFromString,
});

const listReservationsQuerySchema = z.object({
  roomId: positiveIntFromString.optional(),
});

// strictObject odrzuca nieznane pola (np. status, id)
const createReservationBodySchema = z.strictObject({
  roomId: z.number().int().positive(),
  reservedBy: z.string().trim().min(3).max(100),
  participants: z.number().int().positive(),
  startTime: isoDateTimeWithOffset,
  endTime: isoDateTimeWithOffset,
});

module.exports = { reservationParamsSchema, listReservationsQuerySchema, createReservationBodySchema };
