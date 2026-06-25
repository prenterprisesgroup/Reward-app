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

module.exports = {
  getDashboardSummary,
};
