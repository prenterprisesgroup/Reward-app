const { body, header, param, query } = require("express-validator");

const loginValidation = [
  body("phone").isString().notEmpty().withMessage("Phone is required"),
  body("password").isString().notEmpty().withMessage("Password is required"),
];

const registerWorkerValidation = [
  body("name").isString().trim().notEmpty(),
  body("phone").isString().trim().notEmpty(),
  body("password").isString().isLength({ min: 8 }),
  body("email").optional().isEmail(),
  body("upiId").optional().isString(),
];

const updateMeValidation = [
  body("name").optional().isString().trim().notEmpty(),
  body("phone").optional().matches(/^\d{10}$/),
  body("email").optional().isEmail(),
];

const registerCompanyValidation = [
  body("name").isString().trim().notEmpty(),
  body("legalName").optional().isString(),
  body("phone").isString().trim().notEmpty(),
  body("email").optional().isEmail(),
  body("adminName").isString().trim().notEmpty(),
  body("adminPhone").isString().trim().notEmpty(),
  body("adminPassword").isString().isLength({ min: 8 }),
];

module.exports = {
  loginValidation,
  registerWorkerValidation,
  updateMeValidation,
  registerCompanyValidation,
};
