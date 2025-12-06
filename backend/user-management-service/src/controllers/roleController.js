const pool = require('../config/database');

const getAllRoles = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.name, r.display_name, r.description, r.is_system_role, r.priority,
              ARRAY_AGG(DISTINCT jsonb_build_object('id', p.id, 'name', p.name, 'displayName', p.display_name)) FILTER (WHERE p.id IS NOT NULL) as permissions,
              COUNT(DISTINCT ur.user_id) as user_count
       FROM roles r
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.id
       LEFT JOIN user_roles ur ON r.id = ur.role_id AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
       GROUP BY r.id
       ORDER BY r.priority DESC, r.name`
    );

    res.json({ roles: rows });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

const getAllPermissions = async (req, res) => {
  try {
    const { resource } = req.query;

    let query = `
      SELECT id, name, display_name, description, resource, action
      FROM permissions
      WHERE 1=1
    `;

    const params = [];
    if (resource) {
      query += ' AND resource = $1';
      params.push(resource);
    }

    query += ' ORDER BY resource, action';

    const { rows } = await pool.query(query, params);

    // Group by resource
    const grouped = rows.reduce((acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    }, {});

    res.json({ permissions: rows, grouped });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};

const createRole = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, displayName, description, permissions } = req.body;

    await client.query('BEGIN');

    // Create role
    const result = await client.query(
      `INSERT INTO roles (name, display_name, description, is_system_role, priority)
       VALUES ($1, $2, $3, false, 500)
       RETURNING id, name, display_name, description, created_at`,
      [name, displayName, description]
    );

    const role = result.rows[0];

    // Assign permissions
    if (permissions && permissions.length > 0) {
      for (const permissionId of permissions) {
        await client.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
          [role.id, permissionId]
        );
      }
    }

    // Log activity
    await client.query(
      `INSERT INTO user_audit_log (user_id, action, resource, resource_id, details, ip_address, status)
       VALUES ($1, 'role.create', 'roles', $2, $3, $4, 'success')`,
      [req.user.id, role.id, JSON.stringify({ name, permissions }), req.ip]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Failed to create role' });
  } finally {
    client.release();
  }
};

const updateRole = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { displayName, description, permissions } = req.body;

    await client.query('BEGIN');

    // Check if role is system role
    const roleCheck = await client.query(
      'SELECT is_system_role FROM roles WHERE id = $1',
      [id]
    );

    if (roleCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Role not found' });
    }

    if (roleCheck.rows[0].is_system_role) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Cannot modify system roles' });
    }

    // Update role
    await client.query(
      `UPDATE roles 
       SET display_name = COALESCE($1, display_name),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3`,
      [displayName, description, id]
    );

    // Update permissions if provided
    if (permissions) {
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);
      
      for (const permissionId of permissions) {
        await client.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
          [id, permissionId]
        );
      }
    }

    // Log activity
    await client.query(
      `INSERT INTO user_audit_log (user_id, action, resource, resource_id, details, ip_address, status)
       VALUES ($1, 'role.update', 'roles', $2, $3, $4, 'success')`,
      [req.user.id, id, JSON.stringify(req.body), req.ip]
    );

    await client.query('COMMIT');

    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  } finally {
    client.release();
  }
};

const deleteRole = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Check if role is system role
    const roleCheck = await client.query(
      'SELECT is_system_role, name FROM roles WHERE id = $1',
      [id]
    );

    if (roleCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Role not found' });
    }

    if (roleCheck.rows[0].is_system_role) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Cannot delete system roles' });
    }

    // Delete role (cascade will handle role_permissions and user_roles)
    await client.query('DELETE FROM roles WHERE id = $1', [id]);

    // Log activity
    await client.query(
      `INSERT INTO user_audit_log (user_id, action, resource, resource_id, details, ip_address, status)
       VALUES ($1, 'role.delete', 'roles', $2, $3, $4, 'success')`,
      [req.user.id, id, JSON.stringify({ name: roleCheck.rows[0].name }), req.ip]
    );

    await client.query('COMMIT');

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllRoles,
  getAllPermissions,
  createRole,
  updateRole,
  deleteRole,
};
