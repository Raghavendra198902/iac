# Production Deployment Guide

**Version:** 2.0.0  
**Date:** November 23, 2025  
**Status:** Production Ready 🚀

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Deployment Strategies](#deployment-strategies)
5. [Performance Optimization](#performance-optimization)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Logging](#monitoring--logging)
8. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Frontend Checklist

- [ ] All Phase 1-4 features tested and validated
- [ ] Environment variables configured for production
- [ ] API endpoints pointing to production backend
- [ ] Error boundaries in place
- [ ] Loading states implemented
- [ ] Bundle size optimized (< 500KB initial)
- [ ] Lazy loading enabled for all routes
- [ ] Source maps generated for debugging
- [ ] TypeScript compilation successful with no errors
- [ ] Linting passed with no warnings
- [ ] Dark mode tested across all pages
- [ ] Mobile responsiveness verified
- [ ] Accessibility compliance verified (WCAG 2.1 AA)

### Backend Checklist

- [ ] All microservices tested
- [ ] Database migrations applied
- [ ] API Gateway configured with rate limiting
- [ ] Authentication tokens secured
- [ ] CORS configured for frontend origin
- [ ] SSL certificates installed
- [ ] Environment secrets secured
- [ ] Health check endpoints working
- [ ] Logging configured
- [ ] Monitoring dashboards created

### Infrastructure Checklist

- [ ] Kubernetes cluster provisioned
- [ ] Load balancers configured
- [ ] Auto-scaling enabled
- [ ] Database backups scheduled
- [ ] CDN configured for static assets
- [ ] DNS records configured
- [ ] SSL/TLS certificates valid
- [ ] Firewall rules configured
- [ ] VPC networking secured

---

## Environment Configuration

### Frontend Environment Variables

Create `.env.production` file:

```bash
# Production API URLs
VITE_API_BASE_URL=https://api.iac-dharma.com
VITE_API_GATEWAY_URL=https://api.iac-dharma.com

# Backend Services
VITE_IAC_GENERATOR_URL=https://iac-generator.iac-dharma.com
VITE_BLUEPRINT_SERVICE_URL=https://blueprints.iac-dharma.com
VITE_COSTING_SERVICE_URL=https://costing.iac-dharma.com
VITE_MONITORING_SERVICE_URL=https://monitoring.iac-dharma.com
VITE_ORCHESTRATOR_URL=https://orchestrator.iac-dharma.com

# Authentication - ALWAYS use real API in production
VITE_USE_DEMO_AUTH=false

# Feature Flags
VITE_ENABLE_AI_DESIGNER=true
VITE_ENABLE_RISK_ASSESSMENT=true
VITE_ENABLE_COST_OPTIMIZATION=true

# App Config
VITE_APP_NAME="IAC DHARMA"
VITE_APP_VERSION="2.0.0"
VITE_APP_ENV="production"

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Backend Environment Variables

Each service needs its own `.env` file:

```bash
# API Gateway (.env)
NODE_ENV=production
PORT=3000
JWT_SECRET=<strong-secret-key>
JWT_EXPIRY=24h
CORS_ORIGIN=https://app.iac-dharma.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Database
DB_HOST=postgres.iac-dharma.com
DB_PORT=5432
DB_NAME=iac_dharma_prod
DB_USER=iac_app
DB_PASSWORD=<secure-password>
DB_SSL=true

# Redis Cache
REDIS_HOST=redis.iac-dharma.com
REDIS_PORT=6379
REDIS_PASSWORD=<secure-password>
REDIS_TLS=true

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## Build Process

### Frontend Production Build

```bash
cd frontend

# Install dependencies
npm ci --production=false

# Run TypeScript compilation
npm run build

# Output:
# - dist/ directory with optimized assets
# - Source maps for debugging
# - Minified JS/CSS bundles
# - Code-split chunks for lazy loading
```

**Build Output Structure:**

```
dist/
├── index.html                    # Entry HTML
├── assets/
│   ├── index-[hash].js          # Main bundle (~200KB gzipped)
│   ├── Dashboard-[hash].js      # Lazy-loaded chunks
│   ├── Blueprints-[hash].js
│   ├── vendor-[hash].js         # Third-party libraries
│   └── index-[hash].css         # Styles
└── vite.config.js.map           # Source maps
```

### Backend Production Build

```bash
# Build each service
cd backend/api-gateway
npm run build
# Repeat for each service
```

### Docker Build (Recommended)

```bash
# Build frontend image
docker build -f frontend/Dockerfile.prod -t iac-dharma-frontend:2.0.0 .

# Build backend images
docker build -f backend/api-gateway/Dockerfile -t iac-dharma-api-gateway:2.0.0 .
docker build -f backend/iac-generator/Dockerfile -t iac-dharma-iac-generator:2.0.0 .
# ... etc for each service
```

---

## Deployment Strategies

### Strategy 1: Kubernetes (Recommended)

**Deploy to Kubernetes cluster:**

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/overlays/production/

# Verify deployment
kubectl get pods -n iac-dharma
kubectl get services -n iac-dharma
kubectl get ingress -n iac-dharma

# Check rollout status
kubectl rollout status deployment/frontend -n iac-dharma
kubectl rollout status deployment/api-gateway -n iac-dharma
```

**Blue-Green Deployment:**

```bash
# Deploy to "green" environment
kubectl apply -f k8s/overlays/production/deployment-green.yaml

# Test green environment
curl https://green.iac-dharma.com/health

# Switch traffic to green
kubectl patch service frontend -p '{"spec":{"selector":{"version":"green"}}}'

# Monitor for issues
kubectl logs -f deployment/frontend-green

# Rollback if needed
kubectl patch service frontend -p '{"spec":{"selector":{"version":"blue"}}}'
```

### Strategy 2: Docker Compose

**For smaller deployments:**

```bash
# Pull latest images
docker-compose pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check health
docker-compose ps
docker-compose logs -f frontend
```

### Strategy 3: Static Hosting (Frontend Only)

**Deploy to CDN/Static host:**

```bash
# Build production bundle
npm run build

# Deploy to S3 + CloudFront
aws s3 sync dist/ s3://iac-dharma-frontend --delete
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"

# Or deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

---

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --mode production

# Check bundle visualizer
npx vite-bundle-visualizer dist/
```

**Target Metrics:**
- Initial bundle: < 200KB gzipped
- Total JS: < 500KB gzipped
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

### Optimization Checklist

- [x] Code splitting enabled (React.lazy)
- [x] Tree shaking configured
- [x] Minification enabled
- [x] Gzip/Brotli compression
- [x] Image optimization
- [x] Font subsetting
- [ ] Service worker for caching
- [ ] HTTP/2 server push
- [ ] Preload critical resources
- [ ] CDN for static assets

### CDN Configuration

```nginx
# nginx.conf for frontend
server {
    listen 443 ssl http2;
    server_name app.iac-dharma.com;

    # SSL configuration
    ssl_certificate /etc/ssl/certs/iac-dharma.crt;
    ssl_certificate_key /etc/ssl/private/iac-dharma.key;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000";
}
```

---

## Security Hardening

### Frontend Security

**1. Content Security Policy (CSP):**

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://apis.google.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.iac-dharma.com">
```

**2. Environment Variable Protection:**

```typescript
// Never expose secrets in frontend code
// Use backend proxy for sensitive operations
const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY; // ✅ OK
const SECRET = import.meta.env.VITE_SECRET_KEY; // ❌ NEVER
```

**3. XSS Prevention:**

```typescript
// Always sanitize user input
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);
```

### Backend Security

**1. Rate Limiting:**

```typescript
// api-gateway/src/index.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**2. Input Validation:**

```typescript
import Joi from 'joi';

const projectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  budget: Joi.number().min(0).required(),
});
```

**3. SQL Injection Prevention:**

```typescript
// Use parameterized queries
const result = await db.query(
  'SELECT * FROM projects WHERE id = $1',
  [projectId]
);
```

### Infrastructure Security

**1. Network Security:**

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: iac-dharma-network-policy
spec:
  podSelector:
    matchLabels:
      app: iac-dharma
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - protocol: TCP
      port: 3000
```

