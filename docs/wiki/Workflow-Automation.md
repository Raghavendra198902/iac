# Workflow Automation

Complete guide to automating infrastructure workflows with CI/CD integration in IAC Dharma.

---

## 📋 Overview

IAC Dharma provides powerful workflow automation capabilities:

- **CI/CD Integration**: GitHub Actions, GitLab CI, Jenkins, CircleCI
- **GitOps Workflows**: Git-based infrastructure management
- **Approval Workflows**: Multi-stage approvals with notifications
- **Scheduled Jobs**: Cron-based automation
- **Event-Driven**: Webhook triggers and event handlers
- **Pipeline Templates**: Pre-built workflow templates

---

## 🔄 GitOps Workflow

### Repository Structure

```
infrastructure/
├── .github/
│   └── workflows/
│       ├── plan.yml              # PR validation
│       ├── apply.yml             # Deployment
│       └── destroy.yml           # Cleanup
├── blueprints/
│   ├── production/
│   │   ├── vpc.yml
│   │   ├── eks.yml
│   │   └── rds.yml
│   ├── staging/
│   │   └── ...
│   └── development/
│       └── ...
├── environments/
│   ├── production.yml
│   ├── staging.yml
│   └── development.yml
└── .iac-dharma/
    ├── config.yml
    └── workflows/
        └── custom-workflow.yml
```

### GitHub Actions Integration

**Pull Request Validation** (`.github/workflows/plan.yml`):

```yaml
name: IAC Dharma Plan

on:
  pull_request:
    paths:
      - 'blueprints/**'
      - 'environments/**'

jobs:
  plan:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install IAC Dharma
        run: npm install -g @raghavendra198902/iac-dharma
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: IAC Dharma Plan
        id: plan
        run: |
          iac-dharma plan \
            --environment staging \
            --output plan.json \
            --detailed
        env:
          IAC_DHARMA_API_URL: ${{ secrets.IAC_DHARMA_API_URL }}
          IAC_DHARMA_API_TOKEN: ${{ secrets.IAC_DHARMA_API_TOKEN }}
      
      - name: Post plan to PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const plan = JSON.parse(fs.readFileSync('plan.json', 'utf8'));
            
            const comment = `
            ## IAC Dharma Plan Results
            
            **Environment**: staging
            **Changes**: ${plan.changes.length}
            
            ### Resources to Create: ${plan.toCreate.length}
            ${plan.toCreate.map(r => `- ${r.type}: ${r.name}`).join('\n')}
            
            ### Resources to Update: ${plan.toUpdate.length}
            ${plan.toUpdate.map(r => `- ${r.type}: ${r.name}`).join('\n')}
            
            ### Resources to Delete: ${plan.toDelete.length}
            ${plan.toDelete.map(r => `- ${r.type}: ${r.name}`).join('\n')}
            
            **Estimated Cost Impact**: ${plan.costImpact}
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
      
      - name: Security scan
        run: |
          iac-dharma scan \
            --blueprints blueprints/staging \
            --output security-report.json
      
      - name: Compliance check
        run: |
          iac-dharma compliance scan \
            --blueprints blueprints/staging \
            --framework HIPAA,PCI-DSS \
            --fail-on-violation
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: plan-output
          path: |
            plan.json
            security-report.json
```

**Deployment Workflow** (`.github/workflows/apply.yml`):

```yaml
name: IAC Dharma Apply

