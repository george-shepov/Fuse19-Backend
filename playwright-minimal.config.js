// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Minimal Playwright configuration for debugging
 */
module.exports = defineConfig({
  testDir: './tests/e2e/specs',
  testMatch: ['simple-api.spec.js'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5002',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  outputDir: 'test-results/artifacts',
});
