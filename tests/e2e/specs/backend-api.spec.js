const { test, expect } = require('@playwright/test');

test.describe('Backend API Tests', () => {
  const baseURL = 'http://localhost:5000';
  let authToken = null;

  test.beforeAll(async ({ request }) => {
    // Login to get auth token
    const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        email: 'hughes.brian@company.com',
        password: 'admin'
      }
    });

    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    authToken = loginData.data.accessToken;
  });

  test.describe('Authentication API', () => {
    test('should login successfully', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/login`, {
        data: {
          email: 'hughes.brian@company.com',
          password: 'admin'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.accessToken).toBeTruthy();
      expect(data.data.user).toBeTruthy();
      expect(data.data.user.email).toBe('hughes.brian@company.com');
      expect(data.data.user.name).toBe('Brian Hughes');
    });

    test('should reject invalid credentials', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/auth/login`, {
        data: {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        }
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should get current user profile', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.user).toBeTruthy();
      expect(data.data.user.email).toBe('hughes.brian@company.com');
    });
  });

  test.describe('Dashboard API', () => {
    test('should get project dashboard data', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/dashboards/project`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.githubIssues).toBeTruthy();
      expect(data.taskDistribution).toBeTruthy();
      expect(data.schedule).toBeTruthy();
      expect(data.budgetDistribution).toBeTruthy();
    });

    test('should get analytics dashboard data', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/dashboards/analytics`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.visitors).toBeTruthy();
      expect(data.conversions).toBeTruthy();
    });

    test('should get finance dashboard data', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/dashboards/finance`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeTruthy();
    });

    test('should get crypto dashboard data', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/dashboards/crypto`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeTruthy();
    });
  });

  test.describe('Navigation API', () => {
    test('should get navigation structure', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/common/navigation`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.default).toBeTruthy();
      expect(Array.isArray(data.default)).toBe(true);
      expect(data.default.length).toBeGreaterThan(0);
      
      // Check for main sections
      const dashboards = data.default.find(section => section.id === 'dashboards');
      const apps = data.default.find(section => section.id === 'apps');
      const pages = data.default.find(section => section.id === 'pages');
      
      expect(dashboards).toBeTruthy();
      expect(apps).toBeTruthy();
      expect(pages).toBeTruthy();
      
      expect(dashboards.children.length).toBeGreaterThan(0);
      expect(apps.children.length).toBeGreaterThan(0);
    });
  });

  test.describe('Application APIs', () => {
    test('should get scrumboard boards', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/scrumboard/boards`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('title');
        expect(data[0]).toHaveProperty('members');
      }
    });

    test('should get ecommerce inventory', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/ecommerce/inventory`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('name');
        expect(data[0]).toHaveProperty('price');
        expect(data[0]).toHaveProperty('quantity');
      }
    });

    test('should get contacts list', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/contacts`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeTruthy();
      expect(Array.isArray(data.data.contacts)).toBe(true);
    });

    test('should get notes list', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/notes`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeTruthy();
      expect(Array.isArray(data.data.notes)).toBe(true);
    });

    test('should get tasks list', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeTruthy();
      expect(Array.isArray(data.data.tasks)).toBe(true);
    });

    test('should get chat conversations', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/chat`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeTruthy();
      expect(Array.isArray(data.data.chats)).toBe(true);
    });
  });

  test.describe('Common APIs', () => {
    test('should get messages', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/common/messages`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(Array.isArray(data)).toBe(true);
    });

    test('should get notifications', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/common/notifications`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(Array.isArray(data)).toBe(true);
    });

    test('should get shortcuts', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/common/shortcuts`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe('Health Check', () => {
    test('should return healthy status', async ({ request }) => {
      const response = await request.get(`${baseURL}/health`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.status).toBe('OK');
      expect(data.environment).toBe('development');
    });
  });
});
