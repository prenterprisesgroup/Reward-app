const { Queue, QueueEvents } = require("bullmq");
const { connection } = require("../config/redis");
const { QUEUE_CONFIG, DEFAULT_JOB_OPTIONS } = require("../config/queue.config");
const { QUEUE_NAMES } = require("../constants/queue.constants");

const queues = {};
const events = {};

function createQueue(queueName) {
  if (queues[queueName]) return queues[queueName];

  const config = QUEUE_CONFIG[queueName] || DEFAULT_JOB_OPTIONS;
  
  const queue = new Queue(queueName, {
    connection,
    defaultJobOptions: {
      attempts: config.attempts,
      backoff: config.backoff,
      removeOnComplete: config.removeOnComplete,
      removeOnFail: config.removeOnFail,
    }
  });

  const queueEvents = new QueueEvents(queueName, { connection });

  // Attach global monitoring listeners
  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    console.log(`[Queue: ${queueName}] Job ${jobId} completed successfully.`);
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.error(`[Queue: ${queueName}] Job ${jobId} failed: ${failedReason}`);
  });

  queueEvents.on("active", ({ jobId }) => {
    console.log(`[Queue: ${queueName}] Job ${jobId} is now active.`);
  });

  queueEvents.on("progress", ({ jobId, data }) => {
    console.log(`[Queue: ${queueName}] Job ${jobId} progress: ${data}%`);
  });

  queues[queueName] = queue;
  events[queueName] = queueEvents;

  return queue;
}

// Pre-initialize standard queues
createQueue(QUEUE_NAMES.REPORTS);
createQueue(QUEUE_NAMES.NOTIFICATIONS);
createQueue(QUEUE_NAMES.SETTLEMENTS);
createQueue(QUEUE_NAMES.CLEANUP);
createQueue(QUEUE_NAMES.DLQ);

module.exports = {
  queues,
  createQueue,
};
