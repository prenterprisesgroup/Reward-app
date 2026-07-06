const mongoose = require("mongoose");

const appVersionSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      trim: true,
    },
    forceUpdate: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    platform: {
      type: String,
      trim: true,
      enum: ["android", "ios", "web", "all"],
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

appVersionSchema.index({ version: -1 });

module.exports = mongoose.model("AppVersion", appVersionSchema);
