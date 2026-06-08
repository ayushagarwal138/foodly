// API Configuration and utility functions
// Use REACT_APP_API_BASE_URL in deployed environments. In local development,
// call the backend directly so secure-cookie auth is not affected by the CRA proxy.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '');
const API_PREFIX = '/api/v1';
const AUTH_PREFIX = `${API_PREFIX}/auth`;

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${AUTH_PREFIX}/login`,
  SIGNUP: `${AUTH_PREFIX}/signup`,
  AUTH_ME: `${AUTH_PREFIX}/me`,
  LOGOUT: `${AUTH_PREFIX}/logout`,
  GOOGLE_LOGIN: `${AUTH_PREFIX}/google`,
  
  // Customer endpoints
  CUSTOMER_PROFILE: (id) => `${API_PREFIX}/customers/${id}`,
  CUSTOMER_FAVORITES: (id) => `${API_PREFIX}/customers/${id}/favorites`,
  CUSTOMER_WISHLIST: (id) => `${API_PREFIX}/customers/${id}/wishlist`,
  CUSTOMER_ADD_TO_WISHLIST: (id) => `${API_PREFIX}/customers/${id}/wishlist`,
  CUSTOMER_REMOVE_FROM_WISHLIST: (id) => `${API_PREFIX}/customers/${id}/wishlist`,
  CUSTOMER_UPDATE_PROFILE: (id) => `${API_PREFIX}/customers/${id}`,
  CUSTOMER_DELETE: (id) => `${API_PREFIX}/customers/${id}`,
  
  // Restaurant endpoints
  RESTAURANTS: `${API_PREFIX}/restaurants`,
  RESTAURANT_BY_SLUG: (slug) => `${API_PREFIX}/restaurants/slug/${slug}`,
  RESTAURANT_BY_OWNER: (id) => `${API_PREFIX}/restaurants/by-owner/${id}`,
  RESTAURANT_MENU: (id) => `${API_PREFIX}/restaurants/${id}/menu`,
  RESTAURANT_MENU_CUSTOMER: (id) => `${API_PREFIX}/restaurants/${id}/menu/customer`,
  RESTAURANT_ORDERS: (id) => `${API_PREFIX}/restaurants/${id}/orders`,
  RESTAURANT_ANALYTICS: (id) => `${API_PREFIX}/restaurants/${id}/analytics`,
  RESTAURANT_REVIEWS: (id) => `${API_PREFIX}/reviews/restaurant/${id}`,
  
  // Menu items
  MENU_ITEM_AVAILABILITY: (restaurantId, itemId) => `${API_PREFIX}/restaurants/${restaurantId}/menu/${itemId}/availability`,
  MENU_ITEM_UPDATE: (restaurantId, itemId) => `${API_PREFIX}/restaurants/${restaurantId}/menu/${itemId}`,
  MENU_ITEM_CAN_DELETE: (restaurantId, itemId) => `${API_PREFIX}/restaurants/${restaurantId}/menu/${itemId}/can-delete`,
  MENU_ITEM_DELETE: (restaurantId, itemId) => `${API_PREFIX}/restaurants/${restaurantId}/menu/${itemId}`,
  
  // Orders
  ORDERS: `${API_PREFIX}/orders`,
  MY_ORDERS: `${API_PREFIX}/orders/my`,
  ORDERS_BY_RESTAURANT: (restaurantId) => `${API_PREFIX}/orders/restaurant/${restaurantId}`,
  ORDER_BY_ID: (id) => `${API_PREFIX}/orders/${id}`,
  ORDER_STATUS: (id) => `${API_PREFIX}/orders/${id}/status`,
  
  // Cart
  CART: `${API_PREFIX}/cart`,
  
  // Reviews
  REVIEWS: `${API_PREFIX}/reviews`,
  MY_REVIEWS: `${API_PREFIX}/reviews/my`,
  REVIEWS_BY_RESTAURANT: (restaurantId) => `${API_PREFIX}/reviews/restaurant/${restaurantId}`,
  
  // Offers
  OFFERS: `${API_PREFIX}/offers`,
  OFFERS_ADMIN_ALL: `${API_PREFIX}/offers/admin/all`,
  OFFERS_BY_TYPE: (type) => `${API_PREFIX}/offers/type/${type}`,
  OFFERS_BY_RESTAURANT: (restaurantId) => `${API_PREFIX}/offers/restaurant/${restaurantId}`,
  OFFERS_BY_CATEGORY: (category) => `${API_PREFIX}/offers/category/${category}`,
  OFFERS_EXPIRING_SOON: `${API_PREFIX}/offers/expiring-soon`,
  OFFER_VALIDATE_COUPON: `${API_PREFIX}/offers/validate-coupon`,
  OFFER_TOGGLE: (id) => `${API_PREFIX}/offers/${id}/toggle`,
  OFFER_DELETE: (id) => `${API_PREFIX}/offers/${id}`,
  
  // Support
  SUPPORT_MESSAGES: `${API_PREFIX}/support/messages`,
  SUPPORT_MESSAGES_BY_RESTAURANT: (restaurantId) => `${API_PREFIX}/support/messages/restaurant/${restaurantId}`,
  SUPPORT_MESSAGES_BY_ORDER: (orderId, customerId, restaurantId) => 
    `${API_PREFIX}/support/messages?orderId=${orderId}&customerId=${customerId}&restaurantId=${restaurantId}`,
  SUPPORT_UNREAD_COUNT: `${API_PREFIX}/support/messages/unread-count`,
  SUPPORT_MARK_READ: (messageId) => `${API_PREFIX}/support/messages/${messageId}/mark-read`,
  SUPPORT_MARK_ALL_READ: `${API_PREFIX}/support/messages/mark-all-read`,
  
  // Admin endpoints
  ADMIN_USERS: `${API_PREFIX}/admin/users`,
  ADMIN_USER_BY_ID: (id) => `${API_PREFIX}/admin/users/${id}`,
  ADMIN_USER_BLOCK: (id) => `${API_PREFIX}/admin/users/${id}/block`,
  ADMIN_USER_UNBLOCK: (id) => `${API_PREFIX}/admin/users/${id}/unblock`,
  ADMIN_USER_DELETE: (id) => `${API_PREFIX}/admin/users/${id}`,
  
  ADMIN_RESTAURANTS: `${API_PREFIX}/admin/restaurants`,
  ADMIN_RESTAURANT_APPROVE: (id) => `${API_PREFIX}/admin/restaurants/${id}/approve`,
  ADMIN_RESTAURANT_DEACTIVATE: (id) => `${API_PREFIX}/admin/restaurants/${id}/deactivate`,
  ADMIN_RESTAURANT_DELETE: (id) => `${API_PREFIX}/admin/restaurants/${id}`,
  
  ADMIN_ORDERS: `${API_PREFIX}/admin/orders`,
  ADMIN_ORDER_CANCEL: (id) => `${API_PREFIX}/admin/orders/${id}/cancel`,
  ADMIN_ORDER_REFUND: (id) => `${API_PREFIX}/admin/orders/${id}/refund`,
  ADMIN_ORDER_DELETE: (id) => `${API_PREFIX}/admin/orders/${id}`,
  
  ADMIN_REVIEWS: `${API_PREFIX}/admin/reviews`,
  ADMIN_REVIEW_DELETE: (id) => `${API_PREFIX}/admin/reviews/${id}`,
  ADMIN_REVIEW_FLAG: (id) => `${API_PREFIX}/admin/reviews/${id}/flag`,
  
  // Admin offers endpoints
  ADMIN_OFFERS: `${API_PREFIX}/offers/admin/all`,
  
  // Health check
  HEALTH: '/health',
};

const createRequestId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const parseErrorMessage = async (response) => {
  try {
    const errorData = await response.json();
    if (errorData?.error?.message) return errorData.error.message;
    if (typeof errorData?.error === 'string') return errorData.error;
    return errorData?.message || `HTTP error! status: ${response.status}`;
  } catch (e) {
    return response.statusText || `HTTP error! status: ${response.status}`;
  }
};

// Enhanced API utility functions with better error handling
export const apiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': createRequestId(),
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
      let errorMessage = await parseErrorMessage(response);
      
      // Handle specific error cases
      if (response.status === 401) {
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
    
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Public API request function for endpoints that don't require authentication
export const publicApiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': createRequestId(),
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
      const errorMessage = await parseErrorMessage(response);
      throw new Error(errorMessage);
    }
    
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
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
  
  delete: (endpoint, data) => apiRequest(endpoint, {
    method: 'DELETE',
    ...(data !== undefined && { body: JSON.stringify(data) }),
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
  
  delete: (endpoint, data) => publicApiRequest(endpoint, {
    method: 'DELETE',
    ...(data !== undefined && { body: JSON.stringify(data) }),
  }),
  
  patch: (endpoint, data) => publicApiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  return Boolean(localStorage.getItem('userId'));
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
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('restaurantId');
};

export default api; 
