# Local Domain Configuration Guide

## Overview

This guide configures local domain names for the IAC Platform, making it accessible via friendly URLs instead of IP addresses and ports.

## Quick Setup

### Automated Setup (Recommended)

```bash
cd /home/rrd/iac
sudo ./configure-local-domains.sh
```

This script will:
- Generate SSL certificates
- Update /etc/hosts file
- Configure Nginx (if installed)
- Verify DNS resolution
- Display access URLs

### Manual Setup

#### 1. Add Hosts Entries

**Linux/Mac:**
```bash
sudo nano /etc/hosts
```

**Windows:**
Run Notepad as Administrator and open:
```
C:\Windows\System32\drivers\etc\hosts
```

Add these entries (replace 192.168.0.103 with your actual IP):

```
# IAC Platform Local Domains
127.0.0.1       iac.local www.iac.local
127.0.0.1       api.iac.local
127.0.0.1       grafana.iac.local
127.0.0.1       prometheus.iac.local
127.0.0.1       neo4j.iac.local
127.0.0.1       mlflow.iac.local

192.168.0.103   iac.local www.iac.local
192.168.0.103   api.iac.local
192.168.0.103   grafana.iac.local
192.168.0.103   prometheus.iac.local
192.168.0.103   neo4j.iac.local
192.168.0.103   mlflow.iac.local
```

#### 2. Generate SSL Certificates

```bash
sudo mkdir -p /etc/nginx/ssl
cd /etc/nginx/ssl

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout iac.key \
    -out iac.crt \
    -subj "/C=US/ST=State/L=City/O=IAC-Platform/CN=iac.local" \
    -addext "subjectAltName=DNS:iac.local,DNS:*.iac.local"
```

#### 3. Configure Nginx (Optional)

If you want to use standard ports (80/443) without specifying port numbers:

```bash
sudo cp /home/rrd/iac/config/nginx-domains.conf /etc/nginx/sites-available/iac-domains.conf
sudo ln -s /etc/nginx/sites-available/iac-domains.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Verify Setup

```bash
# Test DNS resolution
ping -c 1 iac.local

# Test HTTPS access
curl -k https://iac.local:3543

# Test API access
curl http://api.iac.local:4000/api/health
```

## Access URLs

### With Port Numbers (Docker Direct Access)

#### Main Application
- **Production Frontend**: https://iac.local:3543
- **Alternative**: https://www.iac.local:3543
- **HTTP Redirect**: http://iac.local:3100

#### API Gateway
- **REST API**: http://api.iac.local:4000
- **GraphQL**: http://api.iac.local:4000/graphql
- **WebSocket**: ws://api.iac.local:4000/ws

#### Monitoring & Management
- **Grafana**: http://grafana.iac.local:3020
  - Username: `admin`
  - Password: `admin123`
- **Prometheus**: http://prometheus.iac.local:9091
- **Neo4j Browser**: http://neo4j.iac.local:7474
  - Username: `neo4j`
  - Password: `neo4jpassword`
- **MLflow**: http://mlflow.iac.local:5000

### With Nginx (Standard Ports)

If Nginx is configured:

- **Main App**: https://iac.local
- **API**: https://api.iac.local
- **Grafana**: https://grafana.iac.local
- **Prometheus**: https://prometheus.iac.local
- **Neo4j**: https://neo4j.iac.local
- **MLflow**: https://mlflow.iac.local

## Network Access (Other Machines)

To access from other machines on your network:

### On Client Machines

Add to hosts file (replace 192.168.0.103 with server IP):

**Linux/Mac** (`/etc/hosts`):
```
192.168.0.103   iac.local www.iac.local
192.168.0.103   api.iac.local grafana.iac.local
192.168.0.103   prometheus.iac.local neo4j.iac.local
192.168.0.103   mlflow.iac.local
```

**Windows** (`C:\Windows\System32\drivers\etc\hosts`):
```
192.168.0.103   iac.local www.iac.local
192.168.0.103   api.iac.local grafana.iac.local
192.168.0.103   prometheus.iac.local neo4j.iac.local
192.168.0.103   mlflow.iac.local
```

### Mobile Devices

Most mobile devices don't allow hosts file editing. Options:

1. **Use IP Address**: Access via https://192.168.0.103:3543
2. **Set up DNS Server**: Configure a local DNS server (Pi-hole, dnsmasq)
3. **Use VPN with DNS**: Set up WireGuard/OpenVPN with custom DNS

## SSL Certificate Trust

### Browser (Desktop)

1. Navigate to https://iac.local:3543
2. Click "Advanced" or "Details"
3. Click "Proceed to iac.local (unsafe)" or "Accept Risk"

### System-wide Trust (Linux)

```bash
# Copy certificate
sudo cp /etc/nginx/ssl/iac.crt /usr/local/share/ca-certificates/iac-platform.crt

