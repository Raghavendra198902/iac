# CI/CD Pipeline Guide

**Version:** 1.0.0  
**Last Updated:** November 16, 2024  
**Phase:** 6 - Deployment & DevOps

---

## Overview

The IAC Dharma platform uses GitHub Actions for CI/CD automation. The pipeline includes automated testing, security scanning, Docker image building, and multi-environment deployments.

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Repository                      │
│                  (Source Code + Workflows)               │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│  Pull Request   │         │   Push to main   │
│  ============   │         │   =============  │
│  - Lint         │         │   - All PR checks│
│  - Tests        │         │   - Build images │
│  - Build check  │         │   - Deploy dev   │
│  - Security     │         │   - (Optional)   │
│  - Coverage     │         │     Staging/Prod │
└─────────────────┘         └──────────────────┘
         │                           │
         └─────────────┬─────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Container Registry  │
            │   (ghcr.io/OWNER)   │
            │                      │
            │  - Images tagged     │
            │  - Scanned for vulns │
            │  - Ready for deploy  │
            └──────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Development  │ │   Staging    │ │  Production  │
│  (Auto)      │ │  (Manual)    │ │  (Manual)    │
│              │ │              │ │              │
│ Kubernetes   │ │ Kubernetes   │ │ Kubernetes   │
│ Cluster      │ │ Cluster      │ │ Cluster      │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Workflows

### 1. Continuous Integration (ci.yml)

**Trigger:** Push to any branch, Pull Requests to main/develop

**Jobs:**

#### Lint (3-5 minutes)
- ESLint for code quality
- Prettier formatting check
- TypeScript type checking

#### Security (5-10 minutes)
- Snyk vulnerability scanning
- npm audit for dependencies
- SAST (Static Application Security Testing)

#### Integration Tests (10-15 minutes)
- PostgreSQL + Redis services
- 81 integration tests
- Database migrations
- Test result upload

#### Build Check (10-15 minutes)
- Verify Docker images build
- Multi-service matrix build
- Build cache optimization
- No image push (dry-run)

#### Coverage (10-15 minutes)
- Run tests with coverage
- Generate coverage reports
- Upload to Codecov
- Coverage threshold check

**Success Criteria:** All jobs must pass

---

### 2. Continuous Deployment (cd.yml)

**Trigger:** 
- Push to main (auto-deploy to dev)
- Manual workflow dispatch (staging/prod)

**Jobs:**

#### Build and Push (20-30 minutes)
- Build all service images
- Push to Container Registry
- Tag with version/SHA
- Security scanning (Trivy)

#### Deploy to Development (5-10 minutes)
- **Automatic** on main branch push
- Update Kubernetes manifests
- Rolling deployment
- Health check verification
- Slack notification

#### Deploy to Staging (10-15 minutes)
- **Manual approval required**
- Deploy to staging cluster
- Run integration tests
- Performance validation
- Slack notification

#### Deploy to Production (15-20 minutes)
- **Manual approval required**
- Database backup creation
- Blue-green deployment
- Traffic switch
- Smoke tests
- GitHub Release creation
- Slack notification

#### Rollback (2-5 minutes)
- **Automatic on failure**
- Revert to previous version
- Health check verification
- Incident notification

---

### 3. Docker Build (docker-build.yml)

**Trigger:** Push to main/develop, version tags

**Jobs:**

#### Build Matrix (15-20 minutes per service)
- Parallel builds for all services
- Docker Buildx multi-platform
- Image caching
- Vulnerability scanning
- Security report upload

#### Build Frontend (10-15 minutes)
- Production build with Vite
- Environment variable injection
- Static asset optimization
- CDN-ready output

---

## Environment Setup

### Required Secrets

Configure these in GitHub Settings → Secrets and variables → Actions:

```yaml
# Container Registry
GITHUB_TOKEN: (Automatically provided by GitHub)

# Kubernetes Clusters
KUBE_CONFIG_DEV: Base64-encoded kubeconfig for dev
KUBE_CONFIG_STAGING: Base64-encoded kubeconfig for staging
KUBE_CONFIG_PROD: Base64-encoded kubeconfig for production

# Security Scanning
SNYK_TOKEN: Snyk API token for vulnerability scanning

# Notifications
SLACK_WEBHOOK: Slack webhook URL for notifications

# Frontend Configuration
VITE_API_URL: API endpoint for frontend

# Optional: Cloud Provider Credentials
AWS_ACCESS_KEY_ID: (If using AWS)
AWS_SECRET_ACCESS_KEY: (If using AWS)
GCP_SA_KEY: (If using GCP)
AZURE_CREDENTIALS: (If using Azure)
```

