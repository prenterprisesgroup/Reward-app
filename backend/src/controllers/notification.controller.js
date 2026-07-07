const NotificationService = require("../services/notification.service");
const NotificationTemplate = require("../models/notification-template.model");
const NotificationLog = require("../models/notification-log.model");
const User = require("../models/user.model");
const QueueService = require("../services/queue.service");
const HttpError = require("../utils/http-error");
const { logAudit } = require("../utils/audit");
const { escapeRegex } = require("../utils/validation");

// Helper for generic send
async function dispatchNotification(req, res, next, channel) {
  try {
    const { recipientId, templateId, variables = {} } = req.body;

    if (!recipientId || !templateId) {
      throw new HttpError(400, "recipientId and templateId are required");
    }

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) throw new HttpError(404, "Recipient not found");

    // Dispatch to BullMQ via QueueService
    const job = await QueueService.dispatchNotificationJob(recipientUser._id, templateId, variables);

    // Audit Logging
    await logAudit(
      req,
      "NOTIFICATION_QUEUED",
      recipientUser._id,
      recipientUser.company,
      null,
      { channel, templateId, jobId: job.id }
    );

    res.status(202).json({
      success: true,
      message: "Notification queued successfully",
      data: { jobId: job.id },
      meta: { generatedAt: new Date() }
    });
  } catch (error) {
    if (req.body.recipientId) {
       await logAudit(
        req,
        "NOTIFICATION_FAILED",
        req.body.recipientId,
        null,
        null,
        { channel, templateId: req.body.templateId, error: error.message }
      );
    }
    next(error);
  }
}

async function sendEmail(req, res, next) {
  return dispatchNotification(req, res, next, "EMAIL");
}

async function sendSMS(req, res, next) {
  return dispatchNotification(req, res, next, "SMS");
}

async function sendPush(req, res, next) {
  return dispatchNotification(req, res, next, "PUSH");
}

async function getHistory(req, res, next) {
  try {
    const { status, channel, recipient, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (channel) filter.channel = channel;
    if (recipient) filter.recipient = recipient;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skipNum = (pageNum - 1) * limitNum;

    const [logs, totalItems] = await Promise.all([
      NotificationLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .populate("recipient", "name email phone")
        .populate("template", "name subject")
        .lean(),
      NotificationLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: logs,
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

async function getTemplates(req, res, next) {
  try {
    const { status, type, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) filter.name = new RegExp(escapeRegex(search), "i");

    const templates = await NotificationTemplate.find(filter).lean();

    res.json({
      success: true,
      data: templates,
      meta: { generatedAt: new Date() }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendEmail,
  sendSMS,
  sendPush,
  getHistory,
  getTemplates
};
