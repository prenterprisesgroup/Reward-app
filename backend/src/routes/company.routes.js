const express = require('express');
const {
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  updateCompanySettings,
} = require('../controllers/company.controller');
const { protect, authorizeRoles } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { ROLES } = require('../constants/roles');
const { profileLimiter } = require('../middleware/rate-limiter');

const router = express.Router();

router.use(protect);
// These routes are strictly for COMPANY_ADMIN to manage their own company
router.use(authorizeRoles(ROLES.COMPANY_ADMIN));

router.get('/me', getCompanyProfile);
router.patch('/me', updateCompanyProfile);
router.post('/me/logo', profileLimiter, upload.single('logo'), uploadCompanyLogo);
router.patch('/settings', updateCompanySettings);

module.exports = router;
