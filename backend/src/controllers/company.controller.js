const Company = require('../models/company.model');
const User = require('../models/user.model');
const HttpError = require('../utils/http-error');
const presentCompanyProfile = require('../utils/company-profile.presenter');
const { encrypt } = require('../utils/crypto');
const { uploadToCloudinary } = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const { logAudit } = require('../utils/audit');
const logger = require('../utils/logger');

async function getCompanyProfile(req, res, next) {
  try {
    const companyId = req.user.company;
    if (!companyId) {
      throw new HttpError(404, 'No company associated with this user');
    }

    const company = await Company.findById(companyId);
    if (!company) {
      throw new HttpError(404, 'Company not found');
    }

    res.json(presentCompanyProfile(company, req.user));
  } catch (error) {
    next(error);
  }
}

async function updateCompanyProfile(req, res, next) {
  try {
    const companyId = req.user.company;
    if (!companyId) {
      throw new HttpError(404, 'No company associated with this user');
    }

    const companyBefore = await Company.findById(companyId);
    if (!companyBefore) {
      throw new HttpError(404, 'Company not found');
    }

    // Editable fields
    const {
      name,
      phone,
      address,
      upiId,
      bankName,
      accountNumber,
      accountHolderName,
      ifscCode,
      settlementMethod
    } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) {
      updateData.address = typeof address === 'string' ? { line1: address } : address;
    }
    if (upiId !== undefined) updateData.upiId = upiId;
    if (settlementMethod !== undefined) updateData.settlementMethod = settlementMethod;

    if (bankName || accountNumber || accountHolderName || ifscCode) {
      updateData.bankAccount = companyBefore.bankAccount || {};
      if (bankName) updateData.bankAccount.bankName = bankName;
      if (accountHolderName) updateData.bankAccount.accountHolderName = accountHolderName;
      if (ifscCode) updateData.bankAccount.ifscCode = ifscCode.toUpperCase();
      
      if (accountNumber) {
        // Only re-encrypt if the account number actually changed from the masked value
        // The frontend shouldn't send back the masked value (****1234) if it didn't change it,
        // but if they do, we ignore it to prevent saving "****1234" as the actual account.
        if (!accountNumber.includes('*')) {
           updateData.bankAccount.accountNumber = encrypt(accountNumber);
        }
      }
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    await logAudit(req, 'COMPANY_UPDATED', req.user._id, company._id, {}, { fieldsUpdated: Object.keys(updateData) });

    res.json(presentCompanyProfile(company, req.user));
  } catch (error) {
    next(error);
  }
}

async function uploadCompanyLogo(req, res, next) {
  try {
    const companyId = req.user.company;
    if (!companyId) throw new HttpError(404, 'No company associated with this user');

    if (!req.file) {
      throw new HttpError(400, 'No file uploaded');
    }

    const companyBefore = await Company.findById(companyId);
    if (!companyBefore) throw new HttpError(404, 'Company not found');

    const uploadResult = await uploadToCloudinary(req.file, 'reward-app/company-logos');
    
    // Cleanup old logo from cloudinary if it exists
    if (companyBefore.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(companyBefore.cloudinaryPublicId);
      } catch (err) {
        logger.error('Failed to delete old company logo from Cloudinary', err);
      }
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { 
        logo: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id 
      },
      { new: true }
    );

    await logAudit(req, 'COMPANY_LOGO_UPDATED', req.user._id, company._id);

    res.json(presentCompanyProfile(company, req.user));
  } catch (error) {
    next(error);
  }
}

async function updateCompanySettings(req, res, next) {
  try {
    const companyId = req.user.company;
    if (!companyId) throw new HttpError(404, 'No company associated with this user');

    const companyBefore = await Company.findById(companyId);
    if (!companyBefore) throw new HttpError(404, 'Company not found');

    const { language, notifications, timezone, currency } = req.body;
    
    const settings = companyBefore.settings || {};
    
    if (language) settings.language = language;
    if (timezone) settings.timezone = timezone;
    if (currency) settings.currency = currency;
    
    if (notifications) {
      settings.notifications = {
        ...settings.notifications,
        ...notifications
      };
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { settings },
      { new: true, runValidators: true }
    );

    await logAudit(req, 'COMPANY_SETTINGS_UPDATED', req.user._id, company._id);

    res.json(presentCompanyProfile(company, req.user));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  updateCompanySettings,
};
