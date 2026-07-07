const { body } = require("express-validator");

const updateSettingsValidation = [
  body("general.maintenanceMode").optional().isBoolean(),
  body("general.supportEmail").optional().isEmail(),
  
  body("rewards.minRewardAmount").optional().isNumeric().custom((value, { req }) => {
    if (req.body.rewards && req.body.rewards.maxRewardAmount !== undefined) {
      if (value >= req.body.rewards.maxRewardAmount) {
        throw new Error('Min reward must be less than max reward');
      }
    }
    return true;
  }),
  body("rewards.maxRewardAmount").optional().isNumeric(),

  body("withdrawals.minWithdrawalAmount").optional().isNumeric(),
  body("withdrawals.dailyWithdrawalLimit").optional().isNumeric(),

  body("featureFlags.analyticsEnabled").optional().isBoolean(),
  body("featureFlags.reportsEnabled").optional().isBoolean(),
  body("featureFlags.notificationsEnabled").optional().isBoolean(),
];

module.exports = {
  updateSettingsValidation,
};
