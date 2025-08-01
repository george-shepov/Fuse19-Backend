# End-to-End Testing with Playwright

This document describes the comprehensive E2E testing suite for the Fuse19 Backend project using Playwright.

## Overview

The E2E test suite provides comprehensive testing of the full application stack:
- **Backend API Testing**: Direct API endpoint testing
- **Frontend Integration**: Testing the Angular frontend with backend integration
- **Real-time Features**: WebSocket/Socket.io testing
- **File Operations**: Upload, download, and file management testing
- **Authentication Flows**: Login, registration, password reset testing
- **Multi-browser Support**: Chrome, Firefox, Safari, and mobile browsers

## Setup

### Prerequisites

1. **Node.js Dependencies**:
   ```bash
   npm install
   ```

2. **Playwright Browsers**:
   ```bash
   npm run test:e2e:install
   # or
   npx playwright install
   ```

3. **System Dependencies** (Linux):
   ```bash
   sudo npx playwright install-deps
   ```

### Environment Configuration

Create a `.env.test` file for test-specific environment variables:

```env
NODE_ENV=test
PORT=5000
MONGODB_TEST_URI=mongodb://localhost:27017/fuse19_e2e_test
JWT_SECRET=test-jwt-secret-key-for-e2e-tests
JWT_REFRESH_SECRET=test-refresh-secret-key-for-e2e-tests
FRONTEND_URL=http://localhost:4200
API_BASE_URL=http://localhost:5000/api
```

## Test Structure

```
tests/
├── e2e/
│   ├── specs/              # Test files
│   │   ├── auth.spec.js    # Authentication tests
│   │   ├── contacts.spec.js # Contact management tests
│   │   ├── chat.spec.js    # Real-time chat tests
│   │   ├── file-upload.spec.js # File operations tests
│   │   └── api.spec.js     # API endpoint tests
│   ├── utils/              # Helper utilities
│   │   ├── api-helpers.js  # API testing utilities
│   │   └── page-helpers.js # UI testing utilities
│   ├── fixtures/           # Test data and files
│   │   ├── test-data.js    # Mock data for tests
│   │   └── test-image.png  # Sample files
│   ├── auth.setup.js       # Authentication setup
│   ├── cleanup.teardown.js # Test cleanup
│   ├── global-setup.js     # Global test setup
│   └── global-teardown.js  # Global test teardown
├── .auth/                  # Stored authentication states
└── playwright.config.js    # Playwright configuration
```

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests (step through)
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

### Advanced Commands

```bash
# Run specific test file
npx playwright test auth.spec.js

# Run tests with specific browser
npx playwright test --project=chromium

# Run tests in parallel
npx playwright test --workers=2

# Run tests with video recording
npx playwright test --video=on

# Generate and show HTML report
npx playwright test --reporter=html
npx playwright show-report
```

## Test Categories

### 1. Authentication Tests (`auth.spec.js`)

- **Login Flow**: Valid/invalid credentials, session management
- **Registration**: User creation, validation, duplicate prevention
- **Password Reset**: Email sending, token validation
- **Session Management**: Token refresh, expiration handling
- **Logout**: Proper session cleanup

**Example Test**:
```javascript
test('should login with valid credentials', async ({ page }) => {
  await pageHelpers.navigateAndWait('/sign-in');
  await pageHelpers.fillForm({
    email: 'john.doe@example.com',
    password: 'Password123!'
  });
  await pageHelpers.clickButton('Sign In');
  await pageHelpers.waitForURL('**/dashboards/**');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

### 2. API Tests (`api.spec.js`)

- **Endpoint Testing**: All CRUD operations
- **Authentication**: Token-based API access  
- **Rate Limiting**: Request throttling validation
- **Versioning**: API version handling
- **Error Handling**: 4xx/5xx response testing

**Example Test**:
```javascript
test('should create contact via API', async ({ page }) => {
  await apiHelpers.loginViaAPI();
  const response = await apiHelpers.apiRequest('POST', '/contacts', {
    data: { name: 'Test Contact', email: 'test@example.com' }
  });
  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.success).toBe(true);
});
```

### 3. Real-time Chat Tests (`chat.spec.js`)

- **Message Sending**: Text messages, file uploads
- **Real-time Updates**: Live message delivery
- **Typing Indicators**: User typing status
- **Online Status**: User presence indicators
- **Message History**: Loading previous messages

**Example Test**:
```javascript
test('should send and receive messages in real-time', async ({ page, context }) => {
  const secondPage = await context.newPage();
  // Setup two users in same chat
  // User 1 sends message
  // User 2 should receive it immediately
});
```

### 4. File Upload Tests (`file-upload.spec.js`)

- **File Operations**: Upload, download, delete, rename
- **File Types**: Images, documents, validation
- **Size Limits**: File size restriction testing
- **Progress Tracking**: Upload progress indicators
- **Drag & Drop**: File drop zone functionality

**Example Test**:
```javascript
test('should upload and process image file', async ({ page }) => {
  await pageHelpers.navigateAndWait('/file-manager');
  await pageHelpers.uploadFile('input[type="file"]', testImagePath);
  await pageHelpers.waitForNotification('File uploaded successfully');
  await expect(page.locator('text=test-image.png')).toBeVisible();
});
```

### 5. Contact Management Tests (`contacts.spec.js`)

- **CRUD Operations**: Create, read, update, delete contacts
- **Search & Filter**: Contact search functionality  
- **Import/Export**: CSV import/export features
- **Validation**: Form validation and error handling

## Test Data Management

### Fixtures (`fixtures/test-data.js`)

Pre-defined test data for consistent testing:

```javascript
const testUsers = {
  admin: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  user: { name: 'Regular User', email: 'user@example.com', role: 'user' }
};