**2. Secret Management:**

```bash
# Use Kubernetes secrets
kubectl create secret generic api-secrets \
  --from-literal=jwt-secret=<secret> \
  --from-literal=db-password=<password>
```

---

## Monitoring & Logging

### Application Monitoring

**1. Frontend Error Tracking (Sentry):**

```typescript
// frontend/src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
  });
}
```

**2. Performance Monitoring:**

```typescript
// Custom performance tracking
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart);
  });
}
```

**3. Analytics (Google Analytics):**

```typescript
// frontend/src/utils/analytics.ts
export const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
      page_path: path,
    });
  }
};
```

### Backend Logging

**Structured Logging with Winston:**

```typescript
// backend/api-gateway/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Infrastructure Monitoring

**Prometheus + Grafana:**

```yaml
# monitoring/prometheus-config.yaml
scrape_configs:
  - job_name: 'iac-dharma-frontend'
    static_configs:
      - targets: ['frontend:3000']
  
  - job_name: 'iac-dharma-api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']
```

---

## Rollback Procedures

### Frontend Rollback

**Kubernetes:**

```bash
# Rollback to previous version
kubectl rollout undo deployment/frontend -n iac-dharma

# Rollback to specific revision
kubectl rollout undo deployment/frontend --to-revision=2 -n iac-dharma

