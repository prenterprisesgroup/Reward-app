const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connection: redisConnection } = require("../src/config/redis");
const { closeAllWorkers } = require("../src/workers");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  
  // Clean up Redis and workers to prevent hanging tests
  await closeAllWorkers();
  if (redisConnection) {
    await redisConnection.quit();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});
