# Enterprise Features Testing Guide

**Last Updated**: December 2024  
**Status**: Production Ready

---

## 🎯 Overview

This guide provides comprehensive testing procedures for all enterprise features implemented in IAC Dharma platform.

### Features to Test
1. ✅ Multi-Cloud Provider Support (AWS, Azure, GCP)
2. ✅ AI-Powered Recommendations Engine
3. ✅ Enterprise SSO Integration (SAML, OAuth2)
4. ✅ Advanced Analytics Dashboard
5. ✅ Frontend Integration

---

## 🚀 Quick Start Testing

### Prerequisites
```bash
# Verify all services are running
docker ps | grep dharma

# Expected: 18 services running (including 3 new enterprise services)
# - dharma-cloud-provider (port 3010)
# - dharma-ai-recommendations (port 3011)
# - dharma-sso (port 3012)
```

### Health Check (2 minutes)
```bash
# Test 1: Cloud Provider Service
docker exec dharma-cloud-provider wget -qO- http://localhost:3010/health
# Expected: {"status":"healthy","service":"cloud-provider-service"}

# Test 2: AI Recommendations Service
docker exec dharma-ai-recommendations wget -qO- http://localhost:3011/health
# Expected: {"status":"healthy","service":"ai-recommendations-service"}

# Test 3: SSO Service
docker exec dharma-sso wget -qO- http://localhost:3012/health
# Expected: {"status":"healthy","service":"sso-service"}
```

---

## 1️⃣ Multi-Cloud Provider Testing

### Test 1.1: AWS Cost Estimation (3 minutes)
```bash
docker exec dharma-cloud-provider wget -qO- \
  --post-data='{"instanceType":"t3.medium","region":"us-east-1","hours":720}' \
  --header='Content-Type: application/json' \
  http://localhost:3010/api/cloud/aws/cost-estimate
```

**Expected Response**:
```json
{
  "provider": "aws",
  "instanceType": "t3.medium",
  "region": "us-east-1",
  "hourlyCost": 0.0416,
  "monthlyCost": 29.95,
  "currency": "USD"
}
```

### Test 1.2: Azure Regions (2 minutes)
```bash
docker exec dharma-cloud-provider wget -qO- \
  http://localhost:3010/api/cloud/azure/regions
```

**Expected**: JSON array with Azure regions

### Test 1.3: GCP Instances (2 minutes)
```bash
docker exec dharma-cloud-provider wget -qO- \
  --post-data='{"projectId":"demo-project","zone":"us-central1-a"}' \
  --header='Content-Type: application/json' \
  http://localhost:3010/api/cloud/gcp/instances
```

**Expected**: JSON array with GCP instances

### Test 1.4: Multi-Cloud Cost Comparison (5 minutes)
```bash
docker exec dharma-cloud-provider wget -qO- \
  --post-data='{"resourceSpecs":{"cpu":4,"memory":16,"storage":100}}' \
  --header='Content-Type: application/json' \
  http://localhost:3010/api/cloud/multi/compare-costs
```

**Expected Response**:
```json
{
  "comparison": {
    "aws": {"compute":34,"storage":23,"database":30,"total":87},
    "azure": {"compute":30,"storage":20,"database":28,"total":78},
    "gcp": {"compute":25,"storage":20,"database":50,"total":95}
  }
}
```

**Validation**:
- ✅ All 3 cloud providers return cost data
- ✅ Azure shows lowest total cost ($78)
- ✅ GCP shows highest total cost ($95)

### Test 1.5: Multi-Cloud Inventory (3 minutes)
```bash
docker exec dharma-cloud-provider wget -qO- \
  --post-data='{"providers":["aws","azure","gcp"]}' \
  --header='Content-Type: application/json' \
  http://localhost:3010/api/cloud/multi/inventory
```

**Expected**: Consolidated inventory across all providers

---

## 2️⃣ AI Recommendations Testing

### Test 2.1: Cost Optimization Recommendations (5 minutes)
```bash
docker exec dharma-ai-recommendations wget -qO- \
  --post-data='{"resources":[{"id":"i-12345","type":"ec2","currentCost":150,"utilizationPercent":30}]}' \
  --header='Content-Type: application/json' \
  http://localhost:3011/api/ai/recommendations/cost-optimization
```

**Expected Response**:
```json
{
  "totalSavings": 262,
  "recommendations": [
    {
      "id": "rec-1",
      "type": "rightsizing",
      "resource": "EC2 Instance i-1234567",
      "currentCost": 150,
      "projectedCost": 95,
      "savings": 55,
      "confidence": 0.92,
      "impact": "medium",
      "description": "Instance is underutilized...",
      "actions": ["Resize instance", "Update auto-scaling policies"]
    }
  ]
}
```

