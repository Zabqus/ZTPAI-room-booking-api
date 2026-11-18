function createAuditService({ auditRepository }) {
  return {
    async listAuditLog(filters) {
      return auditRepository.findAll(filters);
    },
  };
}

module.exports = { createAuditService };
