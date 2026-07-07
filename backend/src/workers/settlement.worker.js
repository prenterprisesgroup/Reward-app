const { Worker } = require("bullmq");
const { connection } = require("../config/redis");
const { QUEUE_NAMES } = require("../constants/queue.constants");
const { QUEUE_CONFIG } = require("../config/queue.config");
const QueueService = require("../services/queue.service");

let worker = null;

function initWorker() {
  if (worker) return worker;

  const config = QUEUE_CONFIG[QUEUE_NAMES.SETTLEMENTS];

  worker = new Worker(QUEUE_NAMES.SETTLEMENTS, async (job) => {
    // Settlement logic placeholder for now. 
    // Actual business logic would go here.
    await job.updateProgress(50);
    console.log(`Processing settlement job: ${job.id}`);
    await job.updateProgress(100);
    return { success: true };
  }, { 
    connection,
    concurrency: 5,
    limiter: config.limiter
  });

  worker.on('failed', async (job, err) => {
    if (job.attemptsMade >= job.opts.attempts) {
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