### Setting Up Secrets

**1. Create Kubernetes Config Secret:**
```bash
# Get your kubeconfig
kubectl config view --raw > kubeconfig-dev.yaml

# Base64 encode it
cat kubeconfig-dev.yaml | base64 -w 0 > kubeconfig-dev.b64

# Copy the output and add to GitHub Secrets as KUBE_CONFIG_DEV
cat kubeconfig-dev.b64
```

**2. Generate Snyk Token:**
```bash
# Visit https://app.snyk.io/account
# Generate a service account token
# Add to GitHub Secrets as SNYK_TOKEN
```

**3. Create Slack Webhook:**
```bash
# Go to https://api.slack.com/apps
# Create a new app
# Enable Incoming Webhooks
# Create webhook URL for your channel
# Add to GitHub Secrets as SLACK_WEBHOOK
```

---

## Usage Guide

### Running CI on Pull Requests

CI runs automatically on all PRs. To ensure success:

```bash
# Before creating PR, run locally:

# 1. Lint check
cd backend/api-gateway && npm run lint

# 2. Run tests
cd tests/integration && npm test

# 3. Build check
docker-compose build

# 4. Security audit
npm audit
```

### Deploying to Development

Development deploys automatically on merge to main:

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR
git push origin feature/my-feature

# 4. After approval and merge, dev deployment is automatic
# Monitor in GitHub Actions tab
```

### Deploying to Staging

Staging requires manual approval:

```bash
# 1. Go to GitHub Actions tab
# 2. Select "Continuous Deployment" workflow
# 3. Click "Run workflow"
# 4. Select environment: "staging"
# 5. Optional: specify version tag
# 6. Click "Run workflow"
# 7. Approve deployment when prompted
```

### Deploying to Production

Production requires careful process:

```bash
# 1. Ensure staging deployment is successful
# 2. Verify staging tests pass
# 3. Go to GitHub Actions tab
# 4. Select "Continuous Deployment" workflow
# 5. Click "Run workflow"
# 6. Select environment: "production"
# 7. Specify version tag (recommended)
# 8. Click "Run workflow"
# 9. Wait for approval request
# 10. Review deployment plan
# 11. Approve production deployment
# 12. Monitor deployment progress
# 13. Verify production health checks
```

---

## Monitoring Deployments

### GitHub Actions UI

1. Go to repository → Actions tab
2. Select workflow run
3. View job progress in real-time
4. Check logs for each step
5. Download artifacts if needed

### Kubernetes Monitoring

```bash
# Watch deployment progress
kubectl get pods -n <environment> -w

# Check deployment status
kubectl rollout status deployment/api-gateway -n <environment>

# View logs
kubectl logs -f deployment/api-gateway -n <environment>

# Check services
kubectl get svc -n <environment>
```

### Slack Notifications

Deployment notifications sent to Slack include:
- Deployment status (success/failure)
- Environment
- Commit SHA
- Author
- Direct links to workflow and deployment

---

## Troubleshooting

### Build Failures

**Problem:** Docker build fails

**Solutions:**
```bash
# 1. Check Dockerfile syntax
docker build -t test ./backend/api-gateway

# 2. Verify dependencies
cd backend/api-gateway && npm install

# 3. Check for missing files
git status
```

### Test Failures

**Problem:** Integration tests fail in CI

**Solutions:**
```bash
# 1. Run tests locally
cd tests/integration
docker-compose up -d postgres redis
npm test

# 2. Check database connection
psql -h localhost -U iacdharma -d iacdharma_test

# 3. Review test logs in GitHub Actions
```

### Deployment Failures

**Problem:** Kubernetes deployment fails

**Solutions:**
```bash
# 1. Check pod status
kubectl get pods -n <environment>

# 2. View pod logs
kubectl logs <pod-name> -n <environment>

