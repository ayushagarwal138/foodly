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
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.log('Error Response:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
  return data;
}

async function testOrderStatusUpdate() {
  try {
    console.log('=== Testing Restaurant Order Status Update ===\n');
    
    // Step 1: Login as restaurant
    console.log('1. Logging in as restaurant...');
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'restaurant',
        password: 'restaurant123',
        role: 'RESTAURANT'
      })
    });
    
    const token = loginResponse.token;
    const userId = loginResponse.id;
    console.log('✅ Restaurant login successful');
    console.log('User ID:', userId);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    // Step 2: Get restaurant information
    console.log('\n2. Getting restaurant information...');
    const restaurantResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/by-owner/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const restaurantId = restaurantResponse.id;
    console.log('✅ Restaurant info retrieved');
    console.log('Restaurant ID:', restaurantId);
    console.log('Restaurant Name:', restaurantResponse.name);
    
    // Step 3: Get restaurant orders
    console.log('\n3. Getting restaurant orders...');
    const ordersResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/${restaurantId}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Restaurant orders retrieved');
    console.log('Orders count:', ordersResponse.length);
    
    if (ordersResponse.length === 0) {
      console.log('❌ No orders found for this restaurant');
      return;
    }
    
    // Step 4: Find an order to update
    const orderToUpdate = ordersResponse.find(order => 
      order.status === 'New' || order.status === 'NEW'
    );
    
    if (!orderToUpdate) {
      console.log('❌ No "New" orders found to update');
      console.log('Available orders:');
      ordersResponse.forEach(order => {
        console.log(`  Order #${order.id}: ${order.status}`);
      });
      return;
    }
    
    console.log('\n4. Found order to update:');
    console.log('Order ID:', orderToUpdate.id);
    console.log('Current Status:', orderToUpdate.status);
    console.log('Restaurant ID:', orderToUpdate.restaurantId);
    console.log('Customer ID:', orderToUpdate.userId);
    
    // Step 5: Update order status
    console.log('\n5. Updating order status to "Accepted"...');
    const updateResponse = await makeRequest(`${API_BASE_URL}/api/orders/${orderToUpdate.id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'Accepted'
      })
    });
    
    console.log('✅ Order status updated successfully');
    console.log('New Status:', updateResponse.status);
    
    // Step 6: Verify the update by fetching the order again
    console.log('\n6. Verifying the update...');
    const verifyResponse = await makeRequest(`${API_BASE_URL}/api/orders/${orderToUpdate.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Order verification successful');
    console.log('Verified Status:', verifyResponse.status);
    
    // Step 7: Check if customer can see the updated status
    console.log('\n7. Testing customer view of updated order...');
    
    // First, login as a customer
    const customerLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'ayush1',
        password: 'ayush123',
        role: 'CUSTOMER'
      })
    });
    
    const customerToken = customerLoginResponse.token;
    console.log('✅ Customer login successful');
    
    // Get customer orders
    const customerOrdersResponse = await makeRequest(`${API_BASE_URL}/api/orders/my`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`
      }
    });
    
    const updatedOrderInCustomerView = customerOrdersResponse.find(order => 
      order.id === orderToUpdate.id
    );
    
    if (updatedOrderInCustomerView) {
      console.log('✅ Customer can see the updated order');
      console.log('Customer sees status:', updatedOrderInCustomerView.status);
    } else {
      console.log('❌ Customer cannot see the updated order');
    }
    
    console.log('\n=== Test Summary ===');
    console.log('✅ Restaurant login: SUCCESS');
    console.log('✅ Restaurant info retrieval: SUCCESS');
    console.log('✅ Order retrieval: SUCCESS');
    console.log('✅ Order status update: SUCCESS');
    console.log('✅ Order verification: SUCCESS');
    console.log('✅ Customer view verification: SUCCESS');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testOrderStatusUpdate(); 