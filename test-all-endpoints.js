const https = require('https');

const API_BASE = 'https://foodly-backend-uv7m.onrender.com';

// Test credentials
const TEST_CREDENTIALS = {
  customer: { username: 'john', password: 'password123', role: 'CUSTOMER' },
  restaurant: { username: 'jhon', password: 'restaurant123', role: 'RESTAURANT' },
  admin: { username: 'admin', password: 'admin123', role: 'ADMIN' }
};

let customerToken = '';
let restaurantToken = '';
let adminToken = '';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n🔍 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await makeRequest(url, options);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`   ✅ SUCCESS (${response.status})`);
      if (response.data && typeof response.data === 'object') {
        console.log(`   📊 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } else {
      console.log(`   ❌ FAILED (${response.status})`);
      console.log(`   📄 Response: ${JSON.stringify(response.data)}`);
    }
    
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
    return false;
  }
}

async function loginUser(credentials) {
  const loginData = JSON.stringify({
    username: credentials.username,
    password: credentials.password,
    role: credentials.role
  });
  
  const response = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    },
    body: loginData
  });
  
  if (response.status === 200 && response.data.token) {
    return response.data.token;
  }
  throw new Error(`Login failed: ${JSON.stringify(response.data)}`);
}

async function runTests() {
  console.log('🚀 Starting comprehensive API tests...\n');
  
  // Test 1: Health check
  await testEndpoint('Health Check', `${API_BASE}/`);
  
  // Test 2: Login all users
  console.log('\n🔐 Testing User Authentication...');
  
  try {
    customerToken = await loginUser(TEST_CREDENTIALS.customer);
    console.log('   ✅ Customer login successful');
  } catch (error) {
    console.log(`   ❌ Customer login failed: ${error.message}`);
  }
  
  try {
    restaurantToken = await loginUser(TEST_CREDENTIALS.restaurant);
    console.log('   ✅ Restaurant login successful');
  } catch (error) {
    console.log(`   ❌ Restaurant login failed: ${error.message}`);
  }
  
  try {
    adminToken = await loginUser(TEST_CREDENTIALS.admin);
    console.log('   ✅ Admin login successful');
  } catch (error) {
    console.log(`   ❌ Admin login failed: ${error.message}`);
  }
  
  // Test 3: Public endpoints
  console.log('\n🌐 Testing Public Endpoints...');
  await testEndpoint('Get All Restaurants', `${API_BASE}/api/restaurants`);
  await testEndpoint('Get All Offers', `${API_BASE}/api/offers`);
  
  // Test 4: Customer endpoints
  if (customerToken) {
    console.log('\n👤 Testing Customer Endpoints...');
    await testEndpoint('Get Customer Cart', `${API_BASE}/api/cart`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    await testEndpoint('Get Customer Favorites', `${API_BASE}/api/customers/1/favorites`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    await testEndpoint('Get Customer Orders', `${API_BASE}/api/orders/my`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
  }
  
  // Test 5: Restaurant endpoints
  if (restaurantToken) {
    console.log('\n🍽️ Testing Restaurant Endpoints...');
    await testEndpoint('Get Restaurant Orders', `${API_BASE}/api/restaurants/3/orders`, {
      headers: { 'Authorization': `Bearer ${restaurantToken}` }
    });
    await testEndpoint('Get Restaurant Menu', `${API_BASE}/api/restaurants/3/menu`, {
      headers: { 'Authorization': `Bearer ${restaurantToken}` }
    });
    await testEndpoint('Get Restaurant Analytics', `${API_BASE}/api/restaurants/3/analytics`, {
      headers: { 'Authorization': `Bearer ${restaurantToken}` }
    });
    
    // Test order status update
    const updateData = JSON.stringify({ status: 'Accepted' });
    await testEndpoint('Update Order Status', `${API_BASE}/api/orders/1/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${restaurantToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updateData)
      },
      body: updateData
    });
  }
  
  // Test 6: Admin endpoints
  if (adminToken) {
    console.log('\n👑 Testing Admin Endpoints...');
    await testEndpoint('Get All Users', `${API_BASE}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    await testEndpoint('Get All Restaurants (Admin)', `${API_BASE}/api/admin/restaurants`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    await testEndpoint('Get All Orders (Admin)', `${API_BASE}/api/admin/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
  }
  
  // Test 7: CORS preflight test
  console.log('\n🔄 Testing CORS Preflight...');
  await testEndpoint('CORS Preflight', `${API_BASE}/api/restaurants`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://foodly11.netlify.app',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Authorization'
    }
  });
  
  console.log('\n🎉 All tests completed!');
}

runTests().catch(console.error); 