const { verifyAccessToken } = require('../config/jwt');
const pool = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    // Verify session is still active
    const sessionQuery = `
      SELECT s.*, u.username, u.email, u.status 
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1 AND s.is_active = true AND s.expires_at > NOW()
    `;
    
    const { rows } = await pool.query(sessionQuery, [token]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    if (rows[0].status !== 'active') {
      return res.status(403).json({ error: 'User account is not active' });
    }

    // Update last activity
    await pool.query(
      'UPDATE user_sessions SET last_activity_at = NOW() WHERE id = $1',
      [rows[0].id]
    );

    // Attach user info with roles and permissions from token
    req.user = {
      id: decoded.userId,
      username: decoded.username || rows[0].username,
      email: decoded.email || rows[0].email,
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
      sessionId: rows[0].id
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.message === 'Token expired') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // First check permissions in JWT token (faster)
      if (req.user.permissions && req.user.permissions.includes(requiredPermission)) {
        return next();
      }

      // Fallback to database check (in case token is stale)
      const query = `
        SELECT p.name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = $1 
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
          AND p.name = $2
      `;
      
      const { rows } = await pool.query(query, [req.user.id, requiredPermission]);
      
      if (rows.length === 0) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: requiredPermission,
          message: `You need '${requiredPermission}' permission to access this resource`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission verification failed' });
    }
  };
};

const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      // First check roles in JWT token (faster)
      if (req.user.roles) {
        const hasRole = rolesArray.some(role => req.user.roles.includes(role));
        if (hasRole) {
          return next();
        }
      }

      // Fallback to database check (in case token is stale)
      const query = `
        SELECT r.name
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = $1 
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
          AND r.name = ANY($2)
      `;
      
      const { rows } = await pool.query(query, [req.user.id, rolesArray]);
      
      if (rows.length === 0) {
        return res.status(403).json({ 
          error: 'Insufficient role privileges',
          required: rolesArray,
          message: `You need one of these roles: ${rolesArray.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Role verification failed' });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 */
const checkAnyPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const permissionsArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      
      // Check permissions in JWT token
      if (req.user.permissions) {
        const hasPermission = permissionsArray.some(perm => req.user.permissions.includes(perm));
        if (hasPermission) {
          return next();
        }
      }

      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permissionsArray,
        message: `You need one of these permissions: ${permissionsArray.join(', ')}`
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission verification failed' });
    }
  };
};

module.exports = {
  authenticate,
  checkPermission,
  checkRole,
  checkAnyPermission,
};
