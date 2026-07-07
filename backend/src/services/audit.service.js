const AuditLog = require("../models/audit-log.model");
const mongoose = require("mongoose");
const { escapeRegex } = require("../utils/validation");

class AuditService {
  /**
   * Helper to build filter based on query parameters
   */
  static buildFilter(query) {
    const { action, actor, company, entity, search, dateFrom, dateTo } = query;
    const filter = {};

    if (action) filter.action = action;
    
    if (actor && mongoose.Types.ObjectId.isValid(actor)) {
      filter.performedBy = new mongoose.Types.ObjectId(actor);
    }
    
    if (company && mongoose.Types.ObjectId.isValid(company)) {
      filter.companyId = new mongoose.Types.ObjectId(company);
    }
    
    if (entity && mongoose.Types.ObjectId.isValid(entity)) {
      filter.workerId = new mongoose.Types.ObjectId(entity);
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { action: regex },
        { "afterState.details": regex },
        { "afterState.message": regex }
      ];
    }

    return filter;
  }

  static async getGlobalLogs(query) {
    const { page = 1, limit = 10, sort = "-createdAt" } = query;
    
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;
    
    let sortOption = { createdAt: -1 };
    if (sort === "createdAt") sortOption = { createdAt: 1 };
    if (sort === "-createdAt") sortOption = { createdAt: -1 };

    const filter = this.buildFilter(query);

    const [logs, totalItems] = await Promise.all([
      AuditLog.find(filter)
        .sort(sortOption)
        .skip(skipNum)
        .limit(limitNum)
        .populate("performedBy", "name email role")
        .populate("companyId", "name displayId")
        .select("-ip -userAgent") // exclude network metadata from response
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    return {
      data: logs,
      totalItems,
      page: pageNum,
      limit: limitNum
    };
  }
}

module.exports = AuditService;
