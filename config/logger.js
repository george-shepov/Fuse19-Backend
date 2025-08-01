const winston = require('winston');
const path = require('path');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'fuse19-backend',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Write all logs with importance level of 'error' or less to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // Write all logs with importance level of 'info' or less to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // HTTP requests log
    new winston.transports.File({
      filename: path.join(logsDir, 'requests.log'),
      level: 'http',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // Security events log
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // Performance logs
    new winston.transports.File({
      filename: path.join(logsDir, 'performance.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Create specific loggers for different purposes
const httpLogger = winston.createLogger({
  level: 'http',
  format: logFormat,
  defaultMeta: { service: 'fuse19-http' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

const securityLogger = winston.createLogger({
  level: 'warn',
  format: logFormat,
  defaultMeta: { service: 'fuse19-security' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    // Also log security events to console in development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

const performanceLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'fuse19-performance' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'performance.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

const auditLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'fuse19-audit' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 20, // Keep more audit logs
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Custom logging methods
const loggers = {
  // Main application logger
  info: (message, meta = {}) => logger.info(message, meta),
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),

  // HTTP request logging
  http: (message, meta = {}) => {
    logger.http(message, meta);
    httpLogger.http(message, meta);
  },

  // Security event logging
  security: (message, meta = {}) => {
    securityLogger.warn(message, { 
      ...meta, 
      timestamp: new Date().toISOString(),
      severity: 'security'
    });
  },

  // Performance logging
  performance: (message, meta = {}) => {
    performanceLogger.info(message, {
      ...meta,
      timestamp: new Date().toISOString(),
      type: 'performance'
    });
  },

  // Audit logging
  audit: (action, details = {}) => {
    auditLogger.info('Audit Event', {
      action,
      ...details,
      timestamp: new Date().toISOString(),
      type: 'audit'
    });
  },

  // Database operation logging
  database: (operation, details = {}) => {
    logger.debug('Database Operation', {
      operation,
      ...details,
      type: 'database'
    });
  },

  // Authentication logging
  auth: (event, details = {}) => {
    const level = ['login_failed', 'invalid_token', 'suspicious_activity'].includes(event) ? 'warn' : 'info';
    
    logger.log(level, `Auth Event: ${event}`, {
      event,
      ...details,
      type: 'authentication'
    });

    // Also log to security logger for security-related events
    if (['login_failed', 'invalid_token', 'suspicious_activity', 'brute_force_detected'].includes(event)) {
      securityLogger.warn(`Auth Security Event: ${event}`, {
        event,
        ...details,
        type: 'auth_security'
      });
    }
  },

  // Business logic logging
  business: (event, details = {}) => {
    logger.info(`Business Event: ${event}`, {
      event,
      ...details,
      type: 'business'
    });
  }
};

// Log uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
    type: 'uncaught_exception'
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason.toString(),
    promise: promise.toString(),
    type: 'unhandled_rejection'
  });
});

// Log process termination
process.on('SIGTERM', () => {
  logger.info('Process termination signal received', { signal: 'SIGTERM' });
});

process.on('SIGINT', () => {
  logger.info('Process interruption signal received', { signal: 'SIGINT' });
});

module.exports = {
  logger,
  httpLogger,
  securityLogger,
  performanceLogger,
  auditLogger,
  ...loggers
};