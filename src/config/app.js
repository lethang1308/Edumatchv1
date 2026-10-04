/**
 * Application global configuration
 */
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'React Base',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  version: '1.0.0',
};
