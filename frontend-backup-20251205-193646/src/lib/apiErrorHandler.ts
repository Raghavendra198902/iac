import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Standardized API Error Handler
 * 
 * Provides consistent error handling across the application:
 * - User-friendly error messages
 * - Automatic retry for transient errors
 * - Token refresh on 401
 * - Request/response logging
 * - Toast notifications
 */

export interface APIError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

class APIErrorHandler {
  private retryCount = 0;
  private maxRetries = 3;

  /**
   * Handle API errors with user-friendly messages
   */
  handleError(error: AxiosError): APIError {
    if (error.response) {
      // Server responded with error status
      return this.handleResponseError(error);
    } else if (error.request) {
      // Request made but no response received
      return this.handleRequestError(error);
    } else {
      // Error in request setup
      return this.handleSetupError(error);
    }
  }

  /**
   * Handle response errors (4xx, 5xx)
   */
  private handleResponseError(error: AxiosError): APIError {
    const status = error.response?.status || 500;
    const data: any = error.response?.data || {};

    switch (status) {
      case 400:
        return {
          message: data.message || 'Invalid request. Please check your input.',
          code: 'BAD_REQUEST',
          status,
          details: data.errors || data.details
        };

      case 401:
        return {
          message: 'Your session has expired. Please log in again.',
          code: 'UNAUTHORIZED',
          status
        };

      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN',
          status
        };

      case 404:
        return {
          message: data.message || 'The requested resource was not found.',
          code: 'NOT_FOUND',
          status
        };

      case 409:
        return {
          message: data.message || 'This resource already exists or conflicts with another.',
          code: 'CONFLICT',
          status,
          details: data.details
        };

      case 422:
        return {
          message: 'Validation failed. Please check your input.',
          code: 'VALIDATION_ERROR',
          status,
          details: data.errors || data.validationErrors
        };

      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT',
          status
        };

      case 500:
        return {
          message: 'An internal server error occurred. Our team has been notified.',
          code: 'INTERNAL_ERROR',
          status
        };

      case 502:
      case 503:
      case 504:
        return {
          message: 'The service is temporarily unavailable. Please try again in a moment.',
          code: 'SERVICE_UNAVAILABLE',
          status
        };

      default:
        return {
          message: data.message || 'An unexpected error occurred.',
          code: 'UNKNOWN_ERROR',
          status
        };
    }
  }

  /**
   * Handle request errors (network issues)
   */
  private handleRequestError(error: AxiosError): APIError {
    return {
      message: 'Unable to connect to the server. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      status: 0
    };
  }

  /**
   * Handle setup errors
   */
  private handleSetupError(error: AxiosError): APIError {
    return {
      message: 'An error occurred while preparing the request.',
      code: 'REQUEST_SETUP_ERROR',
      status: 0
    };
  }

  /**
   * Show error notification to user
   */
  showErrorToast(error: APIError, options?: { duration?: number; id?: string }) {
    const toastOptions = {
      duration: options?.duration || 5000,
      id: options?.id,
      icon: '❌'
    };

    // For validation errors, show detailed messages
    if (error.code === 'VALIDATION_ERROR' && error.details) {
      const messages = Array.isArray(error.details)
        ? error.details.map((e: any) => e.message).join('\n')
        : Object.values(error.details).join('\n');
      
      toast.error(`${error.message}\n${messages}`, toastOptions);
    } else {
      toast.error(error.message, toastOptions);
    }
  }

  /**
   * Determine if error is retryable
   */
  isRetryable(error: APIError): boolean {
    const retryableCodes = ['NETWORK_ERROR', 'SERVICE_UNAVAILABLE', 'RATE_LIMIT'];
    const retryableStatuses = [502, 503, 504, 429];
    
    return (
      retryableCodes.includes(error.code) ||
      retryableStatuses.includes(error.status)
    );
  }

  /**
   * Get retry delay based on attempt number (exponential backoff)
   */
  getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
  }
}

// Create singleton instance
export const apiErrorHandler = new APIErrorHandler();

/**
 * Request interceptor
 */
export const requestInterceptor = (config: AxiosRequestConfig): AxiosRequestConfig => {
  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add request ID for tracing
  if (config.headers) {
    config.headers['X-Request-ID'] = generateRequestId();
  }

  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log('→ API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data
    });
  }

  return config;
};

/**
 * Response interceptor for success
 */
export const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  // Log response in development
  if (process.env.NODE_ENV === 'development') {
    console.log('← API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
  }

  return response;
};

/**
 * Response interceptor for errors
 */
export const errorInterceptor = async (error: AxiosError): Promise<any> => {
  const apiError = apiErrorHandler.handleError(error);

  // Handle 401 - Try to refresh token
  if (apiError.status === 401 && !error.config?.url?.includes('/auth/refresh')) {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { token } = response.data;
        
        // Update token
        localStorage.setItem('auth_token', token);
        
        // Retry original request
        if (error.config) {
          error.config.headers = error.config.headers || {};
          error.config.headers.Authorization = `Bearer ${token}`;
          return axios.request(error.config);
        }
      }
    } catch (refreshError) {
      // Refresh failed - redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(apiError);
    }
  }

  // Show error toast for non-silent requests
  if (!error.config?.headers?.['X-Silent-Error']) {
    apiErrorHandler.showErrorToast(apiError);
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', apiError);
  }

  return Promise.reject(apiError);
};

/**
 * Setup axios instance with error handling
 */
export const setupAxiosInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
};

/**
 * Retry wrapper for API calls
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Only retry if error is retryable
      if (!apiErrorHandler.isRetryable(error) || attempt === maxRetries - 1) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = apiErrorHandler.getRetryDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Show retry toast
      toast.loading(`Retrying... (Attempt ${attempt + 2}/${maxRetries})`, {
        duration: delay,
        id: 'retry-toast'
      });
    }
  }

  throw lastError;
};

/**
 * Generate unique request ID
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Type guard for API errors
 */
export const isAPIError = (error: any): error is APIError => {
  return (
    error &&
    typeof error.message === 'string' &&
    typeof error.code === 'string' &&
    typeof error.status === 'number'
  );
};

export default apiErrorHandler;
