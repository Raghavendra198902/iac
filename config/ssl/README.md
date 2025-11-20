# SSL/TLS Certificates

This directory contains SSL/TLS certificates for different environments.

## Directory Structure

```
ssl/
├── development/
│   ├── tls.crt          # Self-signed certificate
│   └── tls.key          # Private key
├── staging/
│   ├── tls.crt          # Let's Encrypt or custom certificate
│   ├── tls.key          # Private key
│   └── ca.crt           # CA bundle (if applicable)
└── production/
    ├── tls.crt          # Production certificate
    ├── tls.key          # Private key
    └── ca.crt           # CA bundle (if applicable)
```

## Security Notes

⚠️ **IMPORTANT**: Certificate private keys (`.key` files) are sensitive!

- **DO NOT** commit private keys to version control
- Add `*.key` to `.gitignore`
- Store production keys in AWS Secrets Manager or similar
- Use appropriate file permissions (600 for keys, 644 for certificates)

## Quick Start

### Development (Self-Signed Certificate)

```bash
./manage-certs.sh -e development -d localhost -a generate-self-signed
```

### Staging (Let's Encrypt)

```bash
./manage-certs.sh -e staging \
  -d staging.dharma.example.com \
  -m admin@example.com \
  -a request-letsencrypt
```

### Production (Let's Encrypt)

```bash
./manage-certs.sh -e production \
  -d app.dharma.example.com \
  -m admin@example.com \
  -a request-letsencrypt
```

## Kubernetes Integration

After generating/obtaining certificates, create Kubernetes secrets:

```bash
# Development
kubectl create secret tls dharma-tls \
  --cert=development/tls.crt \
  --key=development/tls.key \
  --namespace=dharma

# Staging
kubectl create secret tls dharma-tls \
  --cert=staging/tls.crt \
  --key=staging/tls.key \
  --namespace=dharma

# Production
kubectl create secret tls dharma-tls \
  --cert=production/tls.crt \
  --key=production/tls.key \
  --namespace=dharma
```

## Certificate Renewal

Let's Encrypt certificates expire after 90 days. Renew them:

```bash
# Manual renewal
./manage-certs.sh -e production -a renew

# Automatic renewal (cron job)
0 0 * * * /path/to/manage-certs.sh -e production -a renew
```

## AWS Certificate Manager (ACM)

For production, consider using AWS ACM:

1. Request certificate in ACM
2. Validate domain ownership
3. Use ACM certificate with ALB/NLB
4. No manual renewal needed

## Troubleshooting

### Certificate Verification

```bash
# Check certificate details
openssl x509 -in production/tls.crt -text -noout

# Verify private key matches certificate
openssl x509 -noout -modulus -in production/tls.crt | openssl md5
openssl rsa -noout -modulus -in production/tls.key | openssl md5
```

### Common Issues

**Issue**: Let's Encrypt validation fails

**Solution**: Ensure:
- DNS points to your server
- Ports 80/443 are accessible
- No firewall blocking

**Issue**: Kubernetes secret creation fails

**Solution**: Check file permissions and paths

## Best Practices

1. **Use ACM for Production**: Automatic renewal, managed by AWS
2. **Rotate Regularly**: Even if not expired
3. **Monitor Expiration**: Set up alerts 30 days before expiry
4. **Backup Certificates**: Store in secure vault
5. **Use Strong Keys**: 2048-bit RSA minimum (4096-bit recommended)
