const Redis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redisConfig = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    // If we've failed 3 times, stop retrying to prevent console spam
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  },
};

const connection = new Redis(REDIS_URL, redisConfig);

connection.on("error", (error) => {
  console.error("Redis Connection Error:", error.message);
});

connection.on("ready", () => {
  console.log("Redis Connection Ready");
});

module.exports = {
  connection,
  REDIS_URL
};
