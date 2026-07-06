const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");
const {
  createVersion,
  updateVersion,
  getLatestVersion,
} = require("../controllers/app-version.controller");

const router = express.Router();

router.get("/latest", getLatestVersion);
router.use(protect);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));
router.post("/versions", createVersion);
router.patch("/versions/:versionId", updateVersion);

module.exports = router;
