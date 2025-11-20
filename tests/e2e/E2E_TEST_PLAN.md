# End-to-End Testing Plan for IAC DHARMA Platform

## Overview
Browser-based E2E tests using Playwright to validate complete user workflows across the IAC DHARMA platform.

## Test Framework
- **Tool**: Playwright
- **Language**: TypeScript
- **Browser**: Chromium (headless for CI, headed for debugging)
- **Base URL**: http://localhost:5173 (Frontend)
- **API Base**: http://localhost:3000 (API Gateway)

## Test Scenarios

### 1. Authentication & Authorization Flow
**File**: `e2e/test-auth.spec.ts`

- **TC001**: User Registration (if implemented)
  - Navigate to registration page
  - Fill registration form
  - Submit and verify success message
  - Verify redirect to login page

- **TC002**: Successful Login
  - Navigate to login page
  - Enter valid credentials (admin@iac.dharma / test_password_123)
  - Click login button
  - Verify redirect to dashboard
  - Verify user menu shows logged-in state

- **TC003**: Failed Login - Invalid Credentials
  - Navigate to login page
  - Enter invalid credentials
  - Verify error message displayed
  - Verify user remains on login page

- **TC004**: Session Persistence
  - Login successfully
  - Refresh page
  - Verify user still logged in
  - Verify dashboard content visible

- **TC005**: Logout Flow
  - Login successfully
  - Click logout button
  - Verify redirect to login page
  - Verify session cleared

### 2. AI-Powered Infrastructure Designer
**File**: `e2e/test-ai-designer.spec.ts`

- **TC101**: Generate Simple Infrastructure
  - Login and navigate to AI Designer
  - Enter prompt: "Create a single virtual machine on Azure"
  - Click generate button
  - Wait for AI processing (30s timeout)
  - Verify blueprint preview displayed
  - Verify resources list contains VM

- **TC102**: Generate Complex Multi-Tier Architecture
  - Navigate to AI Designer
  - Enter prompt: "Three-tier web application with load balancer, 2 app servers, and PostgreSQL database"
  - Generate blueprint
  - Verify load balancer, VMs, and database in preview
  - Verify architecture diagram rendered

- **TC103**: Edit Generated Blueprint
  - Generate a simple blueprint
  - Click edit button
  - Modify resource properties
  - Save changes
  - Verify changes reflected in preview

- **TC104**: Save Blueprint
  - Generate blueprint
  - Click save button
  - Enter blueprint name and description
  - Save and verify success message
  - Navigate to blueprints list
  - Verify new blueprint appears

### 3. Blueprint Management
**File**: `e2e/test-blueprints.spec.ts`

- **TC201**: View Blueprints List
  - Login and navigate to Blueprints page
  - Verify blueprints table displayed
  - Verify pagination controls
  - Verify search functionality

- **TC202**: Create Manual Blueprint
  - Click "Create Blueprint" button
  - Fill in blueprint details (name, cloud provider, environment)
  - Add resources manually
  - Save blueprint
  - Verify success message and redirect

- **TC203**: View Blueprint Details
  - Click on existing blueprint
  - Verify details page loads
  - Verify resources displayed
  - Verify metadata (created date, author, etc.)

- **TC204**: Edit Blueprint
  - Open blueprint details
  - Click edit button
  - Modify properties
  - Save changes
  - Verify changes saved

- **TC205**: Delete Blueprint
  - Open blueprint details
  - Click delete button
  - Confirm deletion in modal
  - Verify redirect to list
  - Verify blueprint removed from list

- **TC206**: Blueprint Versioning
  - Open blueprint
  - Click "Create Version" button
  - Make changes
  - Save as new version
  - Verify version history displayed

### 4. Infrastructure Provisioning Workflow
**File**: `e2e/test-provisioning.spec.ts`

- **TC301**: Run Guardrails Check
  - Open blueprint
  - Click "Check Guardrails" button
  - Wait for analysis
  - Verify violations displayed (if any)
  - Verify severity levels shown

- **TC302**: Generate IaC Code (Terraform)
  - Open blueprint
  - Select "Generate Terraform"
  - Click generate button
  - Wait for code generation
  - Verify Terraform code displayed
  - Verify download button available

- **TC303**: Generate IaC Code (Bicep)
  - Open blueprint
  - Select "Generate Bicep"
  - Generate code
  - Verify Bicep code displayed

- **TC304**: Validate Generated IaC
  - Generate IaC code
  - Click "Validate" button
  - Wait for validation
  - Verify validation results
  - Verify syntax errors highlighted (if any)

- **TC305**: Estimate Costs
  - Open blueprint
  - Click "Estimate Costs" button
  - Wait for cost calculation
  - Verify cost breakdown displayed
  - Verify total monthly cost shown
  - Verify per-resource costs listed

