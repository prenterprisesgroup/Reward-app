const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: "Too many requests from this IP, please try again after a minute" },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts from this IP, please try again after a minute" },
  standardHeaders: true,
  legacyHeaders: false,
});

const withdrawLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many withdrawal requests, please try again after a minute" },
  standardHeaders: true,
  legacyHeaders: false,
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: "Too many scans from this IP, please try again after a minute" },
  standardHeaders: true,
  legacyHeaders: false,
});

const profileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many profile updates, please try again after a minute" },
  standardHeaders: true,
  legacyHeaders: false,
});

const upiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many UPI updates, please try again after a minute" },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  loginLimiter,
  withdrawLimiter,
  scanLimiter,
  profileLimiter,
  upiLimiter,
};
