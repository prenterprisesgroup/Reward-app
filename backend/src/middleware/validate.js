const { validationResult } = require('express-validator');
const HttpError = require('../utils/http-error');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    throw new HttpError(400, `Validation failed: ${errorMessages}`);
  }
  next();
}

module.exports = { validate };
