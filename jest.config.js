module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test files patterns
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Exclude patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/demo/',
    '<rootDir>/starter/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    'playwright\\.config\\.js$',
    '\\.spec\\.js$' // Exclude Playwright spec files
  ],
  
  // Coverage configuration
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/demo/**',
    '!**/starter/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Verbose output
  verbose: false,
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true
};