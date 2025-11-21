# Security Best Practices

Comprehensive security guidelines for IAC Dharma deployment.

---

## Authentication & Authorization

### JWT Configuration

```bash
# Use strong secret keys (32+ characters)
JWT_SECRET=$(openssl rand -base64 32)

# Set appropriate expiration
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Use RS256 for production
JWT_ALGORITHM=RS256
```

### API Keys

```bash
# Generate secure API keys
API_KEY=$(openssl rand -hex 32)

# Rotate regularly
# Set expiration dates
# Use key prefixes for identification
```

### Password Policy

```javascript
{
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventReuse: 5,
  expirationDays: 90
}
```

---

## Network Security

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 5432/tcp   # Block external PostgreSQL
ufw deny 6379/tcp   # Block external Redis
ufw enable
```

### TLS/SSL Configuration

```nginx
# Nginx SSL config
ssl_protocols TLSv1.3 TLSv1.2;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HTTP Strict Transport Security
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Certificate Management

```bash
# Use Let's Encrypt for free certificates
certbot certonly --nginx -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

---

## Database Security

### PostgreSQL Hardening

```sql
-- Change default passwords
ALTER USER postgres WITH PASSWORD 'strong_password_here';

-- Create limited user
CREATE USER app_user WITH PASSWORD 'another_strong_password';
GRANT CONNECT ON DATABASE iac_dharma TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Enable SSL
ALTER SYSTEM SET ssl = 'on';
```

### Connection Security

```bash
# Use SSL connections
DB_SSL_MODE=require

# Connection pooling limits
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_CONNECTION_TIMEOUT=5000
```

### Backup Encryption

```bash
# Encrypt backups
pg_dump iac_dharma | gpg --encrypt --recipient admin@example.com > backup.sql.gpg

# Decrypt when needed
gpg --decrypt backup.sql.gpg | psql iac_dharma
```

---

## Application Security

### Environment Variables

```bash
# Never commit .env files to git
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore

# Use different configs per environment
.env.development
.env.staging
.env.production
```

### Secret Management

```bash
# Use HashiCorp Vault
vault kv put secret/iac-dharma \
  db_password="secret123" \
  api_key="key456"

# Retrieve secrets
vault kv get -field=db_password secret/iac-dharma
```

### Input Validation

```typescript
// Validate all user inputs
import { body, validationResult } from 'express-validator';

app.post('/api/blueprints',
  body('name').isLength({ min: 3, max: 100 }).trim().escape(),
  body('provider').isIn(['aws', 'azure', 'gcp']),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

### SQL Injection Prevention

```typescript
// Use parameterized queries
const result = await pool.query(
  'SELECT * FROM blueprints WHERE id = $1',
  [blueprintId]
);

// Never concatenate user input
// DON'T DO THIS:
// const query = `SELECT * FROM users WHERE name = '${userName}'`;
```

### XSS Prevention

```javascript
// Sanitize HTML output
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(userInput);

// Set Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"]
  }
}));
```

---

## Docker Security

### Image Security

```dockerfile
# Use specific versions, not latest
FROM node:20.10.0-alpine

# Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Minimize attack surface
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]
```

### Container Hardening

```yaml
# docker-compose.yml
services:
  api-gateway:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### Secrets Management

```bash
# Use Docker secrets
echo "my_secret_password" | docker secret create db_password -

# Reference in compose
services:
  postgres:
    secrets:
      - db_password
```

---

## API Security

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
  origin: ['https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));
```

### Request Size Limits

```typescript
import express from 'express';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## Monitoring & Auditing

### Audit Logging

```typescript
// Log all security-relevant events
logger.audit({
  timestamp: new Date(),
  userId: req.user.id,
  action: 'LOGIN',
  resource: 'authentication',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  success: true
});
```

### Security Monitoring

```yaml
# Prometheus alerts
groups:
  - name: security
    rules:
      - alert: HighFailedLoginRate
        expr: rate(login_failures_total[5m]) > 10
        annotations:
          summary: "High failed login rate detected"
      
      - alert: UnauthorizedAccess
        expr: rate(http_requests_total{code="403"}[5m]) > 5
        annotations:
          summary: "Multiple unauthorized access attempts"
```

### Intrusion Detection

```bash
# Install and configure fail2ban
apt-get install fail2ban

# Configure jail
cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
maxretry = 3
bantime = 3600
EOF

systemctl restart fail2ban
```

---

## Compliance

### GDPR Compliance

```typescript
// Data anonymization
async function anonymizeUser(userId: string) {
  await db.query(
    'UPDATE users SET email = $1, name = $2 WHERE id = $3',
    ['anonymized@example.com', 'Deleted User', userId]
  );
}

// Right to be forgotten
async function deleteUserData(userId: string) {
  await db.query('DELETE FROM user_data WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
}
```

### HIPAA Compliance

- Encrypt data at rest and in transit
- Implement access controls and audit logs
- Regular security assessments
- Business Associate Agreements (BAAs)
- Breach notification procedures

### PCI-DSS Compliance

- Never store sensitive authentication data
- Encrypt cardholder data
- Maintain secure network
- Regular vulnerability scans
- Access control measures

---

## Incident Response

### Security Incident Checklist

1. **Detect** - Identify the security incident
2. **Contain** - Isolate affected systems
3. **Investigate** - Determine scope and impact
4. **Remediate** - Fix vulnerabilities
5. **Recover** - Restore normal operations
6. **Learn** - Post-incident review

### Emergency Procedures

```bash
# Immediately revoke compromised credentials
vault write auth/token/revoke token=$COMPROMISED_TOKEN

# Rotate all secrets
./scripts/rotate-secrets.sh

# Force password reset for all users
psql iac_dharma -c "UPDATE users SET force_password_reset = true"

# Review audit logs
iac-dharma logs | grep -i "suspicious"
```

---

## Security Checklist

### Pre-Deployment

- [ ] All secrets moved to environment variables
- [ ] Strong passwords configured
- [ ] TLS/SSL certificates installed
- [ ] Firewall rules configured
- [ ] Database connections encrypted
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented

### Post-Deployment

- [ ] Security scan performed
- [ ] Penetration test completed
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented
- [ ] Incident response plan documented
- [ ] Team trained on security procedures

### Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Review access logs weekly
- [ ] Security audit annually
- [ ] Vulnerability scans monthly

---

Last Updated: November 21, 2025 | [Back to Home](Home)
