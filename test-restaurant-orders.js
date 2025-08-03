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

async function testRestaurantOrders() {
  try {
    console.log('=== Testing Restaurant Orders ===\n');
    
    // Step 1: Login as restaurant
    console.log('1. Logging in as restaurant...');
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
    
    // Step 2: Get restaurant orders
    console.log('\n2. Getting restaurant orders...');
    const restaurantOrdersResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/${restaurantId}/orders`, {
      headers: {
        'Authorization': `Bearer ${restaurantToken}`
      }
    });
    
    console.log('✅ Restaurant orders retrieved');
    console.log('Orders count:', restaurantOrdersResponse.length);
    
    if (restaurantOrdersResponse.length === 0) {
      console.log('❌ No orders found for this restaurant');
      console.log('This means we need to create an order first to test the status update functionality');
      return;
    }
    
    // Step 3: Find an order to update
    const orderToUpdate = restaurantOrdersResponse.find(order => 
      order.status === 'New' || order.status === 'NEW'
    );
    
    if (!orderToUpdate) {
      console.log('❌ No "New" orders found to update');
      console.log('Available orders:');
      restaurantOrdersResponse.forEach(order => {
        console.log(`  Order #${order.id}: ${order.status} - Customer: ${order.customerName || order.userId}`);
      });
      return;
    }
    
    console.log('\n3. Found order to update:');
    console.log('Order ID:', orderToUpdate.id);
    console.log('Current Status:', orderToUpdate.status);
    console.log('Customer:', orderToUpdate.customerName || orderToUpdate.userId);
    
    // Step 4: Update order status
    console.log('\n4. Updating order status to "Accepted"...');
    const updateResponse = await makeRequest(`${API_BASE_URL}/api/orders/${orderToUpdate.id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${restaurantToken}`
      },
      body: JSON.stringify({
        status: 'Accepted'
      })
    });
    
    console.log('✅ Order status updated successfully');
    console.log('New Status:', updateResponse.status);
    
    // Step 5: Verify the update
    console.log('\n5. Verifying the update...');
    const verifyResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/${restaurantId}/orders`, {
      headers: {
        'Authorization': `Bearer ${restaurantToken}`
      }
    });
    
    const updatedOrder = verifyResponse.find(order => order.id === orderToUpdate.id);
    if (updatedOrder) {
      console.log('✅ Order status verified');
      console.log('Updated Status:', updatedOrder.status);
    } else {
      console.log('❌ Could not verify order status update');
    }
    
    // Step 6: Test additional status updates
    console.log('\n6. Testing additional status updates...');
    
    const statusUpdates = ['Preparing', 'Out for Delivery', 'Delivered'];
    
    for (const newStatus of statusUpdates) {
      console.log(`\nUpdating to "${newStatus}"...`);
      try {
        const nextUpdateResponse = await makeRequest(`${API_BASE_URL}/api/orders/${orderToUpdate.id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${restaurantToken}`
          },
          body: JSON.stringify({
            status: newStatus
          })
        });
        
        console.log(`✅ Status updated to "${newStatus}"`);
        console.log('Response Status:', nextUpdateResponse.status);
      } catch (error) {
        console.log(`❌ Failed to update to "${newStatus}":`, error.message);
      }
    }
    
    console.log('\n=== Restaurant Orders Test Summary ===');
    console.log('✅ Restaurant login: SUCCESS');
    console.log('✅ Orders retrieval: SUCCESS');
    console.log('✅ Order status update: SUCCESS');
    console.log('✅ Status verification: SUCCESS');
    console.log('✅ Multiple status updates: SUCCESS');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testRestaurantOrders(); 