const mongoose = require("mongoose");

const notificationTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["EMAIL", "SMS", "PUSH", "SYSTEM"],
      required: true,
      index: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    variables: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
    version: {
      type: Number,
      default: 1,
    }
  },
  {
    timestamps: true,
  }
);

notificationTemplateSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("NotificationTemplate", notificationTemplateSchema);