on:
  push:
    branches:
      - main
    paths:
      - 'blueprints/**'
      - 'environments/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Requires approval
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install IAC Dharma
        run: npm install -g @raghavendra198902/iac-dharma
      
      - name: Configure credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Pre-deployment checks
        run: |
          # Validate blueprints
          iac-dharma validate --blueprints blueprints/production
          
          # Check drift
          iac-dharma drift detect --environment production
      
      - name: Deploy infrastructure
        id: deploy
        run: |
          iac-dharma deploy \
            --environment production \
            --blueprints blueprints/production \
            --auto-approve \
            --parallel 5 \
            --output deployment.json
        env:
          IAC_DHARMA_API_URL: ${{ secrets.IAC_DHARMA_API_URL }}
          IAC_DHARMA_API_TOKEN: ${{ secrets.IAC_DHARMA_API_TOKEN }}
      
      - name: Post-deployment validation
        run: |
          # Health check
          iac-dharma health-check --environment production
          
          # Smoke tests
          iac-dharma test smoke --environment production
      
      - name: Send notification
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deployment ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Status*: ${{ job.status }}\n*Environment*: production\n*Commit*: ${{ github.sha }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      
      - name: Upload deployment logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: deployment-logs
          path: |
            deployment.json
            logs/
```

### GitLab CI Integration

**GitLab CI Configuration** (`.gitlab-ci.yml`):

```yaml
stages:
  - validate
  - plan
  - deploy
  - cleanup

variables:
  IAC_DHARMA_VERSION: "latest"
  NODE_VERSION: "20"

.iac_dharma_setup:
  before_script:
    - apt-get update && apt-get install -y nodejs npm
    - npm install -g @raghavendra198902/iac-dharma@$IAC_DHARMA_VERSION
    - iac-dharma --version

validate:
  stage: validate
  extends: .iac_dharma_setup
  script:
    - iac-dharma validate --blueprints blueprints/
    - iac-dharma scan --blueprints blueprints/ --fail-on-high
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

plan:staging:
  stage: plan
  extends: .iac_dharma_setup
  script:
    - iac-dharma plan --environment staging --output plan-staging.json
  artifacts:
    paths:
      - plan-staging.json
    expire_in: 1 week
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  environment:
    name: staging
    action: prepare

deploy:staging:
  stage: deploy
  extends: .iac_dharma_setup
  script:
    - iac-dharma deploy --environment staging --auto-approve
  rules:
    - if: '$CI_COMMIT_BRANCH == "develop"'
  environment:
    name: staging
    url: https://staging.example.com

plan:production:
  stage: plan
  extends: .iac_dharma_setup
  script:
    - iac-dharma plan --environment production --output plan-production.json
  artifacts:
    paths:
      - plan-production.json
    expire_in: 1 month
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
  environment:
    name: production
    action: prepare

deploy:production:
  stage: deploy
  extends: .iac_dharma_setup
  script:
    - iac-dharma deploy --environment production --auto-approve
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
      when: manual  # Requires manual approval
  environment:
    name: production
    url: https://production.example.com

cleanup:
  stage: cleanup
  extends: .iac_dharma_setup
  script:
    - iac-dharma cleanup --older-than 30d
  rules:
    - if: '$CI_PIPELINE_SOURCE == "schedule"'
```

---

## 🔧 Jenkins Integration

### Jenkins Pipeline

**Jenkinsfile**:

```groovy
pipeline {
    agent any
    
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'production'], description: 'Deployment environment')
        choice(name: 'ACTION', choices: ['plan', 'apply', 'destroy'], description: 'Action to perform')
        booleanParam(name: 'AUTO_APPROVE', defaultValue: false, description: 'Auto-approve changes')
    }
    
    environment {
        IAC_DHARMA_API_URL = credentials('iac-dharma-api-url')
        IAC_DHARMA_API_TOKEN = credentials('iac-dharma-api-token')
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
    }
    
    stages {
        stage('Setup') {
            steps {
                script {
                    sh '''
                        npm install -g @raghavendra198902/iac-dharma
                        iac-dharma --version
                    '''
                }
            }
        }
        
        stage('Validate') {
            steps {
                script {
                    sh """
                        iac-dharma validate \
                            --blueprints blueprints/${params.ENVIRONMENT}
                    """
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    sh """
                        iac-dharma scan \
                            --blueprints blueprints/${params.ENVIRONMENT} \
                            --output security-scan.json
                    """
                }
            }
        }
        
        stage('Plan') {
            when {
                expression { params.ACTION == 'plan' || params.ACTION == 'apply' }
            }
            steps {
                script {
                    sh """
                        iac-dharma plan \
                            --environment ${params.ENVIRONMENT} \
                            --output plan.json \
                            --detailed
                    """
                }
            }
        }
        
        stage('Approval') {
            when {
                allOf {
                    expression { params.ACTION == 'apply' }
                    expression { params.ENVIRONMENT == 'production' }
                    expression { !params.AUTO_APPROVE }
                }
            }
            steps {
                script {
                    def plan = readJSON file: 'plan.json'
                    def message = """
                        Deployment Plan for ${params.ENVIRONMENT}:
                        - Resources to create: ${plan.toCreate.size()}
                        - Resources to update: ${plan.toUpdate.size()}
                        - Resources to delete: ${plan.toDelete.size()}
                        - Estimated cost impact: ${plan.costImpact}
                    """
                    
                    input message: message, ok: 'Deploy'
                }
            }
        }
        
        stage('Deploy') {
            when {
                expression { params.ACTION == 'apply' }
            }
            steps {
                script {
                    def autoApproveFlag = params.AUTO_APPROVE ? '--auto-approve' : ''
                    sh """
                        iac-dharma deploy \
                            --environment ${params.ENVIRONMENT} \
                            --blueprints blueprints/${params.ENVIRONMENT} \
                            ${autoApproveFlag} \
                            --output deployment.json
                    """
                }
            }
        }
        
        stage('Destroy') {
            when {
                expression { params.ACTION == 'destroy' }
            }
            steps {
                script {
                    input message: "Confirm destruction of ${params.ENVIRONMENT} environment", ok: 'Destroy'
                    sh """
                        iac-dharma destroy \
                            --environment ${params.ENVIRONMENT} \
                            --force
                    """
                }
            }
        }
        
        stage('Post-Deployment Tests') {
            when {
                expression { params.ACTION == 'apply' }
            }
            steps {
                script {
                    sh """
                        iac-dharma test smoke --environment ${params.ENVIRONMENT}
                        iac-dharma health-check --environment ${params.ENVIRONMENT}
                    """
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: '*.json', allowEmptyArchive: true
            
            script {
                def status = currentBuild.result ?: 'SUCCESS'
                def color = status == 'SUCCESS' ? 'good' : 'danger'
                
                slackSend(
                    color: color,
                    message: """
                        ${status}: Job ${env.JOB_NAME} [${env.BUILD_NUMBER}]
                        Environment: ${params.ENVIRONMENT}
                        Action: ${params.ACTION}
                        Duration: ${currentBuild.durationString}
                        ${env.BUILD_URL}
                    """
                )
            }
        }
    }
}
```

---

## ⏰ Scheduled Workflows

### Cron Jobs

**Drift Detection** (daily):

```yaml
# .iac-dharma/workflows/drift-detection.yml
name: Daily Drift Detection
schedule: "0 2 * * *"  # 2 AM daily

steps:
  - name: detect_drift
    action: drift.detect
    params:
      environments:
        - production
        - staging
      
  - name: notify_on_drift
    action: notification.send
    when: previous.drifted
    params:
      channel: slack
      webhook: ${SLACK_WEBHOOK}
      message: "Infrastructure drift detected in ${environment}"
```

**Cost Optimization** (weekly):

```yaml
# .iac-dharma/workflows/cost-optimization.yml
name: Weekly Cost Optimization
schedule: "0 9 * * 1"  # Monday 9 AM

steps:
  - name: analyze_costs
    action: cost.analyze
    params:
      period: last_7_days
      
  - name: generate_recommendations
    action: ai.recommend
    params:
      types:
        - right_sizing
        - reserved_instances
        - unused_resources
      
  - name: send_report
    action: notification.send
    params:
      channel: email
      to: devops@company.com
      template: cost_optimization_report
      data: ${previous.recommendations}
```

**Backup** (daily):

```yaml
# .iac-dharma/workflows/backup.yml
name: Daily Backup
schedule: "0 1 * * *"  # 1 AM daily

steps:
  - name: backup_state
    action: state.backup
    params:
      destination: s3://backups/iac-state
      retention: 30d
      
  - name: backup_configs
    action: config.backup
    params:
      destination: s3://backups/iac-config
      retention: 30d
      
  - name: verify_backup
    action: backup.verify
    params:
      backup_ids:
        - ${previous[0].backup_id}
        - ${previous[1].backup_id}
```

---

## 🔔 Event-Driven Workflows

### Webhook Triggers

**GitHub Release Webhook**:

```yaml
# .iac-dharma/workflows/release-deployment.yml
name: Release Deployment
trigger:
  type: webhook
  source: github
  event: release.published

steps:
  - name: extract_version
    action: variable.set
    params:
      version: ${event.release.tag_name}
      
  - name: update_blueprints
    action: blueprint.update
    params:
      blueprints: blueprints/production
      variables:
        app_version: ${version}
      
  - name: deploy
    action: deploy
    params:
      environment: production
      blueprints: blueprints/production
      auto_approve: true
      
  - name: create_tag
    action: git.tag
    params:
      tag: deployed-${version}
      message: "Deployed version ${version} to production"
```

**Alert-Triggered Remediation**:

```yaml
# .iac-dharma/workflows/auto-remediation.yml
name: Auto Remediation
trigger:
  type: webhook
  source: prometheus
  event: alert.firing

steps:
  - name: check_alert_type
    action: condition.check
    params:
      condition: ${event.alert.name} == "HighMemoryUsage"
      
  - name: scale_up
    when: previous.result
    action: resource.scale
    params:
      resource_type: aws::autoscaling_group
      resource_name: ${event.alert.labels.asg_name}
      desired_capacity: +2
      
  - name: notify
    action: notification.send
    params:
      channel: slack
      message: "Auto-scaled ${resource_name} due to ${alert.name}"
```

---

## 🔄 Custom Workflows

### Workflow Definition

```yaml
# .iac-dharma/workflows/blue-green-deployment.yml
name: Blue-Green Deployment
description: Zero-downtime blue-green deployment

parameters:
  - name: environment
    type: string
    required: true
  - name: app_version
    type: string
    required: true

steps:
  # Step 1: Deploy green environment
  - name: deploy_green
    action: deploy
    params:
      environment: ${environment}-green
      blueprints: blueprints/${environment}
      variables:
        app_version: ${app_version}
        deployment_color: green
      
  # Step 2: Health check
  - name: health_check_green
    action: test.health
    params:
      environment: ${environment}-green
      timeout: 300s
      retry: 3
      
  # Step 3: Run smoke tests
  - name: smoke_tests
    action: test.smoke
    params:
      environment: ${environment}-green
      
  # Step 4: Canary traffic (10%)
  - name: canary_traffic
    action: traffic.route
    params:
      environment: ${environment}
      blue_weight: 90
      green_weight: 10
      duration: 300s
      
  # Step 5: Monitor metrics
  - name: monitor_canary
    action: metrics.monitor
    params:
      duration: 300s
      metrics:
        - error_rate
        - latency_p95
        - throughput
      thresholds:
        error_rate: 0.01
        latency_p95: 500ms
      
  # Step 6: Full cutover or rollback
  - name: cutover_or_rollback
    action: condition.branch
    params:
      condition: ${previous.passed}
      on_true:
        - action: traffic.route
          params:
            blue_weight: 0
            green_weight: 100
        - action: deployment.promote
          params:
            from: green
            to: blue
      on_false:
        - action: traffic.route
          params:
            blue_weight: 100
            green_weight: 0
        - action: deployment.destroy
          params:
            environment: ${environment}-green
        - action: notification.send
          params:
            channel: slack
            message: "Deployment rolled back due to failed metrics"
```

### Execute Custom Workflow

```bash
# Execute workflow
iac-dharma workflow run \
  --workflow blue-green-deployment \
  --param environment=production \
  --param app_version=v2.1.0

# Monitor execution
iac-dharma workflow status \
  --workflow-id abc123

# View logs
iac-dharma workflow logs \
  --workflow-id abc123 \
  --follow
```

---

## 📊 Workflow Monitoring

### Grafana Dashboard

```yaml
# Workflow metrics
workflow_executions_total
workflow_success_rate
workflow_duration_seconds
workflow_step_failures_total
```

**PromQL Queries**:

```promql
# Success rate
rate(workflow_executions_total{status="success"}[5m]) / 
rate(workflow_executions_total[5m]) * 100

# Average duration
rate(workflow_duration_seconds_sum[5m]) / 
rate(workflow_duration_seconds_count[5m])

# Failed workflows
increase(workflow_executions_total{status="failed"}[1h])
```

---

## 📚 Related Documentation

- [CI-CD-Pipeline](CI-CD-Pipeline) - CI/CD best practices
- [Deployment-Guide](Deployment-Guide) - Deployment strategies
- [Migration-Guide](Migration-Guide) - Migration workflows
- [Monitoring-Setup](Monitoring-Setup) - Workflow observability

---

**Next Steps**: Explore [Plugin-Development](Plugin-Development) for extending IAC Dharma.
