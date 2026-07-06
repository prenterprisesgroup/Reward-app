const { verifyAuthToken } = require("../utils/auth-token");
const TokenBlacklist = require("../models/token-blacklist.model");
const HttpError = require("../utils/http-error");

async function logout(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new HttpError(401, "Authentication token is required");
    }

    const payload = verifyAuthToken(token);
    const expiresAt = payload.exp ? new Date(payload.exp * 1000) : new Date(Date.now() + 1000 * 60 * 60 * 24);

    await TokenBlacklist.create({ token, expiresAt });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  logout,
};
