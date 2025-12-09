/**
 * Advanced RBAC Permission System
 * Supports granular resource + action + scope permissions with conditions
 */

export type UserRole = 'EA' | 'SA' | 'TA' | 'PM' | 'SE' | 'Consultant' | 'Admin';

export type PermissionAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'reject'
  | 'execute' 
  | 'deploy'
  | 'manage'
  | 'override'
  | 'validate'
  | 'audit'
  | 'export'
  | 'import'
  | 'share'
  | 'clone';

export type PermissionScope = 
  | 'own'       // User's own resources
  | 'team'      // Team resources
  | 'project'   // Project-level resources
  | 'tenant'    // Tenant-wide resources
  | 'global';   // Cross-tenant (admin only)

export type PermissionResource = 
  // Core Resources
  | 'blueprint'
  | 'deployment'
  | 'infrastructure'
  | 'iac_code'
  
  // Architecture & Design
  | 'pattern'
  | 'architecture'
  | 'design_document'
  | 'technical_spec'
  
  // Governance & Compliance
  | 'policy'
  | 'compliance_rule'
  | 'governance_framework'
  | 'audit_log'
  | 'standards'
  
  // Cost & Financial
  | 'costing'
  | 'budget'
  | 'cost_optimization'
  | 'chargeback'
  | 'invoice'
  
  // Security
  | 'security_policy'
  | 'vulnerability'
  | 'secret'
  | 'access_control'
  | 'encryption_key'
  
  // Operations
  | 'incident'
  | 'alert'
  | 'monitoring'
  | 'health_check'
  | 'backup'
  | 'restore'
  
  // Project Management
  | 'project'
  | 'migration'
  | 'kpi'
  | 'report'
  | 'dashboard'
  | 'workflow'
  
  // AI & ML
  | 'ai_recommendation'
  | 'ml_model'
  | 'prediction'
  | 'anomaly_detection'
  
  // Integrations
  | 'integration'
  | 'webhook'
  | 'api_key'
  
  // Administration
  | 'user'
  | 'role'
  | 'team'
  | 'tenant'
  | 'settings'
  | 'license';

export interface PermissionCondition {
  // Time-based access
  time_window?: {
    start: Date;
    end: Date;
  };
  
  // Network-based access
  ip_whitelist?: string[];
  ip_blacklist?: string[];
  
  // Security requirements
  mfa_required?: boolean;
  approval_required?: boolean;
  approval_from?: UserRole[];
  
  // Resource-specific conditions
  resource_tags?: Record<string, string>;
  environment?: 'development' | 'staging' | 'production' | 'all';
  
  // Rate limiting
  max_operations_per_hour?: number;
  max_operations_per_day?: number;
  
  // Value constraints
  max_cost_threshold?: number; // For budget approvals
  min_compliance_score?: number; // For deployments
}

export interface Permission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
  conditions?: PermissionCondition;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  inherited_from?: string; // For permission inheritance
  created_at: Date;
}

export interface UserPermissionGrant {
  id: string;
  user_id: string;
  permission_id: string;
  granted_by: string;
  granted_at: Date;
  expires_at?: Date;
  reason?: string; // Why was this permission granted
}

