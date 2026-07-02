const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { ROLES } = require("../constants/roles");
const { COMPANY_STATUS } = require("../constants/statuses");
const User = require("../models/user.model");
const Company = require("../models/company.model");
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

    const user = await User.findOne({ phone }).select("+passwordHash").populate('company');

    if (!user || !user.isActive) {
      throw new HttpError(401, "Invalid phone or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, "Invalid phone or password");
    }

    // Check company approval status for company admins
    if (user.role === ROLES.COMPANY_ADMIN && user.company) {
      if (user.company.status === COMPANY_STATUS.PENDING) {
        throw new HttpError(403, "Your company registration is pending approval from super admin");
      }
      if (user.company.status === COMPANY_STATUS.REJECTED) {
        throw new HttpError(403, "Your company registration has been rejected");
      }
      if (user.company.status === COMPANY_STATUS.SUSPENDED) {
        throw new HttpError(403, "Your company has been suspended");
      }
      if (user.company.status === COMPANY_STATUS.INACTIVE) {
        throw new HttpError(403, "Your company account is inactive");
      }
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

async function registerCompany(req, res, next) {
  try {
    const {
      name,
      legalName,
      phone,
      email,
      website,
      gstNumber,
      address,
      adminName,
      adminPhone,
      adminEmail,
      adminPassword,
    } = req.body;

    if (!name || !adminName || !adminPhone || !adminPassword) {
      throw new HttpError(400, "Company name, admin name, admin phone, and admin password are required");
    }

    if (adminPassword.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters");
    }

    const normalizedEmail = email ? email.toLowerCase() : undefined;
    const normalizedAdminEmail = adminEmail ? adminEmail.toLowerCase() : undefined;

    // Check for duplicate company
    const duplicateCompany = await Company.findOne({
      $or: [
        { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
      ],
    });

    if (duplicateCompany) {
      throw new HttpError(409, "Company with this name or email already exists");
    }

    // Check for duplicate admin user
    const existingUser = await User.findOne({
      $or: [{ phone: adminPhone }, ...(normalizedAdminEmail ? [{ email: normalizedAdminEmail }] : [])],
    });

    if (existingUser) {
      throw new HttpError(409, "User with this phone or email already exists");
    }

    // Create company with PENDING status
    const company = await Company.create({
      name,
      legalName,
      phone,
      email: normalizedEmail,
      website,
      gstNumber,
      address,
      status: COMPANY_STATUS.PENDING,
    });

    // Create company admin
    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    const user = await User.create({
      name: adminName,
      phone: adminPhone,
      email: normalizedAdminEmail,
      passwordHash,
      role: ROLES.COMPANY_ADMIN,
      company: company._id,
      isActive: false, // Admin cannot login until company is approved
    });

    // Update company owner
    company.owner = user._id;
    await company.save();

    res.status(201).json({
      message: "Company registration submitted successfully. Please wait for super admin approval.",
      company: {
        id: company._id,
        name: company.name,
        status: company.status,
      },
      admin: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMe,
  login,
  registerWorker,
  registerCompany,
};