**Validation**:
- ✅ Total savings: $262/month
- ✅ At least 3 recommendations provided
- ✅ Confidence scores between 0.88-0.95
- ✅ Action items included for each recommendation

### Test 2.2: Security Recommendations (4 minutes)
```bash
docker exec dharma-ai-recommendations wget -qO- \
  --post-data='{"resources":[{"id":"sg-123","type":"security-group"}]}' \
  --header='Content-Type: application/json' \
  http://localhost:3011/api/ai/recommendations/security
```

**Expected**: Security vulnerabilities and remediation steps

### Test 2.3: Performance Tuning (4 minutes)
```bash
docker exec dharma-ai-recommendations wget -qO- \
  --post-data='{"resources":[{"id":"db-123","type":"rds"}]}' \
  --header='Content-Type: application/json' \
  http://localhost:3011/api/ai/recommendations/performance
```

**Expected**: Performance optimization suggestions

### Test 2.4: Predictive Cost Analytics (5 minutes)
```bash
docker exec dharma-ai-recommendations wget -qO- \
  --post-data='{"historicalData":[4200,4350,4500,4650,4800],"timeframe":"next_month"}' \
  --header='Content-Type: application/json' \
  http://localhost:3011/api/ai/analytics/predict-costs
```

**Expected Response**:
```json
{
  "nextMonth": {
    "estimated": 4850,
    "confidence": 0.87,
    "range": {"min": 4700, "max": 5000}
  }
}
```

**Validation**:
- ✅ Predicted cost: $4,850
- ✅ Confidence: 87%
- ✅ Prediction range provided

### Test 2.5: Anomaly Detection (4 minutes)
```bash
docker exec dharma-ai-recommendations wget -qO- \
  --post-data='{"metrics":[{"timestamp":"2024-12-01","cost":5000}]}' \
  --header='Content-Type: application/json' \
  http://localhost:3011/api/ai/recommendations/anomalies
```

**Expected**: Anomalies detected with severity levels

---

## 3️⃣ SSO Authentication Testing

### Test 3.1: Local Login (3 minutes)
```bash
docker exec dharma-sso wget -qO- \
  --post-data='{"email":"admin@iac-dharma.com","password":"admin123"}' \
  --header='Content-Type: application/json' \
  http://localhost:3012/api/auth/login
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "admin@iac-dharma.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Validation**:
- ✅ JWT token returned
- ✅ User object with id, email, name, role
- ✅ Token can be decoded

### Test 3.2: Token Validation (2 minutes)
```bash
# Use token from previous test
TOKEN="<jwt_token_from_login>"

docker exec dharma-sso wget -qO- \
  --header="Authorization: Bearer $TOKEN" \
  http://localhost:3012/api/auth/validate
```

**Expected**: Token validation success

### Test 3.3: Token Refresh (2 minutes)
```bash
docker exec dharma-sso wget -qO- \
  --post-data='{"refreshToken":"<refresh_token>"}' \
  --header='Content-Type: application/json' \
  http://localhost:3012/api/auth/refresh
```

**Expected**: New access token

### Test 3.4: User Profile (2 minutes)
```bash
docker exec dharma-sso wget -qO- \
  --header="Authorization: Bearer $TOKEN" \
  http://localhost:3012/api/auth/me
```

**Expected**: User profile details

### Test 3.5: SSO Providers List (2 minutes)
```bash
docker exec dharma-sso wget -qO- \
  http://localhost:3012/api/auth/oauth2/providers
```

**Expected Response**:
```json
{
  "providers": [
    {"name": "google", "enabled": true, "type": "oauth2"},
    {"name": "azuread", "enabled": true, "type": "oauth2"}
  ]
}
```

---

## 4️⃣ Frontend Integration Testing

### Test 4.1: CloudProviderSelector Component (Manual)

**Steps**:
1. Access the platform at `http://localhost:5173`
2. Login with credentials
3. Navigate to **Projects** → **New Project**
4. Locate the **Cloud Provider** selector
5. Click on AWS card
6. Click on Azure card
7. Click on GCP card

**Expected Behavior**:
- ✅ Provider cards display with logos and colors
- ✅ AWS: Blue card with AWS branding
- ✅ Azure: Blue card with Azure branding
- ✅ GCP: Multi-color card with GCP branding
- ✅ Selected provider highlighted
- ✅ Only one provider selected at a time
- ✅ FormData updated with selected provider

