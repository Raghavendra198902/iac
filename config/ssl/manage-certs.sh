#!/bin/bash
# SSL/TLS Certificate Management Script
# Manages SSL certificates for different environments

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENVIRONMENT=""
DOMAIN=""
EMAIL=""
ACTION=""

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment (development|staging|production)"
    echo "  -d, --domain DOMAIN      Domain name (e.g., app.dharma.example.com)"
    echo "  -m, --email EMAIL        Email for certificate notifications"
    echo "  -a, --action ACTION      Action (generate-self-signed|request-letsencrypt|import|renew)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  # Generate self-signed certificate for development"
    echo "  $0 -e development -d localhost -a generate-self-signed"
    echo ""
    echo "  # Request Let's Encrypt certificate for staging"
    echo "  $0 -e staging -d staging.dharma.example.com -m admin@example.com -a request-letsencrypt"
    echo ""
    echo "  # Renew certificate"
    echo "  $0 -e production -a renew"
    exit 1
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment) ENVIRONMENT="$2"; shift 2 ;;
        -d|--domain) DOMAIN="$2"; shift 2 ;;
        -m|--email) EMAIL="$2"; shift 2 ;;
        -a|--action) ACTION="$2"; shift 2 ;;
        -h|--help) usage ;;
        *) echo -e "${RED}Unknown option: $1${NC}"; usage ;;
    esac
done

if [[ -z "$ENVIRONMENT" ]] || [[ -z "$ACTION" ]]; then
    echo -e "${RED}Error: Environment and action are required${NC}"
    usage
fi

CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/${ENVIRONMENT}"
mkdir -p "$CERT_DIR"

# Generate self-signed certificate
generate_self_signed() {
    local domain=${1:-localhost}
    
    echo -e "${YELLOW}Generating self-signed certificate for ${domain}${NC}"
    
    # Generate private key
    openssl genrsa -out "${CERT_DIR}/tls.key" 2048
    
    # Generate certificate signing request
    openssl req -new -key "${CERT_DIR}/tls.key" \
        -out "${CERT_DIR}/tls.csr" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=${domain}"
    
    # Generate self-signed certificate (valid for 365 days)
    openssl x509 -req -days 365 \
        -in "${CERT_DIR}/tls.csr" \
        -signkey "${CERT_DIR}/tls.key" \
        -out "${CERT_DIR}/tls.crt"
    
    # Set proper permissions
    chmod 600 "${CERT_DIR}/tls.key"
    chmod 644 "${CERT_DIR}/tls.crt"
    
    echo -e "${GREEN}✓ Self-signed certificate generated${NC}"
    echo "Certificate: ${CERT_DIR}/tls.crt"
    echo "Private Key: ${CERT_DIR}/tls.key"
}

# Request Let's Encrypt certificate
request_letsencrypt() {
    local domain=$1
    local email=$2
    
    if [[ -z "$domain" ]] || [[ -z "$email" ]]; then
        echo -e "${RED}Error: Domain and email are required for Let's Encrypt${NC}"
        exit 1
    fi
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo -e "${RED}Error: certbot is not installed${NC}"
        echo "Install: sudo apt-get install certbot  # or  brew install certbot"
        exit 1
    fi
    
    echo -e "${YELLOW}Requesting Let's Encrypt certificate for ${domain}${NC}"
    echo "Note: Ensure DNS is configured and port 80/443 are accessible"
    
    sudo certbot certonly --standalone \
        -d "$domain" \
        --email "$email" \
        --agree-tos \
        --non-interactive
    
    # Copy certificates to our directory
    sudo cp "/etc/letsencrypt/live/${domain}/fullchain.pem" "${CERT_DIR}/tls.crt"
    sudo cp "/etc/letsencrypt/live/${domain}/privkey.pem" "${CERT_DIR}/tls.key"
    sudo chown $USER:$USER "${CERT_DIR}/tls."*
    chmod 600 "${CERT_DIR}/tls.key"
    chmod 644 "${CERT_DIR}/tls.crt"
    
    echo -e "${GREEN}✓ Let's Encrypt certificate obtained${NC}"
}

# Renew certificate
renew_certificate() {
    if ! command -v certbot &> /dev/null; then
        echo -e "${RED}Error: certbot is not installed${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Renewing certificates${NC}"
    sudo certbot renew
    echo -e "${GREEN}✓ Certificates renewed${NC}"
}

# Import existing certificate
import_certificate() {
    echo -e "${YELLOW}Import certificate for ${ENVIRONMENT}${NC}"
    echo "Place your certificate files in: ${CERT_DIR}/"
    echo "  - Certificate: tls.crt"
    echo "  - Private Key: tls.key"
    echo "  - CA Bundle (optional): ca.crt"
}

# Create Kubernetes secret
create_k8s_secret() {
    local namespace=${1:-dharma}
    
    if [[ ! -f "${CERT_DIR}/tls.crt" ]] || [[ ! -f "${CERT_DIR}/tls.key" ]]; then
        echo -e "${RED}Error: Certificate files not found${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Creating Kubernetes TLS secret${NC}"
    
    kubectl create secret tls dharma-tls \
        --cert="${CERT_DIR}/tls.crt" \
        --key="${CERT_DIR}/tls.key" \
        --namespace="$namespace" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    echo -e "${GREEN}✓ Kubernetes secret created/updated${NC}"
}

# Main execution
main() {
    case $ACTION in
        generate-self-signed)
            generate_self_signed "${DOMAIN:-localhost}"
            ;;
        request-letsencrypt)
            request_letsencrypt "$DOMAIN" "$EMAIL"
            ;;
        renew)
            renew_certificate
            ;;
        import)
            import_certificate
            ;;
        create-k8s-secret)
            create_k8s_secret
            ;;
        *)
            echo -e "${RED}Error: Invalid action: $ACTION${NC}"
            usage
            ;;
    esac
}

main
