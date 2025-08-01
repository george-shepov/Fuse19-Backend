const { test, expect } = require('@playwright/test');
const path = require('path');

const authFile = path.join(__dirname, '../.auth/user.json');

test('authenticate', async ({ page }) => {
  console.log('🔐 Setting up authentication for E2E tests...');

  // Navigate to the login page
  await page.goto('/sign-in');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Look for login form elements (adjust selectors based on your Angular app)
  const emailInput = page.locator('input[type="email"], input[name="email"], input[formControlName="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[formControlName="password"]').first();
  const loginButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();

  // Fill in test credentials (using seeded user data)
  await emailInput.fill('john.doe@example.com');
  await passwordInput.fill('Password123!');

  // Click login button
  await loginButton.click();

  // Wait for successful login (adjust based on your app's behavior)
  await page.waitForURL('**/dashboards/**', { timeout: 10000 });

  // Verify we're logged in by checking for authenticated content
  await expect(page.locator('[data-testid="user-menu"], .user-avatar, .profile-menu')).toBeVisible({ timeout: 5000 });

  // Save authentication state
  await page.context().storageState({ path: authFile });

  console.log('✅ Authentication setup completed');
});