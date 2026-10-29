const { randomUUID } = require('node:crypto');

function requestLogger(req, res, next) {
  const requestId = req.get('X-Request-Id') || randomUUID();
  const startedAt = Date.now();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.log(`[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });

  next();
}

module.exports = { requestLogger };
