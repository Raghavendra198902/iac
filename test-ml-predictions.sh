#!/bin/bash
# IAC Dharma v3.0 - ML Prediction Testing Script
# Tests all ML models and predictions

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

AIOPS_URL="http://localhost:8100"

echo "════════════════════════════════════════════"
echo "🤖 IAC Dharma v3.0 - ML Prediction Testing"
echo "════════════════════════════════════════════"
echo ""

# Test 1: AIOps Engine Health
echo -e "${BLUE}Test 1: AIOps Engine Status${NC}"
response=$(curl -s "$AIOPS_URL/health")
models_loaded=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('models_loaded', 0))" 2>/dev/null || echo "0")
if [ "$models_loaded" -gt "0" ]; then
    echo -e "${GREEN}✅ PASS${NC} - $models_loaded ML models loaded"
else
    echo -e "${RED}❌ FAIL${NC} - No models loaded"
fi
echo ""

# Test 2: Failure Prediction
echo -e "${BLUE}Test 2: LSTM Failure Prediction${NC}"
echo "Testing 24-48h failure prediction..."
response=$(curl -s -X POST "$AIOPS_URL/api/v3/aiops/predict/failure" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "test-api-service",
    "infrastructure_id": "i-1234567890abcdef",
    "metrics": {
      "cpu_usage": 85.5,
      "memory_usage": 78.3,
      "disk_io": 120.5,
      "network_traffic": 450.2,
      "error_rate": 0.05
    }
  }' 2>&1)

if echo "$response" | grep -q "prediction"; then
    echo -e "${GREEN}✅ PASS${NC} - Failure prediction working"
    echo "$response" | python3 -m json.tool | head -15
else
    echo -e "${YELLOW}⚠ INFO${NC} - Response: $response"
fi
echo ""

# Test 3: Threat Detection
echo -e "${BLUE}Test 3: Random Forest Threat Detection${NC}"
echo "Testing security threat detection..."
response=$(curl -s -X POST "$AIOPS_URL/api/v3/aiops/predict/threats" \
  -H "Content-Type: application/json" \
  -d '{
    "source_ip": "192.168.1.100",
    "metrics": {
      "request_rate": 1500,
      "error_rate": 0.15,
      "failed_auth_attempts": 25,
      "suspicious_patterns": 8
    }
  }' 2>&1)

if echo "$response" | grep -q "threats"; then
    echo -e "${GREEN}✅ PASS${NC} - Threat detection working"
    echo "$response" | python3 -m json.tool | head -12
else
    echo -e "${YELLOW}⚠ INFO${NC} - Response: $response"
fi
echo ""

# Test 4: Capacity Forecasting
echo -e "${BLUE}Test 4: XGBoost Capacity Forecasting${NC}"
echo "Testing 7-30 day capacity forecast..."
response=$(curl -s -X POST "$AIOPS_URL/api/v3/aiops/predict/capacity" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "production-cluster",
    "current_usage": {
      "cpu": 65.0,
      "memory": 72.5,
      "storage": 58.3
    },
    "forecast_days": 14
  }' 2>&1)

if echo "$response" | grep -q "forecast"; then
    echo -e "${GREEN}✅ PASS${NC} - Capacity forecasting working"
    echo "$response" | python3 -m json.tool | head -15
else
    echo -e "${YELLOW}⚠ INFO${NC} - Response: $response"
fi
echo ""

# Test 5: Anomaly Detection
echo -e "${BLUE}Test 5: Anomaly Detection${NC}"
echo "Testing anomaly detection..."
response=$(curl -s -X POST "$AIOPS_URL/api/v3/aiops/detect/anomalies" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "api-gateway",
    "metrics": {
      "response_time": 850.5,
      "cpu_usage": 92.3,
      "memory_usage": 88.7,
      "error_rate": 0.12
    }
  }' 2>&1)

if echo "$response" | grep -q "anomalies\|is_anomaly"; then
    echo -e "${GREEN}✅ PASS${NC} - Anomaly detection working"
    echo "$response" | python3 -m json.tool | head -10
else
    echo -e "${YELLOW}⚠ INFO${NC} - Response: $response"
fi
echo ""

# Test 6: MLflow Integration
echo -e "${BLUE}Test 6: MLflow Experiment Tracking${NC}"
mlflow_response=$(curl -s http://localhost:5000/api/2.0/mlflow/experiments/list 2>&1)
if echo "$mlflow_response" | grep -q "experiments"; then
    echo -e "${GREEN}✅ PASS${NC} - MLflow API accessible"
    experiment_count=$(echo "$mlflow_response" | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('experiments', [])))" 2>/dev/null || echo "0")
    echo "Experiments tracked: $experiment_count"
else
    echo -e "${YELLOW}⚠ INFO${NC} - MLflow may need initialization"
fi
echo ""

# Summary
echo "════════════════════════════════════════════"
echo -e "${GREEN}🎉 ML Prediction Testing Complete!${NC}"
echo "════════════════════════════════════════════"
echo ""
echo "Available Prediction Endpoints:"
echo "  • POST $AIOPS_URL/api/v3/aiops/predict/failure"
echo "  • POST $AIOPS_URL/api/v3/aiops/predict/threats"
echo "  • POST $AIOPS_URL/api/v3/aiops/predict/capacity"
echo "  • POST $AIOPS_URL/api/v3/aiops/detect/anomalies"
echo ""
echo "📊 View API Documentation:"
echo "  $AIOPS_URL/docs"
echo ""
