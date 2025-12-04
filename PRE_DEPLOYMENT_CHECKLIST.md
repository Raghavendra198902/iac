# 🚀 Pre-Deployment Checklist - IAC Dharma Platform v2.0

**Platform Status**: ✅ 100% Production Ready  
**Last Updated**: December 4, 2025  
**Target Environment**: Production Kubernetes Cluster

---

## 📋 Pre-Flight Checklist

### ✅ Development Complete (Already Done)
- [x] All critical gaps resolved (5/5)
- [x] All high-priority gaps resolved (6/6)
- [x] 50+ test cases passing
- [x] 8 OPA policies implemented (37+ rules)
- [x] API documentation complete (OpenAPI 3.0.3)
- [x] All code pushed to GitHub
- [x] Deployment scripts created

---

## 🔧 Pre-Deployment Tasks

### Phase 1: Infrastructure Preparation (1-2 hours)

#### ☐ 1. Kubernetes Cluster Ready
```bash
# Verify cluster access
kubectl cluster-info
kubectl get nodes

# Check cluster version (requires 1.24+)
kubectl version --short

# Verify resource availability
kubectl top nodes  # Ensure sufficient CPU/memory
```

**Requirements:**
- Kubernetes 1.24 or higher
- At least 3 worker nodes (recommended)
- 8 GB RAM per node minimum
- Storage class configured for persistent volumes

#### ☐ 2. Update Secrets with Real Values
```bash
# Generate secure secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET
openssl rand -base64 32  # SESSION_SECRET
openssl rand -base64 24  # DB_PASSWORD
openssl rand -base64 24  # RABBITMQ_PASSWORD
```

**Edit k8s/secrets.yaml and replace all CHANGE_ME values:**
```yaml
# Update these in k8s/secrets.yaml:
jwt-secret: "<your_jwt_secret_32_chars>"
jwt-refresh-secret: "<your_jwt_refresh_secret_32_chars>"
session-secret: "<your_session_secret_32_chars>"
db-password: "<your_secure_db_password>"
rabbitmq-password: "<your_rabbitmq_password>"
```

**IMPORTANT**: After updating, verify no CHANGE_ME values remain:
```bash
grep -n "CHANGE_ME" k8s/secrets.yaml
# Should return: no matches
```

#### ☐ 3. Configure Cloud Provider Credentials (Optional)

If deploying to AWS/Azure/GCP, update cloud credentials in `k8s/secrets.yaml`:

**For AWS:**
```yaml
aws-access-key-id: "<your_aws_access_key>"
aws-secret-access-key: "<your_aws_secret_key>"
```

**For Azure:**
```yaml
azure-subscription-id: "<your_subscription_id>"
azure-tenant-id: "<your_tenant_id>"
azure-client-id: "<your_client_id>"
azure-client-secret: "<your_client_secret>"
```

**For GCP:**
```yaml
gcp-project-id: "<your_project_id>"
gcp-service-account-key: |
  <your_service_account_json_key>
```

#### ☐ 4. DNS Configuration (Production Only)

**If using custom domain:**
```bash
# 1. Get LoadBalancer IP after deployment
kubectl get svc -n iac-platform api-gateway

# 2. Create DNS A records:
# api.yourdomain.com    -> <LoadBalancer-IP>
# app.yourdomain.com    -> <LoadBalancer-IP>
# grafana.yourdomain.com -> <LoadBalancer-IP>
```

**Update k8s/base/ingress.yaml with your domain:**
```yaml
spec:
  rules:
  - host: api.yourdomain.com
  - host: app.yourdomain.com
```

#### ☐ 5. SSL/TLS Certificates (Production Only)

**Option A: Let's Encrypt (Recommended)**
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f k8s/ssl/cert-issuer.yaml
```

**Option B: Manual Certificates**
```bash
# Create TLS secret with your certificates
kubectl create secret tls dharma-tls \
  --cert=path/to/cert.crt \
  --key=path/to/key.key \
  -n iac-platform
```

---

### Phase 2: Configuration Validation (30 minutes)

#### ☐ 6. Validate Kubernetes Manifests
```bash
# Dry-run all manifests
kubectl apply --dry-run=client -f k8s/secrets.yaml
kubectl apply --dry-run=client -f k8s/configmaps/services.yaml
kubectl apply --dry-run=client -f k8s/configmaps/platform.yaml
kubectl apply --dry-run=client -f k8s/databases.yaml
kubectl apply --dry-run=client -f k8s/base/

# Expected: No errors, "created (dry run)" messages
```

#### ☐ 7. Review ConfigMaps
```bash
# Check service configurations
cat k8s/configmaps/services.yaml | less

