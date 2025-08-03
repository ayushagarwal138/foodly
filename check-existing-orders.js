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

async function checkExistingOrders() {
  try {
    console.log('=== Checking Existing Orders ===\n');
    
    // Step 1: Login as admin to see all orders
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
    console.log('✅ Admin login successful');
    
    // Step 2: Get all orders
    console.log('\n2. Getting all orders...');
    const allOrdersResponse = await makeRequest(`${API_BASE_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ All orders retrieved');
    console.log('Total orders:', allOrdersResponse.length);
    
    if (allOrdersResponse.length > 0) {
      console.log('\nExisting orders:');
      allOrdersResponse.forEach((order, index) => {
        console.log(`${index + 1}. Order #${order.id}: ${order.status} - Customer: ${order.userId} - Restaurant: ${order.restaurantId}`);
      });
    } else {
      console.log('❌ No orders found in the system');
    }
    
    // Step 3: Check restaurant orders specifically
    console.log('\n3. Checking restaurant orders...');
    const restaurantLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'restaurant',
        password: 'restaurant123',
        role: 'RESTAURANT'
      })
    });
    
    const restaurantToken = restaurantLoginResponse.token;
    const restaurantId = restaurantLoginResponse.restaurantId;
    console.log('✅ Restaurant login successful');
    console.log('Restaurant ID:', restaurantId);
    
    const restaurantOrdersResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/${restaurantId}/orders`, {
      headers: {
        'Authorization': `Bearer ${restaurantToken}`
      }
    });
    
    console.log('✅ Restaurant orders retrieved');
    console.log('Restaurant orders count:', restaurantOrdersResponse.length);
    
    if (restaurantOrdersResponse.length > 0) {
      console.log('\nRestaurant orders:');
      restaurantOrdersResponse.forEach((order, index) => {
        console.log(`${index + 1}. Order #${order.id}: ${order.status} - Customer: ${order.userId}`);
      });
    } else {
      console.log('❌ No orders found for this restaurant');
    }
    
    console.log('\n=== Order Check Summary ===');
    console.log('✅ Admin login: SUCCESS');
    console.log('✅ All orders check: SUCCESS');
    console.log('✅ Restaurant login: SUCCESS');
    console.log('✅ Restaurant orders check: SUCCESS');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
checkExistingOrders(); 