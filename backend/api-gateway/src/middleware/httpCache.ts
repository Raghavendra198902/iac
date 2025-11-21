import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

// Generate ETag from content
function generateETag(content: string): string {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

// HTTP Cache middleware with ETag support
export function httpCache(options: {
  maxAge?: number;
  sMaxAge?: number;
  public?: boolean;
  private?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  etag?: boolean;
} = {}) {
  const {
    maxAge = 300,
    sMaxAge,
    public: isPublic = true,
    private: isPrivate = false,
    noCache = false,
    noStore = false,
    mustRevalidate = false,
    etag = true,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Build Cache-Control header
    const cacheDirectives: string[] = [];

    if (noStore) {
      cacheDirectives.push('no-store');
    } else if (noCache) {
      cacheDirectives.push('no-cache');
    } else {
      if (isPublic) cacheDirectives.push('public');
      if (isPrivate) cacheDirectives.push('private');
      if (maxAge) cacheDirectives.push(`max-age=${maxAge}`);
      if (sMaxAge) cacheDirectives.push(`s-maxage=${sMaxAge}`);
      if (mustRevalidate) cacheDirectives.push('must-revalidate');
    }

    res.setHeader('Cache-Control', cacheDirectives.join(', '));

    // Add Vary header
    res.setHeader('Vary', 'Accept-Encoding, Authorization');

    // ETag support
    if (etag) {
      const originalSend = res.send;
      const originalJson = res.json;

      // Override res.send
      res.send = function (body: any): Response {
        if (res.statusCode === 200 && body) {
          const content = typeof body === 'string' ? body : JSON.stringify(body);
          const generatedETag = `"${generateETag(content)}"`;

          res.setHeader('ETag', generatedETag);

          // Check If-None-Match header
          const ifNoneMatch = req.headers['if-none-match'];
          if (ifNoneMatch === generatedETag) {
            logger.debug('ETag match - returning 304', {
              path: req.path,
              etag: generatedETag,
            });
            res.status(304).end();
            return res;
          }
        }

        return originalSend.call(this, body);
      };

      // Override res.json
      res.json = function (body: any): Response {
        if (res.statusCode === 200 && body) {
          const content = JSON.stringify(body);
          const generatedETag = `"${generateETag(content)}"`;

          res.setHeader('ETag', generatedETag);

          // Check If-None-Match header
          const ifNoneMatch = req.headers['if-none-match'];
          if (ifNoneMatch === generatedETag) {
            logger.debug('ETag match - returning 304', {
              path: req.path,
              etag: generatedETag,
            });
            res.status(304).end();
            return res;
          }
        }

        return originalJson.call(this, body);
      };
    }

    next();
  };
}

// No-cache middleware (for sensitive or frequently changing data)
export const noCache = httpCache({
  noCache: true,
  mustRevalidate: true,
  maxAge: 0,
  etag: false,
});

// Short cache (5 minutes)
export const shortCache = httpCache({
  maxAge: 300, // 5 minutes
  public: true,
  etag: true,
});

// Medium cache (1 hour)
export const mediumCache = httpCache({
  maxAge: 3600, // 1 hour
  sMaxAge: 7200, // 2 hours for CDN
  public: true,
  etag: true,
});

// Long cache (1 day)
export const longCache = httpCache({
  maxAge: 86400, // 24 hours
  sMaxAge: 172800, // 48 hours for CDN
  public: true,
  mustRevalidate: true,
  etag: true,
});

// Immutable cache (for versioned static assets)
export const immutableCache = httpCache({
  maxAge: 31536000, // 1 year
  public: true,
  etag: false,
});

// Conditional cache based on authentication
export function conditionalCache(
  authenticatedOptions: Parameters<typeof httpCache>[0] = { noCache: true },
  unauthenticatedOptions: Parameters<typeof httpCache>[0] = { maxAge: 300, public: true }
) {
  const authCache = httpCache(authenticatedOptions);
  const unauthCache = httpCache(unauthenticatedOptions);

  return (req: Request, res: Response, next: NextFunction) => {
    const isAuthenticated = !!(req as any).user;

    if (isAuthenticated) {
      authCache(req, res, next);
    } else {
      unauthCache(req, res, next);
    }
  };
}

// Cache busting helper
export function addCacheBuster(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Date.now()}`;
}

// Last-Modified header support
export function setLastModified(date: Date) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Last-Modified', date.toUTCString());

    // Check If-Modified-Since header
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince) {
      const modifiedSinceDate = new Date(ifModifiedSince);
      if (modifiedSinceDate >= date) {
        logger.debug('Last-Modified check - returning 304', {
          path: req.path,
          lastModified: date.toUTCString(),
        });
        return res.status(304).end();
      }
    }

    next();
  };
}

// Expires header support
export function setExpires(seconds: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const expiresDate = new Date(Date.now() + seconds * 1000);
    res.setHeader('Expires', expiresDate.toUTCString());
    next();
  };
}
