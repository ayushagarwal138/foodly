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

async function debugRestaurantOrders() {
  console.log('🔍 Debugging Restaurant Orders Issue...\n');
  
  // Step 1: Login as restaurant user
  console.log('1. Logging in as restaurant user...');
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
  console.log(`✅ Login successful - User ID: ${userId}, Restaurant ID: ${restaurantId}`);
  
  // Step 2: Get restaurant by owner
  console.log('\n2. Getting restaurant by owner...');
  const restaurantResponse = await makeRequest(`${API_BASE}/api/restaurants/by-owner/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (restaurantResponse.status === 200) {
    console.log(`✅ Restaurant found: ${restaurantResponse.data.name} (ID: ${restaurantResponse.data.id})`);
  } else {
    console.log(`❌ Failed to get restaurant: ${restaurantResponse.status}`);
  }
  
  // Step 3: Get orders for this restaurant
  console.log('\n3. Getting orders for this restaurant...');
  const ordersResponse = await makeRequest(`${API_BASE}/api/restaurants/${restaurantId}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (ordersResponse.status === 200) {
    const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
    console.log(`✅ Found ${orders.length} orders for restaurant ${restaurantId}`);
    
    if (orders.length > 0) {
      console.log('Orders:');
      orders.forEach(order => {
        console.log(`  - Order ID: ${order.id}, Status: ${order.status}, Customer: ${order.customerName}`);
      });
    } else {
      console.log('No orders found for this restaurant');
    }
  } else {
    console.log(`❌ Failed to get orders: ${ordersResponse.status}`);
    console.log(`Error: ${JSON.stringify(ordersResponse.data)}`);
  }
  
  // Step 4: Check if there are any orders at all in the system
  console.log('\n4. Checking all orders in the system...');
  const allOrdersResponse = await makeRequest(`${API_BASE}/api/admin/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (allOrdersResponse.status === 200) {
    const allOrders = Array.isArray(allOrdersResponse.data) ? allOrdersResponse.data : [];
    console.log(`✅ Found ${allOrders.length} total orders in the system`);
    
    if (allOrders.length > 0) {
      console.log('All orders:');
      allOrders.forEach(order => {
        console.log(`  - Order ID: ${order.id}, Restaurant ID: ${order.restaurantId}, Status: ${order.status}`);
      });
    }
  } else {
    console.log(`❌ Failed to get all orders: ${allOrdersResponse.status}`);
  }
  
  // Step 5: Check what the frontend might be calling
  console.log('\n5. Checking alternative endpoints the frontend might be using...');
  
  // Check if frontend is calling /api/orders instead of /api/restaurants/{id}/orders
  const allOrdersForUserResponse = await makeRequest(`${API_BASE}/api/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (allOrdersForUserResponse.status === 200) {
    const userOrders = Array.isArray(allOrdersForUserResponse.data) ? allOrdersForUserResponse.data : [];
    console.log(`✅ Found ${userOrders.length} orders when calling /api/orders`);
    
    if (userOrders.length > 0) {
      console.log('Orders from /api/orders:');
      userOrders.forEach(order => {
        console.log(`  - Order ID: ${order.id}, Restaurant ID: ${order.restaurantId}, Status: ${order.status}`);
      });
    }
  } else {
    console.log(`❌ Failed to get orders from /api/orders: ${allOrdersForUserResponse.status}`);
  }
  
  // Step 6: Summary
  console.log('\n6. Summary:');
  console.log(`- Logged in user: ${userId} (restaurant)`);
  console.log(`- User's restaurant ID: ${restaurantId}`);
  console.log(`- Order ID 1 belongs to restaurant ID 3`);
  console.log(`- The 403 error is correct - user cannot update order from another restaurant`);
  console.log(`- The issue is that the frontend is showing orders that don't belong to this restaurant`);
  console.log(`- This could be due to:`);
  console.log(`  1. Frontend calling wrong endpoint`);
  console.log(`  2. Frontend not properly filtering orders`);
  console.log(`  3. Caching issue in the frontend`);
  console.log(`  4. Frontend using wrong restaurant ID`);
}

debugRestaurantOrders().catch(console.error); 