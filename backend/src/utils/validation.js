const mongoose = require("mongoose");
const HttpError = require("./http-error");

function escapeRegex(value) {
  if (!value) return "";
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, `${label} is invalid`);
  }
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function validatePassword(password) {
  if (!passwordRegex.test(password)) {
    throw new HttpError(400, "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character");
  }
}

module.exports = {
  escapeRegex,
  assertObjectId,
  validatePassword,
  passwordRegex
};
