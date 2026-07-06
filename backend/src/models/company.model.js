const mongoose = require("mongoose");

const { COMPANY_STATUS } = require("../constants/statuses");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    legalName: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
        },
        message: "Invalid website URL format"
      }
    },
    logo: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          // Validate Cloudinary URL format
          return /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\/.*/.test(v);
        },
        message: "Logo must be a valid Cloudinary URL"
      }
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          // GSTIN format: 2 characters (state code) + 10 characters (PAN) + 1 character (entity) + 1 character (check digit) + Z
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        },
        message: "Invalid GST number format (must be 15 characters)"
      }
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: "India",
      },
    },
    status: {
      type: String,
      enum: Object.values(COMPANY_STATUS),
      default: COMPANY_STATUS.ACTIVE,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ name: 1 });

module.exports = mongoose.model("Company", companySchema);
