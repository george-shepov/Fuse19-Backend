const { test, expect } = require('@playwright/test');

test.describe('Basic API Tests', () => {
  
  test('should check API health', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('running');
    expect(data.timestamp).toBeTruthy();
  });

  test('should check server health endpoint', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('OK');
    expect(data.timestamp).toBeTruthy();
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });

  test('should authenticate user via API', async ({ request }) => {
    // Test login with seeded user credentials
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'john.doe@example.com',
        password: 'Password123!'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.data.accessToken).toBeTruthy();
    expect(data.data.refreshToken).toBeTruthy();
    expect(data.data.user.email).toBe('john.doe@example.com');
  });

  test('should reject invalid login credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('should get API version info', async ({ request }) => {
    const response = await request.get('/api/version');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.supportedVersions).toContain('v1');
    expect(data.data.currentVersion).toBeTruthy();
  });

  test('should handle 404 for non-existent endpoint', async ({ request }) => {
    const response = await request.get('/api/non-existent-endpoint');
    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data.message).toContain('not found');
  });

  test('should require authentication for protected endpoints', async ({ request }) => {
    const response = await request.get('/api/users');
    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('should access protected endpoint with valid token', async ({ request }) => {
    // First, login to get token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'john.doe@example.com',
        password: 'Password123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;

    // Use token to access protected endpoint
    const response = await request.get('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.email).toBe('john.doe@example.com');
  });

  test('should create and retrieve contacts', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'john.doe@example.com',
        password: 'Password123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;

    // Create a contact
    const createResponse = await request.post('/api/contacts', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        firstName: 'Test',
        lastName: 'Contact',
        email: 'test.contact@example.com',
        phone: '+1234567890',
        company: 'Test Company'
      }
    });

    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);
    expect(createData.data.firstName).toBe('Test');
    expect(createData.data.lastName).toBe('Contact');

    // Get contacts list
    const listResponse = await request.get('/api/contacts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    expect(listData.success).toBe(true);
    expect(Array.isArray(listData.data)).toBe(true);
    expect(listData.data.length).toBeGreaterThan(0);
  });

  test('should create and retrieve notes', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'john.doe@example.com',
        password: 'Password123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;

    // Create a note
    const createResponse = await request.post('/api/notes', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        title: 'Test Note',
        content: 'This is a test note created via API',
        tags: ['test', 'api']
      }
    });

    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);
    expect(createData.data.title).toBe('Test Note');

    // Get notes list
    const listResponse = await request.get('/api/notes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    expect(listData.success).toBe(true);
    expect(Array.isArray(listData.data)).toBe(true);
    expect(listData.data.length).toBeGreaterThan(0);
  });

  test('should create and retrieve tasks', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'john.doe@example.com',
        password: 'Password123!'
      }
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;

    // Create a task
    const createResponse = await request.post('/api/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        title: 'Test Task',
        description: 'This is a test task created via API',
        priority: 'medium',
        status: 'todo'
      }
    });

    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);
    expect(createData.data.title).toBe('Test Task');

    // Get tasks list
    const listResponse = await request.get('/api/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();
    expect(listData.success).toBe(true);
    expect(Array.isArray(listData.data)).toBe(true);
    expect(listData.data.length).toBeGreaterThan(0);
  });

  test('should handle rate limiting', async ({ request }) => {
    // Make multiple rapid requests to trigger rate limiting
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(request.get('/api/health'));
    }

    const responses = await Promise.all(requests);
    
    // Check if some requests were rate limited
    const successfulRequests = responses.filter(r => r.status() === 200);
    const rateLimitedRequests = responses.filter(r => r.status() === 429);
    
    // At least some requests should succeed
    expect(successfulRequests.length).toBeGreaterThan(0);
    
    // Check rate limit headers if present
    const firstResponse = responses[0];
    const headers = firstResponse.headers();
    
    if (headers['x-ratelimit-limit']) {
      expect(parseInt(headers['x-ratelimit-limit'])).toBeGreaterThan(0);
    }
  });
});