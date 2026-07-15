const NotificationService = require("../services/notification.service");
const HttpError = require("../utils/http-error");
const { logAudit } = require("../services/audit.service");

async function getNotifications(req, res, next) {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const category = req.query.category ? req.query.category.toUpperCase() : null;
    
    let isRead = null;
    if (req.query.isRead === 'true') isRead = true;
    if (req.query.isRead === 'false') isRead = false;

    const { data, totalItems, unreadCount } = await NotificationService.getNotifications(userId, page, limit, category, isRead);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      meta: {
        unreadCount,
        pollingInterval: 15000,
        lastUpdated: new Date().toISOString(),
      }
    });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await NotificationService.markAsRead(userId, id);

    if (!notification) {
      throw new HttpError(404, "Notification not found");
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user._id;
    
    const result = await NotificationService.markAllAsRead(userId);

    await logAudit(req, 'NOTIFICATIONS_MARKED_READ_ALL', userId, req.user.company, {}, { modifiedCount: result.modifiedCount });

    res.json({ success: true, message: `Marked ${result.modifiedCount} notifications as read` });
  } catch (error) {
    next(error);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await NotificationService.softDelete(userId, id);

    if (!notification) {
      throw new HttpError(404, "Notification not found");
    }

    await logAudit(req, 'NOTIFICATION_DELETED', userId, req.user.company, {}, { notificationId: id });

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  // External dispatch
  sendEmail: async (req, res, next) => {
    try {
      const { recipientId, templateId, variables } = req.body;
      const user = await require("../models/user.model").findById(recipientId);
      if (!user) throw new HttpError(404, "User not found");
      const log = await NotificationService.sendEmail(user, templateId, variables);
      res.json({ success: true, data: log });
    } catch (error) { next(error); }
  },
  sendSMS: async (req, res, next) => {
    try {
      const { recipientId, templateId, variables } = req.body;
      const user = await require("../models/user.model").findById(recipientId);
      if (!user) throw new HttpError(404, "User not found");
      const log = await NotificationService.sendSMS(user, templateId, variables);
      res.json({ success: true, data: log });
    } catch (error) { next(error); }
  },
  sendPush: async (req, res, next) => {
    try {
      const { recipientId, templateId, variables } = req.body;
      const user = await require("../models/user.model").findById(recipientId);
      if (!user) throw new HttpError(404, "User not found");
      const log = await NotificationService.sendPush(user, templateId, variables);
      res.json({ success: true, data: log });
    } catch (error) { next(error); }
  },
  getHistory: async (req, res, next) => { res.json({ success: true, data: [] }); }, // Stub
  getTemplates: async (req, res, next) => { res.json({ success: true, data: [] }); } // Stub
};
