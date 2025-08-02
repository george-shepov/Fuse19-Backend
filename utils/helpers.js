const { generateJWT, verifyJWT, generateSecureToken } = require('./crypto');
const { validatePassword } = require('./passwordValidator');

/**
 * Generate JWT token for user authentication
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return generateJWT({ user: { id: userId } });
};

/**
 * Generate refresh token
 * @returns {string} - Refresh token
 */
const generateRefreshToken = () => {
  return generateJWT({ 
    tokenId: require('uuid').v4(),
    type: 'refresh'
  }, process.env.JWT_SECRET, { 
    expiresIn: '7d' 
  });
};

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} - Is email valid
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return false;
  }

  // More strict email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  // Additional checks
  if (email.length > 254) return false;
  if (email.includes('..')) return false; // No consecutive dots
  if (email.startsWith('.') || email.endsWith('.')) return false;
  if (email.includes('@.') || email.includes('.@')) return false;
  
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const [local, domain] = parts;
  if (local.length > 64 || local.length === 0) return false;
  if (domain.length === 0) return false;
  
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {object} userInfo - Optional user info for personal data check
 * @returns {object} - Validation result with score and feedback
 */
const validatePasswordStrength = (password, userInfo = {}) => {
  const result = validatePassword(password, userInfo);
  
  return {
    isValid: result.isValid,
    score: Math.floor(result.score / 20), // Convert 0-100 to 0-5 scale
    strength: result.strength.level,
    feedback: [...result.errors, ...result.warnings],
    suggestions: result.suggestions
  };
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Generate random verification code
 * @param {number} length - Code length
 * @returns {string} - Verification code
 */
const generateVerificationCode = (length = 6) => {
  const digits = '0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return code;
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code
 * @returns {object} - Formatted error
 */
const formatError = (message, code = 'GENERIC_ERROR', statusCode = 500) => {
  return {
    success: false,
    error: message,
    code,
    statusCode,
    timestamp: new Date().toISOString()
  };
};

/**
 * Format success response
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @returns {object} - Formatted response
 */
const formatSuccess = (data = null, message = 'Operation successful') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Check if value is empty
 * @param {any} value - Value to check
 * @returns {boolean} - Is value empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  validateEmail,
  validatePasswordStrength,
  sanitizeInput,
  generateVerificationCode,
  formatError,
  formatSuccess,
  isEmpty
};