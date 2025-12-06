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

    req.user = {
      id: decoded.userId,
      username: rows[0].username,
      email: rows[0].email,
      sessionId: rows[0].id
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
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
        return res.status(403).json({ error: 'Insufficient permissions' });
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
        return res.status(403).json({ error: 'Insufficient role privileges' });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Role verification failed' });
    }
  };
};

module.exports = {
  authenticate,
  checkPermission,
  checkRole,
};
