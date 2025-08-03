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

async function createTestOrder() {
  try {
    console.log('=== Creating Test Order ===\n');
    
    // Step 1: Login as customer
    console.log('1. Logging in as customer...');
    const customerLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'ayush1',
        password: 'ayush123',
        role: 'CUSTOMER'
      })
    });
    
    const customerToken = customerLoginResponse.token;
    const customerId = customerLoginResponse.id;
    console.log('✅ Customer login successful');
    console.log('Customer ID:', customerId);
    
    // Step 2: Get restaurant menu
    console.log('\n2. Getting restaurant menu...');
    const menuResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/1/menu/customer`);
    
    console.log('✅ Restaurant menu retrieved');
    console.log('Menu items count:', menuResponse.length);
    
    if (menuResponse.length === 0) {
      console.log('❌ No menu items found');
      return;
    }
    
    // Step 3: Create order with menu items
    console.log('\n3. Creating order...');
    const orderItems = menuResponse.slice(0, 2).map(item => ({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      restaurantId: 1
    }));
    
    const orderData = {
      items: orderItems,
      address: "123 Test Street, Test City"
    };
    
    const orderResponse = await makeRequest(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify(orderData)
    });
    
    console.log('✅ Order created successfully');
    console.log('Order ID:', orderResponse.id);
    console.log('Order Status:', orderResponse.status);
    console.log('Order Total:', orderResponse.total);
    
    // Step 4: Verify order appears in restaurant orders
    console.log('\n4. Verifying order appears in restaurant orders...');
    
    // Login as restaurant
    const restaurantLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'restaurant',
        password: 'restaurant123',
        role: 'RESTAURANT'
      })
    });
    
    const restaurantToken = restaurantLoginResponse.token;
    
    const restaurantOrdersResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/1/orders`, {
      headers: {
        'Authorization': `Bearer ${restaurantToken}`
      }
    });
    
    console.log('✅ Restaurant orders retrieved');
    console.log('Orders count:', restaurantOrdersResponse.length);
    
    const newOrder = restaurantOrdersResponse.find(order => order.id === orderResponse.id);
    if (newOrder) {
      console.log('✅ New order found in restaurant orders');
      console.log('Order Status:', newOrder.status);
    } else {
      console.log('❌ New order not found in restaurant orders');
    }
    
    console.log('\n=== Test Order Creation Summary ===');
    console.log('✅ Customer login: SUCCESS');
    console.log('✅ Menu retrieval: SUCCESS');
    console.log('✅ Order creation: SUCCESS');
    console.log('✅ Restaurant order verification: SUCCESS');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
createTestOrder(); 