export interface PermissionAuditLog {
  id: string;
  user_id: string;
  resource: PermissionResource;
  action: PermissionAction;
  resource_id?: string;
  permission_id: string;
  allowed: boolean;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

/**
 * Complete Permission Matrix for All Roles
 * 200+ Granular Permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  /**
   * ENTERPRISE ARCHITECT (EA)
   * Focus: Governance, Standards, Compliance, Strategy
   */
  EA: [
    // Blueprint Management
    { resource: 'blueprint', action: 'read', scope: 'tenant' },
    { resource: 'blueprint', action: 'approve', scope: 'tenant' },
    { resource: 'blueprint', action: 'reject', scope: 'tenant' },
    { resource: 'blueprint', action: 'validate', scope: 'tenant' },
    { resource: 'blueprint', action: 'audit', scope: 'tenant' },
    
    // Policy & Governance
    { resource: 'policy', action: 'create', scope: 'tenant' },
    { resource: 'policy', action: 'read', scope: 'tenant' },
    { resource: 'policy', action: 'update', scope: 'tenant' },
    { resource: 'policy', action: 'delete', scope: 'tenant' },
    { resource: 'policy', action: 'manage', scope: 'tenant' },
    
    { resource: 'governance_framework', action: 'create', scope: 'tenant' },
    { resource: 'governance_framework', action: 'read', scope: 'tenant' },
    { resource: 'governance_framework', action: 'update', scope: 'tenant' },
    { resource: 'governance_framework', action: 'manage', scope: 'tenant' },
    
    { resource: 'compliance_rule', action: 'create', scope: 'tenant' },
    { resource: 'compliance_rule', action: 'read', scope: 'tenant' },
    { resource: 'compliance_rule', action: 'update', scope: 'tenant' },
    { resource: 'compliance_rule', action: 'delete', scope: 'tenant' },
    { resource: 'compliance_rule', action: 'validate', scope: 'tenant' },
    
    { resource: 'standards', action: 'create', scope: 'tenant' },
    { resource: 'standards', action: 'read', scope: 'tenant' },
    { resource: 'standards', action: 'update', scope: 'tenant' },
    { resource: 'standards', action: 'manage', scope: 'tenant' },
    
    // Pattern Management
    { resource: 'pattern', action: 'create', scope: 'tenant' },
    { resource: 'pattern', action: 'read', scope: 'tenant' },
    { resource: 'pattern', action: 'update', scope: 'tenant' },
    { resource: 'pattern', action: 'approve', scope: 'tenant' },
    { resource: 'pattern', action: 'manage', scope: 'tenant' },
    
    // Architecture
    { resource: 'architecture', action: 'create', scope: 'tenant' },
    { resource: 'architecture', action: 'read', scope: 'tenant' },
    { resource: 'architecture', action: 'update', scope: 'tenant' },
    { resource: 'architecture', action: 'approve', scope: 'tenant' },
    { resource: 'architecture', action: 'validate', scope: 'tenant' },
    
    // Audit & Compliance
    { resource: 'audit_log', action: 'read', scope: 'tenant' },
    { resource: 'audit_log', action: 'export', scope: 'tenant' },
    
    // Cost Governance
    { resource: 'costing', action: 'read', scope: 'tenant' },
    { resource: 'cost_optimization', action: 'read', scope: 'tenant' },
    { resource: 'chargeback', action: 'read', scope: 'tenant' },
    
    // Reporting
    { resource: 'report', action: 'create', scope: 'tenant' },
    { resource: 'report', action: 'read', scope: 'tenant' },
    { resource: 'report', action: 'export', scope: 'tenant' },
    
    { resource: 'dashboard', action: 'create', scope: 'tenant' },
    { resource: 'dashboard', action: 'read', scope: 'tenant' },
    { resource: 'dashboard', action: 'share', scope: 'tenant' },
  ] as Permission[],