# Verify:
# - Service ports are correct
# - Environment variables are appropriate
# - No sensitive data in ConfigMaps (should be in Secrets)
```

#### ☐ 8. Verify Docker Images
```bash
# Check all images are accessible
docker pull raghavendra198902/iac-api-gateway:latest
docker pull raghavendra198902/iac-blueprint-service:latest
docker pull raghavendra198902/iac-generator:latest
docker pull raghavendra198902/iac-guardrails-engine:latest
docker pull raghavendra198902/iac-costing-service:latest
docker pull raghavendra198902/iac-orchestrator:latest
docker pull raghavendra198902/iac-automation-engine:latest
docker pull raghavendra198902/iac-monitoring-service:latest
docker pull raghavendra198902/iac-ai-engine:latest
docker pull raghavendra198902/iac-cloud-provider:latest
docker pull raghavendra198902/iac-ai-recommendations:latest
docker pull raghavendra198902/iac-sso-service:latest
docker pull raghavendra198902/iac-frontend:latest

# Or check if they exist in your registry
```

**If images don't exist, build and push:**
```bash
./build-enterprise.sh
```

---

### Phase 3: Backup & Safety (15 minutes)

#### ☐ 9. Backup Existing Resources (If Any)
```bash
# Create backup directory
mkdir -p backups/pre-deployment-$(date +%Y%m%d_%H%M%S)

# Backup existing namespace (if it exists)
kubectl get all -n iac-platform -o yaml > backups/pre-deployment-$(date +%Y%m%d_%H%M%S)/all-resources.yaml || true

# Backup existing configmaps
kubectl get configmaps -n iac-platform -o yaml > backups/pre-deployment-$(date +%Y%m%d_%H%M%S)/configmaps.yaml || true

# Backup existing secrets
kubectl get secrets -n iac-platform -o yaml > backups/pre-deployment-$(date +%Y%m%d_%H%M%S)/secrets.yaml || true
```

#### ☐ 10. Document Rollback Plan
```bash
# Create rollback script
cat > rollback.sh << 'EOF'
#!/bin/bash
echo "Rolling back IAC Dharma Platform..."

# Delete current deployment
kubectl delete namespace iac-platform

# Restore from backup
BACKUP_DIR="backups/pre-deployment-YYYYMMDD_HHMMSS"  # Update with actual backup
kubectl apply -f $BACKUP_DIR/all-resources.yaml

echo "Rollback complete!"
EOF

chmod +x rollback.sh
```

---

### Phase 4: Monitoring & Alerting (30 minutes)

#### ☐ 11. Prepare Monitoring Infrastructure
```bash
# Verify monitoring stack is configured
ls -la deployment/monitoring/

# Expected files:
# - prometheus-config.yaml
# - grafana-dashboards/
# - alerting-rules.yaml
```

#### ☐ 12. Configure Alert Notifications (Optional)
```bash
# Update Grafana notification channels
# Edit: deployment/monitoring/grafana-datasources.yaml

# Add Slack webhook (if using Slack):
# webhook_url: https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Add email configuration (if using email):
# smtp_host: smtp.gmail.com:587
# smtp_user: your-email@gmail.com
# smtp_password: your-app-password
```

#### ☐ 13. Test Monitoring Endpoints
```bash
# After deployment, verify these endpoints are accessible:
# - http://prometheus:9090 (metrics)
# - http://grafana:3001 (dashboards)
# - http://loki:3100 (logs)
```

---

### Phase 5: Security Audit (30 minutes)

#### ☐ 14. Scan for Vulnerabilities
```bash
# Scan Docker images (if you have trivy installed)
trivy image raghavendra198902/iac-api-gateway:latest
trivy image raghavendra198902/iac-frontend:latest
# ... repeat for other images

