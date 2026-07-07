const axios = require('axios');

async function testOverview() {
  try {
    console.log("Testing GET /api/v1/analytics/overview?period=7d (Valid)");
    // Get super admin token first
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      phone: '9999999999',
      password: 'admin12345',
      role: 'SUPER_ADMIN'
    });
    const token = loginRes.data.data.token;

    const res = await axios.get('http://localhost:5000/api/v1/analytics/overview?period=7d', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Status:", res.status);
    console.log("Success:", res.data.success);
    console.log("SchemaVersion:", res.data.schemaVersion);
    console.log("Meta Cached:", res.data.meta.cached);
    console.log("Capabilities:", res.data.capabilities);

    console.log("\nTesting Cache Hit...");
    const res2 = await axios.get('http://localhost:5000/api/v1/analytics/overview?period=7d', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Meta Cached (2nd req):", res2.data.meta.cached);
    console.log("Cache Age:", res2.data.meta.cacheAge);

    console.log("\nTesting GET /api/v1/analytics/overview?period=500days (Invalid)");
    try {
      await axios.get('http://localhost:5000/api/v1/analytics/overview?period=500days', {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.log("Expected Error Status:", err.response.status); // Should be 400
      console.log("Error Message:", err.response.data.message);
    }
  } catch (error) {
    console.error("Test failed:", error.response ? error.response.data : error.message);
  }
}

testOverview();
