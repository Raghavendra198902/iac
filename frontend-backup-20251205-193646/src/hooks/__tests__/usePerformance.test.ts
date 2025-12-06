import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePerformance } from '../usePerformance';

describe('usePerformance Hook', () => {
  beforeEach(() => {
    // Mock Performance API
    if (!global.performance) {
      global.performance = {
        now: () => Date.now(),
        mark: () => {},
        measure: () => {},
        clearMarks: () => {},
        clearMeasures: () => {},
      } as any;
    }
  });

  it('should initialize performance monitoring', () => {
    const { result } = renderHook(() => usePerformance('test-component'));
    expect(result.current).toBeDefined();
  });

  it('should track render count', () => {
    const { result, rerender } = renderHook(() => usePerformance('test'));
    
    const initialCount = result.current.renderCount || 0;
    rerender();
    
    expect(result.current.renderCount).toBeGreaterThanOrEqual(initialCount);
  });

  it('should provide performance metrics', () => {
    const { result } = renderHook(() => usePerformance('test'));
    
    expect(result.current).toHaveProperty('renderCount');
  });
});
