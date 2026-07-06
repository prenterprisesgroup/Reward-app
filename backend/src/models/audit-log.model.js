const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    beforeState: {
      type: mongoose.Schema.Types.Mixed,
    },
    afterState: {
      type: mongoose.Schema.Types.Mixed,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
