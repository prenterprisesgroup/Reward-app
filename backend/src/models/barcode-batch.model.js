const mongoose = require("mongoose");

const { BARCODE_BATCH_STATUS } = require("../constants/statuses");

const barcodeBatchSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    batchId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      immutable: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    rewardAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    generatedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    redeemedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(BARCODE_BATCH_STATUS),
      default: BARCODE_BATCH_STATUS.DRAFT,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

barcodeBatchSchema.index({ company: 1, createdAt: -1 });
barcodeBatchSchema.index({ company: 1, status: 1 });
barcodeBatchSchema.index({ batchId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("BarcodeBatch", barcodeBatchSchema);
