#!/bin/bash

# IAC Platform - Local Domain Setup Script
# This script configures local domains for the IAC platform

set -e

echo "=========================================="
echo "IAC Platform - Local Domain Configuration"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root for hosts file modification
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Note: Some operations require sudo privileges${NC}"
    USE_SUDO="sudo"
else
    USE_SUDO=""
fi

# Get system IP
SYSTEM_IP=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}Detected system IP: ${SYSTEM_IP}${NC}"
echo ""

# Step 1: Create SSL certificates directory
echo "Step 1: Creating SSL certificates..."
$USE_SUDO mkdir -p /etc/nginx/ssl
cd /etc/nginx/ssl

# Generate self-signed SSL certificate
$USE_SUDO openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout iac.key \
    -out iac.crt \
    -subj "/C=US/ST=State/L=City/O=IAC-Platform/CN=iac.local" \
    -addext "subjectAltName=DNS:iac.local,DNS:*.iac.local,DNS:www.iac.local,DNS:api.iac.local,DNS:grafana.iac.local,DNS:prometheus.iac.local,DNS:neo4j.iac.local,DNS:mlflow.iac.local" \
    2>/dev/null

echo -e "${GREEN}✓ SSL certificates created${NC}"
echo ""

# Step 2: Update hosts file
echo "Step 2: Updating /etc/hosts file..."

# Backup hosts file
$USE_SUDO cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d_%H%M%S)

# Remove old IAC entries
$USE_SUDO sed -i '/# IAC Platform Local Domains/,/mlflow\.iac\.local/d' /etc/hosts

# Add new entries
$USE_SUDO tee -a /etc/hosts > /dev/null << EOF

# IAC Platform Local Domains
127.0.0.1       iac.local www.iac.local
127.0.0.1       api.iac.local
127.0.0.1       grafana.iac.local
127.0.0.1       prometheus.iac.local
127.0.0.1       neo4j.iac.local
127.0.0.1       mlflow.iac.local
${SYSTEM_IP}    iac.local www.iac.local
${SYSTEM_IP}    api.iac.local
${SYSTEM_IP}    grafana.iac.local
${SYSTEM_IP}    prometheus.iac.local
${SYSTEM_IP}    neo4j.iac.local
${SYSTEM_IP}    mlflow.iac.local
EOF

echo -e "${GREEN}✓ Hosts file updated${NC}"
echo ""

# Step 3: Check if Nginx is installed
echo "Step 3: Checking Nginx installation..."
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✓ Nginx is installed${NC}"
    
    # Copy Nginx config
    $USE_SUDO cp $(dirname $0)/nginx-domains.conf /etc/nginx/sites-available/iac-domains.conf 2>/dev/null || echo "Nginx config will be created"
    
    # Create symbolic link
    if [ -d "/etc/nginx/sites-enabled" ]; then
        $USE_SUDO ln -sf /etc/nginx/sites-available/iac-domains.conf /etc/nginx/sites-enabled/
        echo -e "${GREEN}✓ Nginx configuration linked${NC}"
        
        # Test Nginx configuration
        if $USE_SUDO nginx -t 2>/dev/null; then
            echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
            $USE_SUDO systemctl reload nginx 2>/dev/null || echo "Please reload Nginx manually: sudo systemctl reload nginx"
        else
            echo -e "${YELLOW}⚠ Nginx configuration test failed. Please check manually.${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ Nginx not installed. Using Docker containers directly.${NC}"
fi
echo ""

# Step 4: Verify DNS resolution
echo "Step 4: Verifying DNS resolution..."
for domain in iac.local api.iac.local grafana.iac.local prometheus.iac.local neo4j.iac.local mlflow.iac.local; do
    if ping -c 1 -W 1 $domain &> /dev/null; then
        echo -e "${GREEN}✓ $domain${NC}"
    else
        echo -e "${RED}✗ $domain${NC}"
    fi
done
echo ""

# Step 5: Display access URLs
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "You can now access the IAC Platform using these URLs:"
echo ""
echo -e "${GREEN}Main Application:${NC}"
echo "  https://iac.local:3543"
echo "  https://www.iac.local:3543"
echo ""
echo -e "${GREEN}API Gateway:${NC}"
echo "  http://api.iac.local:4000"
echo "  http://api.iac.local:4000/graphql"
echo ""
echo -e "${GREEN}Monitoring & Tools:${NC}"
echo "  http://grafana.iac.local:3020 (admin/admin123)"
echo "  http://prometheus.iac.local:9091"
echo "  http://neo4j.iac.local:7474 (neo4j/neo4jpassword)"
echo "  http://mlflow.iac.local:5000"
echo ""
echo -e "${YELLOW}Note: Accept the self-signed certificate in your browser${NC}"
echo ""

# Step 6: Update frontend environment to use domains
echo "Step 6: Updating frontend configuration..."
if [ -f "/home/rrd/iac/frontend-e2e/.env" ]; then
    cat > /home/rrd/iac/frontend-e2e/.env << 'EOF'
VITE_API_URL=https://api.iac.local:4000
VITE_GRAPHQL_URL=https://api.iac.local:4000/graphql
VITE_WS_URL=wss://api.iac.local:4000/ws
EOF
    echo -e "${GREEN}✓ Frontend environment configured${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env file not found${NC}"
fi
echo ""

echo "=========================================="
echo "For network access from other machines:"
echo "Add these entries to their hosts file:"
echo ""
echo "${SYSTEM_IP}    iac.local www.iac.local"
echo "${SYSTEM_IP}    api.iac.local grafana.iac.local"
echo "${SYSTEM_IP}    prometheus.iac.local neo4j.iac.local"
echo "${SYSTEM_IP}    mlflow.iac.local"
echo "=========================================="
