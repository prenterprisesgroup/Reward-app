require("dotenv").config();
const validateEnv = require("./config/env");
validateEnv();

const logger = require("./utils/logger");

const app = require("./app");
const connectDatabase = require("./config/database");
const { registerWorkers, closeAllWorkers } = require("./workers");
const { connection: redisConnection } = require("./config/redis");
const mongoose = require("mongoose");

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    registerWorkers();

    app.listen(port, '0.0.0.0', () => {
      logger.info(`Server running on port ${port} and listening on 0.0.0.0`);
    });
  } catch (error) {
    logger.fatal("Failed to start server:", error.message);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  try {
    await closeAllWorkers();
    if (redisConnection) {
      await redisConnection.quit();
      logger.info("Redis connection closed.");
    }
    await mongoose.connection.close();
    logger.info("Database connection closed.");
    process.exit(0);
  } catch (err) {
    logger.error("Error during graceful shutdown:", err.message);
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();
