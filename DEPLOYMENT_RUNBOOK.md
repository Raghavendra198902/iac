# Deployment Runbook

## Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Kubernetes cluster (v1.24+) with at least 3 nodes
- [ ] 16 CPU cores total (4 per node minimum)
- [ ] 32 GB RAM total
- [ ] 200 GB storage for persistent volumes
- [ ] LoadBalancer or Ingress controller configured
- [ ] SSL certificates ready (Let's Encrypt or custom)

### Secrets and Configuration
- [ ] OpenAI API key obtained
- [ ] Anthropic API key obtained
- [ ] Pinecone API key and environment configured
- [ ] JWT secret key generated (32+ characters)
- [ ] Database passwords set (PostgreSQL, MongoDB, RabbitMQ)
- [ ] Domain names configured in DNS

### External Services
- [ ] Container registry access (GitHub Container Registry, Docker Hub, etc.)
- [ ] Monitoring system (Prometheus, Grafana)
- [ ] Log aggregation (ELK Stack, Loki, CloudWatch)
- [ ] Alert notification (Slack, PagerDuty, email)

## Initial Deployment

### 1. Create Namespace
```bash
kubectl create namespace iac-platform
```

### 2. Create Secrets
```bash
# PostgreSQL
kubectl create secret generic postgres-secret \
  --from-literal=username=iacuser \
  --from-literal=password=YOUR_SECURE_PASSWORD \
  -n iac-platform

# MongoDB
kubectl create secret generic mongodb-secret \
  --from-literal=password=YOUR_SECURE_PASSWORD \
  -n iac-platform

# RabbitMQ
kubectl create secret generic rabbitmq-secret \
  --from-literal=password=YOUR_SECURE_PASSWORD \
  -n iac-platform

# AI Orchestrator
kubectl create secret generic ai-orchestrator-secrets \
  --from-literal=OPENAI_API_KEY=sk-your-key \
  --from-literal=ANTHROPIC_API_KEY=sk-ant-your-key \
  --from-literal=PINECONE_API_KEY=your-key \
  --from-literal=PINECONE_ENVIRONMENT=us-west1-gcp \
  --from-literal=SECRET_KEY=$(openssl rand -hex 32) \
  --from-literal=DATABASE_URL=postgresql://iacuser:PASSWORD@postgres:5432/iacdb \
  --from-literal=MONGODB_URL=mongodb://iacuser:PASSWORD@mongodb:27017 \
  --from-literal=REDIS_URL=redis://redis:6379 \
  --from-literal=RABBITMQ_URL=amqp://iacuser:PASSWORD@rabbitmq:5672 \
  -n iac-platform
```

### 3. Deploy Databases
```bash
kubectl apply -f k8s/databases.yaml
```

Wait for databases to be ready:
```bash
kubectl wait --for=condition=ready pod -l app=postgres -n iac-platform --timeout=300s
kubectl wait --for=condition=ready pod -l app=mongodb -n iac-platform --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n iac-platform --timeout=300s
kubectl wait --for=condition=ready pod -l app=rabbitmq -n iac-platform --timeout=300s
```

### 4. Initialize Database
```bash
# Run database initialization job
kubectl run db-init --image=your-registry/ai-orchestrator:latest \
  --restart=Never \
  --rm -i \
  --command -n iac-platform -- python init_db.py
```

### 5. Deploy Application
```bash
kubectl apply -f k8s/ai-orchestrator.yaml
```

Wait for deployment:
```bash
kubectl rollout status deployment/ai-orchestrator -n iac-platform
kubectl rollout status deployment/celery-worker -n iac-platform
```

### 6. Verify Deployment
```bash
# Check all pods are running
kubectl get pods -n iac-platform

# Check services
kubectl get svc -n iac-platform

# Test health endpoint
kubectl run test-curl --image=curlimages/curl --rm -i --restart=Never -n iac-platform -- \
  curl -f http://ai-orchestrator-service:8000/health
```

## Post-Deployment Verification

### Health Checks
```bash
# API health
curl https://api.iac.yourdomain.com/health

# Expected response:
# {"status":"healthy","service":"ai-orchestrator","version":"1.0.0"}

# Test project creation
curl -X POST https://api.iac.yourdomain.com/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Deployment verification",
    "mode": "oneclick",
    "input_data": {"industry": "test"}
  }'
```

### Monitor Logs
```bash
# Application logs
kubectl logs -f deployment/ai-orchestrator -n iac-platform

# Celery worker logs
kubectl logs -f deployment/celery-worker -n iac-platform

# Database logs
kubectl logs -f statefulset/postgres -n iac-platform
```

### Check Metrics
```bash
# Access Prometheus metrics
kubectl port-forward svc/ai-orchestrator-service 8000:8000 -n iac-platform
curl http://localhost:8000/metrics
```

## Scaling

### Scale API Servers
```bash
# Scale to 5 replicas
kubectl scale deployment/ai-orchestrator --replicas=5 -n iac-platform
```

### Scale Celery Workers
```bash
# Scale to 10 workers
kubectl scale deployment/celery-worker --replicas=10 -n iac-platform
```

### Auto-scaling (HPA)
```bash
# Create HPA for API
kubectl autoscale deployment ai-orchestrator \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n iac-platform

# Create HPA for workers
kubectl autoscale deployment celery-worker \
  --cpu-percent=80 \
  --min=5 \
  --max=20 \
  -n iac-platform
```

## Updates and Rollbacks

### Rolling Update
```bash
# Update image
kubectl set image deployment/ai-orchestrator \
  fastapi=your-registry/ai-orchestrator:v1.1.0 \
  -n iac-platform

# Monitor rollout
kubectl rollout status deployment/ai-orchestrator -n iac-platform
```

### Rollback
```bash
# Check rollout history
kubectl rollout history deployment/ai-orchestrator -n iac-platform

# Rollback to previous version
kubectl rollout undo deployment/ai-orchestrator -n iac-platform

# Rollback to specific revision
kubectl rollout undo deployment/ai-orchestrator --to-revision=2 -n iac-platform
```

## Backup and Restore

### Database Backup
```bash
# PostgreSQL backup
kubectl exec -it statefulset/postgres -n iac-platform -- \
  pg_dump -U iacuser iacdb > backup-$(date +%Y%m%d).sql

# MongoDB backup
kubectl exec -it statefulset/mongodb -n iac-platform -- \
  mongodump --out=/tmp/backup-$(date +%Y%m%d)
```

### Restore Database
```bash
# PostgreSQL restore
kubectl exec -i statefulset/postgres -n iac-platform -- \
  psql -U iacuser iacdb < backup-20251204.sql

# MongoDB restore
kubectl exec -it statefulset/mongodb -n iac-platform -- \
  mongorestore /tmp/backup-20251204
```

## Troubleshooting

### Common Issues

**1. Pods not starting**
```bash
# Check pod status
kubectl describe pod <pod-name> -n iac-platform

# Check logs
kubectl logs <pod-name> -n iac-platform

# Common causes:
# - Missing secrets
# - Image pull errors
# - Resource constraints
```

**2. Database connection errors**
```bash
# Test database connectivity
kubectl run psql-test --image=postgres:15-alpine --rm -it --restart=Never -n iac-platform -- \
  psql -h postgres -U iacuser -d iacdb

# Check database pods
kubectl get pods -l app=postgres -n iac-platform
```

**3. High memory usage**
```bash
# Check resource usage
kubectl top pods -n iac-platform

# Adjust limits in deployment
kubectl edit deployment/ai-orchestrator -n iac-platform
```

**4. Celery workers not processing**
```bash
# Check RabbitMQ
kubectl exec -it statefulset/rabbitmq -n iac-platform -- \
  rabbitmqctl list_queues

# Restart workers
kubectl rollout restart deployment/celery-worker -n iac-platform
```

### Emergency Procedures

**Complete Restart**
```bash
kubectl delete deployment ai-orchestrator celery-worker -n iac-platform
kubectl apply -f k8s/ai-orchestrator.yaml
```

**Clear All Data (Dangerous!)**
```bash
kubectl delete namespace iac-platform
# Then redeploy from step 1
```

## Monitoring and Alerts

### Key Metrics to Monitor
- API response time (p95 < 500ms)
- Error rate (< 1%)
- CPU usage (< 70%)
- Memory usage (< 80%)
- Active generations
- Queue depth (< 100 messages)
- Database connections
- LLM API latency

### Alert Rules
- API error rate > 5% for 5 minutes
- Pod restart count > 3 in 10 minutes
- Memory usage > 90%
- Database connection pool exhausted
- Queue depth > 500 messages
- Generation taking > 10 minutes

## Maintenance Windows

### Planned Maintenance
1. Announce maintenance window (24 hours notice)
2. Scale down to 1 replica during off-peak hours
3. Apply updates
4. Run smoke tests
5. Scale back up
6. Monitor for 1 hour
7. Confirm stability

### Zero-Downtime Deployment
1. Deploy canary (10% traffic)
2. Monitor metrics for 15 minutes
3. Gradually increase traffic (25%, 50%, 75%, 100%)
4. Complete rollout
5. Remove old version

## Contacts

- **On-call Engineer**: oncall@yourdomain.com
- **Platform Team**: platform@yourdomain.com
- **Security Team**: security@yourdomain.com
- **Escalation**: engineering-manager@yourdomain.com
