const crypto = require("crypto");
const { queues } = require("../queues/queue.factory");
const { QUEUE_NAMES } = require("../constants/queue.constants");

class QueueService {
  /**
   * Generates a stable job ID to guarantee idempotency.
   * If a job with this ID is already queued or running, BullMQ will ignore the duplicate payload.
   */
  generateIdempotencyKey(jobName, payload) {
    const hash = crypto.createHash("sha256");
    hash.update(jobName);
    hash.update(JSON.stringify(payload));
    return hash.digest("hex");
  }

  /**
   * Helper to dispatch jobs to a specific queue
   */
  async dispatch(queueName, jobName, payload, options = {}) {
    const queue = queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    // Default idempotency if jobId not explicitly provided
    if (!options.jobId) {
      options.jobId = this.generateIdempotencyKey(jobName, payload);
    }

    const job = await queue.add(jobName, payload, options);
    return job;
  }

  // Domain-specific dispatchers

  async dispatchReportJob(jobId, reportType, filters, format) {
    return this.dispatch(QUEUE_NAMES.REPORTS, "GENERATE_REPORT", {
      jobId,
      reportType,
      filters,
      format
    }, {
      // Explicit jobId for report since we track it in Mongo
      jobId: jobId.toString() 
    });
  }

  async dispatchNotificationJob(recipientId, templateId, variables) {
    return this.dispatch(QUEUE_NAMES.NOTIFICATIONS, "SEND_NOTIFICATION", {
      recipientId,
      templateId,
      variables
    });
  }

  async dispatchToDLQ(failedJob, errorReason) {
    return this.dispatch(QUEUE_NAMES.DLQ, failedJob.name, {
      originalJobId: failedJob.id,
      originalQueue: failedJob.queueName,
      payload: failedJob.data,
      errorReason,
      failedAt: new Date()
    });
  }

  async getQueueMetrics() {
    const metrics = {};
    for (const [name, queue] of Object.entries(queues)) {
      const counts = await queue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed', 'paused');
      // getJobCounts doesn't return 'stalled' directly in the same way, but we can fetch it if needed,
      // or map standard counts. BullMQ getJobCounts takes multiple types.
      metrics[name] = {
        waiting: counts.wait || 0,
        active: counts.active || 0,
        completed: counts.completed || 0,
        failed: counts.failed || 0,
        delayed: counts.delayed || 0,
        paused: counts.paused || 0,
      };
    }
    return metrics;
  }
}

module.exports = new QueueService();
