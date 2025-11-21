# IAC DHARMA - Role Implementation Status (EA/SA/TA/PM/SE)

**Date:** November 16, 2025  
**Status:** Partially Implemented (40% Complete)

---

## Overview

The IAC DHARMA platform is designed around **5 enterprise roles** as defined in the LLD:
- **EA** - Enterprise Architect
- **SA** - Solution Architect  
- **TA** - Technical Architect
- **PM** - Project Manager
- **SE** - System Engineer

Additionally, two supporting roles:
- **Consultant** - Pre-sales and proposal generation
- **Admin** - Platform administration

---

## ✅ IMPLEMENTED (40%)

### 1. Database Schema (100% Complete)

**File:** `/database/schemas/V001__core_schema.sql`

```sql
-- Roles table (predefined: EA, SA, TA, PM, Consultant, SE, Admin)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL,  -- 'EA', 'SA', 'TA', 'PM', 'SE'
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

-- User roles mapping (many-to-many)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, role_id)
);
```

**Status:** ✅ **Complete** - Database tables exist for multi-role assignment

---

### 2. Authentication Middleware (100% Complete)

**File:** `/backend/api-gateway/src/middleware/auth.ts`

```typescript
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];  // Array of role codes: ['EA', 'SA', 'TA']
    tenantId: string;
  };
}

// Role-based authorization middleware
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const hasRole = allowedRoles.some(role => req.user!.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};
```

**Status:** ✅ **Complete** - JWT-based RBAC with role checking

---

### 3. API Route Protection (60% Complete)

#### Blueprint Routes
**File:** `/backend/api-gateway/src/routes/blueprints.ts`

```typescript
// Create blueprint (EA, SA, TA only)
router.post('/', requireRole('EA', 'SA', 'TA'), async (req: AuthRequest, res) => {
  // Only architects can create blueprints
});

// Update blueprint (EA, SA, TA only)
router.put('/:id', requireRole('EA', 'SA', 'TA'), async (req: AuthRequest, res) => {
  // Only architects can modify blueprints
});

// Delete blueprint (EA, SA only)
router.delete('/:id', requireRole('EA', 'SA'), async (req: AuthRequest, res) => {
  // Only enterprise/solution architects can delete
});
```

#### IaC Generation Routes
**File:** `/backend/api-gateway/src/routes/iac.ts`

```typescript
// Generate IaC (EA, SA, TA only)
router.post('/generate', requireRole('EA', 'SA', 'TA'), async (req: AuthRequest, res) => {
  // Only architects can generate infrastructure code
});
```

**Status:** ⚠️ **Partial** - Only 2 route files implement role checks

---

## ❌ NOT IMPLEMENTED / MISSING (60%)

### 1. Role-Specific UI Views (0% Complete)

**Missing:** Role-aware frontend routing and dashboards

#### What's Needed:
```typescript
// frontend/src/contexts/AuthContext.tsx
interface User {
  id: string;
  email: string;
  roles: string[];  // ['EA', 'SA']
  permissions: string[];
}

// frontend/src/components/RoleBasedRoute.tsx
<RoleBasedRoute allowedRoles={['EA', 'SA', 'TA']}>
  <BlueprintDesigner />
</RoleBasedRoute>

// frontend/src/pages/Dashboard.tsx
{user.roles.includes('EA') && <EnterpriseArchitectDashboard />}
{user.roles.includes('SA') && <SolutionArchitectDashboard />}
{user.roles.includes('PM') && <ProjectManagerDashboard />}
```

**Impact:** ❌ All users see the same UI regardless of role

---

### 2. Role-Specific Workflows (10% Complete)

According to LLD Section 6.2, each role should have tailored workflows:

#### EA - Enterprise Architect (Missing)
- ❌ High-Level Architecture creation wizard
- ❌ Standards & Guardrails mapping interface
- ❌ Governance approval workflow
- ❌ Reference pattern management

