const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");
const {
  createCompanyStaff,
  getUser,
  updateUser,
  listUsers,
} = require("../controllers/admin-user.controller");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN));

router.post("/companies/:companyId/staff", createCompanyStaff);
router.get("/users/:userId", getUser);
router.patch("/users/:userId", updateUser);
router.get("/users", listUsers);

module.exports = router;
