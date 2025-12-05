import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace body with sanitized value
    req.body = value;
    next();
  };
};

/**
 * Sanitize HTML input to prevent XSS
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return validator.escape(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Request sanitization middleware
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Common validation schemas
 */
export const schemas = {
  // User registration
  userRegistration: Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .message('Password must contain uppercase, lowercase, number and special character'),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    organization: Joi.string().max(255).optional(),
    role: Joi.string().valid('user', 'architect', 'admin').default('user')
  }),

  // User login
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // EA responsibility activity
  eaActivity: Joi.object({
    type: Joi.string().valid('initiative_created', 'document_updated', 'stakeholder_added', 'review_completed').required(),
    description: Joi.string().max(1000).required(),
    metadata: Joi.object().optional(),
    timestamp: Joi.date().iso().default(Date.now)
  }),

  // Blueprint creation
  blueprintCreate: Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(5000).optional(),
    type: Joi.string().valid('application', 'infrastructure', 'data', 'security').required(),
    tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    visibility: Joi.string().valid('private', 'team', 'organization', 'public').default('private'),
    content: Joi.object().required()
  }),

  // Blueprint update
  blueprintUpdate: Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(5000).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    visibility: Joi.string().valid('private', 'team', 'organization', 'public').optional(),
    content: Joi.object().optional(),
    status: Joi.string().valid('draft', 'review', 'approved', 'deprecated').optional()
  }),

  // IaC generation request
  iacGeneration: Joi.object({
    provider: Joi.string().valid('aws', 'azure', 'gcp', 'kubernetes').required(),
    resourceType: Joi.string().max(100).required(),
    configuration: Joi.object().required(),
    templateVersion: Joi.string().max(20).optional(),
    outputFormat: Joi.string().valid('terraform', 'cloudformation', 'arm', 'helm').required()
  }),

  // Comment/message
  message: Joi.object({
    content: Joi.string().min(1).max(10000).required(),
    type: Joi.string().valid('comment', 'feedback', 'question', 'suggestion').default('comment'),
    attachments: Joi.array().items(Joi.string().uri()).max(5).optional(),
    mentions: Joi.array().items(Joi.string().uuid()).max(10).optional()
  }),

  // Search query
  search: Joi.object({
    query: Joi.string().min(1).max(500).required(),
    filters: Joi.object({
      type: Joi.array().items(Joi.string()).optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      dateFrom: Joi.date().iso().optional(),
      dateTo: Joi.date().iso().optional(),
      status: Joi.array().items(Joi.string()).optional()
    }).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('relevance', 'date', 'name', 'popularity').default('relevance'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // UUID parameter
  uuidParam: Joi.object({
    id: Joi.string().uuid().required()
  }),

  // Date range
  dateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required().greater(Joi.ref('startDate'))
  }),

  // File upload metadata
  fileUpload: Joi.object({
    filename: Joi.string().max(255).required(),
    mimeType: Joi.string().valid(
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/json', 'application/yaml',
      'text/plain', 'text/markdown'
    ).required(),
    size: Joi.number().integer().max(10 * 1024 * 1024).required(), // Max 10MB
    description: Joi.string().max(500).optional()
  }),

  // Settings update
  settingsUpdate: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      slack: Joi.boolean().optional()
    }).optional(),
    theme: Joi.string().valid('light', 'dark', 'auto').optional(),
    language: Joi.string().valid('en', 'es', 'fr', 'de', 'zh').optional(),
    timezone: Joi.string().optional(),
    preferences: Joi.object().optional()
  }),

  // Webhook configuration
  webhook: Joi.object({
    url: Joi.string().uri().required(),
    events: Joi.array().items(Joi.string()).min(1).required(),
    secret: Joi.string().min(16).max(128).optional(),
    active: Joi.boolean().default(true),
    headers: Joi.object().pattern(
      Joi.string(),
      Joi.string().max(500)
    ).optional()
  }),

  // AI prompt
  aiPrompt: Joi.object({
    prompt: Joi.string().min(10).max(5000).required(),
    context: Joi.object().optional(),
    model: Joi.string().valid('gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2').default('gpt-4'),
    temperature: Joi.number().min(0).max(2).default(0.7),
    maxTokens: Joi.number().integer().min(100).max(4000).default(2000)
  })
};

/**
 * Validate UUID parameter
 */
export const validateUuid = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    
    if (!validator.isUUID(value)) {
      return res.status(400).json({
        error: 'Invalid UUID format',
        field: paramName
      });
    }
    
    next();
  };
};

/**
 * Validate email parameter
 */
export const validateEmail = (fieldName: string = 'email') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[fieldName] || req.query[fieldName];
    
    if (!validator.isEmail(value as string)) {
      return res.status(400).json({
        error: 'Invalid email format',
        field: fieldName
      });
    }
    
    next();
  };
};

/**
 * Validate file upload
 */
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedMimeTypes?: string[];
  required?: boolean;
}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedMimeTypes = [],
    required = true
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file && required) {
      return res.status(400).json({
        error: 'File upload required'
      });
    }

    if (!req.file) {
      return next();
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
      });
    }

    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type',
        allowedTypes: allowedMimeTypes
      });
    }

    next();
  };
};

/**
 * Validate JSON body
 */
export const validateJson = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['content-type']?.includes('application/json')) {
    try {
      if (typeof req.body === 'string') {
        req.body = JSON.parse(req.body);
      }
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid JSON in request body'
      });
    }
  }
  next();
};

/**
 * Prevent SQL injection
 */
export const preventSqlInjection = (req: Request, res: Response, next: NextFunction) => {
  const checkForSqlInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      const sqlPatterns = [
        /(\bunion\b.*\bselect\b)/i,
        /(\bor\b.*=.*)/i,
        /(;\s*drop\s+table)/i,
        /(;\s*delete\s+from)/i,
        /(\bexec\b|\bexecute\b)/i,
        /(script.*>.*<)/i
      ];
      
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    
    if (Array.isArray(value)) {
      return value.some(item => checkForSqlInjection(item));
    }
    
    if (value && typeof value === 'object') {
      return Object.values(value).some(val => checkForSqlInjection(val));
    }
    
    return false;
  };

  if (checkForSqlInjection(req.body) || checkForSqlInjection(req.query) || checkForSqlInjection(req.params)) {
    return res.status(400).json({
      error: 'Invalid input detected'
    });
  }

  next();
};

export default {
  validate,
  sanitizeHtml,
  sanitizeObject,
  sanitizeRequest,
  schemas,
  validateUuid,
  validateEmail,
  validateFileUpload,
  validateJson,
  preventSqlInjection
};
