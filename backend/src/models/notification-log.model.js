const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ["EMAIL", "SMS", "PUSH", "SYSTEM"],
      required: true,
      index: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationTemplate",
      required: true,
    },
    status: {
      type: String,
      enum: ["QUEUED", "PROCESSING", "DELIVERED", "FAILED", "CANCELLED"],
      default: "QUEUED",
      index: true,
    },
    provider: {
      type: String,
      trim: true,
    },
    attemptCount: {
      type: Number,
      default: 1,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    deliveredAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

notificationLogSchema.index({ recipient: 1, createdAt: -1 });
notificationLogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
