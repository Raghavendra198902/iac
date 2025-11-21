# Frequently Asked Questions (FAQ)

Common questions and answers about IAC Dharma.

---

## 📋 General Questions

### What is IAC Dharma?

IAC Dharma is an enterprise-grade Infrastructure as Code automation platform that provides intelligent infrastructure management through AI-powered optimization, multi-cloud support, and comprehensive observability.

### Is IAC Dharma open source?

Yes, IAC Dharma is open source under the MIT license. You can use, modify, and distribute it freely for personal and commercial projects.

### What programming languages does IAC Dharma support?

The platform is built with:
- **Backend**: Node.js 20, TypeScript, Python (for AI engine)
- **Frontend**: React 18, TypeScript
- **Blueprints**: YAML-based configuration

### Can I use IAC Dharma in production?

Yes! IAC Dharma is production-ready with:
- Battle-tested microservices architecture
- 99.9% uptime SLA capability
- Enterprise security features
- Comprehensive monitoring and alerting

---

## 🚀 Getting Started

### How do I install IAC Dharma?

```bash
# Install via npm
npm install -g @raghavendra198902/iac-dharma

# Initialize project
iac-dharma init --name my-project

# Start services
iac-dharma start
```

See the [Installation Guide](Installation-Guide) for detailed instructions.

### What are the system requirements?

**Minimum** (dev/testing):
- 2 CPU cores
- 4GB RAM
- 20GB disk space
- Docker 20.10+

**Recommended** (production):
- 4+ CPU cores
- 8GB+ RAM
- 50GB+ SSD
- Docker 24.0+

### How long does it take to set up?

- **Quick start**: 5-10 minutes
- **Production setup**: 1-2 hours
- **Enterprise deployment**: 1-2 days

### Do I need to know Terraform?

No, but Terraform knowledge helps. IAC Dharma:
- Generates Terraform code automatically
- Provides visual blueprint designer
- Supports importing existing Terraform

---

## ☁️ Cloud Providers

### Which cloud providers are supported?

IAC Dharma supports:
- **AWS** (Amazon Web Services) - 100+ services
- **Azure** (Microsoft Azure) - Full support
- **GCP** (Google Cloud Platform) - Complete coverage

### Can I use multiple cloud providers?

Yes! IAC Dharma supports:
- **Multi-cloud deployments**: Deploy to multiple clouds simultaneously
- **Cross-cloud networking**: VPC peering, VPN, Transit Gateway
- **Unified management**: Single interface for all clouds

### How do I authenticate with cloud providers?

**AWS**:
```bash
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION="us-east-1"
```

**Azure**:
```bash
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-secret"
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
```

**GCP**:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

See [Cloud-Provider-Guides](Cloud-Provider-Guides) for details.

### Can I use IAC Dharma with on-premises infrastructure?

Currently, IAC Dharma focuses on public cloud providers. On-premises support is on the roadmap for v2.0.

---

## 🔧 Configuration & Setup

### Where are configuration files stored?

```
project-root/
├── .iac-dharma/
│   ├── config.yml          # Main configuration
│   ├── credentials.yml     # Encrypted credentials
│   └── workflows/          # Custom workflows
├── blueprints/             # Infrastructure templates
└── environments/           # Environment configs
```

### How do I configure different environments?

```yaml
# environments/production.yml
environment: production
provider: aws
region: us-east-1

variables:
  instance_type: t3.large
  min_instances: 4
  max_instances: 10
```

```bash
# Deploy to production
iac-dharma deploy --environment production
```

### Can I use environment variables?

Yes:
```yaml
# Use environment variables in blueprints
resources:
  - name: bucket
    type: aws::s3::bucket
    properties:
      bucket: "${env.BUCKET_NAME}"
      
  - name: secret
    type: aws::secretsmanager::secret
    properties:
      secret_string: "${env.DB_PASSWORD}"
```

### How do I manage secrets?

**Option 1: Environment Variables**:
```bash
export DB_PASSWORD="secret123"
```

**Option 2: HashiCorp Vault**:
```yaml
secrets:
  backend: vault
  vault_addr: https://vault.company.com
  vault_token: ${VAULT_TOKEN}
```

**Option 3: Cloud Provider Secret Manager**:
```yaml
secrets:
  backend: aws_secretsmanager
  region: us-east-1
```

---

## 📦 Blueprints

### What is a blueprint?

A blueprint is a YAML-based infrastructure template that defines:
- Resources to create
- Configuration parameters
- Dependencies
- Outputs

Example:
```yaml
apiVersion: v1
kind: Blueprint
metadata:
  name: simple-vpc
  
spec:
  resources:
    - name: vpc
      type: aws::vpc
      properties:
        cidr_block: 10.0.0.0/16
```

### Where can I find pre-built blueprints?

