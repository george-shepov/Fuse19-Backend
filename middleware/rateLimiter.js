const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { AppError } = require('./error');
const { getCache } = require('../config/cache');

// Redis client for rate limiting
let redisClient;
try {
  redisClient = require('../config/cache').redisClient;
} catch (error) {
  console.warn('Redis not available for rate limiting, using memory store');
}

// Rate limiting configurations for different endpoint types
const rateLimitConfigs = {
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      error: 'RATE_LIMIT_AUTH'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    skipFailedRequests: false, // Count failed requests
  },

  // Password reset - very strict
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
      success: false,
      message: 'Too many password reset attempts. Please try again in 1 hour.',
      error: 'RATE_LIMIT_PASSWORD_RESET'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Email verification/resend - moderate limits
  email: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 emails per 5 minutes
    message: {
      success: false,
      message: 'Too many email requests. Please wait 5 minutes before requesting another email.',
      error: 'RATE_LIMIT_EMAIL'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // File uploads - per user limits
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour per user
    message: {
      success: false,
      message: 'Upload limit exceeded. You can upload up to 50 files per hour.',
      error: 'RATE_LIMIT_UPLOAD'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // API calls - generous limits for authenticated users
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes per user
    message: {
      success: false,
      message: 'API rate limit exceeded. Please slow down your requests.',
      error: 'RATE_LIMIT_API'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Public API - stricter limits for unauthenticated users
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes per IP
    message: {
      success: false,
      message: 'Rate limit exceeded. Please register or login for higher limits.',
      error: 'RATE_LIMIT_PUBLIC'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Chat/messaging - per user limits
  chat: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 messages per minute per user
    message: {
      success: false,
      message: 'Message rate limit exceeded. Please slow down.',
      error: 'RATE_LIMIT_CHAT'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute per user
    message: {
      success: false,
      message: 'Search rate limit exceeded. Please wait before searching again.',
      error: 'RATE_LIMIT_SEARCH'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }
};

// Create rate limiter with Redis store if available
const createRateLimiter = (config, keyGenerator = null) => {
  const limiterConfig = {
    ...config,
    // Use Redis store if available, otherwise use memory store
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: 'rl:',
    }) : undefined,
    
    // Custom key generator for user-based rate limiting
    keyGenerator: keyGenerator || ((req) => {
      // For authenticated requests, use user ID
      if (req.user && req.user.id) {
        return `user:${req.user.id}`;
      }
      // For unauthenticated requests, use IP address
      return req.ip || req.connection.remoteAddress;
    }),

    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      const error = new AppError(
        config.message.message,
        429,
        config.message.error,
        {
          retryAfter: Math.round(config.windowMs / 1000),
          limit: config.max,
          windowMs: config.windowMs
        }
      );

      res.status(429).json({
        success: false,
        message: error.message,
        error: error.errorCode,
        details: error.details
      });
    },

    // Skip rate limiting based on conditions
    skip: (req) => {
      // Skip for admin users (if implemented)
      if (req.user && req.user.role === 'admin') {
        return true;
      }
      
      // Skip for health checks
      if (req.path === '/health' || req.path === '/api/health') {
        return true;
      }

      return false;
    }
  };

  return rateLimit(limiterConfig);
};

// Pre-configured rate limiters
const rateLimiters = {
  auth: createRateLimiter(rateLimitConfigs.auth),
  passwordReset: createRateLimiter(rateLimitConfigs.passwordReset),
  email: createRateLimiter(rateLimitConfigs.email),
  upload: createRateLimiter(rateLimitConfigs.upload),
  api: createRateLimiter(rateLimitConfigs.api),
  public: createRateLimiter(rateLimitConfigs.public),
  chat: createRateLimiter(rateLimitConfigs.chat),
  search: createRateLimiter(rateLimitConfigs.search),
};

// User-specific rate limiter that considers user tier/subscription
const createUserTierRateLimiter = (baseConfig) => {
  return createRateLimiter({
    ...baseConfig,
    max: (req) => {
      if (!req.user) return baseConfig.max;

      // Different limits based on user tier
      const tierLimits = {
        'admin': baseConfig.max * 10,
        'premium': baseConfig.max * 5,
        'pro': baseConfig.max * 3,
        'basic': baseConfig.max * 2,
        'free': baseConfig.max
      };

      const userTier = req.user.tier || 'free';
      return tierLimits[userTier] || baseConfig.max;
    }
  });
};

// Dynamic rate limiter based on endpoint
const dynamicRateLimiter = (req, res, next) => {
  const path = req.path;
  
  // Choose appropriate rate limiter based on path
  let limiter;
  
  if (path.includes('/auth/login') || path.includes('/auth/register')) {
    limiter = rateLimiters.auth;
  } else if (path.includes('/auth/forgot-password') || path.includes('/auth/reset-password')) {
    limiter = rateLimiters.passwordReset;
  } else if (path.includes('/auth/verify-email') || path.includes('/auth/resend-verification')) {
    limiter = rateLimiters.email;
  } else if (path.includes('/upload')) {
    limiter = rateLimiters.upload;
  } else if (path.includes('/chat') && req.method === 'POST') {
    limiter = rateLimiters.chat;
  } else if (path.includes('/search') || req.query.q) {
    limiter = rateLimiters.search;
  } else if (req.user) {
    // Authenticated API calls
    limiter = rateLimiters.api;
  } else {
    // Public API calls
    limiter = rateLimiters.public;
  }

  limiter(req, res, next);
};

// Rate limiter for specific user actions
const createActionRateLimiter = (action, windowMs, maxAttempts) => {
  return createRateLimiter({
    windowMs,
    max: maxAttempts,
    message: {
      success: false,
      message: `Too many ${action} attempts. Please try again later.`,
      error: `RATE_LIMIT_${action.toUpperCase().replace(' ', '_')}`
    },
    standardHeaders: true,
    legacyHeaders: false,
  }, (req) => {
    const userId = req.user ? req.user.id : req.ip;
    return `${action}:${userId}`;
  });
};

// Middleware to add rate limit info to response headers
const addRateLimitHeaders = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Add rate limit info to API responses
    if (res.locals.rateLimit) {
      const { limit, remaining, reset } = res.locals.rateLimit;
      
      if (data && typeof data === 'object' && data.success !== false) {
        data.rateLimit = {
          limit,
          remaining,
          resetTime: new Date(reset).toISOString()
        };
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Get rate limit status for a user
const getRateLimitStatus = async (userId, limitType = 'api') => {
  if (!redisClient) {
    return { available: true, message: 'Rate limiting not available' };
  }

  try {
    const key = `rl:${limitType}:user:${userId}`;
    const ttl = await redisClient.ttl(key);
    const count = await redisClient.get(key);
    
    const config = rateLimitConfigs[limitType];
    if (!config) {
      return { available: true, message: 'Unknown limit type' };
    }

    const remaining = Math.max(0, config.max - (parseInt(count) || 0));
    const resetTime = ttl > 0 ? new Date(Date.now() + (ttl * 1000)) : null;

    return {
      available: remaining > 0,
      limit: config.max,
      remaining,
      resetTime,
      windowMs: config.windowMs
    };
  } catch (error) {
    console.error('Error checking rate limit status:', error);
    return { available: true, message: 'Error checking rate limit' };
  }
};

// Clear rate limit for a user (admin function)
const clearRateLimit = async (userId, limitType = 'api') => {
  if (!redisClient) {
    return { success: false, message: 'Redis not available' };
  }

  try {
    const key = `rl:${limitType}:user:${userId}`;
    await redisClient.del(key);
    return { success: true, message: 'Rate limit cleared' };
  } catch (error) {
    console.error('Error clearing rate limit:', error);
    return { success: false, message: 'Error clearing rate limit' };
  }
};

module.exports = {
  rateLimiters,
  createRateLimiter,
  createUserTierRateLimiter,
  createActionRateLimiter,
  dynamicRateLimiter,
  addRateLimitHeaders,
  getRateLimitStatus,
  clearRateLimit,
  rateLimitConfigs
};