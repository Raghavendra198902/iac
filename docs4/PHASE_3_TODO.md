# Phase 3 - Backend Enhancement Todo List

**Goal:** Implement backend API endpoints and permission middleware for role-specific operations

**Status:** Not Started (0%)  
**Priority:** High  
**Estimated Duration:** 2-3 weeks

---

## 🎯 Phase 3 Objectives

Complete the backend implementation to support the role-based frontend dashboards and enable full role-specific workflows as defined in the LLD.

---

## 📋 Todo List

### 1. Permission Middleware System (High Priority)

- [ ] **1.1 Create Base Permission Middleware**
  - File: `/backend/api-gateway/src/middleware/permissions.ts`
  - Implement `requirePermission(resource, action, scope)` function
  - Add scope-based filtering (own/team/project/tenant)
  - Support permission inheritance (EA inherits all permissions)
  - Add permission caching for performance
  - Estimated: 4-6 hours

- [ ] **1.2 Create Scope Resolver Service**
  - File: `/backend/api-gateway/src/services/scopeResolver.ts`
  - Resolve user's project assignments
  - Resolve user's team memberships
  - Resolve tenant ownership
  - Cache scope resolutions
  - Estimated: 3-4 hours

- [ ] **1.3 Add Permission Validation Tests**
  - File: `/backend/api-gateway/src/middleware/__tests__/permissions.test.ts`
  - Test resource-level permissions
  - Test scope-based filtering
  - Test permission inheritance
  - Test edge cases (no permission, multiple roles)
  - Estimated: 3-4 hours

---

### 2. PM (Project Manager) Endpoints (High Priority)

- [ ] **2.1 Deployment Approval Routes**
  - File: `/backend/api-gateway/src/routes/approvals.ts`
  - `POST /api/approvals/deployments/:id/approve` - Approve deployment
  - `POST /api/approvals/deployments/:id/reject` - Reject deployment
  - `GET /api/approvals/pending` - List pending approvals
  - `GET /api/approvals/history` - Approval history
  - Permission: `requirePermission('deployment', 'approve', 'project')`
  - Estimated: 4-5 hours

- [ ] **2.2 Budget Management Routes**
  - File: `/backend/api-gateway/src/routes/budget.ts`
  - `GET /api/budget/projects/:id/summary` - Project budget summary
  - `POST /api/budget/projects/:id/allocate` - Allocate budget
  - `GET /api/budget/variance` - Budget variance analysis
  - `POST /api/budget/alerts/:id/acknowledge` - Acknowledge budget alerts
  - Permission: `requirePermission('budget', 'manage', 'project')`
  - Estimated: 4-5 hours

- [ ] **2.3 Migration Management Routes**
  - File: `/backend/api-gateway/src/routes/migrations.ts`
  - `GET /api/migrations/schedule` - Get migration schedule
  - `POST /api/migrations/phases/:id/approve` - Approve migration phase
  - `PUT /api/migrations/phases/:id/reschedule` - Reschedule phase
  - `GET /api/migrations/risks` - Migration risk assessment
  - Permission: `requirePermission('migration', 'manage', 'project')`
  - Estimated: 4-5 hours

- [ ] **2.4 Project KPI Routes**
  - File: `/backend/api-gateway/src/routes/kpis.ts`
  - `GET /api/kpis/projects/:id` - Project KPIs
  - `GET /api/kpis/portfolio` - Portfolio-level KPIs
  - `POST /api/kpis/thresholds` - Set KPI thresholds
  - `GET /api/kpis/alerts` - KPI threshold alerts
  - Permission: `requirePermission('kpi', 'view', 'project')`
  - Estimated: 3-4 hours

---

### 3. SE (System Engineer) Endpoints (High Priority)

- [ ] **3.1 Deployment Execution Routes**
  - File: `/backend/api-gateway/src/routes/deployments.ts`
  - `POST /api/deployments/:id/execute` - Execute deployment
  - `POST /api/deployments/:id/precheck` - Run pre-deployment checks
  - `POST /api/deployments/:id/postcheck` - Run post-deployment validation
  - `POST /api/deployments/:id/rollback` - Rollback deployment
  - Permission: `requirePermission('deployment', 'execute', 'assigned')`
  - Estimated: 5-6 hours

