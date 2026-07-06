const IdempotencyKey = require("../models/idempotency-key.model");
const logger = require("../utils/logger");

async function checkIdempotency(key, workerId, endpoint) {
  if (!key) return null;
  return await IdempotencyKey.findOne({ key, workerId, endpoint });
}

async function saveIdempotency(key, workerId, endpoint, statusCode, response) {
  if (!key) return;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  try {
    await IdempotencyKey.create({
      key,
      workerId,
      endpoint,
      statusCode,
      response,
      expiresAt,
    });
  } catch (err) {
    // If it fails due to unique constraint, another request just created it. 
    logger.error("Failed to save idempotency key", err);
  }
}

module.exports = {
  checkIdempotency,
  saveIdempotency,
};
