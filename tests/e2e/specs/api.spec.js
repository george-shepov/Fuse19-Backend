const { test, expect } = require('@playwright/test');
const { ApiHelpers } = require('../utils/api-helpers');
const { apiEndpoints, testUsers } = require('../fixtures/test-data');

test.describe('API Endpoints', () => {
  let apiHelpers;

  test.beforeEach(async ({ page }) => {
    apiHelpers = new ApiHelpers(page);
  });

  test.describe('Authentication API', () => {
    test('should login via API', async () => {
      const response = await apiHelpers.apiRequest('POST', apiEndpoints.auth.login, {
        data: {
          email: 'hughes.brian@company.com',
          password: 'admin'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.accessToken).toBeTruthy();
      expect(data.data.refreshToken).toBeTruthy();
      expect(data.data.user).toBeTruthy();
      expect(data.data.user.email).toBe('hughes.brian@company.com');
    });

    test('should reject invalid login credentials', async () => {
      const response = await apiHelpers.apiRequest('POST', apiEndpoints.auth.login, {
        data: {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        }
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should get user profile', async ({ page }) => {
      // Login first
      await apiHelpers.loginViaAPI();

      const response = await apiHelpers.apiRequest('GET', apiEndpoints.auth.profile);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('john.doe@example.com');
    });

    test('should refresh token', async ({ page }) => {
      // Login first
      const loginData = await apiHelpers.loginViaAPI();

      const response = await apiHelpers.apiRequest('POST', apiEndpoints.auth.refresh, {
        data: {
          refreshToken: loginData.refreshToken
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.accessToken).toBeTruthy();
    });

    test('should logout', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const response = await apiHelpers.apiRequest('POST', apiEndpoints.auth.logout);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe('Users API', () => {
    test('should get users list', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const response = await apiHelpers.apiRequest('GET', apiEndpoints.users.list);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should create new user', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const newUser = {
        name: 'API Test User',
        email: `apitest-${Date.now()}@example.com`,
        password: 'APITest123!',
        role: 'user'
      };

      const response = await apiHelpers.apiRequest('POST', apiEndpoints.users.create, {
        data: newUser
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(newUser.email);
      expect(data.data.name).toBe(newUser.name);
    });

    test('should update user', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const updateData = {
        name: 'Updated Name'
      };

      const response = await apiHelpers.apiRequest('PUT', '/users/profile', {
        data: updateData
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(updateData.name);
    });
  });

  test.describe('Contacts API', () => {
    test('should get contacts list', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const response = await apiHelpers.apiRequest('GET', apiEndpoints.contacts.list);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should create contact', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const contactData = await apiHelpers.createTestContact();
      expect(contactData.success).toBe(true);
      expect(contactData.data.email).toBeTruthy();
    });

    test('should update contact', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      // Create contact first
      const contactData = await apiHelpers.createTestContact();
      const contactId = contactData.data._id;

      // Update contact
      const updateData = {
        name: 'Updated Contact Name'
      };

      const response = await apiHelpers.apiRequest('PUT', `/contacts/${contactId}`, {
        data: updateData
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(updateData.name);
    });

    test('should delete contact', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      // Create contact first
      const contactData = await apiHelpers.createTestContact();
      const contactId = contactData.data._id;

      // Delete contact
      const response = await apiHelpers.apiRequest('DELETE', `/contacts/${contactId}`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe('Notes API', () => {
    test('should create note', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const noteData = await apiHelpers.createTestNote();
      expect(noteData.success).toBe(true);
      expect(noteData.data.title).toBeTruthy();
    });

    test('should get notes list', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const response = await apiHelpers.apiRequest('GET', apiEndpoints.notes.list);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should search notes', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      // Create a note first
      await apiHelpers.createTestNote({
        title: 'Searchable Note',
        content: 'This note should be found by search'
      });

      // Search for the note
      const response = await apiHelpers.apiRequest('GET', '/notes?search=Searchable');
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      const foundNote = data.data.find(note => note.title.includes('Searchable'));
      expect(foundNote).toBeTruthy();
    });
  });

  test.describe('Tasks API', () => {
    test('should create task', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const taskData = await apiHelpers.createTestTask();
      expect(taskData.success).toBe(true);
      expect(taskData.data.title).toBeTruthy();
    });

    test('should get tasks list', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const response = await apiHelpers.apiRequest('GET', apiEndpoints.tasks.list);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should filter tasks by status', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      // Create completed and pending tasks
      await apiHelpers.createTestTask({ completed: true });
      await apiHelpers.createTestTask({ completed: false });

      // Get completed tasks
      const completedResponse = await apiHelpers.apiRequest('GET', '/tasks?completed=true');
      expect(completedResponse.status()).toBe(200);
      
      const completedData = await completedResponse.json();
      expect(completedData.success).toBe(true);
      expect(completedData.data.every(task => task.completed)).toBe(true);

      // Get pending tasks
      const pendingResponse = await apiHelpers.apiRequest('GET', '/tasks?completed=false');
      expect(pendingResponse.status()).toBe(200);
      
      const pendingData = await pendingResponse.json();
      expect(pendingData.success).toBe(true);
      expect(pendingData.data.every(task => !task.completed)).toBe(true);
    });
  });

  test.describe('API Versioning', () => {
    test('should handle version in URL path', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const response = await apiHelpers.apiRequest('GET', '/v1/users');
      expect(response.status()).toBe(200);
      
      // Check version headers
      const versionHeader = response.headers()['x-api-version'];
      expect(versionHeader).toBe('v1');
    });

    test('should handle version in header', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const response = await apiHelpers.apiRequest('GET', '/users', {
        headers: {
          'X-API-Version': 'v1'
        }
      });

      expect(response.status()).toBe(200);
      const versionHeader = response.headers()['x-api-version'];
      expect(versionHeader).toBe('v1');
    });

    test('should reject unsupported version', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      const response = await apiHelpers.apiRequest('GET', '/users', {
        headers: {
          'X-API-Version': 'v999'
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('not supported');
    });

    test('should get version information', async () => {
      const response = await apiHelpers.apiRequest('GET', '/version');
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.supportedVersions).toContain('v1');
      expect(data.data.currentVersion).toBeTruthy();
    });
  });

  test.describe('Rate Limiting', () => {
    test('should handle rate limiting', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      // Make multiple rapid requests
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(apiHelpers.apiRequest('GET', '/users'));
      }

      const responses = await Promise.all(requests);
      
      // Check if any requests were rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      
      // Depending on rate limit settings, some requests might be rate limited
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].status()).toBe(429);
      }

      // Check rate limit headers
      const response = responses[0];
      const remainingHeader = response.headers()['x-ratelimit-remaining'];
      const limitHeader = response.headers()['x-ratelimit-limit'];
      
      if (remainingHeader) {
        expect(parseInt(remainingHeader)).toBeGreaterThanOrEqual(0);
      }
      if (limitHeader) {
        expect(parseInt(limitHeader)).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 for non-existent endpoints', async ({ page }) => {
      const response = await apiHelpers.apiRequest('GET', '/non-existent-endpoint');
      expect(response.status()).toBe(404);
      
      const data = await response.json();
      expect(data.message).toContain('not found');
    });

    test('should handle unauthorized requests', async ({ page }) => {
      // Don't login for this test
      const response = await apiHelpers.apiRequest('GET', '/users');
      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should validate request data', async ({ page }) => {
      await apiHelpers.loginViaAPI();

      // Send invalid data
      const response = await apiHelpers.apiRequest('POST', '/contacts', {
        data: {
          // Missing required fields
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBeTruthy();
    });
  });

  test.describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await apiHelpers.apiRequest('GET', '/health');
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.timestamp).toBeTruthy();
      expect(data.uptime).toBeGreaterThanOrEqual(0);
    });

    test('should check API health endpoint', async () => {
      const healthData = await apiHelpers.checkAPIHealth();
      expect(healthData.success).toBe(true);
      expect(healthData.message).toContain('running');
    });
  });
});