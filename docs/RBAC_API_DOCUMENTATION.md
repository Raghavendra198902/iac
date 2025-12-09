# RBAC API Documentation

## Base URL
```
http://localhost:3050
```

## Authentication
Currently uses basic API key authentication. Add to headers:
```
Authorization: Bearer <api-key>
```

## Endpoints

### Health Check

#### GET /health
Check service health and database connectivity.

**Response**
```json
{
  "status": "healthy",
  "service": "advanced-rbac",
  "timestamp": "2025-12-09T06:00:00.000Z",
  "database": "connected"
}
```

**Status Codes**
- `200` - Service is healthy
- `500` - Service is unhealthy

---

### Permissions Management

#### GET /api/v1/permissions
Retrieve list of permissions with pagination.

**Query Parameters**
- `limit` (integer, optional) - Number of permissions to return (default: 10, max: 100)
- `offset` (integer, optional) - Number of permissions to skip (default: 0)
- `resource` (string, optional) - Filter by resource type
- `action` (string, optional) - Filter by action type
- `scope` (string, optional) - Filter by scope (tenant, project, own)

**Response**
```json
{
  "success": true,
  "count": 76,
  "permissions": [
    {
      "id": "uuid",
      "resource": "architecture",
      "action": "read",
      "scope": "tenant",
      "description": "Read architecture designs",
      "created_at": "2025-12-09T03:51:04.894Z",
      "updated_at": "2025-12-09T03:51:04.894Z"
    }
  ]
}
```

**Example**
```bash
curl http://localhost:3050/api/v1/permissions?limit=5&resource=architecture
```

---

#### POST /api/v1/permissions/check
Check if a user has a specific permission.

**Request Body**
```json
{
  "userId": "string",
  "resource": "string",
  "action": "string",
  "scope": "string",
  "context": {
    "ip": "string (optional)",
    "mfaVerified": "boolean (optional)",
    "tenantId": "string (optional)",
    "projectId": "string (optional)"
  }
}
```

**Response**
```json
{
  "success": true,
  "allowed": true,
  "reason": "Permission granted based on role assignment"
}
```

**Example**
```bash
curl -X POST http://localhost:3050/api/v1/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "resource": "blueprint",
    "action": "create",
    "scope": "project",
    "context": {
      "projectId": "proj-456"
    }
  }'
```

---

#### POST /api/v1/permissions/grant
Grant a permission to a user or role.

**Request Body**
```json
{
  "userId": "string",
  "roleId": "string (optional)",
  "permissionId": "string",
  "scope": "string",
  "conditions": {
    "mfaRequired": "boolean (optional)",
    "ipWhitelist": ["string"] (optional),
    "timeWindow": {
      "start": "string (optional)",
      "end": "string (optional)"
    }
  },
  "expiresAt": "string (optional, ISO 8601)"
}
```

**Response**
```json
{
  "success": true,
  "grantId": "uuid",
  "message": "Permission granted successfully"
}
```

---

#### POST /api/v1/permissions/revoke
Revoke a permission from a user or role.

**Request Body**
```json
{
  "grantId": "string",
  "userId": "string (optional)",
  "permissionId": "string (optional)",
  "reason": "string (optional)"
}
```

**Response**
```json
{
  "success": true,
  "message": "Permission revoked successfully"
}
```

---

### Audit & Analytics

#### GET /api/v1/audit
Retrieve audit logs for permission checks and grants.

**Query Parameters**
- `userId` (string, optional) - Filter by user
- `resource` (string, optional) - Filter by resource
- `action` (string, optional) - Filter by action
- `startDate` (string, optional) - ISO 8601 date
- `endDate` (string, optional) - ISO 8601 date
- `limit` (integer, optional) - Default: 50, max: 500

**Response**
```json
{
  "success": true,
  "count": 100,
  "logs": [
    {
      "id": "uuid",
      "userId": "user-123",
      "resource": "blueprint",
      "action": "create",
      "scope": "project",
      "allowed": true,
      "timestamp": "2025-12-09T06:00:00.000Z",
      "ip": "192.168.1.1",
      "context": {}
    }
  ]
}
```

---

#### GET /api/v1/stats
Get permission usage statistics.

**Query Parameters**
- `period` (string, optional) - Time period: day, week, month (default: week)
- `resource` (string, optional) - Filter by resource

