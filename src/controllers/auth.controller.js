const bcrypt = require("bcryptjs");

const { ROLES } = require("../constants/roles");
const User = require("../models/user.model");
const { signAuthToken } = require("../utils/auth-token");
const HttpError = require("../utils/http-error");
const presentUser = require("../utils/user-presenter");

const SALT_ROUNDS = 12;

function sendAuthResponse(res, user, statusCode = 200) {
  res.status(statusCode).json({
    token: signAuthToken(user),
    user: presentUser(user),
  });
}

async function registerWorker(req, res, next) {
  try {
    const { name, phone, email, password, upiId } = req.body;

    if (!name || !phone || !password) {
      throw new HttpError(400, "Name, phone, and password are required");
    }

    const existingUser = await User.findOne({
      $or: [{ phone }, ...(email ? [{ email: email.toLowerCase() }] : [])],
    });

    if (existingUser) {
      throw new HttpError(409, "User with this phone or email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      phone,
      email,
      passwordHash,
      role: ROLES.WORKER,
      upiId,
    });

    sendAuthResponse(res, user, 201);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
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

async function getMe(req, res) {
  res.json({
    user: presentUser(req.user),
  });
}

module.exports = {
  getMe,
  login,
  registerWorker,
};
