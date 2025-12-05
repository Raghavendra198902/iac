import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock useDebounce hook
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

describe('useDebounce Hook', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
    vi.useRealTimers();
  });
});

// Mock useLocalStorage hook
const useLocalStorage = (key: string, initialValue: any) => {
  const [value, setValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = (newValue: any) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(error);
    }
  };

  return [value, setStoredValue];
};

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should use initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    expect(window.localStorage.getItem('test-key')).toBe('"updated"');
  });

  it('should read from localStorage on mount', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored');
  });
});

// Mock useFetch hook
const useFetch = (url: string) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
};

describe('useFetch Hook', () => {
  it('should start with loading state', () => {
    global.fetch = vi.fn(() => new Promise(() => {}));
    
    const { result } = renderHook(() => useFetch('/api/test'));
    expect(result.current.loading).toBe(true);
  });

  it('should set data on successful fetch', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: 'test' }),
      } as Response)
    );

    const { result, waitForNextUpdate } = renderHook(() => useFetch('/api/test'));
    await waitForNextUpdate();

    expect(result.current.data).toEqual({ data: 'test' });
    expect(result.current.loading).toBe(false);
  });
});

// Mock useForm hook
const useForm = (initialValues: any) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});

  const handleChange = (name: string, value: any) => {
    setValues((prev: any) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: any = {};
    Object.keys(values).forEach(key => {
      if (!values[key]) {
        newErrors[key] = `${key} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { values, errors, handleChange, validate };
};

describe('useForm Hook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useForm({ name: '', email: '' })
    );
    expect(result.current.values).toEqual({ name: '', email: '' });
  });

  it('should update values on change', () => {
    const { result } = renderHook(() =>
      useForm({ name: '' })
    );

    act(() => {
      result.current.handleChange('name', 'John');
    });

    expect(result.current.values.name).toBe('John');
  });

  it('should validate required fields', () => {
    const { result } = renderHook(() =>
      useForm({ name: '', email: '' })
    );

    act(() => {
      result.current.validate();
    });

    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
  });

  it('should pass validation with valid data', () => {
    const { result } = renderHook(() =>
      useForm({ name: 'John', email: 'john@example.com' })
    );

    let isValid;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(true);
  });
});

// Mock usePrevious hook
const usePrevious = (value: any) => {
  const ref = React.useRef();
  
  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

describe('usePrevious Hook', () => {
  it('should return undefined initially', () => {
    const { result } = renderHook(() => usePrevious('value'));
    expect(result.current).toBeUndefined();
  });

  it('should return previous value after update', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    rerender({ value: 'final' });
    expect(result.current).toBe('updated');
  });
});

// Mock useOnClickOutside hook
const useOnClickOutside = (ref: any, handler: Function) => {
  React.useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

describe('useOnClickOutside Hook', () => {
  it('should call handler when clicking outside', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() => useOnClickOutside(ref, handler));

    const event = new MouseEvent('mousedown', { bubbles: true });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
  });

  it('should not call handler when clicking inside', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() => useOnClickOutside(ref, handler));

    const event = new MouseEvent('mousedown', { bubbles: true });
    ref.current.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });
});
