const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");
const {
  approveCompany,
  rejectCompany,
  suspendCompany,
  listCompanies,
  getCompanyDetails,
} = require("../controllers/company.controller");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.get("/companies", listCompanies);
router.get("/companies/:companyId", getCompanyDetails);
router.post("/companies/:companyId/approve", approveCompany);
router.post("/companies/:companyId/reject", rejectCompany);
router.post("/companies/:companyId/suspend", suspendCompany);

module.exports = router;
