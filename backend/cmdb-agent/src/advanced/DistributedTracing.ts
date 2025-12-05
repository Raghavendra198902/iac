/**
 * Distributed Tracing Integration
 * OpenTelemetry-compatible tracing for microservices
 */

import { EventEmitter } from 'events';
import logger from '../utils/logger';

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, any>;
  events: TraceEvent[];
  status: 'ok' | 'error' | 'unset';
  statusMessage?: string;
}

export interface TraceEvent {
  timestamp: number;
  name: string;
  attributes: Record<string, any>;
}

export interface ServiceDependency {
  source: string;
  target: string;
  callCount: number;
  avgLatency: number;
  errorRate: number;
  lastSeen: string;
}

export class DistributedTracing extends EventEmitter {
  private spans: Map<string, TraceSpan> = new Map();
  private dependencies: Map<string, ServiceDependency> = new Map();
  private traces: Map<string, TraceSpan[]> = new Map();
  private activeSpans: Set<string> = new Set();

  constructor() {
    super();
  }

  /**
   * Start a new trace span
   */
  startSpan(name: string, attributes: Record<string, any> = {}): TraceSpan {
    const span: TraceSpan = {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      name,
      startTime: Date.now(),
      attributes: {
        ...attributes,
        'service.name': attributes['service.name'] || 'cmdb-agent',
        'service.version': attributes['service.version'] || '3.0.0-pro',
      },
      events: [],
      status: 'unset',
    };

    this.spans.set(span.spanId, span);
    this.activeSpans.add(span.spanId);

    // Add to trace
    if (!this.traces.has(span.traceId)) {
      this.traces.set(span.traceId, []);
    }
    this.traces.get(span.traceId)!.push(span);

    logger.debug('Trace span started', { spanId: span.spanId, name });
    return span;
  }

  /**
   * End a trace span
   */
  endSpan(spanId: string, status: 'ok' | 'error' = 'ok', statusMessage?: string): void {
    const span = this.spans.get(spanId);
    if (!span) {
      logger.warn('Span not found', { spanId });
      return;
    }

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;
    span.statusMessage = statusMessage;

    this.activeSpans.delete(spanId);

    // Update service dependencies
    this.updateDependencies(span);

    // Emit span completion
    this.emit('span_completed', span);

    // Check for slow spans
    if (span.duration > 1000) {
      this.emit('slow_span', span);
      logger.warn('Slow span detected', {
        name: span.name,
        duration: span.duration,
        traceId: span.traceId,
      });
    }

    // Check for errors
    if (status === 'error') {
      this.emit('span_error', span);
    }

    logger.debug('Trace span ended', {
      spanId: span.spanId,
      duration: span.duration,
      status,
    });
  }

  /**
   * Add event to span
   */
  addSpanEvent(spanId: string, name: string, attributes: Record<string, any> = {}): void {
    const span = this.spans.get(spanId);
    if (!span) return;

    span.events.push({
      timestamp: Date.now(),
      name,
      attributes,
    });
  }

  /**
   * Update span attributes
   */
  updateSpanAttributes(spanId: string, attributes: Record<string, any>): void {
    const span = this.spans.get(spanId);
    if (!span) return;

    span.attributes = { ...span.attributes, ...attributes };
  }

  /**
   * Get trace by ID
   */
  getTrace(traceId: string): TraceSpan[] | undefined {
    return this.traces.get(traceId);
  }

  /**
   * Get all active spans
   */
  getActiveSpans(): TraceSpan[] {
    return Array.from(this.activeSpans)
      .map(spanId => this.spans.get(spanId))
      .filter((span): span is TraceSpan => span !== undefined);
  }

  /**
   * Get service dependencies
   */
  getServiceDependencies(): ServiceDependency[] {
    return Array.from(this.dependencies.values());
  }

  /**
   * Analyze trace performance
   */
  analyzeTrace(traceId: string): any {
    const spans = this.traces.get(traceId);
    if (!spans || spans.length === 0) return null;

    const totalDuration = Math.max(...spans.map(s => (s.endTime || s.startTime) - s.startTime));
    const avgDuration = spans.reduce((sum, s) => sum + (s.duration || 0), 0) / spans.length;
    const errorCount = spans.filter(s => s.status === 'error').length;

    return {
      traceId,
      totalSpans: spans.length,
      totalDuration,
      avgDuration,
      errorCount,
      errorRate: (errorCount / spans.length) * 100,
      slowSpans: spans.filter(s => (s.duration || 0) > 1000).length,
      serviceCalls: this.extractServiceCalls(spans),
    };
  }

  /**
   * Generate trace ID
   */
  private generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate span ID
   */
  private generateSpanId(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  /**
   * Update service dependencies
   */
  private updateDependencies(span: TraceSpan): void {
    const source = span.attributes['service.name'];
    const target = span.attributes['downstream.service'];

    if (!source || !target) return;

    const key = `${source}->${target}`;
    const existing = this.dependencies.get(key);

    if (existing) {
      existing.callCount++;
      existing.avgLatency = (existing.avgLatency * (existing.callCount - 1) + (span.duration || 0)) / existing.callCount;
      existing.errorRate = span.status === 'error' 
        ? (existing.errorRate * (existing.callCount - 1) + 100) / existing.callCount
        : (existing.errorRate * (existing.callCount - 1)) / existing.callCount;
      existing.lastSeen = new Date().toISOString();
    } else {
      this.dependencies.set(key, {
        source,
        target,
        callCount: 1,
        avgLatency: span.duration || 0,
        errorRate: span.status === 'error' ? 100 : 0,
        lastSeen: new Date().toISOString(),
      });
    }
  }

  /**
   * Extract service calls from spans
   */
  private extractServiceCalls(spans: TraceSpan[]): any[] {
    return spans.map(span => ({
      service: span.attributes['service.name'],
      operation: span.name,
      duration: span.duration,
      status: span.status,
    }));
  }

  /**
   * Clean up old spans
   */
  cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    const oldSpans: string[] = [];

    this.spans.forEach((span, spanId) => {
      if (now - span.startTime > maxAge) {
        oldSpans.push(spanId);
      }
    });

    oldSpans.forEach(spanId => {
      const span = this.spans.get(spanId);
      if (span) {
        this.traces.get(span.traceId)?.splice(
          this.traces.get(span.traceId)!.findIndex(s => s.spanId === spanId),
          1
        );
      }
      this.spans.delete(spanId);
    });

    logger.debug(`Cleaned up ${oldSpans.length} old spans`);
  }
}
