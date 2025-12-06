# HTTPS Access Configuration

## ✅ HTTPS Enabled Successfully!

### Access URLs:

**HTTPS (Secure - Recommended):**
```
https://192.168.0.103:3443
https://localhost:3443
```

**HTTP (Redirects to HTTPS):**
```
http://192.168.0.103:3000  →  https://192.168.0.103:3443
http://localhost:3000       →  https://localhost:3443
```

## SSL Certificate Details:

- **Type:** Self-signed certificate
- **Validity:** 365 days (expires Dec 6, 2026)
- **Organization:** RRD Technologies
- **Location:** Bangalore, Karnataka, IN
- **Common Name:** 192.168.0.103
- **Subject Alternative Names:** 
  - IP: 192.168.0.103
  - DNS: localhost

## Security Configuration:

- ✅ TLS 1.2 and TLS 1.3 enabled
- ✅ Strong cipher suites
- ✅ HTTP to HTTPS automatic redirect
- ✅ SSL session caching (10 minutes)
- ✅ Server-preferred cipher ordering

## Browser Access:

### First Time Access:
1. Open browser and navigate to: `https://192.168.0.103:3443`
2. You'll see a security warning (expected for self-signed certificates)
3. Click "Advanced" → "Proceed to 192.168.0.103 (unsafe)"
4. The warning appears because the certificate is self-signed, not from a trusted CA

### Skip Warning (For Development):

**Chrome/Edge:**
- Type `thisisunsafe` when on the warning page (no input field needed)

**Firefox:**
- Click "Advanced" → "Accept the Risk and Continue"

**Safari:**
- Click "Show Details" → "visit this website"

## Production Deployment:

For production, replace with a certificate from a trusted CA:

### Option 1: Let's Encrypt (Free)
```bash
certbot certonly --standalone -d your-domain.com
```

### Option 2: Commercial CA
- Purchase from DigiCert, GlobalSign, etc.
- Copy certificate files to `ssl/` directory
- Rebuild Docker image

### Option 3: Corporate CA
- Request certificate from your organization's CA
- Install certificate and private key

## Files Location:

- Certificate: `/home/rrd/iac/frontend-v3-new/ssl/certificate.crt`
- Private Key: `/home/rrd/iac/frontend-v3-new/ssl/private.key`
- Nginx Config: `/home/rrd/iac/frontend-v3-new/nginx.conf`

## Docker Ports:

- Port 3000 (HTTP) → Redirects to HTTPS
- Port 3443 (HTTPS) → Secure connection

## Testing SSL:

```bash
# Test HTTPS connection
curl -k https://192.168.0.103:3443

# View certificate details
openssl s_client -connect 192.168.0.103:3443 -servername 192.168.0.103

# Test redirect
curl -I http://192.168.0.103:3000
```

## Network Access:

From other devices on the network (192.168.0.x):
```
https://192.168.0.103:3443
```

## Troubleshooting:

**Certificate Warning:**
- Normal for self-signed certificates
- Add exception in browser
- For production, use trusted CA certificate

**Connection Refused:**
- Check Docker container: `docker ps | grep iac-frontend`
- Check firewall: `sudo ufw allow 3443/tcp`
- Verify port binding: `docker port iac-frontend-v3`

**Mixed Content Warnings:**
- Ensure all API calls use HTTPS
- Update service URLs in configuration
- Check browser console for HTTP requests

## Security Headers:

The nginx configuration includes:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

## Monitoring:

Check SSL certificate expiration:
```bash
openssl x509 -in ssl/certificate.crt -noout -enddate
```

Current certificate expires: **December 6, 2026**

---

**Status:** ✅ HTTPS Active  
**Build:** iac-frontend:v3-https  
**Container:** iac-frontend-v3  
**Deployed:** December 6, 2025
