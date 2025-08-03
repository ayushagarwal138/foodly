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

async function testAdminRole() {
  try {
    console.log('=== Testing Admin Role ===\n');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN'
      })
    });
    
    const adminToken = adminLoginResponse.token;
    const adminId = adminLoginResponse.id;
    console.log('✅ Admin login successful');
    console.log('Admin ID:', adminId);
    console.log('Token:', adminToken ? 'Present' : 'Missing');
    
    // Step 2: Try to access admin endpoints
    console.log('\n2. Testing admin endpoints...');
    
    // Try to get all users (admin endpoint)
    try {
      const usersResponse = await makeRequest(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log('✅ Admin can access users endpoint');
    } catch (error) {
      console.log('❌ Admin cannot access users endpoint:', error.message);
    }
    
    // Try to get all restaurants (admin endpoint)
    try {
      const restaurantsResponse = await makeRequest(`${API_BASE_URL}/api/admin/restaurants`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log('✅ Admin can access restaurants endpoint');
    } catch (error) {
      console.log('❌ Admin cannot access restaurants endpoint:', error.message);
    }
    
    // Try to get all orders (admin endpoint)
    try {
      const ordersResponse = await makeRequest(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log('✅ Admin can access orders endpoint');
      console.log('Orders count:', ordersResponse.length);
    } catch (error) {
      console.log('❌ Admin cannot access orders endpoint:', error.message);
    }
    
    console.log('\n=== Admin Role Test Summary ===');
    console.log('✅ Admin login: SUCCESS');
    console.log('✅ Admin role verification: COMPLETE');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testAdminRole(); 