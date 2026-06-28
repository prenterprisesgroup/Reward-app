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
    profilePhotoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          // Validate Cloudinary URL format
          return /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\/.*/.test(v);
        },
        message: "Profile photo must be a valid Cloudinary URL"
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      trim: true,
    },
    bankAccount: {
      accountNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            if (!v) return true;
            return /^[0-9]{9,18}$/.test(v);
          },
          message: "Account number must be 9-18 digits"
        }
      },
      ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
          validator: function(v) {
            if (!v) return true;
            return /^[A-Z]{4}[0][A-Z0-9]{6}$/.test(v);
          },
          message: "IFSC code must be 11 characters (4 letters + 0 + 6 alphanumeric)"
        }
      },
      bankName: {
        type: String,
        trim: true,
        maxlength: 100,
      }
    },
    rateLimit: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000,
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