# 3. Describe pod for events
kubectl describe pod <pod-name> -n <environment>

# 4. Check resource limits
kubectl top pods -n <environment>

# 5. Verify secrets and configs
kubectl get secrets -n <environment>
kubectl get configmaps -n <environment>
```

### Rollback Deployment

**Automatic Rollback:** Triggered on deployment failure

**Manual Rollback:**
```bash
# 1. Via kubectl
kubectl rollout undo deployment/api-gateway -n <environment>

# 2. Verify rollback
kubectl rollout status deployment/api-gateway -n <environment>

# 3. Or redeploy previous version via GitHub Actions
# Select previous commit SHA or version tag
```

---

## Best Practices

### 1. Branch Strategy

```
main (production-ready)
├── develop (integration branch)
│   ├── feature/user-auth
│   ├── feature/new-endpoint
│   └── bugfix/rate-limiting
└── hotfix/critical-bug (emergency fixes)
```

### 2. Commit Messages

Follow Conventional Commits:
```
feat: add user authentication endpoint
fix: resolve rate limiting issue
docs: update API documentation
chore: update dependencies
test: add integration tests for auth
```

### 3. Pull Request Process

1. Create feature branch from develop
2. Make changes and commit
3. Push and create PR to develop
4. Wait for CI checks (must pass)
5. Request code review
6. Address review comments
7. Merge to develop after approval
8. Periodically merge develop to main

### 4. Deployment Strategy

**Development:**
- Auto-deploy on every main push
- Use for testing and validation
- Can break without impact

**Staging:**
- Manual deploy before production
- Must be production-like
- Run full test suite
- Validate performance

**Production:**
- Manual deploy with approval
- Use blue-green deployment
- Create backup before deploy
- Monitor closely after deploy
- Have rollback plan ready

### 5. Version Tagging

```bash
# Tag releases in main branch
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Semantic versioning
v1.0.0 - Major release
v1.1.0 - Minor release (new features)
v1.1.1 - Patch release (bug fixes)
```

---

## Performance Optimization

### Build Cache

Docker builds use GitHub Actions cache:
- Speeds up builds by 50-70%
- Automatic cache invalidation
- Separate cache per service

### Parallel Execution

Workflows use matrix strategy:
- All services build in parallel
- Reduces total build time
- Independent failure handling

### Conditional Execution

```yaml
# Only run on specific conditions
if: github.event_name != 'pull_request'
if: github.ref == 'refs/heads/main'
if: success()  # Only if previous jobs succeeded
if: failure()  # Only if previous jobs failed
```

---

## Security

### Image Scanning

All images scanned with Trivy:
- Detects critical/high vulnerabilities
- Results uploaded to GitHub Security
- Blocks deployment on critical findings

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Use environment-specific secrets

### RBAC

Kubernetes RBAC limits deployment access:
- Service accounts for automation
- Namespace isolation
- Role-based permissions

---

## Metrics & SLOs

### CI Pipeline Metrics

```yaml
Build Time Target: < 15 minutes
Test Success Rate: > 99%
Build Success Rate: > 95%
Pipeline Availability: > 99.9%
```

### Deployment Metrics

```yaml
Deployment Frequency: Daily (dev), Weekly (prod)
Lead Time: < 30 minutes
Change Failure Rate: < 5%
Time to Restore: < 1 hour
```

### Monitoring

- Track pipeline success rates
- Monitor deployment duration
- Alert on repeated failures
- Analyze failure patterns

---

## Future Enhancements

### Planned Improvements

1. **Advanced Testing**
   - E2E tests in CI
   - Performance benchmarks
   - Chaos engineering tests

2. **Enhanced Security**
   - Image signing
   - SBOM generation
   - Runtime security scanning

3. **Deployment Features**
   - Canary deployments
   - Feature flags
   - Progressive rollouts

4. **Observability**
   - Distributed tracing in CI
   - Build analytics
   - Deployment metrics dashboard

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)

---

## Support

**Questions?** Contact the DevOps team

**Issues?** Create a GitHub issue with `ci/cd` label

**Emergency?** Page on-call engineer via PagerDuty

---

**Last Updated:** November 16, 2024  
**Version:** 1.0.0  
**Maintained by:** DevOps Team