- [ ] **3.2 Deployment Monitoring Routes**
  - File: `/backend/api-gateway/src/routes/deployment-logs.ts`
  - `GET /api/deployments/:id/logs` - Deployment logs (streaming)
  - `GET /api/deployments/:id/status` - Real-time status
  - `GET /api/deployments/:id/metrics` - Deployment metrics
  - `POST /api/deployments/:id/cancel` - Cancel in-progress deployment
  - Permission: `requirePermission('deployment', 'monitor', 'assigned')`
  - Estimated: 4-5 hours

- [ ] **3.3 Incident Management Routes**
  - File: `/backend/api-gateway/src/routes/incidents.ts`
  - `POST /api/incidents` - Create incident
  - `GET /api/incidents` - List incidents (filtered by assignment)
  - `PUT /api/incidents/:id` - Update incident
  - `POST /api/incidents/:id/resolve` - Resolve incident
  - `POST /api/incidents/:id/escalate` - Escalate incident
  - Permission: `requirePermission('incident', 'manage', 'assigned')`
  - Estimated: 4-5 hours

- [ ] **3.4 System Health Monitoring Routes**
  - File: `/backend/api-gateway/src/routes/health.ts`
  - `GET /api/health/systems` - System health overview
  - `GET /api/health/systems/:id/metrics` - Detailed metrics (CPU, memory, etc.)
  - `GET /api/health/alerts` - Active health alerts
  - `POST /api/health/alerts/:id/acknowledge` - Acknowledge alert
  - Permission: `requirePermission('health', 'monitor', 'project')`
  - Estimated: 4-5 hours

---

### 4. EA (Enterprise Architect) Endpoints (Medium Priority)

- [ ] **4.1 Governance Policy Routes**
  - File: `/backend/api-gateway/src/routes/governance.ts`
  - `GET /api/governance/policies` - List policies
  - `POST /api/governance/policies` - Create policy
  - `PUT /api/governance/policies/:id` - Update policy
  - `DELETE /api/governance/policies/:id` - Delete policy
  - Permission: `requirePermission('policy', 'manage', 'tenant')`
  - Estimated: 4-5 hours

- [ ] **4.2 Compliance Monitoring Routes**
  - File: `/backend/api-gateway/src/routes/compliance.ts`
  - `GET /api/compliance/overview` - Compliance dashboard data
  - `GET /api/compliance/violations` - Policy violations
  - `POST /api/compliance/violations/:id/remediate` - Trigger remediation
  - `GET /api/compliance/reports/:type` - Generate compliance report
  - Permission: `requirePermission('compliance', 'view', 'tenant')`
  - Estimated: 4-5 hours

- [ ] **4.3 Pattern Management Routes**
  - File: `/backend/api-gateway/src/routes/patterns.ts`
  - `GET /api/patterns` - List patterns
  - `POST /api/patterns` - Submit new pattern
  - `POST /api/patterns/:id/approve` - Approve pattern (EA only)
  - `PUT /api/patterns/:id/deprecate` - Deprecate pattern
  - `GET /api/patterns/:id/usage` - Pattern usage analytics
  - Permission: `requirePermission('pattern', 'approve', 'tenant')`
  - Estimated: 4-5 hours

- [ ] **4.4 Architecture Review Routes**
  - File: `/backend/api-gateway/src/routes/reviews.ts`
  - `GET /api/reviews/pending` - Pending architecture reviews
  - `POST /api/reviews/:id/approve` - Approve architecture
  - `POST /api/reviews/:id/reject` - Reject with comments
  - `POST /api/reviews/:id/request-changes` - Request modifications
  - Permission: `requirePermission('architecture', 'review', 'tenant')`
  - Estimated: 4-5 hours

---

### 5. TA (Technical Architect) Endpoints (Medium Priority)

