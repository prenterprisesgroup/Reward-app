const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { ROLES } = require("../constants/roles");
const { COMPANY_STATUS } = require("../constants/statuses");
const Company = require("../models/company.model");
const User = require("../models/user.model");
const presentUser = require("../utils/user-presenter");
const HttpError = require("../utils/http-error");

const SALT_ROUNDS = 12;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, `${label} is invalid`);
  }
}

async function createCompanyStaff(req, res, next) {
  try {
    const { companyId } = req.params;
    const { name, phone, email, password } = req.body;

    assertObjectId(companyId, "Company id");

    if (!name || !phone || !password) {
      throw new HttpError(400, "Name, phone, and password are required");
    }

    const company = await Company.findById(companyId);
    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    const normalizedEmail = email ? email.toLowerCase() : undefined;
    const existingUser = await User.findOne({
      $or: [{ phone }, ...(normalizedEmail ? [{ email: normalizedEmail }] : [])],
    });

    if (existingUser) {
      throw new HttpError(409, "User with this phone or email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      phone,
      email: normalizedEmail,
      passwordHash,
      role: ROLES.COMPANY_STAFF,
      company: company._id,
    });

    res.status(201).json({ user: presentUser(user) });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const { userId } = req.params;
    assertObjectId(userId, "User id");

    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    res.json({ user: presentUser(user) });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { userId } = req.params;
    const { name, phone, email, password, upiId, isActive } = req.body;

    assertObjectId(userId, "User id");

    const user = await User.findById(userId).select("+passwordHash");
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email.toLowerCase();
    if (upiId) user.upiId = upiId;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (password) user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await user.save();

    res.json({ user: presentUser(user) });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const { role, companyId, search, status } = req.query;
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (companyId) {
      assertObjectId(companyId, "Company id");
      filter.company = companyId;
    }

    if (status) {
      if (!Object.values(COMPANY_STATUS).includes(status)) {
        throw new HttpError(400, "Invalid status filter");
      }
      filter.isActive = status === "ACTIVE";
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users: users.map(presentUser) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCompanyStaff,
  getUser,
  updateUser,
  listUsers,
};
