# CI/CD Pipeline Documentation

## Overview

IAC Dharma uses a comprehensive CI/CD pipeline with GitHub Actions for automated testing, security scanning, building, and deployment.

## Pipeline Components

### 1. Main CI/CD Workflow (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
1. **Security Scan** - Snyk vulnerability scanning
2. **Backend Tests** - Unit tests for all backend services
3. **Frontend Tests** - Frontend tests and build
4. **Docker Build** - Build and test Docker images
5. **Deploy Dev** - Deploy to development environment
6. **Deploy Prod** - Deploy to production (main branch only)

### 2. Performance Tests Workflow (`.github/workflows/performance-tests.yml`)

**Triggers:**
- Scheduled: Daily at 2 AM UTC
- Manual trigger with custom target URL

**Tests:**
- **k6 Load Tests** - API load testing with ramp-up scenarios
- **Lighthouse** - Frontend performance audits
- **Artillery Benchmarks** - API benchmarking
- **Database Performance** - Query performance testing

### 3. Security Audit Workflow (`.github/workflows/security-audit.yml`)

**Triggers:**
- Scheduled: Weekly on Sundays at 3 AM UTC
- Manual trigger

**Scans:**
- **Dependency Check** - npm audit for all services
- **Container Scan** - Trivy vulnerability scanning
- **Secrets Scan** - Gitleaks and TruffleHog
- **Code Quality** - SonarCloud analysis
- **SAST** - Semgrep security testing
- **License Check** - License compliance verification

## Smoke Tests

### Running Smoke Tests

```bash
# Local testing
./tests/smoke-test.sh http://localhost:3000

# Staging environment
./tests/smoke-test.sh https://staging.iac-dharma.com

# Production environment
./tests/smoke-test.sh https://iac-dharma.com
```

### Test Coverage

1. ✅ Health check endpoint
2. ✅ Readiness check
3. ✅ API Gateway response
4. ✅ Circuit breakers functionality
5. ✅ Cache operations
6. ✅ Rate limiting configuration
7. ✅ Database connectivity
8. ✅ Redis connectivity

## Performance Testing

### k6 Load Tests

```bash
# Install k6
brew install k6  # macOS
# OR
sudo apt install k6  # Ubuntu

# Run load test
k6 run tests/load/api-load-test.js --env TARGET_URL=https://staging.iac-dharma.com
```

**Load Profile:**
- Ramp-up: 0 → 10 users (30s)
- Ramp-up: 10 → 50 users (1m)
- Sustained: 50 users (3m)
- Ramp-up: 50 → 100 users (1m)
- Sustained: 100 users (3m)
- Ramp-down: 100 → 0 users (30s)

**Performance Thresholds:**
- P95 response time: < 500ms
- P99 response time: < 1000ms
- Error rate: < 1%

### Artillery Benchmarks

```bash
# Install Artillery
npm install -g artillery

# Run benchmark
artillery run tests/load/api-benchmark.yml --environment staging

# Generate HTML report
artillery report report.json --output report.html
```

## Deployment Process

### Development Environment

**Automatic Deployment:**
- Trigger: Push to `develop` branch
- Target: Kubernetes cluster (dev namespace)
- No approval required

### Production Environment

**Manual Approval Required:**
- Trigger: Push to `main` branch
- Requires: Manual approval in GitHub Actions
- Target: Kubernetes cluster (prod namespace)

**Deployment Steps:**
1. Build and test all services
2. Security scan passes
3. Docker images pushed to registry
4. Staging deployment
5. Smoke tests on staging
6. Manual approval gate
7. Blue-green production deployment
8. Health verification
9. Traffic switch to new version
10. Monitoring period (5 minutes)
11. Final smoke tests

### Blue-Green Deployment

```bash
# Current deployment color
kubectl get svc api-gateway-active -n iac-production -o jsonpath='{.spec.selector.color}'

# Deploy to inactive color (automated)
# Switch traffic (automated after verification)
# Rollback (automated on failure)
```

