const HttpError = require("../utils/http-error");
const User = require("../models/user.model");
const { verifyAuthToken } = require("../utils/auth-token");

async function protect(req, res, next) {
  try {
    let token = null;

    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization || "";
    const [scheme, headerToken] = authHeader.split(" ");

    if (scheme === "Bearer" && headerToken) {
      token = headerToken;
    }

    // Fall back to query parameter if no header token
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      throw new HttpError(401, "Authentication token is required");
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new HttpError(401, "User is not authorized");
    }

    const TokenBlacklist = require("../models/token-blacklist.model");
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      throw new HttpError(401, "Token is invalid or has been logged out");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new HttpError(401, "Invalid or expired authentication token"));
      return;
    }

    next(error);
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      next(new HttpError(401, "Authentication is required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new HttpError(403, "You do not have permission to perform this action"));
      return;
    }

    next();
  };
}

module.exports = {
  authorizeRoles,
  protect,
};
