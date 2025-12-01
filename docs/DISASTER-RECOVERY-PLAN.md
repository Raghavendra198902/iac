# Disaster Recovery Plan for Dharma IAC Platform

## Overview
This document outlines the disaster recovery procedures for the Dharma IAC Platform, including recovery time objectives (RTO), recovery point objectives (RPO), and step-by-step recovery procedures.

## Recovery Objectives

### Recovery Time Objective (RTO)
- **Critical Services**: 2 hours
- **Non-Critical Services**: 4 hours
- **Full Platform**: 6 hours

### Recovery Point Objective (RPO)
- **Database**: 24 hours (daily backups)
- **Configuration**: 0 hours (version controlled)
- **Application State**: 24 hours

## Disaster Scenarios

### 1. Database Corruption or Loss
**Impact**: Complete database unavailability
**RTO**: 2 hours
**RPO**: 24 hours

#### Recovery Steps

1. **Assess the Situation**
   ```bash
   # Check database status
   kubectl get pods -n dharma -l app=postgres
   kubectl logs -n dharma postgres-pod
   
   # Test connectivity
   psql -h postgres.dharma -U postgres -d dharma -c "SELECT 1"
   ```

2. **Identify Latest Valid Backup**
   ```bash
   cd /path/to/backup-dr/scripts
   ./restore-database.sh --list
   ```

3. **Restore Database**
   ```bash
   # Interactive restoration
   ./restore-database.sh --interactive
   
   # Or specific backup
   ./restore-database.sh --backup dharma_dharma_20251116_020000.sql.gz.enc
   ```

4. **Verify Restoration**
   ```bash
   # Check table counts
   psql -h postgres.dharma -U postgres -d dharma -c \
     "SELECT schemaname, COUNT(*) FROM pg_tables WHERE schemaname = 'public' GROUP BY schemaname"
   
   # Check recent data
   psql -h postgres.dharma -U postgres -d dharma -c \
     "SELECT * FROM users ORDER BY created_at DESC LIMIT 5"
   ```

5. **Restart Dependent Services**
   ```bash
   kubectl rollout restart deployment -n dharma \
     api-gateway \
     blueprint-service \
     iac-generator \
     guardrails-engine
   ```

6. **Verify Platform Health**
   ```bash
   # Check all services are running
   kubectl get pods -n dharma
   
   # Test API endpoints
   curl http://api-gateway.dharma/health
   curl http://api-gateway.dharma/api/v1/blueprints
   ```

**Expected Duration**: 1-2 hours

---

### 2. Complete Kubernetes Cluster Failure
**Impact**: All services unavailable
**RTO**: 4 hours
**RPO**: 0 hours (infrastructure as code)

#### Recovery Steps

1. **Provision New Kubernetes Cluster**
   ```bash
   cd /path/to/terraform/environments/production
   
   # Initialize Terraform
   terraform init
   
   # Deploy EKS cluster
   terraform apply -target=module.eks
   
   # Configure kubectl
   aws eks update-kubeconfig --name dharma-prod --region us-west-2
   ```

2. **Deploy Base Infrastructure**
   ```bash
   # Apply Kubernetes manifests
   kubectl apply -f k8s/base/namespace.yml
   kubectl apply -f k8s/base/
   
   # Apply production overlays
   kubectl apply -k k8s/overlays/production/
   ```

3. **Restore Secrets and ConfigMaps**
   ```bash
   # Restore from AWS Secrets Manager
   cd /path/to/config
   ./secrets/manage-secrets.sh -e production -a get -n DB_PASSWORD
   
   # Create Kubernetes secrets
   kubectl create secret generic postgres-credentials \
     --from-literal=username=postgres \
     --from-literal=password=$DB_PASSWORD \
     -n dharma
   
   # Apply ConfigMaps
   kubectl apply -f config/k8s-configmap.yaml
   ```

4. **Deploy Monitoring Stack**
   ```bash
   cd /path/to/monitoring
   kubectl create namespace monitoring
   
   # Create ConfigMaps and Secrets
   kubectl create configmap prometheus-config \
     --from-file=prometheus/prometheus.yml -n monitoring
   
   # Deploy monitoring
   kubectl apply -f k8s-monitoring-stack.yml
   ```

5. **Restore Database**
   ```bash
   # Wait for PostgreSQL pod
   kubectl wait --for=condition=ready pod -l app=postgres -n dharma --timeout=300s
   
   # Restore database
   cd /path/to/backup-dr/scripts
   ./restore-database.sh --interactive
   ```

6. **Deploy Applications**
   ```bash
   # Deploy all microservices
   kubectl apply -f k8s/overlays/production/
   
   # Verify deployments
   kubectl get deployments -n dharma
   kubectl get pods -n dharma
   ```

7. **Verify Platform Health**
   ```bash
   # Check all pods are running
   kubectl get pods --all-namespaces
   
   # Test endpoints
   curl http://$(kubectl get svc api-gateway -n dharma -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')/health
   ```

