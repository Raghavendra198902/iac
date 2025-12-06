/**
 * Axios API Client
 * Configured with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      console.error('No response from server');
    } else {
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// GraphQL query helper
export const graphqlQuery = async (query: string, variables?: Record<string, any>) => {
  try {
    const response = await apiClient.post('/graphql', {
      query,
      variables,
    });
    return response.data;
  } catch (error) {
    console.error('GraphQL query error:', error);
    throw error;
  }
};

// REST API helpers
export const api = {
  get: <T = any>(url: string, config?: any) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => apiClient.delete<T>(url, config),
};

export default apiClient;
