import axios from 'axios';

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

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const fullUrl = (config.baseURL || '') + (config.url || '');
    console.log('[API Request]', config.method?.toUpperCase(), config.url, 'Full URL:', fullUrl);
    // Don't send auth token if on security page (public endpoint)
    if (window.location.pathname !== '/security') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API Error]', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      hasResponse: !!error.response,
      hasRequest: !!error.request,
    });
    
    if (error.response) {
      // Server responded with error status
      console.error('[API Error Response]', error.response.status, error.response.data);
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login (except for security page)
          if (window.location.pathname !== '/security') {
            localStorage.removeItem('auth_token');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
      }
    } else if (error.request) {
      // Request made but no response
      console.error('[API Error] No response received from server. Request:', error.request);
      console.error('Network error - no response from server');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
