const mongoose = require('mongoose');

async function getBarcodes() {
  try {
    await mongoose.connect('mongodb://prenterprisesgroupp_db_user:rOu47D87Gl7ZfXAO@ac-nqstkn7-shard-00-00.cqxkszk.mongodb.net:27017,ac-nqstkn7-shard-00-01.cqxkszk.mongodb.net:27017,ac-nqstkn7-shard-00-02.cqxkszk.mongodb.net:27017/?ssl=true&replicaSet=atlas-10thrh-shard-0&authSource=admin&appName=rewardapp');
    
    // We can just query directly using the collection name in case schemas are complex to load
    const barcodes = await mongoose.connection.collection('barcodes').find({ status: 'ACTIVE' }).limit(3).toArray();
    
    console.log(JSON.stringify(barcodes.map(b => b.code)));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

getBarcodes();
