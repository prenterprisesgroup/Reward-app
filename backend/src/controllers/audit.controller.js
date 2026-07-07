const AuditService = require("../services/audit.service");

// Helper to recursively remove sensitive fields
function sanitizeState(state) {
  if (!state || typeof state !== "object") return state;
  
  if (Array.isArray(state)) {
    return state.map(sanitizeState);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(state)) {
    if (
      key.toLowerCase().includes("password") ||
      key.toLowerCase().includes("token") ||
      key.toLowerCase().includes("secret")
    ) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeState(value);
    }
  }
  return sanitized;
}

async function getGlobalAuditLogs(req, res, next) {
  try {
    const result = await AuditService.getGlobalLogs(req.query);

    const totalPages = Math.ceil(result.totalItems / result.limit);

    // Sanitize the states to prevent leaking passwords/tokens
    const sanitizedData = result.data.map(log => ({
      id: log._id,
      action: log.action,
      company: log.companyId ? {
        id: log.companyId._id,
        name: log.companyId.name,
        displayId: log.companyId.displayId
      } : null,
      performedBy: log.performedBy ? {
        id: log.performedBy._id,
        name: log.performedBy.name,
        email: log.performedBy.email,
        role: log.performedBy.role
      } : null,
      workerId: log.workerId,
      beforeState: sanitizeState(log.beforeState),
      afterState: sanitizeState(log.afterState),
      createdAt: log.createdAt
    }));

    res.json({
      success: true,
      data: sanitizedData,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages,
        hasNextPage: result.page < totalPages,
        hasPreviousPage: result.page > 1
      },
      meta: {
        generatedAt: new Date(),
        filtersApplied: req.query
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getAuditTimeline(req, res, next) {
  try {
    const { entityType, entityId } = req.query;

    if (!entityType || !entityId) {
      return res.status(400).json({ success: false, message: "entityType and entityId are required" });
    }

    let filterQuery = { ...req.query };
    if (entityType === "COMPANY") filterQuery.company = entityId;
    else if (entityType === "USER" || entityType === "ADMIN") filterQuery.actor = entityId;

    const result = await AuditService.getGlobalLogs(filterQuery);

    const totalPages = Math.ceil(result.totalItems / result.limit);

    const sanitizedData = result.data.map(log => ({
      id: log._id,
      action: log.action,
      performedBy: log.performedBy ? {
        id: log.performedBy._id,
        name: log.performedBy.name
      } : null,
      beforeState: sanitizeState(log.beforeState),
      afterState: sanitizeState(log.afterState),
      createdAt: log.createdAt
    }));

    res.json({
      success: true,
      data: sanitizedData,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages,
        hasNextPage: result.page < totalPages,
        hasPreviousPage: result.page > 1
      },
      meta: {
        generatedAt: new Date(),
        timelineTarget: { entityType, entityId }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGlobalAuditLogs,
  getAuditTimeline
};
