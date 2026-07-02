const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { ROLES } = require("../constants/roles");
const { COMPANY_STATUS } = require("../constants/statuses");
const Company = require("../models/company.model");
const User = require("../models/user.model");
const presentCompany = require("../utils/company-presenter");
const HttpError = require("../utils/http-error");
const presentUser = require("../utils/user-presenter");

const SALT_ROUNDS = 12;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, `${label} is invalid`);
  }
}

async function createCompany(req, res, next) {
  try {
    const { name, legalName, phone, email, address } = req.body;

    if (!name) {
      throw new HttpError(400, "Company name is required");
    }

    const normalizedEmail = email ? email.toLowerCase() : undefined;
    const duplicateCompany = await Company.findOne({
      $or: [
        { name: new RegExp(`^${escapeRegex(name)}$`, "i") },
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
      ],
    });

    if (duplicateCompany) {
      throw new HttpError(409, "Company with this name or email already exists");
    }

    const company = await Company.create({
      name,
      legalName,
      phone,
      email: normalizedEmail,
      address,
      createdBy: req.user._id,
    });

    res.status(201).json({
      company: presentCompany(company),
    });
  } catch (error) {
    next(error);
  }
}

async function listCompanies(req, res, next) {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) {
      if (!Object.values(COMPANY_STATUS).includes(status)) {
        throw new HttpError(400, "Company status is invalid");
      }

      filter.status = status;
    }

    if (search) {
      filter.name = new RegExp(escapeRegex(search), "i");
    }

    const companies = await Company.find(filter).sort({ createdAt: -1 });

    res.json({
      companies: companies.map(presentCompany),
    });
  } catch (error) {
    next(error);
  }
}

async function getCompany(req, res, next) {
  try {
    const { id } = req.params;
    assertObjectId(id, "Company id");

    const company = await Company.findById(id);

    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    const admins = await User.find({
      company: company._id,
      role: ROLES.COMPANY_ADMIN,
    }).sort({ createdAt: -1 });

    res.json({
      company: presentCompany(company),
      admins: admins.map(presentUser),
    });
  } catch (error) {
    next(error);
  }
}

async function createCompanyAdmin(req, res, next) {
  try {
    const { companyId } = req.params;
    const { name, phone, email, password } = req.body;

    assertObjectId(companyId, "Company id");

    if (!name || !phone || !password) {
      throw new HttpError(400, "Name, phone, and password are required");
    }

    if (password.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters");
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
      role: ROLES.COMPANY_ADMIN,
      company: company._id,
    });

    res.status(201).json({
      user: presentUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function approveCompany(req, res, next) {
  try {
    const { id } = req.params;
    assertObjectId(id, "Company id");

    const company = await Company.findById(id);

    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    if (company.status !== COMPANY_STATUS.PENDING) {
      throw new HttpError(400, "Company is not in pending status");
    }

    company.status = COMPANY_STATUS.ACTIVE;
    await company.save();

    // Activate the company admin
    await User.updateMany(
      { company: company._id, role: ROLES.COMPANY_ADMIN },
      { isActive: true }
    );

    res.json({
      company: presentCompany(company),
      message: "Company approved successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function rejectCompany(req, res, next) {
  try {
    const { id } = req.params;
    assertObjectId(id, "Company id");

    const company = await Company.findById(id);

    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    if (company.status !== COMPANY_STATUS.PENDING) {
      throw new HttpError(400, "Company is not in pending status");
    }

    company.status = COMPANY_STATUS.REJECTED;
    await company.save();

    res.json({
      company: presentCompany(company),
      message: "Company rejected successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCompany,
  createCompanyAdmin,
  getCompany,
  listCompanies,
  approveCompany,
  rejectCompany,
};
