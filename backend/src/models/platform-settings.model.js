const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    general: {
      maintenanceMode: { type: Boolean, default: false },
      supportEmail: { type: String, default: "support@example.com" },
    },
    rewards: {
      minRewardAmount: { type: Number, default: 1 },
      maxRewardAmount: { type: Number, default: 10000 },
    },
    withdrawals: {
      minWithdrawalAmount: { type: Number, default: 100 },
      dailyWithdrawalLimit: { type: Number, default: 50000 },
    },
    featureFlags: {
      analyticsEnabled: { type: Boolean, default: true },
      reportsEnabled: { type: Boolean, default: true },
      notificationsEnabled: { type: Boolean, default: true },
    },
    version: { type: Number, default: 1 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
