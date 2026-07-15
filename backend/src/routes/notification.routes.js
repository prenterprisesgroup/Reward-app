const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { query, param, body } = require("express-validator");
const { ROLES } = require("../constants/roles");
const notificationController = require("../controllers/notification.controller");

// Validation Rules
const getNotificationsRules = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("category").optional().isIn(["ALL", "SYSTEM", "REWARD", "PAYMENT", "QR", "COMPANY", "USER", "SECURITY", "ANNOUNCEMENT"]).withMessage("Invalid category filter"),
  query("isRead").optional().isBoolean().withMessage("isRead must be true or false")
];

const idParamRules = [
  param("id").isMongoId().withMessage("Invalid notification ID format")
];

// Require authentication for all notification routes
router.use(protect);

// ---- IN-APP NOTIFICATIONS (All Users) ----
router.get("/", getNotificationsRules, validate, notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", idParamRules, validate, notificationController.markAsRead);
router.delete("/:id", idParamRules, validate, notificationController.deleteNotification);

// ---- EXTERNAL NOTIFICATION DISPATCH (Super Admin Only) ----
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.post("/email", notificationController.sendEmail);
router.post("/sms", notificationController.sendSMS);
router.post("/push", notificationController.sendPush);

router.get("/history", notificationController.getHistory);
router.get("/templates", notificationController.getTemplates);

module.exports = router;
