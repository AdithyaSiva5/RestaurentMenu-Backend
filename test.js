// test.js
const readline = require('readline');

const API_URL = 'http://localhost:3000/api';
let token = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function makeRequest(endpoint, method = 'GET', body = null, useToken = false) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (useToken) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    };

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { success: false, message: error.message } };
  }
}

// Add fetch polyfill for Node.js versions that don't have it
const nodeFetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
if (!globalThis.fetch) {
  globalThis.fetch = nodeFetch;
}

async function runEdgeCaseTests() {
  try {
    // Test Case 1: Phone Auth Initiation
    console.log('\n1. Testing phone authentication...');
    let response = await makeRequest('/auth/phone/initiate', 'POST', {
      phoneNumber: '+919876543210',
      name: 'Test User',
      numberOfMembers: 2
    });
    console.log('Phone auth response:', response.data);

    // Get OTP from user
    const otp = await askQuestion('\nEnter the OTP shown in console: ');

    // Test Case 2: OTP Verification
    console.log('\n2. Testing OTP verification...');
    response = await makeRequest('/auth/phone/verify', 'POST', {
      phoneNumber: '+919876543210',
      otpCode: otp,
      verificationId: '+919876543210'
    });
    console.log('Verify response:', response.data);

    if (response.data.success) {
      token = response.data.data.token;
      console.log('Token received:', token);

      // Test Case 3: Normal Join
      console.log('\n3. Testing normal join...');
      response = await makeRequest('/waiting-list/join', 'POST', 
        { numberOfMembers: 2 }, 
        true
      );
      console.log('Join response:', response.data);

      // Test Case 4: Duplicate Join (should fail)
      console.log('\n4. Testing duplicate join...');
      response = await makeRequest('/waiting-list/join', 'POST', 
        { numberOfMembers: 2 }, 
        true
      );
      console.log('Duplicate join response:', response.data);

      // Test Case 5: Invalid Members Count
      console.log('\n5. Testing invalid members count...');
      response = await makeRequest('/waiting-list/join', 'POST', 
        { numberOfMembers: 0 }, 
        true
      );
      console.log('Invalid members response:', response.data);

      // Test Case 6: Check Status
      console.log('\n6. Testing status check...');
      response = await makeRequest('/waiting-list/status/me', 'GET', null, true);
      console.log('Status response:', response.data);

      // Test Case 7: Access Without Token
      console.log('\n7. Testing access without token...');
      response = await makeRequest('/waiting-list/join', 'POST', 
        { numberOfMembers: 2 }
      );
      console.log('No token response:', response.data);

      // Test Case 8: Customer Trying Admin Route
      console.log('\n8. Testing admin route access...');
      response = await makeRequest('/waiting-list/list', 'GET', null, true);
      console.log('Admin route response:', response.data);
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    rl.close();
  }
}

runEdgeCaseTests();