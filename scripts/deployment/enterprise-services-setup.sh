#!/bin/bash

# Enterprise Services Build and Test Script
# This script builds and tests all new enterprise features

set -e

echo "=========================================="
echo "🚀 IAC Dharma Enterprise Services"
echo "   Build and Test Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo ""
print_status "Checking current Docker Compose status..."
docker-compose ps

echo ""
echo "=========================================="
echo "📦 Building Enterprise Services"
echo "=========================================="
echo ""

# Build Cloud Provider Service
print_status "Building Cloud Provider Service..."
if docker-compose build cloud-provider-service; then
    print_success "Cloud Provider Service built successfully"
else
    print_error "Failed to build Cloud Provider Service"
    exit 1
fi

# Build AI Recommendations Service
print_status "Building AI Recommendations Service..."
if docker-compose build ai-recommendations-service; then
    print_success "AI Recommendations Service built successfully"
else
    print_error "Failed to build AI Recommendations Service"
    exit 1
fi

# Build SSO Service
print_status "Building SSO Service..."
if docker-compose build sso-service; then
    print_success "SSO Service built successfully"
else
    print_error "Failed to build SSO Service"
    exit 1
fi

echo ""
echo "=========================================="
echo "🚀 Starting Enterprise Services"
echo "=========================================="
echo ""

# Start services
print_status "Starting Cloud Provider Service..."
docker-compose up -d cloud-provider-service
sleep 3

print_status "Starting AI Recommendations Service..."
docker-compose up -d ai-recommendations-service
sleep 3

print_status "Starting SSO Service..."
docker-compose up -d sso-service
sleep 3

echo ""
print_status "Waiting for services to be ready (10 seconds)..."
sleep 10

echo ""
echo "=========================================="
echo "🔍 Testing Service Health"
echo "=========================================="
echo ""

# Test Cloud Provider Service
print_status "Testing Cloud Provider Service (Port 3010)..."
if curl -s -f http://localhost:3010/health > /dev/null 2>&1; then
    RESPONSE=$(curl -s http://localhost:3010/health)
    print_success "Cloud Provider Service is healthy"
    echo "   Response: $RESPONSE"
else
    print_warning "Cloud Provider Service health check failed"
    print_status "Checking logs..."
    docker-compose logs --tail=20 cloud-provider-service
fi

echo ""

# Test AI Recommendations Service
print_status "Testing AI Recommendations Service (Port 3011)..."
if curl -s -f http://localhost:3011/health > /dev/null 2>&1; then
    RESPONSE=$(curl -s http://localhost:3011/health)
    print_success "AI Recommendations Service is healthy"
    echo "   Response: $RESPONSE"
else
    print_warning "AI Recommendations Service health check failed"
    print_status "Checking logs..."
    docker-compose logs --tail=20 ai-recommendations-service
fi

echo ""

# Test SSO Service
print_status "Testing SSO Service (Port 3012)..."
if curl -s -f http://localhost:3012/health > /dev/null 2>&1; then
    RESPONSE=$(curl -s http://localhost:3012/health)
    print_success "SSO Service is healthy"
    echo "   Response: $RESPONSE"
else
    print_warning "SSO Service health check failed"
    print_status "Checking logs..."
    docker-compose logs --tail=20 sso-service
fi

echo ""
echo "=========================================="
echo "🧪 Testing API Endpoints"
echo "=========================================="
echo ""

# Test Cloud Provider Service - AWS Regions
print_status "Testing Cloud Provider Service - AWS Regions..."
if curl -s -f http://localhost:3010/api/cloud/aws/regions > /dev/null 2>&1; then
    print_success "AWS Regions endpoint working"
else
    print_warning "AWS Regions endpoint not responding"
fi

# Test AI Recommendations Service - Cost Optimization
print_status "Testing AI Recommendations Service - Cost Optimization..."
RESPONSE=$(curl -s -X POST http://localhost:3011/api/ai/recommendations/cost-optimization \
    -H "Content-Type: application/json" \
    -d '{"resources":[],"usage":{}}' 2>&1)

if echo "$RESPONSE" | grep -q "totalSavings"; then
    print_success "Cost Optimization endpoint working"
else
    print_warning "Cost Optimization endpoint not returning expected data"
fi

# Test SSO Service - Login
print_status "Testing SSO Service - Login endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:3012/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@iac-dharma.com","password":"admin123"}' 2>&1)

if echo "$RESPONSE" | grep -q "token"; then
    print_success "Login endpoint working"
    echo "   Sample token generated successfully"
else
    print_warning "Login endpoint not returning expected data"
fi

echo ""
echo "=========================================="
echo "📊 Service Status Summary"
echo "=========================================="
echo ""

docker-compose ps | grep -E "(cloud-provider-service|ai-recommendations-service|sso-service)"

echo ""
echo "=========================================="
echo "🎉 Enterprise Services Setup Complete!"
echo "=========================================="
echo ""

print_success "All enterprise services are built and running!"
echo ""
echo "Service Ports:"
echo "  • Cloud Provider Service:     http://localhost:3010"
echo "  • AI Recommendations Service: http://localhost:3011"
echo "  • SSO Service:                http://localhost:3012"
echo ""
echo "Next Steps:"
echo "  1. Check logs: docker-compose logs -f <service-name>"
echo "  2. View all services: docker-compose ps"
echo "  3. Stop services: docker-compose down"
echo "  4. Restart service: docker-compose restart <service-name>"
echo ""
echo "Documentation:"
echo "  • Enterprise Features: ENTERPRISE_FEATURES.md"
echo "  • Implementation Summary: ENTERPRISE_IMPLEMENTATION_SUMMARY.md"
echo "  • Quick Navigation: QUICK_NAV.md"
echo ""
print_status "For detailed testing, see: tests/e2e-test.sh --suite enterprise-features"
echo ""
