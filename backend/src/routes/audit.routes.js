const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");
const auditController = require("../controllers/audit.controller");

// Require authentication for all audit routes
router.use(protect);

// Only SUPER_ADMIN can view global audit logs
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.get("/global", auditController.getGlobalAuditLogs);
router.get("/timeline", auditController.getAuditTimeline);

module.exports = router;
