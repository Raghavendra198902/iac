/**
 * API Configuration
 * Centralizes all API endpoint configurations
 * Uses environment variables for flexible deployment
 */

// Get the API base URL from environment or construct from window location
const getApiBaseUrl = (): string => {
  // Check for explicit environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development, check if we're accessing from network
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If accessing via IP address or non-localhost hostname, use that for API
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}:3001`;
    }
  }

  // Default to localhost for local development
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;

// WebSocket URL
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

console.log('API Configuration:', {
  baseUrl: API_BASE_URL,
  apiUrl: API_URL,
  wsUrl: WS_BASE_URL,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A'
});
