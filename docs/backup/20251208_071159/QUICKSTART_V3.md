# 🚀 IAC Dharma v3.0 - Quick Start Guide

## Overview

IAC Dharma v3.0 "Autonomous Infrastructure" is the next evolution featuring:
- **AIOps Engine** - 12 ML models for predictive analytics & auto-remediation
- **GraphQL API** - Unified API with real-time subscriptions
- **Kafka Integration** - Event-driven architecture
- **TimescaleDB** - High-performance time-series storage
- **Multi-Cloud** - Expanded support for 10+ cloud providers

---

## 🎯 Current Status

**Version**: v3.0.0-alpha  
**Branch**: v3.0-development  
**Phase**: Phase 1 - Foundation (20% complete)  
**Target Release**: Q3 2026

### What's Working

✅ **AIOps Engine**
- Failure prediction API
- Threat detection API
- Capacity forecasting API
- Anomaly detection
- Auto-remediation framework

✅ **GraphQL API**
- Complete schema defined
- Queries, mutations, subscriptions
- GraphiQL interface

✅ **Kafka Integration**
- Producer and consumer services
- 9 topics configured
- Message handlers

✅ **Infrastructure**
- Docker Compose setup
- TimescaleDB, Kafka, Elasticsearch, MLflow
- Health checks configured

### What's Next

🚧 **In Progress**
- Real ML model implementations (LSTM, Random Forest, XGBoost)
- TimescaleDB schema and integration
- Kubernetes deployment manifests
- Comprehensive testing

---

## 📋 Prerequisites

### System Requirements
- **OS**: Linux, macOS, or Windows (with WSL2)
- **RAM**: 16GB minimum, 32GB recommended
- **Disk**: 50GB free space
- **CPU**: 4+ cores recommended

### Software Requirements
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Git**: 2.40+
- **Node.js**: 20+ (for CLI)
- **Python**: 3.11+ (for ML models)

---

## 🏁 Quick Start (5 minutes)

### 1. Clone Repository

```bash
# Clone repo
git clone https://github.com/iacdharma/iac-dharma.git
cd iac-dharma

# Switch to v3.0 development branch
git checkout v3.0-development
```

### 2. Start v3.0 Services

```bash
# Start all v3.0 services
docker-compose -f docker-compose.v3.yml up -d

# Wait for services to be healthy (2-3 minutes)
docker-compose -f docker-compose.v3.yml ps
```

**Services Started**:
- TimescaleDB → `http://localhost:5433`
- Kafka → `http://localhost:9092`
- Kafka UI → `http://localhost:8080`
- Elasticsearch → `http://localhost:9200`
- Kibana → `http://localhost:5601`
- MLflow → `http://localhost:5000`
- AIOps Engine → `http://localhost:8100`
- API Gateway v3 → `http://localhost:3000` (REST) + `http://localhost:4000` (GraphQL)

### 3. Verify Services

```bash
# Check AIOps Engine
curl http://localhost:8100/health

# Check GraphQL API
curl http://localhost:4000/graphql

# Open Kafka UI
open http://localhost:8080

# Open MLflow
open http://localhost:5000
```

### 4. Test AIOps Engine

```bash
# Test failure prediction
curl -X POST http://localhost:8100/api/v3/aiops/predict/failure \
  -H "Content-Type: application/json" \
  -d '{
    "prediction_type": "failure",
    "service_name": "api-gateway",
    "time_window": 48
  }'

# Test threat detection
curl -X POST http://localhost:8100/api/v3/aiops/predict/threat \
  -H "Content-Type: application/json" \
  -d '{
    "prediction_type": "threat",
    "service_name": "api-gateway"
  }'

# Test anomaly detection
curl -X POST http://localhost:8100/api/v3/aiops/analyze/anomaly \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "api-gateway",
    "metrics": {
      "cpu_usage": 85.5,
      "memory_usage": 78.3,
      "response_time": 250
    }
  }'
```

### 5. Test GraphQL API

Open GraphiQL interface: `http://localhost:4000/graphql`

**Example Query**:
```graphql
query {
  listInfrastructures(provider: AWS) {
    id
    name
    provider
    region
    status
    tags
  }
  
  predictions(serviceNam: "api-gateway") {
    id
    predictionType
    probability
    confidence
    details
  }
}
```

**Example Mutation**:
```graphql
mutation {
  createInfrastructure(input: {
    name: "production-cluster"
    provider: AWS
    region: "us-east-1"
    templateId: "eks-standard"
    tags: ["production", "api"]
  }) {
    id
    name
    status
  }
}
```

**Example Subscription**:
```graphql
subscription {
  anomalyAlerts(serviceName: "api-gateway") {
    id
    serviceName
    severity
    description
    detectedAt
  }
}
```

---

## 🔧 Development Setup