## Required Secrets

### GitHub Secrets

```bash
# Docker Registry
DOCKER_USERNAME=your-docker-username
DOCKER_TOKEN=your-docker-token

# Kubernetes
KUBE_CONFIG_DEV=base64-encoded-kubeconfig-dev
KUBE_CONFIG_STAGING=base64-encoded-kubeconfig-staging
KUBE_CONFIG_PRODUCTION=base64-encoded-kubeconfig-prod

# Security Scanning
SNYK_TOKEN=your-snyk-token
SONAR_TOKEN=your-sonar-token

# Optional
SLACK_WEBHOOK=your-slack-webhook
```

### Setting Secrets

```bash
# GitHub CLI
gh secret set DOCKER_USERNAME --body "your-username"
gh secret set KUBE_CONFIG_DEV --body "$(cat ~/.kube/config | base64)"

# Or via GitHub UI:
# Repository Settings → Secrets and variables → Actions → New repository secret
```

## Monitoring and Alerts

### Build Status Badges

Add to README.md:

```markdown
[![CI/CD](https://github.com/your-org/iac/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-org/iac/actions/workflows/ci-cd.yml)
[![Security](https://github.com/your-org/iac/actions/workflows/security-audit.yml/badge.svg)](https://github.com/your-org/iac/actions/workflows/security-audit.yml)
[![Performance](https://github.com/your-org/iac/actions/workflows/performance-tests.yml/badge.svg)](https://github.com/your-org/iac/actions/workflows/performance-tests.yml)
```

### Notifications

Configure Slack notifications:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

## Rollback Procedures

### Automatic Rollback

Triggers automatic rollback:
- Smoke tests fail
- Health checks fail
- Error rate exceeds threshold

### Manual Rollback

```bash
# Kubernetes rollback
kubectl rollout undo deployment/api-gateway -n iac-production

# Or switch back to previous color
PREVIOUS_COLOR=$([ "$CURRENT_COLOR" == "blue" ] && echo "green" || echo "blue")
kubectl patch svc api-gateway-active -n iac-production \
  -p '{"spec":{"selector":{"color":"'$PREVIOUS_COLOR'"}}}'
```

## Best Practices

### Before Merging PR

1. ✅ All tests pass locally
2. ✅ Code reviewed and approved
3. ✅ CI checks pass
4. ✅ No security vulnerabilities
5. ✅ Documentation updated

### For Production Deployment

1. ✅ Merged to main via PR
2. ✅ Staging deployed and tested
3. ✅ Smoke tests passing
4. ✅ Performance benchmarks acceptable
5. ✅ Security scan clean
6. ✅ Stakeholders notified
7. ✅ Monitoring ready
8. ✅ Rollback plan confirmed

### Monitoring After Deployment

**First 5 minutes:**
- Watch application logs
- Monitor error rates
- Check response times
- Verify health checks

**First hour:**
- Monitor resource usage
- Check database queries
- Verify cache hit rates
- Review circuit breaker status

**First day:**
- Analyze user feedback
- Review performance metrics
- Check rate limit usage
- Verify all features working

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check workflow logs
gh run view <run-id> --log

# Re-run failed jobs
gh run rerun <run-id> --failed
```

**Deployment Failures:**
```bash
# Check pod status
kubectl get pods -n iac-production

# View pod logs
kubectl logs deployment/api-gateway -n iac-production --tail=100

# Describe pod for events
kubectl describe pod <pod-name> -n iac-production
```

**Performance Issues:**
```bash
# Check resource usage
kubectl top pods -n iac-production

# Scale deployment
kubectl scale deployment api-gateway -n iac-production --replicas=5
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [k6 Documentation](https://k6.io/docs/)
- [Artillery Documentation](https://www.artillery.io/docs)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Blue-Green Deployments](https://martinfowler.com/bliki/BlueGreenDeployment.html)
