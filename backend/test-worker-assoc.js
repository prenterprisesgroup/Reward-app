require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const WalletTransaction = require('./src/models/wallet-transaction.model');
const Company = require('./src/models/company.model');
const User = require('./src/models/user.model');
const Barcode = require('./src/models/barcode.model');

async function run() {
  try {
    await connectDB();
    
    // Find a company
    const company = await Company.findOne();
    if (!company) {
      console.log('No company found.');
      return;
    }

    console.log(`Testing with Company: ${company.name} (${company._id})`);

    // Run the aggregation logic exactly as it is in the controller
    const baseMatch = { company: company._id, type: 'REWARD', status: 'SUCCESS' };
    const basePipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: "$worker",
          totalRewardsEarned: { $sum: "$amount" },
          totalQrScans: { $sum: 1 },
          lastScanDate: { $max: "$createdAt" },
          joinDate: { $min: "$createdAt" },
          lastRewardAmount: { $last: "$amount" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "workerDetails"
        }
      },
      { $unwind: "$workerDetails" },
      { $match: { "workerDetails.isDeleted": { $ne: true } } },
      {
        $project: {
          id: "$_id",
          name: { $ifNull: ["$workerDetails.name", "Unknown"] },
          phone: { $ifNull: ["$workerDetails.phone", "N/A"] },
          status: { $ifNull: ["$workerDetails.isActive", true] },
          totalRewardsEarned: 1,
          totalQrScans: 1,
          lastScanDate: 1,
          joinDate: 1,
          lastRewardAmount: 1,
          _id: 0
        }
      }
    ];

    const result = await WalletTransaction.aggregate(basePipeline);
    
    console.log('--- Aggregation Result ---');
    console.log(`Found ${result.length} unique workers for this company.`);
    if (result.length > 0) {
      console.log('First worker stats:', JSON.stringify(result[0], null, 2));
    } else {
      console.log('No workers found for this company in WalletTransactions.');
    }
    
    // Verify Company List aggregation
    const listCompanyPipeline = [
      { $match: { _id: company._id } },
      {
        $lookup: {
          from: "wallettransactions",
          let: { companyId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$company", "$$companyId"] }, { $eq: ["$type", "REWARD"] }, { $eq: ["$status", "SUCCESS"] }] } } },
            { $group: { _id: "$worker" } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "w" } },
            { $unwind: "$w" },
            { $match: { "w.isDeleted": { $ne: true } } },
            { $count: "count" }
          ],
          as: "workersData"
        }
      },
      {
        $project: {
          name: 1,
          workersCount: { $ifNull: [{ $arrayElemAt: ["$workersData.count", 0] }, 0] }
        }
      }
    ];
    
    const listResult = await Company.aggregate(listCompanyPipeline);
    console.log('--- List Company Workers Count Result ---');
    console.log(JSON.stringify(listResult, null, 2));
    
    if (listResult[0] && listResult[0].workersCount === result.length) {
      console.log('SUCCESS: Workers count matches exact unique worker count!');
    } else {
      console.log('ERROR: Mismatch between list count and actual worker count!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

run();