**Validation**:
- Open browser DevTools → Console
- Check: `formData.cloudProvider` updates on selection

### Test 4.2: AIRecommendationsPanel Component (Manual)

**Steps**:
1. Navigate to **Analytics** → **AI Insights**
2. Wait for recommendations to load (3-5 seconds)
3. Click on **Cost** filter
4. Click on **Security** filter
5. Click on **Performance** filter
6. Expand a recommendation card

**Expected Behavior**:
- ✅ Panel loads with spinner initially
- ✅ 3+ recommendations displayed
- ✅ Each recommendation shows:
  - Type badge (cost/security/performance)
  - Resource name
  - Current cost vs Projected cost
  - Savings amount (green)
  - Confidence score (percentage)
  - Impact level (low/medium/high)
  - Description text
  - Action items list
- ✅ Category filters work correctly
- ✅ Total savings displayed at top: **$262/month**

**API Call Validation**:
- Open DevTools → Network tab
- Verify: POST to `localhost:3011/api/ai/recommendations/cost-optimization`
- Check response contains recommendations array

### Test 4.3: SSOLogin Components (Manual)

**Steps**:
1. Logout from the application
2. Navigate to `/sso-login` route
3. Observe SSO login page
4. Click on **Google** button
5. Click on **Azure AD** button
6. Click on **SAML** button
7. Try local login form

**Expected Behavior**:
- ✅ Complete login page with branding
- ✅ Three SSO provider buttons displayed:
  - Google (with Google colors)
  - Azure AD (with Microsoft colors)
  - SAML (with enterprise icon)
- ✅ Local login form with email/password fields
- ✅ Clicking SSO buttons triggers redirect (will fail without credentials)
- ✅ Local login submits to API

**Note**: SSO providers require environment configuration to fully test.

### Test 4.4: AnalyticsDashboard Component (Manual)

**Steps**:
1. Navigate to **Analytics** → **Advanced Analytics**
2. Wait for dashboard to load (3-5 seconds)
3. Observe all charts and metrics
4. Click on **7d** time range button
5. Click on **30d** time range button
6. Click on **90d** time range button
7. Click on **1y** time range button

**Expected Behavior**:
- ✅ Dashboard loads with 4 KPI cards at top:
  - Current Month: **$4,800** (5.3% increase)
  - Predicted Next: **$4,850** (87% confidence)
  - Total Resources: **156** (across 3 clouds)
  - Potential Savings: **$262** (from AI)
- ✅ **Cost Trend & Forecast** line chart displays:
  - 6 months of data (Jan-Jun)
  - Forecast for June marked as "(Est)"
  - Blue line connecting points
- ✅ **Resource Distribution** pie chart shows:
  - Compute: 58% (blue)
  - Storage: 25% (green)
  - Network: 17% (orange)
- ✅ **Resource Utilization** progress bars display:
  - Compute: 68% (yellow - between 60-80%)
  - Storage: 85% (red - above 80%)
  - Network: 52% (green - below 60%)
- ✅ **AI Insights** panel shows:
  - 3 opportunities detected (cost optimization)
  - 2 bottlenecks found (performance)
  - 1 critical issue (security)
- ✅ Time range buttons toggle active state (blue background)
- ✅ Charts re-render on time range change (simulate with state update)

**API Call Validation**:
- Open DevTools → Network tab
- Verify: POST to `localhost:3011/api/ai/analytics/predict-costs`
- Check response contains prediction data

### Test 4.5: Navigation Integration (Manual)

**Steps**:
1. Login to the platform
2. Observe left sidebar navigation
3. Expand **Analytics** section
4. Click on **Advanced Analytics** link
5. Verify route changes to `/analytics`
6. Verify AnalyticsDashboard component loads

**Expected Behavior**:
- ✅ Sidebar contains "Analytics" section
- ✅ "Advanced Analytics" link visible with BarChart3 icon
- ✅ Link navigates to `/analytics` route
- ✅ Dashboard page displays correctly
- ✅ URL bar shows `http://localhost:5173/analytics`

---

## 5️⃣ End-to-End Testing Scenarios

### Scenario 1: Multi-Cloud Project Creation (10 minutes)

**User Story**: As a Solution Architect, I want to create a new infrastructure project with Azure as the cloud provider.

**Steps**:
1. Login to IAC Dharma platform
2. Navigate to **Projects** → **New Project**
3. Fill in project details:
   - Name: "Azure Production Environment"
   - Description: "Production workloads for Azure cloud"
