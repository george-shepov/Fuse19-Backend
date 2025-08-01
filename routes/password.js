const express = require('express');
const { asyncHandler } = require('../middleware/error');
const { 
  validatePassword, 
  generateStrongPassword,
  passwordStrengthConfig 
} = require('../utils/passwordValidator');

const router = express.Router();

// @desc    Check password strength
// @route   POST /api/password/check-strength
// @access  Public
router.post('/check-strength', asyncHandler(async (req, res) => {
  const { password, userInfo = {} } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }

  const validation = validatePassword(password, userInfo);

  res.json({
    success: true,
    data: {
      isValid: validation.isValid,
      score: validation.score,
      strength: validation.strength,
      errors: validation.errors,
      warnings: validation.warnings,
      suggestions: validation.suggestions
    }
  });
}));

// @desc    Generate strong password
// @route   POST /api/password/generate
// @access  Public
router.post('/generate', asyncHandler(async (req, res) => {
  const { length = 16, excludeAmbiguous = true } = req.body;

  if (length < 8 || length > 128) {
    return res.status(400).json({
      success: false,
      message: 'Password length must be between 8 and 128 characters'
    });
  }

  const password = generateStrongPassword(length);
  const validation = validatePassword(password);

  res.json({
    success: true,
    data: {
      password,
      strength: validation.strength,
      score: validation.score
    }
  });
}));

// @desc    Get password requirements
// @route   GET /api/password/requirements
// @access  Public
router.get('/requirements', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      requirements: {
        minLength: passwordStrengthConfig.minLength,
        maxLength: passwordStrengthConfig.maxLength,
        requireLowercase: passwordStrengthConfig.requireLowercase,
        requireUppercase: passwordStrengthConfig.requireUppercase,
        requireNumbers: passwordStrengthConfig.requireNumbers,
        requireSpecialChars: passwordStrengthConfig.requireSpecialChars,
        maxRepeatedChars: passwordStrengthConfig.maxRepeatedChars,
        preventCommonPasswords: passwordStrengthConfig.preventCommonPasswords,
        preventSequentialChars: passwordStrengthConfig.preventSequentialChars,
        preventPersonalInfo: passwordStrengthConfig.preventPersonalInfo
      },
      strengthLevels: [
        { level: 'weak', minScore: 0, color: '#ef4444', description: 'Weak password - easily guessable' },
        { level: 'fair', minScore: 30, color: '#f59e0b', description: 'Fair password - could be stronger' },
        { level: 'good', minScore: 60, color: '#10b981', description: 'Good password - reasonably secure' },
        { level: 'strong', minScore: 80, color: '#059669', description: 'Strong password - very secure' }
      ],
      tips: [
        'Use a mix of uppercase and lowercase letters',
        'Include numbers and special characters',
        'Make it at least 12 characters long',
        'Avoid common words and personal information',
        'Don\'t use keyboard patterns (qwerty, 123456)',
        'Consider using a passphrase with random words',
        'Use a password manager for best security'
      ]
    }
  });
}));

// @desc    Batch check multiple passwords
// @route   POST /api/password/batch-check
// @access  Public
router.post('/batch-check', asyncHandler(async (req, res) => {
  const { passwords, userInfo = {} } = req.body;

  if (!Array.isArray(passwords) || passwords.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Passwords array is required and must not be empty'
    });
  }

  if (passwords.length > 10) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 10 passwords can be checked at once'
    });
  }

  const results = passwords.map((password, index) => {
    const validation = validatePassword(password, userInfo);
    return {
      index,
      password: '***', // Don't return actual password for security
      isValid: validation.isValid,
      score: validation.score,
      strength: validation.strength,
      errors: validation.errors,
      warnings: validation.warnings,
      suggestions: validation.suggestions.slice(0, 3) // Limit suggestions for batch
    };
  });

  res.json({
    success: true,
    data: {
      results,
      summary: {
        total: passwords.length,
        valid: results.filter(r => r.isValid).length,
        invalid: results.filter(r => !r.isValid).length,
        averageScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      }
    }
  });
}));

module.exports = router;