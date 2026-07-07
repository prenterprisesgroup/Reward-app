const { Worker } = require("bullmq");
const { connection } = require("../config/redis");
const { QUEUE_NAMES } = require("../constants/queue.constants");
const { QUEUE_CONFIG } = require("../config/queue.config");
const ExportService = require("../services/export.service");
const QueueService = require("../services/queue.service");

let worker = null;

function initWorker() {
  if (worker) return worker;

  const config = QUEUE_CONFIG[QUEUE_NAMES.REPORTS];

  worker = new Worker(QUEUE_NAMES.REPORTS, async (job) => {
    const { jobId } = job.data;
    
    // Pass progress callback down if needed, but ExportService generates it in one go for now.
    // For progress, we'll manually set progress at key intervals.
    await job.updateProgress(10);
    
    // Call the heavy export logic
    await ExportService.generateReport(jobId);
    
    await job.updateProgress(100);
    return { success: true, jobId };

  }, { 
    connection,
    concurrency: 2, // Limit concurrency for heavy DB lookups
    limiter: config.limiter
  });

  worker.on('failed', async (job, err) => {
    if (job.attemptsMade >= job.opts.attempts) {
      // Move to DLQ
      await QueueService.dispatchToDLQ(job, err.message);
    }
  });

  return worker;
}

function closeWorker() {
  if (worker) {
    return worker.close();
  }
}

module.exports = {
  initWorker,
  closeWorker
};
