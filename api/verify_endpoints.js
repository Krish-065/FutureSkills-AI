const axios = require("axios");

async function runTests() {
  const baseURL = "http://localhost:5000/api";
  const uniqueEmail = `user_${Date.now()}@example.com`;

  console.log("🚀 Starting API verification tests...");

  try {
    // 1. Test Signup
    console.log(`\n1. Testing Signup for: ${uniqueEmail}`);
    const signupRes = await axios.post(`${baseURL}/auth/signup`, {
      name: "Verification User",
      email: uniqueEmail,
      password: "password123"
    });
    console.log("✅ Signup Successful. Status Code:", signupRes.status);
    console.log("Signup Response ID:", signupRes.data.userId);

    // 2. Test Login
    console.log("\n2. Testing Login...");
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: uniqueEmail,
      password: "password123"
    });
    console.log("✅ Login Successful. Status Code:", loginRes.status);
    const token = loginRes.data.token;
    console.log("Auth Token received:", token.substring(0, 25) + "...");

    // Setup headers
    const headers = { Authorization: token };

    // 3. Test Stats Summary
    console.log("\n3. Testing GET /stats/summary...");
    const summaryRes = await axios.get(`${baseURL}/stats/summary`, { headers });
    console.log("✅ /stats/summary Successful. Status Code:", summaryRes.status);
    console.log("Summary data snippet:", JSON.stringify(summaryRes.data.data));

    // 4. Test ML Forecast
    console.log("\n4. Testing GET /stats/forecast...");
    const forecastRes = await axios.get(`${baseURL}/stats/forecast?metric=jobs&horizon=14`, { headers });
    console.log("✅ /stats/forecast Successful. Status Code:", forecastRes.status);
    console.log("Forecast validation metadata:", JSON.stringify(forecastRes.data.data.metadata));
    console.log("Forecast count:", forecastRes.data.data.forecast.length);

    // 5. Test Jobs list
    console.log("\n5. Testing GET /stats/jobs...");
    const jobsRes = await axios.get(`${baseURL}/stats/jobs`, { headers });
    console.log("✅ /stats/jobs Successful. Status Code:", jobsRes.status);
    console.log("Jobs fetched count:", jobsRes.data.data.length);

    console.log("\n💯 SUCCESS: All MERN & Python microservice integration endpoints are working perfectly!");

  } catch (error) {
    console.error("❌ Test failed!");
    if (error.response) {
      console.error("Response Error Status:", error.response.status);
      console.error("Response Error Data:", error.response.data);
    } else {
      console.error("Error Message:", error.message);
    }
  }
}

runTests();