#### SA - Solution Architect (Partial)
- ⚠️ Blueprint creation (basic exists)
- ❌ Requirement → Technical topology converter
- ❌ AI suggestion acceptance workflow
- ❌ Collaboration with TA interface

#### TA - Technical Architect (Partial)
- ⚠️ Deep infrastructure design (basic exists)
- ❌ CIDR/NSG/Subnet designer
- ❌ Security compliance fixer
- ❌ IaC validation workflow

#### PM - Project Manager (Missing)
- ❌ Cost review dashboard
- ❌ Risk review interface
- ❌ Approval orchestration
- ❌ Migration wave scheduler
- ❌ Deployment progress tracking

#### SE - System Engineer (Missing)
- ❌ Pre-check execution interface
- ❌ Deployment runbook wizard
- ❌ Post-check validation
- ❌ Incident reporting

---

### 3. Role-Based Permissions (20% Complete)

**Missing:** Granular permission system

#### Current State:
```typescript
// Only basic role checks exist
requireRole('EA', 'SA', 'TA')
```

#### What's Needed:
```typescript
// Permission-based access control
interface Permission {
  resource: string;  // 'blueprint', 'deployment', 'costing'
  action: string;    // 'create', 'read', 'update', 'delete', 'approve'
  scope: string;     // 'own', 'team', 'project', 'tenant'
}

// Example permissions by role
const EA_PERMISSIONS = [
  'blueprint:approve:tenant',
  'policy:create:tenant',
  'pattern:create:tenant',
  'project:create:tenant'
];

const SA_PERMISSIONS = [
  'blueprint:create:project',
  'blueprint:update:own',
  'costing:view:project'
];

const TA_PERMISSIONS = [
  'blueprint:update:project',
  'iac:generate:project',
  'guardrails:override:own'
];

const PM_PERMISSIONS = [
  'deployment:approve:project',
  'costing:view:project',
  'migration:schedule:project'
];

const SE_PERMISSIONS = [
  'deployment:execute:own',
  'monitoring:view:project',
  'incident:create:project'
];
```

---

### 4. Role-Specific API Endpoints (30% Complete)

#### Missing Endpoints by Role:

**EA Endpoints (0% implemented):**
```
POST   /api/governance/standards       - Create governance standards
POST   /api/patterns/approve           - Approve reference patterns
GET    /api/compliance/reports         - View compliance reports
POST   /api/policies/global            - Create tenant-wide policies
```

**SA Endpoints (20% implemented):**
```
✅ POST   /api/blueprints                - Create blueprints (exists)
❌ POST   /api/blueprints/from-requirements - Convert requirements to design
❌ GET    /api/patterns/suggestions      - Get AI pattern suggestions
❌ POST   /api/blueprints/compare        - Compare blueprint versions
```

**TA Endpoints (30% implemented):**
```
✅ PUT    /api/blueprints/:id            - Update blueprints (exists)
✅ POST   /api/iac/generate              - Generate IaC (exists)
❌ POST   /api/guardrails/override       - Override guardrail violations
❌ POST   /api/blueprints/:id/validate   - Deep technical validation
```

**PM Endpoints (0% implemented):**
```
❌ GET    /api/costing/summary           - Project cost summary
❌ POST   /api/deployments/approve       - Approve deployments
❌ GET    /api/migration/schedule        - View migration schedule
❌ POST   /api/migration/waves           - Plan migration waves
❌ GET    /api/projects/:id/kpis         - Project KPIs dashboard
```

**SE Endpoints (0% implemented):**
```
❌ POST   /api/deployments/execute       - Execute deployment
❌ GET    /api/deployments/:id/logs      - View deployment logs
❌ POST   /api/deployments/:id/precheck  - Run pre-deployment checks
❌ POST   /api/deployments/:id/postcheck - Run post-deployment checks
❌ POST   /api/incidents                 - Report incidents
```

---

### 5. Role-Based Notification Preferences (0% Complete)

**Missing:** Role-specific alerting

