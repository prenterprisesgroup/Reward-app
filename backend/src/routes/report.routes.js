const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");
const reportController = require("../controllers/report.controller");

// Require authentication for all report routes
router.use(protect);

// Only SUPER_ADMIN can trigger and view these core platform reports
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.post("/generate", reportController.generateReport);
router.get("/history", reportController.getHistory);
router.get("/:id", reportController.getReportById);
router.get("/:id/download", reportController.downloadReport);

module.exports = router;
