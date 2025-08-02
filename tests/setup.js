// Test setup file
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fuse19-test';

// Disable email sending in tests
process.env.DISABLE_EMAIL = 'true';
process.env.EMAIL_HOST = 'localhost';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'testpass';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods for cleaner test output (but allow errors for debugging)
global.console = {
  ...console,
  // Silence email errors in tests
  error: jest.fn(),
};