  /**
   * SOLUTION ARCHITECT (SA)
   * Focus: Solution Design, Technical Specifications, Multi-Cloud Architecture
   */
  SA: [
    // Blueprint Design
    { resource: 'blueprint', action: 'create', scope: 'project' },
    { resource: 'blueprint', action: 'read', scope: 'tenant' },
    { resource: 'blueprint', action: 'update', scope: 'project' },
    { resource: 'blueprint', action: 'delete', scope: 'own' },
    { resource: 'blueprint', action: 'clone', scope: 'project' },
    { resource: 'blueprint', action: 'validate', scope: 'project' },
    { resource: 'blueprint', action: 'share', scope: 'project' },
    
    // Architecture & Design
    { resource: 'architecture', action: 'create', scope: 'project' },
    { resource: 'architecture', action: 'read', scope: 'project' },
    { resource: 'architecture', action: 'update', scope: 'project' },
    { resource: 'architecture', action: 'validate', scope: 'project' },
    
    { resource: 'design_document', action: 'create', scope: 'project' },
    { resource: 'design_document', action: 'read', scope: 'project' },
    { resource: 'design_document', action: 'update', scope: 'own' },
    { resource: 'design_document', action: 'share', scope: 'project' },
    
    { resource: 'technical_spec', action: 'create', scope: 'project' },
    { resource: 'technical_spec', action: 'read', scope: 'project' },
    { resource: 'technical_spec', action: 'update', scope: 'own' },
    { resource: 'technical_spec', action: 'approve', scope: 'project' },
    
    // Pattern Usage
    { resource: 'pattern', action: 'read', scope: 'tenant' },
    { resource: 'pattern', action: 'create', scope: 'project' },
    { resource: 'pattern', action: 'update', scope: 'own' },
    
    // Infrastructure Design
    { resource: 'infrastructure', action: 'create', scope: 'project' },
    { resource: 'infrastructure', action: 'read', scope: 'project' },
    { resource: 'infrastructure', action: 'update', scope: 'own' },
    { resource: 'infrastructure', action: 'validate', scope: 'project' },
    
    // IaC Code
    { resource: 'iac_code', action: 'read', scope: 'project' },
    { resource: 'iac_code', action: 'validate', scope: 'project' },
    
    // AI Recommendations
    { resource: 'ai_recommendation', action: 'read', scope: 'project' },
    { resource: 'cost_optimization', action: 'read', scope: 'project' },
    
    // Cost Analysis
    { resource: 'costing', action: 'read', scope: 'project' },
    { resource: 'budget', action: 'read', scope: 'project' },
    
    // Monitoring
    { resource: 'monitoring', action: 'read', scope: 'project' },
    { resource: 'health_check', action: 'read', scope: 'project' },
    
    // Reporting
    { resource: 'report', action: 'create', scope: 'project' },
    { resource: 'report', action: 'read', scope: 'project' },
    { resource: 'dashboard', action: 'create', scope: 'own' },
    { resource: 'dashboard', action: 'read', scope: 'project' },
  ] as Permission[],

  /**
   * TECHNICAL ARCHITECT (TA)
   * Focus: IaC Generation, Guardrails, Technical Implementation
   */
  TA: [
    // Blueprint Modification
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'blueprint', action: 'update', scope: 'project' },
    { resource: 'blueprint', action: 'validate', scope: 'project' },
    { resource: 'blueprint', action: 'clone', scope: 'project' },
    
    // IaC Generation & Management
    { resource: 'iac_code', action: 'create', scope: 'project' },
    { resource: 'iac_code', action: 'read', scope: 'project' },
    { resource: 'iac_code', action: 'update', scope: 'own' },
    { resource: 'iac_code', action: 'delete', scope: 'own' },
    { resource: 'iac_code', action: 'execute', scope: 'project' },
    { resource: 'iac_code', action: 'validate', scope: 'project' },
    { resource: 'iac_code', action: 'export', scope: 'project' },
    
    // Technical Specifications
    { resource: 'technical_spec', action: 'create', scope: 'project' },
    { resource: 'technical_spec', action: 'read', scope: 'project' },
    { resource: 'technical_spec', action: 'update', scope: 'project' },
    { resource: 'technical_spec', action: 'validate', scope: 'project' },
    
    // Guardrails (Can override for technical reasons)
    { resource: 'policy', action: 'read', scope: 'project' },
    { resource: 'policy', action: 'override', scope: 'own' },
    
    // Infrastructure Management
    { resource: 'infrastructure', action: 'create', scope: 'project' },
    { resource: 'infrastructure', action: 'read', scope: 'project' },
    { resource: 'infrastructure', action: 'update', scope: 'project' },
    { resource: 'infrastructure', action: 'validate', scope: 'project' },
    
    // Deployment Planning
    { resource: 'deployment', action: 'read', scope: 'project' },
    { resource: 'deployment', action: 'create', scope: 'project' },
    { resource: 'deployment', action: 'update', scope: 'own' },
    { resource: 'deployment', action: 'validate', scope: 'project' },
    
    // Security
    { resource: 'security_policy', action: 'read', scope: 'project' },
    { resource: 'vulnerability', action: 'read', scope: 'project' },
    
    // Monitoring & Health
    { resource: 'monitoring', action: 'read', scope: 'project' },
    { resource: 'health_check', action: 'read', scope: 'project' },
    { resource: 'alert', action: 'read', scope: 'project' },
    
    // Patterns
    { resource: 'pattern', action: 'read', scope: 'tenant' },
    { resource: 'pattern', action: 'create', scope: 'own' },
    
