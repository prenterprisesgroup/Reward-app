require('dotenv').config();
const mongoose = require('mongoose');
const WalletTransaction = require('./src/models/wallet-transaction.model');
const Company = require('./src/models/company.model');
const User = require('./src/models/user.model');
const BarcodeBatch = require('./src/models/barcode-batch.model');

async function verifyDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // 30 days ago from now
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const report = {};

    // 1. Total WalletTransaction documents
    report.q1_totalTransactions = await WalletTransaction.countDocuments({});
    report.q1_sample = await WalletTransaction.findOne({}).lean();

    // 2. Total REWARD transactions
    report.q2_totalRewards = await WalletTransaction.countDocuments({ type: "REWARD" });
    report.q2_sample = await WalletTransaction.findOne({ type: "REWARD" }).lean();

    // 3. Total COMPLETED REWARD transactions
    report.q3_totalCompletedRewards = await WalletTransaction.countDocuments({ type: "REWARD", status: "COMPLETED" });
    report.q3_sample = await WalletTransaction.findOne({ type: "REWARD", status: "COMPLETED" }).lean();

    // 4. Total COMPLETED REWARD transactions within the last 30 days
    report.q4_recentCompletedRewards = await WalletTransaction.countDocuments({ 
      type: "REWARD", 
      status: "COMPLETED", 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    report.q4_sample = await WalletTransaction.findOne({ 
      type: "REWARD", 
      status: "COMPLETED", 
      createdAt: { $gte: thirtyDaysAgo } 
    }).lean();

    // 5. Total Companies created within the last 30 days
    report.q5_recentCompanies = await Company.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    report.q5_sample = await Company.findOne({ createdAt: { $gte: thirtyDaysAgo } }).select('-password -tokens').lean();

    // 6. Total Workers created within the last 30 days
    report.q6_recentWorkers = await User.countDocuments({ role: "WORKER", createdAt: { $gte: thirtyDaysAgo } });
    report.q6_sample = await User.findOne({ role: "WORKER", createdAt: { $gte: thirtyDaysAgo } }).select('-password -tokens').lean();

    // 7. Total Barcode Batches created within the last 30 days
    report.q7_recentBatches = await BarcodeBatch.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    report.q7_sample = await BarcodeBatch.findOne({ createdAt: { $gte: thirtyDaysAgo } }).lean();

    console.log(JSON.stringify(report, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyDB();
