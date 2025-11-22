# Security Best Practices

Comprehensive security guidelines and hardening procedures for IAC Dharma deployment across all environments.

## Table of Contents

| Section | Description | Time to Read |
|---------|-------------|--------------|
| [Overview](#overview) | Security philosophy and principles | 3 min |
| [Authentication & Authorization](#authentication--authorization) | Identity and access management | 10 min |
| [Network Security](#network-security) | Firewalls, TLS, VPN, DDoS protection | 12 min |
| [Database Security](#database-security) | PostgreSQL hardening, encryption | 8 min |
| [Application Security](#application-security) | Code security, input validation | 15 min |
| [API Security](#api-security) | Rate limiting, CORS, authentication | 10 min |
| [Container Security](#container-security) | Docker hardening, image scanning | 12 min |
| [Kubernetes Security](#kubernetes-security) | RBAC, network policies, pod security | 15 min |
| [Secrets Management](#secrets-management) | Vault, encryption, key rotation | 10 min |
| [Monitoring & Auditing](#monitoring--auditing) | Security logging, SIEM integration | 8 min |
| [Compliance](#compliance) | GDPR, HIPAA, PCI-DSS, SOC 2 | 12 min |
| [Incident Response](#incident-response) | Security incident procedures | 8 min |
| [Security Scanning](#security-scanning) | Vulnerability assessment | 8 min |
| [Security Checklists](#security-checklists) | Pre/post deployment verification | 5 min |
| [Security Tools](#security-tools) | Recommended security tools | 5 min |

---

## Overview

### Security Philosophy

IAC Dharma follows defense-in-depth security principles:

1. **Least Privilege** - Grant minimum necessary permissions
2. **Zero Trust** - Verify explicitly, assume breach
3. **Defense in Depth** - Multiple security layers
4. **Secure by Default** - Secure configurations out-of-the-box
5. **Continuous Monitoring** - Real-time threat detection
6. **Automated Response** - Rapid incident remediation

### Security Layers

```
┌─────────────────────────────────────────┐
│   Physical Security (Data Center)       │
├─────────────────────────────────────────┤
│   Network Security (Firewall, VPN)      │
├─────────────────────────────────────────┤
│   Platform Security (K8s, Docker)       │
├─────────────────────────────────────────┤
│   Application Security (Code, APIs)     │
├─────────────────────────────────────────┤
│   Data Security (Encryption, Backup)    │
├─────────────────────────────────────────┤
│   Identity Security (IAM, MFA)          │
└─────────────────────────────────────────┘
```

### Threat Model

**External Threats**:
- DDoS attacks
- SQL injection
- Cross-site scripting (XSS)
- Man-in-the-middle (MITM)
- Brute force attacks
- Zero-day exploits

**Internal Threats**:
- Privilege escalation
- Data exfiltration
- Insider threats
- Misconfiguration
- Supply chain attacks

---

## Authentication & Authorization

### Multi-Factor Authentication (MFA)

#### TOTP Configuration

```typescript
// Install authenticator
npm install otplib qrcode

// Generate MFA secret
import { authenticator } from 'otplib';

function generateMFASecret(userId: string): { secret: string; qrCode: string } {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(userId, 'IAC Dharma', secret);
  
  // Generate QR code for user to scan
  const qrCode = await QRCode.toDataURL(otpauth);
  
  return { secret, qrCode };
}

// Verify TOTP token
function verifyMFA(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}
```

#### SMS/Email Backup Codes

```typescript
// Generate backup codes
import crypto from 'crypto';

function generateBackupCodes(count: number = 10): string[] {
  return Array.from({ length: count }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}

// Store hashed backup codes
async function storeBackupCodes(userId: string, codes: string[]) {
  const hashedCodes = await Promise.all(
    codes.map(code => bcrypt.hash(code, 10))
  );
  
  await db.query(
    'INSERT INTO backup_codes (user_id, code_hash, used) VALUES ($1, $2, false)',
    [userId, hashedCodes]
  );
}
```

### JWT Security

#### Secure JWT Configuration

```typescript
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Use RS256 with key pairs for production
const privateKey = fs.readFileSync('keys/private.pem', 'utf8');
const publicKey = fs.readFileSync('keys/public.pem', 'utf8');

// Generate secure token
function generateToken(userId: string, roles: string[]): string {
  return jwt.sign(
    {
      sub: userId,
      roles,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID() // Unique token ID for revocation
    },
    privateKey,
    {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'iac-dharma',
      audience: 'iac-dharma-api'
    }
  );
}

// Verify token
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'iac-dharma',
      audience: 'iac-dharma-api'
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

#### Token Refresh Strategy

```typescript
// Implement refresh token rotation
interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  // Verify refresh token
  const payload = verifyToken(refreshToken);
  
  // Check if refresh token is blacklisted
  const isBlacklisted = await redis.exists(`blacklist:${refreshToken}`);
  if (isBlacklisted) {
    throw new Error('Refresh token revoked');
  }
  
  // Blacklist old refresh token (rotation)
  await redis.setex(`blacklist:${refreshToken}`, 604800, '1'); // 7 days
  
  // Generate new token pair
  const newAccessToken = generateToken(payload.sub, payload.roles);
  const newRefreshToken = generateRefreshToken(payload.sub);
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 3600
  };
}
```

### Role-Based Access Control (RBAC)

#### Role Definitions

```typescript
enum Role {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  AUDITOR = 'auditor',
  VIEWER = 'viewer'
}

enum Permission {
  // Blueprint permissions
  BLUEPRINT_CREATE = 'blueprint:create',
  BLUEPRINT_READ = 'blueprint:read',
  BLUEPRINT_UPDATE = 'blueprint:update',
  BLUEPRINT_DELETE = 'blueprint:delete',
  
  // Infrastructure permissions
  INFRA_DEPLOY = 'infra:deploy',
  INFRA_DESTROY = 'infra:destroy',
  
  // User management
  USER_MANAGE = 'user:manage',
  
  // Audit logs
  AUDIT_READ = 'audit:read'
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.BLUEPRINT_CREATE,
    Permission.BLUEPRINT_READ,
    Permission.BLUEPRINT_UPDATE,
    Permission.BLUEPRINT_DELETE,
    Permission.INFRA_DEPLOY,
    Permission.INFRA_DESTROY,
    Permission.USER_MANAGE,
    Permission.AUDIT_READ
  ],
  [Role.DEVELOPER]: [
    Permission.BLUEPRINT_CREATE,
    Permission.BLUEPRINT_READ,
    Permission.BLUEPRINT_UPDATE,
    Permission.INFRA_DEPLOY
  ],
  [Role.AUDITOR]: [
    Permission.BLUEPRINT_READ,
    Permission.AUDIT_READ
  ],
  [Role.VIEWER]: [
    Permission.BLUEPRINT_READ
  ]
};
```

#### Permission Middleware

```typescript
// Check permissions middleware
function requirePermission(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRoles: Role[] = req.user.roles;
    
    // Get all permissions for user's roles
    const userPermissions = userRoles.flatMap(role => rolePermissions[role]);
    
    // Check if user has required permissions
    const hasPermission = permissions.every(p => 
      userPermissions.includes(p)
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permissions,
        available: userPermissions
      });
    }
    
    next();
  };
}

// Usage
app.post('/api/blueprints',
  authenticate,
  requirePermission(Permission.BLUEPRINT_CREATE),
  createBlueprint
);

app.delete('/api/infrastructure/:id',
  authenticate,
  requirePermission(Permission.INFRA_DESTROY),
  destroyInfrastructure
);
```

### Password Security

#### Strong Password Policy

```typescript
import zxcvbn from 'zxcvbn';

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number; // Number of previous passwords to check
  expirationDays: number;
  minStrengthScore: number; // 0-4 (zxcvbn score)
}

const passwordPolicy: PasswordPolicy = {
  minLength: 14,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventReuse: 10,
  expirationDays: 90,
  minStrengthScore: 3 // Strong or very strong
};

function validatePassword(password: string, userId?: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check length
  if (password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters`);
  }
  
  // Check complexity
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  
  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain numbers');
  }
  
  if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain special characters');
  }
  
  // Check password strength using zxcvbn
  const strength = zxcvbn(password, userId ? [userId] : []);
  if (strength.score < passwordPolicy.minStrengthScore) {
    errors.push(`Password is too weak. ${strength.feedback.warning || ''}`);
    if (strength.feedback.suggestions.length > 0) {
      errors.push(...strength.feedback.suggestions);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

#### Secure Password Hashing

```typescript
import bcrypt from 'bcrypt';
import argon2 from 'argon2';

// Use Argon2 (recommended) or bcrypt
class PasswordHasher {
  // Argon2id (best for password hashing)
  static async hashArgon2(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4
    });
  }
  
  static async verifyArgon2(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
  
  // Bcrypt (fallback)
  static async hashBcrypt(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
  
  static async verifyBcrypt(hash: string, password: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Password history tracking
async function checkPasswordReuse(userId: string, newPassword: string): Promise<boolean> {
  const previousHashes = await db.query(
    'SELECT password_hash FROM password_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, passwordPolicy.preventReuse]
  );
  
  for (const row of previousHashes.rows) {
    const isMatch = await PasswordHasher.verifyArgon2(row.password_hash, newPassword);
    if (isMatch) {
      return false; // Password was used before
    }
  }
  
  return true; // Password is new
}
```

### Session Management

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';

// Configure secure sessions
app.use(session({
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:',
    ttl: 3600 // 1 hour
  }),
  secret: process.env.SESSION_SECRET,
  name: 'iac.sid', // Custom name (avoid default 'connect.sid')
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // Prevent XSS
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000, // 1 hour
    domain: '.iac-dharma.com'
  },
  rolling: true // Reset expiration on activity
}));

// Session timeout tracking
function trackSessionActivity(req: Request, res: Response, next: NextFunction) {
  if (req.session.lastActivity) {
    const inactiveTime = Date.now() - req.session.lastActivity;
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
    
    if (inactiveTime > maxInactiveTime) {
      req.session.destroy(() => {
        res.status(401).json({ error: 'Session expired due to inactivity' });
      });
      return;
    }
  }
  
  req.session.lastActivity = Date.now();
  next();
}
```

---

## Network Security

### Firewall Configuration

#### UFW (Ubuntu)

```bash
#!/bin/bash
# firewall-setup.sh

# Reset UFW
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# SSH (with rate limiting)
ufw limit 22/tcp comment 'SSH with rate limiting'

# HTTP/HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Allow from specific IPs only (production database access)
ufw allow from 10.0.1.0/24 to any port 5432 proto tcp comment 'PostgreSQL from private subnet'

# Block all other database ports from external access
ufw deny 5432/tcp comment 'Block external PostgreSQL'
ufw deny 6379/tcp comment 'Block external Redis'
ufw deny 27017/tcp comment 'Block external MongoDB'

# Monitoring (Prometheus, Grafana) - internal only
ufw allow from 10.0.1.0/24 to any port 9090 proto tcp comment 'Prometheus'
ufw allow from 10.0.1.0/24 to any port 3030 proto tcp comment 'Grafana'

# Enable logging
ufw logging on

# Enable firewall
ufw --force enable

# Show status
ufw status verbose
```

#### iptables (Advanced)

```bash
#!/bin/bash
# iptables-hardening.sh

# Flush existing rules
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Drop invalid packets
iptables -A INPUT -m conntrack --ctstate INVALID -j DROP

# SSH with rate limiting (max 4 connections per minute)
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 -j DROP
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# ICMP (ping) with rate limiting
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT

# Protection against SYN floods
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT

# Protection against port scanning
iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP

# Log dropped packets (optional, can generate lots of logs)
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables-dropped: " --log-level 7

# Save rules
iptables-save > /etc/iptables/rules.v4
```

### TLS/SSL Configuration

#### Generate Certificates

```bash
#!/bin/bash
# generate-certificates.sh

# Create certificate directory
mkdir -p /etc/iac-dharma/certs
cd /etc/iac-dharma/certs

# Generate private key (RSA 4096-bit)
openssl genrsa -out private.key 4096

# Or use ECDSA (more efficient)
openssl ecparam -genkey -name secp384r1 -out private-ec.key

# Generate certificate signing request
openssl req -new -key private.key -out server.csr \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=iac-dharma.com"

# Generate self-signed certificate (development)
openssl x509 -req -days 365 -in server.csr \
  -signkey private.key -out certificate.crt

# For production, use Let's Encrypt
certbot certonly --standalone \
  -d iac-dharma.com \
  -d www.iac-dharma.com \
  -d api.iac-dharma.com \
  --email admin@iac-dharma.com \
  --agree-tos \
  --non-interactive

# Auto-renewal
echo "0 3 * * * certbot renew --quiet" | crontab -
```

#### Nginx SSL Configuration

```nginx
# /etc/nginx/sites-available/iac-dharma

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name iac-dharma.com www.iac-dharma.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name iac-dharma.com www.iac-dharma.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/iac-dharma.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iac-dharma.com/privkey.pem;
    
    # SSL protocols (TLS 1.2 and 1.3 only)
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Strong ciphers
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # SSL session cache
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/iac-dharma.com/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Security timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Limit request size
    client_max_body_size 10M;
    
    # Access and error logs
    access_log /var/log/nginx/iac-dharma-access.log;
    error_log /var/log/nginx/iac-dharma-error.log;
}
```

### DDoS Protection

#### Rate Limiting with Nginx

```nginx
# /etc/nginx/nginx.conf

http {
    # Define rate limit zones
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Connection limits
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    
    server {
        # Apply general rate limit
        limit_req zone=general burst=20 nodelay;
        limit_conn addr 10;
        
        # Strict limits for API
        location /api/ {
            limit_req zone=api burst=50 nodelay;
            limit_req_status 429;
        }
        
        # Very strict limits for authentication
        location /api/auth/login {
            limit_req zone=login burst=3 nodelay;
            limit_req_status 429;
        }
    }
}
```

#### Application-Level Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Create Redis store for distributed rate limiting
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'rl:',
});

// General API rate limiter
const apiLimiter = rateLimit({
  store: redisStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  store: redisStore,
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Apply rate limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

### VPN Configuration

#### WireGuard Setup (Recommended)

```bash
#!/bin/bash
# wireguard-setup.sh

# Install WireGuard
apt-get install wireguard

# Generate server keys
wg genkey | tee /etc/wireguard/server_private.key | wg pubkey > /etc/wireguard/server_public.key
chmod 600 /etc/wireguard/server_private.key

# Create server configuration
cat > /etc/wireguard/wg0.conf << EOF
[Interface]
PrivateKey = $(cat /etc/wireguard/server_private.key)
Address = 10.8.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Client configurations
[Peer]
# Admin client
PublicKey = CLIENT_PUBLIC_KEY_HERE
AllowedIPs = 10.8.0.2/32

[Peer]
# Developer client
PublicKey = CLIENT_PUBLIC_KEY_HERE
AllowedIPs = 10.8.0.3/32
EOF

# Enable IP forwarding
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p

# Start WireGuard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0
```

---

## Database Security

### PostgreSQL Hardening

#### Secure Configuration

```bash
# /var/lib/postgresql/data/postgresql.conf

# Network settings
listen_addresses = 'localhost'  # Only listen on localhost
port = 5432

# SSL/TLS configuration
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
ssl_ca_file = '/etc/ssl/certs/ca.crt'
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'
ssl_prefer_server_ciphers = on
ssl_min_protocol_version = 'TLSv1.2'

# Connection settings
max_connections = 100
superuser_reserved_connections = 3

# Authentication timeout
authentication_timeout = 10s

# Password encryption
password_encryption = scram-sha-256

# Logging
logging_collector = on
log_connections = on
log_disconnections = on
log_duration = on
log_line_prefix = '%t [%p]: user=%u,db=%d,app=%a,client=%h '
log_statement = 'ddl'  # Log DDL statements

# Security
shared_preload_libraries = 'pg_stat_statements'
```

#### Access Control (pg_hba.conf)

```bash
# /var/lib/postgresql/data/pg_hba.conf

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections (Unix socket)
local   all             postgres                                peer
local   all             all                                     scram-sha-256

# IPv4 local connections
host    all             all             127.0.0.1/32            scram-sha-256

# IPv6 local connections
host    all             all             ::1/128                 scram-sha-256

# Application connections (from Docker network)
hostssl iac_dharma      app_user        172.18.0.0/16           scram-sha-256 clientcert=verify-ca

# Replication connections
hostssl replication     replication     10.0.1.0/24             scram-sha-256 clientcert=verify-full

# Deny all other connections
host    all             all             0.0.0.0/0               reject
host    all             all             ::/0                    reject
```

#### User and Permission Management

```sql
-- Create database
CREATE DATABASE iac_dharma;

-- Create roles with minimal privileges
CREATE ROLE app_user LOGIN PASSWORD 'strong_password_here';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE iac_dharma TO app_user;

\c iac_dharma

-- Schema permissions
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- Create read-only role for reporting
CREATE ROLE readonly_user LOGIN PASSWORD 'another_strong_password';
GRANT CONNECT ON DATABASE iac_dharma TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON pg_catalog.pg_authid FROM PUBLIC;

-- Enable row-level security on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation_policy ON users
  USING (id = current_setting('app.current_user_id')::uuid);
```

### Database Encryption

#### Encryption at Rest

```bash
# Enable transparent data encryption (TDE) with dm-crypt/LUKS

# Create encrypted volume
cryptsetup luksFormat /dev/sdb
cryptsetup luksOpen /dev/sdb pgdata_encrypted

# Format and mount
mkfs.ext4 /dev/mapper/pgdata_encrypted
mount /dev/mapper/pgdata_encrypted /var/lib/postgresql/data

# Auto-mount on boot (store key securely)
echo "pgdata_encrypted /dev/sdb /root/.pg-encryption-key luks" >> /etc/crypttab
echo "/dev/mapper/pgdata_encrypted /var/lib/postgresql/data ext4 defaults 0 2" >> /etc/fstab
```

#### Column-Level Encryption

```sql
-- Install pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  encrypted_ssn BYTEA,  -- Encrypted column
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert with encryption
INSERT INTO users (email, encrypted_ssn)
VALUES (
  'user@example.com',
  pgp_sym_encrypt('123-45-6789', 'encryption_key_here')
);

-- Query with decryption
SELECT
  id,
  email,
  pgp_sym_decrypt(encrypted_ssn, 'encryption_key_here') AS ssn
FROM users
WHERE email = 'user@example.com';

-- Create function for easier encryption
CREATE FUNCTION encrypt_sensitive(data TEXT) RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Backup Security

```bash
#!/bin/bash
# secure-backup.sh

BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/iac_dharma_$DATE.sql"
GPG_RECIPIENT="backup@iac-dharma.com"
RETENTION_DAYS=30

# Create backup
pg_dump -h localhost -U postgres iac_dharma \
  --no-password \
  --format=custom \
  --compress=9 \
  --verbose \
  > "$BACKUP_FILE"

# Encrypt backup
gpg --encrypt --recipient "$GPG_RECIPIENT" "$BACKUP_FILE"
rm "$BACKUP_FILE"  # Remove unencrypted backup

# Upload to secure off-site storage (S3 with encryption)
aws s3 cp "$BACKUP_FILE.gpg" \
  s3://iac-dharma-backups/postgresql/ \
  --server-side-encryption AES256 \
  --storage-class STANDARD_IA

# Delete local encrypted backup after upload
rm "$BACKUP_FILE.gpg"

# Clean up old backups (local and S3)
find "$BACKUP_DIR" -name "*.gpg" -mtime +$RETENTION_DAYS -delete

aws s3 ls s3://iac-dharma-backups/postgresql/ \
  | awk '{print $4}' \
  | while read file; do
    aws s3 rm "s3://iac-dharma-backups/postgresql/$file" \
      --recursive --exclude "*" \
      --include "*" \
      --older-than "$RETENTION_DAYS days"
  done

# Verify backup integrity
pg_restore --list "$BACKUP_FILE" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Backup verified successfully"
else
  echo "Backup verification failed!" >&2
  # Send alert
fi
```


---

## Application Security

### Input Validation

```typescript
import { body, param, query, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

// Validation middleware
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Blueprint creation validation
app.post('/api/blueprints',
  [
    body('name')
      .isLength({ min: 3, max: 100 })
      .trim()
      .escape()
      .withMessage('Name must be between 3-100 characters'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .trim()
      .customSanitizer(value => DOMPurify.sanitize(value)),
    
    body('provider')
      .isIn(['aws', 'azure', 'gcp', 'alibaba'])
      .withMessage('Invalid cloud provider'),
    
    body('template')
      .optional()
      .isJSON()
      .withMessage('Template must be valid JSON'),
    
    body('tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Maximum 10 tags allowed'),
    
    body('tags.*')
      .isLength({ min: 1, max: 50 })
      .trim()
      .escape()
  ],
  validate,
  createBlueprint
);

// File upload validation
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedMimes = [
      'application/json',
      'text/yaml',
      'application/x-yaml',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON, YAML, and TXT allowed'));
    }
  }
});
```

### SQL Injection Prevention

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca.crt').toString()
  }
});

// GOOD: Parameterized queries (prevents SQL injection)
async function getBlueprint(id: string) {
  const result = await pool.query(
    'SELECT * FROM blueprints WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// GOOD: Multiple parameters
async function searchBlueprints(name: string, provider: string) {
  const result = await pool.query(
    'SELECT * FROM blueprints WHERE name ILIKE $1 AND provider = $2',
    [`%${name}%`, provider]
  );
  return result.rows;
}

// BAD: String concatenation (vulnerable to SQL injection)
// async function getBlueprintBad(id: string) {
//   const query = `SELECT * FROM blueprints WHERE id = '${id}'`;
//   const result = await pool.query(query);
//   return result.rows[0];
// }

// GOOD: Using query builders with parameterization
import { QueryBuilder } from './query-builder';

const query = new QueryBuilder()
  .select('*')
  .from('blueprints')
  .where('provider', '=', provider)
  .where('status', '=', 'active')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .build();

const results = await pool.query(query.sql, query.params);
```

### XSS Prevention

```typescript
import helmet from 'helmet';
import DOMPurify from 'isomorphic-dompurify';

// Use Helmet for security headers
app.use(helmet());

// Strict Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.iac-dharma.com"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
}));

// Sanitize HTML content
function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false
  });
}

// Sanitize user-generated content before storing
app.post('/api/comments', async (req, res) => {
  const { content } = req.body;
  
  const sanitizedContent = sanitizeHTML(content);
  
  await db.query(
    'INSERT INTO comments (content, user_id) VALUES ($1, $2)',
    [sanitizedContent, req.user.id]
  );
  
  res.json({ success: true });
});

// Escape output in templates
// For React/JSX, escaping is automatic
// For other templates, use explicit escaping:

import escapeHtml from 'escape-html';

app.get('/profile/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  
  res.send(`
    <html>
      <body>
        <h1>Welcome, ${escapeHtml(user.name)}</h1>
        <p>${escapeHtml(user.bio)}</p>
      </body>
    </html>
  `);
});
```

### CSRF Protection

```typescript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());

// CSRF protection middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

// Apply to state-changing routes
app.post('/api/blueprints', csrfProtection, createBlueprint);
app.put('/api/blueprints/:id', csrfProtection, updateBlueprint);
app.delete('/api/blueprints/:id', csrfProtection, deleteBlueprint);

// Provide CSRF token to frontend
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Frontend usage (React example)
const apiCall = async (url, options = {}) => {
  // Get CSRF token
  const csrfResponse = await fetch('/api/csrf-token');
  const { csrfToken } = await csrfResponse.json();
  
  // Include token in request
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'CSRF-Token': csrfToken
    }
  });
};
```

### Dependency Security

```bash
#!/bin/bash
# security-audit.sh

# Run npm audit
npm audit --production

# Fix automatically fixable vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Use Snyk for advanced scanning
npx snyk test

# Check for known vulnerabilities in dependencies
npx yarn audit

# Generate security report
npm audit --json > security-report.json

# Fail build if high/critical vulnerabilities found
AUDIT_RESULT=$(npm audit --audit-level=high --json)
VULNERABILITIES=$(echo $AUDIT_RESULT | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical')

if [ "$VULNERABILITIES" -gt 0 ]; then
  echo "Found $VULNERABILITIES high/critical vulnerabilities!"
  exit 1
fi
```

```json
// package.json - Configure npm audit
{
  "scripts": {
    "audit": "npm audit --production",
    "audit:fix": "npm audit fix",
    "prepush": "npm run audit"
  },
  "devDependencies": {
    "@snyk/protect": "^1.0.0"
  },
  "snyk": true
}
```

---

## API Security

### API Authentication

```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// API key authentication
interface ApiKey {
  id: string;
  key: string;
  userId: string;
  scopes: string[];
  rateLimit: number;
  expiresAt?: Date;
}

async function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Hash the API key for lookup (store only hashed keys)
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  const keyData = await db.query(
    'SELECT * FROM api_keys WHERE key_hash = $1 AND (expires_at IS NULL OR expires_at > NOW())',
    [hashedKey]
  );
  
  if (keyData.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  const key: ApiKey = keyData.rows[0];
  
  // Attach key info to request
  req.apiKey = key;
  req.user = await getUser(key.userId);
  
  // Update last used timestamp
  await db.query(
    'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
    [key.id]
  );
  
  next();
}

// Generate API key
async function generateApiKey(userId: string, scopes: string[]): Promise<string> {
  const apiKey = crypto.randomBytes(32).toString('hex');
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  await db.query(
    'INSERT INTO api_keys (user_id, key_hash, scopes) VALUES ($1, $2, $3)',
    [userId, keyHash, scopes]
  );
  
  return apiKey; // Return only once, user must save it
}
```

### API Rate Limiting (Advanced)

```typescript
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';

// Create rate limiter with Redis backend
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl',
  points: 100, // Number of points
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 15, // Block for 15 minutes if consumed more than points
});

// Different limits for different user tiers
const rateLimiters = {
  free: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:free',
    points: 100,
    duration: 3600, // per hour
  }),
  pro: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:pro',
    points: 1000,
    duration: 3600,
  }),
  enterprise: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:enterprise',
    points: 10000,
    duration: 3600,
  })
};

// Rate limiting middleware
async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const userTier = req.user?.tier || 'free';
  const limiter = rateLimiters[userTier];
  const key = req.user?.id || req.ip;
  
  try {
    const rateLimitRes = await limiter.consume(key, 1);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limiter.points);
    res.setHeader('X-RateLimit-Remaining', rateLimitRes.remainingPoints);
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString());
    
    next();
  } catch (error) {
    // Rate limit exceeded
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(error.msBeforeNext / 1000)
    });
  }
}

// Apply rate limiting
app.use('/api/', rateLimitMiddleware);
```

### API Request Signing

```typescript
import crypto from 'crypto';

// Sign API requests (client-side)
function signRequest(method: string, path: string, body: any, apiKey: string, apiSecret: string): string {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Create signature payload
  const payload = `${method}\n${path}\n${timestamp}\n${nonce}\n${JSON.stringify(body)}`;
  
  // Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(payload)
    .digest('hex');
  
  return `${apiKey}:${timestamp}:${nonce}:${signature}`;
}

// Verify signature (server-side)
async function verifySignature(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Signature ')) {
    return res.status(401).json({ error: 'Missing signature' });
  }
  
  const [apiKey, timestamp, nonce, signature] = authHeader.substring(10).split(':');
  
  // Check timestamp (prevent replay attacks)
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (Math.abs(now - requestTime) > 300000) { // 5 minutes
    return res.status(401).json({ error: 'Request expired' });
  }
  
  // Check nonce (prevent replay attacks)
  const nonceExists = await redis.exists(`nonce:${nonce}`);
  if (nonceExists) {
    return res.status(401).json({ error: 'Nonce already used' });
  }
  
  // Store nonce
  await redis.setex(`nonce:${nonce}`, 300, '1');
  
  // Get API secret
  const keyData = await db.query(
    'SELECT api_secret FROM api_keys WHERE api_key = $1',
    [apiKey]
  );
  
  if (keyData.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  const apiSecret = keyData.rows[0].api_secret;
  
  // Verify signature
  const payload = `${req.method}\n${req.path}\n${timestamp}\n${nonce}\n${JSON.stringify(req.body)}`;
  const expectedSignature = crypto
    .createHmac('sha256', apiSecret)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}
```

### CORS Configuration

```typescript
import cors from 'cors';

// Dynamic CORS based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://iac-dharma.com',
      'https://www.iac-dharma.com',
      'https://app.iac-dharma.com'
    ]
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
```

---

## Container Security

### Docker Image Security

#### Secure Dockerfile

```dockerfile
# Use specific version, not 'latest'
FROM node:20.10.0-alpine3.18 AS base

# Install security updates
RUN apk upgrade --no-cache

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY --chown=nodejs:nodejs . .

# Remove unnecessary files
RUN rm -rf tests/ docs/ .git/

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "server.js"]
```

#### Multi-stage Build (Smaller Image)

```dockerfile
# Build stage
FROM node:20.10.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20.10.0-alpine

# Install security updates
RUN apk upgrade --no-cache

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Docker Compose Security

```yaml
version: '3.8'

services:
  api-gateway:
    image: iac-dharma/api-gateway:1.0.0
    
    # Run as non-root user
    user: "1001:1001"
    
    # Security options
    security_opt:
      - no-new-privileges:true
      - apparmor=docker-default
      - seccomp=unconfined
    
    # Read-only root filesystem
    read_only: true
    
    # Temporary filesystem for /tmp
    tmpfs:
      - /tmp:noexec,nosuid,nodev,size=100m
    
    # Drop all capabilities
    cap_drop:
      - ALL
    
    # Add only necessary capabilities
    cap_add:
      - NET_BIND_SERVICE
    
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    
    # PID limits
    pids_limit: 100
    
    # Logging
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    
    # Networks
    networks:
      - app-network
    
    # Environment variables (use secrets instead)
    environment:
      - NODE_ENV=production
    
    # Secrets
    secrets:
      - db_password
      - jwt_secret

  postgres:
    image: postgres:15-alpine
    user: "70:70"
    
    # Security options
    security_opt:
      - no-new-privileges:true
    
    read_only: true
    
    tmpfs:
      - /tmp:noexec,nosuid,nodev,size=100m
      - /var/run/postgresql:noexec,nosuid,nodev,size=100m
    
    # Volumes
    volumes:
      - postgres-data:/var/lib/postgresql/data:rw
    
    # Networks (isolated from external access)
    networks:
      - db-network
    
    secrets:
      - db_password

networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
  
  db-network:
    driver: bridge
    internal: true  # No external access

volumes:
  postgres-data:
    driver: local
    driver_opts:
      type: none
      o: bind,nodev,nosuid
      device: /var/lib/postgresql/data

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

### Image Scanning

```bash
#!/bin/bash
# image-security-scan.sh

IMAGE_NAME="iac-dharma/api-gateway:latest"

# Scan with Trivy
echo "Running Trivy scan..."
trivy image --severity HIGH,CRITICAL --exit-code 1 "$IMAGE_NAME"

# Scan with Grype
echo "Running Grype scan..."
grype "$IMAGE_NAME" --fail-on high

# Scan with Docker Scout
echo "Running Docker Scout..."
docker scout cves "$IMAGE_NAME"

# Scan with Snyk
echo "Running Snyk scan..."
snyk container test "$IMAGE_NAME" --severity-threshold=high

# Generate SBOM (Software Bill of Materials)
syft "$IMAGE_NAME" -o json > sbom.json

echo "Security scan complete"
```

---

## Kubernetes Security

### RBAC Configuration

```yaml
# service-account.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: iac-dharma-api
  namespace: iac-dharma

---
# role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: iac-dharma-role
  namespace: iac-dharma
rules:
  - apiGroups: [""]
    resources: ["pods", "services", "configmaps"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get"]

---
# role-binding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: iac-dharma-binding
  namespace: iac-dharma
subjects:
  - kind: ServiceAccount
    name: iac-dharma-api
    namespace: iac-dharma
roleRef:
  kind: Role
  name: iac-dharma-role
  apiGroup: rbac.authorization.k8s.io
```

### Network Policies

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
  namespace: iac-dharma
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
    - Ingress
    - Egress
  
  ingress:
    # Allow from ingress controller
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
  
  egress:
    # Allow to database
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    
    # Allow to Redis
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
    
    # Allow DNS
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
        - podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
    
    # Allow HTTPS to external APIs
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 443

---
# Deny all by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: iac-dharma
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Pod Security

```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  supplementalGroups:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
  readOnlyRootFilesystem: true

---
# deployment.yaml with security context
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: iac-dharma
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      serviceAccountName: iac-dharma-api
      
      # Pod security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      
      containers:
        - name: api-gateway
          image: iac-dharma/api-gateway:1.0.0
          
          # Container security context
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            runAsNonRoot: true
            runAsUser: 1001
            capabilities:
              drop:
                - ALL
              add:
                - NET_BIND_SERVICE
          
          # Resource limits
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          
          # Health checks
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          
          # Volume mounts
          volumeMounts:
            - name: tmp
              mountPath: /tmp
            - name: cache
              mountPath: /app/cache
      
      volumes:
        - name: tmp
          emptyDir: {}
        - name: cache
          emptyDir: {}
```


---

## Secrets Management

### HashiCorp Vault

#### Vault Setup

```bash
#!/bin/bash
# vault-setup.sh

# Install Vault
wget https://releases.hashicorp.com/vault/1.15.0/vault_1.15.0_linux_amd64.zip
unzip vault_1.15.0_linux_amd64.zip
sudo mv vault /usr/local/bin/

# Create Vault configuration
sudo mkdir -p /etc/vault.d
sudo cat > /etc/vault.d/config.hcl << EOF
storage "file" {
  path = "/opt/vault/data"
}

listener "tcp" {
  address     = "127.0.0.1:8200"
  tls_disable = 0
  tls_cert_file = "/etc/vault.d/tls/vault.crt"
  tls_key_file  = "/etc/vault.d/tls/vault.key"
}

api_addr = "https://127.0.0.1:8200"
cluster_addr = "https://127.0.0.1:8201"
ui = true
EOF

# Create systemd service
sudo cat > /etc/systemd/system/vault.service << EOF
[Unit]
Description="HashiCorp Vault"
Documentation=https://www.vaultproject.io/docs/
Requires=network-online.target
After=network-online.target
ConditionFileNotEmpty=/etc/vault.d/config.hcl

[Service]
Type=notify
User=vault
Group=vault
ExecStart=/usr/local/bin/vault server -config=/etc/vault.d/config.hcl
ExecReload=/bin/kill --signal HUP \$MAINPID
KillMode=process
KillSignal=SIGINT
Restart=on-failure
RestartSec=5
LimitNOFILE=65536
LimitMEMLOCK=infinity

[Install]
WantedBy=multi-user.target
EOF

# Start Vault
sudo systemctl enable vault
sudo systemctl start vault

# Initialize Vault (save these keys securely!)
vault operator init -key-shares=5 -key-threshold=3
```

#### Vault Integration

```typescript
import vault from 'node-vault';

const vaultClient = vault({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR || 'https://vault.iac-dharma.com',
  token: process.env.VAULT_TOKEN
});

// Store secret
async function storeSecret(path: string, data: any): Promise<void> {
  await vaultClient.write(`secret/data/${path}`, {
    data: data
  });
}

// Retrieve secret
async function getSecret(path: string): Promise<any> {
  const result = await vaultClient.read(`secret/data/${path}`);
  return result.data.data;
}

// Dynamic database credentials
async function getDatabaseCredentials(): Promise<{username: string, password: string}> {
  const result = await vaultClient.read('database/creds/iac-dharma-role');
  return {
    username: result.data.username,
    password: result.data.password
  };
}

// Auto-renew token
async function renewToken() {
  setInterval(async () => {
    await vaultClient.tokenRenewSelf();
  }, 3600000); // Renew every hour
}

// Example usage
async function initApp() {
  // Get secrets from Vault
  const dbCreds = await getDatabaseCredentials();
  const jwtSecret = await getSecret('iac-dharma/jwt-secret');
  const apiKeys = await getSecret('iac-dharma/api-keys');
  
  // Configure application with secrets
  process.env.DB_USER = dbCreds.username;
  process.env.DB_PASSWORD = dbCreds.password;
  process.env.JWT_SECRET = jwtSecret.value;
  
  // Start token renewal
  renewToken();
}
```

### Kubernetes Secrets

```yaml
# Create secret from file
apiVersion: v1
kind: Secret
metadata:
  name: iac-dharma-secrets
  namespace: iac-dharma
type: Opaque
stringData:
  db-password: "your-database-password"
  jwt-secret: "your-jwt-secret"
  api-key: "your-api-key"

---
# Use secret in pod
apiVersion: v1
kind: Pod
metadata:
  name: api-gateway
spec:
  containers:
    - name: api
      image: iac-dharma/api-gateway:1.0.0
      env:
        # Environment variable from secret
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: db-password
        
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: jwt-secret
      
      # Mount secrets as files
      volumeMounts:
        - name: secrets
          mountPath: "/etc/secrets"
          readOnly: true
  
  volumes:
    - name: secrets
      secret:
        secretName: iac-dharma-secrets
```

```bash
# Create secret from command line
kubectl create secret generic iac-dharma-secrets \
  --from-literal=db-password='strong-password' \
  --from-literal=jwt-secret='jwt-secret-key' \
  --from-file=tls.crt=./tls.crt \
  --from-file=tls.key=./tls.key \
  -n iac-dharma

# Encode secret manually
echo -n 'my-secret-password' | base64

# View secret
kubectl get secret iac-dharma-secrets -o yaml

# Delete secret
kubectl delete secret iac-dharma-secrets
```

### Secret Rotation

```typescript
// Automated secret rotation
import cron from 'node-cron';

class SecretRotation {
  // Rotate JWT secret
  async rotateJWTSecret() {
    const newSecret = crypto.randomBytes(64).toString('hex');
    
    // Store new secret in Vault
    await vaultClient.write('secret/data/iac-dharma/jwt-secret', {
      data: { value: newSecret, rotated_at: new Date().toISOString() }
    });
    
    // Graceful transition: keep old secret valid for 24 hours
    await redis.setex('old_jwt_secret', 86400, process.env.JWT_SECRET);
    
    // Update current secret
    process.env.JWT_SECRET = newSecret;
    
    logger.info('JWT secret rotated successfully');
  }
  
  // Rotate database password
  async rotateDatabasePassword() {
    const newPassword = crypto.randomBytes(32).toString('hex');
    
    // Update password in database
    await pool.query(
      'ALTER USER app_user WITH PASSWORD $1',
      [newPassword]
    );
    
    // Update in Vault
    await vaultClient.write('secret/data/iac-dharma/db-password', {
      data: { value: newPassword, rotated_at: new Date().toISOString() }
    });
    
    logger.info('Database password rotated successfully');
  }
  
  // Rotate API keys
  async rotateApiKeys() {
    // Get all active API keys older than 90 days
    const oldKeys = await db.query(`
      SELECT id, user_id FROM api_keys
      WHERE created_at < NOW() - INTERVAL '90 days'
      AND active = true
    `);
    
    for (const key of oldKeys.rows) {
      // Generate new key
      const newApiKey = crypto.randomBytes(32).toString('hex');
      const keyHash = crypto.createHash('sha256').update(newApiKey).digest('hex');
      
      // Deactivate old key
      await db.query('UPDATE api_keys SET active = false WHERE id = $1', [key.id]);
      
      // Create new key
      await db.query(
        'INSERT INTO api_keys (user_id, key_hash) VALUES ($1, $2)',
        [key.user_id, keyHash]
      );
      
      // Notify user
      await sendEmail(key.user_id, 'API Key Rotated', `Your API key has been rotated. New key: ${newApiKey}`);
    }
  }
  
  // Schedule rotations
  scheduleRotations() {
    // Rotate JWT secret every 30 days
    cron.schedule('0 0 1 * *', () => this.rotateJWTSecret());
    
    // Rotate database password every 90 days
    cron.schedule('0 0 1 */3 *', () => this.rotateDatabasePassword());
    
    // Check and rotate old API keys daily
    cron.schedule('0 2 * * *', () => this.rotateApiKeys());
  }
}

const rotation = new SecretRotation();
rotation.scheduleRotations();
```

---

## Monitoring & Auditing

### Security Logging

```typescript
import winston from 'winston';

// Security event logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'iac-dharma-security' },
  transports: [
    new winston.transports.File({
      filename: '/var/log/iac-dharma/security.log',
      level: 'info'
    }),
    new winston.transports.File({
      filename: '/var/log/iac-dharma/security-errors.log',
      level: 'error'
    })
  ]
});

// Log security events
function logSecurityEvent(event: string, details: any, req?: Request) {
  securityLogger.info({
    event,
    timestamp: new Date().toISOString(),
    userId: req?.user?.id,
    ip: req?.ip,
    userAgent: req?.headers['user-agent'],
    ...details
  });
}

// Audit middleware
function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    res.send = originalSend;
    
    // Log request/response
    logSecurityEvent('api_request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
      requestBody: req.body,
      query: req.query
    }, req);
    
    return res.send(data);
  };
  
  next();
}

// Log authentication events
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await authenticate(req.body.email, req.body.password);
    
    logSecurityEvent('login_success', {
      userId: user.id,
      method: 'password'
    }, req);
    
    res.json({ token: generateToken(user) });
  } catch (error) {
    logSecurityEvent('login_failure', {
      email: req.body.email,
      reason: error.message
    }, req);
    
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Log authorization failures
function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.permissions.includes(permission)) {
      logSecurityEvent('authorization_failure', {
        userId: req.user.id,
        permission,
        resource: req.path
      }, req);
      
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

### Prometheus Security Metrics

```typescript
import promClient from 'prom-client';

// Security metrics
const securityMetrics = {
  loginAttempts: new promClient.Counter({
    name: 'login_attempts_total',
    help: 'Total number of login attempts',
    labelNames: ['status', 'method']
  }),
  
  authorizationFailures: new promClient.Counter({
    name: 'authorization_failures_total',
    help: 'Total number of authorization failures',
    labelNames: ['resource', 'permission']
  }),
  
  apiKeyUsage: new promClient.Counter({
    name: 'api_key_usage_total',
    help: 'API key usage count',
    labelNames: ['key_id', 'endpoint']
  }),
  
  suspiciousActivity: new promClient.Counter({
    name: 'suspicious_activity_total',
    help: 'Suspicious activity detected',
    labelNames: ['type', 'severity']
  }),
  
  failedHealthChecks: new promClient.Gauge({
    name: 'failed_health_checks',
    help: 'Number of failed health checks',
    labelNames: ['service']
  })
};

// Track login attempts
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await authenticate(req.body.email, req.body.password);
    securityMetrics.loginAttempts.inc({ status: 'success', method: 'password' });
    // ...
  } catch (error) {
    securityMetrics.loginAttempts.inc({ status: 'failure', method: 'password' });
    // ...
  }
});

// Track suspicious activity
function detectSuspiciousActivity(req: Request) {
  // SQL injection attempt
  if (/union|select|drop|insert|update|delete/i.test(JSON.stringify(req.body))) {
    securityMetrics.suspiciousActivity.inc({ type: 'sql_injection', severity: 'high' });
    logSecurityEvent('suspicious_activity', {
      type: 'sql_injection',
      payload: req.body
    }, req);
  }
  
  // XSS attempt
  if (/<script|javascript:|onerror=/i.test(JSON.stringify(req.body))) {
    securityMetrics.suspiciousActivity.inc({ type: 'xss', severity: 'high' });
    logSecurityEvent('suspicious_activity', {
      type: 'xss',
      payload: req.body
    }, req);
  }
}
```

### Alertmanager Rules

```yaml
# /etc/prometheus/alerts/security.yml
groups:
  - name: security_alerts
    interval: 30s
    rules:
      # High rate of failed logins
      - alert: HighFailedLoginRate
        expr: rate(login_attempts_total{status="failure"}[5m]) > 10
        for: 2m
        labels:
          severity: warning
          category: security
        annotations:
          summary: "High failed login rate detected"
          description: "More than 10 failed login attempts per minute in the last 5 minutes"
      
      # Brute force attack
      - alert: BruteForceAttack
        expr: sum(rate(login_attempts_total{status="failure"}[1m])) by (ip) > 5
        for: 1m
        labels:
          severity: critical
          category: security
        annotations:
          summary: "Possible brute force attack"
          description: "IP {{ $labels.ip }} has more than 5 failed login attempts per minute"
      
      # Authorization failures
      - alert: HighAuthorizationFailureRate
        expr: rate(authorization_failures_total[5m]) > 20
        for: 2m
        labels:
          severity: warning
          category: security
        annotations:
          summary: "High authorization failure rate"
          description: "More than 20 authorization failures per minute"
      
      # Suspicious activity
      - alert: SuspiciousActivityDetected
        expr: rate(suspicious_activity_total[5m]) > 5
        for: 1m
        labels:
          severity: critical
          category: security
        annotations:
          summary: "Suspicious activity detected"
          description: "{{ $labels.type }} activity detected: {{ $value }} events per minute"
      
      # Failed health checks
      - alert: ServiceHealthCheckFailing
        expr: failed_health_checks > 0
        for: 5m
        labels:
          severity: critical
          category: availability
        annotations:
          summary: "Service health check failing"
          description: "Service {{ $labels.service }} health check has been failing for 5 minutes"
      
      # SSL certificate expiration
      - alert: SSLCertificateExpiringSoon
        expr: (ssl_certificate_expiry_seconds - time()) / 86400 < 30
        for: 1h
        labels:
          severity: warning
          category: security
        annotations:
          summary: "SSL certificate expiring soon"
          description: "SSL certificate for {{ $labels.domain }} expires in {{ $value }} days"
```

---

## Compliance

### GDPR Compliance

```typescript
// Data subject rights implementation

class GDPRCompliance {
  // Right to access
  async exportUserData(userId: string): Promise<any> {
    const userData = await db.query(`
      SELECT u.id, u.email, u.name, u.created_at,
             json_agg(b.*) as blueprints,
             json_agg(d.*) as deployments
      FROM users u
      LEFT JOIN blueprints b ON b.user_id = u.id
      LEFT JOIN deployments d ON d.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);
    
    return userData.rows[0];
  }
  
  // Right to rectification
  async updateUserData(userId: string, data: any): Promise<void> {
    await db.query(
      'UPDATE users SET email = $1, name = $2, updated_at = NOW() WHERE id = $3',
      [data.email, data.name, userId]
    );
  }
  
  // Right to erasure (right to be forgotten)
  async deleteUserData(userId: string): Promise<void> {
    // Anonymize instead of delete (for audit trail)
    await db.query(`
      UPDATE users SET
        email = 'deleted_' || id || '@deleted.local',
        name = 'Deleted User',
        phone = NULL,
        address = NULL,
        deleted_at = NOW()
      WHERE id = $1
    `, [userId]);
    
    // Delete personal data from related tables
    await db.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
    
    // Log deletion
    await db.query(
      'INSERT INTO gdpr_deletions (user_id, deleted_at) VALUES ($1, NOW())',
      [userId]
    );
  }
  
  // Data portability
  async exportUserDataPortable(userId: string): Promise<Buffer> {
    const data = await this.exportUserData(userId);
    
    // Convert to JSON
    const json = JSON.stringify(data, null, 2);
    
    // Or convert to CSV
    // const csv = convertToCSV(data);
    
    return Buffer.from(json);
  }
  
  // Consent management
  async updateConsent(userId: string, consents: {
    marketing: boolean;
    analytics: boolean;
    necessary: boolean;
  }): Promise<void> {
    await db.query(`
      INSERT INTO user_consents (user_id, marketing, analytics, necessary, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        marketing = EXCLUDED.marketing,
        analytics = EXCLUDED.analytics,
        necessary = EXCLUDED.necessary,
        updated_at = NOW()
    `, [userId, consents.marketing, consents.analytics, consents.necessary]);
  }
  
  // Data retention policy
  async enforceDataRetention(): Promise<void> {
    // Delete old inactive accounts (2 years)
    await db.query(`
      DELETE FROM users
      WHERE last_login_at < NOW() - INTERVAL '2 years'
      AND deleted_at IS NULL
    `);
    
    // Delete old logs (1 year)
    await db.query(`
      DELETE FROM audit_logs
      WHERE created_at < NOW() - INTERVAL '1 year'
    `);
  }
}
```

### HIPAA Compliance

```typescript
class HIPAACompliance {
  // Encrypt PHI (Protected Health Information)
  async encryptPHI(data: string): Promise<string> {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }
  
  // Decrypt PHI
  async decryptPHI(encryptedData: string): Promise<string> {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData);
    
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // Audit trail for PHI access
  async logPHIAccess(userId: string, patientId: string, action: string) {
    await db.query(`
      INSERT INTO phi_access_log (
        user_id, patient_id, action, ip_address, timestamp
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [userId, patientId, action, req.ip]);
  }
  
  // Minimum necessary standard
  async getPHI(userId: string, patientId: string, fields: string[]) {
    // Only return requested fields
    const allowedFields = ['name', 'dob', 'diagnosis', 'treatment'];
    const requestedFields = fields.filter(f => allowedFields.includes(f));
    
    const query = `SELECT ${requestedFields.join(', ')} FROM patients WHERE id = $1`;
    const result = await db.query(query, [patientId]);
    
    // Log access
    await this.logPHIAccess(userId, patientId, `read:${requestedFields.join(',')}`);
    
    return result.rows[0];
  }
}
```

### SOC 2 Controls

```typescript
// Logging and monitoring for SOC 2
class SOC2Controls {
  // CC6.1: Logical access security
  async implementAccessControls() {
    // Multi-factor authentication
    // Role-based access control
    // Session timeouts
    // Password policies
  }
  
  // CC7.2: System monitoring
  async monitorSystems() {
    // Real-time monitoring
    // Alerting on anomalies
    // Log aggregation
    // Performance metrics
  }
  
  // CC7.3: Security incident detection
  async detectSecurityIncidents() {
    // IDS/IPS
    // SIEM integration
    // Automated response
  }
  
  // CC8.1: Change management
  async trackChanges() {
    await db.query(`
      INSERT INTO change_log (
        user_id, resource_type, resource_id, action, changes, timestamp
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [userId, resourceType, resourceId, action, JSON.stringify(changes)]);
  }
}
```

---

## Incident Response

### Incident Response Plan

```typescript
enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum IncidentStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  ERADICATED = 'eradicated',
  RECOVERED = 'recovered',
  CLOSED = 'closed'
}

interface SecurityIncident {
  id: string;
  type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectedAt: Date;
  description: string;
  affectedSystems: string[];
  assignedTo: string;
  timeline: IncidentEvent[];
}

class IncidentResponse {
  // 1. Detection
  async detectIncident(type: string, description: string, affectedSystems: string[]): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      id: crypto.randomUUID(),
      type,
      severity: this.calculateSeverity(type, affectedSystems),
      status: IncidentStatus.DETECTED,
      detectedAt: new Date(),
      description,
      affectedSystems,
      assignedTo: await this.assignIncident(type),
      timeline: [{
        status: IncidentStatus.DETECTED,
        timestamp: new Date(),
        description: 'Incident detected'
      }]
    };
    
    // Store incident
    await db.query(
      'INSERT INTO security_incidents (id, type, severity, status, data) VALUES ($1, $2, $3, $4, $5)',
      [incident.id, incident.type, incident.severity, incident.status, JSON.stringify(incident)]
    );
    
    // Alert team
    await this.alertTeam(incident);
    
    return incident;
  }
  
  // 2. Containment
  async containIncident(incidentId: string): Promise<void> {
    // Isolate affected systems
    const incident = await this.getIncident(incidentId);
    
    for (const system of incident.affectedSystems) {
      await this.isolateSystem(system);
    }
    
    // Block malicious IPs
    if (incident.type === 'brute_force') {
      await this.blockIPs(incident.metadata.sourceIPs);
    }
    
    // Revoke compromised credentials
    if (incident.type === 'credential_compromise') {
      await this.revokeCredentials(incident.metadata.affectedUsers);
    }
    
    // Update incident status
    await this.updateIncidentStatus(incidentId, IncidentStatus.CONTAINED);
  }
  
  // 3. Eradication
  async eradicateIncident(incidentId: string): Promise<void> {
    // Remove malware, close vulnerabilities, patch systems
    const incident = await this.getIncident(incidentId);
    
    // Apply security patches
    await this.applyPatches(incident.affectedSystems);
    
    // Remove backdoors
    await this.scanForBackdoors(incident.affectedSystems);
    
    // Update incident status
    await this.updateIncidentStatus(incidentId, IncidentStatus.ERADICATED);
  }
  
  // 4. Recovery
  async recoverFromIncident(incidentId: string): Promise<void> {
    // Restore systems to normal operation
    const incident = await this.getIncident(incidentId);
    
    for (const system of incident.affectedSystems) {
      await this.restoreSystem(system);
    }
    
    // Verify integrity
    await this.verifySystemIntegrity(incident.affectedSystems);
    
    // Update incident status
    await this.updateIncidentStatus(incidentId, IncidentStatus.RECOVERED);
  }
  
  // 5. Lessons Learned
  async conductPostMortem(incidentId: string): Promise<void> {
    const incident = await this.getIncident(incidentId);
    
    // Generate report
    const report = {
      incident,
      rootCause: await this.identifyRootCause(incident),
      impact: await this.assessImpact(incident),
      improvements: await this.recommendImprovements(incident),
      timeline: incident.timeline
    };
    
    // Store report
    await db.query(
      'INSERT INTO incident_reports (incident_id, report) VALUES ($1, $2)',
      [incidentId, JSON.stringify(report)]
    );
    
    // Implement improvements
    await this.implementImprovements(report.improvements);
    
    // Close incident
    await this.updateIncidentStatus(incidentId, IncidentStatus.CLOSED);
  }
  
  // Helper: Calculate severity
  private calculateSeverity(type: string, affectedSystems: string[]): IncidentSeverity {
    // Critical: Data breach, system compromise
    if (type === 'data_breach' || type === 'system_compromise') {
      return IncidentSeverity.CRITICAL;
    }
    
    // High: Widespread impact, credential compromise
    if (affectedSystems.length > 10 || type === 'credential_compromise') {
      return IncidentSeverity.HIGH;
    }
    
    // Medium: Limited impact
    if (affectedSystems.length > 3) {
      return IncidentSeverity.MEDIUM;
    }
    
    // Low: Minimal impact
    return IncidentSeverity.LOW;
  }
  
  // Helper: Alert team
  private async alertTeam(incident: SecurityIncident): Promise<void> {
    const message = `
      🚨 Security Incident Detected
      
      Type: ${incident.type}
      Severity: ${incident.severity}
      Affected Systems: ${incident.affectedSystems.join(', ')}
      Description: ${incident.description}
      
      Incident ID: ${incident.id}
    `;
    
    // Send to Slack
    await sendSlackAlert(message);
    
    // Send to PagerDuty (critical only)
    if (incident.severity === IncidentSeverity.CRITICAL) {
      await triggerPagerDuty(message);
    }
    
    // Send email
    await sendEmailAlert(incident.assignedTo, 'Security Incident', message);
  }
}
```

### Automated Response

```bash
#!/bin/bash
# incident-response.sh

# Automated incident response script

INCIDENT_TYPE=$1
AFFECTED_IP=$2

case $INCIDENT_TYPE in
  "brute_force")
    # Block IP immediately
    ufw deny from $AFFECTED_IP
    
    # Add to fail2ban
    fail2ban-client set sshd banip $AFFECTED_IP
    
    # Log incident
    logger "Blocked IP $AFFECTED_IP for brute force attack"
    ;;
  
  "dos_attack")
    # Enable rate limiting
    iptables -A INPUT -p tcp --dport 80 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT
    
    # Block attacker
    iptables -A INPUT -s $AFFECTED_IP -j DROP
    
    logger "Mitigated DOS attack from $AFFECTED_IP"
    ;;
  
  "malware_detected")
    # Isolate affected container
    docker pause $(docker ps -q --filter "name=affected_service")
    
    # Take snapshot
    docker commit affected_service malware_snapshot
    
    # Alert team
    curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"Malware detected on affected_service. Container paused.\"}"
    
    logger "Malware detected, container isolated"
    ;;
esac
```

---

## Security Scanning

### Automated Security Scans

```bash
#!/bin/bash
# security-scan.sh

echo "Running comprehensive security scan..."

# 1. Dependency vulnerabilities
echo "Scanning dependencies..."
npm audit --production
snyk test

# 2. Docker image vulnerabilities
echo "Scanning Docker images..."
trivy image iac-dharma/api-gateway:latest --severity HIGH,CRITICAL

# 3. Container runtime security
echo "Scanning running containers..."
docker scan $(docker ps -q)

# 4. SAST (Static Application Security Testing)
echo "Running SAST..."
semgrep --config=auto .

# 5. Secret scanning
echo "Scanning for secrets..."
gitleaks detect --source . --verbose

# 6. Infrastructure security
echo "Scanning infrastructure..."
checkov -d terraform/
tfsec terraform/

# 7. API security testing
echo "Testing API security..."
zap-cli quick-scan http://localhost:3000

# 8. SSL/TLS configuration
echo "Testing SSL configuration..."
testssl.sh https://iac-dharma.com

# Generate report
echo "Generating security report..."
cat << EOF > security-report.md
# Security Scan Report
Date: $(date)

## Summary
- Dependency vulnerabilities: $(npm audit --json | jq '.metadata.vulnerabilities | add')
- Container vulnerabilities: $(trivy image iac-dharma/api-gateway:latest --format json | jq '.Results[].Vulnerabilities | length')
- Secrets found: $(gitleaks detect --source . --report-format json | jq '. | length')

See attached logs for details.
EOF

echo "Security scan complete!"
```

---

## Security Checklists

### Pre-Deployment Security Checklist

- [ ] All dependencies updated to latest secure versions
- [ ] No secrets in code or configuration files
- [ ] Environment variables properly configured
- [ ] Strong passwords and keys generated
- [ ] TLS/SSL certificates installed and valid
- [ ] Firewall rules configured
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] CORS properly configured
- [ ] Security headers configured
- [ ] Logging and monitoring enabled
- [ ] Backup strategy implemented
- [ ] Incident response plan documented
- [ ] Security scan passed with no critical issues
- [ ] Penetration testing completed
- [ ] Team trained on security procedures

### Post-Deployment Security Checklist

- [ ] All services running and healthy
- [ ] Security monitoring active
- [ ] Alerts configured and tested
- [ ] Logs being collected and analyzed
- [ ] Backups running successfully
- [ ] SSL certificates valid and auto-renewing
- [ ] Firewall rules verified
- [ ] Database connections encrypted
- [ ] API authentication working
- [ ] Rate limiting effective
- [ ] Security headers present
- [ ] No security warnings in logs
- [ ] Compliance requirements met
- [ ] Documentation updated

### Monthly Security Maintenance

- [ ] Review and update dependencies
- [ ] Rotate secrets and credentials
- [ ] Review access logs for anomalies
- [ ] Test backup restoration
- [ ] Verify SSL certificate expiration
- [ ] Review and update firewall rules
- [ ] Update security documentation
- [ ] Conduct security training
- [ ] Run vulnerability scans
- [ ] Review incident reports
- [ ] Update security policies

---

## Security Tools

### Recommended Tools

**Static Analysis**:
- ESLint Security Plugin
- Semgrep
- SonarQube
- Bandit (Python)

**Dependency Scanning**:
- npm audit
- Snyk
- OWASP Dependency-Check
- GitHub Dependabot

**Container Security**:
- Trivy
- Clair
- Anchore
- Docker Scout

**Secrets Detection**:
- GitLeaks
- TruffleHog
- detect-secrets

**Infrastructure as Code**:
- Checkov
- tfsec
- Terrascan

**Runtime Security**:
- Falco
- AppArmor
- SELinux

**Penetration Testing**:
- OWASP ZAP
- Burp Suite
- Metasploit

**Monitoring**:
- Prometheus + Alertmanager
- ELK Stack
- Splunk
- Datadog

---

## See Also

- [Installation Guide](Installation-Guide) - Secure installation procedures
- [Configuration](Configuration) - Security configuration options
- [Deployment Guide](Deployment-Guide) - Secure deployment strategies
- [Observability](Observability) - Security monitoring and logging
- [Backup and Recovery](Backup-and-Recovery) - Data protection strategies
- [Compliance Guide](Compliance-Guide) - Regulatory compliance

---

**Last Updated**: November 22, 2025  
**Version**: 1.0.0  
**Security Contact**: security@iac-dharma.com

[← Back to Home](Home)
