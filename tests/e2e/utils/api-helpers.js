const { expect } = require('@playwright/test');

class ApiHelpers {
  constructor(page) {
    this.page = page;
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:5000/api';
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(method, endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const requestOptions = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    const token = await this.getAuthToken();
    if (token) {
      requestOptions.headers.Authorization = `Bearer ${token}`;
    }

    const response = await this.page.request.fetch(url, requestOptions);
    return response;
  }

  /**
   * Get authentication token from localStorage
   */
  async getAuthToken() {
    try {
      const token = await this.page.evaluate(() => {
        return localStorage.getItem('access_token') || localStorage.getItem('token');
      });
      return token;
    } catch (error) {
      console.warn('Could not retrieve auth token:', error.message);
      return null;
    }
  }

  /**
   * Login via API
   */
  async loginViaAPI(email = 'john.doe@example.com', password = 'Password123!') {
    const response = await this.apiRequest('POST', '/auth/login', {
      data: {
        email,
        password
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Store tokens in localStorage
    await this.page.evaluate((tokens) => {
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
    }, data.data);

    return data.data;
  }

  /**
   * Create test user via API
   */
  async createTestUser(userData = {}) {
    const defaultUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user'
    };

    const response = await this.apiRequest('POST', '/auth/register', {
      data: { ...defaultUser, ...userData }
    });

    expect(response.status()).toBe(201);
    return await response.json();
  }

  /**
   * Create test contact via API
   */
  async createTestContact(contactData = {}) {
    const defaultContact = {
      name: 'Test Contact',
      email: `contact-${Date.now()}@example.com`,
      phone: '+1234567890',
      company: 'Test Company'
    };

    const response = await this.apiRequest('POST', '/contacts', {
      data: { ...defaultContact, ...contactData }
    });

    expect(response.status()).toBe(201);
    return await response.json();
  }

  /**
   * Create test note via API
   */
  async createTestNote(noteData = {}) {
    const defaultNote = {
      title: 'Test Note',
      content: 'This is a test note content',
      tags: ['test'],
      archived: false
    };

    const response = await this.apiRequest('POST', '/notes', {
      data: { ...defaultNote, ...noteData }
    });

    expect(response.status()).toBe(201);
    return await response.json();
  }

  /**
   * Create test task via API
   */
  async createTestTask(taskData = {}) {
    const defaultTask = {
      title: 'Test Task',
      notes: 'This is a test task',
      completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      tags: ['test']
    };

    const response = await this.apiRequest('POST', '/tasks', {
      data: { ...defaultTask, ...taskData }
    });

    expect(response.status()).toBe(201);
    return await response.json();
  }

  /**
   * Upload test file via API
   */
  async uploadTestFile(filePath, uploadEndpoint = '/upload') {
    const response = await this.apiRequest('POST', uploadEndpoint, {
      multipart: {
        file: {
          name: 'test-file.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Test file content')
        }
      }
    });

    expect(response.status()).toBe(200);
    return await response.json();
  }

  /**
   * Wait for API response with retry
   */
  async waitForAPIResponse(endpoint, expectedStatus = 200, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
      const response = await this.apiRequest('GET', endpoint);
      if (response.status() === expectedStatus) {
        return await response.json();
      }
      await this.page.waitForTimeout(1000);
    }
    throw new Error(`API endpoint ${endpoint} did not return expected status ${expectedStatus} after ${maxRetries} retries`);
  }

  /**
   * Check API health
   */
  async checkAPIHealth() {
    const response = await this.apiRequest('GET', '/health');
    expect(response.status()).toBe(200);
    const health = await response.json();
    expect(health.success).toBe(true);
    return health;
  }
}

module.exports = { ApiHelpers };