# Enterprise Features - Quick Start Guide

Get started with IAC Dharma's enterprise features in 5 minutes.

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local development)
- Basic understanding of cloud providers (AWS, Azure, GCP)

## Quick Setup (3 Steps)

### Step 1: Build & Start Services

```bash
# Run the automated setup script
./scripts/deployment/enterprise-services-setup.sh

# Or manually:
docker-compose build cloud-provider-service ai-recommendations-service sso-service
docker-compose up -d cloud-provider-service ai-recommendations-service sso-service
```

### Step 2: Verify Services

```bash
# Check health endpoints
curl http://localhost:3010/health  # Cloud Provider Service
curl http://localhost:3011/health  # AI Recommendations Service  
curl http://localhost:3012/health  # SSO Service

# Check all services
docker-compose ps
```

### Step 3: Test the APIs

See examples below for each service.

---

## 🌐 Multi-Cloud Support (Port 3010)

### Quick Test: List AWS Regions
```bash
curl http://localhost:3010/api/cloud/aws/regions
```

### Compare Costs Across Providers
```bash
curl -X POST http://localhost:3010/api/cloud/multi/compare-costs \
  -H "Content-Type: application/json" \
  -d '{
    "aws": {
      "region": "us-east-1",
      "instanceType": "t3.medium",
      "storage": 100
    },
    "azure": {
      "region": "eastus",
      "vmSize": "Standard_D2s_v3",
      "storage": 100
    },
    "gcp": {
      "region": "us-central1",
      "machineType": "n1-standard-2",
      "storage": 100
    }
  }'
```

### Get Migration Recommendations
```bash
curl -X POST http://localhost:3010/api/cloud/multi/migration-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "currentProvider": "aws",
    "targetProvider": "azure",
    "resources": [
      {
        "type": "compute",
        "instanceType": "t3.medium",
        "count": 5
      }
    ]
  }'
```

---

## 🤖 AI Recommendations (Port 3011)

### Cost Optimization Recommendations
```bash
curl -X POST http://localhost:3011/api/ai/recommendations/cost-optimization \
  -H "Content-Type: application/json" \
  -d '{
    "resources": [
      {
        "id": "i-1234567",
        "type": "ec2",
        "instanceType": "t3.xlarge",
        "usage": {
          "cpu": 15,
          "memory": 35
        }
      }
    ],
    "usage": {
      "period": "30d"
    }
  }'
```

### Security Recommendations
```bash
curl -X POST http://localhost:3011/api/ai/recommendations/security \
  -H "Content-Type: application/json" \
  -d '{
    "infrastructure": {
      "securityGroups": ["sg-12345"],
      "iamPolicies": ["policy-admin"],
      "s3Buckets": ["bucket-logs"]
    }
  }'
```

### Performance Optimization
```bash
curl -X POST http://localhost:3011/api/ai/recommendations/performance \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": {
      "databaseCpu": 85,
      "apiLatency": 450,
      "throughput": 1000
    }
  }'
```

### Predict Future Costs
```bash
curl -X POST http://localhost:3011/api/ai/analytics/predict-costs \
  -H "Content-Type: application/json" \
  -d '{
    "historicalData": [4200, 4350, 4500, 4650, 4800],
    "timeframe": "next_month"
  }'
```

### Resource Rightsizing
```bash
curl -X POST http://localhost:3011/api/ai/optimization/rightsize \
  -H "Content-Type: application/json" \
  -d '{
    "resources": [
      {
        "id": "i-1234567",
        "type": "t3.xlarge",
        "currentCost": 150,
        "utilization": {
          "cpu": 15,
          "memory": 35
        }
      }
    ]
  }'
```

---

## 🔐 Enterprise SSO (Port 3012)

### Local Login (Testing)
```bash
curl -X POST http://localhost:3012/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@iac-dharma.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@iac-dharma.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Validate Token
```bash
# Save token from login response
TOKEN="your_token_here"

curl -X POST http://localhost:3012/api/auth/validate \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}"
```

### Get Current User
```bash
curl http://localhost:3012/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### List Available SSO Providers
```bash
curl http://localhost:3012/api/auth/oauth2/providers
```

### Get SSO Configurations (Admin)
```bash
curl http://localhost:3012/api/auth/admin/sso-configs \
  -H "Authorization: Bearer $TOKEN"
```

### Get Role Mappings (Admin)
```bash
curl http://localhost:3012/api/auth/admin/role-mappings \
  -H "Authorization: Bearer $TOKEN"
```

### View Active Sessions (Admin)
```bash
curl http://localhost:3012/api/auth/admin/sessions \
  -H "Authorization: Bearer $TOKEN"
```

### View Audit Log (Admin)
```bash
curl http://localhost:3012/api/auth/admin/audit-log \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📱 Mobile App Setup

### Initialize React Native Project
```bash
# Create new React Native project
npx react-native init IACDharmaMobile --template react-native-template-typescript

