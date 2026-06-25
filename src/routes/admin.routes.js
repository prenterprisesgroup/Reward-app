const express = require("express");

const {
  createCompany,
  createCompanyAdmin,
  getCompany,
  listCompanies,
} = require("../controllers/admin-company.controller");
const { ROLES } = require("../constants/roles");
const { authorizeRoles, protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.route("/companies").get(listCompanies).post(createCompany);
router.route("/companies/:id").get(getCompany);
router.route("/companies/:companyId/admins").post(createCompanyAdmin);

module.exports = router;
