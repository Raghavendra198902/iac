import { createGlobalStyle } from 'styled-components';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Standardized error handling for IAC Dharma frontend
 * 
 * Provides consistent error display, logging, and user feedback
 * across all components and API calls.
 */

// Global toast configuration
export const toastConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light'
};

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

// Error interface
export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  statusCode?: number;
  timestamp: string;
}

/**
 * Parse API error response
 */
export const parseApiError = (error: any): AppError => {
  const timestamp = new Date().toISOString();
  
  // Network error
  if (!error.response) {
    return {
      type: ErrorType.NETWORK,
      message: 'Network error. Please check your connection and try again.',
      details: error.message,
      timestamp
    };
  }
  
  const { status, data } = error.response;
  
  // Authentication error
  if (status === 401) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: data?.message || 'Authentication failed. Please log in again.',
      statusCode: status,
      details: data,
      timestamp
    };
  }
  
  // Authorization error
  if (status === 403) {
    return {
      type: ErrorType.AUTHORIZATION,
      message: data?.message || 'You do not have permission to perform this action.',
      statusCode: status,
      details: data,
      timestamp
    };
  }
  
  // Not found
  if (status === 404) {
    return {
      type: ErrorType.NOT_FOUND,
      message: data?.message || 'The requested resource was not found.',
      statusCode: status,
      details: data,
      timestamp
    };
  }
  
  // Validation error
  if (status === 400 || status === 422) {
    return {
      type: ErrorType.VALIDATION,
      message: data?.message || 'Invalid request. Please check your input.',
      statusCode: status,
      details: data?.errors || data,
      timestamp
    };
  }
  
  // Server error
  if (status >= 500) {
    return {
      type: ErrorType.SERVER,
      message: data?.message || 'Server error. Please try again later.',
      statusCode: status,
      details: data,
      timestamp
    };
  }
  
  // Unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: data?.message || 'An unexpected error occurred.',
    statusCode: status,
    details: data,
    timestamp
  };
};

/**
 * Display error notification
 */
export const showError = (error: AppError | string) => {
  const message = typeof error === 'string' ? error : error.message;
  toast.error(message, toastConfig);
};

/**
 * Display success notification
 */
export const showSuccess = (message: string) => {
  toast.success(message, toastConfig);
};

/**
 * Display info notification
 */
export const showInfo = (message: string) => {
  toast.info(message, toastConfig);
};

/**
 * Display warning notification
 */
export const showWarning = (message: string) => {
  toast.warning(message, toastConfig);
};

/**
 * Handle API error with automatic toast display
 */
export const handleApiError = (error: any, customMessage?: string): AppError => {
  const parsedError = parseApiError(error);
  
  // Use custom message if provided
  if (customMessage) {
    showError(customMessage);
  } else {
    showError(parsedError);
  }
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('API Error:', parsedError);
  }
  
  return parsedError;
};

/**
 * Retry failed request with exponential backoff
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (isLastAttempt) {
        throw error;
      }
      
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
    }
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * Global error handler for uncaught errors
 */
export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    showError({
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred. Please refresh the page.',
      details: event.reason,
      timestamp: new Date().toISOString()
    });
    
    event.preventDefault();
  });
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    showError({
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred. Please refresh the page.',
      details: event.error,
      timestamp: new Date().toISOString()
    });
  });
};

/**
 * Error boundary fallback component
 */
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
          Something went wrong
        </h2>
        
        <p className="mt-2 text-sm text-center text-gray-600">
          {error.message}
        </p>
        
        {import.meta.env.DEV && (
          <details className="mt-4 p-4 bg-gray-100 rounded text-xs">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 overflow-auto">{error.stack}</pre>
          </details>
        )}
        
        <button
          onClick={resetErrorBoundary}
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

// Export ToastContainer for app root
export { ToastContainer };