cd IACDharmaMobile

# Install dependencies
npm install @react-navigation/native @react-navigation/stack
npm install @reduxjs/toolkit react-redux
npm install axios react-native-biometrics
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### Run on iOS
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### Run on Android
```bash
npx react-native run-android
```

**Full Documentation**: [docs/mobile/README.md](docs/mobile/README.md)

---

## 📊 Advanced Analytics

The analytics service is integrated into the AI Recommendations service. Use the analytics endpoints for reporting:

### Generate Cost Report
```bash
curl -X POST http://localhost:3011/api/ai/analytics/predict-costs \
  -H "Content-Type: application/json" \
  -d '{
    "historicalData": [4200, 4350, 4500, 4650, 4800],
    "timeframe": "next_quarter"
  }'
```

### Analyze Usage Patterns
```bash
curl -X POST http://localhost:3011/api/ai/analytics/usage-patterns \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": {
      "hourlyUsage": [/* hourly data */],
      "period": "30d"
    }
  }'
```

**Full Documentation**: [docs/features/ADVANCED_ANALYTICS.md](docs/features/ADVANCED_ANALYTICS.md)

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Cloud Provider Credentials
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1

AZURE_SUBSCRIPTION_ID=your_subscription_id
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret
AZURE_TENANT_ID=your_tenant_id

GCP_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# SSO Configuration
JWT_SECRET=your_jwt_secret_change_in_production
SESSION_SECRET=your_session_secret_change_in_production

# SAML (Optional)
SAML_ENTRY_POINT=https://idp.example.com/sso
SAML_ISSUER=iac-dharma
SAML_CERT=your_certificate

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Azure AD (Optional)
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id
```

---

## 🧪 Testing

### Run Health Checks
```bash
# Test all services
for port in 3010 3011 3012; do
  echo "Testing port $port..."
  curl -s http://localhost:$port/health | jq
done
```

### Run Integration Tests
```bash
cd tests
./e2e-test.sh --suite enterprise-features
```

### View Service Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f cloud-provider-service
docker-compose logs -f ai-recommendations-service
docker-compose logs -f sso-service
```

---

## 📖 Next Steps

### For Developers:
1. Read the [Enterprise Features Guide](ENTERPRISE_FEATURES.md)
2. Explore [API Documentation](docs/api/API_DOCUMENTATION.md)
3. Set up your [development environment](docs/guides/DEVELOPMENT_SETUP.md)
4. Review [code examples](docs/guides/CODE_EXAMPLES.md)

### For Administrators:
1. Configure [SSO integration](ENTERPRISE_FEATURES.md#4-enterprise-sso-integration)
2. Set up [cloud provider credentials](ENTERPRISE_FEATURES.md#1-multi-cloud-support)
3. Review [security best practices](docs/security/)
4. Configure [monitoring and alerts](docs/deployment/MONITORING.md)

### For End Users:
1. Install the [mobile app](docs/mobile/README.md)
2. Learn about [AI recommendations](ENTERPRISE_FEATURES.md#2-advanced-ai-recommendations)
3. Explore [custom dashboards](docs/features/ADVANCED_ANALYTICS.md)
4. Review [user guides](docs/guides/)

---

## 🆘 Troubleshooting

### Services Not Starting?
```bash
# Check Docker status
docker-compose ps

# View logs for errors
docker-compose logs

# Rebuild specific service
docker-compose build cloud-provider-service
docker-compose up -d cloud-provider-service
```

### API Not Responding?
```bash
# Check if service is running
docker-compose ps | grep cloud-provider-service

# Check service logs
docker-compose logs --tail=50 cloud-provider-service

# Restart service
docker-compose restart cloud-provider-service
```

### Authentication Issues?
```bash
# Verify JWT_SECRET is set
docker-compose exec sso-service env | grep JWT_SECRET

# Check SSO service logs
docker-compose logs --tail=50 sso-service
```

---

## 📚 Documentation Links

- **[Enterprise Features Guide](ENTERPRISE_FEATURES.md)** - Complete feature documentation
- **[Implementation Summary](ENTERPRISE_IMPLEMENTATION_SUMMARY.md)** - What was built
- **[Quick Navigation](QUICK_NAV.md)** - Task-based navigation
- **[API Documentation](docs/api/API_DOCUMENTATION.md)** - API reference
- **[Mobile App Guide](docs/mobile/README.md)** - Mobile app setup
- **[Analytics Guide](docs/features/ADVANCED_ANALYTICS.md)** - Analytics documentation

---

## 💬 Support

Need help?
- **Documentation**: Check the guides above
- **Issues**: Create a GitHub issue
- **Email**: support@iac-dharma.com
- **Slack**: #enterprise-features

---

**🎉 You're all set!** Start building with IAC Dharma's enterprise features.
