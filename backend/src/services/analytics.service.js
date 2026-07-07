const mongoose = require("mongoose");
const Company = require("../models/company.model");
const User = require("../models/user.model");
const WalletTransaction = require("../models/wallet-transaction.model");
const WithdrawalRequest = require("../models/withdrawal-request.model");
const BarcodeBatch = require("../models/barcode-batch.model");
const Barcode = require("../models/barcode.model");
const AnalyticsPeriodUtil = require("../utils/analytics-period.util");
const HealthService = require("./health.service");

class AnalyticsService {
  
  static _calcGrowthObject(result) {
    const current = result[0]?.currentPeriod[0]?.total || 0;
    const previous = result[0]?.previousPeriod[0]?.total || 0;
    const change = current - previous;
    const percentage = previous === 0 ? (current > 0 ? 100 : 0) : ((change / previous) * 100).toFixed(2);
    return {
      current,
      previous,
      change,
      percentage: parseFloat(percentage),
      trend: change >= 0 ? "UP" : "DOWN"
    };
  }

  static async _calculateGrowth(model, dateField, dates, matchExtra = {}, sumField = null) {
    const { currentStart, currentEnd, previousStart, previousEnd } = dates;
    
    const currentCount = sumField ? { $sum: sumField } : { $sum: 1 };
    const result = await model.aggregate([
      {
        $facet: {
          currentPeriod: [
            { $match: { [dateField]: { $gte: currentStart, $lte: currentEnd }, ...matchExtra } },
            { $group: { _id: null, total: currentCount } }
          ],
          previousPeriod: [
            { $match: { [dateField]: { $gte: previousStart, $lte: previousEnd }, ...matchExtra } },
            { $group: { _id: null, total: currentCount } }
          ]
        }
      }
    ]);

    return this._calcGrowthObject(result);
  }

  static async getStats(period) {
    // This is essentially just current snapshot data for the dashboard grids,
    // which aligns with the "current" values from getGrowth.
    // For efficiency we'll just extract current from getGrowth or run dedicated lightweight queries if needed.
    // But since getGrowth provides everything, we'll map it in the controller.
    const growth = await this.getGrowth(period);
    return {
      totalCompanies: growth.companies.current,
      totalWorkers: growth.workers.current,
      rewardsDistributed: growth.rewards.current,
      qrCodesRedeemed: growth.qrCodesRedeemed.current,
      pendingWithdrawals: growth.pendingWithdrawals.current
    };
  }

  static async getGrowth(period) {
    const dates = AnalyticsPeriodUtil.getPeriodDates(period);

    const [companies, workers, rewards, batches, qrCodesRedeemed, pendingWithdrawals] = await Promise.all([
      this._calculateGrowth(Company, "createdAt", dates, { status: "ACTIVE" }),
      this._calculateGrowth(User, "createdAt", dates, { role: "WORKER", isDeleted: { $ne: true } }),
      this._calculateGrowth(WalletTransaction, "createdAt", dates, { type: "REWARD", status: "COMPLETED" }, "$amount"),
      this._calculateGrowth(BarcodeBatch, "createdAt", dates, {}),
      this._calculateGrowth(Barcode, "redeemedAt", dates, { status: "REDEEMED" }),
      this._calculateGrowth(WithdrawalRequest, "createdAt", dates, { status: "PENDING" }),
    ]);

    return {
      companies,
      workers,
      rewards,
      batches, // Kept for backward compatibility
      qrCodesRedeemed,
      pendingWithdrawals,
      platformGrowth: {
        available: false,
        reason: "Business definition not configured"
      }
    };
  }

