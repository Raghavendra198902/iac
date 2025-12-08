# 🎉 IAC Dharma v3.0 - Infrastructure Running!

**Date**: December 5, 2025  
**Status**: ✅ All Infrastructure Services Operational

---

## 🚀 Running Services

### Databases
- ✅ **PostgreSQL 16 + TimescaleDB** (iac-postgres-v3)
  - Port: 5433
  - Database: iac_v3
  - User: iacadmin
  - Status: Healthy
  - Access: `psql -h localhost -p 5433 -U iacadmin -d iac_v3`

- ✅ **Neo4j 5.15** (iac-neo4j-v3)
  - HTTP Port: 7474
  - Bolt Port: 7687
  - Status: Health check starting
  - Browser: http://localhost:7474
  - User: neo4j / neo4jpassword

- ✅ **Redis 7.x** (iac-redis-v3)
  - Port: 6380
  - Status: Healthy
  - Access: `redis-cli -p 6380`

### Message Queue
- ✅ **Zookeeper** (iac-zookeeper-v3)
  - Port: 2182
  - Status: Healthy

- ✅ **Apache Kafka 7.5** (iac-kafka-v3)
  - Port: 9093
  - Status: Running
  - Replication Factor: 1 (dev mode)

### Monitoring
- ✅ **Prometheus** (iac-prometheus-v3)
  - Port: 9091
  - Status: Running
  - Access: http://localhost:9091

- ✅ **Grafana** (iac-grafana-v3)
  - Port: 3020
  - Status: Running
  - Access: http://localhost:3020
  - Credentials: admin / admin123

---

## 📊 Quick Health Check

```bash
# Check all v3 services
docker-compose -f docker-compose.v3.yml ps

# View logs
docker-compose -f docker-compose.v3.yml logs -f [service-name]

# Stop services
docker-compose -f docker-compose.v3.yml down

# Restart services
docker-compose -f docker-compose.v3.yml restart

# Remove all data (WARNING: destructive)
docker-compose -f docker-compose.v3.yml down -v
```

---

## 🔧 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | localhost:5433 | iacadmin / iacadmin123 |
| Neo4j Browser | http://localhost:7474 | neo4j / neo4jpassword |
| Redis | localhost:6380 | (no auth) |
| Kafka | localhost:9093 | (no auth) |
| Prometheus | http://localhost:9091 | (no auth) |
| Grafana | http://localhost:3020 | admin / admin123 |

---

## 📝 Next Steps

### Phase 1: AIOps Engine Development (Week 2)

```bash
cd /home/rrd/iac/backend/aiops-engine

# 1. Create Python virtual environment
python3.11 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install fastapi uvicorn tensorflow pytorch xgboost lightgbm prophet mlflow prometheus-client

# 3. Start development server
uvicorn app:app --port 8100 --reload
```

### Phase 2: Database Initialization

```bash
# PostgreSQL
psql -h localhost -p 5433 -U iacadmin -d iac_v3 << SQL
CREATE SCHEMA IF NOT EXISTS aiops;
CREATE SCHEMA IF NOT EXISTS cmdb;
CREATE SCHEMA IF NOT EXISTS metrics;
SQL

# Neo4j (via browser or cypher-shell)
# Create constraints and indexes
# http://localhost:7474
```

### Phase 3: Kafka Topic Creation

```bash
# Connect to Kafka container
docker exec -it iac-kafka-v3 bash

# Create topics
kafka-topics --create --topic infrastructure.events --bootstrap-server localhost:9092
kafka-topics --create --topic ml.predictions --bootstrap-server localhost:9092
kafka-topics --create --topic anomaly.detected --bootstrap-server localhost:9092
kafka-topics --create --topic remediation.actions --bootstrap-server localhost:9092
```

---

## 💡 Development Tips

### PostgreSQL Connection
```python
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql://iacadmin:iacadmin123@localhost:5433/iac_v3"
)
```

### Neo4j Connection
```python
from neo4j import GraphDatabase

driver = GraphDatabase.driver(
    "bolt://localhost:7687",
    auth=("neo4j", "neo4jpassword")
)
```

### Redis Connection
```python
import redis

client = redis.Redis(
    host='localhost',
    port=6380,
    decode_responses=True
)
```

### Kafka Producer
```python
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=['localhost:9093'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
```

---

## 🎯 Ready for Development!

All infrastructure services are running and ready for:
- ✅ Backend service development
- ✅ Database schema creation
- ✅ ML model training
- ✅ Event streaming setup
- ✅ Monitoring and observability

**Next Action**: Start implementing the AIOps Engine service!
