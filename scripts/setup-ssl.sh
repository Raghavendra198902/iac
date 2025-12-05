#!/bin/bash
# SSL/TLS Certificate Setup for IAC Dharma v2.0
# Supports Let's Encrypt, self-signed, and custom certificates

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN="${DOMAIN:-iacdharma.example.com}"
EMAIL="${EMAIL:-admin@example.com}"
NAMESPACE="${NAMESPACE:-iac-dharma}"
CERT_METHOD="${CERT_METHOD:-letsencrypt}"  # letsencrypt, selfsigned, custom

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔒 IAC Dharma v2.0 - SSL/TLS Setup"
echo "===================================="
echo "Domain: $DOMAIN"
echo "Method: $CERT_METHOD"
echo ""

setup_cert_manager() {
    log_info "Installing cert-manager..."
    
    # Add Jetstack Helm repo
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    
    # Install cert-manager
    helm upgrade --install cert-manager jetstack/cert-manager \
        --namespace cert-manager \
        --create-namespace \
        --set installCRDs=true \
        --wait
    
    log_info "✅ cert-manager installed"
}

setup_letsencrypt() {
    log_info "Setting up Let's Encrypt certificates..."
    
    # Create ClusterIssuer for Let's Encrypt
    cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: $EMAIL
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

    # Create Certificate
    cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: iac-dharma-tls
  namespace: $NAMESPACE
spec:
  secretName: iac-dharma-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - $DOMAIN
  - www.$DOMAIN
EOF

    log_info "✅ Let's Encrypt configured"
    log_info "Waiting for certificate to be issued (this may take a few minutes)..."
    
    kubectl wait --for=condition=ready certificate/iac-dharma-tls \
        -n $NAMESPACE \
        --timeout=300s || log_warn "Certificate issuance taking longer than expected"
}

setup_selfsigned() {
    log_info "Generating self-signed certificates..."
    
    mkdir -p /tmp/certs
    cd /tmp/certs
    
    # Generate private key
    openssl genrsa -out tls.key 2048
    
    # Generate certificate signing request
    openssl req -new -key tls.key -out tls.csr -subj "/CN=$DOMAIN/O=IAC Dharma/C=US"
    
    # Generate self-signed certificate
    openssl x509 -req -days 365 -in tls.csr -signkey tls.key -out tls.crt
    
    # Create Kubernetes secret
    kubectl create secret tls iac-dharma-tls \
        --cert=tls.crt \
        --key=tls.key \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log_info "✅ Self-signed certificate created"
    log_warn "Note: Self-signed certificates will show browser warnings"
}

setup_custom() {
    log_info "Setting up custom certificates..."
    
    if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
        log_error "Certificate files not found. Set CERT_FILE and KEY_FILE environment variables."
        exit 1
    fi
    
    # Create Kubernetes secret from provided files
    kubectl create secret tls iac-dharma-tls \
        --cert="$CERT_FILE" \
        --key="$KEY_FILE" \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log_info "✅ Custom certificate configured"
}

update_ingress() {
    log_info "Updating Ingress configuration..."
    
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: iac-dharma-ingress
  namespace: $NAMESPACE
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - $DOMAIN
    secretName: iac-dharma-tls
  rules:
  - host: $DOMAIN
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 3000
EOF

    log_info "✅ Ingress updated with TLS"
}

verify_ssl() {
    log_info "Verifying SSL certificate..."
    
    sleep 10
    
    # Get certificate info
    kubectl get certificate -n $NAMESPACE
    
    # Check if certificate is ready
    READY=$(kubectl get certificate iac-dharma-tls -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}')
    
    if [ "$READY" = "True" ]; then
        log_info "✅ Certificate is ready"
    else
        log_warn "⚠️  Certificate not ready yet. Check status with:"
        log_warn "kubectl describe certificate iac-dharma-tls -n $NAMESPACE"
    fi
    
    # Test HTTPS connection
    if command -v curl &> /dev/null; then
        log_info "Testing HTTPS connection..."
        if curl -k -s "https://$DOMAIN/health/live" > /dev/null 2>&1; then
            log_info "✅ HTTPS connection successful"
        else
            log_warn "⚠️  HTTPS connection test failed (may need DNS propagation)"
        fi
    fi
}

print_summary() {
    echo ""
    echo "===================================="
    echo "🎉 SSL/TLS Setup Complete!"
    echo "===================================="
    echo ""
    echo "Domain: https://$DOMAIN"
    echo "Certificate Method: $CERT_METHOD"
    echo "Secret Name: iac-dharma-tls"
    echo "Namespace: $NAMESPACE"
    echo ""
    
    if [ "$CERT_METHOD" = "letsencrypt" ]; then
        echo "📝 Note: Let's Encrypt certificates auto-renew every 60 days"
    elif [ "$CERT_METHOD" = "selfsigned" ]; then
        echo "⚠️  Warning: Self-signed certificates expire in 365 days"
        echo "Browsers will show security warnings"
    fi
    
    echo ""
    echo "Verify certificate:"
    echo "  kubectl get certificate -n $NAMESPACE"
    echo "  openssl s_client -connect $DOMAIN:443 -servername $DOMAIN"
    echo ""
}

# Main execution
main() {
    case $CERT_METHOD in
        letsencrypt)
            setup_cert_manager
            setup_letsencrypt
            ;;
        selfsigned)
            setup_selfsigned
            ;;
        custom)
            setup_custom
            ;;
        *)
            log_error "Invalid CERT_METHOD: $CERT_METHOD"
            log_error "Valid options: letsencrypt, selfsigned, custom"
            exit 1
            ;;
    esac
    
    update_ingress
    verify_ssl
    print_summary
}

main "$@"
