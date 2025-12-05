import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'react-hot-toast';
import { useToast } from '../useToast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('success', () => {
    it('should call toast.success with correct message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Operation successful');
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Operation successful',
        expect.objectContaining({
          icon: '✅',
          duration: 4000,
          position: 'top-right',
        })
      );
    });

    it('should accept custom options', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success', { duration: 6000 });
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({
          duration: 6000,
        })
      );
    });
  });

  describe('error', () => {
    it('should call toast.error with correct message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Operation failed');
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Operation failed',
        expect.objectContaining({
          icon: '❌',
          duration: 5000,
        })
      );
    });

    it('should use longer duration for errors', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Error message');
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Error message',
        expect.objectContaining({
          duration: 5000,
        })
      );
    });
  });

  describe('warning', () => {
    it('should display warning with correct styling', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('Warning message');
      });

      expect(toast).toHaveBeenCalledWith(
        'Warning message',
        expect.objectContaining({
          icon: '⚠️',
          style: expect.objectContaining({
            background: '#FFF3CD',
            color: '#856404',
          }),
        })
      );
    });
  });

  describe('info', () => {
    it('should display info toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Info message');
      });

      expect(toast).toHaveBeenCalledWith(
        'Info message',
        expect.objectContaining({
          icon: 'ℹ️',
        })
      );
    });
  });

  describe('loading', () => {
    it('should display loading toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.loading('Loading...');
      });

      expect(toast.loading).toHaveBeenCalledWith('Loading...');
    });
  });

  describe('promise', () => {
    it('should handle promise with success', async () => {
      const { result } = renderHook(() => useToast());
      const mockPromise = Promise.resolve('Success');

      act(() => {
        result.current.promise(mockPromise, {
          loading: 'Loading...',
          success: 'Done!',
          error: 'Failed!',
        });
      });

      expect(toast.promise).toHaveBeenCalledWith(mockPromise, {
        loading: 'Loading...',
        success: 'Done!',
        error: 'Failed!',
      });
    });

    it('should handle promise with error', async () => {
      const { result } = renderHook(() => useToast());
      const mockPromise = Promise.reject(new Error('Failed'));

      act(() => {
        result.current.promise(mockPromise, {
          loading: 'Loading...',
          success: 'Done!',
          error: 'Failed!',
        });
      });

      expect(toast.promise).toHaveBeenCalled();
    });
  });

  describe('custom', () => {
    it('should display custom toast', () => {
      const { result } = renderHook(() => useToast());
      const customContent = <div>Custom</div>;

      act(() => {
        result.current.custom(customContent);
      });

      expect(toast.custom).toHaveBeenCalledWith(customContent, expect.any(Object));
    });
  });

  describe('dismiss', () => {
    it('should dismiss specific toast by id', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.dismiss('toast-id');
      });

      expect(toast.dismiss).toHaveBeenCalledWith('toast-id');
    });

    it('should dismiss all toasts when no id provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.dismiss();
      });

      expect(toast.dismiss).toHaveBeenCalledWith(undefined);
    });
  });
});