# Update certificate store
sudo update-ca-certificates

# Verify
openssl verify /etc/nginx/ssl/iac.crt
```

### System-wide Trust (Mac)

```bash
# Add to keychain
sudo security add-trusted-cert -d -r trustRoot \
    -k /Library/Keychains/System.keychain \
    /etc/nginx/ssl/iac.crt
```

### System-wide Trust (Windows)

1. Double-click `iac.crt`
2. Click "Install Certificate"
3. Select "Local Machine"
4. Choose "Place all certificates in the following store"
5. Select "Trusted Root Certification Authorities"
6. Complete the wizard

## Troubleshooting

### DNS Not Resolving

```bash
# Check hosts file
cat /etc/hosts | grep iac.local

# Clear DNS cache (Linux)
sudo systemd-resolve --flush-caches

# Clear DNS cache (Mac)
sudo dscacheutil -flushcache

# Clear DNS cache (Windows - Run as Admin)
ipconfig /flushdns

# Test resolution
nslookup iac.local
ping iac.local
```

### Port Already in Use

```bash
# Check what's using port 80
sudo lsof -i :80

# Check what's using port 443
sudo lsof -i :443

# Stop conflicting service
sudo systemctl stop apache2  # or other service
```

### SSL Certificate Errors

```bash
# Regenerate certificates
sudo rm -f /etc/nginx/ssl/iac.*
cd /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout iac.key -out iac.crt \
    -subj "/C=US/ST=State/L=City/O=IAC-Platform/CN=iac.local" \
    -addext "subjectAltName=DNS:iac.local,DNS:*.iac.local"

# Verify certificate
openssl x509 -in /etc/nginx/ssl/iac.crt -text -noout
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

### Docker Container Access

```bash
# Verify containers are running
docker ps | grep iac

# Check container networks
docker network inspect iac-v3-network

# Test from within network
docker run --rm --network iac-v3-network alpine ping -c 1 iac-api-gateway-v3
```

## Environment Variables

Update frontend configuration to use domains:

**`/home/rrd/iac/frontend-e2e/.env`**:
```env
VITE_API_URL=https://api.iac.local:4000
VITE_GRAPHQL_URL=https://api.iac.local:4000/graphql
VITE_WS_URL=wss://api.iac.local:4000/ws
```

After updating, rebuild:
```bash
cd /home/rrd/iac/frontend-e2e
docker build -t iac-frontend-e2e:latest .
docker stop iac-frontend-e2e && docker rm iac-frontend-e2e
docker run -d --name iac-frontend-e2e --network iac-v3-network \
    -p 3100:80 -p 3543:443 iac-frontend-e2e:latest
```

## Production Considerations

For production deployments:

1. **Real SSL Certificates**: Use Let's Encrypt or commercial CA
2. **DNS Server**: Set up proper DNS instead of hosts file
3. **Load Balancer**: Use HAProxy or cloud load balancer
4. **Firewall Rules**: Configure UFW/iptables appropriately
5. **Domain Registration**: Register actual domain name

## Summary

After setup, you'll have:

✅ Friendly domain names (iac.local, api.iac.local, etc.)  
✅ SSL certificates for HTTPS  
✅ Nginx reverse proxy (optional)  
✅ Network-wide access capability  
✅ Centralized monitoring dashboards  

Access the platform at: **https://iac.local:3543**

---

**Last Updated**: December 7, 2025  
**Version**: 3.0
