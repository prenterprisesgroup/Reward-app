const { body, param, query, header } = require("express-validator");

const scanValidation = [
  header("idempotency-key").notEmpty().withMessage("Idempotency key required"),
  body("code").isString().notEmpty().withMessage("Barcode is required"),
];

const withdrawValidation = [
  header("idempotency-key").notEmpty().withMessage("Idempotency key required"),
  body("amount").isNumeric().custom(v => v >= 1).withMessage("Amount must be >= 1"),
  body("upiId").optional().isString(),
  body("company").isMongoId().withMessage("Company ID required"),
];

const approveWithdrawalValidation = [
  header("idempotency-key").notEmpty().withMessage("Idempotency key required"),
  param("withdrawalId").isMongoId(),
];

const rejectWithdrawalValidation = [
  header("idempotency-key").notEmpty().withMessage("Idempotency key required"),
  param("withdrawalId").isMongoId(),
  body("rejectionReason").optional().isString(),
];

const upiValidation = [
  body("upiId").isString().notEmpty(),
];

const createBarcodeBatchValidation = [
  body("productName").isString().notEmpty().isLength({ max: 160 }).withMessage("Product name is required and max 160 chars"),
  body("rewardAmount").isNumeric().custom(v => v >= 1).withMessage("Reward amount must be >= 1"),
  body("quantity").isNumeric().custom(v => v >= 1 && v <= 2000).withMessage("Quantity must be between 1 and 2000"),
  body("expiresAt").optional().isISO8601().toDate(),
  body("status").optional().isString(),
];

const updateBarcodeBatchValidation = [
  param("id").isMongoId(),
  body("productName").optional().isString().isLength({ max: 160 }),
  body("expiresAt").optional({ nullable: true }).isISO8601().toDate(),
  body("status").optional().isString().isIn(["DRAFT", "ACTIVE", "INACTIVE", "EXPIRED", "CANCELLED"]),
];

const duplicateBarcodeBatchValidation = [
  param("id").isMongoId(),
];

const workerIdParamValidation = [
  param("id").isMongoId().withMessage("Valid worker ID required"),
];

const workerHistoryPaginationValidation = [
  ...workerIdParamValidation,
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("search").optional().isString().trim(),
  query("status").optional().isString().trim(),
  query("startDate").optional().isISO8601().toDate(),
  query("endDate").optional().isISO8601().toDate(),
];

module.exports = {
  scanValidation,
  withdrawValidation,
  approveWithdrawalValidation,
  rejectWithdrawalValidation,
  upiValidation,
  createBarcodeBatchValidation,
  updateBarcodeBatchValidation,
  duplicateBarcodeBatchValidation,
  workerIdParamValidation,
  workerHistoryPaginationValidation,
};
