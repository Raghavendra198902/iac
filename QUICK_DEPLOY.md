# 🚀 Production Deployment Quick Start

**Platform**: IAC Dharma v2.0.0  
**Status**: ✅ Production Ready  
**Date**: December 4, 2025

---

## Prerequisites Checklist

Before deploying to production, ensure you have:

- [ ] Kubernetes cluster (v1.24+) running and accessible
- [ ] kubectl configured with admin access
- [ ] All secrets updated in `k8s/secrets.yaml` (no CHANGE_ME values)
- [ ] DNS records configured (if using custom domain)
- [ ] SSL certificates ready (if using HTTPS)
- [ ] Database backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment

---

## Quick Deploy (5 Minutes)

### Option 1: Automated Deployment Script

```bash
# 1. Update secrets first!
nano k8s/secrets.yaml  # Replace all CHANGE_ME values

# 2. Run deployment script
./deploy-production.sh

# 3. Verify deployment
kubectl get pods -n iac-platform

# 4. Access services
kubectl port-forward -n iac-platform svc/api-gateway 3000:3000
kubectl port-forward -n iac-platform svc/frontend 5173:5173
```

### Option 2: Manual Deployment

```bash
# 1. Create namespace
kubectl create namespace iac-platform

# 2. Deploy secrets (update first!)
kubectl apply -f k8s/secrets.yaml

# 3. Deploy ConfigMaps
kubectl apply -f k8s/configmaps/services.yaml
kubectl apply -f k8s/configmaps/platform.yaml

# 4. Deploy databases
kubectl apply -f k8s/databases.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n iac-platform --timeout=300s

# 5. Deploy backend services
kubectl apply -f k8s/base/api-gateway.yaml
kubectl apply -f k8s/base/blueprint-service.yaml
kubectl apply -f k8s/base/backend-services.yaml

# 6. Deploy frontend
kubectl apply -f k8s/base/frontend.yaml

# 7. Deploy ingress (if needed)
kubectl apply -f k8s/base/ingress.yaml

# 8. Verify everything is running
kubectl get all -n iac-platform
```

---

## Generate Secure Secrets

Before deployment, generate secure secrets:

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# JWT Refresh Secret (different from above)
openssl rand -base64 32

# Database Password
openssl rand -base64 24

# RabbitMQ Password
openssl rand -base64 24
```

Update `k8s/secrets.yaml` with these values.

---

## Verify Deployment

### Check Pod Status
```bash
# All pods should be Running
kubectl get pods -n iac-platform

# Check specific service
kubectl describe pod <pod-name> -n iac-platform

# View logs
kubectl logs -f <pod-name> -n iac-platform
```

### Test Services
```bash
# Port forward API Gateway
kubectl port-forward -n iac-platform svc/api-gateway 3000:3000 &

# Test health endpoint
curl http://localhost:3000/health

# Expected response: {"status":"healthy","timestamp":"..."}
```

### Access Applications
```bash
# API Gateway
kubectl port-forward -n iac-platform svc/api-gateway 3000:3000

# Frontend
kubectl port-forward -n iac-platform svc/frontend 5173:5173

# Grafana
kubectl port-forward -n iac-platform svc/grafana 3001:3001

# Access in browser:
# - Frontend: http://localhost:5173
# - API Docs: http://localhost:3000/api-docs
# - Grafana: http://localhost:3001 (admin/admin)
```

---

## Run Integration Tests

After deployment, verify everything works:

```bash
# From the project root
npm run test:integration

# Expected: All tests passing ✅
```

---

## Monitoring & Health Checks

### View Service Health
```bash
# Get health status of all services
kubectl get pods -n iac-platform

# Check API Gateway health
curl http://localhost:3000/api/monitoring/health
```

### Access Monitoring Dashboards
```bash
# Grafana (metrics visualization)
kubectl port-forward -n iac-platform svc/grafana 3001:3001
# Open: http://localhost:3001

# Prometheus (metrics collection)
kubectl port-forward -n iac-platform svc/prometheus 9090:9090
# Open: http://localhost:9090
```

---

## Common Issues & Solutions

### Issue: Pods in CrashLoopBackOff

**Solution:**
```bash
# Check pod logs
kubectl logs <pod-name> -n iac-platform

