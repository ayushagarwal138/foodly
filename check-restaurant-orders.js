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

async function checkRestaurantOrders() {
  try {
    console.log('=== Checking Restaurant Orders ===\n');
    
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
    console.log('Restaurants count:', restaurantsResponse.length);
    
    // Step 3: Check orders for each restaurant
    console.log('\n3. Checking orders for each restaurant...');
    
    for (const restaurant of restaurantsResponse) {
      console.log(`\n--- Checking orders for ${restaurant.name} (ID: ${restaurant.id}) ---`);
      
      try {
        const ordersResponse = await makeRequest(`${API_BASE_URL}/api/restaurants/${restaurant.id}/orders`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        console.log(`✅ Orders for ${restaurant.name}: ${ordersResponse.length}`);
        
        if (ordersResponse.length > 0) {
          console.log('Orders found:');
          ordersResponse.forEach((order, index) => {
            console.log(`  ${index + 1}. Order #${order.id}: ${order.status} - Customer: ${order.userId}`);
          });
        }
      } catch (error) {
        console.log(`❌ Error getting orders for ${restaurant.name}:`, error.message);
      }
    }
    
    console.log('\n=== Restaurant Orders Check Summary ===');
    console.log('✅ Admin login: SUCCESS');
    console.log('✅ Restaurants retrieval: SUCCESS');
    console.log('✅ Orders check for all restaurants: COMPLETE');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
checkRestaurantOrders(); 