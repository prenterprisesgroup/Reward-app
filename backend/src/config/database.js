const mongoose = require("mongoose");
const logger = require("../utils/logger");

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri);
    if (process.env.NODE_ENV !== "test") {
      logger.info("MongoDB connected");
    }
}

module.exports = connectDatabase;
