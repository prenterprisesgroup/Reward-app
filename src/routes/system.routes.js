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
  manualWorkerReward,
} = require("../controllers/system.controller");

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
  createBarcodeBatch
);
router.get(
  "/barcode-batches",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  listBarcodeBatches
);
router.get(
  "/barcode-batches/:batchId/pdf",
  authorizeRoles(ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  downloadBarcodeBatchPdf
);

router.post("/scan", authorizeRoles(ROLES.WORKER), scanBarcode);
router.get("/wallet/breakdown", authorizeRoles(ROLES.WORKER), getWalletBreakdown);
router.get("/wallet", authorizeRoles(ROLES.WORKER), getWallet);
router.patch("/wallet/upi", authorizeRoles(ROLES.WORKER), updateUpi);
router.post("/withdrawals", authorizeRoles(ROLES.WORKER), requestWithdrawal);
router.get(
  "/withdrawals",
  authorizeRoles(ROLES.WORKER, ROLES.COMPANY_ADMIN, ROLES.COMPANY_STAFF),
  listWithdrawals
);
router.post(
  "/withdrawals/:withdrawalId/approve",
  authorizeRoles(ROLES.COMPANY_ADMIN),
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

module.exports = router;
