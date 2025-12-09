import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3050;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://iacadmin:changeme@localhost:5432/iac_v3',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      service: 'advanced-rbac',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: 'Database connection failed' 
    });
  }
});

// Get all permissions
app.get('/api/v1/permissions', async (req: Request, res: Response) => {
  try {
    const { resource, action, scope } = req.query;
    
    let query = 'SELECT * FROM permissions WHERE 1=1';
    const params: any[] = [];
    
    if (resource) {
      params.push(resource);
      query += ` AND resource = $${params.length}`;
    }
    
    if (action) {
      params.push(action);
      query += ` AND action = $${params.length}`;
    }
    
    if (scope) {
      params.push(scope);
      query += ` AND scope = $${params.length}`;
    }
    
    query += ' ORDER BY resource, action, scope';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      permissions: result.rows
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch permissions' 
    });
  }
});

// Check user permission
app.post('/api/v1/permissions/check', async (req: Request, res: Response) => {
  try {
    const { userId, resource, action, scope = 'own' } = req.body;
    
    if (!userId || !resource || !action) {
      return res.status(400).json({
        success: false,
        error: 'userId, resource, and action are required'
      });
    }
    
    const result = await pool.query(
      'SELECT user_has_permission($1, $2, $3, $4) as has_permission',
      [userId, resource, action, scope]
    );
    
    const hasPermission = result.rows[0].has_permission;
    
    // Log the permission check
    await pool.query(
      `INSERT INTO permission_audit_logs 
       (user_id, resource, action, allowed, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        resource,
        action,
        hasPermission,
        req.ip,
        req.get('user-agent')
      ]
    );
    
    res.json({
      success: true,
      allowed: hasPermission,
      userId,
      resource,
      action,
      scope
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check permission' 
    });
  }
});

// Get user's effective permissions
app.get('/api/v1/users/:userId/permissions', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT DISTINCT
        p.id,
        p.resource,
        p.action,
        p.scope,
        p.description,
        uep.grant_type,
        uep.granted_via
       FROM user_effective_permissions uep
       JOIN permissions p ON uep.permission_id = p.id
       WHERE uep.user_id = $1
       ORDER BY p.resource, p.action, p.scope`,
      [userId]
    );
    
    res.json({
      success: true,
      userId,
      count: result.rows.length,
      permissions: result.rows
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user permissions' 
    });
  }
});

// Grant temporary permission
app.post('/api/v1/permissions/grant', async (req: Request, res: Response) => {
  try {
    const { userId, permissionId, grantedBy, expiresAt, reason } = req.body;
    
    if (!userId || !permissionId || !grantedBy) {
      return res.status(400).json({
        success: false,
        error: 'userId, permissionId, and grantedBy are required'
      });
    }
    
    const result = await pool.query(
      'SELECT grant_temporary_permission($1, $2, $3, $4, $5) as grant_id',
      [userId, permissionId, grantedBy, expiresAt, reason]
    );
    
    res.json({
      success: true,
      grantId: result.rows[0].grant_id,
      message: 'Permission granted successfully'
    });
  } catch (error) {
    console.error('Error granting permission:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to grant permission' 
    });
  }
});

// Revoke permission grant
app.post('/api/v1/permissions/revoke', async (req: Request, res: Response) => {
  try {
    const { grantId, revokedBy } = req.body;
    
    if (!grantId || !revokedBy) {
      return res.status(400).json({
        success: false,
        error: 'grantId and revokedBy are required'
      });
    }
    
    const result = await pool.query(
      'SELECT revoke_permission_grant($1, $2) as revoked',
      [grantId, revokedBy]
    );
    
    res.json({
      success: result.rows[0].revoked,
      message: result.rows[0].revoked ? 'Permission revoked successfully' : 'Grant not found or already revoked'
    });
  } catch (error) {
    console.error('Error revoking permission:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to revoke permission' 
    });
  }
});

// Get permission audit logs
app.get('/api/v1/audit/permissions', async (req: Request, res: Response) => {
  try {
    const { userId, resource, allowed, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM permission_audit_logs WHERE 1=1';
    const params: any[] = [];
    
    if (userId) {
      params.push(userId);
      query += ` AND user_id = $${params.length}`;
    }
    
    if (resource) {
      params.push(resource);
      query += ` AND resource = $${params.length}`;
    }
    
    if (allowed !== undefined) {
      params.push(allowed === 'true');
      query += ` AND allowed = $${params.length}`;
    }
    
    query += ' ORDER BY timestamp DESC';
    
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    
    params.push(offset);
    query += ` OFFSET $${params.length}`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      logs: result.rows
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch audit logs' 
    });
  }
});

// Get permission usage statistics
app.get('/api/v1/stats/permissions', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM permission_usage_summary
      ORDER BY total_uses DESC
      LIMIT 50
    `);
    
    res.json({
      success: true,
      statistics: result.rows
    });
  } catch (error) {
    console.error('Error fetching permission stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch permission statistics' 
    });
  }
});

// Get role permissions
app.get('/api/v1/roles/:roleId/permissions', async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        p.id,
        p.resource,
        p.action,
        p.scope,
        p.description,
        rp.inherited_from
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1
      ORDER BY p.resource, p.action, p.scope
    `, [roleId]);
    
    res.json({
      success: true,
      roleId,
      count: result.rows.length,
      permissions: result.rows
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch role permissions' 
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Advanced RBAC Service listening on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔐 Permissions API: http://localhost:${port}/api/v1/permissions`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing HTTP server...');
  await pool.end();
  process.exit(0);
});

export default app;
