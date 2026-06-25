const crypto = require("crypto");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

const presentUser = require("../utils/user-presenter");
const { Barcode, BarcodeBatch, User, WalletTransaction, WithdrawalRequest, Company } = require("../models");
const HttpError = require("../utils/http-error");
const {
  BARCODE_BATCH_STATUS,
  BARCODE_STATUS,
  WALLET_TRANSACTION_TYPE,
  WITHDRAWAL_STATUS,
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

    const batch = await BarcodeBatch.create({
      company: companyId,
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

    res.status(201).json({
      batch,
      generatedCount: quantity,
    });
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

    const batches = await BarcodeBatch.find({ company: companyId }).sort({ createdAt: -1 });

    res.json({ batches });
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
  try {
    const { code } = req.body;
    const now = new Date();

    if (!code) {
      throw new HttpError(400, "Barcode code is required");
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
      { new: true }
    );

    if (!barcode) {
      throw new HttpError(400, "Barcode is invalid, expired, or already redeemed");
    }

    const worker = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: barcode.rewardAmount } },
      { new: true }
    );

    const transaction = await WalletTransaction.create({
      worker: worker._id,
      company: barcode.company,
      amount: barcode.rewardAmount,
      balanceAfter: worker.walletBalance,
      type: WALLET_TRANSACTION_TYPE.BARCODE_REWARD,
      barcode: barcode._id,
      createdBy: req.user._id,
      note: "Barcode redeemed",
    });

    // Populate company details
    const company = await Company.findById(barcode.company);

    res.json({
      barcode: {
        ...barcode.toObject(),
        company: {
          _id: company._id,
          name: company.name,
        },
      },
      walletBalance: worker.walletBalance,
      transaction,
    });
  } catch (error) {
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

    res.json({
      walletBalance: worker.walletBalance,
      upiId: worker.upiId,
      transactions,
    });
  } catch (error) {
    next(error);
  }
}

async function requestWithdrawal(req, res, next) {
  try {
    const { amount, upiId, company } = req.body;
    const worker = await User.findById(req.user._id);

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

    if (upiId) {
      worker.upiId = upiId;
      await worker.save();
    }

    const withdrawal = await WithdrawalRequest.create({
      worker: worker._id,
      company: company,
      amount,
      upiId: worker.upiId,
      status: WITHDRAWAL_STATUS.PENDING,
    });

    res.status(201).json({ withdrawal });
  } catch (error) {
    next(error);
  }
}

async function listCompanyWorkers(req, res, next) {
  try {
    const companyId = req.user.company;

    if (!companyId) {
      throw new HttpError(400, "Company association is required");
    }

    const { search } = req.query;
    const filter = {
      company: companyId,
      role: ROLES.WORKER,
    };

    if (search) {
      filter.name = new RegExp(escapeRegex(search), "i");
    }

    const workers = await User.find(filter).sort({ createdAt: -1 });

    res.json({ workers: workers.map(presentUser) });
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

    const worker = await User.findByIdAndUpdate(
      req.user._id,
      { upiId },
      { new: true }
    );

    if (!worker) {
      throw new HttpError(404, "User not found");
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
    } else {
      const companyId = req.user.company;
      if (!companyId) {
        throw new HttpError(400, "Company association is required");
      }
      filter.company = companyId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const withdrawals = await WithdrawalRequest.find(filter).sort({ createdAt: -1 });

    res.json({ withdrawals });
  } catch (error) {
    next(error);
  }
}

async function approveWithdrawal(req, res, next) {
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
      status: WITHDRAWAL_STATUS.PENDING,
    });

    if (!withdrawal) {
      throw new HttpError(404, "Pending withdrawal request not found");
    }

    const worker = await User.findById(withdrawal.worker);

    if (!worker) {
      throw new HttpError(404, "Worker not found");
    }

    if (worker.walletBalance < withdrawal.amount) {
      throw new HttpError(400, "Worker does not have enough balance to approve this withdrawal");
    }

    worker.walletBalance -= withdrawal.amount;
    await worker.save();

    withdrawal.status = WITHDRAWAL_STATUS.APPROVED;
    withdrawal.reviewedBy = req.user._id;
    withdrawal.reviewedAt = new Date();
    await withdrawal.save();

    const transaction = await WalletTransaction.create({
      worker: worker._id,
      company: companyId,
      amount: withdrawal.amount,
      balanceAfter: worker.walletBalance,
      type: WALLET_TRANSACTION_TYPE.WITHDRAWAL_DEBIT,
      withdrawal: withdrawal._id,
      createdBy: req.user._id,
      note: "Withdrawal approved",
    });

    res.json({ withdrawal, transaction });
  } catch (error) {
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
  try {
    const { withdrawalId } = req.params;
    const { rejectionReason } = req.body;
    const companyId = req.user.company;

    if (!companyId) {
      throw new HttpError(400, "Company association is required");
    }

    assertObjectId(withdrawalId, "Withdrawal id");

    const withdrawal = await WithdrawalRequest.findOne({
      _id: withdrawalId,
      company: companyId,
      status: WITHDRAWAL_STATUS.PENDING,
    });

    if (!withdrawal) {
      throw new HttpError(404, "Pending withdrawal request not found");
    }

    withdrawal.status = WITHDRAWAL_STATUS.REJECTED;
    withdrawal.reviewedBy = req.user._id;
    withdrawal.reviewedAt = new Date();
    withdrawal.rejectionReason = rejectionReason;
    await withdrawal.save();

    res.json({ withdrawal });
  } catch (error) {
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

module.exports = {
  createBarcodeBatch,
  listBarcodeBatches,
  downloadBarcodeBatchPdf,
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
};