const testContacts = [
  { name: 'Alice Johnson', email: 'alice@testcompany.com', phone: '+1-555-0101' }
];
```

### Database Seeding

Automatic test database setup with sample data:

```javascript
// Global setup creates test database with seeded data
await seedDatabase(true); // Skip confirmations for E2E tests
```

## Helper Utilities

### API Helpers (`utils/api-helpers.js`)

Utilities for API testing:
- `loginViaAPI()` - Authenticate via API
- `createTestUser()` - Create test user data
- `apiRequest()` - Make authenticated API calls
- `checkAPIHealth()` - Verify API status

### Page Helpers (`utils/page-helpers.js`)

Utilities for UI testing:
- `navigateAndWait()` - Navigation with Angular readiness
- `fillForm()` - Form filling with validation
- `waitForNotification()` - Toast/notification waiting
- `getTableData()` - Extract table data for validation

## Configuration

### Playwright Config (`playwright.config.js`)

Key configuration options:

```javascript
module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Avoid database conflicts
  workers: 1, // Single worker for consistency
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.js/ },
    { name: 'chromium', dependencies: ['setup'] },
    { name: 'firefox', dependencies: ['setup'] },
    { name: 'webkit', dependencies: ['setup'] }
  ],
  webServer: [
    { command: 'npm run dev', port: 5000 },
    { command: 'cd demo && npm run start', port: 4200 }
  ]
});
```

## Best Practices

### 1. Test Isolation
- Each test runs independently
- Clean database state for each test suite
- Proper setup/teardown procedures

### 2. Realistic Testing
- Use actual HTTP requests, not mocks
- Test with real browser interactions
- Include network delays and loading states

### 3. Maintainable Tests
- Use page object patterns
- Centralize test data in fixtures
- Create reusable helper functions

### 4. Comprehensive Coverage
- Test happy paths and edge cases
- Include error scenarios
- Validate UI feedback and notifications

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Kill processes on test ports
   lsof -ti:5000 | xargs kill -9
   lsof -ti:4200 | xargs kill -9
   ```

2. **Browser Installation**:
   ```bash
   # Reinstall browsers
   npx playwright install --force
   ```

3. **Database Issues**:
   ```bash
   # Clear test database
   npm run seed:clear
   ```

4. **Flaky Tests**:
   - Increase timeout values
   - Add proper wait conditions
   - Check for race conditions

### Debug Mode

Run tests in debug mode to step through:

```bash
npm run test:e2e:debug
# or
npx playwright test --debug auth.spec.js
```

### Test Reports

View detailed test results:
- HTML Report: `npx playwright show-report`
- Test artifacts: `test-results/` directory
- Screenshots: Captured on failure
- Videos: Recorded for failed tests
- Traces: Available for debugging

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: test-results/
```

## Performance Considerations

- Tests run sequentially to avoid database conflicts
- In-memory MongoDB for faster test execution
- Selective browser testing (Chrome by default)
- Parallel test execution where safe
- Efficient cleanup procedures

## Future Enhancements

- Visual regression testing
- Mobile device testing
- Performance testing integration
- Cross-browser compatibility matrix
- Test result analytics and reporting