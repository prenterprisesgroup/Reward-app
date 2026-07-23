const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { ROLES } = require("../constants/roles");
const { COMPANY_STATUS } = require("../constants/statuses");
const Company = require("../models/company.model");
const User = require("../models/user.model");
const WalletTransaction = require("../models/wallet-transaction.model");
const presentCompany = require("../utils/company-presenter");
const HttpError = require("../utils/http-error");
const presentUser = require("../utils/user-presenter");

const SALT_ROUNDS = 12;

const { escapeRegex, assertObjectId } = require("../utils/validation");
const { logAudit } = require("../utils/audit");
const { uploadToCloudinary } = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

const Counter = require("../models/counter.model");

async function createCompany(req, res, next) {
  const session = await mongoose.startSession();
  let uploadedImage = null;

  try {
    const { name, legalName, phone, email, address, industry, website, gstNumber, upiId, bankAccount } = req.body;

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

    // Two-Phase Creation: Upload Logo first
    if (req.file) {
      uploadedImage = await uploadToCloudinary(req.file, 'reward-app/company-logos');
    }

    session.startTransaction();

    // Atomic sequence generation
    const counter = await Counter.findByIdAndUpdate(
      "companyDisplayId",
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );
    const displayId = `CMP-${String(counter.seq).padStart(6, '0')}`;

    // Note: address might be passed as a JSON string if using FormData, parse it if needed.
    let parsedAddress = address;
    if (typeof address === 'string') {
      try { parsedAddress = JSON.parse(address); } catch (e) {}
    }
    
    let parsedBankAccount = bankAccount;
    if (typeof bankAccount === 'string') {
      try { parsedBankAccount = JSON.parse(bankAccount); } catch (e) {}
    }

    const company = await Company.create([{
      name,
      legalName,
      displayId,
      industry,
      phone,
      email: normalizedEmail,
      website,
      gstNumber,
      upiId,
      bankAccount: parsedBankAccount,
      address: parsedAddress,
      createdBy: req.user._id,
      ...(uploadedImage && { 
        logo: uploadedImage.secure_url,
        cloudinaryPublicId: uploadedImage.public_id
      })
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      company: presentCompany(company[0]),
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    // Cloudinary Cleanup Rule: Rollback uploaded image if DB creation fails
    if (uploadedImage && uploadedImage.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error("Failed to cleanup Cloudinary image after DB transaction aborted:", cleanupError);
      }
    }

    next(error);
  }
}

async function getCompanyStats(req, res, next) {
  try {
    const stats = await Company.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    let total = 0;
    let active = 0;
    let pending = 0;
    let suspended = 0;

    stats.forEach(s => {
      total += s.count;
      if (s._id === 'ACTIVE') active += s.count;
      if (s._id === 'PENDING') pending += s.count;
      if (s._id === 'SUSPENDED') suspended += s.count;
    });

    res.json({
      total,
      active,
      pending,
      suspended
    });
  } catch (error) {
    next(error);
  }
}

async function listCompanies(req, res, next) {
  try {
    const { status, search, page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const filter = {};

    if (status) {
      if (!Object.values(COMPANY_STATUS).includes(status)) {
        throw new HttpError(400, "Company status is invalid");
      }
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(escapeRegex(search), "i") },
        { displayId: new RegExp(escapeRegex(search), "i") }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;
    
    let sortOption = { createdAt: -1 };
    if (sort === "name") sortOption = { name: 1 };
    if (sort === "-name") sortOption = { name: -1 };
    if (sort === "createdAt") sortOption = { createdAt: 1 };

    const pipeline = [
      { $match: filter },
      { $sort: sortOption },
      { $skip: skipNum },
      { $limit: limitNum },
      // Lookup Primary Admin
      {
        $lookup: {
          from: "users",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$company", "$$companyId"] }, { $eq: ["$role", ROLES.COMPANY_ADMIN] }] } } },
            { $sort: { createdAt: 1 } },
            { $limit: 1 },
            { $project: { name: 1, email: 1, phone: 1, _id: 1 } }
          ],
          as: "primaryAdmin"
        }
      },
      { $unwind: { path: "$primaryAdmin", preserveNullAndEmptyArrays: true } },
      
      // Lookup Workers count
      {
        $lookup: {
          from: "wallettransactions",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$company", "$$companyId"] }, { $eq: ["$type", "REWARD"] }, { $eq: ["$status", "SUCCESS"] }] } } },
            { $group: { _id: "$worker" } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "w" } },
            { $unwind: "$w" },
            { $match: { "w.isDeleted": { $ne: true } } },
            { $count: "count" }
          ],
          as: "workersData"
        }
      },
      
      // Lookup QR Batches count
      {
        $lookup: {
          from: "barcodebatches",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$company", "$$companyId"] } } },
            { $count: "count" }
          ],
          as: "qrBatchesData"
        }
      },

      // Lookup Rewards Distributed (COMPLETED WalletTransactions)
      {
        $lookup: {
          from: "wallettransactions",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$company", "$$companyId"] }, { $eq: ["$status", "COMPLETED"] }, { $eq: ["$type", "REWARD"] }] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ],
          as: "rewardsData"
        }
      },
      
      // Dynamic Projection
      {
        $project: {
          id: "$_id",
          displayId: 1,
          name: 1,
          logoUrl: "$logo",
          industry: 1,
          status: 1,
          createdAt: 1,
          email: 1,
          phone: 1,
          primaryAdmin: 1,
          workersCount: { $ifNull: [{ $arrayElemAt: ["$workersData.count", 0] }, 0] },
          qrBatches: { $ifNull: [{ $arrayElemAt: ["$qrBatchesData.count", 0] }, 0] },
          rewardsDistributed: { $ifNull: [{ $arrayElemAt: ["$rewardsData.total", 0] }, 0] },
          _id: 0
        }
      }
    ];

    const [companies, totalItems] = await Promise.all([
      Company.aggregate(pipeline),
      Company.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      data: companies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getCompany(req, res, next) {
  try {
    const { id } = req.params;
    assertObjectId(id, "Company id");

    const objectId = new mongoose.Types.ObjectId(id);

    const pipeline = [
      { $match: { _id: objectId } },
      
      // Lookup Primary Admin (first one created)
      {
        $lookup: {
          from: "users",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$company", "$$companyId"] }, { $eq: ["$role", ROLES.COMPANY_ADMIN] }] } } },
            { $sort: { createdAt: 1 } },
            { $limit: 1 }
          ],
          as: "primaryAdminArr"
        }
      },
      
      // Lookup All Admins
      {
        $lookup: {
          from: "users",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$company", "$$companyId"] }, { $eq: ["$role", ROLES.COMPANY_ADMIN] }] } } },
            { $sort: { createdAt: -1 } }
          ],
          as: "admins"
        }
      },

      // Workers Stats
      {
        $lookup: {
          from: "wallettransactions",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$company", "$$companyId"] }, { $eq: ["$type", "REWARD"] }, { $eq: ["$status", "SUCCESS"] }] } } },
            { $group: { _id: "$worker" } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "w" } },
            { $unwind: "$w" },
            { $match: { "w.isDeleted": { $ne: true } } },
            { 
              $group: { 
                _id: null, 
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ["$w.isActive", true] }, 1, 0] } }
              } 
            }
          ],
          as: "workersStats"
        }
      },

      // QR Batches Stats
      {
        $lookup: {
          from: "barcodebatches",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$company", "$$companyId"] } } },
            { 
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } }
              }
            }
          ],
          as: "qrStats"
        }
      },

      // Rewards Stats (COMPLETED only for distributed)
      {
        $lookup: {
          from: "wallettransactions",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$company", "$$companyId"] }, { $eq: ["$type", "REWARD"] }] } } },
            { 
              $group: {
                _id: null,
                distributed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$amount", 0] } },
                pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, "$amount", 0] } }
              }
            }
          ],
          as: "rewardsStats"
        }
      },

      // Withdrawals Stats
      {
        $lookup: {
          from: "withdrawalrequests",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$company", "$$companyId"] } } },
            {
              $group: {
                _id: null,
                pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, "$amount", 0] } },
                approved: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, "$amount", 0] } },
                rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, "$amount", 0] } },
                cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, "$amount", 0] } }
              }
            }
          ],
          as: "withdrawalsStats"
        }
      }
    ];

    const result = await Company.aggregate(pipeline);

    if (!result || result.length === 0) {
      throw new HttpError(404, "Company not found");
    }

    const data = result[0];
    
    const wStats = data.workersStats[0] || { total: 0, active: 0 };
    const qStats = data.qrStats[0] || { total: 0, active: 0 };
    const rStats = data.rewardsStats[0] || { distributed: 0, pending: 0 };
    const wdStats = data.withdrawalsStats[0] || { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
    const primaryAdmin = data.primaryAdminArr && data.primaryAdminArr.length > 0 ? presentUser(data.primaryAdminArr[0]) : null;

    res.json({
      company: presentCompany(data),
      stats: {
        workforce: {
          workersCount: wStats.total,
          activeWorkers: wStats.active
        },
        rewards: {
          distributed: rStats.distributed,
          pending: rStats.pending
        },
        withdrawals: {
          pending: wdStats.pending,
          approved: wdStats.approved,
          rejected: wdStats.rejected,
          cancelled: wdStats.cancelled
        },
        qr: {
          batches: qStats.total,
          activeBatches: qStats.active
        }
      },
      primaryAdmin,
      admins: data.admins.map(presentUser),
      subscription: {
        plan: "Standard",
        validUntil: null
      },
      verification: {
        isVerified: data.status === "ACTIVE",
        verifiedAt: data.status === "ACTIVE" ? data.updatedAt : null
      }
    });
  } catch (error) {
    next(error);
  }
}

