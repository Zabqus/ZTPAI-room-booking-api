const { AppError, NotFoundError } = require('../errors/errors');

// Nieistniejąca ścieżka -> 404 w formacie JSON
function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
}

// Jedyne miejsce, które zamienia błędy na odpowiedzi HTTP
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

  // Nieoczekiwany błąd: stack trace tylko w logach, klient dostaje ogólny komunikat
  console.error(`[${requestId}] Unhandled error:`, err.stack);
  res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error', requestId },
  });
}

module.exports = { notFoundHandler, errorHandler };
