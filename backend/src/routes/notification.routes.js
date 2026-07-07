const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");
const notificationController = require("../controllers/notification.controller");

// Require authentication for all notification routes
router.use(protect);

// Only SUPER_ADMIN can send/view global notifications for now
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.post("/email", notificationController.sendEmail);
router.post("/sms", notificationController.sendSMS);
router.post("/push", notificationController.sendPush);

router.get("/history", notificationController.getHistory);
router.get("/templates", notificationController.getTemplates);

module.exports = router;
