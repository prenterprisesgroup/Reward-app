require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("./src/config/database");
const User = require("./src/models/user.model");

async function checkSuperAdmin() {
  try {
    await connectDatabase();
    const admin = await User.findOne({ role: 'SUPER_ADMIN' });
    
    if (admin) {
      console.log('✓ Super Admin found:');
      console.log('  Name:', admin.name);
      console.log('  Phone:', admin.phone);
      console.log('  Email:', admin.email);
      console.log('  Active:', admin.isActive);
      console.log('  Role:', admin.role);
      console.log('  ID:', admin._id);
    } else {
      console.log('✗ Super Admin NOT found in database');
      console.log('You need to seed the superadmin user first.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkSuperAdmin();
