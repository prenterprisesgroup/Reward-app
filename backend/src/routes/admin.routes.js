const express = require("express");
const { approveWithdrawal, rejectWithdrawal } = require("../controllers/system.controller");
const { approveWithdrawalValidation, rejectWithdrawalValidation } = require("../validators/system.validator");
const { validate } = require("../middleware/validate");

const {
  createCompany,
  createCompanyAdmin,
  getCompanyStats,
  getCompany,
  updateCompany,
  listCompanies,
  approveCompany,
  rejectCompany,
  suspendCompany,
  getCompanyActivity,
  getCompanyWorkers,
} = require("../controllers/admin-company.controller");
const {
  listBarcodeBatches,
  listBarcodeScans,
} = require("../controllers/admin-qr.controller");
const { ROLES } = require("../constants/roles");
const { authorizeRoles, protect } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.route("/companies").get(listCompanies).post(upload.single('logo'), createCompany);
router.route("/companies/stats").get(getCompanyStats);
router.route("/companies/:id").get(getCompany).put(upload.single("logo"), updateCompany);
router.route("/companies/:id/approve").post(approveCompany);
router.route("/companies/:id/reject").post(rejectCompany);
router.route("/companies/:id/suspend").post(suspendCompany);
router.route("/companies/:companyId/admins").post(createCompanyAdmin);
router.route("/companies/:id/activity").get(getCompanyActivity);
router.route("/companies/:id/workers").get(getCompanyWorkers);

router.route("/qr-batches").get(listBarcodeBatches);
router.route("/qr-scans").get(listBarcodeScans);


router.route("/withdrawals/:withdrawalId/approve").post(approveWithdrawalValidation, validate, approveWithdrawal);
router.route("/withdrawals/:withdrawalId/reject").post(rejectWithdrawalValidation, validate, rejectWithdrawal);

module.exports = router;
