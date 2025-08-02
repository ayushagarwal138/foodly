// API Test Utility for Foodly Application
// This file helps verify that all API endpoints are working correctly

import { api, publicApi, API_ENDPOINTS, isAuthenticated, getUserRole, getUserId } from '../config/api';

export class ApiTester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  async testEndpoint(name, testFunction) {
    try {
      console.log(`Testing: ${name}`);
      const result = await testFunction();
      this.results.push({ name, status: 'PASS', result });
      console.log(`✅ ${name}: PASS`);
      return result;
    } catch (error) {
      this.errors.push({ name, error: error.message });
      console.log(`❌ ${name}: FAIL - ${error.message}`);
      return null;
    }
  }

  // Test public endpoints (no authentication required)
  async testPublicEndpoints() {
    console.log('\n=== Testing Public Endpoints ===');
    
    // Test health check
    await this.testEndpoint('Health Check', () => 
      publicApi.get(API_ENDPOINTS.HEALTH)
    );

    // Test restaurants list
    await this.testEndpoint('Get All Restaurants', () => 
      publicApi.get(API_ENDPOINTS.RESTAURANTS)
    );

    // Test offers list
    await this.testEndpoint('Get All Offers', () => 
      publicApi.get(API_ENDPOINTS.OFFERS)
    );

    // Test offers by type
    await this.testEndpoint('Get Offers by Type', () => 
      publicApi.get(API_ENDPOINTS.OFFERS_BY_TYPE('discount'))
    );

    // Test offers by category
    await this.testEndpoint('Get Offers by Category', () => 
      publicApi.get(API_ENDPOINTS.OFFERS_BY_CATEGORY('new-user'))
    );

    // Test expiring offers
    await this.testEndpoint('Get Expiring Offers', () => 
      publicApi.get(API_ENDPOINTS.OFFERS_EXPIRING_SOON)
    );
  }

  // Test customer endpoints (requires authentication)
  async testCustomerEndpoints() {
    if (!isAuthenticated() || getUserRole() !== 'CUSTOMER') {
      console.log('\n⚠️ Skipping Customer Endpoints - Not authenticated as customer');
      return;
    }

    console.log('\n=== Testing Customer Endpoints ===');
    const userId = getUserId();

    // Test customer profile
    await this.testEndpoint('Get Customer Profile', () => 
      api.get(API_ENDPOINTS.CUSTOMER_PROFILE(userId))
    );

    // Test customer favorites
    await this.testEndpoint('Get Customer Favorites', () => 
      api.get(API_ENDPOINTS.CUSTOMER_FAVORITES(userId))
    );

    // Test customer wishlist
    await this.testEndpoint('Get Customer Wishlist', () => 
      api.get(API_ENDPOINTS.CUSTOMER_WISHLIST(userId))
    );

    // Test my orders
    await this.testEndpoint('Get My Orders', () => 
      api.get(API_ENDPOINTS.MY_ORDERS)
    );

    // Test my reviews
    await this.testEndpoint('Get My Reviews', () => 
      api.get(API_ENDPOINTS.MY_REVIEWS)
    );

    // Test cart
    await this.testEndpoint('Get Cart', () => 
      api.get(API_ENDPOINTS.CART)
    );
  }

  // Test restaurant endpoints (requires authentication)
  async testRestaurantEndpoints() {
    if (!isAuthenticated() || getUserRole() !== 'RESTAURANT') {
      console.log('\n⚠️ Skipping Restaurant Endpoints - Not authenticated as restaurant');
      return;
    }

    console.log('\n=== Testing Restaurant Endpoints ===');
    const userId = getUserId();

    // Test restaurant by owner
    await this.testEndpoint('Get Restaurant by Owner', () => 
      api.get(API_ENDPOINTS.RESTAURANT_BY_OWNER(userId))
    );

    // Test restaurant menu
    const restaurantData = await this.testEndpoint('Get Restaurant by Owner', () => 
      api.get(API_ENDPOINTS.RESTAURANT_BY_OWNER(userId))
    );

    if (restaurantData && restaurantData.id) {
      await this.testEndpoint('Get Restaurant Menu', () => 
        api.get(API_ENDPOINTS.RESTAURANT_MENU(restaurantData.id))
      );

      await this.testEndpoint('Get Restaurant Orders', () => 
        api.get(API_ENDPOINTS.RESTAURANT_ORDERS(restaurantData.id))
      );

      await this.testEndpoint('Get Restaurant Analytics', () => 
        api.get(API_ENDPOINTS.RESTAURANT_ANALYTICS(restaurantData.id))
      );

      await this.testEndpoint('Get Restaurant Reviews', () => 
        api.get(API_ENDPOINTS.RESTAURANT_REVIEWS(restaurantData.id))
      );
    }
  }

  // Test admin endpoints (requires authentication)
  async testAdminEndpoints() {
    if (!isAuthenticated() || getUserRole() !== 'ADMIN') {
      console.log('\n⚠️ Skipping Admin Endpoints - Not authenticated as admin');
      return;
    }

    console.log('\n=== Testing Admin Endpoints ===');

    // Test admin users
    await this.testEndpoint('Get Admin Users', () => 
      api.get(API_ENDPOINTS.ADMIN_USERS)
    );

    // Test admin restaurants
    await this.testEndpoint('Get Admin Restaurants', () => 
      api.get(API_ENDPOINTS.ADMIN_RESTAURANTS)
    );

    // Test admin orders
    await this.testEndpoint('Get Admin Orders', () => 
      api.get(API_ENDPOINTS.ADMIN_ORDERS)
    );

    // Test admin reviews
    await this.testEndpoint('Get Admin Reviews', () => 
      api.get(API_ENDPOINTS.ADMIN_REVIEWS)
    );

    // Test admin offers
    await this.testEndpoint('Get Admin Offers', () => 
      api.get(API_ENDPOINTS.ADMIN_OFFERS)
    );
  }

  // Test specific restaurant endpoints (using first restaurant found)
  async testSpecificRestaurantEndpoints() {
    console.log('\n=== Testing Specific Restaurant Endpoints ===');

    try {
      // Get first restaurant
      const restaurants = await publicApi.get(API_ENDPOINTS.RESTAURANTS);
      if (restaurants && restaurants.length > 0) {
        const restaurant = restaurants[0];
        
        // Test restaurant by ID
        await this.testEndpoint('Get Restaurant by ID', () => 
          publicApi.get(`/api/restaurants/${restaurant.id}`)
        );

        // Test restaurant by slug
        if (restaurant.slug) {
          await this.testEndpoint('Get Restaurant by Slug', () => 
            publicApi.get(API_ENDPOINTS.RESTAURANT_BY_SLUG(restaurant.slug))
          );
        }

        // Test restaurant menu
        await this.testEndpoint('Get Restaurant Menu', () => 
          publicApi.get(API_ENDPOINTS.RESTAURANT_MENU(restaurant.id))
        );

        // Test restaurant reviews
        await this.testEndpoint('Get Restaurant Reviews', () => 
          publicApi.get(API_ENDPOINTS.REVIEWS_BY_RESTAURANT(restaurant.id))
        );

        // Test offers by restaurant
        await this.testEndpoint('Get Offers by Restaurant', () => 
          publicApi.get(API_ENDPOINTS.OFFERS_BY_RESTAURANT(restaurant.id))
        );
      }
    } catch (error) {
      console.log('❌ Failed to test specific restaurant endpoints:', error.message);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting API Tests...');
    console.log(`API Base URL: ${process.env.REACT_APP_API_BASE_URL || 'https://foodly-backend-uv7m.onrender.com'}`);
    console.log(`Authentication Status: ${isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}`);
    console.log(`User Role: ${getUserRole() || 'None'}`);
    console.log(`User ID: ${getUserId() || 'None'}`);

    await this.testPublicEndpoints();
    await this.testCustomerEndpoints();
    await this.testRestaurantEndpoints();
    await this.testAdminEndpoints();
    await this.testSpecificRestaurantEndpoints();

    this.printResults();
  }

  // Print test results
  printResults() {
    console.log('\n=== Test Results Summary ===');
    console.log(`Total Tests: ${this.results.length + this.errors.length}`);
    console.log(`Passed: ${this.results.length}`);
    console.log(`Failed: ${this.errors.length}`);
    console.log(`Success Rate: ${((this.results.length / (this.results.length + this.errors.length)) * 100).toFixed(1)}%`);

    if (this.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.errors.forEach(error => {
        console.log(`  - ${error.name}: ${error.error}`);
      });
    }

    if (this.results.length > 0) {
      console.log('\n✅ Passed Tests:');
      this.results.forEach(result => {
        console.log(`  - ${result.name}`);
      });
    }
  }

  // Get test results for programmatic use
  getResults() {
    return {
      passed: this.results,
      failed: this.errors,
      total: this.results.length + this.errors.length,
      successRate: this.results.length / (this.results.length + this.errors.length)
    };
  }
}

// Export a function to run tests
export const runApiTests = async () => {
  const tester = new ApiTester();
  await tester.runAllTests();
  return tester.getResults();
};

// Export the tester class for custom usage
export default ApiTester; 