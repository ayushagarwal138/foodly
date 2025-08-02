// API Configuration and utility functions
// Use environment variable for API base URL, fallback to relative URLs for local development
// Updated to use correct backend URL: https://foodly-backend-uv7m.onrender.com
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://foodly-backend-uv7m.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  
  // Customer endpoints
  CUSTOMER_PROFILE: (id) => `/api/customers/${id}`,
  CUSTOMER_FAVORITES: (id) => `/api/customers/${id}/favorites`,
  CUSTOMER_WISHLIST: (id) => `/api/customers/${id}/wishlist`,
  CUSTOMER_ADD_TO_WISHLIST: (id) => `/api/customers/${id}/wishlist`,
  CUSTOMER_REMOVE_FROM_WISHLIST: (id) => `/api/customers/${id}/wishlist`,
  CUSTOMER_UPDATE_PROFILE: (id) => `/api/customers/${id}`,
  CUSTOMER_DELETE: (id) => `/api/customers/${id}`,
  
  // Restaurant endpoints
  RESTAURANTS: '/api/restaurants',
  RESTAURANT_BY_SLUG: (slug) => `/api/restaurants/slug/${slug}`,
  RESTAURANT_BY_OWNER: (id) => `/api/restaurants/by-owner/${id}`,
  RESTAURANT_MENU: (id) => `/api/restaurants/${id}/menu`,
  RESTAURANT_MENU_CUSTOMER: (id) => `/api/restaurants/${id}/menu/customer`,
  RESTAURANT_ORDERS: (id) => `/api/restaurants/${id}/orders`,
  RESTAURANT_ANALYTICS: (id) => `/api/restaurants/${id}/analytics`,
  RESTAURANT_REVIEWS: (id) => `/api/reviews/restaurant/${id}`,
  
  // Menu items
  MENU_ITEM_AVAILABILITY: (restaurantId, itemId) => `/api/restaurants/${restaurantId}/menu/${itemId}/availability`,
  MENU_ITEM_CAN_DELETE: (restaurantId, itemId) => `/api/restaurants/${restaurantId}/menu/${itemId}/can-delete`,
  MENU_ITEM_DELETE: (restaurantId, itemId) => `/api/restaurants/${restaurantId}/menu/${itemId}`,
  
  // Orders
  ORDERS: '/api/orders',
  MY_ORDERS: '/api/orders/my',
  ORDERS_BY_RESTAURANT: (restaurantId) => `/api/orders/restaurant/${restaurantId}`,
  ORDER_BY_ID: (id) => `/api/orders/${id}`,
  ORDER_STATUS: (id) => `/api/orders/${id}/status`,
  
  // Cart
  CART: '/api/cart',
  
  // Reviews
  REVIEWS: '/api/reviews',
  MY_REVIEWS: '/api/reviews/my',
  REVIEWS_BY_RESTAURANT: (restaurantId) => `/api/reviews/restaurant/${restaurantId}`,
  
  // Offers
  OFFERS: '/api/offers',
  OFFERS_ADMIN_ALL: '/api/offers/admin/all',
  OFFERS_BY_TYPE: (type) => `/api/offers/type/${type}`,
  OFFERS_BY_RESTAURANT: (restaurantId) => `/api/offers/restaurant/${restaurantId}`,
  OFFERS_BY_CATEGORY: (category) => `/api/offers/category/${category}`,
  OFFERS_EXPIRING_SOON: '/api/offers/expiring-soon',
  OFFER_VALIDATE_COUPON: '/api/offers/validate-coupon',
  OFFER_TOGGLE: (id) => `/api/offers/${id}/toggle`,
  OFFER_DELETE: (id) => `/api/offers/${id}`,
  
  // Support
  SUPPORT_MESSAGES: '/api/support/messages',
  SUPPORT_MESSAGES_BY_RESTAURANT: (restaurantId) => `/api/support/messages/restaurant/${restaurantId}`,
  SUPPORT_MESSAGES_BY_ORDER: (orderId, customerId, restaurantId) => 
    `/api/support/messages?orderId=${orderId}&customerId=${customerId}&restaurantId=${restaurantId}`,
  
  // Admin endpoints
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_BY_ID: (id) => `/api/admin/users/${id}`,
  ADMIN_USER_BLOCK: (id) => `/api/admin/users/${id}/block`,
  ADMIN_USER_UNBLOCK: (id) => `/api/admin/users/${id}/unblock`,
  ADMIN_USER_DELETE: (id) => `/api/admin/users/${id}`,
  
  ADMIN_RESTAURANTS: '/api/admin/restaurants',
  ADMIN_RESTAURANT_APPROVE: (id) => `/api/admin/restaurants/${id}/approve`,
  ADMIN_RESTAURANT_DEACTIVATE: (id) => `/api/admin/restaurants/${id}/deactivate`,
  ADMIN_RESTAURANT_DELETE: (id) => `/api/admin/restaurants/${id}`,
  
  ADMIN_ORDERS: '/api/admin/orders',
  ADMIN_ORDER_CANCEL: (id) => `/api/admin/orders/${id}/cancel`,
  ADMIN_ORDER_REFUND: (id) => `/api/admin/orders/${id}/refund`,
  ADMIN_ORDER_DELETE: (id) => `/api/admin/orders/${id}`,
  
  ADMIN_REVIEWS: '/api/admin/reviews',
  ADMIN_REVIEW_DELETE: (id) => `/api/admin/reviews/${id}`,
  ADMIN_REVIEW_FLAG: (id) => `/api/admin/reviews/${id}/flag`,
  
  // Admin offers endpoints
  ADMIN_OFFERS: '/api/offers/admin/all',
  
  // Health check
  HEALTH: '/health',
};

// Enhanced API utility functions with better error handling
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`API Request: ${config.method || 'GET'} ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      // Handle specific error cases
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        errorMessage = 'Authentication failed. Please login again.';
      } else if (response.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`API Response: ${url}`, data);
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Public API request function for endpoints that don't require authentication
export const publicApiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`Public API Request: ${config.method || 'GET'} ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`Public API Response: ${url}`, data);
    return data;
  } catch (error) {
    console.error('Public API request failed:', error);
    throw error;
  }
};

// Convenience methods
export const api = {
  get: (endpoint) => apiRequest(endpoint),
  
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
  
  patch: (endpoint, data) => apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Public API convenience methods (no authentication required)
export const publicApi = {
  get: (endpoint) => publicApiRequest(endpoint),
  
  post: (endpoint, data) => publicApiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint, data) => publicApiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint) => publicApiRequest(endpoint, {
    method: 'DELETE',
  }),
  
  patch: (endpoint, data) => publicApiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return token && token !== 'null' && token !== 'undefined';
};

// Utility function to get user role
export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

// Utility function to get user ID
export const getUserId = () => {
  return localStorage.getItem('userId');
};

// Utility function to clear authentication data
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
};

export default api; 