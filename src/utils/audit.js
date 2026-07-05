const AuditLog = require("../models/audit-log.model");

async function logAudit(req, action, workerId, companyId, beforeState, afterState, session = null) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const performedBy = req.user ? req.user._id : null;

  const logEntry = new AuditLog({
    workerId,
    companyId,
    action,
    ip,
    userAgent,
    beforeState,
    afterState,
    performedBy,
  });

  if (session) {
    await logEntry.save({ session });
  } else {
    await logEntry.save();
  }
}

module.exports = { logAudit };
