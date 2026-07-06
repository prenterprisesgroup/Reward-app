const express = require("express");

const {
  getMe,
  updateMe,
  login,
  registerWorker,
  registerCompany,
} = require("../controllers/auth.controller");
const { logout } = require("../controllers/auth-logout.controller");
const { protect } = require("../middleware/auth");
const { uploadProfilePhoto, removeProfilePhoto } = require("../controllers/profile.controller");
const { upload } = require("../middleware/upload");
const { validate } = require("../middleware/validate");
const { loginLimiter, profileLimiter } = require("../middleware/rate-limiter");
const { loginValidation, registerWorkerValidation, registerCompanyValidation, updateMeValidation } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register-worker", registerWorkerValidation, validate, registerWorker);
router.post("/register-company", registerCompanyValidation, validate, registerCompany);
router.post("/login", loginLimiter, loginValidation, validate, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMeValidation, validate, updateMe);
router.post("/me/photo", protect, profileLimiter, upload.single("image"), uploadProfilePhoto);
router.delete("/me/photo", protect, removeProfilePhoto);

module.exports = router;
