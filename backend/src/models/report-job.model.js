const mongoose = require("mongoose");

const reportJobSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      enum: ["COMPANIES", "WORKERS", "WITHDRAWALS", "TRANSACTIONS", "QR_BATCHES", "AUDIT_LOGS"],
      required: true,
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    generatedFile: {
      type: String, // Path to file or URL
    },
    fileSize: {
      type: Number, // In bytes
    },
    format: {
      type: String,
      enum: ["CSV", "EXCEL", "PDF"],
      required: true,
    },
    filters: {
      type: mongoose.Schema.Types.Mixed, // The query payload used to generate it
    },
    failureReason: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      index: { expires: 0 }, // Automatically delete document and let cron clean file later if needed
    },
  },
  {
    timestamps: true,
  }
);

reportJobSchema.index({ requestedBy: 1, createdAt: -1 });

module.exports = mongoose.model("ReportJob", reportJobSchema);
