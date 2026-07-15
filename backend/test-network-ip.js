require("dotenv").config();
const axios = require("axios");

async function testNetworkIP() {
  const networkIP = '10.154.208.12';
  const port = 5000;
  const url = `http://${networkIP}:${port}/api/v1/auth/login`;
  
  console.log('Testing backend accessibility from network IP...');
  console.log('URL:', url);
  
  try {
    const response = await axios.post(url, {
      phone: '9999999999',
      password: 'admin12345'
    }, {
      timeout: 5000
    });
    
    console.log('✓ Backend is accessible from network IP!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('✗ Backend NOT accessible from network IP!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('Error:', error.message);
      console.log('Possible causes:');
      console.log('  1. Backend not listening on network interface');
      console.log('  2. Firewall blocking connection');
      console.log('  3. Wrong IP address');
    } else {
      console.log('Error:', error.message);
    }
  }
}

testNetworkIP();
