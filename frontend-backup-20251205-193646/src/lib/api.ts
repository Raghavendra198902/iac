import axios from 'axios';
import { setupAxiosInterceptors } from './apiErrorHandler';

// Dynamically determine API URL based on where the frontend is accessed from
const getApiBaseUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('[API Config] Using VITE_API_URL from env:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise, use the same host as the frontend but port 3000
  const protocol = window.location.protocol; // http: or https:
  const hostname = window.location.hostname; // e.g., 192.168.1.10 or localhost
  const dynamicUrl = `${protocol}//${hostname}:3000/api`;
  console.log('[API Config] Using dynamic URL:', dynamicUrl);
  return dynamicUrl;
};

const API_BASE_URL = getApiBaseUrl();

console.log('[API Config] Final API Base URL:', API_BASE_URL);
console.log('[API Config] Window location:', window.location.href);

// Create axios instance with defaults
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Setup standardized error handling
setupAxiosInterceptors(api);

// Setup standardized error handling
setupAxiosInterceptors(api);

// Legacy request interceptor - kept for security page logic
api.interceptors.request.use(
  (config) => {
    const fullUrl = (config.baseURL || '') + (config.url || '');
    
    // Override auth token behavior for security page (public endpoint)
    if (window.location.pathname === '/security') {
      delete config.headers?.Authorization;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Remove old response interceptor - now handled by apiErrorHandler
// Old interceptors removed to avoid duplicate error handling

export default api;
