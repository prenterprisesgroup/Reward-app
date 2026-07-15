require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("./src/config/database");
const Company = require("./src/models/company.model");
const WalletTransaction = require("./src/models/wallet-transaction.model");

async function checkData() {
  try {
    await connectDatabase();
    
    const companies = await Company.countDocuments();
    const transactions = await WalletTransaction.countDocuments({ type: "REWARD", status: "COMPLETED" });
    
    console.log('Companies in database:', companies);
    console.log('Reward transactions in database:', transactions);
    
    if (companies === 0) {
      console.log('✗ No companies found in database');
    }
    
    if (transactions === 0) {
      console.log('✗ No reward transactions found in database');
    }
    
    if (companies > 0 && transactions === 0) {
      console.log('ℹ Companies exist but no rewards distributed yet');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkData();
