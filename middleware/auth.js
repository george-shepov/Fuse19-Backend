const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
function auth(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    return res.status(401).json({ 
      message: 'No token provided, authorization denied',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle demo user in development
    if (decoded.user.id === 'demo-user-id' && process.env.NODE_ENV === 'development') {
      req.user = {
        id: 'demo-user-id',
        name: 'Brian Hughes',
        email: 'hughes.brian@company.com',
        role: 'admin'
      };
      return next();
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      message: 'Token is not valid',
      code: 'INVALID_TOKEN'
    });
  }
}

// Optional auth - doesn't fail if no token
function optionalAuth(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle demo user in development
    if (decoded.user.id === 'demo-user-id' && process.env.NODE_ENV === 'development') {
      req.user = {
        id: 'demo-user-id',
        name: 'Brian Hughes',
        email: 'hughes.brian@company.com',
        role: 'admin'
      };
    } else {
      req.user = decoded.user;
    }
  } catch (err) {
    req.user = null;
  }
  
  next();
}

// Admin role check
function adminAuth(req, res, next) {
  auth(req, res, async () => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Access denied. Admin privileges required.',
          code: 'INSUFFICIENT_PRIVILEGES'
        });
      }
      next();
    } catch (err) {
      console.error('Admin auth error:', err.message);
      return res.status(500).json({ message: 'Server error during authorization' });
    }
  });
}

// User self or admin check
function userSelfOrAdmin(req, res, next) {
  auth(req, res, async () => {
    try {
      const userId = req.params.id || req.params.userId;
      const currentUser = await User.findById(req.user.id);
      
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Allow if user is accessing their own data or is admin
      if (req.user.id === userId || currentUser.role === 'admin') {
        return next();
      }
      
      return res.status(403).json({ 
        message: 'Access denied. You can only access your own data.',
        code: 'ACCESS_DENIED'
      });
    } catch (err) {
      console.error('User auth error:', err.message);
      return res.status(500).json({ message: 'Server error during authorization' });
    }
  });
}

module.exports = { 
  auth, 
  optionalAuth, 
  adminAuth, 
  userSelfOrAdmin 
};