const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate access token with user roles and permissions
 * @param {Object} payload - User data including roles and permissions
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
  const tokenPayload = {
    userId: payload.userId,
    username: payload.username,
    email: payload.email,
    roles: payload.roles || [],
    permissions: payload.permissions || [],
    type: 'access'
  };
  
  return jwt.sign(tokenPayload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'iac-platform',
    audience: 'iac-api'
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - Minimal user data for refresh
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  const tokenPayload = {
    userId: payload.userId,
    type: 'refresh'
  };
  
  return jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { 
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'iac-platform',
    audience: 'iac-api'
  });
};

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'iac-platform',
      audience: 'iac-api'
    });
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'iac-platform',
      audience: 'iac-api'
    });
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