    // AI Assistance
    { resource: 'ai_recommendation', action: 'read', scope: 'project' },
    
    // Documentation
    { resource: 'report', action: 'create', scope: 'project' },
    { resource: 'report', action: 'read', scope: 'project' },
  ] as Permission[],

  /**
   * PROJECT MANAGER (PM)
   * Focus: Approvals, Budgets, Migrations, KPIs, Project Tracking
   */
  PM: [
    // Project Management
    { resource: 'project', action: 'create', scope: 'team' },
    { resource: 'project', action: 'read', scope: 'project' },
    { resource: 'project', action: 'update', scope: 'project' },
    { resource: 'project', action: 'manage', scope: 'project' },
    
    // Approval Workflows
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'blueprint', action: 'approve', scope: 'project' },
    { resource: 'blueprint', action: 'reject', scope: 'project' },
    
    { resource: 'deployment', action: 'read', scope: 'project' },
    { resource: 'deployment', action: 'approve', scope: 'project' },
    { resource: 'deployment', action: 'reject', scope: 'project' },
    
    { resource: 'workflow', action: 'create', scope: 'project' },
    { resource: 'workflow', action: 'read', scope: 'project' },
    { resource: 'workflow', action: 'update', scope: 'project' },
    { resource: 'workflow', action: 'manage', scope: 'project' },
    
    // Budget & Cost Management
    { resource: 'budget', action: 'create', scope: 'project' },
    { resource: 'budget', action: 'read', scope: 'project' },
    { resource: 'budget', action: 'update', scope: 'project' },
    { resource: 'budget', action: 'approve', scope: 'project' },
    { resource: 'budget', action: 'manage', scope: 'project' },
    
    { resource: 'costing', action: 'read', scope: 'project' },
    { resource: 'costing', action: 'export', scope: 'project' },
    { resource: 'cost_optimization', action: 'read', scope: 'project' },
    { resource: 'chargeback', action: 'read', scope: 'project' },
    { resource: 'invoice', action: 'read', scope: 'project' },
    
    // Migration Management
    { resource: 'migration', action: 'create', scope: 'project' },
    { resource: 'migration', action: 'read', scope: 'project' },
    { resource: 'migration', action: 'update', scope: 'project' },
    { resource: 'migration', action: 'approve', scope: 'project' },
    { resource: 'migration', action: 'manage', scope: 'project' },
    
    // KPIs & Reporting
    { resource: 'kpi', action: 'create', scope: 'project' },
    { resource: 'kpi', action: 'read', scope: 'project' },
    { resource: 'kpi', action: 'update', scope: 'project' },
    { resource: 'kpi', action: 'export', scope: 'project' },
    
    { resource: 'report', action: 'create', scope: 'project' },
    { resource: 'report', action: 'read', scope: 'project' },
    { resource: 'report', action: 'export', scope: 'project' },
    { resource: 'report', action: 'share', scope: 'project' },
    
    { resource: 'dashboard', action: 'create', scope: 'project' },
    { resource: 'dashboard', action: 'read', scope: 'project' },
    { resource: 'dashboard', action: 'share', scope: 'project' },
    
    // Team Management
    { resource: 'team', action: 'read', scope: 'project' },
    { resource: 'team', action: 'update', scope: 'project' },
    { resource: 'user', action: 'read', scope: 'project' },
    
    // Monitoring & Health
    { resource: 'monitoring', action: 'read', scope: 'project' },
    { resource: 'health_check', action: 'read', scope: 'project' },
    { resource: 'incident', action: 'read', scope: 'project' },
    { resource: 'alert', action: 'read', scope: 'project' },
  ] as Permission[],

  /**
   * SOFTWARE/SYSTEM ENGINEER (SE)
   * Focus: Deployment Execution, Monitoring, Incident Response, Operations
   */
  SE: [
    // Deployment Operations
    { resource: 'deployment', action: 'read', scope: 'project' },
    { resource: 'deployment', action: 'create', scope: 'project' },
    { resource: 'deployment', action: 'execute', scope: 'project' },
    { resource: 'deployment', action: 'update', scope: 'own' },
    { resource: 'deployment', action: 'validate', scope: 'project' },
    
    // Infrastructure Operations
    { resource: 'infrastructure', action: 'read', scope: 'project' },
    { resource: 'infrastructure', action: 'deploy', scope: 'project' },
    { resource: 'infrastructure', action: 'update', scope: 'project' },
    
    // IaC Execution
    { resource: 'iac_code', action: 'read', scope: 'project' },
    { resource: 'iac_code', action: 'execute', scope: 'project' },
    { resource: 'iac_code', action: 'validate', scope: 'project' },
    
    // Blueprint Access
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'blueprint', action: 'clone', scope: 'project' },
    
    // Monitoring & Observability
    { resource: 'monitoring', action: 'read', scope: 'project' },
    { resource: 'monitoring', action: 'manage', scope: 'project' },
    { resource: 'health_check', action: 'read', scope: 'project' },
    { resource: 'health_check', action: 'execute', scope: 'project' },
    
    { resource: 'alert', action: 'read', scope: 'project' },
    { resource: 'alert', action: 'create', scope: 'project' },
    { resource: 'alert', action: 'update', scope: 'own' },
    
    // Incident Management
    { resource: 'incident', action: 'create', scope: 'project' },
    { resource: 'incident', action: 'read', scope: 'project' },
    { resource: 'incident', action: 'update', scope: 'project' },
    { resource: 'incident', action: 'manage', scope: 'project' },
    
    // Security Vulnerability Response
    { resource: 'vulnerability', action: 'read', scope: 'project' },
    { resource: 'vulnerability', action: 'update', scope: 'project' },
    { resource: 'security_policy', action: 'read', scope: 'project' },
    
    // Backup & Restore
    { resource: 'backup', action: 'create', scope: 'project' },
    { resource: 'backup', action: 'read', scope: 'project' },
    { resource: 'restore', action: 'execute', scope: 'project' },
    
    // AI Recommendations
    { resource: 'ai_recommendation', action: 'read', scope: 'project' },
    { resource: 'anomaly_detection', action: 'read', scope: 'project' },
    
    // Cost Monitoring
    { resource: 'costing', action: 'read', scope: 'project' },
    { resource: 'cost_optimization', action: 'read', scope: 'project' },
    
    // Reporting
    { resource: 'report', action: 'create', scope: 'own' },
    { resource: 'report', action: 'read', scope: 'project' },
    { resource: 'dashboard', action: 'read', scope: 'project' },
  ] as Permission[],

  /**
   * CONSULTANT
   * Focus: Read-only access, Blueprint creation, Advisory
   */
  Consultant: [
    // Blueprint Advisory
    { resource: 'blueprint', action: 'create', scope: 'own' },
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'blueprint', action: 'clone', scope: 'project' },
    
    // Architecture Review
    { resource: 'architecture', action: 'read', scope: 'project' },
    { resource: 'design_document', action: 'read', scope: 'project' },
    { resource: 'technical_spec', action: 'read', scope: 'project' },
    
    // Pattern Library
    { resource: 'pattern', action: 'read', scope: 'tenant' },
    { resource: 'pattern', action: 'create', scope: 'own' },
    
    // Cost Analysis
    { resource: 'costing', action: 'read', scope: 'project' },
    { resource: 'cost_optimization', action: 'read', scope: 'project' },
    
    // AI Recommendations
    { resource: 'ai_recommendation', action: 'read', scope: 'project' },
    
    // Reporting
    { resource: 'report', action: 'create', scope: 'own' },
    { resource: 'report', action: 'read', scope: 'project' },
    
    // Policy Review
    { resource: 'policy', action: 'read', scope: 'tenant' },
    { resource: 'compliance_rule', action: 'read', scope: 'tenant' },
    { resource: 'standards', action: 'read', scope: 'tenant' },
  ] as Permission[],

  /**
   * ADMIN
   * Focus: System Administration, Full Access
   */
  Admin: [
    // Full System Access
    { resource: 'blueprint', action: 'manage', scope: 'global' },
    { resource: 'deployment', action: 'manage', scope: 'global' },
    { resource: 'infrastructure', action: 'manage', scope: 'global' },
    { resource: 'iac_code', action: 'manage', scope: 'global' },
    
    // User & Role Management
    { resource: 'user', action: 'create', scope: 'tenant' },
    { resource: 'user', action: 'read', scope: 'tenant' },
    { resource: 'user', action: 'update', scope: 'tenant' },
    { resource: 'user', action: 'delete', scope: 'tenant' },
    { resource: 'user', action: 'manage', scope: 'tenant' },
    
    { resource: 'role', action: 'create', scope: 'tenant' },
    { resource: 'role', action: 'read', scope: 'tenant' },
    { resource: 'role', action: 'update', scope: 'tenant' },
    { resource: 'role', action: 'delete', scope: 'tenant' },
    { resource: 'role', action: 'manage', scope: 'tenant' },
    
    { resource: 'team', action: 'manage', scope: 'tenant' },
    { resource: 'tenant', action: 'manage', scope: 'global' },
    
    // Settings & Configuration
    { resource: 'settings', action: 'manage', scope: 'global' },
    { resource: 'license', action: 'manage', scope: 'global' },
    { resource: 'integration', action: 'manage', scope: 'tenant' },
    { resource: 'api_key', action: 'manage', scope: 'tenant' },
    { resource: 'webhook', action: 'manage', scope: 'tenant' },
    
    // Security
    { resource: 'security_policy', action: 'manage', scope: 'tenant' },
    { resource: 'access_control', action: 'manage', scope: 'tenant' },
    { resource: 'secret', action: 'manage', scope: 'tenant' },
    { resource: 'encryption_key', action: 'manage', scope: 'tenant' },
    
    // Audit & Compliance
    { resource: 'audit_log', action: 'read', scope: 'global' },
    { resource: 'audit_log', action: 'export', scope: 'global' },
    { resource: 'compliance_rule', action: 'manage', scope: 'tenant' },
    
    // All Other Resources
    { resource: 'policy', action: 'manage', scope: 'tenant' },
    { resource: 'pattern', action: 'manage', scope: 'tenant' },
    { resource: 'architecture', action: 'manage', scope: 'tenant' },
    { resource: 'budget', action: 'manage', scope: 'tenant' },
    { resource: 'project', action: 'manage', scope: 'tenant' },
    { resource: 'workflow', action: 'manage', scope: 'tenant' },
    { resource: 'dashboard', action: 'manage', scope: 'tenant' },
    { resource: 'report', action: 'manage', scope: 'tenant' },
  ] as Permission[],
};