- [ ] **5.1 IaC Generation Routes**
  - File: `/backend/api-gateway/src/routes/iac-generation.ts`
  - `POST /api/iac/generate` - Generate IaC from blueprint
  - `GET /api/iac/:id/status` - Generation status
  - `GET /api/iac/:id/code` - Download generated code
  - `POST /api/iac/:id/regenerate` - Regenerate with options
  - Permission: `requirePermission('iac', 'generate', 'project')`
  - Estimated: 4-5 hours

- [ ] **5.2 Guardrails Management Routes**
  - File: `/backend/api-gateway/src/routes/guardrails.ts`
  - `GET /api/guardrails/violations` - List violations
  - `POST /api/guardrails/violations/:id/override` - Override violation (TA only)
  - `POST /api/guardrails/violations/:id/fix` - Auto-fix violation
  - `GET /api/guardrails/rules` - List guardrail rules
  - Permission: `requirePermission('guardrail', 'override', 'own')`
  - Estimated: 4-5 hours

- [ ] **5.3 Deployment Planning Routes**
  - File: `/backend/api-gateway/src/routes/deployment-plans.ts`
  - `POST /api/deployment-plans` - Create deployment plan
  - `GET /api/deployment-plans/:id` - Get plan details
  - `POST /api/deployment-plans/:id/validate` - Validate plan
  - `GET /api/deployment-plans/:id/readiness` - Readiness checks
  - Permission: `requirePermission('deployment', 'plan', 'project')`
  - Estimated: 4-5 hours

---

### 6. SA (Solution Architect) Endpoints (Medium Priority)

- [ ] **6.1 AI Recommendations Routes**
  - File: `/backend/api-gateway/src/routes/ai-recommendations.ts`
  - `GET /api/ai/recommendations` - Get AI recommendations
  - `POST /api/ai/recommendations/:id/apply` - Apply recommendation
  - `POST /api/ai/recommendations/:id/dismiss` - Dismiss recommendation
  - `POST /api/ai/feedback` - Provide feedback on AI suggestion
  - Permission: `requirePermission('ai', 'use', 'project')`
  - Estimated: 4-5 hours

- [ ] **6.2 Cost Optimization Routes**
  - File: `/backend/api-gateway/src/routes/cost-optimization.ts`
  - `GET /api/cost/analysis/:blueprintId` - Cost analysis
  - `POST /api/cost/optimize/:blueprintId` - Get optimization suggestions
  - `GET /api/cost/projections/:blueprintId` - Cost projections
  - `POST /api/cost/compare` - Compare cost scenarios
  - Permission: `requirePermission('cost', 'analyze', 'project')`
  - Estimated: 4-5 hours

---

### 7. Database Schema Updates (High Priority)

- [ ] **7.1 Create Approvals Table**
  - File: `/database/schemas/V004__approvals_schema.sql`
  - Table: `approvals` (id, type, entity_id, requested_by, approved_by, status, etc.)
  - Table: `approval_comments` (id, approval_id, user_id, comment, created_at)
  - Indexes for performance
  - Estimated: 2-3 hours

- [ ] **7.2 Create Incidents Table**
  - File: `/database/schemas/V005__incidents_schema.sql`
  - Table: `incidents` (id, severity, title, description, service, environment, etc.)
  - Table: `incident_updates` (id, incident_id, user_id, update, created_at)
  - Indexes and foreign keys
  - Estimated: 2-3 hours

- [ ] **7.3 Create Deployment Logs Table**
  - File: `/database/schemas/V006__deployment_logs_schema.sql`
  - Table: `deployment_logs` (id, deployment_id, level, message, timestamp)
  - Table: `deployment_checks` (id, deployment_id, check_type, status, result)
  - Indexes for log queries
  - Estimated: 2-3 hours

- [ ] **7.4 Create Governance Tables**
  - File: `/database/schemas/V007__governance_schema.sql`
  - Table: `governance_policies` (id, name, description, rules, created_by, etc.)
  - Table: `compliance_violations` (id, policy_id, resource_id, severity, etc.)
  - Table: `pattern_approvals` (id, pattern_id, approved_by, status, etc.)
  - Estimated: 2-3 hours