# Check for common security issues
kubesec scan k8s/base/*.yaml
```

#### ☐ 15. Review RBAC Policies
```bash
# Verify service accounts have minimal permissions
kubectl get serviceaccounts -n iac-platform
kubectl get rolebindings -n iac-platform
kubectl get clusterrolebindings | grep iac-platform
```

#### ☐ 16. Enable Network Policies (Optional but Recommended)
```bash
# Apply network policies to restrict pod-to-pod communication
kubectl apply -f k8s/network-policies/
```

---

### Phase 6: Pre-Deployment Testing (1 hour)

#### ☐ 17. Run Local Integration Tests
```bash
# Start services locally with docker-compose
docker-compose up -d

# Wait for services to be ready
sleep 30

# Run integration tests
npm run test:integration

# Expected: All tests passing ✅

# Cleanup
docker-compose down
```

#### ☐ 18. Run E2E Tests Locally
```bash
# Start full stack
docker-compose up -d

# Run E2E tests
npm run test:e2e

# Expected: All scenarios passing ✅

# Cleanup
docker-compose down
```

#### ☐ 19. Load Test Preparation (Optional)
```bash
# Install k6 (load testing tool)
# brew install k6  # macOS
# sudo apt install k6  # Ubuntu

# Create load test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
};

export default function () {
  let res = http.get('http://localhost:3000/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
EOF

# Run load test after deployment
# k6 run load-test.js
```

---

### Phase 7: Team Readiness (1-2 hours)

#### ☐ 20. Prepare Team Documentation
- [ ] Share `PRODUCTION_RELEASE_2.0.md` with team
- [ ] Share `QUICK_DEPLOY.md` for deployment steps
- [ ] Share API documentation at `/api-docs`
- [ ] Share Grafana dashboard URLs
- [ ] Share incident response procedures

#### ☐ 21. Conduct Deployment Dry Run
- [ ] Walk through deployment steps with team
- [ ] Assign roles (deployment lead, monitoring, communication)
- [ ] Test communication channels (Slack, email, phone)
- [ ] Review rollback procedures

#### ☐ 22. Schedule Deployment Window
- [ ] Choose low-traffic time (e.g., weekend, off-hours)
- [ ] Block calendar for 2-3 hours
- [ ] Notify stakeholders of deployment
- [ ] Prepare status page updates

---

## 🚀 Deployment Day Checklist

### Before Deployment

#### ☐ 1. Final Verifications
```bash
# Verify all secrets updated
grep -r "CHANGE_ME" k8s/
# Should return: no matches

# Verify kubectl context
kubectl config current-context
# Ensure this is your PRODUCTION cluster!

# Verify namespace is clean (or doesn't exist)
kubectl get namespace iac-platform
```

#### ☐ 2. Team Communication
- [ ] Notify team: "Deployment starting in 15 minutes"
- [ ] Open incident channel/room
- [ ] Start recording deployment timeline

### During Deployment (Use deploy-production.sh)

#### ☐ 3. Run Deployment Script
```bash
# Execute automated deployment
./deploy-production.sh

# Monitor output for errors
# Script will:
# 1. Run pre-flight checks
# 2. Validate configuration
# 3. Create backup
# 4. Deploy secrets
# 5. Deploy ConfigMaps
# 6. Deploy databases
# 7. Deploy backend services
# 8. Deploy frontend
# 9. Deploy ingress
# 10. Verify deployment
# 11. Run health checks
```

**Expected Duration**: 5-10 minutes

#### ☐ 4. Monitor Deployment Progress
```bash
# Watch pod status in another terminal
watch kubectl get pods -n iac-platform

# Check pod logs for errors
kubectl logs -f -n iac-platform deployment/api-gateway
```

#### ☐ 5. Initial Health Checks
```bash
# Wait for all pods to be Running
kubectl wait --for=condition=ready pod --all -n iac-platform --timeout=600s

# Check pod status
kubectl get pods -n iac-platform

# Expected: All pods in "Running" state with "1/1" ready
```

### Post-Deployment Verification

#### ☐ 6. Service Health Checks
```bash
# Test API Gateway
kubectl port-forward -n iac-platform svc/api-gateway 3000:3000 &
curl http://localhost:3000/health
# Expected: {"status":"healthy","service":"api-gateway",...}

# Test Frontend
kubectl port-forward -n iac-platform svc/frontend 5173:5173 &
curl http://localhost:5173
# Expected: HTML content returned

# Test other services
kubectl exec -n iac-platform deployment/api-gateway -- \
  curl -s http://blueprint-service:4002/health
kubectl exec -n iac-platform deployment/api-gateway -- \
  curl -s http://iac-generator:4001/health
# ... repeat for all services
```

#### ☐ 7. Database Connectivity
```bash
# Test PostgreSQL
kubectl exec -n iac-platform deployment/postgres -- \
  psql -U dharma_admin -d iac_dharma -c "SELECT 1;"
# Expected: Returns 1

# Test MongoDB
kubectl exec -n iac-platform deployment/mongodb -- \
  mongo iac_dharma --eval "db.stats()"
# Expected: Database statistics

# Test Redis
kubectl exec -n iac-platform deployment/redis -- \
  redis-cli PING
# Expected: PONG
```

#### ☐ 8. End-to-End Smoke Test
```bash
# Test complete user flow

# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"test123"}' \
  | jq .

# Expected: Returns token

# 2. Create blueprint (use token from step 1)
TOKEN="<your_token>"
curl -X POST http://localhost:3000/api/blueprints \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Test Blueprint",
    "cloudProvider": "aws",
    "resources": []
  }' | jq .

# Expected: Returns created blueprint

# 3. Generate IaC code
BLUEPRINT_ID="<blueprint_id_from_step_2>"
curl -X POST http://localhost:3000/api/iac/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"blueprintId\":\"$BLUEPRINT_ID\"}" \
  | jq .

# Expected: Returns Terraform code
```

#### ☐ 9. Monitoring Dashboard Check
```bash
# Access Grafana
kubectl port-forward -n iac-platform svc/grafana 3001:3001 &
open http://localhost:3001

# Login: admin / admin (change password on first login)
# Verify dashboards:
# - IAC Platform Overview
# - Service Health
# - Database Performance
# - API Performance
```

#### ☐ 10. Performance Verification
```bash
# Run load test
k6 run load-test.js

# Check metrics:
# - Response time < 2s (average)
# - Success rate > 99%
# - No errors or timeouts
```

---

## ✅ Go/No-Go Decision

### Go Criteria (All must be YES)
- [ ] All pods in Running state
- [ ] All services responding to health checks
- [ ] Database connectivity confirmed
- [ ] Frontend accessible
- [ ] API endpoints responding correctly
- [ ] Smoke tests passing
- [ ] Monitoring dashboards showing data
- [ ] No critical errors in logs
- [ ] Team ready to support

### No-Go Criteria (Any is YES → Rollback)
- [ ] Pods in CrashLoopBackOff
- [ ] Services not responding
- [ ] Database connection failures
- [ ] Frontend not loading
- [ ] Critical errors in logs
- [ ] Performance degradation
- [ ] Security vulnerabilities detected

---

## 🔴 Rollback Procedure

If deployment fails, follow these steps:

```bash
# 1. Stop deployment script if still running
Ctrl+C

# 2. Delete namespace
kubectl delete namespace iac-platform

# 3. Restore from backup (if previous version existed)
kubectl apply -f backups/pre-deployment-YYYYMMDD_HHMMSS/all-resources.yaml

# 4. Verify rollback successful
kubectl get pods -n iac-platform

# 5. Notify team of rollback
# Send message: "Deployment rolled back, investigating issues"
```

---

## 📊 Post-Deployment Tasks (First 24 Hours)

#### ☐ 1. Monitor Metrics
- [ ] Check Grafana dashboards every 2 hours
- [ ] Monitor error rates in Prometheus
- [ ] Review logs in Loki for anomalies
- [ ] Track response times and latency

#### ☐ 2. User Acceptance Testing
- [ ] Create test user accounts
- [ ] Test all critical workflows
- [ ] Verify multi-cloud deployments
- [ ] Test policy enforcement
- [ ] Validate cost estimates

#### ☐ 3. Performance Baseline
- [ ] Document initial metrics
- [ ] Record response times
- [ ] Note resource utilization
- [ ] Set up alerts for deviations

#### ☐ 4. Documentation Updates
- [ ] Update deployment documentation with actual timings
- [ ] Document any issues encountered
- [ ] Update runbooks with production URLs
- [ ] Create user onboarding guides

#### ☐ 5. Team Retrospective
- [ ] Hold post-deployment meeting
- [ ] Discuss what went well
- [ ] Identify improvement areas
- [ ] Update deployment procedures

---

## 📞 Support Contacts

### During Deployment
- **Deployment Lead**: [Name, Phone, Slack]
- **Kubernetes Admin**: [Name, Phone, Slack]
- **Database Admin**: [Name, Phone, Slack]
- **Security Lead**: [Name, Phone, Slack]

### Escalation Path
1. Deployment Lead → Engineering Manager
2. Engineering Manager → CTO
3. CTO → Executive Team

### External Support
- **Cloud Provider Support**: [Contact info]
- **Kubernetes Vendor**: [Contact info]
- **Database Vendor**: [Contact info]

---

## 🎯 Success Metrics (First Week)

Track these metrics daily:

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Uptime | 99.9% | ___ | ___ |
| Avg Response Time | <2s | ___ | ___ |
| Error Rate | <1% | ___ | ___ |
| Deployments Created | 10+ | ___ | ___ |
| Users Onboarded | 5+ | ___ | ___ |
| Policy Violations | 0 critical | ___ | ___ |
| Cost Savings | 10%+ | ___ | ___ |

---

## 📝 Deployment Sign-off

### Pre-Deployment Approval
- [ ] **Engineering Lead**: ___________________  Date: ______
- [ ] **Security Lead**: ___________________  Date: ______
- [ ] **Operations Lead**: ___________________  Date: ______

### Post-Deployment Verification
- [ ] **Deployment Lead**: ___________________  Date: ______
- [ ] **QA Lead**: ___________________  Date: ______
- [ ] **Product Owner**: ___________________  Date: ______

---

## 🚀 Ready to Deploy?

**If all checkboxes above are complete, you're ready to deploy!**

Run the deployment:
```bash
./deploy-production.sh
```

**Good luck! 🍀 You've got this! 💪**

---

**Document Version**: 1.0  
**Last Updated**: December 4, 2025  
**Platform Version**: 2.0.0  
**Status**: ✅ Ready for Production Deployment
