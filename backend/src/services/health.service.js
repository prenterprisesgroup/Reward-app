const mongoose = require("mongoose");
const os = require("os");
const v8 = require("v8");
const fs = require("fs").promises;
const path = require("path");
const { connection: redisConnection } = require("../config/redis");
const QueueService = require("./queue.service");
const cloudinary = require("../config/cloudinary");
const packageJson = require("../../package.json");

// In-memory cache for expensive checks
const cache = {
  mongo: { data: null, expiresAt: 0 },
  redis: { data: null, expiresAt: 0 },
  cloudinary: { data: null, expiresAt: 0 },
  storage: { data: null, expiresAt: 0 },
  queues: { data: null, expiresAt: 0 }
};

// Helper: Wrap promise with timeout
const withTimeout = (promise, ms, fallbackValue) => {
  let timeoutId;
  const timeout = new Promise((resolve) => {
    timeoutId = setTimeout(() => resolve(fallbackValue), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

class HealthService {
  
  async getMongoHealth() {
    const now = Date.now();
    if (cache.mongo.expiresAt > now) return cache.mongo.data;

    let result = { status: "DEGRADED", details: {} };
    if (mongoose.connection.readyState === 1) {
      try {
        const stats = await withTimeout(mongoose.connection.db.stats(), 2000, null);
        if (stats) {
          result = {
            status: "HEALTHY",
            details: {
              activeConnections: mongoose.connection.base.connections.length,
              collections: stats.collections,
              indexes: stats.indexes,
              dbSizeMB: (stats.dataSize / 1024 / 1024).toFixed(2),
            }
          };
        }
      } catch (err) {
        result.details.error = err.message;
      }
    } else {
      result.status = "OFFLINE";
    }

    cache.mongo.data = result;
    cache.mongo.expiresAt = now + 5000; // 5s TTL
    return result;
  }

  async getRedisHealth() {
    const now = Date.now();
    if (cache.redis.expiresAt > now) return cache.redis.data;

    let result = { status: "DEGRADED", details: {} };
    if (redisConnection && redisConnection.status === "ready") {
      try {
        const pingResult = await withTimeout(redisConnection.ping(), 2000, null);
        if (pingResult === "PONG") {
          result.status = "HEALTHY";
        }
      } catch (err) {
        result.details.error = err.message;
      }
    } else {
      result.status = "OFFLINE";
    }

    cache.redis.data = result;
    cache.redis.expiresAt = now + 5000; // 5s TTL
    return result;
  }

  async getCloudinaryHealth() {
    const now = Date.now();
    if (cache.cloudinary.expiresAt > now) return cache.cloudinary.data;

    let result = { status: "NOT_CONFIGURED", details: {} };
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      result.status = "DEGRADED";
      try {
        // Cloudinary API usage endpoint is a good deep check
        const usage = await withTimeout(cloudinary.api.usage(), 3000, null);
        if (usage) {
          result = {
            status: "HEALTHY",
            details: {
              cloudName: process.env.CLOUDINARY_CLOUD_NAME,
              rateLimitRemaining: usage.rate_limit_remaining || "N/A",
              storageUsedMB: usage.storage ? (usage.storage.usage / 1024 / 1024).toFixed(2) : "N/A",
            }
          };
        }
      } catch (err) {
        result.details.error = err.message;
      }
    }

    cache.cloudinary.data = result;
    cache.cloudinary.expiresAt = now + 30000; // 30s TTL
    return result;
  }

  async getStorageHealth() {
    const now = Date.now();
    if (cache.storage.expiresAt > now) return cache.storage.data;

    let result = { status: "DEGRADED", details: {} };
    try {
      const reportsDir = path.join(__dirname, "../../tmp/reports");
      const stat = await fs.stat(reportsDir).catch(() => null);
      if (stat && stat.isDirectory()) {
        result = {
          status: "HEALTHY",
          details: {
            tempDirectory: "Accessible",
            path: reportsDir
          }
        };
      } else {
        result.status = "WARNING";
        result.details.error = "Temp directory missing or inaccessible";
      }
    } catch (err) {
      result.details.error = err.message;
    }

    cache.storage.data = result;
    cache.storage.expiresAt = now + 60000; // 60s TTL
    return result;
  }

  async getQueueHealth() {
    const now = Date.now();
    if (cache.queues.expiresAt > now) return cache.queues.data;

    let result = { status: "DEGRADED", metrics: {} };
    try {
      const metrics = await withTimeout(QueueService.getQueueMetrics(), 3000, null);
      if (metrics) {
        result.status = "HEALTHY";
        result.metrics = metrics;
      }
    } catch (err) {
      // Ignored
    }

    cache.queues.data = result;
    cache.queues.expiresAt = now + 5000; // 5s TTL
    return result;
  }

  getSystemMetrics() {
    return {
      cpuPercentage: os.loadavg()[0] * 100 / os.cpus().length,
      memoryPercentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
      heapUsageMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      rssMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
      nodeVersion: process.version,
      platform: os.platform(),
      architecture: os.arch(),
      uptime: process.uptime(),
      pid: process.pid,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  calculateHealthScore(mongoStatus, redisStatus, queueStatus, cloudinaryStatus) {
    let score = 100;
    const weights = { "HEALTHY": 0, "WARNING": 10, "DEGRADED": 20, "OFFLINE": 40, "NOT_CONFIGURED": 0 };
    score -= weights[mongoStatus] || 0;
    score -= weights[redisStatus] || 0;
    score -= weights[queueStatus] || 0;
    
    if (cloudinaryStatus !== "NOT_CONFIGURED") {
        score -= weights[cloudinaryStatus] || 0;
    }
    
    return Math.max(0, score);
  }

  async getDeepHealth() {
    // Parallel execution rule
    const [mongoRes, redisRes, cloudinaryRes, storageRes, queueRes] = await Promise.allSettled([
      this.getMongoHealth(),
      this.getRedisHealth(),
      this.getCloudinaryHealth(),
      this.getStorageHealth(),
      this.getQueueHealth()
    ]);

    const mongo = mongoRes.status === "fulfilled" ? mongoRes.value : { status: "CRITICAL" };
    const redis = redisRes.status === "fulfilled" ? redisRes.value : { status: "CRITICAL" };
    const cloud = cloudinaryRes.status === "fulfilled" ? cloudinaryRes.value : { status: "CRITICAL" };
    const storage = storageRes.status === "fulfilled" ? storageRes.value : { status: "CRITICAL" };
    const queues = queueRes.status === "fulfilled" ? queueRes.value : { status: "CRITICAL", metrics: {} };

    const score = this.calculateHealthScore(mongo.status, redis.status, queues.status, cloud.status);
    
    let overallStatus = "HEALTHY";
    if (score < 50) overallStatus = "CRITICAL";
    else if (score < 80) overallStatus = "DEGRADED";
    else if (score < 100) overallStatus = "WARNING";

    return {
      overallStatus,
      healthScore: score,
      services: {
        database: mongo,
        cache: redis,
        cloudinary: cloud
      },
      queues: queues,
      storage: storage,
      metrics: this.getSystemMetrics()
    };
  }
}

module.exports = new HealthService();
