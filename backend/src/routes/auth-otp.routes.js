const express = require("express");
const {
  requestOtp,
  verifyOtp,
  passwordLogin,
  requestPasswordReset,
  verifyPasswordResetOtp,
  completePasswordReset,
} = require("../controllers/auth-otp.controller");
const { validate } = require("../middleware/validate");
const {
  passwordResetRequestValidation,
  passwordResetVerifyValidation,
  passwordResetCompleteValidation,
} = require("../validators/auth.validator");

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", passwordLogin);
router.post("/request-password-reset", passwordResetRequestValidation, validate, requestPasswordReset);
router.post("/verify-password-reset", passwordResetVerifyValidation, validate, verifyPasswordResetOtp);
router.post("/complete-password-reset", passwordResetCompleteValidation, validate, completePasswordReset);

module.exports = router;