- **TC306**: Create Deployment (Dry Run)
  - Open blueprint
  - Click "Deploy" button
  - Select "Dry Run" mode
  - Fill deployment details
  - Submit deployment
  - Verify deployment queued
  - Monitor deployment status

- **TC307**: View Deployment History
  - Navigate to Deployments page
  - Verify deployments list
  - Filter by status
  - View deployment details

### 5. Risk Assessment & Security
**File**: `e2e/test-security.spec.ts`

- **TC401**: Run Security Risk Assessment
  - Open blueprint with security issues
  - Click "Assess Security Risks" button
  - Wait for AI analysis
  - Verify risk score displayed
  - Verify risk factors listed
  - Verify mitigation recommendations shown

- **TC402**: View Risk Heatmap
  - Navigate to Risk Dashboard
  - Verify heatmap visualization
  - Hover over risk areas
  - Verify tooltips with details

- **TC403**: Apply Security Recommendations
  - View security assessment
  - Click "Apply Recommendation" button
  - Verify blueprint updated
  - Re-run assessment
  - Verify risk score improved

### 6. Cost Optimization
**File**: `e2e/test-cost-optimization.spec.ts`

- **TC501**: View Cost Optimization Recommendations
  - Open blueprint
  - Navigate to "Optimize" tab
  - Wait for ML recommendations
  - Verify recommendations list
  - Verify estimated savings displayed

- **TC502**: Apply Cost Optimization
  - View recommendations
  - Select optimization option
  - Click "Apply" button
  - Verify blueprint updated
  - Verify new cost estimate lower

- **TC503**: Compare Cost Scenarios
  - Create multiple blueprint versions
  - Navigate to cost comparison
  - Select versions to compare
  - Verify side-by-side comparison
  - Verify cost differences highlighted

### 7. Monitoring & Observability
**File**: `e2e/test-monitoring.spec.ts`

- **TC601**: View Deployment Metrics
  - Navigate to active deployment
  - View metrics dashboard
  - Verify resource health indicators
  - Verify real-time updates

- **TC602**: Drift Detection
  - View deployment with drift
  - Verify drift alerts displayed
  - View drift details
  - Verify differences highlighted

- **TC603**: Alert Configuration
  - Navigate to Alerts settings
  - Create new alert rule
  - Configure thresholds
  - Save alert
  - Verify alert appears in list

### 8. Error Handling & Edge Cases
**File**: `e2e/test-error-scenarios.spec.ts`

- **TC701**: Handle Network Errors
  - Simulate network failure
  - Verify error message displayed
  - Verify retry button available

- **TC702**: Handle API Timeouts
  - Trigger long-running operation
  - Wait for timeout
  - Verify timeout message
  - Verify operation can be retried

- **TC703**: Invalid Form Submissions
  - Try to save blueprint without required fields
  - Verify validation errors displayed
  - Verify form not submitted

- **TC704**: Concurrent Edit Conflicts
  - Open blueprint in two tabs
  - Edit in both tabs
  - Save second tab
  - Verify conflict detection
  - Verify merge options

## Test Data Management

### Setup
- Create test user accounts before tests
- Seed database with sample blueprints
- Create test cloud credentials (mock)

### Cleanup
- Delete test blueprints after tests
- Reset test user state
- Clear test deployments

## Test Execution Strategy

### Local Development
```bash
npm run test:e2e              # Run all tests
npm run test:e2e:headed       # Run with visible browser
npm run test:e2e:debug        # Run with debugger
npm run test:e2e:watch        # Run in watch mode
```

### CI/CD Pipeline
```bash
npm run test:e2e:ci           # Run headless with screenshots on failure
```

### Parallel Execution
- Run test files in parallel (up to 3 workers)
- Isolate test contexts to avoid conflicts

## Reporting
- Generate HTML report with screenshots
- Capture videos for failed tests
- Export test results to JUnit XML for CI integration

## Coverage Goals
- ✅ 100% of critical user paths
- ✅ 80%+ of UI components
- ✅ All error scenarios
- ✅ Cross-browser compatibility (Chromium, Firefox, WebKit)

## Implementation Priority
1. **Phase 1**: Authentication & Basic Navigation (TC001-TC005)
2. **Phase 2**: AI Designer & Blueprint Creation (TC101-TC104, TC201-TC206)
3. **Phase 3**: Provisioning Workflow (TC301-TC307)
4. **Phase 4**: Security & Cost Optimization (TC401-TC503)
5. **Phase 5**: Monitoring & Error Handling (TC601-TC704)

## Next Steps
1. Install Playwright: `npm install -D @playwright/test`
2. Initialize Playwright config
3. Create page object models for key pages
4. Implement Phase 1 tests
5. Run tests against local environment
6. Integrate with CI/CD pipeline
