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

async function testOrderStatusUpdate() {
  console.log('🔍 Testing Order Status Update Issue...\n');
  
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
  
  // Step 2: Test the existing order (ID 1) that belongs to restaurant 3
  console.log('\n2. Testing existing order (ID 1) that belongs to restaurant 3...');
  const existingOrderResponse = await makeRequest(`${API_BASE}/api/orders/1/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify({ status: 'Accepted' }))
    },
    body: JSON.stringify({ status: 'Accepted' })
  });
  
  console.log(`Order 1 status update result: ${existingOrderResponse.status}`);
  if (existingOrderResponse.status !== 200) {
    console.log(`Error: ${JSON.stringify(existingOrderResponse.data)}`);
  }
  
  // Step 3: Check what orders this restaurant actually owns
  console.log('\n3. Checking orders for this restaurant...');
  const ordersResponse = await makeRequest(`${API_BASE}/api/restaurants/${restaurantId}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (ordersResponse.status === 200) {
    const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
    console.log(`✅ Found ${orders.length} orders for restaurant ${restaurantId}`);
    
    if (orders.length > 0) {
      const testOrder = orders[0];
      console.log(`\n4. Testing order status update for order ${testOrder.id}...`);
      
      const updateResponse = await makeRequest(`${API_BASE}/api/orders/${testOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify({ status: 'Accepted' }))
        },
        body: JSON.stringify({ status: 'Accepted' })
      });
      
      if (updateResponse.status === 200) {
        console.log('✅ Order status update successful!');
        console.log(`Updated order: ${JSON.stringify(updateResponse.data)}`);
      } else {
        console.log(`❌ Order status update failed: ${updateResponse.status}`);
        console.log(`Error: ${JSON.stringify(updateResponse.data)}`);
      }
    }
  }
  
  // Step 5: Debug the issue
  console.log('\n5. Debugging the issue...');
  console.log('The problem is likely that:');
  console.log('- Order ID 1 belongs to restaurant ID 3 (Dhaba)');
  console.log('- But the logged-in user owns restaurant ID 1 (Pizza Palace)');
  console.log('- The OrderController correctly prevents cross-restaurant access');
  console.log('- This is actually working as intended for security');
  
  // Step 6: Test with the correct restaurant user
  console.log('\n6. Testing with the correct restaurant user (jhon)...');
  console.log('Note: We need to find the correct password for user "jhon"');
  console.log('User "jhon" (ID 4) owns restaurant "Dhaba" (ID 3)');
  console.log('Order ID 1 belongs to restaurant ID 3, so "jhon" should be able to update it');
  
  // Step 7: Try to create a test order for the current restaurant
  console.log('\n7. Creating a test order for the current restaurant...');
  const testOrderData = JSON.stringify({
    userId: 3, // customer user
    restaurantId: restaurantId,
    items: [
      {
        menuItemId: 1,
        name: "Pepperoni Pizza",
        price: 12.99,
        quantity: 1
      }
    ],
    total: 12.99,
    status: "NEW"
  });
  
  const createOrderResponse = await makeRequest(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testOrderData)
    },
    body: testOrderData
  });
  
  if (createOrderResponse.status === 200) {
    console.log('✅ Test order created successfully!');
    const newOrder = createOrderResponse.data;
    console.log(`Order ID: ${newOrder.id}`);
    
    // Test status update on the new order
    console.log('\n8. Testing status update on the new order...');
    const newOrderUpdateResponse = await makeRequest(`${API_BASE}/api/orders/${newOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify({ status: 'Accepted' }))
      },
      body: JSON.stringify({ status: 'Accepted' })
    });
    
    if (newOrderUpdateResponse.status === 200) {
      console.log('✅ Status update on new order successful!');
      console.log('This confirms the order status update functionality works correctly');
    } else {
      console.log(`❌ Status update on new order failed: ${newOrderUpdateResponse.status}`);
      console.log(`Error: ${JSON.stringify(newOrderUpdateResponse.data)}`);
    }
  } else {
    console.log(`❌ Failed to create test order: ${createOrderResponse.status}`);
    console.log(`Error: ${JSON.stringify(createOrderResponse.data)}`);
  }
}

testOrderStatusUpdate().catch(console.error); 