```typescript
// What's needed:
interface NotificationPreferences {
  EA: {
    policyViolations: 'immediate',
    newPatterns: 'daily',
    complianceIssues: 'immediate'
  },
  SA: {
    blueprintComments: 'immediate',
    aiSuggestions: 'realtime',
    guardrailWarnings: 'immediate'
  },
  PM: {
    costOverruns: 'immediate',
    deploymentComplete: 'immediate',
    approvalRequests: 'immediate'
  },
  SE: {
    deploymentFailures: 'immediate',
    driftDetected: 'hourly',
    healthCheckFailures: 'immediate'
  }
}
```

---

### 6. Role-Based Audit Logging (40% Complete)

**Partial:** Basic audit logs exist but not role-aware

```typescript
// What's needed:
interface AuditLog {
  timestamp: string;
  userId: string;
  role: string;  // 'EA', 'SA', 'TA', 'PM', 'SE'
  action: string;
  resource: string;
  outcome: 'success' | 'failure';
  details: object;
}

// Example audit events by role:
EA_AUDIT_EVENTS = [
  'policy.created',
  'pattern.approved',
  'standard.updated',
  'governance.enforced'
];

PM_AUDIT_EVENTS = [
  'deployment.approved',
  'budget.allocated',
  'wave.scheduled',
  'project.archived'
];
```

---

### 7. Role-Based Data Filtering (0% Complete)

**Missing:** Data isolation by role scope

```typescript
// What's needed:
// EA - See all tenant data
SELECT * FROM blueprints WHERE tenant_id = ?

// SA - See only own + team blueprints
SELECT * FROM blueprints 
WHERE tenant_id = ? 
AND (owner_id = ? OR team_id IN (?))

// PM - See only project blueprints
SELECT * FROM blueprints 
WHERE project_id = ?

// SE - See only assigned deployments
SELECT * FROM deployments 
WHERE assigned_to = ?
```

---

## 📊 Implementation Status by Component

| Component | EA | SA | TA | PM | SE | Overall |
|-----------|----|----|----|----|----|---------| 
| **Database Schema** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% |
| **Auth Middleware** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% |
| **API Routes** | ⚠️ 30% | ⚠️ 40% | ⚠️ 50% | ❌ 10% | ❌ 5% | ⚠️ 27% |
| **Frontend UI** | ❌ 0% | ❌ 0% | ❌ 0% | ❌ 0% | ❌ 0% | ❌ 0% |
| **Workflows** | ❌ 5% | ⚠️ 15% | ⚠️ 20% | ❌ 0% | ❌ 0% | ❌ 8% |
| **Permissions** | ⚠️ 20% | ⚠️ 20% | ⚠️ 20% | ⚠️ 20% | ⚠️ 20% | ⚠️ 20% |
| **Notifications** | ❌ 0% | ❌ 0% | ❌ 0% | ❌ 0% | ❌ 0% | ❌ 0% |
| **Audit Logs** | ⚠️ 40% | ⚠️ 40% | ⚠️ 40% | ⚠️ 40% | ⚠️ 40% | ⚠️ 40% |
| **Data Filtering** | ❌ 0% | ❌ 0% | ❌ 0% | ❌ 0% | ❌ 0% | ❌ 0% |
| **TOTAL** | ⚠️ 33% | ⚠️ 35% | ⚠️ 37% | ❌ 19% | ❌ 18% | ⚠️ 28% |

---

## 🎯 Priority Implementation Plan

### Phase 1: Core Role Functionality (2-3 months)

#### 1. Frontend Role Context (High Priority)
```typescript
// frontend/src/contexts/AuthContext.tsx
- Implement role-aware context provider
- Add role checking hooks
- Create role-based route guards
```

#### 2. Role-Specific Dashboards (High Priority)
```typescript
// Create 5 separate dashboard components
- EnterpriseArchitectDashboard.tsx
- SolutionArchitectDashboard.tsx  
- TechnicalArchitectDashboard.tsx
- ProjectManagerDashboard.tsx
- SystemEngineerDashboard.tsx
```

