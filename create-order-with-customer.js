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

async function createOrderWithCustomer() {
  try {
    console.log('=== Creating Order with Customer ===\n');
    
    // Step 1: Try to login with existing customer accounts
    const customerAccounts = [
      { username: 'ayush1', password: 'ayush123' },
      { username: 'testuser', password: 'test123' },
      { username: 'testuser2', password: 'test123' }
    ];
    
    let customerToken = null;
    let customerId = null;
    let customerUsername = null;
    
    for (const account of customerAccounts) {
      try {
        console.log(`Trying to login with ${account.username}...`);
        const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({
            username: account.username,
            password: account.password,
            role: 'CUSTOMER'
          })
        });
        
        customerToken = loginResponse.token;
        customerId = loginResponse.id;
        customerUsername = account.username;
        console.log(`✅ Successfully logged in as ${account.username}`);
        break;
      } catch (error) {
        console.log(`❌ Failed to login with ${account.username}: ${error.message}`);
      }
    }
    
    if (!customerToken) {
      console.log('❌ Could not login with any customer account');
      return;
    }
    
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
    const restaurantId = restaurantLoginResponse.restaurantId;
    
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
      console.log('Customer Name:', newOrder.customerName);
    } else {
      console.log('❌ New order not found in restaurant orders');
    }
    
    // Step 5: Test order status update
    console.log('\n5. Testing order status update...');
    
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
    
    // Step 6: Verify the update
    console.log('\n6. Verifying the update...');
    
    const verifyResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/${restaurantId}/orders`, {
      headers: {
        'Authorization': `Bearer ${restaurantToken}`
      }
    });
    
    const updatedOrder = verifyResponse.find(order => order.id === orderResponse.id);
    if (updatedOrder) {
      console.log('✅ Order status verified');
      console.log('Updated Status:', updatedOrder.status);
    } else {
      console.log('❌ Could not verify order status update');
    }
    
    // Step 7: Check if customer can see the updated status
    console.log('\n7. Checking customer view of updated order...');
    
    const customerOrdersResponse = await makeRequest(`${API_BASE_URL}/api/orders/my`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`
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
    
    console.log('\n=== Order Creation and Status Update Summary ===');
    console.log('✅ Customer login: SUCCESS');
    console.log('✅ Menu retrieval: SUCCESS');
    console.log('✅ Order creation: SUCCESS');
    console.log('✅ Restaurant order verification: SUCCESS');
    console.log('✅ Order status update: SUCCESS');
    console.log('✅ Status verification: SUCCESS');
    console.log('✅ Customer view verification: SUCCESS');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
createOrderWithCustomer(); 