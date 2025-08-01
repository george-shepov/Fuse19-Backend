const { test, expect } = require('@playwright/test');

test.describe('Simple API Test', () => {
  
  test('should connect to a public API to verify test setup', async ({ request }) => {
    // Test with a public API to verify our test setup works
    const response = await request.get('https://httpbin.org/json');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeTruthy();
  });

  test('should make POST request', async ({ request }) => {
    const response = await request.post('https://httpbin.org/post', {
      data: {
        test: 'data',
        timestamp: new Date().toISOString()
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.json.test).toBe('data');
  });

  test('should handle headers', async ({ request }) => {
    const response = await request.get('https://httpbin.org/headers', {
      headers: {
        'X-Test-Header': 'test-value'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.headers['X-Test-Header']).toBe('test-value');
  });

  test('should handle authentication', async ({ request }) => {
    const response = await request.get('https://httpbin.org/basic-auth/user/pass', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('user:pass').toString('base64')
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.authenticated).toBe(true);
    expect(data.user).toBe('user');
  });

  test('should handle JSON responses', async ({ request }) => {
    const response = await request.get('https://httpbin.org/json');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('slideshow');
    expect(data.slideshow).toHaveProperty('title');
  });
});