const mongoose = require("mongoose");
const BarcodeBatch = require("../models/barcode-batch.model");
const Barcode = require("../models/barcode.model");
const HttpError = require("../utils/http-error");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class QRService {
  /**
   * Generic, reusable service to list QR Batches across the platform.
   * Can be used by Super Admin or scoped down by providing specific filters.
   */
  static async listBatches(filters, pagination) {
    const { companyId, status, search, startDate, endDate } = filters;
    const { page = 1, limit = 10, sort = "-createdAt" } = pagination;

    const query = {};

    if (companyId) {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new HttpError(400, "Invalid company ID");
      }
      query.company = new mongoose.Types.ObjectId(companyId);
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [{ batchId: regex }, { productName: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;

    let sortOption = { createdAt: -1 };
    if (sort === "createdAt") sortOption = { createdAt: 1 };
    if (sort === "rewardAmount") sortOption = { rewardAmount: -1 };

    const pipeline = [
      { $match: query },
      { $sort: sortOption },
      { $skip: skipNum },
      { $limit: limitNum },
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo",
        },
      },
      { $unwind: { path: "$companyInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: "$_id",
          batchId: 1,
          productName: 1,
          rewardAmount: 1,
          quantity: 1,
          generatedCount: 1,
          redeemedCount: 1,
          status: 1,
          createdAt: 1,
          expiresAt: 1,
          company: {
            id: "$companyInfo._id",
            name: "$companyInfo.name",
          },
          _id: 0,
        },
      },
    ];

    const [batches, totalItems] = await Promise.all([
      BarcodeBatch.aggregate(pipeline),
      BarcodeBatch.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    return {
      data: batches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    };
  }

  /**
   * Generic, reusable service to list QR Scans (Redeemed Barcodes) across the platform.
   */
  static async listScans(filters, pagination) {
    const { companyId, workerId, status, search, startDate, endDate } = filters;
    const { page = 1, limit = 10, sort = "-redeemedAt" } = pagination;

    const query = {};

    if (companyId) {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new HttpError(400, "Invalid company ID");
      }
      query.company = new mongoose.Types.ObjectId(companyId);
    }

    if (workerId) {
      if (!mongoose.Types.ObjectId.isValid(workerId)) {
        throw new HttpError(400, "Invalid worker ID");
      }
      query.redeemedBy = new mongoose.Types.ObjectId(workerId);
    }

    // Default to viewing REDEEMED scans if not specified, 
    // but allow overriding for generic usage
    query.status = status || "REDEEMED";

    if (startDate || endDate) {
      query.redeemedAt = {};
      if (startDate) query.redeemedAt.$gte = new Date(startDate);
      if (endDate) query.redeemedAt.$lte = new Date(endDate);
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.code = regex;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;

    let sortOption = { redeemedAt: -1 };
    if (sort === "redeemedAt") sortOption = { redeemedAt: 1 };
    if (sort === "-createdAt") sortOption = { createdAt: -1 };

    const pipeline = [
      { $match: query },
      { $sort: sortOption },
      { $skip: skipNum },
      { $limit: limitNum },
      {
        $lookup: {
          from: "users",
          localField: "redeemedBy",
          foreignField: "_id",
          as: "workerInfo",
        },
      },
      { $unwind: { path: "$workerInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo",
        },
      },
      { $unwind: { path: "$companyInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: "$_id",
          code: 1,
          rewardAmount: 1,
          status: 1,
          redeemedAt: 1,
          createdAt: 1,
          company: {
            id: "$companyInfo._id",
            name: "$companyInfo.name",
          },
          worker: {
            id: "$workerInfo._id",
            name: "$workerInfo.name",
            phone: "$workerInfo.phone",
          },
          _id: 0,
        },
      },
    ];

    const [scans, totalItems] = await Promise.all([
      Barcode.aggregate(pipeline),
      Barcode.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    return {
      data: scans,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    };
  }
}

module.exports = QRService;
