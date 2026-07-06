const crypto = require("crypto");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { checkIdempotency, saveIdempotency } = require("../utils/idempotency");
const { logAudit } = require("../utils/audit");

const presentUser = require("../utils/user-presenter");
const { Barcode, BarcodeBatch, User, WalletTransaction, WithdrawalRequest, Company } = require("../models");
const HttpError = require("../utils/http-error");
const {
  BARCODE_BATCH_STATUS,
  BARCODE_STATUS,
  WALLET_TRANSACTION_TYPE,
  WALLET_TRANSACTION_STATUS,
  WITHDRAWAL_STATUS,
  REWARD_TRANSACTION_TYPES,
} = require("../constants/statuses");
const { ROLES } = require("../constants/roles");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function generateBarcodeCode(companyId) {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  const time = Date.now().toString().slice(-6);
  const companyFragment = companyId ? companyId.toString().slice(-4).toUpperCase() : "X";
  return `${companyFragment}-${time}-${random}`;
}

function assertObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, `${label} is invalid`);
  }
}

function generateBatchId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  const time = Date.now().toString().slice(-3);
  return `QR-${dateStr}-${random}${time}`;
}

function presentBarcodeBatch(batch) {
  let status = batch.status;
  if (status === BARCODE_BATCH_STATUS.ACTIVE && batch.expiresAt && new Date(batch.expiresAt) < new Date()) {
    status = BARCODE_BATCH_STATUS.EXPIRED;
  }

  const redeemedCount = batch.redeemedCount || 0;
  const quantity = batch.quantity || 0;
  const remainingCount = Math.max(0, quantity - redeemedCount);

  return {
    id: batch._id,
    batchId: batch.batchId,
    batchName: batch.productName,
    rewardPerQR: batch.rewardAmount,
    totalQRCodes: quantity,
    generatedCount: batch.generatedCount || 0,
    redeemedCount,
    remainingCount,
    status,
    createdAt: batch.createdAt,
    expiresAt: batch.expiresAt,
    pdfUrl: `/api/v1/system/barcode-batches/${batch._id}/pdf`,
    company: batch.company
  };
}

async function createBarcodeBatch(req, res, next) {
  try {
    const { productName, rewardAmount, quantity, expiresAt, status } = req.body;
    const companyId = req.user.company;

    if (!companyId) {
      throw new HttpError(400, "Company association is required for barcode batch creation");
    }

    if (!productName || !rewardAmount || !quantity) {
      throw new HttpError(400, "Product name, reward amount, and quantity are required");
    }

    if (quantity < 1 || quantity > 2000) {
      throw new HttpError(400, "Quantity must be between 1 and 2000");
    }

    if (status && !Object.values(BARCODE_BATCH_STATUS).includes(status)) {
      throw new HttpError(400, "Invalid barcode batch status");
    }

    const newBatchId = generateBatchId();

    const batch = await BarcodeBatch.create({
      company: companyId,
      batchId: newBatchId,
      productName,
      rewardAmount,
      quantity,
      expiresAt,
      status: status || BARCODE_BATCH_STATUS.ACTIVE,
      createdBy: req.user._id,
    });

    const codes = new Set();
    while (codes.size < quantity) {
      codes.add(generateBarcodeCode(companyId));
    }

    const barcodeDocuments = [...codes].map((code) => ({
      code,
      company: companyId,
      batch: batch._id,
      rewardAmount,
      expiresAt,
    }));

    await Barcode.insertMany(barcodeDocuments);

    batch.generatedCount = quantity;
    await batch.save();

    await logAudit(companyId, req.user._id, "BARCODE_BATCH_CREATED", {
      batchId: batch._id,
      qrBatchId: batch.batchId,
      quantity,
      rewardAmount,
    });

    res.status(201).json(presentBarcodeBatch(batch));
  } catch (error) {
    next(error);
  }
}

async function listBarcodeBatches(req, res, next) {
  try {
    const companyId = req.user.company;
    if (!companyId) {
      throw new HttpError(400, "Company association is required");
    }

    const { search, status, sort, page = 1, limit = 10 } = req.query;

    const query = { company: companyId };

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");
      const isNumber = !isNaN(Number(search));
      
      const searchConditions = [
        { productName: searchRegex },
        { batchId: searchRegex }
      ];
      if (isNumber) {
        searchConditions.push({ rewardAmount: Number(search) });
      }
      query.$or = searchConditions;
    }

    if (status) {
      if (status === BARCODE_BATCH_STATUS.ACTIVE) {
        query.status = BARCODE_BATCH_STATUS.ACTIVE;
        query.$or = [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }];
      } else if (status === BARCODE_BATCH_STATUS.EXPIRED) {
        query.$or = [
          { status: BARCODE_BATCH_STATUS.EXPIRED },
          { status: BARCODE_BATCH_STATUS.ACTIVE, expiresAt: { $lte: new Date() } }
        ];
      } else {
        query.status = status;
      }
    }

    const sortOption = sort === 'OLDEST' ? { createdAt: 1 } : { createdAt: -1 };
    
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const [batches, total] = await Promise.all([
      BarcodeBatch.find(query).sort(sortOption).skip(skip).limit(limitNumber).lean(),
      BarcodeBatch.countDocuments(query)
    ]);

    const mappedBatches = batches.map(presentBarcodeBatch);

    res.json({
      batches: mappedBatches,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      }
    });
  } catch (error) {
    next(error);
  }
}

