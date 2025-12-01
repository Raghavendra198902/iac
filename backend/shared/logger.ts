import winston from 'winston';
import expressWinston from 'express-winston';

/**
 * Standardized logging configuration for IAC Dharma microservices
 * 
 * Provides structured JSON logging with consistent format across all services.
 * Includes request/response logging middleware for Express applications.
 */

// Create standardized logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'unknown-service',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.SERVICE_VERSION || '1.0.0'
  },
  transports: [
    // Console output with colors for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, service, ...meta }) => {
          let msg = `${timestamp} [${service}] ${level}: ${message}`;
          
          // Add metadata if present
          if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
          }
          
          return msg;
        })
      )
    })
  ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
}

/**
 * Express request logger middleware
 * 
 * Logs all HTTP requests with timing and metadata.
 * Automatically redacts sensitive headers like Authorization.
 */
export const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: false,
  colorize: false,
  
  // Request metadata
  requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query'],
  
  // Response metadata
  responseWhitelist: ['statusCode'],
  
  // Redact sensitive data
  headerBlacklist: ['authorization', 'cookie'],
  
  // Ignore health check endpoints to reduce noise
  ignoreRoute: (req, res) => {
    return req.url === '/health' || req.url === '/metrics';
  },
  
  // Dynamic metadata
  dynamicMeta: (req, res) => {
    return {
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: (req as any).user?.userId,
      tenantId: (req as any).user?.tenantId
    };
  }
});

/**
 * Express error logger middleware
 * 
 * Logs all errors with full stack traces.
 * Should be added after route handlers but before error handlers.
 */
export const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  msg: 'Error: {{err.message}}',
  meta: true,
  requestWhitelist: ['url', 'method', 'originalUrl', 'query'],
  blacklistedMetaFields: ['password', 'token', 'authorization']
});

/**
 * Create child logger for specific context
 * 
 * Useful for adding request-specific or operation-specific metadata.
 * 
 * @param metadata - Additional metadata to include in logs
 * @returns Child logger instance
 */
export const createChildLogger = (metadata: object) => {
  return logger.child(metadata);
};

/**
 * Log levels:
 * - error: Error events that might still allow the application to continue running
 * - warn: Warning events that indicate potential issues
 * - info: Informational messages highlighting progress of the application
 * - http: HTTP request logging
 * - debug: Detailed information for debugging purposes
 */

// Convenience methods
export const logInfo = (message: string, meta?: object) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error, meta?: object) => {
  logger.error(message, { error: error?.message, stack: error?.stack, ...meta });
};

export const logWarn = (message: string, meta?: object) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: object) => {
  logger.debug(message, meta);
};

export default logger;
