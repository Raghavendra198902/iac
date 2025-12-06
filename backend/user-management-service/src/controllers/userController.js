const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT u.id, u.username, u.email, u.first_name, u.last_name,
             u.department, u.job_title, u.status, u.email_verified, 
             u.two_factor_enabled, u.last_login_at, u.created_at,
             ARRAY_AGG(DISTINCT r.display_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND u.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (role) {
      query += ` AND r.name = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (search) {
      query += ` AND (u.username ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    // Get total count
    const countResult = await pool.query('SELECT COUNT(DISTINCT id) FROM users WHERE 1=1');
    
    res.json({
      users: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      `SELECT u.*, 
              ARRAY_AGG(DISTINCT jsonb_build_object('id', r.id, 'name', r.name, 'displayName', r.display_name)) FILTER (WHERE r.id IS NOT NULL) as roles,
              ARRAY_AGG(DISTINCT jsonb_build_object('id', g.id, 'name', g.name, 'displayName', g.display_name)) FILTER (WHERE g.id IS NOT NULL) as groups
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
       LEFT JOIN roles r ON ur.role_id = r.id
       LEFT JOIN user_group_members ugm ON u.id = ugm.user_id
       LEFT JOIN user_groups g ON ugm.group_id = g.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    delete user.password_hash;
    delete user.two_factor_secret;

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const createUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { username, email, password, firstName, lastName, department, jobTitle, roles } = req.body;

    await client.query('BEGIN');

    // Check if user exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await client.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, 
                         department, job_title, status, created_by, must_change_password)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, true)
       RETURNING id, username, email, first_name, last_name, department, job_title, status, created_at`,
      [username, email, passwordHash, firstName, lastName, department, jobTitle, req.user.id]
    );

    const user = result.rows[0];

    // Assign roles
    if (roles && roles.length > 0) {
      for (const roleName of roles) {
        const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
        if (roleResult.rows.length > 0) {
          await client.query(
            'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
            [user.id, roleResult.rows[0].id, req.user.id]
          );
        }
      }
    }

    // Log activity
    await client.query(
      `INSERT INTO user_audit_log (user_id, action, resource, resource_id, details, ip_address, status)
       VALUES ($1, 'user.create', 'users', $2, $3, $4, 'success')`,
      [req.user.id, user.id, JSON.stringify({ username, email, roles }), req.ip]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  } finally {
    client.release();
  }
};

const updateUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { firstName, lastName, email, department, jobTitle, status, roles } = req.body;

    await client.query('BEGIN');

    // Check if user exists
    const existingUser = await client.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    await client.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           department = COALESCE($4, department),
           job_title = COALESCE($5, job_title),
           status = COALESCE($6, status),
           updated_by = $7,
           updated_at = NOW()
       WHERE id = $8`,
      [firstName, lastName, email, department, jobTitle, status, req.user.id, id]
    );

    // Update roles if provided
    if (roles) {
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      
      for (const roleName of roles) {
        const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
        if (roleResult.rows.length > 0) {
          await client.query(
            'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
            [id, roleResult.rows[0].id, req.user.id]
          );
        }
      }
    }

    // Log activity
    await client.query(
      `INSERT INTO user_audit_log (user_id, action, resource, resource_id, details, ip_address, status)
       VALUES ($1, 'user.update', 'users', $2, $3, $4, 'success')`,
      [req.user.id, id, JSON.stringify(req.body), req.ip]
    );

    await client.query('COMMIT');

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  } finally {
    client.release();
  }
};

const deleteUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Check if user exists
    const existingUser = await client.query(
      'SELECT username FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete by setting status to inactive
    await client.query(
      'UPDATE users SET status = $1, updated_by = $2, updated_at = NOW() WHERE id = $3',
      ['inactive', req.user.id, id]
    );

    // Deactivate all sessions
    await client.query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
      [id]
    );

    // Log activity
    await client.query(
      `INSERT INTO user_audit_log (user_id, action, resource, resource_id, details, ip_address, status)
       VALUES ($1, 'user.delete', 'users', $2, $3, $4, 'success')`,
      [req.user.id, id, JSON.stringify({ username: existingUser.rows[0].username }), req.ip]
    );

    await client.query('COMMIT');

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    client.release();
  }
};

const getUserActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT action, resource, resource_id, details, ip_address, status, created_at
       FROM user_audit_log
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json({ activities: rows });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserActivities,
};
