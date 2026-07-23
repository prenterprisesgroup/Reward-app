require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./src/models/user.model');

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (!superAdmin) {
      console.log('No super admin found');
      process.exit(1);
    }

    const token = jwt.sign(
      { sub: superAdmin._id, role: superAdmin.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    console.log('Generated token for', superAdmin.email);

    const endpoints = [
      '/api/v1/analytics/growth?period=30d',
      '/api/v1/analytics/trends?period=30d',
      '/api/v1/analytics/top-companies?period=30d'
    ];

    for (const ep of endpoints) {
      console.log(`\n=== Testing ${ep} ===`);
      try {
        const response = await axios.get(`http://localhost:5000${ep}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Status: ${response.status}`);
        console.log(`Response Data:`, JSON.stringify(response.data).substring(0, 500) + '...');
      } catch (err) {
        console.log(`Error Response Status:`, err.response?.status);
        console.log(`Error Data:`, err.response?.data);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
