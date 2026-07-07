const mongoose = require("mongoose");

const { WITHDRAWAL_STATUS } = require("../constants/statuses");

const withdrawalRequestSchema = new mongoose.Schema(
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
    upiId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: Object.values(WITHDRAWAL_STATUS),
      default: WITHDRAWAL_STATUS.PENDING,
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    paymentReference: {
      type: String,
      trim: true,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
  }
);

withdrawalRequestSchema.index({ worker: 1, createdAt: -1 });
withdrawalRequestSchema.index({ company: 1, status: 1 });
withdrawalRequestSchema.index({ status: 1, createdAt: -1 }); // Added for global analytics

module.exports = mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
