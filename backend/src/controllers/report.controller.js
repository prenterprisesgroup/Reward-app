const fs = require("fs");
const path = require("path");
const ReportJob = require("../models/report-job.model");
const QueueService = require("../services/queue.service");
const HttpError = require("../utils/http-error");
const { logAudit } = require("../utils/audit");

async function generateReport(req, res, next) {
  try {
    const { reportType, format, filters = {} } = req.body;

    if (!reportType || !format) {
      throw new HttpError(400, "reportType and format are required");
    }

    const validTypes = ["COMPANIES", "WORKERS", "WITHDRAWALS", "TRANSACTIONS", "QR_BATCHES", "AUDIT_LOGS"];
    const validFormats = ["CSV", "EXCEL", "PDF"];

    if (!validTypes.includes(reportType)) {
      throw new HttpError(400, "Invalid reportType");
    }
    if (!validFormats.includes(format)) {
      throw new HttpError(400, "Invalid format");
    }

    const job = await ReportJob.create({
      reportType,
      format,
      filters,
      requestedBy: req.user._id,
      status: "PENDING"
    });

    // Fire and forget (Asynchronous generation)
    // Dispatch to BullMQ via QueueService
    QueueService.dispatchReportJob(job._id, reportType, filters, format).catch(err => {
      console.error(`QueueService failed to dispatch job ${job._id}:`, err);
    });

    await logAudit(
      req,
      "REPORT_GENERATED",
      req.user._id,
      null,
      null,
      { jobId: job._id, reportType, format }
    );

    res.status(202).json({
      success: true,
      message: "Report generation started",
      data: { jobId: job._id },
      meta: { generatedAt: new Date() }
    });
  } catch (error) {
    next(error);
  }
}

async function getHistory(req, res, next) {
  try {
    const { page = 1, limit = 10, status, reportType } = req.query;
    
    const filter = { requestedBy: req.user._id };
    if (status) filter.status = status;
    if (reportType) filter.reportType = reportType;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;

    const [jobs, totalItems] = await Promise.all([
      ReportJob.find(filter)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .lean(),
      ReportJob.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
      },
      meta: { generatedAt: new Date() }
    });
  } catch (error) {
    next(error);
  }
}

async function getReportById(req, res, next) {
  try {
    const { id } = req.params;
    const job = await ReportJob.findOne({ _id: id, requestedBy: req.user._id }).lean();
    
    if (!job) {
      throw new HttpError(404, "Report job not found");
    }

    res.json({
      success: true,
      data: job,
      meta: { generatedAt: new Date() }
    });
  } catch (error) {
    next(error);
  }
}

async function downloadReport(req, res, next) {
  try {
    const { id } = req.params;
    const job = await ReportJob.findOne({ _id: id, requestedBy: req.user._id });
    
    if (!job) {
      throw new HttpError(404, "Report job not found");
    }

    if (job.status !== "COMPLETED" || !job.generatedFile) {
      throw new HttpError(400, "Report is not ready for download");
    }

    if (!fs.existsSync(job.generatedFile)) {
      throw new HttpError(404, "Report file expired or deleted from disk");
    }

    await logAudit(
      req,
      "REPORT_DOWNLOADED",
      req.user._id,
      null,
      null,
      { jobId: job._id, reportType: job.reportType }
    );

    res.download(job.generatedFile); // Streams the file to client securely
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateReport,
  getHistory,
  getReportById,
  downloadReport
};