### Backend Development (AIOps Engine)

```bash
# Navigate to AIOps Engine
cd backend/aiops-engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run development server
python app.py

# Or with auto-reload
uvicorn app:app --host 0.0.0.0 --port 8100 --reload
```

**Access**:
- API: `http://localhost:8100`
- Docs: `http://localhost:8100/docs`
- ReDoc: `http://localhost:8100/redoc`

### API Gateway Development

```bash
# Navigate to API Gateway
cd backend/api-gateway

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev
```

---

## 📊 Monitoring & Observability

### AIOps Engine Metrics

```bash
# View health
curl http://localhost:8100/health

# View metrics (Prometheus format)
curl http://localhost:8100/metrics
```

### Kafka Monitoring

Open Kafka UI: `http://localhost:8080`
- View topics
- Monitor consumer groups
- Inspect messages

### Elasticsearch & Logs

Open Kibana: `http://localhost:5601`
- Create index patterns
- View logs
- Create dashboards

### MLflow Tracking

Open MLflow: `http://localhost:5000`
- View experiments
- Compare models
- View artifacts

---

## 🧪 Testing

### Run Unit Tests

```bash
# AIOps Engine tests
cd backend/aiops-engine
pytest tests/unit/ -v --cov

# API Gateway tests
cd backend/api-gateway
npm test
```

### Run Integration Tests

```bash
# Full integration tests
pytest tests/integration/ -v

# Specific test
pytest tests/integration/test_aiops_engine.py -v
```

### Performance Testing

```bash
# Load test AIOps Engine
cd tests/performance
locust -f load_test.py --host=http://localhost:8100
```

---

## 📚 Documentation

### API Documentation

- **AIOps Engine REST API**: `http://localhost:8100/docs`
- **GraphQL Schema**: `http://localhost:4000/graphql`
- **Roadmap**: `ROADMAP_v3.0.md`
- **Progress**: `V3_PHASE1_PROGRESS.md`

### Architecture Docs

- **AIOps Engine**: `backend/aiops-engine/README.md`
- **ML Models**: `docs/ml-models.md` (coming soon)
- **Kafka Integration**: `docs/kafka-integration.md` (coming soon)

---

## 🐛 Troubleshooting

### Services won't start

```bash
# Check Docker
docker --version
docker-compose --version

# Check port conflicts
netstat -tuln | grep -E '3000|4000|5433|8100|9092'

# View logs
docker-compose -f docker-compose.v3.yml logs -f

# Restart services
docker-compose -f docker-compose.v3.yml restart
```

### AIOps Engine errors

```bash
# Check logs
docker-compose -f docker-compose.v3.yml logs aiops-engine

# Check dependencies
cd backend/aiops-engine
pip list

# Rebuild container
docker-compose -f docker-compose.v3.yml build aiops-engine
docker-compose -f docker-compose.v3.yml up -d aiops-engine
```

### Kafka connection issues

```bash
# Check Kafka health
docker-compose -f docker-compose.v3.yml exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# List topics
docker-compose -f docker-compose.v3.yml exec kafka kafka-topics --list --bootstrap-server localhost:9092

# Check consumer groups
docker-compose -f docker-compose.v3.yml exec kafka kafka-consumer-groups --list --bootstrap-server localhost:9092
```

---

## 🚀 Next Steps

### For Developers

1. **Implement ML Models**
   - [ ] Train LSTM failure prediction model
   - [ ] Implement Random Forest threat detection
   - [ ] Add XGBoost capacity forecasting

2. **Database Integration**
   - [ ] Set up TimescaleDB schema
   - [ ] Implement data ingestion pipeline
   - [ ] Add retention policies

3. **Testing**
   - [ ] Write unit tests (80%+ coverage)
   - [ ] Write integration tests
   - [ ] Performance testing

### For DevOps

1. **Kubernetes Deployment**
   - [ ] Create Helm charts
   - [ ] Set up monitoring
   - [ ] Configure autoscaling

2. **Security**
   - [ ] Implement authentication
   - [ ] Add rate limiting
   - [ ] Security scanning

### For Data Scientists

1. **Model Training**
   - [ ] Collect training data
   - [ ] Train models
   - [ ] Evaluate performance
   - [ ] Deploy to MLflow

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/iacdharma/iac-dharma/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iacdharma/iac-dharma/discussions)
- **Slack**: [IAC Dharma Community](https://iacdharma.slack.com)
- **Email**: support@iacdharma.io

---

## 📝 Contributing

See `CONTRIBUTING.md` for development guidelines.

---

**IAC Dharma v3.0** - Autonomous Infrastructure  
Build. Predict. Heal. Automatically.

---

**Last Updated**: [Current Date]  
**Branch**: v3.0-development  
**Status**: Alpha - Phase 1 (20% complete)
