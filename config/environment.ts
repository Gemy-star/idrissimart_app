// Environment Configuration for Idrissimart App
import { Platform } from 'react-native';

/**
 * Environment types
 */
export type Environment = 'development' | 'production' | 'staging';

/**
 * Current environment (can be overridden via .env or manually)
 */
const CURRENT_ENV: Environment = __DEV__ ? 'development' : 'production';

/**
 * API URLs for different environments
 */
const API_URLS = {
  development: {
    // For Android emulator, use 10.0.2.2 instead of localhost
    // For iOS simulator and web, use localhost
    baseURL: Platform.select({
      android: 'http://10.0.2.2:5454/api',
      ios: 'http://localhost:5454/api',
      default: 'http://localhost:5454/api',
    }),
    displayName: 'Local Development',
  },
  production: {
    baseURL: 'https://idrissimart.com/api',
    displayName: 'Production',
  },
  staging: {
    baseURL: 'https://staging.idrissimart.com/api', // If you have a staging server
    displayName: 'Staging',
  },
};

/**
 * Get current environment configuration
 */
export const getEnvironmentConfig = () => {
  return {
    environment: CURRENT_ENV,
    ...API_URLS[CURRENT_ENV],
  };
};

/**
 * Get API base URL for current environment
 */
export const getApiBaseURL = (): string => {
  return API_URLS[CURRENT_ENV].baseURL as string;
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return CURRENT_ENV === 'development';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return CURRENT_ENV === 'production';
};

/**
 * Environment configuration export
 */
export const ENV_CONFIG = {
  CURRENT_ENV,
  API_BASE_URL: getApiBaseURL(),
  IS_DEV: isDevelopment(),
  IS_PROD: isProduction(),
  PLATFORM: Platform.OS,
  AVAILABLE_ENVS: API_URLS,
};

// Log environment info in development
if (isDevelopment()) {
  console.log('🔧 Environment Configuration:', {
    env: CURRENT_ENV,
    platform: Platform.OS,
    apiBaseURL: ENV_CONFIG.API_BASE_URL,
  });
}

export default ENV_CONFIG;
