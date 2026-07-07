const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Company = require("./src/models/company.model");
const User = require("./src/models/user.model");
const WalletTransaction = require("./src/models/wallet-transaction.model");
const WithdrawalRequest = require("./src/models/withdrawal-request.model");
const Barcode = require("./src/models/barcode.model");

async function explainPipelines() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB.");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  const runExplain = async (model, pipeline, name) => {
    try {
      const explainResult = await model.collection.aggregate(pipeline).explain("executionStats");
      
      const stats = explainResult.executionStats;
      const findStage = explainResult.stages ? explainResult.stages[0] : null;
      let isCollScan = false;
      let indexName = null;

      if (findStage && findStage.$cursor && findStage.$cursor.queryPlanner) {
          const winningPlan = findStage.$cursor.queryPlanner.winningPlan;
          const checkStage = (stage) => {
             if (stage.stage === "COLLSCAN") isCollScan = true;
             if (stage.stage === "IXSCAN") indexName = stage.indexName;
             if (stage.inputStage) checkStage(stage.inputStage);
          };
          checkStage(winningPlan);
      }
      
      console.log(`\n--- ${name} ---`);
      console.log("COLLSCAN:", isCollScan);
      console.log("IXSCAN:", !!indexName);
      console.log("Index used:", indexName);
      if (stats) {
        console.log("Total Docs Examined:", stats.totalDocsExamined);
        console.log("Execution Time (ms):", stats.executionTimeMillis);
      }
    } catch (err) {
      console.error(`Error explaining ${name}:`, err.message);
    }
  };

  await runExplain(Company, [
    { $match: { createdAt: { $gte: thirtyDaysAgo, $lte: now }, status: "ACTIVE" } },
    { $group: { _id: null, total: { $sum: 1 } } }
  ], "Company Growth");

  await runExplain(User, [
    { $match: { createdAt: { $gte: thirtyDaysAgo, $lte: now }, role: "WORKER", isDeleted: { $ne: true } } },
    { $group: { _id: null, total: { $sum: 1 } } }
  ], "User Growth");

  await runExplain(WalletTransaction, [
    { $match: { createdAt: { $gte: thirtyDaysAgo, $lte: now }, type: "REWARD", status: "COMPLETED" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ], "Rewards Growth");

  await runExplain(WithdrawalRequest, [
    { $match: { createdAt: { $gte: thirtyDaysAgo, $lte: now }, status: "PENDING" } },
    { $group: { _id: null, total: { $sum: 1 } } }
  ], "Pending Withdrawals");

  await runExplain(Barcode, [
    { $match: { redeemedAt: { $gte: thirtyDaysAgo, $lte: now }, status: "REDEEMED" } },
    { $group: { _id: null, total: { $sum: 1 } } }
  ], "QR Codes Redeemed");

  await mongoose.disconnect();
}

explainPipelines();
