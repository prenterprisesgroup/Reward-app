const { QUEUE_NAMES } = require("../constants/queue.constants");

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000, // 2s, 4s, 8s
  },
  removeOnComplete: 100, // keep last 100 completed
  removeOnFail: 500, // keep last 500 failed
};

const QUEUE_CONFIG = {
  [QUEUE_NAMES.REPORTS]: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 2, // Reports shouldn't retry too many times
  },
  [QUEUE_NAMES.NOTIFICATIONS]: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 5,
    // Rate Limiting: max 1000 jobs per 1 second (100000/100s)
    limiter: {
      max: 1000,
      duration: 1000,
    }
  },
  [QUEUE_NAMES.SETTLEMENTS]: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 3,
  },
  [QUEUE_NAMES.CLEANUP]: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 1, // Cron jobs typically don't retry, they just run next time
  },
  [QUEUE_NAMES.DLQ]: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 1, // Dead letter queue jobs don't retry automatically
  }
};

module.exports = {
  QUEUE_CONFIG,
  DEFAULT_JOB_OPTIONS,
};
