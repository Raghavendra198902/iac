import cors from 'cors';

/**
 * Standardized CORS configuration for IAC Dharma microservices
 * 
 * Provides consistent Cross-Origin Resource Sharing settings across all services
 * with environment-based origin validation.
 */

/**
 * Get allowed origins from environment
 * 
 * @returns Array of allowed origin URLs
 */
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  const defaultOrigins = [
    'http://localhost:5173',      // Vite dev server
    'http://localhost:3000',      // API Gateway / React dev
    'http://localhost:4173',      // Vite preview
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ];
  
  // Combine and deduplicate
  return [...new Set([...defaultOrigins, ...envOrigins])];
};

/**
 * CORS options configuration
 */
export const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allowed request headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Tenant-Id',
    'X-Correlation-Id'
  ],
  
  // Headers exposed to the client
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count',
    'X-Correlation-Id'
  ],
  
  // Preflight cache duration (24 hours)
  maxAge: 86400,
  
  // Pass the CORS preflight response to the next handler
  preflightContinue: false,
  
  // Provide a status code to use for successful OPTIONS requests
  optionsSuccessStatus: 204
};

/**
 * Create CORS middleware with standard configuration
 * 
 * @returns Configured CORS middleware
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Create CORS middleware with custom configuration
 * 
 * @param customOptions - Custom CORS options to merge with defaults
 * @returns Configured CORS middleware
 */
export const createCustomCors = (customOptions: Partial<cors.CorsOptions>) => {
  return cors({ ...corsOptions, ...customOptions });
};

/**
 * Strict CORS for production
 * 
 * Only allows explicitly configured origins, no development exceptions.
 */
export const strictCorsOptions: cors.CorsOptions = {
  ...corsOptions,
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS: Blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  }
};

export const strictCorsMiddleware = cors(strictCorsOptions);

export default corsMiddleware;
