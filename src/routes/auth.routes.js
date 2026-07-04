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

const router = express.Router();

router.post("/register-worker", registerWorker);
router.post("/register-company", registerCompany);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.post("/me/photo", protect, upload.single("image"), uploadProfilePhoto);
router.delete("/me/photo", protect, removeProfilePhoto);

module.exports = router;
