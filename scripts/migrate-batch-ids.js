const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const BarcodeBatch = require('../src/models/barcode-batch.model');

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    const batches = await BarcodeBatch.find({ batchId: { $exists: false } });
    console.log(`Found ${batches.length} batches needing migration.`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      // Generate unique deterministic-looking ID: QR-YYYYMMDD-XXXX
      const dateStr = batch.createdAt ? new Date(batch.createdAt).toISOString().slice(0, 10).replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = crypto.randomBytes(2).toString('hex').toUpperCase();
      const indexStr = (i + 1).toString().padStart(3, '0');
      
      const newBatchId = `QR-${dateStr}-${random}${indexStr}`;
      
      batch.batchId = newBatchId;
      await batch.save();
      console.log(`Migrated batch ${batch._id} -> ${newBatchId}`);
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
