const { User, WalletTransaction, WithdrawalRequest } = require("../models");
const HttpError = require("../utils/http-error");
const { WALLET_TRANSACTION_TYPE, WITHDRAWAL_STATUS } = require("../constants/statuses");

class WalletService {
  /**
   * Retrieves the comprehensive wallet summary for a worker (Backward compatibility)
   */
  static async getWalletSummary(workerId) {
    const worker = await User.findById(workerId);
    if (!worker) {
      throw new HttpError(404, "User not found");
    }

    const transactions = await WalletTransaction.find({ worker: workerId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate company balances
    const allRewardTx = await WalletTransaction.find({
      worker: workerId,
      type: WALLET_TRANSACTION_TYPE.BARCODE_REWARD,
    }).populate("company", "_id name");
    
    const compBalances = {};
    allRewardTx.forEach((t) => {
      if (!t.company) return;
      const cId = t.company._id.toString();
      if (!compBalances[cId]) {
        compBalances[cId] = { _id: t.company._id, name: t.company.name, balance: 0 };
      }
      compBalances[cId].balance += t.amount;
    });
    
    const withdrawals = await WithdrawalRequest.find({
      worker: workerId,
      status: { $in: [WITHDRAWAL_STATUS.APPROVED, WITHDRAWAL_STATUS.PAID, WITHDRAWAL_STATUS.PENDING] }
    });
    
    withdrawals.forEach(w => {
      const cId = w.company.toString();
      if (compBalances[cId]) {
        compBalances[cId].balance -= w.amount;
      }
    });

    const companyBalances = Object.values(compBalances).sort((a, b) => b.balance - a.balance);

    return {
      walletBalance: worker.walletBalance,
      pendingWithdrawal: worker.pendingWithdrawalBalance || 0,
      upiId: worker.upiId,
      transactions,
      companyBalances,
    };
  }

  /**
   * Retrieves paginated transactions or withdrawals for a worker
   */
  static async getPaginatedWalletSection(workerId, section, page, limit) {
    const skip = (page - 1) * limit;

    if (section === 'transactions') {
      const query = { worker: workerId };
      const [data, totalItems] = await Promise.all([
        WalletTransaction.find(query)
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .populate("company", "name")
          .lean(),
        WalletTransaction.countDocuments(query)
      ]);

      return { data, totalItems };
    } 
    
    if (section === 'withdrawals') {
      const query = { worker: workerId };
      const [data, totalItems] = await Promise.all([
        WithdrawalRequest.find(query)
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .populate("company", "name")
          .lean(),
        WithdrawalRequest.countDocuments(query)
      ]);

      return { data, totalItems };
    }

    throw new HttpError(400, "Unsupported section type");
  }
}

module.exports = WalletService;