4. Select **Azure** from Cloud Provider selector
5. Fill in remaining fields (environment, status, priority)
6. Click **Create Project**

**Expected Result**:
- ✅ Project created successfully
- ✅ Cloud provider stored as "azure" in database
- ✅ Redirect to projects list
- ✅ New project visible with Azure indicator

### Scenario 2: Cost Optimization Workflow (15 minutes)

**User Story**: As a FinOps Manager, I want to identify cost savings opportunities using AI recommendations.

**Steps**:
1. Login to IAC Dharma platform
2. Navigate to **Analytics** → **Advanced Analytics**
3. Review current month spending: **$4,800**
4. Review predicted next month: **$4,850**
5. Note potential savings: **$262**
6. Navigate to **Analytics** → **AI Insights**
7. Filter recommendations by **Cost**
8. Review top 3 cost optimization recommendations:
   - EC2 rightsizing: **$55 savings**
   - Reserved instances: **$175 savings**
   - Storage optimization: **$32 savings**
9. Click on "EC2 rightsizing" recommendation
10. Review action items:
    - Resize instance
    - Update auto-scaling policies
11. Export recommendations (if feature available)

**Expected Result**:
- ✅ Total identified savings: **$262/month** ($3,144/year)
- ✅ All recommendations have >88% confidence
- ✅ Action items clearly defined
- ✅ Can prioritize by impact level

### Scenario 3: SSO Authentication (8 minutes)

**User Story**: As an Enterprise Administrator, I want users to login using company SSO.

**Steps**:
1. Logout from platform
2. Navigate to `/sso-login` page
3. Click **Azure AD** button
4. (If credentials configured) Complete Azure AD OAuth flow
5. Redirected back to platform
6. Verify user is authenticated
7. Verify user profile contains Azure AD details
8. Navigate to protected routes
9. Logout
10. Verify token invalidated

**Expected Result**:
- ✅ Azure AD login redirects to Microsoft login page
- ✅ After authentication, JWT token issued
- ✅ User profile populated from Azure AD
- ✅ Protected routes accessible
- ✅ Logout clears session

---

## 6️⃣ Performance Testing

### Test 6.1: API Response Times

**Test all endpoints and measure response times**:

```bash
# Cloud Provider Service
time docker exec dharma-cloud-provider wget -qO- http://localhost:3010/health
# Target: < 100ms

# AI Recommendations Service  
time docker exec dharma-ai-recommendations wget -qO- http://localhost:3011/health
# Target: < 100ms

# SSO Service
time docker exec dharma-sso wget -qO- http://localhost:3012/health
# Target: < 100ms

# Cost Optimization (with ML processing)
time docker exec dharma-ai-recommendations wget -qO- \
  --post-data='{"resources":[{"id":"i-12345","type":"ec2"}]}' \
  --header='Content-Type: application/json' \
  http://localhost:3011/api/ai/recommendations/cost-optimization
# Target: < 2 seconds
```

**Performance Targets**:
- ✅ Health checks: < 100ms
- ✅ Simple GET requests: < 200ms
- ✅ POST requests with data: < 500ms
- ✅ ML-powered recommendations: < 2 seconds
- ✅ Multi-cloud aggregation: < 3 seconds

### Test 6.2: Load Testing (Optional)

**Use Apache Bench or similar tool**:

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test 100 concurrent requests
ab -n 100 -c 10 http://localhost:3010/health

# Expected:
# - Requests per second: > 100
# - Failed requests: 0
# - 99th percentile: < 500ms
```

---

## 7️⃣ Security Testing

### Test 7.1: Authentication Required

**Verify protected endpoints require authentication**:

```bash
# Try accessing without token (should fail)
docker exec dharma-sso wget -qO- http://localhost:3012/api/auth/me
# Expected: 401 Unauthorized

# Try with invalid token (should fail)
docker exec dharma-sso wget -qO- \
  --header="Authorization: Bearer invalid_token" \
  http://localhost:3012/api/auth/me
# Expected: 401 Unauthorized
```

### Test 7.2: CORS Configuration

**Verify CORS headers are set correctly**:

```bash
docker exec dharma-cloud-provider wget -qO- \
  --header="Origin: http://localhost:5173" \
  http://localhost:3010/health
# Expected: Access-Control-Allow-Origin header present
```

### Test 7.3: Input Validation

**Test with invalid input data**:

```bash
# Test with empty body
docker exec dharma-ai-recommendations wget -qO- \
  --post-data='{}' \
  --header='Content-Type: application/json' \
  http://localhost:3011/api/ai/recommendations/cost-optimization