async function downloadBarcodeBatchPdf(req, res, next) {
  try {
    const { batchId } = req.params;
    const companyId = req.user.company;

    if (!companyId) {
      throw new HttpError(400, "Company association is required");
    }

    assertObjectId(batchId, "Barcode batch id");

    const batch = await BarcodeBatch.findOne({ _id: batchId, company: companyId });

    if (!batch) {
      throw new HttpError(404, "Barcode batch not found");
    }

    const barcodes = await Barcode.find({ batch: batch._id }).sort({ createdAt: 1 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="barcode-batch-${batch._id}.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 24 });
    doc.pipe(res);

    // Header
    doc.fontSize(18).text("Barcode Batch Export", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Product: ${batch.productName}`);
    doc.text(`Reward amount: ₹${batch.rewardAmount}`);
    doc.text(`Quantity: ${batch.quantity}`);
    doc.text(`Status: ${batch.status}`);
    if (batch.expiresAt) {
      doc.text(`Expires at: ${batch.expiresAt.toISOString().slice(0, 10)}`);
    }
    doc.moveDown();

    // Generate QR codes and add them to PDF
    const barcodesPerPage = 4;
    
    for (let i = 0; i < barcodes.length; i++) {
      const barcode = barcodes[i];
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(barcode.code, {
        width: 150,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Add page break if needed
      if (i > 0 && i % barcodesPerPage === 0) {
        doc.addPage();
      }

      // Add barcode info and QR code
      doc.fontSize(10).text(`${i + 1}. Code: ${barcode.code}`, { underline: true });
      doc.fontSize(9).text(`Reward: ₹${barcode.rewardAmount}`);
      
      // Convert data URL to buffer and embed in PDF
      const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      doc.image(buffer, {
        width: 100,
        height: 100,
        align: 'center'
      });
      
      doc.moveDown(0.5);
    }

    doc.end();
  } catch (error) {
    next(error);
  }
}

async function scanBarcode(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { code } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];
    const now = new Date();

    if (!code) {
      throw new HttpError(400, "Barcode code is required");
    }

    if (idempotencyKey) {
      const existing = await checkIdempotency(idempotencyKey, req.user._id, '/scan');
      if (existing) {
        await session.abortTransaction();
        session.endSession();
        return res.status(existing.statusCode).json(existing.response);
      }
    }

    const barcode = await Barcode.findOneAndUpdate(
      {
        code,
        status: BARCODE_STATUS.ACTIVE,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      },
      {
        status: BARCODE_STATUS.REDEEMED,
        redeemedBy: req.user._id,
        redeemedAt: now,
      },
      { new: true, session }
    );

    if (!barcode) {
      throw new HttpError(400, "Barcode is invalid, expired, or already redeemed");
    }

    const beforeState = { walletBalance: req.user.walletBalance };
    
    const worker = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: barcode.rewardAmount } },
      { new: true, session }
    );

    const transaction = await WalletTransaction.create([{
      worker: worker._id,
      company: barcode.company,
      amount: barcode.rewardAmount,
      balanceAfter: worker.walletBalance,
      type: WALLET_TRANSACTION_TYPE.BARCODE_REWARD,
      barcode: barcode._id,
      createdBy: req.user._id,
      note: "Barcode redeemed",
    }], { session });

    const company = await Company.findById(barcode.company).session(session);

    const response = {
      barcode: {
        ...barcode.toObject(),
        company: {
          _id: company._id,
          name: company.name,
        },
      },
      walletBalance: worker.walletBalance,
      transaction: transaction[0],
    };

    await logAudit(req, 'SCAN_SUCCESS', worker._id, company._id, beforeState, { walletBalance: worker.walletBalance }, session);
    await saveIdempotency(idempotencyKey, worker._id, '/scan', 200, response);

    await session.commitTransaction();
    session.endSession();
    res.json(response);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
}

async function getWallet(req, res, next) {
  try {
    const worker = await User.findById(req.user._id);

    if (!worker) {
      throw new HttpError(404, "User not found");
    }

    const transactions = await WalletTransaction.find({ worker: worker._id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate company balances
    const allRewardTx = await WalletTransaction.find({
      worker: worker._id,
      type: WALLET_TRANSACTION_TYPE.BARCODE_REWARD,
    }).populate("company", "_id name");
    
    const compBalances = {};
    allRewardTx.forEach((t) => {
      if (!t.company) return;
      const cId = t.company._id.toString();
      if (!compBalances[cId]) {
        compBalances[cId] = { _id: t.company._id, name: t.company.name, balance: 0 };
      }
      compBalances[cId].balance += t.amount;
    });
    
    const withdrawals = await WithdrawalRequest.find({
      worker: worker._id,
      status: { $in: [WITHDRAWAL_STATUS.APPROVED, WITHDRAWAL_STATUS.PAID, WITHDRAWAL_STATUS.PENDING] }
    });
    withdrawals.forEach(w => {
      const cId = w.company.toString();
      if (compBalances[cId]) {
        compBalances[cId].balance -= w.amount;
      }
    });

    const companyBalances = Object.values(compBalances).sort((a, b) => b.balance - a.balance);

    res.json({
      walletBalance: worker.walletBalance,
      pendingWithdrawal: worker.pendingWithdrawalBalance || 0,
      upiId: worker.upiId,
      transactions,
      companyBalances,
    });
  } catch (error) {
    next(error);
  }
}

async function requestWithdrawal(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, upiId, company } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    if (idempotencyKey) {
      const existing = await checkIdempotency(idempotencyKey, req.user._id, '/withdrawals');
      if (existing) {
        await session.abortTransaction();
        session.endSession();
        return res.status(existing.statusCode).json(existing.response);
      }
    }

    const worker = await User.findById(req.user._id).session(session);

    if (!worker) {
      throw new HttpError(404, "User not found");
    }

    if (!amount || amount < 1) {
      throw new HttpError(400, "Withdrawal amount must be at least 1");
    }

    if (!upiId && !worker.upiId) {
      throw new HttpError(400, "UPI ID is required to request withdrawal");
    }

    if (worker.walletBalance < amount) {
      throw new HttpError(400, "Insufficient wallet balance");
    }

    if (!company) {
      throw new HttpError(400, "Company is required. Please scan a barcode first.");
    }

    const beforeState = { walletBalance: worker.walletBalance, pendingWithdrawalBalance: worker.pendingWithdrawalBalance };

    if (upiId) {
      worker.upiId = upiId;
    }

    worker.walletBalance -= amount;
    worker.pendingWithdrawalBalance = (worker.pendingWithdrawalBalance || 0) + amount;
    await worker.save({ session });

    const withdrawal = await WithdrawalRequest.create([{
      worker: worker._id,
      company: company,
      amount,
      upiId: worker.upiId,
      status: WITHDRAWAL_STATUS.PENDING,
    }], { session });

    const response = { withdrawal: withdrawal[0] };

    await logAudit(req, 'REQUEST_CREATED', worker._id, company, beforeState, { walletBalance: worker.walletBalance, pendingWithdrawalBalance: worker.pendingWithdrawalBalance }, session);
    await saveIdempotency(idempotencyKey, worker._id, '/withdrawals', 201, response);

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(response);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
}

async function listCompanyWorkers(req, res, next) {
  try {
    const companyId = req.user.company;

    if (!companyId) {
      throw new HttpError(400, "Company association is required");
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, status, sort } = req.query;
    
    const filter = {
      company: companyId,
      role: ROLES.WORKER,
    };

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { name: regex },
        { workerId: regex },
        { phone: regex }
      ];
    }

    if (status) {
      if (status === "ACTIVE") filter.isActive = true;
      if (status === "INACTIVE") filter.isActive = false;
      if (status === "PENDING_VERIFICATION") filter.isVerified = false;
    }

    let sortObj = { createdAt: -1 };
    if (sort === "oldest") sortObj = { createdAt: 1 };
    if (sort === "name") sortObj = { name: 1 };

    const [workers, total] = await Promise.all([
      User.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: workers.map(presentUser),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + workers.length < total,
      }
    });
  } catch (error) {
    next(error);
  }
}

async function listCompanyBarcodes(req, res, next) {
  try {
    const companyId = req.user.company;

    if (!companyId) {
      throw new HttpError(400, "Company association is required");
    }

    const { status, batchId, search } = req.query;
    const filter = { company: companyId };

    if (status) {
      if (!Object.values(BARCODE_STATUS).includes(status)) {
        throw new HttpError(400, "Barcode status is invalid");
      }
      filter.status = status;
    }

    if (batchId) {
      assertObjectId(batchId, "Barcode batch id");
      filter.batch = batchId;
    }

    if (search) {
      filter.code = new RegExp(escapeRegex(search), "i");
    }

    const barcodes = await Barcode.find(filter).sort({ createdAt: -1 }).limit(500);

    res.json({ barcodes });
  } catch (error) {
    next(error);
  }
}

async function manualWorkerReward(req, res, next) {
  try {
    const { workerId } = req.params;
    const { amount, note } = req.body;
    const companyId = req.user.company;

    if (!companyId) {
      throw new HttpError(400, "Company association is required");
    }

    assertObjectId(workerId, "Worker id");

    if (!amount || amount < 1) {
      throw new HttpError(400, "Reward amount must be at least 1");
    }

    const worker = await User.findOne({
      _id: workerId,
      company: companyId,
      role: ROLES.WORKER,
    });

    if (!worker) {
      throw new HttpError(404, "Worker not found");
    }

    worker.walletBalance += amount;
    await worker.save();

    const transaction = await WalletTransaction.create({
      worker: worker._id,
      company: companyId,
      amount,
      balanceAfter: worker.walletBalance,
      type: WALLET_TRANSACTION_TYPE.MANUAL_REWARD,
      createdBy: req.user._id,
      note: note || "Manual worker reward",
    });

    res.json({ worker: presentUser(worker), transaction });
  } catch (error) {
    next(error);
  }
}

async function updateUpi(req, res, next) {
  try {
    const { upiId } = req.body;

    if (!upiId) {
      throw new HttpError(400, "UPI ID is required");
    }

    const workerBefore = await User.findById(req.user._id);

    const worker = await User.findByIdAndUpdate(
      req.user._id,
      { upiId },
      { new: true }
    );

    if (!worker) {
      throw new HttpError(404, "User not found");
    }

    if (workerBefore) {
      await logAudit(req, 'UPI_UPDATED', worker._id, worker.company, { upiId: workerBefore.upiId }, { upiId: worker.upiId });
    }

    res.json({ upiId: worker.upiId });
  } catch (error) {
    next(error);
  }
}

async function listWithdrawals(req, res, next) {
  try {
    const filter = {};

    if (req.user.role === ROLES.WORKER) {
      filter.worker = req.user._id;
    } else if (req.user.role !== ROLES.SUPER_ADMIN) {
      const companyId = req.user.company;
      if (!companyId) {
        throw new HttpError(400, "Company association is required");
      }
      filter.company = companyId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const withdrawals = await WithdrawalRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate("worker", "name phone profilePhoto")
      .populate("company", "name");

    res.json({ withdrawals });
  } catch (error) {
    next(error);
  }
}

async function approveWithdrawal(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { withdrawalId } = req.params;
    const idempotencyKey = req.headers['idempotency-key'];
    const companyId = req.user.company;

    if (!companyId) {
      throw new HttpError(400, "Company association is required");
    }

    assertObjectId(withdrawalId, "Withdrawal id");

    if (idempotencyKey) {
      const existing = await checkIdempotency(idempotencyKey, req.user._id, `/withdrawals/${withdrawalId}/approve`);
      if (existing) {
        await session.abortTransaction();
        session.endSession();
        return res.status(existing.statusCode).json(existing.response);
      }
    }

    const withdrawal = await WithdrawalRequest.findOne({
      _id: withdrawalId,
      company: companyId,
      status: WITHDRAWAL_STATUS.PENDING,
    }).session(session);

    if (!withdrawal) {
      throw new HttpError(404, "Pending withdrawal request not found");
    }

    const worker = await User.findById(withdrawal.worker).session(session);

    if (!worker) {
      throw new HttpError(404, "Worker not found");
    }

    const beforeState = { pendingWithdrawalBalance: worker.pendingWithdrawalBalance, walletBalance: worker.walletBalance };

    if (worker.pendingWithdrawalBalance < withdrawal.amount) {
      // In case of inconsistency, fix it gracefully
      worker.pendingWithdrawalBalance = withdrawal.amount;
    }

    worker.pendingWithdrawalBalance -= withdrawal.amount;
    await worker.save({ session });

    withdrawal.status = WITHDRAWAL_STATUS.APPROVED;
    withdrawal.reviewedBy = req.user._id;
    withdrawal.reviewedAt = new Date();
    await withdrawal.save({ session });

    const transaction = await WalletTransaction.create([{
      worker: worker._id,
      company: companyId,
      amount: withdrawal.amount,
      balanceAfter: worker.walletBalance,
      type: WALLET_TRANSACTION_TYPE.WITHDRAWAL_DEBIT,
      withdrawal: withdrawal._id,
      createdBy: req.user._id,
      note: "Withdrawal approved",
    }], { session });

    const response = { withdrawal, transaction: transaction[0] };

    await logAudit(req, 'WITHDRAW_APPROVED', worker._id, companyId, beforeState, { pendingWithdrawalBalance: worker.pendingWithdrawalBalance, walletBalance: worker.walletBalance }, session);
    await saveIdempotency(idempotencyKey, req.user._id, `/withdrawals/${withdrawalId}/approve`, 200, response);

    await session.commitTransaction();
    session.endSession();
    res.json(response);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
}

async function markWithdrawalPaid(req, res, next) {
  try {
    const { withdrawalId } = req.params;
    const companyId = req.user.company;

    if (!companyId) {
      throw new HttpError(400, "Company association is required");
    }

    assertObjectId(withdrawalId, "Withdrawal id");

    const withdrawal = await WithdrawalRequest.findOne({
      _id: withdrawalId,
      company: companyId,
      status: WITHDRAWAL_STATUS.APPROVED,
    });

    if (!withdrawal) {
      throw new HttpError(404, "Approved withdrawal request not found");
    }

    withdrawal.status = WITHDRAWAL_STATUS.PAID;
    withdrawal.paidAt = new Date();
    await withdrawal.save();

    res.json({ withdrawal });
  } catch (error) {
    next(error);
  }
}

async function rejectWithdrawal(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { withdrawalId } = req.params;
    const { rejectionReason } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];
    const companyId = req.user.company;

    if (!companyId) {
      throw new HttpError(400, "Company association is required");
    }

    assertObjectId(withdrawalId, "Withdrawal id");

    if (idempotencyKey) {
      const existing = await checkIdempotency(idempotencyKey, req.user._id, `/withdrawals/${withdrawalId}/reject`);
      if (existing) {
        await session.abortTransaction();
        session.endSession();
        return res.status(existing.statusCode).json(existing.response);
      }
    }

    const withdrawal = await WithdrawalRequest.findOne({
      _id: withdrawalId,
      company: companyId,
      status: WITHDRAWAL_STATUS.PENDING,
    }).session(session);

    if (!withdrawal) {
      throw new HttpError(404, "Pending withdrawal request not found");
    }

    const worker = await User.findById(withdrawal.worker).session(session);
    let beforeState = null;
    let afterState = null;

    if (worker) {
      beforeState = { pendingWithdrawalBalance: worker.pendingWithdrawalBalance, walletBalance: worker.walletBalance };
      worker.pendingWithdrawalBalance = Math.max(0, (worker.pendingWithdrawalBalance || 0) - withdrawal.amount);
      worker.walletBalance += withdrawal.amount;
      await worker.save({ session });
      afterState = { pendingWithdrawalBalance: worker.pendingWithdrawalBalance, walletBalance: worker.walletBalance };
    }

    withdrawal.status = WITHDRAWAL_STATUS.REJECTED;
    withdrawal.reviewedBy = req.user._id;
    withdrawal.reviewedAt = new Date();
    withdrawal.rejectionReason = rejectionReason;
    await withdrawal.save({ session });

    const response = { withdrawal };

    if (worker) {
      await logAudit(req, 'WITHDRAW_REJECTED', worker._id, companyId, beforeState, afterState, session);
    }
    await saveIdempotency(idempotencyKey, req.user._id, `/withdrawals/${withdrawalId}/reject`, 200, response);

    await session.commitTransaction();
    session.endSession();
    res.json(response);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
}

async function getWalletBreakdown(req, res, next) {
  try {
    const workerId = req.user._id;

    // Get all wallet transactions for this worker, grouped by company
    const transactions = await WalletTransaction.find({
      worker: workerId,
      type: WALLET_TRANSACTION_TYPE.BARCODE_REWARD,
    }).populate("company", "_id name");

    if (!transactions || transactions.length === 0) {
      return res.json({ companies: [] });
    }

    // Calculate balance per company
    const companyBalances = {};
    transactions.forEach((transaction) => {
      if (!transaction.company) return; // Skip if company is not populated
      
      const companyId = transaction.company._id.toString();
      if (!companyBalances[companyId]) {
        companyBalances[companyId] = {
          _id: transaction.company._id,
          name: transaction.company.name,
          balance: 0,
        };
      }
      companyBalances[companyId].balance += transaction.amount;
    });

    const companies = Object.values(companyBalances).sort((a, b) => b.balance - a.balance);

    res.json({ companies });
  } catch (error) {
    next(error);
  }
}

async function getCompanyDashboardStats(req, res, next) {
  try {
    const companyId = req.user.company;
    if (!companyId) {
      throw new HttpError(403, "Company context missing");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      company,
      totalWorkers,
      activeWorkers,
      pendingWithdrawals,
      qrBatchCount,
      rewardsData
    ] = await Promise.all([
      Company.findById(companyId).select('name logoUrl'),
      User.countDocuments({ company: companyId, role: ROLES.WORKER }),
      User.countDocuments({ company: companyId, role: ROLES.WORKER, isActive: true }),
      WithdrawalRequest.countDocuments({ company: companyId, status: WITHDRAWAL_STATUS.PENDING }),
      BarcodeBatch.countDocuments({ company: companyId }),
      WalletTransaction.aggregate([
        { $match: { company: companyId, type: WALLET_TRANSACTION_TYPE.BARCODE_REWARD, status: "SUCCESS" } },
        { 
          $group: { 
            _id: null,
            total: { $sum: "$amount" },
            today: { $sum: { $cond: [{ $gte: ["$createdAt", today] }, "$amount", 0] } },
            thisWeek: { $sum: { $cond: [{ $gte: ["$createdAt", startOfWeek] }, "$amount", 0] } },
            thisMonth: { $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$amount", 0] } }
          }
        }
      ])
    ]);

    const rewards = rewardsData[0] || { total: 0, today: 0, thisWeek: 0, thisMonth: 0 };

    res.json({
      company: {
        id: company._id,
        name: company.name,
        logo: company.logoUrl || null
      },
      stats: {
        totalWorkers,
        activeWorkers,
        pendingWithdrawals,
        qrBatchCount,
        rewardsDistributed: rewards.total,
        todayRewards: rewards.today,
        thisWeekRewards: rewards.thisWeek,
        thisMonthRewards: rewards.thisMonth
      },
      trends: {
        workers: "+5%",
        withdrawals: "-2%",
        rewards: "+12%",
        batches: "+1%"
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getCompanyRecentActivity(req, res, next) {
  try {
    const companyId = req.user.company;
    if (!companyId) {
      throw new HttpError(403, "Company context missing");
    }

    let { page = 1, limit = 20 } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    
    // Use parallel aggregations instead of $unionWith to preserve indexes on company+createdAt
    const [transactions, withdrawals] = await Promise.all([
      WalletTransaction.find({ company: companyId })
        .sort({ createdAt: -1 })
        .limit(page * limit)
        .populate("worker", "name profilePhoto")
        .populate("barcode", "batch")
        .lean(),
      WithdrawalRequest.find({ company: companyId })
        .sort({ createdAt: -1 })
        .limit(page * limit)
        .populate("worker", "name profilePhoto")
        .lean()
    ]);
    
    const batchIds = [...new Set(transactions.map(t => t.barcode?.batch).filter(Boolean))];
    const batches = await BarcodeBatch.find({ _id: { $in: batchIds } }).select("batchName").lean();
    const batchMap = batches.reduce((acc, b) => ({ ...acc, [b._id.toString()]: b }), {});

    const formattedTransactions = transactions.map(t => {
      let typeStr = 'QR_SCAN';
      if (t.type === WALLET_TRANSACTION_TYPE.BARCODE_REWARD) typeStr = 'REWARD_DISTRIBUTED';
      
      return {
        id: t._id.toString(),
        type: typeStr,
        worker: t.worker?.name,
        workerAvatar: t.worker?.profilePhoto || null,
        amount: `+₹${t.amount}`,
        batch: t.barcode?.batch ? `Batch: ${batchMap[t.barcode.batch.toString()]?.batchName || 'Unknown'}` : null,
        timestamp: t.createdAt,
        status: t.status,
        company: t.company
      };
    });

    const formattedWithdrawals = withdrawals.map(w => ({
      id: w._id.toString(),
      type: 'WITHDRAW_REQUEST',
      worker: w.worker?.name,
      workerAvatar: w.worker?.profilePhoto || null,
      amount: `₹${w.amount}`,
      batch: `UPI: ${w.upiId}`,
      timestamp: w.createdAt,
      status: w.status,
      company: w.company
    }));

    let allItems = [...formattedTransactions, ...formattedWithdrawals];
    allItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const startIndex = (page - 1) * limit;
    const paginatedItems = allItems.slice(startIndex, startIndex + limit);

    const totalTransactions = await WalletTransaction.countDocuments({ company: companyId });
    const totalWithdrawals = await WithdrawalRequest.countDocuments({ company: companyId });
    const total = totalTransactions + totalWithdrawals;

    res.json({
      items: paginatedItems,
      page,
      limit,
      total,
      hasNextPage: startIndex + limit < total
    });
  } catch (error) {
    next(error);
  }
}
async function getBarcodeBatchDetails(req, res, next) {
  try {
    const { id } = req.params;
    const companyId = req.user.company;
    if (!companyId) throw new HttpError(400, "Company association is required");
    assertObjectId(id, "Barcode batch id");

    const batch = await BarcodeBatch.findOne({ _id: id, company: companyId }).populate("company", "name").lean();
    if (!batch) throw new HttpError(404, "Barcode batch not found");

    res.json(presentBarcodeBatch(batch));
  } catch (error) {
    next(error);
  }
}

async function updateBarcodeBatch(req, res, next) {
  try {
    const { id } = req.params;
    const { productName, expiresAt } = req.body;
    const companyId = req.user.company;
    if (!companyId) throw new HttpError(400, "Company association is required");
    assertObjectId(id, "Barcode batch id");

    const batch = await BarcodeBatch.findOne({ _id: id, company: companyId });
    if (!batch) throw new HttpError(404, "Barcode batch not found");

    if (productName) batch.productName = productName;
    if (expiresAt !== undefined) batch.expiresAt = expiresAt;

    await batch.save();
    await logAudit(companyId, req.user._id, "BARCODE_BATCH_UPDATED", { batchId: batch._id });

    res.json(presentBarcodeBatch(batch));
  } catch (error) {
    next(error);
  }
}

async function deleteBarcodeBatch(req, res, next) {
  try {
    const { id } = req.params;
    const companyId = req.user.company;
    if (!companyId) throw new HttpError(400, "Company association is required");
    assertObjectId(id, "Barcode batch id");

    const batch = await BarcodeBatch.findOne({ _id: id, company: companyId });
    if (!batch) throw new HttpError(404, "Barcode batch not found");

    if (batch.redeemedCount > 0) {
      throw new HttpError(409, "Cannot delete a batch that has redeemed QR codes");
    }

    await Barcode.deleteMany({ batch: batch._id });
    await BarcodeBatch.deleteOne({ _id: batch._id });
    
    await logAudit(companyId, req.user._id, "BARCODE_BATCH_DELETED", { batchId: id, qrBatchId: batch.batchId });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function duplicateBarcodeBatch(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const companyId = req.user.company;
    if (!companyId) throw new HttpError(400, "Company association is required");
    assertObjectId(id, "Barcode batch id");

    const oldBatch = await BarcodeBatch.findOne({ _id: id, company: companyId }).session(session);
    if (!oldBatch) throw new HttpError(404, "Barcode batch not found");

    const newBatchId = generateBatchId();

    const batch = await BarcodeBatch.create([{
      company: companyId,
      batchId: newBatchId,
      productName: `${oldBatch.productName} (Copy)`,
      rewardAmount: oldBatch.rewardAmount,
      quantity: oldBatch.quantity,
      expiresAt: oldBatch.expiresAt,
      status: BARCODE_BATCH_STATUS.ACTIVE,
      createdBy: req.user._id,
    }], { session });

    const newBatch = batch[0];

    const codes = new Set();
    while (codes.size < newBatch.quantity) {
      codes.add(generateBarcodeCode(companyId));
    }

    const barcodeDocuments = [...codes].map((code) => ({
      code,
      company: companyId,
      batch: newBatch._id,
      rewardAmount: newBatch.rewardAmount,
      expiresAt: newBatch.expiresAt,
    }));

    await Barcode.insertMany(barcodeDocuments, { session });

    newBatch.generatedCount = newBatch.quantity;
    await newBatch.save({ session });

    await logAudit(companyId, req.user._id, "BARCODE_BATCH_DUPLICATED", {
      originalBatchId: oldBatch._id,
      newBatchId: newBatch._id,
      qrBatchId: newBatch.batchId,
    });

    await session.commitTransaction();
    res.status(201).json(presentBarcodeBatch(newBatch));
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

async function getWorkerDetails(req, res, next) {
  try {
    const { id } = req.params;
    assertObjectId(id, "Worker id");

    const worker = await User.findOne({
      _id: id,
      company: req.user.company,
      role: ROLES.WORKER,
    }).lean();

    if (!worker) {
      throw new HttpError(404, "Worker not found");
    }

    const [walletTxAgg, pendingWithdrawals, barcodeStats] = await Promise.all([
      WalletTransaction.aggregate([
        {
          $match: {
            worker: worker._id,
            company: mongoose.Types.ObjectId(req.user.company),
            status: WALLET_TRANSACTION_STATUS.SUCCESS,
          },
        },
        {
          $group: {
            _id: null,
            lifetimeRewards: {
              $sum: {
                $cond: [{ $in: ["$type", REWARD_TRANSACTION_TYPES] }, "$amount", 0],
              },
            },
            credits: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$type",
                      [...REWARD_TRANSACTION_TYPES, WALLET_TRANSACTION_TYPE.WITHDRAWAL_REVERSAL],
                    ],
                  },
                  "$amount",
                  0,
                ],
              },
            },
            debits: {
              $sum: {
                $cond: [{ $eq: ["$type", WALLET_TRANSACTION_TYPE.WITHDRAWAL_DEBIT] }, "$amount", 0],
              },
            },
          },
        },
      ]),
      WithdrawalRequest.aggregate([
        {
          $match: {
            worker: worker._id,
            company: mongoose.Types.ObjectId(req.user.company),
            status: WITHDRAWAL_STATUS.PENDING,
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Barcode.aggregate([
        {
          $match: {
            redeemedBy: worker._id,
            company: mongoose.Types.ObjectId(req.user.company),
            status: BARCODE_STATUS.REDEEMED,
          },
        },
        { $group: { _id: null, count: { $sum: 1 }, lastScan: { $max: "$redeemedAt" } } },
      ]),
    ]);

    const txStats = walletTxAgg[0] || { lifetimeRewards: 0, credits: 0, debits: 0 };
    const walletBalance = txStats.credits - txStats.debits;
    const pendingWithdrawal = pendingWithdrawals[0]?.total || 0;
    const qrStats = barcodeStats[0] || { count: 0, lastScan: null };

    res.json({
      success: true,
      data: {
        worker: {
          id: worker._id,
          workerId: worker.workerId || worker._id.toString().slice(-6).toUpperCase(),
          name: worker.name,
          phone: worker.phone,
          profilePhoto: worker.profilePhoto || null,
          verificationStatus: worker.isVerified ? "VERIFIED" : "PENDING",
          status: worker.isActive ? "ACTIVE" : "INACTIVE",
        },
        companyMetrics: {
          walletBalance: Math.max(0, walletBalance),
          pendingWithdrawal,
          lifetimeRewards: txStats.lifetimeRewards,
          totalQrRedeemed: qrStats.count,
          joinedDate: worker.createdAt,
          department: worker.department || "General",
          lastScan: qrStats.lastScan,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getWorkerRewardHistory(req, res, next) {
  try {
    const { id } = req.params;
    assertObjectId(id, "Worker id");

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {
      worker: id,
      company: req.user.company,
      type: { $in: REWARD_TRANSACTION_TYPES },
    };

    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("barcode", "code rewardAmount")
        .lean(),
      WalletTransaction.countDocuments(query),
    ]);

    const formattedTransactions = transactions.map((tx) => ({
      id: tx._id,
      amount: tx.amount,
      product: tx.barcode?.rewardAmount ? `Reward (${tx.barcode.rewardAmount})` : "Manual Reward",
      batchName: tx.barcode?.code || "N/A",
      rewardType: tx.type,
      date: tx.createdAt,
      status: tx.status,
    }));

    res.json({
      success: true,
      data: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + transactions.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getWorkerWithdrawalHistory(req, res, next) {
  try {
    const { id } = req.params;
    assertObjectId(id, "Worker id");

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {
      worker: id,
      company: req.user.company,
    };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const [withdrawals, total] = await Promise.all([
      WithdrawalRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WithdrawalRequest.countDocuments(query),
    ]);

    const formattedWithdrawals = withdrawals.map((w) => ({
      id: w._id,
      amount: w.amount,
      requestedAt: w.createdAt,
      approvedAt: w.reviewedAt || null,
      status: w.status,
    }));

    res.json({
      success: true,
      data: formattedWithdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + withdrawals.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getWorkerQRActivity(req, res, next) {
  try {
    const { id } = req.params;
    assertObjectId(id, "Worker id");

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {
      redeemedBy: id,
      company: req.user.company,
    };

    if (req.query.startDate && req.query.endDate) {
      query.redeemedAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const [barcodes, total] = await Promise.all([
      Barcode.find(query)
        .sort({ redeemedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("batch", "productName")
        .lean(),
      Barcode.countDocuments(query),
    ]);

    const formattedData = barcodes.map((b) => ({
      id: b._id,
      batchId: b.batch?._id,
      batchName: b.batch?.productName || "Unknown Product",
      rewardAmount: b.rewardAmount,
      barcode: b.code,
      redeemedAt: b.redeemedAt,
      status: b.status,
    }));

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + barcodes.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBarcodeBatch,
  listBarcodeBatches,
  downloadBarcodeBatchPdf,
  getBarcodeBatchDetails,
  updateBarcodeBatch,
  deleteBarcodeBatch,
  duplicateBarcodeBatch,
  scanBarcode,
  getWallet,
  getWalletBreakdown,
  requestWithdrawal,
  listCompanyWorkers,
  listCompanyBarcodes,
  manualWorkerReward,
  updateUpi,
  listWithdrawals,
  approveWithdrawal,
  markWithdrawalPaid,
  rejectWithdrawal,
  getCompanyDashboardStats,
  getCompanyRecentActivity,
  getWorkerDetails,
  getWorkerRewardHistory,
  getWorkerWithdrawalHistory,
  getWorkerQRActivity,
};
