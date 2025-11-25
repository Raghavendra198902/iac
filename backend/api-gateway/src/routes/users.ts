import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'iac_dharma',
  user: process.env.DB_USER || 'dharma_admin',
  password: process.env.DB_PASSWORD || 'dharma_pass_dev'
});

/**
 * GET /api/users
 * Get all users with their roles
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, role, search } = req.query;

    let query = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.status,
        u.created_at,
        u.last_login_at,
        u.preferences,
        json_agg(
          json_build_object(
            'id', r.id,
            'name', r.name,
            'code', r.code,
            'description', r.description
          )
        ) FILTER (WHERE r.id IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.deleted_at IS NULL
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      query += ` AND u.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (u.email ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += `
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.status, u.created_at, u.last_login_at, u.preferences
      ORDER BY u.created_at DESC
    `;

    const result = await pool.query(query, params);

    // Filter by role if specified
    let users = result.rows.map(row => ({
      id: row.id,
      name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.email,
      email: row.email,
      phone: row.preferences?.phone || 'N/A',
      role: row.roles && row.roles.length > 0 ? row.roles[0].code : 'none',
      roles: row.roles || [],
      status: row.status,
      createdAt: row.created_at,
      lastLogin: row.last_login_at || 'Never'
    }));

    if (role && role !== 'all') {
      users = users.filter(u => u.role === role);
    }

    res.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

/**
 * GET /api/users/:id
 * Get a specific user by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.status,
        u.created_at,
        u.last_login_at,
        u.preferences,
        json_agg(
          json_build_object(
            'id', r.id,
            'name', r.name,
            'code', r.code
          )
        ) FILTER (WHERE r.id IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      GROUP BY u.id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      phone: user.preferences?.phone || 'N/A',
      roles: user.roles || [],
      status: user.status,
      createdAt: user.created_at,
      lastLogin: user.last_login_at
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

/**
 * POST /api/users
 * Create a new user
 */
router.post('/', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { email, firstName, lastName, phone, roleId, status = 'active', tenantId } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, first name, and last name are required' });
    }

    await client.query('BEGIN');

    // Insert user
    const userResult = await client.query(
      `
      INSERT INTO users (tenant_id, email, first_name, last_name, status, preferences)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, status, created_at
      `,
      [
        tenantId || '00000000-0000-0000-0000-000000000000',
        email,
        firstName,
        lastName,
        status,
        JSON.stringify({ phone })
      ]
    );

    const newUser = userResult.rows[0];

    // Assign role if provided
    if (roleId) {
      await client.query(
        `
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, $2)
        `,
        [newUser.id, roleId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      id: newUser.id,
      name: `${newUser.first_name} ${newUser.last_name}`,
      email: newUser.email,
      status: newUser.status,
      createdAt: newUser.created_at
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating user:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to create user',
      message: error.message
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/users/settings/:userId
 * Get user settings/preferences
 * IMPORTANT: This must come BEFORE /:id routes to avoid route conflicts
 */
router.get('/settings/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        id,
        email,
        first_name,
        last_name,
        preferences
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      userId: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      settings: user.preferences || {}
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

/**
 * PUT /api/users/settings/:userId
 * Update user settings/preferences
 * IMPORTANT: This must come BEFORE /:id routes to avoid route conflicts
 */
router.put('/settings/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET 
        preferences = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id, email, first_name, last_name, preferences
      `,
      [JSON.stringify(settings), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      userId: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      settings: user.preferences
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

/**
 * PUT /api/users/:id
 * Update an existing user
 */
router.put('/:id', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { email, firstName, lastName, phone, roleId, status } = req.body;

    await client.query('BEGIN');

    // Update user
    const result = await client.query(
      `
      UPDATE users
      SET 
        email = COALESCE($1, email),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        status = COALESCE($4, status),
        preferences = COALESCE($5, preferences),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND deleted_at IS NULL
      RETURNING id, email, first_name, last_name, status
      `,
      [email, firstName, lastName, status, phone ? JSON.stringify({ phone }) : null, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    // Update role if provided
    if (roleId) {
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [id, roleId]
      );
    }

    await client.query('COMMIT');

    const updatedUser = result.rows[0];
    res.json({
      id: updatedUser.id,
      name: `${updatedUser.first_name} ${updatedUser.last_name}`,
      email: updatedUser.email,
      status: updatedUser.status
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/users/:id
 * Soft delete a user
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE users
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

/**
 * GET /api/users/roles
 * Get all roles
 */
router.get('/roles/all', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        r.id,
        r.name,
        r.code,
        r.description,
        r.permissions,
        COUNT(ur.user_id) as user_count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      GROUP BY r.id, r.name, r.code, r.description, r.permissions
      ORDER BY r.name
      `
    );

    const roles = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description || '',
      permissions: row.permissions || [],
      userCount: parseInt(row.user_count),
      color: getRoleColor(row.code)
    }));

    res.json({ roles });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      error: 'Failed to fetch roles',
      message: error.message
    });
  }
});

