const mongoose = require("mongoose");

const Company = require("../models/company.model");
const User = require("../models/user.model");
const presentCompany = require("../utils/company-presenter");
const HttpError = require("../utils/http-error");
const { COMPANY_STATUS } = require("../constants/statuses");

function assertObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, `${label} is invalid`);
  }
}

async function approveCompany(req, res, next) {
  try {
    const { companyId } = req.params;
    assertObjectId(companyId, "Company id");

    const company = await Company.findById(companyId);
    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    company.status = COMPANY_STATUS.ACTIVE;
    await company.save();

    res.json({ company: presentCompany(company) });
  } catch (error) {
    next(error);
  }
}

async function rejectCompany(req, res, next) {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;
    assertObjectId(companyId, "Company id");

    const company = await Company.findById(companyId);
    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    company.status = COMPANY_STATUS.REJECTED;
    await company.save();

    res.json({ company: presentCompany(company), reason });
  } catch (error) {
    next(error);
  }
}

async function suspendCompany(req, res, next) {
  try {
    const { companyId } = req.params;
    assertObjectId(companyId, "Company id");

    const company = await Company.findById(companyId);
    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    company.status = COMPANY_STATUS.SUSPENDED;
    await company.save();

    res.json({ company: presentCompany(company) });
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
        throw new HttpError(400, "Invalid company status");
      }
      filter.status = status;
    }

    if (search) {
      filter.name = new RegExp(search, "i");
    }

    const companies = await Company.find(filter).sort({ createdAt: -1 });
    res.json({ companies: companies.map(presentCompany) });
  } catch (error) {
    next(error);
  }
}

async function getCompanyDetails(req, res, next) {
  try {
    const { companyId } = req.params;
    assertObjectId(companyId, "Company id");

    const company = await Company.findById(companyId);
    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    res.json({ company: presentCompany(company) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  approveCompany,
  rejectCompany,
  suspendCompany,
  listCompanies,
  getCompanyDetails,
};
