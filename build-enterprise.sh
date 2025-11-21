#!/bin/bash

# Enterprise Services Build Script
# Builds all 3 services in sequence

set -e

echo "🚀 Starting Enterprise Services Build..."
echo "This will take approximately 5-10 minutes"
echo ""

# Build Cloud Provider Service
echo "📦 Building cloud-provider-service..."
cd /home/rrd/iac/backend/cloud-provider-service
docker build -t iac-cloud-provider-service:latest . > /tmp/cloud-build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ cloud-provider-service built successfully"
else
    echo "❌ cloud-provider-service build failed - check /tmp/cloud-build.log"
    exit 1
fi

# Build AI Recommendations Service
echo "📦 Building ai-recommendations-service..."
cd /home/rrd/iac/backend/ai-recommendations-service
docker build -t iac-ai-recommendations-service:latest . > /tmp/ai-build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ ai-recommendations-service built successfully"
else
    echo "❌ ai-recommendations-service build failed - check /tmp/ai-build.log"
    exit 1
fi

# Build SSO Service
echo "📦 Building sso-service..."
cd /home/rrd/iac/backend/sso-service
docker build -t iac-sso-service:latest . > /tmp/sso-build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ sso-service built successfully"
else
    echo "❌ sso-service build failed - check /tmp/sso-build.log"
    exit 1
fi

echo ""
echo "🎉 All enterprise services built successfully!"
echo ""
echo "Built images:"
docker images | grep -E "(cloud-provider|ai-recommendations|sso-service)"
echo ""
echo "To start services:"
echo "  docker-compose up -d cloud-provider-service ai-recommendations-service sso-service"
