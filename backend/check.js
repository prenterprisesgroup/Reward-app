const mongoose = require('mongoose');
const BarcodeBatch = require('./src/models/barcode-batch.model.js');
mongoose.connect('mongodb://localhost:27017/reward-app').then(async () => {
  const result = await BarcodeBatch.aggregate([
    { $group: { _id: null, totalGen: { $sum: '$generatedCount' }, totalRed: { $sum: '$redeemedCount' } } }
  ]);
  console.log(result);
  process.exit(0);
});
