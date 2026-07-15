require("dotenv").config();
const axios = require("axios");

async function testAnalytics() {
  try {
    // First login to get token
    const loginResponse = await axios.post('http://10.154.208.12:5000/api/v1/auth/login', {
      phone: '9999999999',
      password: 'admin12345'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Login successful');
    
    // Test top companies endpoint
    const topCompaniesResponse = await axios.get('http://10.154.208.12:5000/api/v1/analytics/top-companies', {
      params: { period: '30d', sortBy: 'rewards' },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Top Companies API successful');
    console.log('Data:', JSON.stringify(topCompaniesResponse.data, null, 2));
  } catch (error) {
    console.log('✗ Test failed');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testAnalytics();
