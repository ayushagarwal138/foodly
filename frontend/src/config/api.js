// API Configuration and utility functions
// Use environment variable for API base URL, fallback to relative URLs for local development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  
  // Customer endpoints
  CUSTOMER_PROFILE: (id) => `/api/customers/${id}`,
  CUSTOMER_FAVORITES: (id) => `/api/customers/${id}/favorites`,
  CUSTOMER_WISHLIST: (id) => `/api/customers/${id}/wishlist`,
  
  // Restaurant endpoints
  RESTAURANTS: '/api/restaurants',
  RESTAURANT_BY_SLUG: (slug) => `/api/restaurants/slug/${slug}`,
  RESTAURANT_BY_OWNER: (id) => `/api/restaurants/by-owner/${id}`,
  RESTAURANT_MENU: (id) => `/api/restaurants/${id}/menu`,
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
  ORDER_BY_ID: (id) => `/api/orders/${id}`,
  ORDER_STATUS: (id) => `/api/orders/${id}/status`,
  
  // Cart
  CART: '/api/cart',
  
  // Reviews
  REVIEWS: '/api/reviews',
  MY_REVIEWS: '/api/reviews/my',
  
  // Offers
  OFFERS: '/api/offers',
  OFFERS_ADMIN_ALL: '/api/offers/admin/all',
  OFFER_TOGGLE: (id) => `/api/offers/${id}/toggle`,
  OFFER_DELETE: (id) => `/api/offers/${id}`,
  
  // Support
  SUPPORT_MESSAGES: '/api/support/messages',
  
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
};

// API utility functions
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
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
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

export default api; 