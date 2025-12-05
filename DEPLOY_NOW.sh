#!/bin/bash
# IAC Dharma v2.0.0 - Quick Deploy Script
# Choose your deployment method

echo "╔════════════════════════════════════════════════════════╗"
echo "║   IAC Dharma v2.0.0 - Quick Production Deploy         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Choose deployment option:"
echo ""
echo "  1) Kubernetes (Recommended)"
echo "  2) Docker Compose (Single Server)"
echo "  3) Show Full Guide"
echo "  4) Exit"
echo ""
read -p "Enter option (1-4): " choice

case $choice in
  1)
    echo ""
    echo "=== Kubernetes Deployment ==="
    echo ""
    echo "Step 1: Install kubectl (if needed)"
    echo "  curl -LO https://dl.k8s.io/release/v1.28.0/bin/linux/amd64/kubectl"
    echo "  chmod +x kubectl && sudo mv kubectl /usr/local/bin/"
    echo ""
    echo "Step 2: Create secrets"
    echo "  DB_PASSWORD=\$(openssl rand -base64 32)"
    echo "  JWT_SECRET=\$(openssl rand -base64 48)"
    echo "  kubectl create namespace iac-dharma-prod"
    echo "  kubectl create secret generic dharma-secrets \\"
    echo "    --from-literal=DB_PASSWORD=\"\$DB_PASSWORD\" \\"
    echo "    --from-literal=JWT_SECRET=\"\$JWT_SECRET\" \\"
    echo "    --namespace=iac-dharma-prod"
    echo ""
    echo "Step 3: Deploy"
    echo "  kubectl apply -f k8s/production/complete-deployment.yaml"
    echo "  kubectl apply -f k8s/production/rbac-security.yaml"
    echo ""
    echo "Step 4: Verify"
    echo "  kubectl get pods -n iac-dharma-prod --watch"
    echo ""
    ;;
  2)
    echo ""
    echo "=== Docker Compose Deployment ==="
    echo ""
    echo "Step 1: Configure environment"
    echo "  cp .env.production.template .env.production"
    echo "  nano .env.production"
    echo "  # Update: DB_PASSWORD, JWT_SECRET, ALLOWED_ORIGINS"
    echo ""
    echo "Step 2: Deploy"
    echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
    echo ""
    echo "Step 3: Verify"
    echo "  docker compose ps"
    echo "  curl http://localhost:3000/health"
    echo ""
    ;;
  3)
    echo ""
    echo "Opening full deployment guide..."
    cat PRODUCTION_DEPLOY_QUICKSTART.md | less
    ;;
  4)
    echo "Exiting..."
    exit 0
    ;;
  *)
    echo "Invalid option"
    exit 1
    ;;
esac
