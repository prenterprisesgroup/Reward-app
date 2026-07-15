require("dotenv").config();
const axios = require("axios");

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
      phone: '9999999999',
      password: 'admin12345'
    });
    
    console.log('✓ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('✗ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