# Test with invalid data types
docker exec dharma-cloud-provider wget -qO- \
  --post-data='{"resourceSpecs":"invalid"}' \
  --header='Content-Type: application/json' \
  http://localhost:3010/api/cloud/multi/compare-costs

# Expected: 400 Bad Request with error message
```

---

## 8️⃣ Error Handling Testing

### Test 8.1: Service Unavailable

```bash
# Stop a service
docker-compose stop dharma-ai-recommendations

# Try to access it from frontend
# Expected: Graceful error message, fallback to mock data

# Restart service
docker-compose start dharma-ai-recommendations
```

### Test 8.2: Network Errors

**Simulate network latency/failures**:

```bash
# Use iptables or tc to simulate network issues
# Expected: Frontend shows loading state, then error after timeout
```

### Test 8.3: Invalid Cloud Credentials

**Test behavior when cloud credentials are invalid**:

```bash
# Cloud provider APIs should return graceful errors
# Frontend should display "Unable to connect" messages
# Mock data should be used as fallback
```

---

## 9️⃣ Regression Testing

### Test 9.1: Existing Features Still Work

**Verify enterprise features didn't break existing functionality**:

- ✅ Blueprint creation/editing works
- ✅ IAC generation still functional
- ✅ CMDB operations working
- ✅ Deployment monitoring active
- ✅ Cost management dashboard accessible
- ✅ All role-based dashboards load correctly

### Test 9.2: Database Integrity

```bash
# Check database for new tables/columns
docker exec dharma-postgres psql -U postgres -d iac_dharma -c "\dt"

# Expected: No errors, all tables intact
```

---

## 🎯 Test Results Summary

### Checklist

**Backend Services**:
- [ ] Cloud Provider Service health check passes
- [ ] AI Recommendations Service health check passes
- [ ] SSO Service health check passes
- [ ] Multi-cloud cost comparison returns data
- [ ] AI cost optimization returns savings
- [ ] SSO local login issues JWT token

**Frontend Components**:
- [ ] CloudProviderSelector renders correctly
- [ ] Provider selection updates form state
- [ ] AIRecommendationsPanel displays recommendations
- [ ] Total savings shows $262/month
- [ ] SSOLogin page renders with 3 providers
- [ ] AnalyticsDashboard shows 4 KPI cards
- [ ] Cost trend chart displays 6 months
- [ ] Resource distribution pie chart renders
- [ ] Navigation links work correctly

**Integration**:
- [ ] Frontend can call backend APIs
- [ ] Authentication flow works end-to-end
- [ ] Multi-cloud selection persists in projects
- [ ] AI recommendations integrate with analytics
- [ ] All routes accessible from navigation

**Performance**:
- [ ] Health checks < 100ms
- [ ] API responses < 2 seconds
- [ ] No memory leaks observed
- [ ] No console errors in browser

**Security**:
- [ ] Protected routes require auth
- [ ] Invalid tokens rejected
- [ ] CORS configured correctly
- [ ] Input validation working

---

## 📝 Known Issues & Workarounds

### Issue 1: Environment Variables Not Configured
**Impact**: SSO providers (Google, Azure AD, SAML) show "Not configured" errors  
**Workaround**: Local login still works, mock data available  
**Solution**: Configure `.env` file with actual credentials

### Issue 2: Cloud Provider APIs Return Mock Data
**Impact**: Real cloud resources not displayed  
**Workaround**: Mock data demonstrates functionality  
**Solution**: Configure AWS/Azure/GCP credentials in environment variables

### Issue 3: ML Model Not Trained with Real Data
**Impact**: Recommendations are simulated  
**Workaround**: Demo data shows expected behavior  
**Solution**: Train models with actual usage data over time

---

## 🏁 Test Execution Summary

**Estimated Total Testing Time**: 2-3 hours

**Test Categories**:
- Quick Start: 5 minutes
- Multi-Cloud: 20 minutes
- AI Recommendations: 25 minutes
- SSO Authentication: 15 minutes
- Frontend Integration: 30 minutes
- End-to-End Scenarios: 35 minutes
- Performance: 15 minutes
- Security: 10 minutes
- Regression: 15 minutes

**Success Criteria**:
- All health checks pass ✅
- All API endpoints return data ✅
- All frontend components render ✅
- No critical errors in logs ✅
- Response times within targets ✅

---

## 📞 Support

For issues or questions:
- Check logs: `docker logs dharma-<service-name>`
- Review documentation: `ENTERPRISE_FEATURES.md`
- Contact: [Your support contact]

**Happy Testing! 🚀**
