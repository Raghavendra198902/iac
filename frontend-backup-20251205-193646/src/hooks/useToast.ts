import { toast as hotToast, ToastOptions } from 'react-hot-toast';

/**
 * Custom toast hook for consistent notifications
 * Wraps react-hot-toast with application-specific defaults
 */

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#fff',
    color: '#363636',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
};

export const useToast = () => {
  const success = (message: string, options?: ToastOptions) => {
    return hotToast.success(message, {
      ...defaultOptions,
      ...options,
      icon: '✅',
    });
  };

  const error = (message: string, options?: ToastOptions) => {
    return hotToast.error(message, {
      ...defaultOptions,
      duration: 5000, // Errors stay longer
      ...options,
      icon: '❌',
    });
  };

  const warning = (message: string, options?: ToastOptions) => {
    return hotToast(message, {
      ...defaultOptions,
      ...options,
      icon: '⚠️',
      style: {
        ...defaultOptions.style,
        background: '#FFF3CD',
        color: '#856404',
      },
    });
  };

  const info = (message: string, options?: ToastOptions) => {
    return hotToast(message, {
      ...defaultOptions,
      ...options,
      icon: 'ℹ️',
      style: {
        ...defaultOptions.style,
        background: '#D1ECF1',
        color: '#0C5460',
      },
    });
  };

  const loading = (message: string, options?: ToastOptions) => {
    return hotToast.loading(message, {
      ...defaultOptions,
      ...options,
    });
  };

  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return hotToast.promise(
      promise,
      messages,
      {
        ...defaultOptions,
        ...options,
      }
    );
  };

  const dismiss = (toastId?: string) => {
    hotToast.dismiss(toastId);
  };

  const remove = (toastId: string) => {
    hotToast.remove(toastId);
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    remove,
  };
};

export default useToast;