**Response**
```json
{
  "success": true,
  "stats": {
    "total_permissions": 76,
    "total_checks": 1250,
    "total_grants": 45,
    "total_revocations": 3,
    "resources": ["architecture", "blueprint", "policy"],
    "actions": ["create", "read", "update", "delete"],
    "scopes": ["tenant", "project", "own"],
    "top_resources": [
      {
        "resource": "blueprint",
        "checks": 450
      }
    ]
  }
}
```

---

## Data Models

### Permission
```typescript
interface Permission {
  id: string;              // UUID
  resource: string;        // Resource type (e.g., "architecture")
  action: string;          // Action type (e.g., "create", "read")
  scope: string;           // Scope: "tenant", "project", "own"
  description: string;     // Human-readable description
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}
```

### Permission Grant
```typescript
interface PermissionGrant {
  id: string;              // UUID
  user_id: string;         // User UUID
  permission_id: string;   // Permission UUID
  scope: string;           // Scope of the grant
  conditions?: {
    mfa_required?: boolean;
    ip_whitelist?: string[];
    time_window?: {
      start: string;
      end: string;
    };
  };
  expires_at?: string;     // Optional expiration (ISO 8601)
  created_at: string;
  created_by: string;
}
```

### Audit Log
```typescript
interface AuditLog {
  id: string;              // UUID
  user_id: string;         // User who performed the action
  resource: string;        // Resource being accessed
  action: string;          // Action attempted
  scope: string;           // Scope of the action
  allowed: boolean;        // Whether permission was granted
  reason?: string;         // Reason for denial if applicable
  ip?: string;             // IP address of request
  context: object;         // Additional context
  timestamp: string;       // ISO 8601 timestamp
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `INVALID_REQUEST` - Malformed request body or parameters
- `PERMISSION_NOT_FOUND` - Requested permission does not exist
- `USER_NOT_FOUND` - User ID not found in system
- `PERMISSION_DENIED` - User lacks required permission
- `DATABASE_ERROR` - Database operation failed
- `INTERNAL_ERROR` - Unexpected server error

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate limited to:
- 1000 requests per minute per IP
- 100 requests per minute per user

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1702123456
```

---

## Examples

### TypeScript Client
```typescript
import apiService from '@/services/api';

// Get permissions
const permissions = await apiService.rbacService.getPermissions(10);

// Check permission
const result = await apiService.rbacService.checkPermission(
  'architecture',
  'create',
  'project'
);

// Get stats
const stats = await apiService.rbacService.getStats();
```

### cURL Examples

**Get all permissions**
```bash
curl -X GET "http://localhost:3050/api/v1/permissions?limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Check permission**
```bash
curl -X POST "http://localhost:3050/api/v1/permissions/check" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "userId": "user-123",
    "resource": "architecture",
    "action": "read",
    "scope": "tenant"
  }'
```

**Get audit logs**
```bash
curl -X GET "http://localhost:3050/api/v1/audit?userId=user-123&limit=50" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Database Schema

### Tables
1. **permissions** - Core permission definitions
2. **permission_conditions** - Conditional access rules
3. **role_permissions** - Permission assignments to roles
4. **user_permission_grants** - Direct user permission grants
5. **permission_audit_logs** - Audit trail of all checks
6. **permission_usage_stats** - Usage analytics
7. **permission_delegations** - Temporary permission delegations

### Indexes
- Primary keys on all ID columns
- Index on (resource, action, scope) for fast lookups
- Index on user_id for audit queries
- Composite indexes for common query patterns

---

## Best Practices

1. **Cache Permission Checks**
   - Cache results for 5 minutes
   - Invalidate on permission changes

2. **Batch Permission Checks**
   - Check multiple permissions in one request
   - Reduces API calls and latency

3. **Audit Everything**
   - Log all permission checks
   - Include context for debugging

4. **Use Specific Scopes**
   - Prefer project/own over tenant scope
   - Follow principle of least privilege

5. **Handle Errors Gracefully**
   - Implement retry logic
   - Fall back to default deny

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/Raghavendra198902/iac/issues
- Documentation: See PLATFORM_COMPLETE_99_PERCENT.md
- Integration Tests: Run `./scripts/integration-tests.sh`
