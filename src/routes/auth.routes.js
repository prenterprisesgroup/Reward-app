const express = require("express");

const {
  getMe,
  login,
  registerWorker,
} = require("../controllers/auth.controller");
const { logout } = require("../controllers/auth-logout.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register-worker", registerWorker);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;
