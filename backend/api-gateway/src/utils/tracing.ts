/**
 * OpenTelemetry Distributed Tracing Configuration
 * 
 * Provides end-to-end request tracing across microservices using OpenTelemetry
 * and Jaeger for visualization. Automatically instruments HTTP, database,
 * and other operations.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { BatchSpanProcessor, SpanProcessor } from '@opentelemetry/sdk-trace-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { RedisInstrumentation as Redis4Instrumentation } from '@opentelemetry/instrumentation-redis-4';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { trace, context, SpanStatusCode, Span, Tracer } from '@opentelemetry/api';
import { IncomingMessage } from 'http';
import { logger } from './logger';

// Environment configuration
const JAEGER_ENDPOINT = process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces';
const SERVICE_NAME = process.env.SERVICE_NAME || 'api-gateway';
const SERVICE_VERSION = process.env.SERVICE_VERSION || '1.0.0';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

/**
 * Initialize OpenTelemetry SDK with Jaeger exporter
 */
export function initializeTracing(): NodeSDK {
  try {
    // Create Jaeger exporter
    const jaegerExporter = new JaegerExporter({
      endpoint: JAEGER_ENDPOINT,
    });

    // Define service resource
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
      [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: ENVIRONMENT,
    });

    // Configure SDK with automatic instrumentations
    const sdk = new NodeSDK({
      resource,
      spanProcessor: new BatchSpanProcessor(jaegerExporter) as any,
      instrumentations: [
        // HTTP instrumentation (incoming and outgoing requests)
        new HttpInstrumentation({
          ignoreIncomingPaths: ['/health', '/metrics'],
          requestHook: (span, request) => {
            // Add custom attributes to HTTP spans
            const incomingRequest = request as IncomingMessage;
            if (incomingRequest.headers) {
              span.setAttribute('http.user_agent', incomingRequest.headers['user-agent'] || 'unknown');
              span.setAttribute('http.client_ip', incomingRequest.headers['x-forwarded-for'] || incomingRequest.socket?.remoteAddress || 'unknown');
            }
          },
        }),

        // Express instrumentation
        new ExpressInstrumentation({
          requestHook: (span, info) => {
            // Add route information
            span.setAttribute('express.route', info.route || 'unknown');
            span.setAttribute('express.type', info.layerType || 'unknown');
          },
        }),

        // PostgreSQL instrumentation
        new PgInstrumentation({
          enhancedDatabaseReporting: true,
          requestHook: (span, queryConfig) => {
            // Add query information (sanitized)
            if (queryConfig && typeof queryConfig === 'object' && 'text' in queryConfig) {
              span.setAttribute('db.statement', sanitizeQuery(queryConfig.text as string));
            }
          },
        }),

        // Redis instrumentation (both redis 4 and ioredis)
        new Redis4Instrumentation(),
        new IORedisInstrumentation({
          dbStatementSerializer: (cmdName, cmdArgs) => {
            // Sanitize Redis commands
            return `${cmdName} ${cmdArgs.length > 0 ? '[...]' : ''}`;
          },
        }),
      ],
    });

    // Start the SDK
    sdk.start();
    logger.info('✅ OpenTelemetry tracing initialized', {
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      environment: ENVIRONMENT,
      jaeger: JAEGER_ENDPOINT,
    });

    return sdk;
  } catch (error) {
    logger.error('Failed to initialize OpenTelemetry tracing', { error });
    throw error;
  }
}

/**
 * Sanitize SQL query for tracing (remove sensitive data)
 */
function sanitizeQuery(query: string): string {
  // Remove potential sensitive data from queries
  return query
    .replace(/VALUES\s*\([^)]*\)/gi, 'VALUES (...)')
    .replace(/=\s*'[^']*'/gi, "= '***'")
    .replace(/=\s*"[^"]*"/gi, '= "***"')
    .substring(0, 500); // Limit length
}

/**
 * Get the current tracer instance
 */
export function getTracer(): Tracer {
  return trace.getTracer(SERVICE_NAME, SERVICE_VERSION);
}

/**
 * Create a custom span for manual instrumentation
 */
export function createSpan(
  name: string,
  attributes?: Record<string, string | number | boolean>,
  parentContext?: any
): Span {
  const tracer = getTracer();
  const ctx = parentContext || context.active();
  
  const span = tracer.startSpan(name, undefined, ctx);
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }
  
  return span;
}

/**
 * Wrap a function with tracing
 */