  static async getTrends(period) {
    const dates = AnalyticsPeriodUtil.getPeriodDates(period);
    const { currentStart: startDate, currentEnd: endDate, format } = dates;

    const matchStage = {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    };

    const rewardsPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          type: "REWARD",
          status: "COMPLETED"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format, date: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const withdrawalsPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "APPROVED"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format, date: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const companiesPipeline = [
      matchStage,
      {
        $group: {
          _id: { $dateToString: { format, date: "$createdAt" } },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const [rewardsTrend, withdrawalsTrend, companiesTrend] = await Promise.all([
      WalletTransaction.aggregate(rewardsPipeline),
      WithdrawalRequest.aggregate(withdrawalsPipeline),
      Company.aggregate(companiesPipeline)
    ]);

    return {
      rewards: rewardsTrend,
      withdrawals: withdrawalsTrend,
      companies: companiesTrend
    };
  }

  static async getBusinessOverview(period) {
    // Aggregates specific 'Today's Rewards', 'Today's Withdrawals', 'New Companies Joined' for sparklines
    const dates = AnalyticsPeriodUtil.getPeriodDates(period);
    
    // We reuse getGrowth to get the overall diffs, but since business overview typically shows current metrics,
    // we return the raw trends mapped to it or rely on the trends.
    const trends = await this.getTrends(period);
    
    // Sum the current period for the summary card. 
    const totalRewards = trends.rewards.reduce((acc, curr) => acc + curr.total, 0);
    const totalWithdrawals = trends.withdrawals.reduce((acc, curr) => acc + curr.total, 0);
    const newCompanies = trends.companies.reduce((acc, curr) => acc + curr.total, 0);

    return {
      totalRewards,
      totalWithdrawals,
      newCompanies,
      trendData: {
        rewards: trends.rewards,
        withdrawals: trends.withdrawals,
        companies: trends.companies
      }
    };
  }

  static async getTopCompanies(period, limit = 10, sortBy = 'rewards') {
    let pipeline = [];
    const limitNum = parseInt(limit, 10);
    const dates = AnalyticsPeriodUtil.getPeriodDates(period);

    if (sortBy === 'rewards') {
      pipeline = [
        { $match: { createdAt: { $gte: dates.currentStart, $lte: dates.currentEnd }, type: "REWARD", status: "COMPLETED" } },
        { $group: { _id: "$company", totalValue: { $sum: "$amount" } } },
        { $sort: { totalValue: -1 } },
        { $limit: limitNum },
        {
          $lookup: {
            from: "companies",
            localField: "_id",
            foreignField: "_id",
            as: "companyInfo"
          }
        },
        { $unwind: "$companyInfo" },
        {
          $project: {
            id: "$_id",
            name: "$companyInfo.name",
            logo: "$companyInfo.logo",
            value: "$totalValue"
          }
        }
      ];
      return await WalletTransaction.aggregate(pipeline);
    } 
    
    if (sortBy === 'workers') {
      pipeline = [
        { $match: { createdAt: { $gte: dates.currentStart, $lte: dates.currentEnd }, role: "WORKER", isDeleted: { $ne: true } } },
        { $group: { _id: "$company", totalValue: { $sum: 1 } } },
        { $sort: { totalValue: -1 } },
        { $limit: limitNum },
        {
          $lookup: {
            from: "companies",
            localField: "_id",
            foreignField: "_id",
            as: "companyInfo"
          }
        },
        { $unwind: "$companyInfo" },
        {
          $project: {
            id: "$_id",
            name: "$companyInfo.name",
            logo: "$companyInfo.logo",
            value: "$totalValue"
          }
        }
      ];
      return await User.aggregate(pipeline);
    }

    return [];
  }

  static async getSystemHealthSummary() {
    // Re-use HealthService internally
    const deepHealth = await HealthService.getDeepHealth();
    return {
      overallStatus: deepHealth.overallStatus,
      services: {
        api: "HEALTHY",
        database: deepHealth.services.database.status,
        queueWorkers: deepHealth.queues.status,
        storage: deepHealth.storage.status
      },
      lastChecked: new Date().toISOString() // Or get it from deepHealth meta if available
    };
  }

  static async getOverview(period) {
    const results = await Promise.allSettled([
      this.getStats(period),
      this.getGrowth(period),
      this.getTrends(period),
      this.getTopCompanies(period),
      this.getBusinessOverview(period),
      this.getSystemHealthSummary()
    ]);

    const [statsRes, growthRes, trendsRes, topCompaniesRes, businessOverviewRes, healthSummaryRes] = results;

    const data = {
      stats: statsRes.status === 'fulfilled' ? statsRes.value : null,
      growth: growthRes.status === 'fulfilled' ? growthRes.value : null,
      trends: trendsRes.status === 'fulfilled' ? trendsRes.value : null,
      topCompanies: topCompaniesRes.status === 'fulfilled' ? topCompaniesRes.value : [],
      businessOverview: businessOverviewRes.status === 'fulfilled' ? businessOverviewRes.value : null,
      healthSummary: healthSummaryRes.status === 'fulfilled' ? healthSummaryRes.value : null
    };

    const modules = {
      stats: statsRes.status === 'fulfilled' ? 'HEALTHY' : 'FAILED',
      growth: growthRes.status === 'fulfilled' ? 'HEALTHY' : 'FAILED',
      trends: trendsRes.status === 'fulfilled' ? 'HEALTHY' : 'FAILED',
      topCompanies: topCompaniesRes.status === 'fulfilled' ? 'HEALTHY' : 'FAILED',
      businessOverview: businessOverviewRes.status === 'fulfilled' ? 'HEALTHY' : 'FAILED',
      healthSummary: healthSummaryRes.status === 'fulfilled' ? 'HEALTHY' : 'FAILED'
    };

    const warnings = [];
    results.forEach((res, index) => {
      if (res.status === 'rejected') {
        const moduleNames = ["Stats", "Growth", "Trends", "Top Companies", "Business Overview", "Health Summary"];
        warnings.push(`${moduleNames[index]} temporarily unavailable`);
        console.error(`Analytics module ${moduleNames[index]} failed:`, res.reason);
      }
    });

    return { data, modules, warnings };
  }
}

module.exports = AnalyticsService;