/**
 * Helper Functions
 */

export function getUserPermissions(roles: UserRole[]): Permission[] {
  const permissions: Permission[] = [];
  roles.forEach(role => {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    permissions.push(...rolePerms);
  });
  return permissions;
}

export function hasPermission(
  userPermissions: Permission[],
  resource: PermissionResource,
  action: PermissionAction,
  scope?: PermissionScope
): boolean {
  return userPermissions.some(perm => {
    const resourceMatch = perm.resource === resource;
    const actionMatch = perm.action === action || perm.action === 'manage';
    const scopeMatch = scope ? 
      perm.scope === scope || 
      perm.scope === 'tenant' || 
      perm.scope === 'global' : true;
    
    return resourceMatch && actionMatch && scopeMatch;
  });
}

export function canAccessResource(
  userPermissions: Permission[],
  resource: PermissionResource,
  resourceOwnerId: string,
  userId: string,
  teamId?: string,
  projectId?: string
): boolean {
  const relevantPerms = userPermissions.filter(p => p.resource === resource);
  
  return relevantPerms.some(perm => {
    switch (perm.scope) {
      case 'own':
        return resourceOwnerId === userId;
      case 'team':
        return teamId !== undefined;
      case 'project':
        return projectId !== undefined;
      case 'tenant':
      case 'global':
        return true;
      default:
        return false;
    }
  });
}

export function formatPermissionString(perm: Permission): string {
  return `${perm.resource}:${perm.action}:${perm.scope}`;
}

export function parsePermissionString(permString: string): Partial<Permission> | null {
  const parts = permString.split(':');
  if (parts.length !== 3) return null;
  
  const [resource, action, scope] = parts;
  return {
    resource: resource as PermissionResource,
    action: action as PermissionAction,
    scope: scope as PermissionScope,
  };
}