# Check rollout history
kubectl rollout history deployment/frontend -n iac-dharma
```

**CDN/Static Hosting:**

```bash
# AWS S3 + CloudFront
aws s3 sync s3://iac-dharma-frontend-backup/v1.0.0/ s3://iac-dharma-frontend/
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

### Backend Rollback

**Docker Compose:**

```bash
# Revert to previous image
docker-compose down
docker-compose -f docker-compose.prod.yml up -d iac-dharma-api-gateway:1.0.0
```

**Database Rollback:**

```bash
# Rollback database migrations
cd backend/api-gateway
npm run migration:revert
```

### Emergency Procedures

**1. Circuit Breaker Activation:**

```typescript
// Disable feature flag
VITE_ENABLE_NEW_FEATURE=false
```

**2. Maintenance Mode:**

```nginx
# nginx maintenance page
if (-f /var/www/maintenance.html) {
    return 503;
}

error_page 503 @maintenance;
location @maintenance {
    rewrite ^(.*)$ /maintenance.html break;
}
```

---

## Post-Deployment Validation

### Health Checks

```bash
# Frontend health
curl https://app.iac-dharma.com/

# Backend health
curl https://api.iac-dharma.com/health

# Database connectivity
curl https://api.iac-dharma.com/health/db
```

### Smoke Tests

```bash
# Run automated smoke tests
cd tests
npm run test:smoke:prod

# Test critical user flows:
# 1. User login
# 2. Dashboard load
# 3. Create project
# 4. Generate IaC code
# 5. View monitoring data
```

### Performance Verification

```bash
# Lighthouse CI
lighthouse https://app.iac-dharma.com --view

# Target scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 90
# SEO: > 90
```

---

## Disaster Recovery

### Backup Strategy

**Frontend:**
- S3 bucket versioning enabled
- Daily snapshots of CDN configuration
- GitHub repository as source of truth

**Backend:**
- Automated database backups every 6 hours
- Transaction log backups every hour
- 30-day retention period

**Recovery Time Objectives:**
- RTO (Recovery Time Objective): < 4 hours
- RPO (Recovery Point Objective): < 1 hour

### Backup Commands

```bash
# Database backup
pg_dump -h postgres.iac-dharma.com -U iac_app iac_dharma_prod > backup.sql

# Restore database
psql -h postgres.iac-dharma.com -U iac_app iac_dharma_prod < backup.sql
```

---

## Conclusion

The IAC DHARMA platform is **production-ready** with:

✅ Comprehensive environment configuration  
✅ Optimized build process  
✅ Multiple deployment strategies  
✅ Security hardening implemented  
✅ Monitoring and logging in place  
✅ Rollback procedures documented  
✅ Disaster recovery plan  

**Next Steps:**
1. Configure production environment variables
2. Run final pre-deployment checks
3. Execute deployment to production
4. Monitor application health
5. Validate with smoke tests

---

**Document Version:** 2.0.0  
**Last Updated:** November 23, 2025  
**Status:** Ready for Production Deployment 🚀
