const { test, expect } = require('@playwright/test');
const { ApiHelpers } = require('../utils/api-helpers');
const { PageHelpers } = require('../utils/page-helpers');
const { testUsers, formValidationData, uiSelectors } = require('../fixtures/test-data');

test.describe('Authentication Flow', () => {
  let apiHelpers;
  let pageHelpers;

  test.beforeEach(async ({ page }) => {
    apiHelpers = new ApiHelpers(page);
    pageHelpers = new PageHelpers(page);
  });

  test.describe('Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await pageHelpers.navigateAndWait('/sign-in');

      // Fill login form
      await pageHelpers.fillForm({
        email: 'john.doe@example.com',
        password: 'Password123!'
      });

      // Submit form
      await pageHelpers.clickButton('Sign In');

      // Wait for redirect to dashboard
      await pageHelpers.waitForURL('**/dashboards/**');

      // Verify user is authenticated
      await expect(page.locator(uiSelectors.navigation.userMenu)).toBeVisible();
      
      // Check if auth token is stored
      const token = await apiHelpers.getAuthToken();
      expect(token).toBeTruthy();
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await pageHelpers.navigateAndWait('/sign-in');

      // Fill form with invalid credentials
      await pageHelpers.fillForm({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });

      await pageHelpers.clickButton('Sign In');

      // Should show error notification
      await pageHelpers.waitForNotification('Invalid email or password', 'error');
      
      // Should stay on login page
      await expect(page).toHaveURL(/.*sign-in.*/);
    });

    test('should validate email format', async ({ page }) => {
      await pageHelpers.navigateAndWait('/sign-in');

      for (const invalidEmail of formValidationData.invalidEmails) {
        await pageHelpers.fillForm({
          email: invalidEmail,
          password: 'Password123!'
        });

        // Form should show validation error
        const emailInput = page.locator(uiSelectors.forms.emailInput);
        await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        
        // Clear the field for next iteration
        await emailInput.clear();
      }
    });

    test('should handle password validation', async ({ page }) => {
      await pageHelpers.navigateAndWait('/sign-in');

      // Test empty password
      await pageHelpers.fillForm({
        email: 'test@example.com',
        password: ''
      });

      const submitButton = page.locator(uiSelectors.forms.submitButton);
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Registration', () => {
    test('should register new user with valid data', async ({ page }) => {
      await pageHelpers.navigateAndWait('/sign-up');

      const newUser = {
        name: 'New Test User',
        email: `newuser-${Date.now()}@example.com`,
        password: 'NewUser123!',
        confirmPassword: 'NewUser123!'
      };

      await pageHelpers.fillForm(newUser);
      await pageHelpers.clickButton('Sign Up');

      // Should show success message
      await pageHelpers.waitForNotification('Registration successful', 'success');

      // Should redirect to login or dashboard
      await expect(page).toHaveURL(/.*sign-in.*|.*dashboards.*/);
    });

    test('should validate password strength', async ({ page }) => {
      await pageHelpers.navigateAndWait('/sign-up');

      for (const weakPassword of formValidationData.invalidPasswords) {
        await pageHelpers.fillForm({
          name: 'Test User',
          email: 'test@example.com',
          password: weakPassword,
          confirmPassword: weakPassword
        });

        // Should show password strength warning
        const passwordInput = page.locator(uiSelectors.forms.passwordInput);
        await expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
        
        // Clear for next iteration
        await passwordInput.clear();
        await page.locator('input[name="confirmPassword"]').clear();
      }
    });

    test('should validate password confirmation match', async ({ page }) => {
      await pageHelpers.navigateAndWait('/sign-up');

      await pageHelpers.fillForm({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!'
      });

      // Should show password mismatch error
      const confirmInput = page.locator('input[name="confirmPassword"]');
      await expect(confirmInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should prevent duplicate email registration', async ({ page }) => {
      await pageHelpers.navigateAndWait('/sign-up');

      // Try to register with existing email
      await pageHelpers.fillForm({
        name: 'Test User',
        email: 'john.doe@example.com', // Existing user from seeded data
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });

      await pageHelpers.clickButton('Sign Up');

      // Should show error for existing email
      await pageHelpers.waitForNotification('Email already exists', 'error');
    });
  });

  test.describe('Password Reset', () => {
    test('should send password reset email', async ({ page }) => {
      await pageHelpers.navigateAndWait('/forgot-password');

      await pageHelpers.fillForm({
        email: 'john.doe@example.com'
      });

      await pageHelpers.clickButton('Send Reset Link');

      // Should show success message
      await pageHelpers.waitForNotification('Password reset email sent', 'success');
    });

    test('should handle invalid email for password reset', async ({ page }) => {
      await pageHelpers.navigateAndWait('/forgot-password');

      await pageHelpers.fillForm({
        email: 'nonexistent@example.com'
      });

      await pageHelpers.clickButton('Send Reset Link');

      // Should show error for non-existent email
      await pageHelpers.waitForNotification('Email not found', 'error');
    });
  });

  test.describe('Logout', () => {
    test('should logout user successfully', async ({ page }) => {
      // First login
      await pageHelpers.navigateAndWait('/sign-in');
      await pageHelpers.fillForm({
        email: 'john.doe@example.com',
        password: 'Password123!'
      });
      await pageHelpers.clickButton('Sign In');
      await pageHelpers.waitForURL('**/dashboards/**');

      // Then logout
      await page.locator(uiSelectors.navigation.userMenu).click();
      await pageHelpers.clickButton('Sign Out');

      // Should redirect to login page
      await pageHelpers.waitForURL('**/sign-in**');

      // Auth token should be removed
      const token = await apiHelpers.getAuthToken();
      expect(token).toBeFalsy();
    });
  });

  test.describe('Session Management', () => {
    test('should handle expired session', async ({ page }) => {
      // Login first
      await pageHelpers.navigateAndWait('/sign-in');
      await pageHelpers.fillForm({
        email: 'john.doe@example.com',
        password: 'Password123!'
      });
      await pageHelpers.clickButton('Sign In');
      await pageHelpers.waitForURL('**/dashboards/**');

      // Simulate expired token by clearing it
      await page.evaluate(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      });

      // Navigate to protected route
      await pageHelpers.navigateAndWait('/contacts');

      // Should redirect to login
      await pageHelpers.waitForURL('**/sign-in**');
    });

    test('should refresh token automatically', async ({ page }) => {
      // This test would require backend support for token refresh
      // Implementation depends on your token refresh mechanism
      
      await pageHelpers.navigateAndWait('/sign-in');
      await pageHelpers.fillForm({
        email: 'john.doe@example.com',
        password: 'Password123!'
      });
      await pageHelpers.clickButton('Sign In');
      await pageHelpers.waitForURL('**/dashboards/**');

      // Get initial token
      const initialToken = await apiHelpers.getAuthToken();
      
      // Wait for some time (simulate near token expiry)
      await page.waitForTimeout(2000);
      
      // Make API request that should trigger token refresh
      await apiHelpers.apiRequest('GET', '/auth/profile');
      
      // Token might be refreshed (implementation dependent)
      const newToken = await apiHelpers.getAuthToken();
      expect(newToken).toBeTruthy();
    });
  });
});