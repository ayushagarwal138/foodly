const fetch = require('node-fetch').default;

const API_BASE_URL = 'https://foodly-backend-uv7m.onrender.com';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  console.log(`\n${options.method || 'GET'} ${url}`);
  console.log('Status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.log('Error Response:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
  return data;
}

async function createCustomerUser() {
  try {
    console.log('=== Creating Customer User ===\n');
    
    // Create customer user via signup
    console.log('1. Creating customer user...');
    const signupResponse = await makeRequest(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'ayush1',
        password: 'ayush123',
        email: 'ayush1@foodly.com',
        role: 'CUSTOMER'
      })
    });
    
    console.log('✅ Customer user created successfully');
    console.log('User ID:', signupResponse.id);
    
    // Test login with the new user
    console.log('\n2. Testing login with new customer...');
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'ayush1',
        password: 'ayush123',
        role: 'CUSTOMER'
      })
    });
    
    console.log('✅ Customer login successful');
    console.log('Token:', loginResponse.token ? 'Present' : 'Missing');
    console.log('User ID:', loginResponse.id);
    
    console.log('\n=== Customer User Creation Summary ===');
    console.log('✅ Customer signup: SUCCESS');
    console.log('✅ Customer login: SUCCESS');
    console.log('✅ Customer user ready for testing');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
createCustomerUser(); 