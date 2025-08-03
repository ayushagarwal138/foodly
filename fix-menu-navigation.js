const https = require('https');

const API_BASE = 'https://foodly-backend-uv7m.onrender.com';
const FRONTEND_BASE = 'https://foodly11.netlify.app';

async function testEndpoint(name, url, options = {}) {
  return new Promise((resolve) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode >= 200 && res.statusCode < 300;
        console.log(`${success ? '✅' : '❌'} ${name}: ${res.statusCode}`);
        if (!success) {
          console.log(`   Error: ${data.substring(0, 100)}...`);
        }
        resolve({ success, status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name}: Network Error - ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function diagnoseMenuNavigation() {
  console.log('🔍 Diagnosing Menu Navigation Issue...\n');
  
  // Test 1: Check if restaurants are accessible
  console.log('1. Testing Restaurant List...');
  const restaurantsResult = await testEndpoint('Get All Restaurants', `${API_BASE}/api/restaurants`, {
    headers: { 'Origin': FRONTEND_BASE }
  });
  
  if (!restaurantsResult.success) {
    console.log('❌ Cannot fetch restaurants. Backend issue.');
    return;
  }
  
  // Test 2: Check specific restaurant by slug
  console.log('\n2. Testing Restaurant by Slug...');
  const restaurantResult = await testEndpoint('Get Restaurant by Slug', `${API_BASE}/api/restaurants/slug/pizza-palace`, {
    headers: { 'Origin': FRONTEND_BASE }
  });
  
  if (!restaurantResult.success) {
    console.log('❌ Cannot fetch restaurant by slug. Backend issue.');
    return;
  }
  
  // Parse restaurant data to get ID
  let restaurantId;
  try {
    const restaurantData = JSON.parse(restaurantResult.data);
    restaurantId = restaurantData.id;
    console.log(`   Restaurant ID: ${restaurantId}`);
  } catch (e) {
    console.log('❌ Cannot parse restaurant data.');
    return;
  }
  
  // Test 3: Check menu endpoint
  console.log('\n3. Testing Menu Endpoint...');
  const menuResult = await testEndpoint('Get Restaurant Menu', `${API_BASE}/api/restaurants/${restaurantId}/menu/customer`, {
    headers: { 'Origin': FRONTEND_BASE }
  });
  
  if (!menuResult.success) {
    console.log('❌ Cannot fetch menu. Backend issue.');
    return;
  }
  
  // Test 4: Check frontend accessibility
  console.log('\n4. Testing Frontend Accessibility...');
  const frontendResult = await testEndpoint('Frontend Homepage', FRONTEND_BASE);
  
  if (!frontendResult.success) {
    console.log('❌ Frontend not accessible. Deployment issue.');
    return;
  }
  
  // Test 5: Check specific frontend routes
  console.log('\n5. Testing Frontend Routes...');
  const routes = [
    '/customer/login',
    '/customer/restaurants',
    '/customer/restaurant/pizza-palace'
  ];
  
  for (const route of routes) {
    const routeResult = await testEndpoint(`Frontend Route: ${route}`, `${FRONTEND_BASE}${route}`);
    if (!routeResult.success) {
      console.log(`   ⚠️  Route ${route} might have issues`);
    }
  }
  
  console.log('\n📊 Diagnosis Complete!');
  console.log('\n💡 If all tests pass but menu still doesn\'t work:');
  console.log('   1. Clear browser cache completely');
  console.log('   2. Try incognito/private window');
  console.log('   3. Check browser console for JavaScript errors');
  console.log('   4. Redeploy frontend to Netlify');
  console.log('   5. Verify React Router is working correctly');
  
  console.log('\n🔧 Quick Fix Steps:');
  console.log('   1. Clear browser cache: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)');
  console.log('   2. Open https://foodly11.netlify.app/customer/restaurant/pizza-palace in incognito mode');
  console.log('   3. Check browser console (F12) for any JavaScript errors');
  console.log('   4. If errors persist, redeploy the frontend build folder to Netlify');
}

diagnoseMenuNavigation().catch(console.error); 