#### 3. Permission System (Critical)
```typescript
// backend/api-gateway/src/middleware/permissions.ts
- Implement granular permission checking
- Add resource-level access control
- Create scope-based filtering (own/team/project/tenant)
```

#### 4. Role-Specific API Routes (Critical)
```
- PM approval endpoints
- SE deployment execution endpoints
- EA governance endpoints
- TA validation endpoints
```

---

### Phase 2: Advanced Role Features (3-4 months)

#### 5. Workflow Engines
```
- EA governance workflow
- SA design collaboration workflow
- PM approval workflow
- SE deployment workflow
```

#### 6. Notification System
```
- Role-based email/Slack alerts
- Real-time UI notifications
- Preference management
```

#### 7. Data Filtering & Isolation
```
- Row-level security in PostgreSQL
- Role-based query filters
- Tenant/project scoping
```

---

### Phase 3: Enterprise Features (2-3 months)

#### 8. Audit & Compliance
```
- Role-based audit trails
- Compliance reporting by role
- Activity dashboards
```

#### 9. Advanced Permissions
```
- Time-based role assignments
- Delegated administration
- Break-glass emergency access
```

---

## 📍 Current Implementation Locations

### Where Roles ARE Implemented:
```
✅ /database/schemas/V001__core_schema.sql
   - roles table
   - user_roles mapping

✅ /backend/api-gateway/src/middleware/auth.ts
   - requireRole() middleware
   - Role checking logic

✅ /backend/api-gateway/src/routes/blueprints.ts
   - POST / - requireRole('EA', 'SA', 'TA')
   - PUT /:id - requireRole('EA', 'SA', 'TA')
   - DELETE /:id - requireRole('EA', 'SA')

✅ /backend/api-gateway/src/routes/iac.ts
   - POST /generate - requireRole('EA', 'SA', 'TA')
```

### Where Roles are MISSING:
```
❌ /frontend/src/contexts/AuthContext.tsx
   - No role context provider

❌ /frontend/src/pages/*.tsx
   - No role-specific dashboards

❌ /backend/api-gateway/src/routes/deployments.ts
   - No PM approval routes
   - No SE execution routes

❌ /backend/api-gateway/src/routes/governance.ts
   - No EA governance routes

❌ /backend/api-gateway/src/middleware/permissions.ts
   - No granular permission system
```

---

## 🔍 Code Examples

### Current Implementation:
```typescript
// This works:
router.post('/blueprints', requireRole('EA', 'SA', 'TA'), handler);

// This does NOT work yet:
router.post('/blueprints', requirePermission('blueprint:create', 'project'), handler);
```

### What's Needed:
```typescript
// Permission-based with scope
export const requirePermission = (
  permission: string, 
  scope: 'own' | 'team' | 'project' | 'tenant'
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user's roles include required permission
    // Check if user has access to resource at given scope
    // Apply data filtering based on scope
  };
};
```

---

## 📝 Summary

### What EXISTS:
- ✅ Database tables for roles (EA/SA/TA/PM/SE)
- ✅ JWT authentication with role array
- ✅ Basic requireRole() middleware
- ✅ 2 route files with role protection

### What's MISSING:
- ❌ Frontend role-aware UI (0%)
- ❌ Role-specific dashboards (0%)
- ❌ Granular permission system (0%)
- ❌ Role-specific workflows (10%)
- ❌ PM/SE API endpoints (0%)
- ❌ EA governance interface (0%)
- ❌ Role-based notifications (0%)
- ❌ Data filtering by role (0%)

### Estimated Completion Time:
- **Phase 1 (Core):** 2-3 months
- **Phase 2 (Advanced):** 3-4 months  
- **Phase 3 (Enterprise):** 2-3 months
- **Total:** 7-10 months to full role maturity

---

**Conclusion:** The IAC DHARMA platform has **foundational role infrastructure** (database + auth middleware) but lacks **user-facing role differentiation**. All users currently see the same interface regardless of their role (EA/SA/TA/PM/SE).
