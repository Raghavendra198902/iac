# GitHub Secrets Configuration Guide

**Version:** 1.0.0  
**Last Updated:** November 16, 2025  
**Purpose:** Configure required secrets for CI/CD pipelines

---

## Overview

This guide walks through setting up all required GitHub Secrets for the IAC Dharma CI/CD pipeline. Secrets are used to securely store sensitive credentials and configuration needed for deployments.

---

## Required Secrets

### 1. GITHUB_TOKEN (Automatic)

**Purpose:** GitHub provides this automatically for authentication with GitHub APIs and Container Registry.

**Action Required:** None - this is provided automatically by GitHub Actions.

**Used By:**
- All workflows for checking out code
- Docker image push to ghcr.io
- Creating releases

---

### 2. KUBE_CONFIG_DEV

**Purpose:** Kubernetes configuration for development environment

**Prerequisites:**
- Development Kubernetes cluster must be created (Task 14)
- kubectl CLI installed locally
- Access to development cluster

**Setup Steps:**

```bash
# 1. Verify you can access the dev cluster
kubectl get nodes

# 2. Export kubeconfig for dev cluster
kubectl config view --raw --minify --flatten > kubeconfig-dev.yaml

# 3. (Optional) Set specific context if you have multiple clusters
kubectl config use-context dev-cluster
kubectl config view --raw --minify --flatten > kubeconfig-dev.yaml

# 4. Encode to base64
cat kubeconfig-dev.yaml | base64 -w 0 > kubeconfig-dev.b64

# 5. Copy the base64 content
cat kubeconfig-dev.b64
# Copy the output to clipboard

# 6. Add to GitHub Secrets
# Go to: Settings → Secrets and variables → Actions → New repository secret
# Name: KUBE_CONFIG_DEV
# Value: Paste the base64 content
```

**Verification:**

```bash
# Test decoding works
cat kubeconfig-dev.b64 | base64 -d > test-decode.yaml
kubectl --kubeconfig=test-decode.yaml get nodes
rm test-decode.yaml kubeconfig-dev.yaml kubeconfig-dev.b64
```

**Security Notes:**
- Never commit kubeconfig files to git
- Rotate credentials every 90 days
- Use service accounts with minimal RBAC permissions
- Consider using OIDC instead of long-lived credentials

---

### 3. KUBE_CONFIG_STAGING

**Purpose:** Kubernetes configuration for staging environment

**Prerequisites:**
- Staging Kubernetes cluster created (Task 14)
- kubectl CLI installed
- Access to staging cluster

**Setup Steps:**

```bash
# 1. Switch to staging cluster context
kubectl config use-context staging-cluster

# 2. Verify access
kubectl get nodes

# 3. Export staging kubeconfig
kubectl config view --raw --minify --flatten > kubeconfig-staging.yaml

# 4. Encode to base64
cat kubeconfig-staging.yaml | base64 -w 0 > kubeconfig-staging.b64

# 5. Copy and add to GitHub Secrets as KUBE_CONFIG_STAGING
cat kubeconfig-staging.b64
```

**Production-Like Settings:**
- Use dedicated service account
- Limit permissions to staging namespace only
- Enable audit logging
- Set resource quotas

---

### 4. KUBE_CONFIG_PROD

**Purpose:** Kubernetes configuration for production environment

**Prerequisites:**
- Production Kubernetes cluster created (Task 14)
- kubectl CLI installed
- Production access granted (requires approval)

**Setup Steps:**

```bash
# 1. Switch to production cluster context
kubectl config use-context production-cluster

# 2. Verify access (read-only check first)
kubectl get nodes

# 3. Export production kubeconfig
kubectl config view --raw --minify --flatten > kubeconfig-prod.yaml

# 4. Encode to base64
cat kubeconfig-prod.yaml | base64 -w 0 > kubeconfig-prod.b64

# 5. Copy and add to GitHub Secrets as KUBE_CONFIG_PROD
cat kubeconfig-prod.b64
```

