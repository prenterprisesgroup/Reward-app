const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");
const settingsController = require("../controllers/platform-settings.controller");
const { updateSettingsValidation } = require("../validators/settings.validator");

// Require authentication for all settings routes
router.use(protect);

// Only SUPER_ADMIN can manage platform settings
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.get("/", settingsController.getSettings);
router.patch("/", updateSettingsValidation, settingsController.updateSettings);

module.exports = router;
