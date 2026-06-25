const mongoose = require("mongoose");

const { ROLES } = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      set: (value) => (value === "" ? undefined : value),
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    otpCode: {
      type: String,
      trim: true,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },
    upiId: {
      type: String,
      trim: true,
      lowercase: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ company: 1, role: 1 });

module.exports = mongoose.model("User", userSchema);
