// API Configuration
import { Platform } from 'react-native';

const IS_DEV = __DEV__; // React Native development mode flag

// Environment URLs
const API_URLS = {
  // For Android emulator, use 10.0.2.2 instead of localhost
  LOCAL: Platform.select({
    android: 'http://10.0.2.2:5454/api',
    ios: 'http://localhost:5454/api',
    default: 'http://localhost:5454/api',
  }) as string,
  PRODUCTION: 'https://idrissimart.com/api',
};

// Select base URL based on environment
const getBaseURL = () => {
  return IS_DEV ? API_URLS.LOCAL : API_URLS.PRODUCTION;
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  LOCAL_URL: API_URLS.LOCAL,
  PRODUCTION_URL: API_URLS.PRODUCTION,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  IS_DEV,
};

// Log current API configuration in development
if (IS_DEV) {
  console.log('🔧 API Configuration:', {
    environment: 'DEVELOPMENT',
    platform: Platform.OS,
    baseURL: API_CONFIG.BASE_URL,
  });
} else {
  console.log('🚀 API Configuration:', {
    environment: 'PRODUCTION',
    baseURL: API_CONFIG.BASE_URL,
  });
}

/**
 * Helper function to manually override the base URL for testing
 * Usage: setApiBaseURL('https://staging.idrissimart.com/api')
 */
export const setApiBaseURL = (url: string) => {
  (API_CONFIG as any).BASE_URL = url;
  console.log('✅ API Base URL updated to:', url);
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    TOKEN: '/auth/token/',
    REFRESH: '/auth/token/refresh/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/',
  },
  
  // Users
  USERS: {
    LIST: '/users/',
    DETAIL: (id: number) => `/users/${id}/`,
    ME: '/users/me/',
    UPDATE_PROFILE: '/users/update_profile/',
    USER_ADS: (id: number) => `/users/${id}/ads/`,
    USER_REVIEWS: (id: number) => `/users/${id}/reviews/`,
  },
  
  // Countries & Cities
  COUNTRIES: {
    LIST: '/countries/',
    DETAIL: (id: number) => `/countries/${id}/`,
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/categories/',
    DETAIL: (id: number) => `/categories/${id}/`,
    ROOT: '/categories/root_categories/',
    ADS: (id: number) => `/categories/${id}/ads/`,
  },
  
  // Classified Ads
  ADS: {
    LIST: '/ads/',
    CREATE: '/ads/',
    DETAIL: (id: number) => `/ads/${id}/`,
    UPDATE: (id: number) => `/ads/${id}/`,
    DELETE: (id: number) => `/ads/${id}/`,
    TOGGLE_FAVORITE: (id: number) => `/ads/${id}/toggle_favorite/`,
    REVIEW: (id: number) => `/ads/${id}/review/`,
    FEATURED: '/ads/featured/',
    URGENT: '/ads/urgent/',
    RECENT: '/ads/recent/',
    MY_ADS: '/ads/my_ads/',
  },
  
  // Blog
  BLOG: {
    CATEGORIES: '/blog-categories/',
    TAGS: '/blog-tags/',
    POSTS: '/blogs/',
    POST_DETAIL: (id: number) => `/blogs/${id}/`,
    LIKE: (id: number) => `/blogs/${id}/like/`,
    COMMENT: (id: number) => `/blogs/${id}/comment/`,
  },
  
  // Chat / Messaging
  CHAT: {
    ROOMS: '/chat-rooms/',
    ROOM_DETAIL: (id: number) => `/chat-rooms/${id}/`,
    CREATE_OR_GET: '/chat-rooms/create_or_get/',
    SEND_MESSAGE: (id: number) => `/chat-rooms/${id}/send_message/`,
    MARK_READ: (id: number) => `/chat-rooms/${id}/mark_read/`,
  },
  
  // Wishlist
  WISHLIST: {
    ITEMS: '/wishlist/items/',
    ADD: '/wishlist/items/',
    REMOVE: (id: number) => `/wishlist/items/${id}/`,
  },

  // Cart
  CART: {
    ITEMS: '/cart/',
    ADD: '/cart/add/',
    ITEM: (id: number) => `/cart/items/${id}/`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications/',
    MARK_READ: (id: number) => `/notifications/${id}/mark_read/`,
    MARK_ALL_READ: '/notifications/mark_all_read/',
    UNREAD_COUNT: '/notifications/unread_count/',
  },
  
  // Packages & Payments
  PACKAGES: {
    AD_FEATURES: '/ad-features/',
    AD_PACKAGES: '/ad-packages/',
    PAYMENTS: '/payments/',
    USER_PACKAGES: '/user-packages/',
  },
  
  // FAQ & Safety
  FAQ: {
    CATEGORIES: '/faq-categories/',
    LIST: '/faqs/',
  },
  
  SAFETY: {
    TIPS: '/safety-tips/',
  },
  
  // Contact
  CONTACT: {
    MESSAGES: '/contact-messages/',
  },
  
  // Home Page
  HOME: {
    SLIDERS: '/home-sliders/',
    WHY_CHOOSE_US: '/why-choose-us/',
  },
  
  // Configuration & Static Pages
  SITE: {
    CONFIG: '/site-config/',
    ABOUT: '/about-page/',
    CONTACT: '/contact-page/',
    TERMS: '/terms-page/',
    PRIVACY: '/privacy-page/',
  },
  
  // Custom Fields
  CUSTOM_FIELDS: {
    LIST: '/custom-fields/',
    BY_CATEGORY: '/custom-fields/by_category/',
  },
};
