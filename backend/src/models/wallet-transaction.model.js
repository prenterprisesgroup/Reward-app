const mongoose = require("mongoose");

const {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} = require("../constants/statuses");

const walletTransactionSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: Object.values(WALLET_TRANSACTION_TYPE),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(WALLET_TRANSACTION_STATUS),
      default: WALLET_TRANSACTION_STATUS.SUCCESS,
      index: true,
    },
    barcode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barcode",
    },
    withdrawal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithdrawalRequest",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

walletTransactionSchema.index({ worker: 1, createdAt: -1 });
walletTransactionSchema.index({ company: 1, createdAt: -1 });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
