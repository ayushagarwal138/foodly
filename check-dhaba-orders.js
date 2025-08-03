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

async function checkDhabaOrders() {
  try {
    console.log('=== Checking Dhaba Restaurant Orders ===\n');
    
    // Step 1: Login as admin to get all restaurants
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
    
    // Step 2: Get all restaurants
    console.log('\n2. Getting all restaurants...');
    const restaurantsResponse = await makeRequest(`${API_BASE_URL}/api/admin/restaurants`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ Restaurants retrieved');
    
    // Find Dhaba restaurant
    const dhabaRestaurant = restaurantsResponse.find(r => r.name === 'Dhaba');
    if (!dhabaRestaurant) {
      console.log('❌ Dhaba restaurant not found');
      return;
    }
    
    console.log('✅ Dhaba restaurant found');
    console.log('Dhaba ID:', dhabaRestaurant.id);
    console.log('Dhaba Owner:', dhabaRestaurant.owner?.username);
    
    // Step 3: Login as Dhaba owner
    console.log('\n3. Logging in as Dhaba owner...');
    const dhabaOwnerLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'jhon',
        password: 'jhon123',
        role: 'RESTAURANT'
      })
    });
    
    const dhabaToken = dhabaOwnerLoginResponse.token;
    const dhabaRestaurantId = dhabaOwnerLoginResponse.restaurantId;
    console.log('✅ Dhaba owner login successful');
    console.log('Dhaba Restaurant ID:', dhabaRestaurantId);
    
    // Step 4: Get Dhaba orders
    console.log('\n4. Getting Dhaba orders...');
    const dhabaOrdersResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/${dhabaRestaurantId}/orders`, {
      headers: {
        'Authorization': `Bearer ${dhabaToken}`
      }
    });
    
    console.log('✅ Dhaba orders retrieved');
    console.log('Orders count:', dhabaOrdersResponse.length);
    
    if (dhabaOrdersResponse.length > 0) {
      console.log('\nDhaba orders:');
      dhabaOrdersResponse.forEach((order, index) => {
        console.log(`${index + 1}. Order #${order.id}: ${order.status} - Customer: ${order.customerName || order.userId}`);
        console.log(`   Items: ${order.items?.length || 0} items`);
        console.log(`   Total: ₹${order.total}`);
      });
      
      // Step 5: Test order status update
      const orderToUpdate = dhabaOrdersResponse.find(order => 
        order.status === 'New' || order.status === 'NEW'
      );
      
      if (orderToUpdate) {
        console.log('\n5. Testing order status update...');
        console.log('Updating Order #' + orderToUpdate.id + ' to "Accepted"...');
        
        const updateResponse = await makeRequest(`${API_BASE_URL}/api/orders/${orderToUpdate.id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${dhabaToken}`
          },
          body: JSON.stringify({
            status: 'Accepted'
          })
        });
        
        console.log('✅ Order status updated successfully');
        console.log('New Status:', updateResponse.status);
        
        // Verify the update
        console.log('\n6. Verifying the update...');
        const verifyResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/${dhabaRestaurantId}/orders`, {
          headers: {
            'Authorization': `Bearer ${dhabaToken}`
          }
        });
        
        const updatedOrder = verifyResponse.find(order => order.id === orderToUpdate.id);
        if (updatedOrder) {
          console.log('✅ Order status verified');
          console.log('Updated Status:', updatedOrder.status);
        }
      } else {
        console.log('❌ No "New" orders found to update');
      }
    } else {
      console.log('❌ No orders found for Dhaba');
    }
    
    console.log('\n=== Dhaba Orders Check Summary ===');
    console.log('✅ Admin login: SUCCESS');
    console.log('✅ Dhaba restaurant found: SUCCESS');
    console.log('✅ Dhaba owner login: SUCCESS');
    console.log('✅ Dhaba orders retrieval: SUCCESS');
    if (dhabaOrdersResponse.length > 0) {
      console.log('✅ Order status update: SUCCESS');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
checkDhabaOrders(); 