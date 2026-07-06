require("dotenv").config();
const validateEnv = require("./config/env");
validateEnv();

const logger = require("./utils/logger");

const app = require("./app");
const connectDatabase = require("./config/database");

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();

    app.listen(port, '0.0.0.0', () => {
      logger.info(`Server running on port ${port} and listening on 0.0.0.0`);
    });
  } catch (error) {
    logger.fatal("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