# Check pod events
kubectl describe pod <pod-name> -n iac-platform

# Common causes:
# - Missing environment variables (check ConfigMaps/Secrets)
# - Database connection issues (check database pod status)
# - Port conflicts
```

### Issue: Secrets Not Found

**Solution:**
```bash
# Verify secrets are created
kubectl get secrets -n iac-platform

# If missing, apply secrets
kubectl apply -f k8s/secrets.yaml

# Restart pods to pick up secrets
kubectl rollout restart deployment <deployment-name> -n iac-platform
```

### Issue: Database Connection Timeout

**Solution:**
```bash
# Check database pod status
kubectl get pods -n iac-platform | grep postgres

# Check database logs
kubectl logs <postgres-pod> -n iac-platform

# Test database connectivity
kubectl exec -it <postgres-pod> -n iac-platform -- psql -U dharma_admin -d iac_dharma
```

---

## Rollback Procedure

If something goes wrong:

```bash
# 1. Check backup location (created by deploy-production.sh)
ls -la backups/

# 2. Restore previous state
kubectl apply -f backups/<timestamp>/all-resources.yaml

# 3. Or delete and redeploy
kubectl delete namespace iac-platform
# Then redeploy from scratch
```

---

## Production Checklist

Before going live:

- [ ] All secrets updated (no default values)
- [ ] All pods running and healthy
- [ ] Integration tests passing
- [ ] Health checks responding
- [ ] Monitoring dashboards accessible
- [ ] SSL certificates installed (if using HTTPS)
- [ ] DNS records configured (if using custom domain)
- [ ] Backup strategy tested
- [ ] Team trained on monitoring
- [ ] Incident response plan ready
- [ ] User documentation updated

---

## Scaling

### Scale Individual Services
```bash
# Scale API Gateway to 3 replicas
kubectl scale deployment api-gateway -n iac-platform --replicas=3

# Scale all services
kubectl scale deployment --all -n iac-platform --replicas=2
```

### Auto-scaling (HPA)
```bash
# Enable horizontal pod autoscaling
kubectl autoscale deployment api-gateway -n iac-platform \
  --min=2 --max=10 --cpu-percent=80
```

---

## Maintenance

### Update Deployment
```bash
# Pull latest changes
git pull origin v2.0-development

# Apply updates
kubectl apply -f k8s/

# Rolling restart
kubectl rollout restart deployment <deployment-name> -n iac-platform
```

### View Deployment History
```bash
# Check rollout status
kubectl rollout status deployment <deployment-name> -n iac-platform

# View rollout history
kubectl rollout history deployment <deployment-name> -n iac-platform
```

---

## Support

### View All Resources
```bash
kubectl get all -n iac-platform
```

### Get Service Endpoints
```bash
kubectl get svc -n iac-platform
```

### Check Events
```bash
kubectl get events -n iac-platform --sort-by='.lastTimestamp'
```

---

## Next Steps After Deployment

1. **Configure DNS** (if using custom domain)
   - Point your domain to the ingress load balancer
   - Update ingress.yaml with your domain

2. **Setup SSL/TLS**
   - Install cert-manager for automatic certificates
   - Configure TLS in ingress.yaml

3. **Configure Monitoring Alerts**
   - Set up Slack/email notifications in Grafana
   - Configure alert rules for critical services

4. **User Onboarding**
   - Create initial user accounts
   - Set up RBAC policies
   - Provide access to documentation

5. **Performance Tuning**
   - Monitor resource usage
   - Adjust replica counts as needed
   - Optimize database queries

---

## Quick Reference

| Service | Port | Access Command |
|---------|------|----------------|
| API Gateway | 3000 | `kubectl port-forward -n iac-platform svc/api-gateway 3000:3000` |
| Frontend | 5173 | `kubectl port-forward -n iac-platform svc/frontend 5173:5173` |
| Grafana | 3001 | `kubectl port-forward -n iac-platform svc/grafana 3001:3001` |
| Prometheus | 9090 | `kubectl port-forward -n iac-platform svc/prometheus 9090:9090` |
| PostgreSQL | 5432 | `kubectl port-forward -n iac-platform svc/postgres 5432:5432` |

---

**Ready to deploy?** Run `./deploy-production.sh` to get started! 🚀