/**
 * POST /api/users/roles
 * Create a new role
 */
router.post('/roles/create', async (req: Request, res: Response) => {
  try {
    const { name, code, description, permissions, tenantId } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const result = await pool.query(
      `
      INSERT INTO roles (tenant_id, name, code, description, permissions)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, code, description, permissions
      `,
      [
        tenantId || null,
        name,
        code.toUpperCase(),
        description,
        JSON.stringify(permissions || [])
      ]
    );

    const newRole = result.rows[0];
    res.status(201).json({
      id: newRole.id,
      name: newRole.name,
      code: newRole.code,
      description: newRole.description,
      permissions: newRole.permissions,
      userCount: 0,
      color: getRoleColor(newRole.code)
    });
  } catch (error: any) {
    console.error('Error creating role:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Role already exists',
        message: 'A role with this code already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to create role',
      message: error.message
    });
  }
});

/**
 * PUT /api/users/roles/:id
 * Update a role
 */
router.put('/roles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const result = await pool.query(
      `
      UPDATE roles
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        permissions = COALESCE($3, permissions),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, code, description, permissions
      `,
      [name, description, permissions ? JSON.stringify(permissions) : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const updatedRole = result.rows[0];
    res.json({
      id: updatedRole.id,
      name: updatedRole.name,
      code: updatedRole.code,
      description: updatedRole.description,
      permissions: updatedRole.permissions
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    res.status(500).json({
      error: 'Failed to update role',
      message: error.message
    });
  }
});

/**
 * DELETE /api/users/roles/:id
 * Delete a role (only if not system role and no users assigned)
 */
router.delete('/roles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if role is system role
    const roleCheck = await pool.query(
      'SELECT is_system FROM roles WHERE id = $1',
      [id]
    );

    if (roleCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (roleCheck.rows[0].is_system) {
      return res.status(403).json({ error: 'Cannot delete system role' });
    }

    // Check if any users have this role
    const userCount = await pool.query(
      'SELECT COUNT(*) as count FROM user_roles WHERE role_id = $1',
      [id]
    );

    if (parseInt(userCount.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete role',
        message: 'Role is assigned to users'
      });
    }

    await pool.query('DELETE FROM roles WHERE id = $1', [id]);

    res.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      error: 'Failed to delete role',
      message: error.message
    });
  }
});

/**
 * POST /api/users/roles/seed
 * Seed default system roles (EA, SA, TA, PM, SE)
 */