**Expected Duration**: 3-4 hours

---

### 3. AWS Region Failure
**Impact**: Complete infrastructure unavailability in primary region
**RTO**: 6 hours
**RPO**: 24 hours

#### Recovery Steps

1. **Activate DR Region**
   ```bash
   # Switch to DR region (us-east-1)
   export AWS_DEFAULT_REGION=us-east-1
   
   # Deploy infrastructure in DR region
   cd /path/to/terraform/environments/dr
   terraform init
   terraform apply
   ```

2. **Restore Database from Cross-Region Backup**
   ```bash
   # List backups in DR region
   aws s3 ls s3://dharma-backups-dr/database/ --region us-east-1
   
   # Restore database
   export S3_BUCKET=dharma-backups-dr
   export AWS_DEFAULT_REGION=us-east-1
   ./restore-database.sh --interactive
   ```

3. **Update DNS**
   ```bash
   # Update Route53 to point to DR region
   aws route53 change-resource-record-sets \
     --hosted-zone-id Z1234567890ABC \
     --change-batch file://dns-failover.json
   ```

4. **Deploy Applications**
   ```bash
   # Configure kubectl for DR cluster
   aws eks update-kubeconfig --name dharma-dr --region us-east-1
   
   # Deploy applications
   kubectl apply -k k8s/overlays/production/
   ```

5. **Verify and Monitor**
   ```bash
   # Monitor deployment
   kubectl get pods -n dharma -w
   
   # Check Grafana dashboards
   # Verify error rates and latency
   ```

**Expected Duration**: 5-6 hours

---

### 4. Data Corruption (Logical)
**Impact**: Corrupted or deleted data requiring point-in-time recovery
**RTO**: 2 hours
**RPO**: 24 hours

#### Recovery Steps

1. **Identify Corruption Timeframe**
   ```bash
   # Query database logs
   kubectl logs -n dharma postgres-pod --tail=1000 | grep -i error
   
   # Check application logs
   kubectl logs -n dharma -l app=api-gateway --since=24h | grep -i "error\|exception"
   ```

2. **Select Backup Before Corruption**
   ```bash
   # List available backups
   ./restore-database.sh --list
   
   # Choose backup from before corruption occurred
   ```

3. **Restore to Test Environment**
   ```bash
   # Create test database
   export DB_NAME=dharma_test
   export DB_HOST=postgres-test.dharma
   
   # Restore backup
   ./restore-database.sh --backup dharma_dharma_20251115_020000.sql.gz.enc
   ```

4. **Export Affected Data**
   ```bash
   # Export specific tables or data
   pg_dump -h postgres-test.dharma -U postgres -d dharma_test \
     -t users -t blueprints \
     --data-only > recovered_data.sql
   ```

5. **Import to Production**
   ```bash
   # Import recovered data
   psql -h postgres.dharma -U postgres -d dharma < recovered_data.sql
   ```

6. **Verify Data Integrity**
   ```bash
   # Run data validation queries
   psql -h postgres.dharma -U postgres -d dharma -c \
     "SELECT COUNT(*) FROM users WHERE created_at >= '2025-11-15'"
   ```

**Expected Duration**: 2-3 hours

---

### 5. Complete Infrastructure Loss (Worst Case)
**Impact**: All AWS resources destroyed
**RTO**: 8 hours
**RPO**: 24 hours

#### Recovery Steps

1. **Bootstrap AWS Account**
   ```bash
   # Create S3 bucket for Terraform state
   aws s3 mb s3://dharma-terraform-state-new --region us-west-2
   
   # Enable versioning
   aws s3api put-bucket-versioning \
     --bucket dharma-terraform-state-new \
     --versioning-configuration Status=Enabled
   ```

2. **Deploy Infrastructure from Scratch**
   ```bash
   cd /path/to/terraform/environments/production
   
   # Update backend configuration
   # Edit backend.tf with new S3 bucket
   
   # Initialize and deploy
   terraform init
   terraform apply -auto-approve
   ```

3. **Follow Cluster Failure Recovery**
   - See "Complete Kubernetes Cluster Failure" steps above
   - Deploy all infrastructure components
   - Restore database
   - Deploy applications

4. **Restore Backups from Cross-Region**
   ```bash
   # Copy backups from DR region if primary region backups lost
   aws s3 sync s3://dharma-backups-dr/database/ s3://dharma-backups/database/ \
     --source-region us-east-1 \
     --region us-west-2
   ```

**Expected Duration**: 6-8 hours

---

## Backup Verification

### Daily Verification (Automated)
```bash
# Run backup verification script
./verify-backups.sh
```

**Checks**:
- Backup exists in S3
- Backup is less than 24 hours old
- Checksum verification passes
- Decryption test passes
- At least 7 backups retained

### Monthly DR Drill
1. Provision temporary test environment
2. Restore latest backup
3. Verify application functionality
4. Document any issues
5. Destroy test environment