**CRITICAL Security Requirements:**
- ✅ Use dedicated service account with minimal permissions
- ✅ Enable audit logging for all production deployments
- ✅ Restrict to deployment operations only (no delete/edit cluster resources)
- ✅ Set up alerts for all production kubectl operations
- ✅ Rotate credentials monthly
- ✅ Require manual approval for all production deployments
- ✅ Use separate credentials for rollback operations

**Service Account RBAC Example:**

```yaml
# production-deploy-sa.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: github-actions-deployer
  namespace: production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deployer-role
  namespace: production
rules:
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets"]
  verbs: ["get", "list", "update", "patch"]
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployer-binding
  namespace: production
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: deployer-role
subjects:
- kind: ServiceAccount
  name: github-actions-deployer
  namespace: production
```

Apply this configuration:

```bash
kubectl apply -f production-deploy-sa.yaml
```

Get service account token:

```bash
# For Kubernetes 1.24+
kubectl create token github-actions-deployer -n production --duration=720h

# For older versions
kubectl get secret -n production $(kubectl get sa github-actions-deployer -n production -o jsonpath='{.secrets[0].name}') -o jsonpath='{.data.token}' | base64 -d
```

---

### 5. SNYK_TOKEN

**Purpose:** Authentication for Snyk security scanning

**Prerequisites:**
- Snyk account (free or paid)
- Access to Snyk dashboard

**Setup Steps:**

1. **Login to Snyk:**
   ```bash
   # Visit https://app.snyk.io/login
   ```

2. **Generate API Token:**
   - Go to: https://app.snyk.io/account
   - Navigate to "General" section
   - Find "Auth Token" section
   - Click "Click to show" to reveal token
   - Copy the token (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

3. **Add to GitHub Secrets:**
   - Go to: Repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SNYK_TOKEN`
   - Value: Paste your Snyk token
   - Click "Add secret"

**Alternative - Service Account (Recommended for Organizations):**

```bash
# Create service account in Snyk dashboard
# Settings → Service Accounts → Create new service account
# Name: "GitHub Actions CI"
# Role: "Org Admin" or "Org Collaborator"
# Copy the generated token
```

**Verification:**

```bash
# Test token locally
export SNYK_TOKEN="your-token-here"
snyk auth $SNYK_TOKEN
snyk test --all-projects
```

**Token Security:**
- Rotate every 90 days
- Use service accounts, not personal tokens
- Limit scope to necessary projects
- Monitor token usage in Snyk dashboard

---

### 6. SLACK_WEBHOOK

**Purpose:** Send deployment notifications to Slack

**Prerequisites:**
- Slack workspace admin access
- Channel for deployment notifications

**Setup Steps:**

1. **Create Slack App:**
   - Visit: https://api.slack.com/apps
   - Click "Create New App"
   - Choose "From scratch"
   - App Name: "IAC Dharma CI/CD"
   - Workspace: Select your workspace
   - Click "Create App"

2. **Enable Incoming Webhooks:**
   - In app settings, click "Incoming Webhooks"
   - Toggle "Activate Incoming Webhooks" to On
   - Click "Add New Webhook to Workspace"
   - Select channel (e.g., #deployments or #devops)
   - Click "Allow"

3. **Copy Webhook URL:**
   - You'll see a webhook URL like:
   ```
   https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
   ```
   - Copy this URL

4. **Add to GitHub Secrets:**
   - Name: `SLACK_WEBHOOK`
   - Value: Paste the webhook URL

**Test Webhook:**

```bash
# Test locally
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test deployment notification from IAC Dharma"}' \
  YOUR_WEBHOOK_URL
```

**Notification Format:**

The CI/CD pipeline sends notifications in this format:

```json
{
  "text": "🚀 Deployment Status",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Environment:* Production\n*Status:* Success ✅\n*Version:* v1.2.3\n*Deployer:* @username"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "View Logs"
          },
          "url": "https://github.com/owner/repo/actions/runs/123456"
        }
      ]
    }
  ]
}
```

**Channel Recommendations:**
- **#deployments** - All deployment notifications
- **#ci-failures** - Failed CI/CD runs only
- **#security-alerts** - Snyk vulnerability findings

---

### 7. VITE_API_URL (Optional)

**Purpose:** Configure frontend API endpoint for different environments

**Default Values:**
- Development: `http://localhost:3000`
- Staging: `https://api-staging.iacdharma.com`
- Production: `https://api.iacdharma.com`

