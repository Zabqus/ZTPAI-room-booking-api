const { AppError, NotFoundError } = require('../errors/errors');

function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
}

function errorHandler(err, req, res, next) {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details, requestId },
    });
  }

  // Błąd parsowania JSON zgłaszany przez express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body contains invalid JSON', requestId },
    });
  }

  // 23505 - naruszenie UNIQUE w PostgreSQL; szczegóły bazy nie trafiają do klienta
  if (err.code === '23505') {
    return res.status(409).json({
      error: { code: 'ALREADY_EXISTS', message: 'Resource already exists', requestId },
    });
  }

  // 23P01 - naruszenie exclusion constraint (nakładające się rezerwacje CONFIRMED)
  if (err.code === '23P01') {
    return res.status(409).json({
      error: { code: 'ROOM_ALREADY_BOOKED', message: 'Room is already booked in this time range', requestId },
    });
  }

  // Nieoczekiwany błąd: stack trace tylko w logach, klient dostaje ogólny komunikat
  console.error(`[${requestId}] Unhandled error:`, err.stack);
  res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error', requestId },
  });
}

module.exports = { notFoundHandler, errorHandler };
