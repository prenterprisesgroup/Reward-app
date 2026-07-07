const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/user.model");
const Company = require("../../src/models/company.model");
const { generateAuthToken } = require("../../src/utils/auth-token");

async function createMockCompany() {
  const company = await Company.create({
    name: "Test Corp",
    email: "corp@test.com",
    phone: "+1234567890",
    status: "ACTIVE"
  });
  return company;
}

async function createMockUser(role = "COMPANY_ADMIN", companyId = null) {
  if (!companyId && role !== "SUPER_ADMIN") {
    const company = await createMockCompany();
    companyId = company._id;
  }
  
  const user = await User.create({
    name: "Test User",
    email: `test-${Date.now()}@test.com`,
    password: "Password123!",
    phone: `+123456${Math.floor(1000 + Math.random() * 9000)}`,
    role,
    company: companyId,
    isActive: true
  });
  
  const token = generateAuthToken(user._id);
  
  return { user, token };
}

// Global assert for standard contract
function assertStandardContract(res) {
  expect(res.body).toHaveProperty("success");
  expect(res.body).toHaveProperty("meta");
  if (res.body.success) {
    expect(res.body).toHaveProperty("data");
  } else {
    expect(res.body).toHaveProperty("error");
  }
}

module.exports = {
  app,
  createMockUser,
  createMockCompany,
  assertStandardContract
};
