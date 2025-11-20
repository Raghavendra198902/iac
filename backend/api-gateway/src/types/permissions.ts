/**
 * Permission Types and Definitions
 * Matches frontend permission structure for consistency
 */

export type UserRole = 'EA' | 'SA' | 'TA' | 'PM' | 'SE' | 'Consultant' | 'Admin';

export type PermissionAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'execute' 
  | 'manage'
  | 'override';

export type PermissionScope = 'own' | 'team' | 'project' | 'tenant';

export type PermissionResource = 
  | 'blueprint'
  | 'deployment'
  | 'iac'
  | 'governance'
  | 'costing'
  | 'policy'
  | 'pattern'
  | 'guardrail'
  | 'incident'
  | 'budget'
  | 'migration'
  | 'kpi'
  | 'health'
  | 'ai-recommendation'
  | 'cost-optimization';

export interface Permission {
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
}

/**
 * Role-based Permission Matrix
 * Defines what each role can do
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Enterprise Architect - Governance & Compliance
  EA: [
    { resource: 'blueprint', action: 'approve', scope: 'tenant' },
    { resource: 'policy', action: 'create', scope: 'tenant' },
    { resource: 'policy', action: 'update', scope: 'tenant' },
    { resource: 'policy', action: 'delete', scope: 'tenant' },
    { resource: 'policy', action: 'read', scope: 'tenant' },
    { resource: 'pattern', action: 'approve', scope: 'tenant' },
    { resource: 'pattern', action: 'manage', scope: 'tenant' },
    { resource: 'governance', action: 'manage', scope: 'tenant' },
    { resource: 'governance', action: 'read', scope: 'tenant' },
    { resource: 'blueprint', action: 'read', scope: 'tenant' },
    { resource: 'deployment', action: 'read', scope: 'tenant' },
    { resource: 'costing', action: 'read', scope: 'tenant' },
  ],

  // Solution Architect - Blueprint Design & AI
  SA: [
    { resource: 'blueprint', action: 'create', scope: 'project' },
    { resource: 'blueprint', action: 'update', scope: 'own' },
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'blueprint', action: 'delete', scope: 'own' },
    { resource: 'ai-recommendation', action: 'read', scope: 'project' },
    { resource: 'ai-recommendation', action: 'create', scope: 'project' },
    { resource: 'cost-optimization', action: 'read', scope: 'project' },
    { resource: 'cost-optimization', action: 'create', scope: 'project' },
    { resource: 'pattern', action: 'read', scope: 'tenant' },
    { resource: 'costing', action: 'read', scope: 'project' },
  ],

  // Technical Architect - IaC & Guardrails
  TA: [
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'iac', action: 'create', scope: 'project' },
    { resource: 'iac', action: 'update', scope: 'project' },
    { resource: 'iac', action: 'read', scope: 'project' },
    { resource: 'guardrail', action: 'override', scope: 'project' },
    { resource: 'guardrail', action: 'manage', scope: 'project' },
    { resource: 'deployment', action: 'create', scope: 'project' },
    { resource: 'deployment', action: 'read', scope: 'project' },
    { resource: 'pattern', action: 'read', scope: 'tenant' },
  ],

  // Project Manager - Oversight & Approvals
  PM: [
    { resource: 'deployment', action: 'approve', scope: 'project' },
    { resource: 'deployment', action: 'read', scope: 'project' },
    { resource: 'budget', action: 'manage', scope: 'project' },
    { resource: 'budget', action: 'read', scope: 'project' },
    { resource: 'migration', action: 'manage', scope: 'project' },
    { resource: 'migration', action: 'read', scope: 'project' },
    { resource: 'kpi', action: 'read', scope: 'project' },
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'costing', action: 'read', scope: 'project' },
  ],

  // System Engineer - Deployment & Operations
  SE: [
    { resource: 'deployment', action: 'execute', scope: 'project' },
    { resource: 'deployment', action: 'read', scope: 'project' },
    { resource: 'deployment', action: 'update', scope: 'project' },
    { resource: 'incident', action: 'create', scope: 'project' },
    { resource: 'incident', action: 'update', scope: 'own' },
    { resource: 'incident', action: 'read', scope: 'project' },
    { resource: 'health', action: 'read', scope: 'project' },
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'iac', action: 'read', scope: 'project' },
  ],

  // Consultant - Advisory Access
  Consultant: [
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'deployment', action: 'read', scope: 'project' },
    { resource: 'costing', action: 'read', scope: 'project' },
    { resource: 'pattern', action: 'read', scope: 'tenant' },
    { resource: 'governance', action: 'read', scope: 'tenant' },
  ],

  // Admin - System Administration
  Admin: [
    { resource: 'blueprint', action: 'manage', scope: 'tenant' },
    { resource: 'deployment', action: 'manage', scope: 'tenant' },
    { resource: 'iac', action: 'manage', scope: 'tenant' },
    { resource: 'governance', action: 'manage', scope: 'tenant' },
    { resource: 'costing', action: 'manage', scope: 'tenant' },
    { resource: 'policy', action: 'manage', scope: 'tenant' },
    { resource: 'pattern', action: 'manage', scope: 'tenant' },
    { resource: 'guardrail', action: 'manage', scope: 'tenant' },
    { resource: 'incident', action: 'manage', scope: 'tenant' },
    { resource: 'budget', action: 'manage', scope: 'tenant' },
    { resource: 'migration', action: 'manage', scope: 'tenant' },
    { resource: 'kpi', action: 'manage', scope: 'tenant' },
    { resource: 'health', action: 'manage', scope: 'tenant' },
  ],
};

/**
 * Helper to get all permissions for a user based on their roles
 */
export function getUserPermissions(roles: UserRole[]): Permission[] {
  const permissions: Permission[] = [];
  
  roles.forEach(role => {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    permissions.push(...rolePerms);
  });

  return permissions;
}

/**
 * Check if a permission set includes a specific permission
 */
export function hasPermission(
  userPermissions: Permission[],
  resource: PermissionResource,
  action: PermissionAction,
  scope?: PermissionScope
): boolean {
  return userPermissions.some(perm => {
    const resourceMatch = perm.resource === resource;
    const actionMatch = perm.action === action || perm.action === 'manage';
    const scopeMatch = scope ? perm.scope === scope || perm.scope === 'tenant' : true;
    
    return resourceMatch && actionMatch && scopeMatch;
  });
}