router.post('/roles/seed', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const defaultRoles = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Enterprise Architect',
        code: 'EA',
        description: 'Enterprise Architect - Defines overall enterprise architecture strategy, standards, and governance',
        permissions: ['create', 'read', 'update', 'delete', 'deploy', 'manage_users', 'manage_roles', 'system_config', 'audit_logs', 'reports', 'architecture_design', 'enterprise_strategy']
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Solution Architect',
        code: 'SA',
        description: 'Solution Architect - Designs technical solutions aligned with business requirements',
        permissions: ['create', 'read', 'update', 'delete', 'deploy', 'architecture_design', 'solution_design', 'technical_specs', 'reports']
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Technical Architect',
        code: 'TA',
        description: 'Technical Architect - Focuses on technology stack, infrastructure, and technical implementation details',
        permissions: ['create', 'read', 'update', 'delete', 'deploy', 'technical_specs', 'infrastructure_design', 'technology_evaluation', 'code_review']
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'Project Manager',
        code: 'PM',
        description: 'Project Manager - Manages architecture projects, timelines, resources, and stakeholder communication',
        permissions: ['read', 'create', 'update', 'project_management', 'resource_allocation', 'reports', 'audit_logs']
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        name: 'Software Engineer',
        code: 'SE',
        description: 'Software Engineer - Implements architecture designs, develops code, and maintains systems',
        permissions: ['read', 'create', 'update', 'delete', 'deploy', 'code_development', 'code_review', 'testing']
      },
      {
        id: '00000000-0000-0000-0000-000000000006',
        name: 'Administrator',
        code: 'ADMIN',
        description: 'Administrator - Full system access with complete control over all resources and configurations',
        permissions: ['create', 'read', 'update', 'delete', 'deploy', 'manage_users', 'manage_roles', 'system_config', 'audit_logs', 'reports', 'full_access', 'system_admin']
      }
    ];

    await client.query('BEGIN');

    const createdRoles = [];
    for (const role of defaultRoles) {
      const result = await client.query(
        `
        INSERT INTO roles (id, tenant_id, name, code, description, permissions, is_system, created_at, updated_at)
        VALUES ($1, NULL, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (tenant_id, code) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          permissions = EXCLUDED.permissions,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, name, code, description
        `,
        [role.id, role.name, role.code, role.description, JSON.stringify(role.permissions)]
      );
      createdRoles.push(result.rows[0]);
    }

    // Create index if not exists
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_roles_code_system ON roles(code) WHERE is_system = true
    `);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Default roles seeded successfully',
      roles: createdRoles
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error seeding roles:', error);
    res.status(500).json({
      error: 'Failed to seed roles',
      message: error.message
    });
  } finally {
    client.release();
  }
});

/**
 * POST /api/users/seed
 * Seed demo users for each role
 */
router.post('/seed', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    // Demo users data - one user per role
    const demoUsers = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        email: 'john.smith@iacdharma.com',
        firstName: 'John',
        lastName: 'Smith',
        roleCode: 'EA',
        phone: '+1-555-0101'
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        email: 'sarah.johnson@iacdharma.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        roleCode: 'SA',
        phone: '+1-555-0102'
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        email: 'michael.chen@iacdharma.com',
        firstName: 'Michael',
        lastName: 'Chen',
        roleCode: 'TA',
        phone: '+1-555-0103'
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        email: 'emily.davis@iacdharma.com',
        firstName: 'Emily',
        lastName: 'Davis',
        roleCode: 'PM',
        phone: '+1-555-0104'
      },
      {
        id: '10000000-0000-0000-0000-000000000005',
        email: 'david.wilson@iacdharma.com',
        firstName: 'David',
        lastName: 'Wilson',
        roleCode: 'SE',
        phone: '+1-555-0105'
      },
      {
        id: '10000000-0000-0000-0000-000000000006',
        email: 'admin@iacdharma.com',
        firstName: 'System',
        lastName: 'Administrator',
        roleCode: 'ADMIN',
        phone: '+1-555-0100'
      }
    ];

    await client.query('BEGIN');

    const createdUsers = [];
    for (const user of demoUsers) {
      // Get role ID from code
      const roleResult = await client.query(
        'SELECT id FROM roles WHERE code = $1',
        [user.roleCode]
      );

      if (roleResult.rows.length === 0) {
        console.warn(`Role ${user.roleCode} not found, skipping user ${user.email}`);
        continue;
      }

      const roleId = roleResult.rows[0].id;

      // Insert user
      const userResult = await client.query(
        `
        INSERT INTO users (id, tenant_id, email, first_name, last_name, status, preferences, created_at, updated_at)
        VALUES ($1, '00000000-0000-0000-0000-000000000000', $2, $3, $4, 'active', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (tenant_id, email) 
        DO UPDATE SET 
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          preferences = EXCLUDED.preferences,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, email, first_name, last_name, status
        `,
        [user.id, user.email, user.firstName, user.lastName, JSON.stringify({ phone: user.phone })]
      );

      const newUser = userResult.rows[0];

      // Assign role (delete existing first to handle ON CONFLICT)
      await client.query(
        'DELETE FROM user_roles WHERE user_id = $1',
        [newUser.id]
      );

      await client.query(
        `
        INSERT INTO user_roles (user_id, role_id, granted_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        `,
        [newUser.id, roleId]
      );

      createdUsers.push({
        ...newUser,
        role: user.roleCode
      });
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Demo users seeded successfully',
      users: createdUsers,
      count: createdUsers.length
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error seeding users:', error);
    res.status(500).json({
      error: 'Failed to seed users',
      message: error.message
    });
  } finally {
    client.release();
  }
});

// Helper function to assign colors to roles
function getRoleColor(code: string): string {
  const colorMap: Record<string, string> = {
    'EA': 'red',
    'SA': 'blue',
    'TA': 'purple',
    'PM': 'green',
    'SE': 'orange',
    'ADMIN': 'red',
    'CONSULTANT': 'blue'
  };
  return colorMap[code] || 'blue';
}

export default router;
