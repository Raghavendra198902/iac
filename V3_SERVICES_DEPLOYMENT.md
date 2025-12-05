# v3.0 Services Deployment Status

## ✅ Completed

### Infrastructure Services (Running)
- ✅ TimescaleDB (Port 5433) - Time-series database
- ✅ PostgreSQL v3 (Port 5433) - Main database  
- ✅ Neo4j v3 (Port 7474, 7687) - Graph database for CMDB
- ✅ Redis v3 (Port 6380) - Caching
- ✅ Kafka v3 (Port 9093) - Message streaming
- ✅ Zookeeper v3 (Port 2182) - Kafka coordination
- ✅ Prometheus v3 (Port 9091) - Metrics
- ✅ Grafana v3 (Port 3020) - Dashboards
- ✅ MLflow (Port 5000) - ML model tracking

### Backend Services Implemented
- ✅ AIOps Engine (3,100+ LOC) - ML models for predictions
- ✅ AI Orchestrator (1,800+ LOC) - NLP command interface  
- ✅ GraphQL API Layer (400+ LOC) - Unified API
- ✅ CMDB Agent (Complete) - Resource discovery

## 🚀 Quick Start Commands

### 1. Initialize TimescaleDB Schema
```bash
# Connect to TimescaleDB
docker exec -it iac-postgres-v3 psql -U iacadmin -d iac_v3

# Create aiops database and user
CREATE DATABASE aiops;
CREATE USER aiops_user WITH PASSWORD 'aiops_password';
GRANT ALL PRIVILEGES ON DATABASE aiops TO aiops_user;
\c aiops
\i /path/to/timescaledb_schema.sql
```

### 2. Start Backend Services

#### Option A: Docker (Recommended for Production)
```bash
cd /home/rrd/iac

# Build images
docker build -t iac-aiops-engine:v3 ./backend/aiops-engine
docker build -t iac-ai-orchestrator:v3 ./backend/ai-orchestrator

# Run services
docker run -d --name aiops-engine \
  --network iac-v3-network \
  -p 8100:8100 \
  -e MLFLOW_TRACKING_URI=http://iac-mlflow-v3:5000 \
  -e TIMESCALEDB_HOST=iac-postgres-v3 \
  iac-aiops-engine:v3

docker run -d --name ai-orchestrator \
  --network iac-v3-network \
  -p 8300:8300 \
  -e GRAPHQL_URL=http://dharma-api-gateway:4000/graphql \
  -e AIOPS_URL=http://aiops-engine:8100 \
  iac-ai-orchestrator:v3
```

#### Option B: Local Development (Python)
```bash
# Install Python 3.11+ and pip
cd /home/rrd/iac/backend/aiops-engine
pip install -r requirements.txt
python3 app_v3.py

# In another terminal
cd /home/rrd/iac/backend/ai-orchestrator
pip install -r requirements.txt
python3 app_v3.py
```

### 3. Verify Services
```bash
# Check infrastructure
docker-compose -f docker-compose.v3.yml ps

# Check MLflow
curl http://localhost:5000/health

# Check AIOps Engine (when running)
curl http://localhost:8100/api/v3/aiops/health

# Check AI Orchestrator (when running)
curl http://localhost:8300/api/v3/orchestrator/health
```

### 4. Train ML Models
```bash
# Train all models with synthetic data
curl -X POST http://localhost:8100/api/v3/aiops/models/train \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["failure_predictor", "threat_detector", "capacity_forecaster"],
    "use_synthetic_data": true,
    "n_samples": 10000
  }'

# Check model status
curl http://localhost:8100/api/v3/aiops/models/status
```

### 5. Test Natural Language Commands
```bash
# Ask AI Orchestrator
curl -X POST http://localhost:8300/api/v3/orchestrator/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "list all AWS infrastructures",
    "session_id": "test-session-1"
  }'

# Get help
curl http://localhost:8300/api/v3/orchestrator/help
```

## 📊 Service Endpoints

### AIOps Engine (Port 8100)
- `GET /api/v3/aiops/health` - Health check
- `POST /api/v3/aiops/predict/failure/enhanced` - LSTM failure prediction  
- `POST /api/v3/aiops/predict/threat/enhanced` - RF threat detection
- `POST /api/v3/aiops/predict/capacity/enhanced` - XGBoost capacity forecast
- `POST /api/v3/aiops/models/train` - Train models
- `GET /api/v3/aiops/models/status` - Model status
- `GET /docs` - Interactive API docs

### AI Orchestrator (Port 8300)
- `GET /api/v3/orchestrator/health` - Health check
- `POST /api/v3/orchestrator/command` - Process NLP command
- `GET /api/v3/orchestrator/help` - Get help and examples
- `WS /api/v3/orchestrator/ws/chat` - WebSocket chat
- `GET /docs` - Interactive API docs

### MLflow (Port 5000)
- `GET /` - MLflow UI
- `GET /health` - Health check
- Experiment tracking and model registry

### Infrastructure
- Grafana: http://localhost:3020 (admin/admin123)
- Prometheus: http://localhost:9091
- Neo4j: http://localhost:7474 (neo4j/neo4jpassword)

## 🔧 Troubleshooting

### Issue: Services can't connect to databases
**Solution**: Ensure all services are on the same Docker network
```bash
docker network inspect iac-v3-network
```

### Issue: Python module not found
**Solution**: Install dependencies
```bash
pip install fastapi uvicorn tensorflow scikit-learn xgboost mlflow asyncpg
```

### Issue: Port already in use
**Solution**: Check and stop conflicting services
```bash
lsof -i :8100  # Check port 8100
docker ps | grep 8100  # Check Docker containers
```

### Issue: ML models not trained
**Solution**: Models will use heuristic fallback until trained
```bash
# Train models using the API
curl -X POST http://localhost:8100/api/v3/aiops/models/train \
  -H "Content-Type: application/json" \
  -d '{"use_synthetic_data": true, "n_samples": 5000}'
```

## 📝 Next Steps

### Immediate (Today)
1. ✅ Complete Docker image builds
2. ⏳ Initialize TimescaleDB schema
3. ⏳ Start all backend services
4. ⏳ Train ML models with data
5. ⏳ End-to-end testing

### Short-term (This Week)
1. Connect services to Kafka for real-time streaming
2. Set up monitoring dashboards in Grafana
3. Implement auto-remediation workflows
4. Add authentication/authorization
5. Performance testing and optimization

### Medium-term (Next 2 Weeks)
1. Implement remaining 8 ML models
2. Add model drift detection
3. Create comprehensive test suite
4. Documentation and runbooks
5. Production deployment preparation

## 📚 Documentation

- Architecture: `V3_BACKEND_COMPLETE_REPORT.md`
- ML Models: `ML_MODELS_IMPLEMENTATION_COMPLETE.md`
- Deployment: `V3_DEPLOYMENT_GUIDE.md`
- AI Orchestrator: `AI_ORCHESTRATOR_COMPLETE.md`
- CMDB Agent: `CMDB_AGENT_COMPLETE.md`

## 🎯 Success Criteria

- [ ] All infrastructure services healthy
- [ ] All backend services running
- [ ] ML models trained (>80% accuracy)
- [ ] End-to-end NLP commands working
- [ ] Grafana dashboards displaying metrics
- [ ] MLflow tracking experiments
- [ ] TimescaleDB storing time-series data

---

**Last Updated**: December 5, 2025
**Status**: Infrastructure ✅ | Backend Services 🚧 | Testing ⏳
