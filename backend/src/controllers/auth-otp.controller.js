const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model");
const HttpError = require("../utils/http-error");
const { signAuthToken } = require("../utils/auth-token");
const presentUser = require("../utils/user-presenter");
const { sendEmail } = require("../utils/email.service");
const logger = require("../utils/logger");

const OTP_TTL_MS = 1000 * 60 * 5;
const SALT_ROUNDS = 12;

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

async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      throw new HttpError(400, "Email is required");
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw new HttpError(404, "No account found with this email address");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    let emailResult;
    try {
      emailResult = await sendEmail({
        to: normalizedEmail,
        subject: "Reward App Password Reset OTP",
        text: `Your password reset code is ${otpCode}. It expires in 5 minutes.`,
        html: `<p>Your password reset code is <strong>${otpCode}</strong>.</p><p>It expires in 5 minutes.</p>`,
      });
    } catch (error) {
      user.otpCode = undefined;
      user.otpExpiresAt = undefined;
      await user.save();

      logger.error({ 
        err: error,
        email: normalizedEmail,
        mailHost: process.env.MAIL_HOST,
        mailPort: process.env.MAIL_PORT,
        mailUser: process.env.MAIL_USER ? 'configured' : 'missing',
      }, "Failed to send password reset OTP email");
      throw new HttpError(502, "Could not send OTP email. Please check mail configuration and try again.");
    }

    logger.info({
      emailResult,
      email: normalizedEmail,
      mailHost: process.env.MAIL_HOST,
      mailUser: process.env.MAIL_USER ? 'configured' : 'missing',
    }, "Password reset OTP email sent");

    res.json({ message: "OTP sent to your registered email." });
  } catch (error) {
    next(error);
  }
}

async function verifyPasswordResetOtp(req, res, next) {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      throw new HttpError(400, "Email and OTP code are required");
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+otpCode +otpExpiresAt");

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (!user.otpCode || !user.otpExpiresAt || user.otpCode !== otpCode) {
      throw new HttpError(400, "Invalid OTP code");
    }

    if (user.otpExpiresAt < new Date()) {
      throw new HttpError(400, "OTP code has expired");
    }

    res.json({ message: "OTP verified successfully." });
  } catch (error) {
    next(error);
  }
}

async function completePasswordReset(req, res, next) {
  try {
    const { email, otpCode, newPassword, confirmPassword } = req.body;

    if (!email || !otpCode || !newPassword || !confirmPassword) {
      throw new HttpError(400, "Email, OTP code, new password, and confirm password are required");
    }

    if (newPassword !== confirmPassword) {
      throw new HttpError(400, "New password and confirm password do not match");
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash +otpCode +otpExpiresAt");

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (!user.otpCode || !user.otpExpiresAt || user.otpCode !== otpCode) {
      throw new HttpError(400, "Invalid OTP code");
    }

    if (user.otpExpiresAt < new Date()) {
      throw new HttpError(400, "OTP code has expired");
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. Please log in with your new password." });
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
  requestPasswordReset,
  verifyPasswordResetOtp,
  completePasswordReset,
};
