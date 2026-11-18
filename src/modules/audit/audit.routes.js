const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { authorize } = require('../../middleware/authorize');
const { listAuditLogQuerySchema } = require('./audit.schemas');

function createAuditRouter({ auditController }) {
  const router = Router();

  router.get('/audit-log', authorize('ADMIN'), validate({ query: listAuditLogQuerySchema }), auditController.list);

  return router;
}

module.exports = { createAuditRouter };
