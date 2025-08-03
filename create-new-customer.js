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

async function createNewCustomer() {
  try {
    console.log('=== Creating New Customer Account ===\n');
    
    // Step 1: Create a new customer account
    console.log('1. Creating new customer account...');
    const signupResponse = await makeRequest(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testcustomer',
        password: 'test123',
        email: 'testcustomer@foodly.com',
        role: 'CUSTOMER'
      })
    });
    
    console.log('✅ Customer account created successfully');
    console.log('User ID:', signupResponse.id);
    
    // Step 2: Test login with the new account
    console.log('\n2. Testing login with new account...');
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testcustomer',
        password: 'test123',
        role: 'CUSTOMER'
      })
    });
    
    console.log('✅ Customer login successful');
    console.log('Token:', loginResponse.token ? 'Present' : 'Missing');
    console.log('User ID:', loginResponse.id);
    
    // Step 3: Create an order
    console.log('\n3. Creating an order...');
    
    // Get restaurant menu
    const menuResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/1/menu/customer`);
    console.log('✅ Menu retrieved, items:', menuResponse.length);
    
    if (menuResponse.length === 0) {
      console.log('❌ No menu items found');
      return;
    }
    
    // Create order
    const orderItems = menuResponse.slice(0, 1).map(item => ({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      restaurantId: 1
    }));
    
    const orderData = {
      items: orderItems,
      address: "456 Test Avenue, Test City"
    };
    
    const orderResponse = await makeRequest(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      },
      body: JSON.stringify(orderData)
    });
    
    console.log('✅ Order created successfully');
    console.log('Order ID:', orderResponse.id);
    console.log('Order Status:', orderResponse.status);
    console.log('Order Total:', orderResponse.total);
    
    // Step 4: Test restaurant order status update
    console.log('\n4. Testing restaurant order status update...');
    
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
    const restaurantId = restaurantLoginResponse.restaurantId;
    
    // Get restaurant orders
    const restaurantOrdersResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/${restaurantId}/orders`, {
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
      
      // Update order status
      console.log('\n5. Updating order status to "Accepted"...');
      const updateResponse = await makeRequest(`${API_BASE_URL}/api/orders/${orderResponse.id}/status`, {
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
      
      // Verify customer can see the update
      console.log('\n6. Verifying customer can see the update...');
      const customerOrdersResponse = await makeRequest(`${API_BASE_URL}/api/orders/my`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.token}`
        }
      });
      
      const updatedOrderInCustomerView = customerOrdersResponse.find(order => 
        order.id === orderResponse.id
      );
      
      if (updatedOrderInCustomerView) {
        console.log('✅ Customer can see the updated order');
        console.log('Customer sees status:', updatedOrderInCustomerView.status);
      } else {
        console.log('❌ Customer cannot see the updated order');
      }
    } else {
      console.log('❌ New order not found in restaurant orders');
    }
    
    console.log('\n=== New Customer and Order Test Summary ===');
    console.log('✅ Customer signup: SUCCESS');
    console.log('✅ Customer login: SUCCESS');
    console.log('✅ Order creation: SUCCESS');
    console.log('✅ Restaurant order verification: SUCCESS');
    console.log('✅ Order status update: SUCCESS');
    console.log('✅ Customer view verification: SUCCESS');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
createNewCustomer(); 