async function createCompanyAdmin(req, res, next) {
  const session = await mongoose.startSession();
  
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

    session.startTransaction();

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // User.create returns an array when session is passed
    const users = await User.create([{
      name,
      phone,
      email: normalizedEmail,
      passwordHash,
      role: ROLES.COMPANY_ADMIN,
      company: company._id,
    }], { session });

    const user = users[0];

    // Log the audit event within the same transaction
    await logAudit(
      req,
      "COMPANY_ADMIN_CREATED",
      user._id, // Target User (workerId)
      company._id, // Company
      null, // beforeState
      { // afterState containing the metadata requested
        status: "SUCCESS",
        actorRole: "SUPER_ADMIN",
        targetRole: "COMPANY_ADMIN",
        companyName: company.name,
        adminName: user.name,
        adminEmail: user.email,
        adminPhone: user.phone
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      user: presentUser(user),
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
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

    if (company.status === COMPANY_STATUS.ACTIVE) {
      throw new HttpError(400, "Company is already active");
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

async function suspendCompany(req, res, next) {
  try {
    const { id } = req.params;
    assertObjectId(id, "Company id");

    const company = await Company.findById(id);

    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    company.status = COMPANY_STATUS.SUSPENDED;
    await company.save();

    res.json({
      company: presentCompany(company),
      message: "Company suspended successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function getCompanyActivity(req, res, next) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    assertObjectId(id, "Company id");
    const objectId = new mongoose.Types.ObjectId(id);

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;

    const AuditLog = require("../models/audit-log.model"); // Ensure imported or use existing

    const filter = { companyId: objectId };

    const [activities, totalItems] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .populate("performedBy", "name email role")
        .select("-beforeState -ip -userAgent") // Projection for payload reduction
        .lean(), // .lean() Verification
      AuditLog.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    const formattedActivities = activities.map(act => {
      // Derive status and description from afterState if available
      const afterState = act.afterState || {};
      const status = afterState.status || "SUCCESS";
      const description = afterState.details || afterState.message || "Activity performed";

      return {
        id: act._id,
        type: act.action || 'UNKNOWN',
        title: (act.action || 'UNKNOWN').replace(/_/g, ' '),
        description: description,
        createdAt: act.createdAt,
        performedBy: act.performedBy ? {
          id: act.performedBy._id,
          name: act.performedBy.name,
          role: act.performedBy.role
        } : null,
        status: status
      };
    });

    res.json({
      data: formattedActivities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
}


async function updateCompany(req, res, next) {
  try {
    const { id } = req.params;
    assertObjectId(id, 'Company id');

    const { name, legalName, phone, email, address, industry, website, gstNumber, upiId, bankAccount } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      throw new HttpError(404, 'Company not found');
    }

    if (name || email) {
      const normalizedEmail = email ? email.toLowerCase() : company.email;
      const duplicateCompany = await Company.findOne({
        _id: { $ne: company._id },
        $or: [
          ...(name ? [{ name: new RegExp('^' + escapeRegex(name) + '$', 'i') }] : []),
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ],
      });

      if (duplicateCompany) {
        throw new HttpError(409, 'Company with this name or email already exists');
      }
    }

    if (name) company.name = name;
    if (legalName !== undefined) company.legalName = legalName;
    if (phone !== undefined) company.phone = phone;
    if (email !== undefined) company.email = email.toLowerCase();
    if (industry !== undefined) company.industry = industry;
    if (website !== undefined) company.website = website;
    if (gstNumber !== undefined) company.gstNumber = gstNumber;
    if (upiId !== undefined) company.upiId = upiId;
    
    if (address) {
      let parsedAddress = address;
      if (typeof address === 'string') {
        try { parsedAddress = JSON.parse(address); } catch (e) {}
      }
      company.address = { ...company.address, ...parsedAddress };
    }
    
    if (bankAccount) {
      let parsedBankAccount = bankAccount;
      if (typeof bankAccount === 'string') {
        try { parsedBankAccount = JSON.parse(bankAccount); } catch (e) {}
      }
      company.bankAccount = { ...company.bankAccount, ...parsedBankAccount };
    }

    let uploadedImage = null;
    if (req.file) {
      uploadedImage = await uploadToCloudinary(req.file, 'reward-app/company-logos');
      company.logo = uploadedImage.secure_url;
      company.cloudinaryPublicId = uploadedImage.public_id;
    }

    await company.save();

    res.json({
      company: presentCompany(company),
      message: 'Company updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

async function getCompanyWorkers(req, res, next) {
  try {
    const { id } = req.params;
    const { search, page = 1, limit = 10, sort = "-totalRewardsEarned" } = req.query;
    assertObjectId(id, "Company id");

    const companyId = new mongoose.Types.ObjectId(id);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;

    // Build sort options
    let sortOption = { totalRewardsEarned: -1 };
    if (sort === "totalRewardsEarned") sortOption = { totalRewardsEarned: 1 };
    if (sort === "-totalRewardsEarned") sortOption = { totalRewardsEarned: -1 };
    if (sort === "totalQrScans") sortOption = { totalQrScans: 1 };
    if (sort === "-totalQrScans") sortOption = { totalQrScans: -1 };
    if (sort === "lastScanDate") sortOption = { lastScanDate: 1 };
    if (sort === "-lastScanDate") sortOption = { lastScanDate: -1 };

    // Common match for the company
    const baseMatch = { company: companyId, type: 'REWARD', status: 'SUCCESS' };

    // Get the base aggregation grouping by worker
    const basePipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: "$worker",
          totalRewardsEarned: { $sum: "$amount" },
          totalQrScans: { $sum: 1 },
          lastScanDate: { $max: "$createdAt" },
          joinDate: { $min: "$createdAt" },
          // Store the last known amount for reference
          lastRewardAmount: { $last: "$amount" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "workerDetails"
        }
      },
      { $unwind: "$workerDetails" },
      { $match: { "workerDetails.isDeleted": { $ne: true } } }
    ];

    // Apply search filter if provided
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      basePipeline.push({
        $match: {
          $or: [
            { "workerDetails.name": searchRegex },
            { "workerDetails.phone": searchRegex }
          ]
        }
      });
    }

    // Facet for pagination & counting
    const facetPipeline = [
      ...basePipeline,
      {
        $facet: {
          data: [
            { $sort: sortOption },
            { $skip: skipNum },
            { $limit: limitNum },
            {
              $project: {
                id: "$_id",
                name: { $ifNull: ["$workerDetails.name", "Unknown"] },
                phone: { $ifNull: ["$workerDetails.phone", "N/A"] },
                status: { $ifNull: ["$workerDetails.isActive", true] },
                profilePhotoUrl: { $ifNull: ["$workerDetails.profilePhotoUrl", null] },
                totalRewardsEarned: 1,
                totalQrScans: 1,
                lastScanDate: 1,
                joinDate: 1,
                lastRewardAmount: 1,
                _id: 0
              }
            }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ];

    const result = await WalletTransaction.aggregate(facetPipeline);
    const data = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateCompany,
  createCompany,
  createCompanyAdmin,
  getCompanyStats,
  getCompany,
  listCompanies,
  approveCompany,
  rejectCompany,
  suspendCompany,
  getCompanyActivity,
  getCompanyWorkers,
};
