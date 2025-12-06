const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const pool = require('../config/database');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const register = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { username, email, password, firstName, lastName, department, jobTitle } = req.body;

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
      `INSERT INTO users (username, email, password_hash, first_name, last_name, department, job_title, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING id, username, email, first_name, last_name, department, job_title, status, created_at`,
      [username, email, passwordHash, firstName, lastName, department, jobTitle]
    );

    const user = result.rows[0];

    // Assign default viewer role
    const roleResult = await client.query(
      'SELECT id FROM roles WHERE name = $1',
      ['viewer']
    );

    if (roleResult.rows.length > 0) {
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [user.id, roleResult.rows[0].id]
      );
    }

    // Log activity
    await client.query(
      `INSERT INTO user_audit_log (user_id, action, resource, details, ip_address, status)
       VALUES ($1, 'user.register', 'users', $2, $3, 'success')`,
      [user.id, JSON.stringify({ username, email }), req.ip]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        status: user.status,
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { username, password, twoFactorCode } = req.body;

    // Get user
    const userResult = await client.query(
      `SELECT id, username, email, password_hash, status, two_factor_enabled, 
              two_factor_secret, failed_login_attempts, last_login_at
       FROM users WHERE username = $1 OR email = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS) {
      return res.status(423).json({ error: 'Account locked due to too many failed attempts' });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({ error: `Account is ${user.status}` });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      await client.query(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1',
        [user.id]
      );
      
      await client.query(
        `INSERT INTO user_audit_log (user_id, action, resource, ip_address, status)
         VALUES ($1, 'user.login', 'auth', $2, 'failure')`,
        [user.id, req.ip]
      );

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify 2FA if enabled
    if (user.two_factor_enabled) {
      if (!twoFactorCode) {
        return res.status(200).json({ requiresTwoFactor: true });
      }

      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    }

    await client.query('BEGIN');

    // Reset failed attempts
    await client.query(
      'UPDATE users SET failed_login_attempts = 0, last_login_at = NOW(), last_login_ip = $1 WHERE id = $2',
      [req.ip, user.id]
    );

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, username: user.username });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Create session
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await client.query(
      `INSERT INTO user_sessions (user_id, token, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, accessToken, refreshToken, req.ip, req.headers['user-agent'], expiresAt]
    );

    // Get user roles and permissions
    const rolesResult = await client.query(
      `SELECT ARRAY_AGG(DISTINCT r.name) as roles, ARRAY_AGG(DISTINCT p.name) as permissions
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.id
       WHERE ur.user_id = $1 AND (ur.expires_at IS NULL OR ur.expires_at > NOW())`,
      [user.id]
    );

    // Log successful login
    await client.query(
      `INSERT INTO user_audit_log (user_id, action, resource, ip_address, user_agent, status)
       VALUES ($1, 'user.login', 'auth', $2, $3, 'success')`,
      [user.id, req.ip, req.headers['user-agent']]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: rolesResult.rows[0]?.roles || [],
        permissions: rolesResult.rows[0]?.permissions || [],
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  } finally {
    client.release();
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.substring(7);

    await pool.query(
      'UPDATE user_sessions SET is_active = false WHERE token = $1',
      [token]
    );

    await pool.query(
      `INSERT INTO user_audit_log (user_id, action, resource, ip_address, status)
       VALUES ($1, 'user.logout', 'auth', $2, 'success')`,
      [req.user.id, req.ip]
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

const setupTwoFactor = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `IAC Platform (${req.user.username})`,
      length: 32
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store temporary secret (should be confirmed before saving)
    await pool.query(
      'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
      [secret.base32, req.user.id]
    );

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan QR code with your authenticator app'
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: '2FA setup failed' });
  }
};

const enableTwoFactor = async (req, res) => {
  try {
    const { code } = req.body;

    const userResult = await pool.query(
      'SELECT two_factor_secret FROM users WHERE id = $1',
      [req.user.id]
    );

    const verified = speakeasy.totp.verify({
      secret: userResult.rows[0].two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    await pool.query(
      'UPDATE users SET two_factor_enabled = true WHERE id = $1',
      [req.user.id]
    );

    await pool.query(
      `INSERT INTO user_audit_log (user_id, action, resource, status)
       VALUES ($1, 'user.enable_2fa', 'auth', 'success')`,
      [req.user.id]
    );

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ error: '2FA enable failed' });
  }
};

module.exports = {
  register,
  login,
  logout,
  setupTwoFactor,
  enableTwoFactor,
};