**Setup Steps:**

```bash
# Add as environment-specific secrets:
# VITE_API_URL_DEV
# VITE_API_URL_STAGING
# VITE_API_URL_PROD
```

**Note:** This is typically configured per environment in GitHub Environments, not as a repository secret.

---

### 8. Cloud Provider Credentials (Optional - For Task 15)

These are needed when Terraform provisions cloud infrastructure:

#### AWS Credentials

```bash
# Name: AWS_ACCESS_KEY_ID
# Value: AKIAIOSFODNN7EXAMPLE

# Name: AWS_SECRET_ACCESS_KEY
# Value: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Name: AWS_REGION
# Value: us-east-1
```

#### GCP Credentials

```bash
# Create service account key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@project-id.iam.gserviceaccount.com

# Name: GCP_SA_KEY
# Value: Paste entire contents of key.json (base64 encoded)
cat key.json | base64 -w 0
```

#### Azure Credentials

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "github-actions-iacdharma" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth

# Name: AZURE_CREDENTIALS
# Value: Paste entire JSON output
```

---

## Secrets Configuration Checklist

### Immediate (Task 13):
- [ ] GITHUB_TOKEN (automatic ✅)
- [ ] SNYK_TOKEN
- [ ] SLACK_WEBHOOK

### After Kubernetes Setup (Task 14):
- [ ] KUBE_CONFIG_DEV
- [ ] KUBE_CONFIG_STAGING
- [ ] KUBE_CONFIG_PROD

### After Cloud Provider Selection (Task 15):
- [ ] AWS credentials OR
- [ ] GCP credentials OR
- [ ] Azure credentials

---

## Environment-Specific Configuration

GitHub Actions supports environment-specific secrets via **Environments**:

1. **Create Environments:**
   - Go to: Repository Settings → Environments
   - Click "New environment"
   - Create: `development`, `staging`, `production`

2. **Configure Environment Protection:**
   - **Development:** No protection (auto-deploy)
   - **Staging:** Required reviewers (1-2 people)
   - **Production:** Required reviewers (2+ people) + wait timer (5 min)

3. **Add Environment Secrets:**
   - Each environment can have its own secrets
   - Example: `VITE_API_URL` different per environment
   - Override repository-level secrets when needed

---

## Security Best Practices

### Secret Rotation Schedule

| Secret | Rotation Frequency | Responsibility |
|--------|-------------------|----------------|
| KUBE_CONFIG_DEV | 90 days | DevOps Team |
| KUBE_CONFIG_STAGING | 90 days | DevOps Team |
| KUBE_CONFIG_PROD | 30 days | Senior DevOps |
| SNYK_TOKEN | 90 days | Security Team |
| SLACK_WEBHOOK | 180 days | DevOps Team |
| Cloud Credentials | 90 days | Cloud Admin |

### Audit and Monitoring

```bash
# Check who has access to secrets
# Settings → Secrets → History (shows who viewed/modified)

# Monitor secret usage in workflow logs (values are masked)
# Actions → Workflow runs → View logs

# Set up alerts for:
# - Failed authentication attempts
# - Unexpected secret access
# - Secrets nearing expiration
```

### Emergency Secret Revocation

If a secret is compromised:

1. **Immediate Actions:**
   ```bash
   # 1. Delete the secret from GitHub
   # Settings → Secrets → Delete
   
   # 2. Revoke credentials at source
   # - Kubernetes: Delete service account
   # - Snyk: Revoke token
   # - Slack: Revoke webhook
   # - Cloud: Disable credentials
   ```

2. **Investigate:**
   - Check workflow logs for suspicious access
   - Review git history for accidental commits
   - Check container logs for credential leaks

3. **Recreate:**
   - Generate new credentials
   - Add new secret to GitHub
   - Test with manual workflow run
   - Document incident

---

## Verification Commands

After adding all secrets, verify they're configured correctly:

```bash
# 1. List configured secrets (names only, values are hidden)
gh secret list

