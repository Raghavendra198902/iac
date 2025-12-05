#!/bin/bash

# Blue-Green Deployment Script for IAC Dharma
# Implements zero-downtime deployment strategy

set -e

NAMESPACE="iac-dharma-prod"
APP="api-gateway"
NEW_VERSION="${1:-latest}"

echo "🚀 Starting Blue-Green Deployment"
echo "=================================="
echo "App: $APP"
echo "Version: $NEW_VERSION"
echo ""

# Get current active color
CURRENT=$(kubectl get svc $APP -n $NAMESPACE -o jsonpath='{.spec.selector.color}' 2>/dev/null || echo "blue")

if [ "$CURRENT" = "blue" ]; then
    NEW="green"
else
    NEW="blue"
fi

echo "📍 Current environment: $CURRENT"
echo "📍 New environment: $NEW"
echo ""

# Deploy new version
echo "📦 Deploying $NEW environment..."
kubectl set image deployment/$APP-$NEW $APP=$DOCKER_REGISTRY/$APP:$NEW_VERSION -n $NAMESPACE

# Wait for rollout
echo "⏳ Waiting for rollout to complete..."
kubectl rollout status deployment/$APP-$NEW -n $NAMESPACE --timeout=5m

# Health check
echo "🏥 Running health checks..."
for i in {1..10}; do
    HEALTH=$(kubectl exec -n $NAMESPACE deployment/$APP-$NEW -- wget -q -O- http://localhost:3000/health/live 2>/dev/null || echo "failed")
    if [ "$HEALTH" != "failed" ]; then
        echo "✅ Health check passed"
        break
    fi
    echo "⏳ Attempt $i/10 failed, retrying..."
    sleep 5
done

if [ "$HEALTH" = "failed" ]; then
    echo "❌ Health checks failed. Aborting deployment."
    exit 1
fi

# Switch traffic
echo "🔄 Switching traffic to $NEW environment..."
kubectl patch svc $APP -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"color\":\"$NEW\"}}}"

echo "✅ Traffic switched to $NEW"
echo ""

# Monitor for 30 seconds
echo "📊 Monitoring new environment..."
sleep 30

# Scale down old environment
echo "📉 Scaling down $CURRENT environment..."
kubectl scale deployment/$APP-$CURRENT --replicas=0 -n $NAMESPACE

echo ""
echo "🎉 Blue-Green Deployment Complete!"
echo "=================================="
echo "Active: $NEW"
echo "Version: $NEW_VERSION"
echo ""
echo "To rollback: kubectl patch svc $APP -n $NAMESPACE -p '{\"spec\":{\"selector\":{\"color\":\"$CURRENT\"}}}'"
