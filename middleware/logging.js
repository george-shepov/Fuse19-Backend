const morgan = require('morgan');
const { httpLogger, security, performance, audit } = require('../config/logger');

// Custom Morgan token for user ID
morgan.token('userId', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

// Custom Morgan token for user role
morgan.token('userRole', (req) => {
  return req.user ? req.user.role : 'guest';
});

// Custom Morgan token for request body size
morgan.token('reqSize', (req) => {
  return req.get('content-length') || '0';
});

// Custom Morgan token for response time in milliseconds
morgan.token('responseTimeMs', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '0ms';
});

// Custom Morgan token for client IP (considering proxies)
morgan.token('clientIp', (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
});

// Custom Morgan token for user agent
morgan.token('userAgent', (req) => {
  return req.get('User-Agent') || 'unknown';
});

// Custom Morgan token for correlation ID
morgan.token('correlationId', (req) => {
  return req.correlationId || 'none';
});

// Detailed logging format for production
const detailedFormat = ':clientIp - :userId [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":userAgent" :response-time ms :correlationId';

// Simple format for development
const simpleFormat = ':method :url :status :response-time ms - :res[content-length]';

// Security-focused format
const securityFormat = ':clientIp :userId [:date[iso]] ":method :url" :status ":userAgent" :correlationId';

// Create different Morgan loggers
const createMorganLogger = (format, options = {}) => {
  return morgan(format, {
    stream: {
      write: (message) => {
        // Remove trailing newline
        const cleanMessage = message.trim();
        httpLogger.http(cleanMessage);
      }
    },
    skip: (req, res) => {
      // Skip health checks and static files in production
      if (process.env.NODE_ENV === 'production') {
        return req.url === '/health' || 
               req.url === '/api/health' || 
               req.url.startsWith('/uploads/') ||
               req.url.startsWith('/favicon');
      }
      return false;
    },
    ...options
  });
};

// Main HTTP request logger
const httpRequestLogger = createMorganLogger(
  process.env.NODE_ENV === 'production' ? detailedFormat : simpleFormat
);

// Security logger for sensitive endpoints
const securityRequestLogger = createMorganLogger(securityFormat, {
  skip: (req, res) => {
    // Only log sensitive endpoints
    const sensitiveEndpoints = [
      '/api/auth/',
      '/api/admin/',
      '/api/upload/',
      '/password'
    ];
    
    return !sensitiveEndpoints.some(endpoint => req.url.includes(endpoint));
  }
});

// Middleware to add correlation ID to requests
const addCorrelationId = (req, res, next) => {
  const crypto = require('crypto');
  req.correlationId = req.get('X-Correlation-ID') || crypto.randomUUID();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
};

// Middleware to add request start time
const addRequestTiming = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

// Middleware to log request details
const logRequestDetails = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.json to log response details
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log detailed request/response information
    const logData = {
      correlationId: req.correlationId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      clientIp: req.ip,
      userId: req.user ? req.user.id : null,
      userRole: req.user ? req.user.role : null,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      requestSize: req.get('content-length') || 0,
      responseSize: JSON.stringify(data).length,
      timestamp: new Date().toISOString()
    };

    // Log to different levels based on status code
    if (res.statusCode >= 500) {
      httpLogger.error('HTTP Request Error', logData);
    } else if (res.statusCode >= 400) {
      httpLogger.warn('HTTP Request Warning', logData);
    } else {
      httpLogger.info('HTTP Request', logData);
    }

    // Log performance if response time is high
    if (responseTime > 1000) {
      performance('Slow HTTP Request', {
        ...logData,
        threshold: '1000ms',
        type: 'slow_request'
      });
    }

    // Log security events for authentication endpoints
    if (req.url.includes('/auth/')) {
      security('Authentication Request', {
        ...logData,
        endpoint: req.url,
        type: 'auth_request'
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

// Middleware to log errors
const logErrors = (err, req, res, next) => {
  const errorData = {
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    clientIp: req.ip,
    userId: req.user ? req.user.id : null,
    error: {
      message: err.message,
      stack: err.stack,
      code: err.statusCode || 500
    },
    timestamp: new Date().toISOString()
  };

  httpLogger.error('HTTP Request Error', errorData);

  // Log security-related errors
  if (err.statusCode === 401 || err.statusCode === 403) {
    security('Authentication/Authorization Error', {
      ...errorData,
      type: 'auth_error'
    });
  }

  next(err);
};

// Middleware to log business events
const logBusinessEvent = (event, details = {}) => {
  return (req, res, next) => {
    audit(event, {
      ...details,
      correlationId: req.correlationId,
      userId: req.user ? req.user.id : null,
      userRole: req.user ? req.user.role : null,
      clientIp: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    next();
  };
};

// Middleware to log database operations
const logDatabaseOperation = (operation) => {
  return (req, res, next) => {
    req.dbOperationStart = Date.now();
    req.dbOperation = operation;
    next();
  };
};

// Function to log completed database operations
const logDatabaseComplete = (req, result = null, error = null) => {
  if (!req.dbOperationStart) return;

  const duration = Date.now() - req.dbOperationStart;
  const logData = {
    operation: req.dbOperation,
    duration: `${duration}ms`,
    correlationId: req.correlationId,
    userId: req.user ? req.user.id : null,
    success: !error,
    timestamp: new Date().toISOString()
  };

  if (error) {
    httpLogger.error('Database Operation Failed', {
      ...logData,
      error: error.message
    });
  } else {
    httpLogger.debug('Database Operation Completed', logData);
    
    // Log slow database operations
    if (duration > 500) {
      performance('Slow Database Operation', {
        ...logData,
        threshold: '500ms',
        type: 'slow_db_operation'
      });
    }
  }
};

// Function to create audit trail for user actions
const createAuditTrail = (action, resourceType, resourceId = null, oldData = null, newData = null) => {
  return (req, res, next) => {
    const auditData = {
      action,
      resourceType,
      resourceId,
      userId: req.user ? req.user.id : null,
      userRole: req.user ? req.user.role : null,
      clientIp: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId,
      changes: {
        before: oldData,
        after: newData
      },
      timestamp: new Date().toISOString()
    };

    audit(`${action}_${resourceType}`, auditData);
    next();
  };
};

module.exports = {
  httpRequestLogger,
  securityRequestLogger,
  addCorrelationId,
  addRequestTiming,
  logRequestDetails,
  logErrors,
  logBusinessEvent,
  logDatabaseOperation,
  logDatabaseComplete,
  createAuditTrail
};