---

### 8. Service Integration (Medium Priority)

- [ ] **8.1 Update Blueprint Service**
  - Add approval workflow integration
  - Add pattern validation
  - Add cost estimation hooks
  - Estimated: 3-4 hours

- [ ] **8.2 Update IaC Generator Service**
  - Add guardrail validation integration
  - Add deployment plan generation
  - Add code quality metrics
  - Estimated: 3-4 hours

- [ ] **8.3 Update Orchestrator Service**
  - Add deployment execution logic
  - Add pre/post check orchestration
  - Add rollback capability
  - Estimated: 4-5 hours

- [ ] **8.4 Update Monitoring Service**
  - Add system health endpoints
  - Add incident creation hooks
  - Add alert management
  - Estimated: 3-4 hours

---

### 9. Testing & Validation (High Priority)

- [ ] **9.1 Unit Tests for Permission Middleware**
  - Test all permission functions
  - Test scope resolution
  - Test edge cases
  - Estimated: 4-5 hours

- [ ] **9.2 Integration Tests for PM Endpoints**
  - Test approval workflows
  - Test budget management
  - Test migration scheduling
  - Estimated: 4-5 hours

- [ ] **9.3 Integration Tests for SE Endpoints**
  - Test deployment execution
  - Test incident management
  - Test health monitoring
  - Estimated: 4-5 hours

- [ ] **9.4 Integration Tests for EA/TA/SA Endpoints**
  - Test governance workflows
  - Test IaC generation
  - Test AI recommendations
  - Estimated: 4-5 hours

- [ ] **9.5 End-to-End Role-Based Workflow Tests**
  - EA approves pattern → SA uses in blueprint → TA generates IaC → PM approves → SE deploys
  - Test permission enforcement
  - Test data isolation by scope
  - Estimated: 5-6 hours

---

### 10. Documentation & Security (Medium Priority)

- [ ] **10.1 API Documentation**
  - Document all new endpoints (Swagger/OpenAPI)
  - Add request/response examples
  - Document permission requirements
  - Estimated: 4-5 hours

- [ ] **10.2 Permission Matrix Documentation**
  - Create comprehensive permission matrix
  - Document scope rules
  - Document inheritance rules
  - Estimated: 2-3 hours

- [ ] **10.3 Security Audit**
  - Run Snyk scan on all backend code
  - Fix any security vulnerabilities
  - Review permission logic for bypasses
  - Estimated: 3-4 hours

- [ ] **10.4 Performance Testing**
  - Load test approval endpoints
  - Load test deployment endpoints
  - Optimize database queries
  - Estimated: 4-5 hours

---

## 📊 Phase 3 Summary

**Total Tasks:** 50+  
**Total Estimated Hours:** 180-220 hours (4.5-5.5 weeks at full-time)

### Priority Breakdown:
- **High Priority:** 24 tasks (Permission system, PM/SE endpoints, Database, Testing)
- **Medium Priority:** 26 tasks (EA/TA/SA endpoints, Integration, Documentation)

### Completion Milestones:
1. **Week 1:** Permission middleware + Database schema (20%)
2. **Week 2:** PM + SE endpoints (50%)
3. **Week 3:** EA/TA/SA endpoints (75%)
4. **Week 4:** Testing + Integration (90%)
5. **Week 5:** Documentation + Security audit (100%)

### Success Criteria:
- ✅ All role-specific endpoints implemented
- ✅ Granular permission system working
- ✅ 90%+ test coverage on new code
- ✅ Zero high/critical security vulnerabilities
- ✅ API documentation complete
- ✅ Performance benchmarks met

---

## 🚀 Getting Started

**Recommended order:**
1. Start with permission middleware (Foundation)
2. Database schema updates
3. PM endpoints (High business value)
4. SE endpoints (High business value)
5. EA/TA/SA endpoints
6. Integration + Testing
7. Documentation + Security

**Next Command:** Proceed to Phase 3, Task 1.1 - Create Base Permission Middleware
