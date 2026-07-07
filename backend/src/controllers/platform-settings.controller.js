const { validationResult } = require("express-validator");
const PlatformSettingsService = require("../services/platform-settings.service");
const HttpError = require("../utils/http-error");
const { logAudit } = require("../utils/audit");

async function getSettings(req, res, next) {
  try {
    const settings = await PlatformSettingsService.getSettings();

    res.json({
      success: true,
      data: settings,
      meta: {
        updatedAt: settings.updatedAt,
        version: settings.version
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const beforeState = await PlatformSettingsService.getSettings();
    const updatedSettings = await PlatformSettingsService.updateSettings(req.body, req.user._id);

    // Generate Audit Log
    await logAudit(
      req,
      "PLATFORM_SETTINGS_UPDATED",
      null, // Target User (N/A)
      null, // Company (N/A, global)
      beforeState,
      updatedSettings
    );

    res.json({
      success: true,
      data: updatedSettings,
      meta: {
        updatedAt: updatedSettings.updatedAt,
        version: updatedSettings.version
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSettings,
  updateSettings
};
