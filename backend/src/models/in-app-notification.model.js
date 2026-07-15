const mongoose = require("mongoose");
const { Schema } = mongoose;

const inAppNotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["SYSTEM", "REWARD", "PAYMENT", "QR", "COMPANY", "USER", "SECURITY", "ANNOUNCEMENT"],
      required: true,
      index: true,
    },
    iconType: {
      type: String,
      enum: ["GIFT", "WALLET_CHECK", "WALLET_X", "QR", "COMPANY", "USER", "SHIELD"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "CRITICAL"],
      default: "NORMAL",
      index: true,
    },
    action: {
      type: String,
      enum: [
        "OPEN_REWARD",
        "OPEN_WITHDRAWAL",
        "OPEN_QR_BATCH",
        "OPEN_COMPANY",
        "OPEN_WORKER",
        "OPEN_ANALYTICS",
        "OPEN_SETTINGS",
        "NONE",
      ],
      default: "NONE",
    },
    actionPayload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      index: { expires: 0 },
    }
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal sorting and querying
inAppNotificationSchema.index({ recipient: 1, isDeleted: 1, createdAt: -1, _id: -1 });
inAppNotificationSchema.index({ recipient: 1, isDeleted: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("InAppNotification", inAppNotificationSchema);
