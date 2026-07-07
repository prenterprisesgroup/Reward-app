const HealthService = require("../services/health.service");
const packageJson = require("../../package.json");

// Wraps the response in the requested Dashboard Contract structure
const generateMeta = () => ({
  version: packageJson.version,
  environment: process.env.NODE_ENV || "development",
  generatedAt: new Date().toISOString(),
  uptime: process.uptime(),
  build: process.env.BUILD_NUMBER || "local"
});

async function getDeepHealth(req, res, next) {
  try {
    const deepHealth = await HealthService.getDeepHealth();

    res.status(200).json({
      success: true,
      data: {
        overallStatus: deepHealth.overallStatus,
        healthScore: deepHealth.healthScore,
        services: deepHealth.services,
        queues: deepHealth.queues,
        storage: deepHealth.storage,
        metrics: deepHealth.metrics,
        modules: {
          analytics: "HEALTHY", // Hardcoded module status representation for frontend dashboard layout
          reports: "HEALTHY",
          notifications: "HEALTHY",
          queues: deepHealth.queues.status,
          database: deepHealth.services.database.status
        }
      },
      meta: generateMeta()
    });
  } catch (error) {
    next(error);
  }
}

async function getSystemQueues(req, res, next) {
  try {
    const queueHealth = await HealthService.getQueueHealth();
    
    res.status(200).json({
      success: true,
      data: queueHealth,
      meta: generateMeta()
    });
  } catch (error) {
    next(error);
  }
}

async function getSystemMetrics(req, res, next) {
  try {
    const metrics = HealthService.getSystemMetrics();

    res.status(200).json({
      success: true,
      data: metrics,
      meta: generateMeta()
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDeepHealth,
  getSystemQueues,
  getSystemMetrics
};
