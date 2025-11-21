#!/bin/bash
# Smoke tests for IAC Dharma platform
# Usage: ./smoke-test.sh <base_url>

set -e

BASE_URL="${1:-http://localhost:3000}"
FAILED=0

echo "🔍 Running smoke tests against $BASE_URL"

# Test 1: Health check
echo "Testing health endpoint..."
if curl -f -s "$BASE_URL/health/live" > /dev/null; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  FAILED=$((FAILED + 1))
fi

# Test 2: Readiness check
echo "Testing readiness endpoint..."
READY_RESPONSE=$(curl -s "$BASE_URL/health/ready")
if echo "$READY_RESPONSE" | grep -q "ready"; then
  echo "✅ Readiness check passed"
else
  echo "❌ Readiness check failed"
  FAILED=$((FAILED + 1))
fi

# Test 3: API Gateway response
echo "Testing API Gateway..."
API_RESPONSE=$(curl -s "$BASE_URL/api")
if echo "$API_RESPONSE" | grep -q "Dharma API Gateway"; then
  echo "✅ API Gateway responding"
else
  echo "❌ API Gateway not responding correctly"
  FAILED=$((FAILED + 1))
fi

# Test 4: Circuit breakers endpoint
echo "Testing circuit breakers endpoint..."
if curl -f -s "$BASE_URL/api/circuit-breakers" > /dev/null; then
  echo "✅ Circuit breakers endpoint accessible"
else
  echo "❌ Circuit breakers endpoint failed"
  FAILED=$((FAILED + 1))
fi

# Test 5: Cache stats endpoint
echo "Testing cache endpoint..."
if curl -f -s "$BASE_URL/api/cache/stats" > /dev/null; then
  echo "✅ Cache endpoint accessible"
else
  echo "❌ Cache endpoint failed"
  FAILED=$((FAILED + 1))
fi

# Test 6: Rate limit config endpoint
echo "Testing rate limit config..."
if curl -f -s "$BASE_URL/api/rate-limits/config" > /dev/null; then
  echo "✅ Rate limit config accessible"
else
  echo "❌ Rate limit config failed"
  FAILED=$((FAILED + 1))
fi

# Test 7: Database connectivity (via health check)
echo "Testing database connectivity..."
DB_STATUS=$(curl -s "$BASE_URL/health/ready" | grep -o '"status":"[^"]*"' | head -1)
if echo "$DB_STATUS" | grep -q "ready\|healthy"; then
  echo "✅ Database connected"
else
  echo "❌ Database connection failed"
  FAILED=$((FAILED + 1))
fi

# Test 8: Redis connectivity (via cache stats)
echo "Testing Redis connectivity..."
CACHE_RESPONSE=$(curl -s "$BASE_URL/api/cache/stats")
if echo "$CACHE_RESPONSE" | grep -q "success"; then
  echo "✅ Redis connected"
else
  echo "⚠️  Redis connection warning (may not be critical)"
fi

# Summary
echo ""
echo "================================"
if [ $FAILED -eq 0 ]; then
  echo "✅ All smoke tests passed!"
  exit 0
else
  echo "❌ $FAILED test(s) failed"
  exit 1
fi
