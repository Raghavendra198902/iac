import { AuthRequest } from '../middleware/auth';
import { PermissionScope } from '../types/permissions';
import { logger } from '../utils/logger';

/**
 * Scope Resolver Service
 * Handles data filtering based on permission scope (own, team, project, tenant)
 */

export interface ScopeFilter {
  tenantId?: string;
  projectId?: string;
  teamId?: string;
  userId?: string;
}

/**
 * Build database query filters based on permission scope
 */
export function buildScopeFilter(
  req: AuthRequest,
  scope: PermissionScope,
  resourceOwnerId?: string
): ScopeFilter {
  const filter: ScopeFilter = {};

  if (!req.user) {
    throw new Error('User not authenticated');
  }

  switch (scope) {
    case 'own':
      // User can only access their own resources
      filter.userId = req.user.id;
      if (resourceOwnerId && resourceOwnerId !== req.user.id) {
        logger.warn(`Scope violation: User ${req.user.id} accessing resource owned by ${resourceOwnerId}`);
      }
      break;

    case 'team':
      // User can access resources within their team
      // Note: Team membership should be added to user object in future enhancement
      filter.teamId = req.user.teamId || req.user.id; // Fallback to user if no team
      filter.tenantId = req.user.tenantId;
      break;

    case 'project':
      // User can access resources within specific projects they're assigned to
      // Project-level access - most common scope
      filter.tenantId = req.user.tenantId;
      // Note: Project filtering should be applied at query level based on user's project assignments
      break;

    case 'tenant':
      // User can access all resources in their tenant (admin/EA level)
      filter.tenantId = req.user.tenantId;
      break;

    default:
      throw new Error(`Invalid permission scope: ${scope}`);
  }

  return filter;
}

/**
 * Check if user can access a specific resource based on scope
 */
export function canAccessResource(
  req: AuthRequest,
  scope: PermissionScope,
  resource: {
    tenantId: string;
    projectId?: string;
    teamId?: string;
    ownerId?: string;
  }
): boolean {
  if (!req.user) return false;

  switch (scope) {
    case 'own':
      return resource.ownerId === req.user.id;

    case 'team':
      return (
        resource.tenantId === req.user.tenantId &&
        (resource.teamId === req.user.teamId || resource.teamId === undefined)
      );

    case 'project':
      // For project scope, check tenant match
      // In production, should also check user's project assignments
      return resource.tenantId === req.user.tenantId;

    case 'tenant':
      return resource.tenantId === req.user.tenantId;

    default:
      return false;
  }
}

/**
 * Apply scope filter to database query
 * Returns WHERE clause conditions for SQL queries
 */
export function getScopeWhereClause(
  req: AuthRequest,
  scope: PermissionScope,
  tableAlias?: string
): { clause: string; params: any[] } {
  const filter = buildScopeFilter(req, scope);
  const conditions: string[] = [];
  const params: any[] = [];
  const prefix = tableAlias ? `${tableAlias}.` : '';

  if (filter.tenantId) {
    conditions.push(`${prefix}tenant_id = $${params.length + 1}`);
    params.push(filter.tenantId);
  }

  if (filter.projectId) {
    conditions.push(`${prefix}project_id = $${params.length + 1}`);
    params.push(filter.projectId);
  }

  if (filter.teamId) {
    conditions.push(`${prefix}team_id = $${params.length + 1}`);
    params.push(filter.teamId);
  }

  if (filter.userId) {
    conditions.push(`${prefix}owner_id = $${params.length + 1}`);
    params.push(filter.userId);
  }

  return {
    clause: conditions.length > 0 ? conditions.join(' AND ') : '1=1',
    params,
  };
}

/**
 * Cache for permission scope checks (optional optimization)
 */
class ScopeCache {
  private cache: Map<string, { result: boolean; timestamp: number }> = new Map();
  private ttl: number = 5000; // 5 seconds

  set(key: string, result: boolean): void {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  get(key: string): boolean | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const scopeCache = new ScopeCache();

// Extend AuthRequest to include team info
declare module '../middleware/auth' {
  interface AuthRequest {
    user?: {
      id: string;
      email: string;
      roles: string[];
      tenantId: string;
      teamId?: string; // Optional team membership
      projectIds?: string[]; // Optional project assignments
      subscription?: 'free' | 'basic' | 'pro' | 'enterprise' | 'admin';
    };
  }
}
