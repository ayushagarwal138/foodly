const https = require('https');

const API_BASE = 'https://foodly-backend-uv7m.onrender.com';

async function testEndpoint(name, url) {
  return new Promise((resolve) => {
    const req = https.request(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode >= 200 && res.statusCode < 300;
        console.log(`${success ? '✅' : '❌'} ${name}: ${res.statusCode}`);
        if (!success) {
          console.log(`   Error: ${data.substring(0, 100)}...`);
        }
        resolve(success);
      });
    });
    
    req.on('error', () => {
      console.log(`❌ ${name}: Network Error`);
      resolve(false);
    });
    
    req.end();
  });
}

async function verifyDeployment() {
  console.log('🔍 Verifying Foodly Deployment...\n');
  
  const tests = [
    { name: 'Health Check', url: `${API_BASE}/` },
    { name: 'Public Restaurants', url: `${API_BASE}/api/restaurants` },
    { name: 'Public Offers', url: `${API_BASE}/api/offers` },
    { name: 'Restaurant by Slug', url: `${API_BASE}/api/restaurants/slug/pizza-palace` },
    { name: 'CORS Preflight', url: `${API_BASE}/api/restaurants` }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await testEndpoint(test.name, test.url);
    if (success) passed++;
  }
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('💡 If you\'re still seeing 403 errors, try:');
    console.log('   1. Clear browser cache');
    console.log('   2. Redeploy frontend to Netlify');
    console.log('   3. Check if Render is using latest Docker image');
  } else {
    console.log('⚠️  Some tests failed. Check backend deployment.');
  }
}

verifyDeployment(); 