// Password strength validation utility

/**
 * Password strength criteria:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 * - Not commonly used passwords
 * - Not sequential characters
 * - Not repeated characters
 */

const commonPasswords = [
  'password', 'password123', '123456', '123456789', 'qwerty', 'abc123',
  'password1', '12345678', '111111', '1234567890', 'admin', 'letmein',
  'welcome', 'monkey', 'dragon', 'master', 'superman', 'trustno1',
  'hello', 'freedom', 'whatever', 'michael', 'jesus', 'ninja',
  'mustang', 'shadow', 'jordan', 'hunter', 'football', 'baseball',
  'soccer', 'charlie', 'killer', 'jennifer', 'computer', 'michelle'
];

const passwordStrengthConfig = {
  minLength: 8,
  maxLength: 128,
  requireLowercase: true,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxRepeatedChars: 3,
  preventCommonPasswords: true,
  preventSequentialChars: true,
  preventPersonalInfo: true
};

/**
 * Check if password contains sequential characters
 * @param {string} password 
 * @returns {boolean}
 */
const hasSequentialChars = (password) => {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiopasdfghjklzxcvbnm',
    '1234567890'
  ];

  for (const sequence of sequences) {
    for (let i = 0; i <= sequence.length - 3; i++) {
      const subSeq = sequence.substring(i, i + 3);
      const reverseSeq = subSeq.split('').reverse().join('');
      
      if (password.toLowerCase().includes(subSeq) || 
          password.toLowerCase().includes(reverseSeq)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Check if password has too many repeated characters
 * @param {string} password 
 * @param {number} maxRepeated 
 * @returns {boolean}
 */
const hasRepeatedChars = (password, maxRepeated = 3) => {
  let count = 1;
  for (let i = 1; i < password.length; i++) {
    if (password[i] === password[i - 1]) {
      count++;
      if (count > maxRepeated) return true;
    } else {
      count = 1;
    }
  }
  return false;
};

/**
 * Check if password contains personal information
 * @param {string} password 
 * @param {Object} userInfo 
 * @returns {boolean}
 */
const containsPersonalInfo = (password, userInfo = {}) => {
  const passwordLower = password.toLowerCase();
  const { name, email, username } = userInfo;

  // Check against name
  if (name) {
    const nameParts = name.toLowerCase().split(' ');
    for (const part of nameParts) {
      if (part.length >= 3 && passwordLower.includes(part)) {
        return true;
      }
    }
  }

  // Check against email
  if (email) {
    const emailParts = email.toLowerCase().split('@')[0];
    if (emailParts.length >= 3 && passwordLower.includes(emailParts)) {
      return true;
    }
  }

  // Check against username
  if (username && username.length >= 3 && passwordLower.includes(username.toLowerCase())) {
    return true;
  }

  return false;
};

/**
 * Calculate password strength score (0-100)
 * @param {string} password 
 * @param {Object} userInfo 
 * @returns {number}
 */
const calculatePasswordScore = (password, userInfo = {}) => {
  let score = 0;

  // Length scoring (0-25 points)
  if (password.length >= 8) score += 5;
  if (password.length >= 10) score += 5;
  if (password.length >= 12) score += 5;
  if (password.length >= 16) score += 10;

  // Character variety (0-40 points)
  if (/[a-z]/.test(password)) score += 10; // lowercase
  if (/[A-Z]/.test(password)) score += 10; // uppercase
  if (/[0-9]/.test(password)) score += 10; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 10; // special chars

  // Complexity bonus (0-35 points)
  const charSets = [
    /[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/
  ].filter(regex => regex.test(password)).length;

  if (charSets >= 3) score += 10;
  if (charSets === 4) score += 10;

  // Entropy bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 10;
  if (uniqueChars >= password.length * 0.9) score += 5;

  // Penalties
  if (hasSequentialChars(password)) score -= 15;
  if (hasRepeatedChars(password, 2)) score -= 10;
  if (commonPasswords.includes(password.toLowerCase())) score -= 25;
  if (containsPersonalInfo(password, userInfo)) score -= 20;

  return Math.max(0, Math.min(100, score));
};

/**
 * Get password strength level
 * @param {number} score 
 * @returns {Object}
 */
const getPasswordStrengthLevel = (score) => {
  if (score < 30) {
    return {
      level: 'weak',
      label: 'Weak',
      color: '#ef4444',
      description: 'Your password is weak and easily guessable.'
    };
  } else if (score < 60) {
    return {
      level: 'fair',
      label: 'Fair',
      color: '#f59e0b',
      description: 'Your password is fair but could be stronger.'
    };
  } else if (score < 80) {
    return {
      level: 'good',
      label: 'Good',
      color: '#10b981',
      description: 'Your password is good and reasonably secure.'
    };
  } else {
    return {
      level: 'strong',
      label: 'Strong',
      color: '#059669',
      description: 'Your password is strong and very secure.'
    };
  }
};

/**
 * Validate password against all criteria
 * @param {string} password 
 * @param {Object} userInfo 
 * @param {Object} config 
 * @returns {Object}
 */
const validatePassword = (password, userInfo = {}, config = passwordStrengthConfig) => {
  const errors = [];
  const warnings = [];
  
  // Required validations
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, warnings, score: 0, strength: getPasswordStrengthLevel(0) };
  }

  if (password.length < config.minLength) {
    errors.push(`Password must be at least ${config.minLength} characters long`);
  }

  if (password.length > config.maxLength) {
    errors.push(`Password must not exceed ${config.maxLength} characters`);
  }

  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (config.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (config.requireSpecialChars && !/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }

  // Warning validations
  if (config.preventCommonPasswords && commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common and easily guessable');
  }

  if (config.preventSequentialChars && hasSequentialChars(password)) {
    warnings.push('Avoid sequential characters (e.g., abc, 123, qwerty)');
  }

  if (hasRepeatedChars(password, config.maxRepeatedChars)) {
    warnings.push(`Avoid repeating the same character more than ${config.maxRepeatedChars} times`);
  }

  if (config.preventPersonalInfo && containsPersonalInfo(password, userInfo)) {
    warnings.push('Avoid using personal information like your name or email in your password');
  }

  // Calculate strength
  const score = calculatePasswordScore(password, userInfo);
  const strength = getPasswordStrengthLevel(score);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score,
    strength,
    suggestions: generatePasswordSuggestions(password, errors, warnings)
  };
};

/**
 * Generate password improvement suggestions
 * @param {string} password 
 * @param {Array} errors 
 * @param {Array} warnings 
 * @returns {Array}
 */
const generatePasswordSuggestions = (password, errors, warnings) => {
  const suggestions = [];

  if (password.length < 12) {
    suggestions.push('Consider using a longer password (12+ characters) for better security');
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    suggestions.push('Mix uppercase and lowercase letters');
  }

  if (!/[0-9]/.test(password)) {
    suggestions.push('Include numbers in your password');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    suggestions.push('Add special characters like !@#$%^&*');
  }

  if (hasSequentialChars(password)) {
    suggestions.push('Avoid keyboard patterns and sequential characters');
  }

  if (commonPasswords.includes(password.toLowerCase())) {
    suggestions.push('Choose a unique password that\'s not commonly used');
  }

  if (suggestions.length === 0) {
    suggestions.push('Consider using a passphrase with multiple random words');
    suggestions.push('Use a password manager to generate and store strong passwords');
  }

  return suggestions;
};

/**
 * Generate a strong password
 * @param {number} length 
 * @returns {string}
 */
const generateStrongPassword = (length = 16) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + specialChars;
  let password = '';

  // Ensure at least one character from each set
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

module.exports = {
  validatePassword,
  calculatePasswordScore,
  getPasswordStrengthLevel,
  generateStrongPassword,
  passwordStrengthConfig,
  hasSequentialChars,
  hasRepeatedChars,
  containsPersonalInfo
};