export function traceFunction<T>(
  name: string,
  fn: () => T | Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const span = createSpan(name, attributes);
  
  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await Promise.resolve(fn());
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Add an event to the current span
 */
export function addSpanEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>
): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Set attributes on the current span
 */
export function setSpanAttributes(
  attributes: Record<string, string | number | boolean>
): void {
  const span = trace.getActiveSpan();
  if (span) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }
}

/**
 * Record an error in the current span
 */
export function recordSpanError(error: Error): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  }
}

/**
 * Middleware to extract trace context from incoming requests
 */
export function tracingMiddleware(req: any, res: any, next: any): void {
  const span = trace.getActiveSpan();
  
  if (span) {
    // Add correlation ID to span
    const correlationId = req.headers['x-correlation-id'] || req.id;
    if (correlationId) {
      span.setAttribute('correlation.id', correlationId);
    }

    // Add user context if available
    if (req.user) {
      span.setAttribute('user.id', req.user.id);
      span.setAttribute('user.email', req.user.email);
      if (req.user.subscription) {
        span.setAttribute('user.subscription', req.user.subscription);
      }
    }

    // Add request metadata
    span.setAttribute('http.method', req.method);
    span.setAttribute('http.url', req.url);
    span.setAttribute('http.target', req.path);
    
    // Extract query parameters (sanitized)
    if (Object.keys(req.query || {}).length > 0) {
      span.setAttribute('http.query_params', JSON.stringify(Object.keys(req.query)));
    }

    // Track response
    res.on('finish', () => {
      span.setAttribute('http.status_code', res.statusCode);
      
      if (res.statusCode >= 400) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${res.statusCode}`,
        });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }
    });
  }

  next();
}

/**
 * Decorator for tracing class methods
 */
export function Trace(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const spanName = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return traceFunction(
        spanName,
        () => originalMethod.apply(this, args),
        {
          'method.name': propertyKey,
          'method.class': target.constructor.name,
        }
      );
    };

    return descriptor;
  };
}

/**
 * Trace circuit breaker calls
 */
export function traceCircuitBreakerCall(
  breakerName: string,
  fn: () => Promise<any>,
  serviceName: string
): Promise<any> {
  return traceFunction(
    `circuit_breaker.${breakerName}`,
    fn,
    {
      'circuit_breaker.name': breakerName,
      'circuit_breaker.service': serviceName,
      'operation.type': 'circuit_breaker',
    }
  );
}

/**
 * Trace cache operations
 */
export function traceCacheOperation(
  operation: 'get' | 'set' | 'delete',
  key: string,
  fn: () => Promise<any>
): Promise<any> {
  return traceFunction(
    `cache.${operation}`,
    fn,
    {
      'cache.operation': operation,
      'cache.key': key.substring(0, 100), // Truncate long keys
      'operation.type': 'cache',
    }
  );
}

/**
 * Trace database operations
 */
export function traceDatabaseOperation(
  operation: string,
  table: string,
  fn: () => Promise<any>
): Promise<any> {
  return traceFunction(
    `db.${operation}`,
    fn,
    {
      'db.operation': operation,
      'db.table': table,
      'operation.type': 'database',
    }
  );
}

/**
 * Trace external HTTP calls
 */
export function traceExternalCall(
  service: string,
  method: string,
  url: string,
  fn: () => Promise<any>
): Promise<any> {
  return traceFunction(
    `http.${method.toLowerCase()}.${service}`,
    fn,
    {
      'http.method': method,
      'http.url': url,
      'http.target_service': service,
      'operation.type': 'http_client',
    }
  );
}

/**
 * Get trace context for propagation to downstream services
 */
export function getTraceContext(): Record<string, string> {
  const span = trace.getActiveSpan();
  const headers: Record<string, string> = {};
  
  if (span) {
    const spanContext = span.spanContext();
    headers['x-trace-id'] = spanContext.traceId;
    headers['x-span-id'] = spanContext.spanId;
    headers['x-trace-flags'] = spanContext.traceFlags.toString();
  }
  
  return headers;
}

/**
 * Shutdown tracing gracefully
 */
export async function shutdownTracing(sdk: NodeSDK): Promise<void> {
  try {
    await sdk.shutdown();
    logger.info('OpenTelemetry tracing shut down successfully');
  } catch (error) {
    logger.error('Error shutting down OpenTelemetry tracing', { error });
  }
}

// Export types
export type { Span, Tracer };
export { SpanStatusCode, trace, context };
