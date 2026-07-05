const express = require("express");

const { ROLES } = require("../constants/roles");
const { protect, authorizeRoles } = require("../middleware/auth");
const {
  createBarcodeBatch,
  listBarcodeBatches,
  downloadBarcodeBatchPdf,
  scanBarcode,
  getWallet,
  getWalletBreakdown,
  requestWithdrawal,
  listWithdrawals,
  approveWithdrawal,
  markWithdrawalPaid,
  rejectWithdrawal,
  updateUpi,
  listCompanyWorkers,
  listCompanyBarcodes,
  getBarcodeBatchDetails,
  updateBarcodeBatch,
  deleteBarcodeBatch,
  duplicateBarcodeBatch,
  getCompanyDashboardStats,
  getCompanyRecentActivity,
  manualWorkerReward,
  getWorkerDetails,
  getWorkerRewardHistory,
  getWorkerWithdrawalHistory,
  getWorkerQRActivity,
} = require("../controllers/system.controller");
const { validate } = require("../middleware/validate");
const { scanLimiter, withdrawLimiter, upiLimiter } = require("../middleware/rate-limiter");
const {
  scanValidation,
  withdrawValidation,
  approveWithdrawalValidation,
  rejectWithdrawalValidation,
  upiValidation,
  createBarcodeBatchValidation,
  updateBarcodeBatchValidation,
  duplicateBarcodeBatchValidation,
  workerIdParamValidation,
  workerHistoryPaginationValidation,
} = require("../validators/system.validator");

const router = express.Router();

router.get("/roles", (req, res) => {
  res.json({
    roles: [
      {
        key: ROLES.SUPER_ADMIN,
        can: [
          "manage_all_companies",
          "view_all_reports",
          "manage_platform_users",
        ],
      },
      {
        key: ROLES.COMPANY_ADMIN,
        can: [
          "manage_own_company",
          "manage_company_staff",
          "create_barcode_batches",
          "download_barcode_pdf",
          "view_company_reports",
          "approve_withdrawals",
          "manual_worker_reward",
        ],
      },
      {
        key: ROLES.COMPANY_STAFF,
        can: [
          "view_company_workers",
          "view_company_barcodes",
          "manual_worker_reward",
        ],
        cannot: [
          "approve_withdrawals",
          "withdraw_for_worker",
          "manage_company_settings",
        ],
      },
      {
        key: ROLES.WORKER,
        can: [
          "scan_barcode",
          "view_wallet",
          "request_withdrawal",
          "manage_own_upi",
        ],
      },
    ],
  });
});

router.use(protect);

router.post(
  "/barcode-batches",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  createBarcodeBatchValidation,
  validate,
  createBarcodeBatch
);
router.get(
  "/barcode-batches",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  listBarcodeBatches
);
router.get(
  "/barcode-batches/:id",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  getBarcodeBatchDetails
);
router.patch(
  "/barcode-batches/:id",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  updateBarcodeBatchValidation,
  validate,
  updateBarcodeBatch
);
router.delete(
  "/barcode-batches/:id",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  deleteBarcodeBatch
);
router.post(
  "/barcode-batches/:id/duplicate",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  duplicateBarcodeBatchValidation,
  validate,
  duplicateBarcodeBatch
);
router.get(
  "/barcode-batches/:batchId/pdf",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  downloadBarcodeBatchPdf
);

router.post("/scan", authorizeRoles(ROLES.WORKER), scanLimiter, scanValidation, validate, scanBarcode);
router.get("/wallet/breakdown", authorizeRoles(ROLES.WORKER), getWalletBreakdown);
router.get("/wallet", authorizeRoles(ROLES.WORKER), getWallet);
router.patch("/wallet/upi", authorizeRoles(ROLES.WORKER), upiLimiter, upiValidation, validate, updateUpi);
router.post("/withdrawals", authorizeRoles(ROLES.WORKER), withdrawLimiter, withdrawValidation, validate, requestWithdrawal);
router.get(
  "/withdrawals",
  authorizeRoles(ROLES.WORKER, ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  listWithdrawals
);
router.post(
  "/withdrawals/:withdrawalId/approve",
  authorizeRoles(ROLES.COMPANY_ADMIN),
  approveWithdrawalValidation,
  validate,
  approveWithdrawal
);
router.post(
  "/withdrawals/:withdrawalId/mark-paid",
  authorizeRoles(ROLES.COMPANY_ADMIN),
  markWithdrawalPaid
);
router.post(
  "/withdrawals/:withdrawalId/reject",
  authorizeRoles(ROLES.COMPANY_ADMIN),
  rejectWithdrawalValidation,
  validate,
  rejectWithdrawal
);

router.get(
  "/workers",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  listCompanyWorkers
);
router.get(
  "/barcodes",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  listCompanyBarcodes
);
router.post(
  "/workers/:workerId/reward",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  manualWorkerReward
);

router.get(
  "/workers/:id",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  workerIdParamValidation,
  validate,
  getWorkerDetails
);

router.get(
  "/workers/:id/rewards",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  workerHistoryPaginationValidation,
  validate,
  getWorkerRewardHistory
);

router.get(
  "/workers/:id/withdrawals",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  workerHistoryPaginationValidation,
  validate,
  getWorkerWithdrawalHistory
);

router.get(
  "/workers/:id/qr-activity",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  workerHistoryPaginationValidation,
  validate,
  getWorkerQRActivity
);

router.get(
  "/dashboard/stats",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  getCompanyDashboardStats
);

router.get(
  "/dashboard/activity",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  getCompanyRecentActivity
);

module.exports = router;
