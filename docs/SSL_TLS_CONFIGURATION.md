# SSL/TLS Certificate Configuration Guide

## Overview
This guide covers SSL/TLS certificate setup for the IaC Platform v3.0 in production environments.

---

## Option 1: Let's Encrypt (Recommended for Public Domains)

### Prerequisites
- Domain name pointing to your server
- Certbot installed
- Ports 80 and 443 open

### Installation

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Or for standalone mode
sudo apt-get install certbot
```

### Generate Certificates

```bash
# For Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# For standalone (no web server)
sudo certbot certonly --standalone -d yourdomain.com
```

### Certificate Locations
- Certificate: `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/yourdomain.com/privkey.pem`
- Chain: `/etc/letsencrypt/live/yourdomain.com/chain.pem`

### Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for auto-renewal
sudo crontab -e

# Add this line:
0 0 * * * certbot renew --quiet --post-hook "docker-compose -f /home/rrd/iac/docker-compose.v3.yml restart frontend api-gateway advanced-rbac"
```

---

## Option 2: Self-Signed Certificates (Development/Internal)

### Generate Self-Signed Certificate

```bash
# Create certificates directory
mkdir -p /home/rrd/iac/certs
cd /home/rrd/iac/certs

# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate signing request
openssl req -new -key server.key -out server.csr

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# Or all in one command
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server.key -out server.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### Certificate Files Created
- `server.key` - Private key
- `server.crt` - Certificate
- `server.csr` - Certificate signing request

---

## Option 3: Commercial Certificate (Production)

### Steps

1. **Generate CSR**
```bash
openssl req -new -newkey rsa:2048 -nodes \
  -keyout yourdomain.key -out yourdomain.csr
```

2. **Purchase Certificate**
   - Buy from: DigiCert, Comodo, GlobalSign, etc.
   - Submit CSR to certificate authority
   - Complete domain validation

3. **Download Certificate Files**
   - Certificate file (`.crt` or `.pem`)
   - Intermediate certificates (chain)
   - Root certificate

4. **Combine Certificates**
```bash
# Create full chain
cat yourdomain.crt intermediate.crt root.crt > fullchain.pem
```

---

## Docker Configuration

### Update docker-compose.v3.yml

```yaml
services:
  frontend:
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./certs/fullchain.pem:/etc/ssl/certs/server.crt:ro
      - ./certs/privkey.pem:/etc/ssl/private/server.key:ro
    environment:
      - SSL_CERT_PATH=/etc/ssl/certs/server.crt
      - SSL_KEY_PATH=/etc/ssl/private/server.key

  api-gateway:
    ports:
      - "4443:4443"
    volumes:
      - ./certs/fullchain.pem:/etc/ssl/certs/server.crt:ro
      - ./certs/privkey.pem:/etc/ssl/private/server.key:ro
    environment:
      - SSL_ENABLED=true
      - SSL_CERT=/etc/ssl/certs/server.crt
      - SSL_KEY=/etc/ssl/private/server.key

  advanced-rbac:
    volumes:
      - ./certs/fullchain.pem:/etc/ssl/certs/server.crt:ro
      - ./certs/privkey.pem:/etc/ssl/private/server.key:ro
    environment:
      - SSL_ENABLED=true
```

---

## Nginx Configuration (Reverse Proxy)

### Install Nginx

```bash
sudo apt-get install nginx
```

### Configure SSL Reverse Proxy

Create `/etc/nginx/sites-available/iac-platform`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Gateway
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # RBAC Service
    location /rbac/ {
        proxy_pass http://localhost:3050/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Grafana
    location /grafana/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Jaeger
    location /jaeger/ {
        proxy_pass http://localhost:16686/;
        proxy_set_header Host $host;
    }
}
```

### Enable Configuration

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/iac-platform /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Service-Specific SSL Configuration

### Node.js Services (RBAC, API Gateway)

Update service to use HTTPS:

```javascript
// server.ts
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH || '/etc/ssl/private/server.key'),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/etc/ssl/certs/server.crt')
};

const server = https.createServer(options, app);
server.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
```

### Next.js Frontend

Update `next.config.js`:

```javascript
module.exports = {
  env: {
    API_URL: 'https://yourdomain.com/api',
    RBAC_URL: 'https://yourdomain.com/rbac',
  },
  // For development with self-signed cert
  webpack: (config, { dev }) => {
    if (dev) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    return config;
  }
}
```

### Environment Variables

Update `.env.production`:

```bash
# SSL Configuration
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/server.crt
SSL_KEY_PATH=/etc/ssl/private/server.key

# Service URLs (HTTPS)
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_RBAC_URL=https://yourdomain.com/rbac
VAULT_ADDR=https://yourdomain.com:8200

# Force HTTPS
FORCE_HTTPS=true
```

---

## PostgreSQL SSL

### Enable SSL in PostgreSQL

```bash
# Copy certificates
sudo cp /home/rrd/iac/certs/server.crt /var/lib/postgresql/data/server.crt
sudo cp /home/rrd/iac/certs/server.key /var/lib/postgresql/data/server.key
sudo chmod 600 /var/lib/postgresql/data/server.key
sudo chown postgres:postgres /var/lib/postgresql/data/server.*

# Edit postgresql.conf
sudo docker exec -it iac-postgres-v3 bash -c "echo 'ssl = on' >> /var/lib/postgresql/data/postgresql.conf"
sudo docker exec -it iac-postgres-v3 bash -c "echo \"ssl_cert_file = '/var/lib/postgresql/data/server.crt'\" >> /var/lib/postgresql/data/postgresql.conf"
sudo docker exec -it iac-postgres-v3 bash -c "echo \"ssl_key_file = '/var/lib/postgresql/data/server.key'\" >> /var/lib/postgresql/data/postgresql.conf"

# Restart PostgreSQL
docker-compose -f docker-compose.v3.yml restart postgres
```

