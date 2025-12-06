/**
 * Performance monitoring utilities
 * Tracks page load times, component render times, and user interactions
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100;

  /**
   * Mark the start of a performance measurement
   */
  mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * Measure and record the time between start and end marks
   */
  measure(name: string): number | null {
    if (typeof performance === 'undefined' || !performance.measure) {
      return null;
    }

    try {
      const startMark = `${name}-start`;
      const endMark = `${name}-end`;
      
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);

      const measure = performance.getEntriesByName(name)[0] as PerformanceEntry;
      const duration = measure?.duration || 0;

      this.recordMetric(name, duration);

      // Clean up marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);

      return duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return null;
    }
  }

  /**
   * Record a metric value
   */
  private recordMetric(name: string, value: number): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get average value for a specific metric
   */
  getAverageMetric(name: string): number {
    const filtered = this.metrics.filter((m) => m.name === name);
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.value, 0);
    return sum / filtered.length;
  }

  /**
   * Get Web Vitals (Core Web Vitals)
   */
  async getWebVitals(): Promise<Record<string, number>> {
    if (typeof performance === 'undefined') {
      return {};
    }

    const vitals: Record<string, number> = {};

    // First Contentful Paint (FCP)
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
    if (fcpEntry) {
      vitals.fcp = fcpEntry.startTime;
    }

    // Largest Contentful Paint (LCP) - needs PerformanceObserver
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        const lastEntry = lcpEntries[lcpEntries.length - 1] as any;
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
      }
    } catch (e) {
      // LCP not available
    }

    // Time to Interactive (TTI) approximation
    const navEntry = performance.getEntriesByType('navigation')[0] as any;
    if (navEntry) {
      vitals.domInteractive = navEntry.domInteractive;
      vitals.domContentLoaded = navEntry.domContentLoadedEventEnd;
      vitals.loadComplete = navEntry.loadEventEnd;
    }

    return vitals;
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this.metrics = [];
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  /**
   * Log performance report to console (dev only)
   */
  logReport(): void {
    if (import.meta.env.PROD) return;

    console.group('📊 Performance Report');
    
    const uniqueNames = [...new Set(this.metrics.map((m) => m.name))];
    uniqueNames.forEach((name) => {
      const avg = this.getAverageMetric(name);
      console.log(`${name}: ${avg.toFixed(2)}ms (avg)`);
    });

    this.getWebVitals().then((vitals) => {
      console.group('🎯 Web Vitals');
      Object.entries(vitals).forEach(([key, value]) => {
        console.log(`${key}: ${value.toFixed(2)}ms`);
      });
      console.groupEnd();
    });

    console.groupEnd();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook for component performance tracking
 */
export function usePerformanceTracking(componentName: string) {
  if (import.meta.env.PROD) return;

  performanceMonitor.mark(`${componentName}-render`);

  return () => {
    const duration = performanceMonitor.measure(`${componentName}-render`);
    if (duration && duration > 16) {
      // Warn if render takes longer than one frame (16ms)
      console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * Track user interactions
 */
export function trackInteraction(action: string, label?: string): void {
  if (import.meta.env.PROD) return;

  performanceMonitor.mark(`interaction-${action}`);
  console.log(`🖱️ User interaction: ${action}${label ? ` (${label})` : ''}`);
}

/**
 * Measure API call performance
 */
export async function measureApiCall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  performanceMonitor.mark(`api-${name}`);
  
  try {
    const result = await apiCall();
    const duration = performanceMonitor.measure(`api-${name}`);
    
    if (import.meta.env.DEV && duration) {
      console.log(`🌐 API call '${name}' took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    performanceMonitor.measure(`api-${name}`);
    throw error;
  }
}

/**
 * Report long tasks (blocking the main thread)
 */
export function monitorLongTasks(): void {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // Long tasks API not supported
  }
}

// Auto-report on page unload (dev only)
if (import.meta.env.DEV) {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.logReport();
  });
}