- **Built-in library**: 50+ pre-built blueprints
- **GitHub**: [IAC Dharma Templates](https://github.com/Raghavendra198902/iac)
- **Community**: Share and discover blueprints

### Can I create custom blueprints?

Yes! See [Custom-Blueprints](Custom-Blueprints) guide.

```bash
# Create new blueprint
iac-dharma blueprint create \
  --name my-blueprint \
  --provider aws

# Validate
iac-dharma blueprint validate my-blueprint.yml

# Deploy
iac-dharma deploy --blueprint my-blueprint
```

### How do I share blueprints with my team?

**Option 1: Git Repository**:
```bash
git clone https://github.com/company/blueprints
iac-dharma blueprint install ./blueprints
```

**Option 2: Private Registry**:
```bash
iac-dharma blueprint publish \
  --registry https://blueprints.company.com \
  --blueprint my-blueprint
```

---

## 🤖 AI & Optimization

### How does AI cost optimization work?

IAC Dharma uses machine learning models:
- **LSTM networks**: Cost forecasting
- **Isolation Forest**: Anomaly detection
- **Collaborative filtering**: Right-sizing recommendations

Example:
```bash
# Get cost optimization recommendations
iac-dharma cost optimize --environment production

# Output:
# 💰 Potential savings: $12,450/month (35%)
# 
# Recommendations:
# 1. Right-size EC2: t3.2xlarge → t3.xlarge (Save $890/mo)
# 2. Reserve RDS instance (Save $560/mo)
# 3. Delete unused EBS volumes (Save $340/mo)
```

### Are the AI recommendations accurate?

- **Cost forecasting**: 90-95% accuracy
- **Anomaly detection**: 95%+ precision
- **Right-sizing**: Confidence scores 0-100%

Models are continuously trained on your infrastructure data.

### Can I disable AI features?

Yes:
```yaml
# config/config.yml
ai:
  enabled: false
  cost_optimization: false
  anomaly_detection: false
```

### How much data is needed for AI recommendations?

- **Minimum**: 7 days of metrics
- **Recommended**: 30 days
- **Optimal**: 90+ days

---

## 📊 Monitoring & Observability

### What metrics are collected?

IAC Dharma collects 40+ metrics:
- **System**: CPU, memory, disk, network
- **API**: Latency, throughput, errors
- **Database**: Queries, connections, slow queries
- **Business**: Deployments, costs, users

### How do I access Grafana dashboards?

```bash
# Start services
iac-dharma start

# Access Grafana
# URL: http://localhost:3030
# Username: admin
# Password: admin
```

4 pre-configured dashboards included:
- System Overview
- API Performance
- Database Metrics
- Infrastructure Monitoring

### Can I create custom dashboards?

Yes! Use Grafana's dashboard builder or import JSON:

```bash
# Export dashboard
curl http://localhost:3030/api/dashboards/uid/my-dashboard

# Import dashboard
iac-dharma dashboard import custom-dashboard.json
```

### How do I set up alerts?

```yaml
# .iac-dharma/alerts/high-cpu.yml
alert: HighCPUUsage
expr: cpu_usage_percent > 80
for: 5m
labels:
  severity: warning
annotations:
  summary: "High CPU usage detected"
  
actions:
  - type: slack
    webhook: ${SLACK_WEBHOOK}
  - type: email
    to: ops@company.com
```

---

## 🔐 Security & Compliance

### Is IAC Dharma secure?

Yes, with multiple security layers:
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Authentication**: JWT, OAuth 2.0, SAML 2.0
- **Authorization**: RBAC with fine-grained permissions
- **Auditing**: Complete audit trail
- **Compliance**: HIPAA, PCI-DSS, SOC 2, GDPR

### How do I enable SSO?

See [SSO-Configuration](SSO-Configuration) guide.

**SAML 2.0** (Okta, Azure AD):
```yaml
sso:
  enabled: true
  provider: saml
  idp_metadata_url: https://idp.company.com/metadata
```

**OAuth 2.0** (Google, GitHub):
```yaml
sso:
  enabled: true
  provider: google
  client_id: ${GOOGLE_CLIENT_ID}
  client_secret: ${GOOGLE_CLIENT_SECRET}
```

### How are credentials stored?

- **Encrypted at rest**: AES-256 encryption
- **Vault integration**: HashiCorp Vault support
- **Cloud secret managers**: AWS Secrets Manager, Azure Key Vault, GCP Secret Manager
- **Never logged**: Sensitive data masked in logs

### Can I enforce compliance policies?

Yes:
```bash
# Scan for compliance violations
iac-dharma compliance scan \
  --framework HIPAA,PCI-DSS,SOC2 \
  --environment production

# Enforce policies
iac-dharma policy apply \
  --policy security-baseline.rego \
  --fail-on-violation
```

---

## 🐛 Troubleshooting

### Services won't start

**Check Docker**:
```bash
docker ps
docker-compose logs
```

**Common issues**:
- Port conflicts: Check ports 3000, 5173, 5432, 6379
- Insufficient memory: Increase Docker memory limit
- Network issues: Reset Docker network

**Solution**:
```bash
# Stop all services
iac-dharma stop

# Reset Docker
docker-compose down -v

# Restart
iac-dharma start
```

### Deployment fails

**Check logs**:
```bash
iac-dharma logs --service iac-generator --tail 100
```

**Common causes**:
- Invalid credentials
- Missing permissions
- Resource quota exceeded
- Network connectivity

**Debug**:
```bash
# Dry run
iac-dharma deploy --dry-run

# Validate blueprint
iac-dharma blueprint validate

# Check provider credentials
iac-dharma provider test aws
```

### High memory usage

**Check metrics**:
```bash
docker stats
```

**Optimize**:
```yaml
# config/config.yml
services:
  cache:
    max_memory: 512mb
  
  database:
    shared_buffers: 256MB
    max_connections: 100
```

### Database connection errors

**Check PostgreSQL**:
```bash
docker exec -it postgres psql -U postgres -d iac_dharma

# Test connection
\conninfo
\dt
```

**Reset database**:
```bash
# Backup first!
iac-dharma db backup

# Reset
iac-dharma db reset --confirm
```

---

## 💰 Pricing & Licensing

### Is IAC Dharma free?

Yes! IAC Dharma is:
- **Open source**: MIT license
- **Free to use**: Personal and commercial
- **No vendor lock-in**: You control everything
- **Self-hosted**: Run anywhere

### Are there any paid features?

No paid features currently. All features are included.

### What about cloud provider costs?

IAC Dharma doesn't charge for platform usage, but you pay for:
- Cloud resources (AWS, Azure, GCP)
- Third-party services (if used)

IAC Dharma helps **reduce** cloud costs by 30-40% through AI optimization.

### Can I get commercial support?

Community support is available via:
- GitHub Issues
- GitHub Discussions
- Documentation

Enterprise support roadmap for 2026.

---

## 🔄 Updates & Versioning

### How do I update IAC Dharma?

```bash
# Update CLI
npm update -g @raghavendra198902/iac-dharma

# Update services
iac-dharma update

# Check version
iac-dharma --version
```

### How often are updates released?

- **Major versions**: Yearly (v1.0, v2.0)
- **Minor versions**: Quarterly (v1.1, v1.2)
- **Patch versions**: Monthly (v1.0.1, v1.0.2)

### Will my blueprints break on update?

No, IAC Dharma follows semantic versioning:
- **Patch updates** (v1.0.x): Bug fixes only
- **Minor updates** (v1.x.0): New features, backward compatible
- **Major updates** (vx.0.0): Breaking changes (with migration guide)

### How do I migrate between versions?

See [Migration-Guide](Migration-Guide) for version-specific migration steps.

---

## 🤝 Contributing

### How can I contribute?

Many ways to contribute:
- 🐛 **Report bugs**: [GitHub Issues](https://github.com/Raghavendra198902/iac/issues)
- 💡 **Suggest features**: [GitHub Discussions](https://github.com/Raghavendra198902/iac/discussions)
- 📝 **Improve docs**: Submit pull requests
- 🔧 **Submit code**: See [Contributing-Guide](Contributing-Guide)
- ⭐ **Star repo**: Show your support!

### Where can I get help?

- **Documentation**: This wiki
- **GitHub Issues**: Bug reports
- **GitHub Discussions**: Q&A
- **Email**: raghavendra198902@gmail.com

### Can I create plugins?

Yes! See [Plugin-Development](Plugin-Development) guide.

```bash
# Create plugin
npx iac-dharma-plugin create my-plugin

# Publish
npm publish @your-org/iac-dharma-plugin-my-plugin
```

---

## 📚 Additional Resources

### Documentation
- [Quick Start](Quick-Start) - Get started in 5 minutes
- [Architecture Overview](Architecture-Overview) - System design
- [API Reference](API-Reference) - Complete API docs
- [Troubleshooting](Troubleshooting) - Common issues

### Guides
- [Installation Guide](Installation-Guide) - Setup instructions
- [Deployment Guide](Deployment-Guide) - Production deployment
- [Security Best Practices](Security-Best-Practices) - Security hardening
- [Performance Tuning](Performance-Tuning) - Optimization tips

### Community
- **GitHub**: [Raghavendra198902/iac](https://github.com/Raghavendra198902/iac)
- **npm**: [@raghavendra198902/iac-dharma](https://www.npmjs.com/package/@raghavendra198902/iac-dharma)
- **Issues**: [Report bugs](https://github.com/Raghavendra198902/iac/issues)
- **Discussions**: [Q&A forum](https://github.com/Raghavendra198902/iac/discussions)

---

## ❓ Still Have Questions?

**Can't find your answer?**

1. Search this wiki
2. Check [Troubleshooting](Troubleshooting) guide
3. Browse [GitHub Issues](https://github.com/Raghavendra198902/iac/issues)
4. Ask in [GitHub Discussions](https://github.com/Raghavendra198902/iac/discussions)
5. Email: raghavendra198902@gmail.com

**Found a bug?**

Report it: [GitHub Issues](https://github.com/Raghavendra198902/iac/issues/new)

**Want a new feature?**

Request it: [GitHub Discussions](https://github.com/Raghavendra198902/iac/discussions/new)

---

**⭐ Star us on GitHub!**  
**🌸 IAC Dharma - Balance in Automation**

---

Last Updated: November 22, 2025 | Version: 1.0.0
