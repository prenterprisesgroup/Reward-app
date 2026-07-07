const { Worker } = require("bullmq");
const { connection } = require("../config/redis");
const { QUEUE_NAMES } = require("../constants/queue.constants");
const { QUEUE_CONFIG } = require("../config/queue.config");
const User = require("../models/user.model");
const NotificationService = require("../services/notification.service");
const QueueService = require("../services/queue.service");

let worker = null;

function initWorker() {
  if (worker) return worker;

  const config = QUEUE_CONFIG[QUEUE_NAMES.NOTIFICATIONS];

  worker = new Worker(QUEUE_NAMES.NOTIFICATIONS, async (job) => {
    const { recipientId, templateId, variables } = job.data;
    
    await job.updateProgress(10);
    
    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) throw new Error("Recipient not found");

    await job.updateProgress(30);

    // Using the service created in Phase 9E
    // Note: The service expects to know the channel, but in our unified queue,
    // we can either pass channel, or we can look up the template to decide.
    // For now, we will assume NotificationService._dispatch is public or we call sendEmail directly based on channel.
    // For this migration, we'll fetch template to find out channel.
    const NotificationTemplate = require("../models/notification-template.model");
    const template = await NotificationTemplate.findById(templateId);
    if (!template) throw new Error("Template not found");
    
    await job.updateProgress(50);

    let log;
    if (template.type === "EMAIL") log = await NotificationService.sendEmail(recipientUser, templateId, variables);
    else if (template.type === "SMS") log = await NotificationService.sendSMS(recipientUser, templateId, variables);
    else if (template.type === "PUSH") log = await NotificationService.sendPush(recipientUser, templateId, variables);
    else throw new Error("Unsupported Notification channel");

    await job.updateProgress(100);
    return { success: true, logId: log ? log._id : null };

  }, { 
    connection,
    concurrency: 10,
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