# Expected output:
# GITHUB_TOKEN    (automatic)
# KUBE_CONFIG_DEV
# KUBE_CONFIG_STAGING  
# KUBE_CONFIG_PROD
# SNYK_TOKEN
# SLACK_WEBHOOK

# 2. Trigger a test workflow run
gh workflow run ci.yml

# 3. Monitor the run
gh run watch

# 4. Check for authentication errors
gh run view --log | grep -i "error\|failed\|unauthorized"
```

---

## Troubleshooting

### Common Issues

#### 1. "Error: Invalid kubeconfig"

**Symptoms:**
```
Error: unable to connect to cluster
Error: couldn't get current server API group list
```

**Solutions:**
```bash
# Verify kubeconfig is valid
echo $KUBE_CONFIG_DEV | base64 -d > test.yaml
kubectl --kubeconfig=test.yaml cluster-info

# Check expiration
kubectl --kubeconfig=test.yaml config view --raw | grep "expiry"

# Regenerate if expired
kubectl config view --raw --minify --flatten > new-kubeconfig.yaml
cat new-kubeconfig.yaml | base64 -w 0
```

#### 2. "Snyk authentication failed"

**Symptoms:**
```
Error: Authentication failed. Please check your Snyk token
```

**Solutions:**
```bash
# Verify token format (should be UUID)
echo $SNYK_TOKEN | grep -E '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'

# Test token locally
snyk auth $SNYK_TOKEN
snyk test --all-projects

# Regenerate if invalid
# https://app.snyk.io/account → Generate new token
```

#### 3. "Slack webhook failed"

**Symptoms:**
```
Error: Failed to send notification to Slack
HTTP 404: channel_not_found
```

**Solutions:**
```bash
# Test webhook manually
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  $SLACK_WEBHOOK

# Common issues:
# - Webhook revoked (regenerate in Slack app settings)
# - Channel archived (create new webhook for active channel)
# - App permissions changed (reinstall app to workspace)
```

#### 4. "Secret not available in workflow"

**Symptoms:**
```
Error: secrets.KUBE_CONFIG_DEV is undefined
```

**Solutions:**
```bash
# 1. Check secret exists
gh secret list | grep KUBE_CONFIG_DEV

# 2. Verify secret name matches exactly (case-sensitive)
# In workflow: ${{ secrets.KUBE_CONFIG_DEV }}

# 3. Check environment restrictions
# Settings → Environments → Check if secret is environment-specific

# 4. Verify repository permissions
# Settings → Actions → General → Workflow permissions
# Should be: "Read and write permissions"
```

---

## Next Steps

After configuring all secrets:

1. ✅ **Test CI Workflow:**
   ```bash
   # Create test PR
   git checkout -b test/ci-pipeline
   echo "# Test CI" >> README.md
   git add README.md
   git commit -m "test: verify CI pipeline"
   git push origin test/ci-pipeline
   
   # Create PR and watch CI run
   gh pr create --title "Test CI Pipeline" --body "Testing automated CI"
   gh pr checks --watch
   ```

2. ✅ **Verify Security Scanning:**
   - Check Snyk scan results in GitHub Actions
   - Review Security tab for vulnerabilities
   - Ensure no critical issues block merges

3. ✅ **Test Slack Notifications:**
   - Verify messages appear in configured channel
   - Check notification format
   - Confirm links to workflow runs work

4. ⏭️ **Proceed to Task 14:** Kubernetes setup
   - Use kubeconfig secrets for deployments
   - Test CD workflow once clusters are ready

---

## Reference Links

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Kubernetes RBAC Documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [Snyk API Token Guide](https://docs.snyk.io/snyk-api-info/authentication-for-api)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [GitHub CLI Secret Commands](https://cli.github.com/manual/gh_secret)

---

**Document Status:** ✅ Complete  
**Last Review:** November 16, 2025  
**Next Review:** December 16, 2025  
**Owner:** DevOps Team
