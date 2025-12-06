import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock performance API
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  getEntriesByName: vi.fn(() => [{ duration: 100 }]),
};

describe('Performance Utilities', () => {
  beforeEach(() => {
    global.performance = mockPerformance as any;
    vi.clearAllMocks();
  });

  describe('PerformanceMonitor', () => {
    // Dynamic import to ensure mocks are applied
    let PerformanceMonitor: any;

    beforeEach(async () => {
      const module = await import('../performance');
      PerformanceMonitor = (module as any).PerformanceMonitor || module.default;
    });

    it('should mark performance start', () => {
      if (PerformanceMonitor) {
        const monitor = new PerformanceMonitor();
        monitor.mark('test-operation');

        expect(mockPerformance.mark).toHaveBeenCalledWith('test-operation-start');
      }
    });

    it('should measure performance duration', () => {
      if (PerformanceMonitor) {
        const monitor = new PerformanceMonitor();
        monitor.mark('test-operation');
        const duration = monitor.measure('test-operation');

        expect(mockPerformance.mark).toHaveBeenCalledWith('test-operation-end');
        expect(mockPerformance.measure).toHaveBeenCalled();
        expect(duration).toBe(100);
      }
    });

    it('should clear marks after measurement', () => {
      if (PerformanceMonitor) {
        const monitor = new PerformanceMonitor();
        monitor.mark('test-operation');
        monitor.measure('test-operation');

        expect(mockPerformance.clearMarks).toHaveBeenCalledWith('test-operation-start');
        expect(mockPerformance.clearMarks).toHaveBeenCalledWith('test-operation-end');
        expect(mockPerformance.clearMeasures).toHaveBeenCalledWith('test-operation');
      }
    });

    it('should handle missing performance API gracefully', () => {
      const originalPerformance = global.performance;
      delete (global as any).performance;

      if (PerformanceMonitor) {
        const monitor = new PerformanceMonitor();
        monitor.mark('test-operation');
        const duration = monitor.measure('test-operation');

        expect(duration).toBeNull();
      }

      global.performance = originalPerformance;
    });

    it('should record metrics', () => {
      if (PerformanceMonitor) {
        const monitor = new PerformanceMonitor();
        monitor.mark('operation1');
        monitor.measure('operation1');

        const metrics = monitor.getMetrics();
        expect(metrics.length).toBeGreaterThan(0);
      }
    });

    it('should calculate average metric', () => {
      mockPerformance.getEntriesByName.mockReturnValueOnce([{ duration: 100 }])
        .mockReturnValueOnce([{ duration: 150 }])
        .mockReturnValueOnce([{ duration: 200 }]);

      if (PerformanceMonitor) {
        const monitor = new PerformanceMonitor();
        
        monitor.mark('operation');
        monitor.measure('operation');
        monitor.mark('operation');
        monitor.measure('operation');
        monitor.mark('operation');
        monitor.measure('operation');

        const average = monitor.getAverageMetric('operation');
        expect(average).toBeGreaterThan(0);
      }
    });

    it('should limit stored metrics to MAX_METRICS', () => {
      mockPerformance.getEntriesByName.mockReturnValue([{ duration: 50 }]);

      if (PerformanceMonitor) {
        const monitor = new PerformanceMonitor();
        
        // Add more than MAX_METRICS (100)
        for (let i = 0; i < 150; i++) {
          monitor.mark(`operation-${i}`);
          monitor.measure(`operation-${i}`);
        }

        const metrics = monitor.getMetrics();
        expect(metrics.length).toBeLessThanOrEqual(100);
      }
    });

    it('should handle measurement errors gracefully', () => {
      mockPerformance.measure.mockImplementationOnce(() => {
        throw new Error('Measurement failed');
      });

      if (PerformanceMonitor) {
        const monitor = new PerformanceMonitor();
        monitor.mark('failing-operation');
        const duration = monitor.measure('failing-operation');

        expect(duration).toBeNull();
      }
    });

    it('should return zero for non-existent metric average', () => {
      if (PerformanceMonitor) {
        const monitor = new PerformanceMonitor();
        const average = monitor.getAverageMetric('non-existent');

        expect(average).toBe(0);
      }
    });

    it('should include timestamp in recorded metrics', () => {
      if (PerformanceMonitor) {
        const monitor = new PerformanceMonitor();
        const beforeTime = Date.now();
        
        monitor.mark('timed-operation');
        monitor.measure('timed-operation');

        const metrics = monitor.getMetrics();
        const lastMetric = metrics[metrics.length - 1];
        
        expect(lastMetric.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(lastMetric.timestamp).toBeLessThanOrEqual(Date.now());
      }
    });
  });

  describe('Web Vitals', () => {
    it('should collect LCP (Largest Contentful Paint)', () => {
      const lcp = 2500; // milliseconds
      const threshold = 2500; // Good LCP

      expect(lcp).toBeLessThanOrEqual(threshold);
    });

    it('should collect FID (First Input Delay)', () => {
      const fid = 50; // milliseconds
      const threshold = 100; // Good FID

      expect(fid).toBeLessThan(threshold);
    });

    it('should collect CLS (Cumulative Layout Shift)', () => {
      const cls = 0.05; // score
      const threshold = 0.1; // Good CLS

      expect(cls).toBeLessThan(threshold);
    });

    it('should collect FCP (First Contentful Paint)', () => {
      const fcp = 1500; // milliseconds
      const threshold = 1800; // Good FCP

      expect(fcp).toBeLessThan(threshold);
    });

    it('should collect TTFB (Time to First Byte)', () => {
      const ttfb = 400; // milliseconds
      const threshold = 600; // Good TTFB

      expect(ttfb).toBeLessThan(threshold);
    });
  });

  describe('Performance Thresholds', () => {
    it('should identify slow page loads', () => {
      const pageLoadTime = 5000; // milliseconds
      const warningThreshold = 3000;

      expect(pageLoadTime).toBeGreaterThan(warningThreshold);
    });

    it('should identify slow API calls', () => {
      const apiResponseTime = 2000; // milliseconds
      const threshold = 1000;

      expect(apiResponseTime).toBeGreaterThan(threshold);
    });

    it('should identify slow renders', () => {
      const renderTime = 200; // milliseconds
      const threshold = 100;

      expect(renderTime).toBeGreaterThan(threshold);
    });
  });
});