### Update Connection Strings

```bash
# Update .env
DATABASE_URL=postgresql://iac_user:password@localhost:5432/iac_platform?sslmode=require
```

---

## Redis SSL

### Configure Redis with TLS

Update `docker-compose.v3.yml`:

```yaml
redis:
  command: >
    redis-server
    --tls-port 6380
    --port 0
    --tls-cert-file /etc/ssl/certs/server.crt
    --tls-key-file /etc/ssl/private/server.key
    --tls-ca-cert-file /etc/ssl/certs/ca.crt
  volumes:
    - ./certs/server.crt:/etc/ssl/certs/server.crt:ro
    - ./certs/server.key:/etc/ssl/private/server.key:ro
```

---

## Vault SSL

Vault should always use SSL in production:

```bash
# Set Vault address to HTTPS
export VAULT_ADDR=https://localhost:8200
export VAULT_CACERT=/home/rrd/iac/certs/server.crt

# Update docker-compose.vault.yml
environment:
  - VAULT_ADDR=https://0.0.0.0:8200
  - VAULT_API_ADDR=https://yourdomain.com:8200
volumes:
  - ./certs/server.crt:/vault/config/server.crt:ro
  - ./certs/server.key:/vault/config/server.key:ro
```

---

## Testing SSL Configuration

### Test Certificate

```bash
# Check certificate details
openssl x509 -in /home/rrd/iac/certs/server.crt -text -noout

# Verify certificate chain
openssl verify -CAfile /home/rrd/iac/certs/fullchain.pem /home/rrd/iac/certs/server.crt

# Test SSL connection
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Test with curl
curl -v https://yourdomain.com
```

### SSL Labs Test

For public domains, use SSL Labs:
https://www.ssllabs.com/ssltest/

---

## Security Best Practices

1. **Use Strong Ciphers**
   - TLS 1.2 and 1.3 only
   - Disable weak ciphers

2. **Enable HSTS**
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```

3. **Regular Updates**
   - Renew certificates before expiration
   - Update SSL/TLS libraries

4. **Secure Private Keys**
   ```bash
   chmod 600 /home/rrd/iac/certs/*.key
   chown root:root /home/rrd/iac/certs/*.key
   ```

5. **Monitor Certificate Expiration**
   ```bash
   # Add to monitoring
   openssl x509 -enddate -noout -in /home/rrd/iac/certs/server.crt
   ```

---

## Troubleshooting

### Common Issues

**Certificate Not Trusted**
```bash
# Install CA certificate
sudo cp /home/rrd/iac/certs/ca.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

**Permission Denied**
```bash
# Fix permissions
sudo chown -R $USER:$USER /home/rrd/iac/certs
chmod 644 /home/rrd/iac/certs/*.crt
chmod 600 /home/rrd/iac/certs/*.key
```

**Mixed Content Warnings**
- Ensure all resources load via HTTPS
- Update API URLs in frontend code
- Use relative URLs where possible

**Certificate Expired**
```bash
# Check expiration
openssl x509 -enddate -noout -in server.crt

# Renew Let's Encrypt
sudo certbot renew
```

---

## Quick Setup Script

```bash
#!/bin/bash
# Quick SSL setup for IaC Platform

set -e

DOMAIN=${1:-localhost}
CERT_DIR="/home/rrd/iac/certs"

echo "Setting up SSL for domain: $DOMAIN"

# Create certs directory
mkdir -p "$CERT_DIR"
cd "$CERT_DIR"

if [ "$DOMAIN" = "localhost" ]; then
    echo "Generating self-signed certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout server.key -out server.crt \
        -subj "/C=US/ST=State/L=City/O=IaC Platform/CN=$DOMAIN"
    
    ln -sf server.crt fullchain.pem
    ln -sf server.key privkey.pem
else
    echo "Setting up Let's Encrypt certificate..."
    sudo certbot certonly --standalone -d "$DOMAIN"
    
    ln -sf "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" fullchain.pem
    ln -sf "/etc/letsencrypt/live/$DOMAIN/privkey.pem" privkey.pem
fi

echo "✅ SSL certificates ready!"
echo "Certificate: $CERT_DIR/fullchain.pem"
echo "Private Key: $CERT_DIR/privkey.pem"
```

Save as `scripts/setup-ssl.sh` and run:
```bash
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh yourdomain.com
```

---

## Production Checklist

- [ ] SSL certificates generated
- [ ] Private keys secured (chmod 600)
- [ ] Certificates installed in all services
- [ ] HTTP to HTTPS redirect configured
- [ ] HSTS header enabled
- [ ] Security headers configured
- [ ] Certificate auto-renewal setup
- [ ] Monitoring for expiration
- [ ] All service URLs updated to HTTPS
- [ ] Database connections using SSL
- [ ] Redis TLS enabled
- [ ] Vault using HTTPS
- [ ] SSL Labs test passed (A+ rating)

---

## Support

For certificate issues:
- Let's Encrypt: https://community.letsencrypt.org/
- SSL Labs: https://www.ssllabs.com/
- Mozilla SSL Config: https://ssl-config.mozilla.org/
