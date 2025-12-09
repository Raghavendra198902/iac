import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export interface LoggerOptions {
  serviceName: string;
  level?: string;
  logToFile?: boolean;
  logDir?: string;
}

export const createLogger = (options: LoggerOptions): winston.Logger => {
  const { serviceName, level = 'info', logToFile = true, logDir = 'logs' } = options;

  const transports: winston.transport[] = [];

  if (process.env.NODE_ENV !== 'production') {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
          })
        ),
      })
    );
  }

  if (logToFile) {
    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/${serviceName}-error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '30d',
        maxSize: '20m',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      })
    );

    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/${serviceName}-combined-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        maxSize: '20m',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      })
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || level,
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports,
  });
};

export const sanitizeError = (error: any): any => {
  if (!error) return error;
  const sanitized: any = { message: error.message, name: error.name, code: error.code };
  if (process.env.NODE_ENV !== 'production') sanitized.stack = error.stack;
  return sanitized;
};

export const sanitizePath = (path: string): string => {
  if (!path) return path;
  const sensitiveParams = ['token', 'apikey', 'api_key', 'password', 'secret'];
  let sanitized = path;
  sensitiveParams.forEach(param => {
    const regex = new RegExp(`([?&]${param}=)[^&]*`, 'gi');
    sanitized = sanitized.replace(regex, `$1***`);
  });
  return sanitized;
};

export default createLogger;
