const express = require("express");
const mongoose = require("mongoose");
const packageJson = require("../../package.json");
const validateEnv = require("../config/env");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.get("/", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: databaseConnected ? "connected" : "disconnected",
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

router.get("/ready", async (req, res) => {
  try {
    const databaseConnected = mongoose.connection.readyState === 1;
    if (!databaseConnected) throw new Error("Database not connected");

    validateEnv();

    res.status(200).json({ status: "ready" });
  } catch (error) {
    res.status(503).json({ status: "not ready", error: error.message });
  }
});

router.get("/live", (req, res) => {
  res.status(200).json({ status: "alive" });
});

module.exports = router;
