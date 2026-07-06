const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");
const { getDashboardSummary, getGlobalRecentActivity } = require("../controllers/analytics.controller");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));
router.get("/dashboard", getDashboardSummary);
router.get("/activity", getGlobalRecentActivity);

module.exports = router;
