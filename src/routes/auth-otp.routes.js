const express = require("express");
const {
  requestOtp,
  verifyOtp,
  passwordLogin,
} = require("../controllers/auth-otp.controller");

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", passwordLogin);

module.exports = router;
