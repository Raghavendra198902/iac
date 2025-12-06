import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for monitoring component render performance
 */
export const useRenderCount = (componentName: string): void => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });
};

/**
 * Hook for debouncing values to reduce re-renders
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): ((...args: Parameters<T>) => void) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
};

/**
 * Hook for intersection observer (lazy loading)
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isIntersecting];
};

/**
 * Hook for measuring performance metrics
 */
export const usePerformanceMetrics = (componentName: string) => {
  const startTime = useRef<number>(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms (target: <16ms)`);
    }

    startTime.current = performance.now();
  });
};

/**
 * Hook for managing idle callbacks
 */
export const useIdleCallback = (callback: () => void, dependencies: any[] = []) => {
  useEffect(() => {
    const handle = requestIdleCallback(callback);
    return () => cancelIdleCallback(handle);
  }, dependencies);
};
