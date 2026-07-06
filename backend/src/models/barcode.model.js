const mongoose = require("mongoose");

const { BARCODE_STATUS } = require("../constants/statuses");

const barcodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BarcodeBatch",
      required: true,
      index: true,
    },
    rewardAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(BARCODE_STATUS),
      default: BARCODE_STATUS.ACTIVE,
      index: true,
    },
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    redeemedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    blockedReason: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

barcodeSchema.index({ company: 1, status: 1 });
barcodeSchema.index({ batch: 1, status: 1 });

module.exports = mongoose.model("Barcode", barcodeSchema);
