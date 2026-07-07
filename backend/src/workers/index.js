const reportWorker = require("./report.worker");
const notificationWorker = require("./notification.worker");
const settlementWorker = require("./settlement.worker");

function registerWorkers() {
  console.log("Registering BullMQ Workers...");
  reportWorker.initWorker();
  notificationWorker.initWorker();
  settlementWorker.initWorker();
  console.log("BullMQ Workers Registered Successfully.");
}

async function closeAllWorkers() {
  console.log("Closing BullMQ Workers...");
  await Promise.all([
    reportWorker.closeWorker(),
    notificationWorker.closeWorker(),
    settlementWorker.closeWorker()
  ]);
  console.log("BullMQ Workers Closed.");
}

module.exports = {
  registerWorkers,
  closeAllWorkers
};
