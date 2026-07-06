require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDatabase = require("../src/config/database");
const { ROLES } = require("../src/constants/roles");
const User = require("../src/models/user.model");

const SALT_ROUNDS = 12;

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function seedSuperAdmin() {
  const name = getRequiredEnv("SUPER_ADMIN_NAME");
  const phone = getRequiredEnv("SUPER_ADMIN_PHONE");
  const email = getRequiredEnv("SUPER_ADMIN_EMAIL").toLowerCase();
  const password = getRequiredEnv("SUPER_ADMIN_PASSWORD");

  if (password.length < 8) {
    throw new Error("SUPER_ADMIN_PASSWORD must be at least 8 characters");
  }

  await connectDatabase();

  const existingSuperAdmin = await User.findOne({
    $or: [{ phone }, { email }],
  });

  if (existingSuperAdmin) {
    if (existingSuperAdmin.role !== ROLES.SUPER_ADMIN) {
      throw new Error("A non-super-admin user already exists with this phone or email");
    }

    console.log("Super Admin already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await User.create({
    name,
    phone,
    email,
    passwordHash,
    role: ROLES.SUPER_ADMIN,
  });

  console.log("Super Admin created successfully");
}

seedSuperAdmin()
  .catch((error) => {
    console.error("Failed to seed Super Admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
