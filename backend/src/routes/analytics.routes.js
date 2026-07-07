const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const analyticsController = require('../controllers/analytics.controller');

// Require authentication for all analytics routes
router.use(protect);

// Only SUPER_ADMIN can access global analytics
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.get('/overview', analyticsController.getOverview);
router.get('/trends', analyticsController.getTrends);
router.get('/growth', analyticsController.getGrowth);
router.get('/dashboard', analyticsController.getDashboardSummary);
router.get('/activity', analyticsController.getRecentActivity);
router.get('/top-companies', analyticsController.getTopCompanies);

module.exports = router;
