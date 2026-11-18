const { toAuditEntryResponse } = require('./audit.mapper');

function createAuditController({ auditService }) {
  return {
    async list(req, res) {
      const { page, limit } = req.validated.query;
      const { entries, total } = await auditService.listAuditLog(req.validated.query);
      res.json({
        data: entries.map(toAuditEntryResponse),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    },
  };
}

module.exports = { createAuditController };
