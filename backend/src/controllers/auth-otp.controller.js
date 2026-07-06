const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model");
const HttpError = require("../utils/http-error");
const { signAuthToken } = require("../utils/auth-token");
const presentUser = require("../utils/user-presenter");
const { ROLES } = require("../constants/roles");

const OTP_TTL_MS = 1000 * 60 * 5;

function sendAuthResponse(res, user, statusCode = 200) {
  res.status(statusCode).json({
    token: signAuthToken(user),
    user: presentUser(user),
  });
}

async function requestOtp(req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      throw new HttpError(400, "Phone is required");
    }

    const user = await User.findOne({ phone });
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    res.json({ message: "OTP generated", otpCode });
  } catch (error) {
    next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { phone, otpCode } = req.body;

    if (!phone || !otpCode) {
      throw new HttpError(400, "Phone and OTP code are required");
    }

    const user = await User.findOne({ phone }).select("+otpCode +otpExpiresAt");
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (!user.otpCode || !user.otpExpiresAt || user.otpCode !== otpCode) {
      throw new HttpError(400, "Invalid OTP code");
    }

    if (user.otpExpiresAt < new Date()) {
      throw new HttpError(400, "OTP code has expired");
    }

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    sendAuthResponse(res, user);
  } catch (error) {
    next(error);
  }
}

async function passwordLogin(req, res, next) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      throw new HttpError(400, "Phone and password are required");
    }

    const user = await User.findOne({ phone }).select("+passwordHash");
    if (!user || !user.isActive) {
      throw new HttpError(401, "Invalid phone or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new HttpError(401, "Invalid phone or password");
    }

    sendAuthResponse(res, user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requestOtp,
  verifyOtp,
  passwordLogin,
};
