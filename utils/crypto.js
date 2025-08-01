const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a secure random token
 * @param {number} length - Length of the token
 * @returns {string} - Random hex token
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a UUID v4
 * @returns {string} - UUID v4
 */
const generateUUID = () => {
  return uuidv4();
};

/**
 * Hash a string using SHA256
 * @param {string} text - Text to hash
 * @returns {string} - SHA256 hash
 */
const hashSHA256 = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Generate HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} - HMAC signature
 */
const generateHMAC = (data, secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} - Is signature valid
 */
const verifyHMAC = (data, signature, secret) => {
  const expectedSignature = generateHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

/**
 * Encrypt text using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key (32 bytes)
 * @returns {object} - Encrypted data with IV and auth tag
 */
const encrypt = (text, key) => {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('additional-data'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

/**
 * Decrypt text using AES-256-GCM
 * @param {object} encryptedData - Encrypted data object
 * @param {string} key - Decryption key (32 bytes)
 * @returns {string} - Decrypted text
 */
const decrypt = (encryptedData, key) => {
  const algorithm = 'aes-256-gcm';
  const decipher = crypto.createDecipher(algorithm, key);
  
  decipher.setAAD(Buffer.from('additional-data'));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

/**
 * Generate JWT token with custom payload
 * @param {object} payload - Token payload
 * @param {string} secret - JWT secret
 * @param {object} options - JWT options
 * @returns {string} - JWT token
 */
const generateJWT = (payload, secret = process.env.JWT_SECRET, options = {}) => {
  const defaultOptions = {
    expiresIn: '24h',
    issuer: 'fuse-backend',
    audience: 'fuse-frontend'
  };
  
  return jwt.sign(payload, secret, { ...defaultOptions, ...options });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {object} - Decoded payload or null if invalid
 */
const verifyJWT = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

/**
 * Generate API key
 * @param {string} prefix - API key prefix
 * @returns {string} - API key
 */
const generateAPIKey = (prefix = 'fuse') => {
  const timestamp = Date.now().toString(36);
  const randomPart = generateSecureToken(16);
  return `${prefix}_${timestamp}_${randomPart}`;
};

/**
 * Generate password hash salt
 * @param {number} rounds - Salt rounds
 * @returns {string} - Salt
 */
const generateSalt = (rounds = 12) => {
  return crypto.randomBytes(rounds).toString('hex');
};

/**
 * Compare timing-safe strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} - Are strings equal
 */
const timingSafeEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(a, 'utf8'),
    Buffer.from(b, 'utf8')
  );
};

/**
 * Generate OTP (One-Time Password)
 * @param {number} length - OTP length
 * @returns {string} - Numeric OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
};

/**
 * Generate secure session ID
 * @returns {string} - Session ID
 */
const generateSessionId = () => {
  const timestamp = Date.now();
  const random = generateSecureToken(16);
  return hashSHA256(`${timestamp}-${random}`);
};

module.exports = {
  generateSecureToken,
  generateUUID,
  hashSHA256,
  generateHMAC,
  verifyHMAC,
  encrypt,
  decrypt,
  generateJWT,
  verifyJWT,
  generateAPIKey,
  generateSalt,
  timingSafeEqual,
  generateOTP,
  generateSessionId
};