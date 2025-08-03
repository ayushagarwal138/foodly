const https = require('https');

const API_BASE = 'https://foodly-backend-uv7m.onrender.com';

async function makeRequest(url, options = {}) {
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

async function testRestaurantAuthentication() {
  console.log('🔍 Testing Restaurant Authentication and Order Status Update...\n');
  
  // Test 1: Login as restaurant user
  console.log('1. Testing Restaurant Login...');
  const loginData = JSON.stringify({
    username: 'restaurant',
    password: 'restaurant123',
    role: 'RESTAURANT'
  });
  
  const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    },
    body: loginData
  });
  
  if (loginResponse.status !== 200) {
    console.log(`❌ Login failed: ${JSON.stringify(loginResponse.data)}`);
    return;
  }
  
  const token = loginResponse.data.token;
  const userId = loginResponse.data.id;
  const restaurantId = loginResponse.data.restaurantId;
  console.log(`✅ Login successful - User ID: ${userId}, Restaurant ID: ${restaurantId}, Token: ${token ? token.substring(0, 20) + '...' : 'NULL'}`);
  
  // Test 2: Get restaurant by owner
  console.log('\n2. Testing Get Restaurant by Owner...');
  const restaurantResponse = await makeRequest(`${API_BASE}/api/restaurants/by-owner/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (restaurantResponse.status !== 200) {
    console.log(`❌ Get restaurant failed: ${JSON.stringify(restaurantResponse.data)}`);
    return;
  }
  
  const actualRestaurantId = restaurantResponse.data.id;
  console.log(`✅ Restaurant found - ID: ${actualRestaurantId}, Name: ${restaurantResponse.data.name}`);
  
  // Test 3: Get orders for restaurant
  console.log('\n3. Testing Get Restaurant Orders...');
  const ordersResponse = await makeRequest(`${API_BASE}/api/restaurants/${actualRestaurantId}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (ordersResponse.status !== 200) {
    console.log(`❌ Get orders failed: ${JSON.stringify(ordersResponse.data)}`);
    return;
  }
  
  const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
  console.log(`✅ Found ${orders.length} orders for restaurant`);
  
  if (orders.length === 0) {
    console.log('⚠️  No orders found to test status update');
    return;
  }
  
  // Test 4: Update order status
  const testOrder = orders[0];
  console.log(`\n4. Testing Order Status Update for Order ID: ${testOrder.id}...`);
  
  const updateData = JSON.stringify({ status: 'Accepted' });
  const updateResponse = await makeRequest(`${API_BASE}/api/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(updateData)
    },
    body: updateData
  });
  
  if (updateResponse.status === 200) {
    console.log('✅ Order status update successful!');
    console.log(`   Updated order: ${JSON.stringify(updateResponse.data)}`);
  } else {
    console.log(`❌ Order status update failed: ${updateResponse.status}`);
    console.log(`   Error: ${JSON.stringify(updateResponse.data)}`);
  }
  
  // Test 5: Debug user information
  console.log('\n5. Debugging User Information...');
  console.log(`   User ID from login: ${userId}`);
  console.log(`   Restaurant ID from login: ${restaurantId}`);
  console.log(`   Actual Restaurant ID: ${actualRestaurantId}`);
  console.log(`   Order Restaurant ID: ${testOrder.restaurantId}`);
  console.log(`   Order ID: ${testOrder.id}`);
  console.log(`   Order Status: ${testOrder.status}`);
  
  // Test 6: Check if user can access the order directly
  console.log('\n6. Testing Direct Order Access...');
  const orderResponse = await makeRequest(`${API_BASE}/api/orders/${testOrder.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (orderResponse.status === 200) {
    console.log('✅ Can access order directly');
  } else {
    console.log(`❌ Cannot access order directly: ${orderResponse.status}`);
  }
}

testRestaurantAuthentication().catch(console.error); 