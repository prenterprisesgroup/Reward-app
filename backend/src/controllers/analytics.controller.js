const { Company, User, Barcode, BarcodeBatch, WalletTransaction, WithdrawalRequest } = require("../models");
const HttpError = require("../utils/http-error");
const { COMPANY_STATUS, BARCODE_STATUS, WITHDRAWAL_STATUS } = require("../constants/statuses");

async function getDashboardSummary(req, res, next) {
  try {
    const [
      totalCompanies,
      approvedCompanies,
      totalLabour,
      totalQrGenerated,
      totalQrRedeemed,
      totalRewardsDistributed,
      pendingWithdrawals,
    ] = await Promise.all([
      Company.countDocuments(),
      Company.countDocuments({ status: COMPANY_STATUS.ACTIVE }),
      User.countDocuments({ role: "WORKER" }),
      Barcode.countDocuments(),
      Barcode.countDocuments({ status: BARCODE_STATUS.REDEEMED }),
      WalletTransaction.aggregate([
        { $match: { type: "BARCODE_REWARD", status: "SUCCESS" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      WithdrawalRequest.countDocuments({ status: WITHDRAWAL_STATUS.PENDING }),
    ]);

    res.json({
      totalCompanies,
      approvedCompanies,
      totalLabour,
      totalQrGenerated,
      totalQrRedeemed,
      totalRewardsDistributed: totalRewardsDistributed[0]?.total || 0,
      pendingWithdrawals,
    });
  } catch (error) {
    next(error);
  }
}
async function getGlobalRecentActivity(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [transactions, withdrawals] = await Promise.all([
      WalletTransaction.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("worker", "name phone")
        .populate("company", "name"),
      WithdrawalRequest.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("worker", "name phone")
        .populate("company", "name"),
    ]);

    const activity = [
      ...transactions.map((t) => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        timestamp: t.createdAt,
        worker: t.worker?.name || t.worker?.phone || "Unknown Worker",
        company: t.company?.name || "Unknown Company",
      })),
      ...withdrawals.map((w) => ({
        id: w._id,
        type: "WITHDRAW_REQUEST",
        amount: w.amount,
        status: w.status,
        timestamp: w.createdAt,
        worker: w.worker?.name || w.worker?.phone || "Unknown Worker",
        company: w.company?.name || "Unknown Company",
      })),
    ];

    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      pages: [
        {
          items: activity.slice(0, limit),
        },
      ],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary,
  getGlobalRecentActivity,
};
