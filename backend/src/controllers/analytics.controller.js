const AnalyticsService = require("../services/analytics.service");
const CacheService = require("../services/cache.service");
const AnalyticsPeriodUtil = require("../utils/analytics-period.util");

const VALID_PERIODS = ["today", "7d", "30d", "1y"];

async function getOverview(req, res, next) {
  try {
    const period = req.query.period || "30d";

    if (!VALID_PERIODS.includes(period)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_PERIOD",
        message: `Period must be one of: ${VALID_PERIODS.join(", ")}`
      });
    }

    const cacheKey = `analytics:overview:${period}`;
    const ttlSeconds = 15;

    // Use single-flight cache abstraction
    const { data: result, cached, cacheAge } = await CacheService.getOrSet(cacheKey, ttlSeconds, async () => {
      return await AnalyticsService.getOverview(period);
    });

    const dates = AnalyticsPeriodUtil.getPeriodDates(period);

    res.json({
      success: true,
      schemaVersion: 1,
      data: result.data,
      modules: result.modules,
      warnings: result.warnings,
      capabilities: {
        platformGrowth: false,
        qrRedeemed: true,
        healthSummary: true,
        pendingWithdrawals: true
      },
      meta: {
        period,
        comparisonPeriod: dates.comparisonLabel,
        generatedAt: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cached,
        cacheAge
      }
    });
  } catch (error) {
    next(error);
  }
}

// Keeping existing endpoints for backward compatibility
async function getTrends(req, res, next) {
  try {
    const period = req.query.period || "30d";
    const trends = await AnalyticsService.getTrends(period);

    res.json({
      success: true,
      data: trends,
      meta: {
        generatedAt: new Date(),
        period
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getGrowth(req, res, next) {
  try {
    const period = req.query.period || "30d";
    const growth = await AnalyticsService.getGrowth(period);

    res.json({
      success: true,
      data: growth,
      meta: {
        generatedAt: new Date(),
        period
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getTopCompanies(req, res, next) {
  try {
    const period = req.query.period || "30d";
    const { limit = 10, sortBy = 'rewards' } = req.query;
    const topCompanies = await AnalyticsService.getTopCompanies(period, limit, sortBy);

    res.json({
      success: true,
      data: topCompanies,
      meta: {
        generatedAt: new Date(),
        limit,
        sortBy,
        period
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  getTrends,
  getGrowth,
  getTopCompanies
};
