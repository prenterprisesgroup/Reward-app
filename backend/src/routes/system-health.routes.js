const express = require("express");
const router = express.Router();
const systemHealthController = require("../controllers/system-health.controller");
const { protect, authorizeRoles } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");

// Require authentication and SUPER_ADMIN for all deep system metrics
router.use(protect);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.get("/deep", systemHealthController.getDeepHealth);
router.get("/queues", systemHealthController.getSystemQueues);
router.get("/metrics", systemHealthController.getSystemMetrics);

module.exports = router;