**Schedule**: First Saturday of each month at 10 AM

---

## Contact Information

### On-Call Rotation
- **Primary**: ops-oncall@dharma.example.com
- **Secondary**: devops-team@dharma.example.com
- **Management**: engineering-lead@dharma.example.com

### Escalation Path
1. On-Call Engineer (15 minutes)
2. DevOps Team Lead (30 minutes)
3. Engineering Manager (1 hour)
4. CTO (2 hours)

### External Contacts
- **AWS Support**: Premium Support, Case Priority: Critical
- **Database Consultant**: dba@consultant.com
- **Security Team**: security@dharma.example.com

---

## Post-Incident Procedures

### 1. Incident Documentation
```markdown
# Incident Report

**Date/Time**: YYYY-MM-DD HH:MM UTC
**Duration**: X hours Y minutes
**Impact**: [Description]
**Root Cause**: [Analysis]
**Resolution**: [Steps taken]
**Lessons Learned**: [Improvements]
```

### 2. Post-Mortem Meeting
- Schedule within 48 hours
- Include all involved parties
- Review timeline
- Identify improvements
- Create action items

### 3. Update Documentation
- Update runbooks
- Revise disaster recovery plan
- Update contact information
- Document new procedures

### 4. Implement Improvements
- Fix root cause
- Improve monitoring
- Update alerting
- Enhance automation

---

## Testing Schedule

### Weekly
- Backup verification (automated)
- S3 connectivity test
- Encryption key test

### Monthly
- Full DR drill
- Restoration test
- Documentation review

### Quarterly
- Regional failover test
- Complete infrastructure rebuild
- Team training

---

## Backup Retention Policy

### Database Backups
- **Daily**: Retained for 30 days
- **Weekly**: Retained for 90 days (every Sunday)
- **Monthly**: Retained for 1 year (first of month)
- **Yearly**: Retained for 7 years (January 1st)

### Configuration Backups
- **Git Repository**: Indefinite (version controlled)
- **Kubernetes Resources**: 30 days (exported daily)
- **Secrets**: Not backed up (managed via AWS Secrets Manager)

### Storage Locations
- **Primary**: S3 (us-west-2) - `s3://dharma-backups/database/`
- **DR**: S3 (us-east-1) - `s3://dharma-backups-dr/database/`
- **Offline**: Glacier (long-term) - Automated after 90 days

---

## Monitoring and Alerting

### Backup Alerts
```yaml
- alert: BackupFailed
  expr: time() - backup_last_success_timestamp > 86400
  for: 1h
  severity: critical
  message: "Database backup has not completed in 24 hours"

- alert: BackupOld
  expr: time() - backup_last_success_timestamp > 172800
  for: 0m
  severity: critical
  message: "Database backup is over 48 hours old"

- alert: BackupSizeAnomaly
  expr: abs(backup_size_bytes - avg_over_time(backup_size_bytes[7d])) / avg_over_time(backup_size_bytes[7d]) > 0.5
  for: 0m
  severity: warning
  message: "Backup size deviated significantly from average"
```

### Recovery Testing Alerts
```yaml
- alert: NoRecentDRTest
  expr: time() - dr_test_last_success_timestamp > 2592000
  for: 0m
  severity: warning
  message: "DR drill has not been performed in 30 days"
```

---

## Appendix

### A. Backup Script Locations
- `/home/rrd/Documents/Iac/backup-dr/scripts/backup-database.sh`
- `/home/rrd/Documents/Iac/backup-dr/scripts/restore-database.sh`
- `/home/rrd/Documents/Iac/backup-dr/scripts/verify-backups.sh`

### B. Kubernetes Manifests
- `/home/rrd/Documents/Iac/backup-dr/k8s/backup-cronjobs.yml`
- `/home/rrd/Documents/Iac/k8s/overlays/production/`

### C. Terraform Modules
- `/home/rrd/Documents/Iac/terraform/modules/vpc/`
- `/home/rrd/Documents/Iac/terraform/modules/eks/`
- `/home/rrd/Documents/Iac/terraform/modules/rds/`

### D. Useful Commands
```bash
# Check backup status
kubectl get cronjobs -n dharma

# View backup logs
kubectl logs -n dharma -l app=database-backup --tail=100

# Manual backup trigger
kubectl create job --from=cronjob/database-backup manual-backup-$(date +%s) -n dharma

# List S3 backups
aws s3 ls s3://dharma-backups/database/ --recursive --human-readable

# Download specific backup
aws s3 cp s3://dharma-backups/database/dharma_dharma_20251116_020000.sql.gz.enc .
```

### E. Recovery Checklist
- [ ] Assess disaster scope and impact
- [ ] Notify stakeholders and team
- [ ] Identify required recovery procedures
- [ ] Execute recovery steps
- [ ] Verify restoration success
- [ ] Resume normal operations
- [ ] Document incident
- [ ] Schedule post-mortem
- [ ] Implement improvements
