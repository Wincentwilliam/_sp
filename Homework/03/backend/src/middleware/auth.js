const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

/**
 * Authentication middleware - verifies JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'AUTH_REQUIRED',
      message: 'Authentication required',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'TOKEN_EXPIRED',
          message: 'Token has expired',
        });
      }
      return res.status(403).json({
        error: 'TOKEN_INVALID',
        message: 'Invalid token',
      });
    }

    req.user = decoded;
    next();
  });
};

/**
 * Optional authentication - attaches user if token valid, continues if not
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
    });
  }

  next();
};

/**
 * Middleware to check if user has completed health profile
 * Must be used after authenticateToken
 */
const requiresHealthProfile = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'AUTH_REQUIRED',
      message: 'Authentication required',
    });
  }

  if (!req.user.hasHealthProfile) {
    return res.status(403).json({
      error: 'PROFILE_REQUIRED',
      message: 'Please complete your health profile to access this feature',
    });
  }

  next();
};

/**
 * Generate JWT token for user
 * @param {Object} user - User data
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      hasHealthProfile: user.hasHealthProfile || false,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

/**
 * Generate refresh token
 * @param {Object} user - User data
 * @returns {string} Refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requiresHealthProfile,
  generateToken,
  generateRefreshToken,
};
