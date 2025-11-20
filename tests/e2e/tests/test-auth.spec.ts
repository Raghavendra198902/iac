import { test, expect } from '@playwright/test';

/**
 * TC001-TC005: Authentication E2E Tests
 * Validates user authentication flows including login, logout, and session management
 */

test.describe('Authentication E2E Tests', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
  const TEST_USER = {
    email: 'admin@iac.dharma',
    password: 'test_password_123'
  };

  test.beforeEach(async ({ page }) => {
    // Clear authentication state before each test
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
  });

  test('TC002: Successful Login with valid credentials', async ({ page }) => {
    // We're already on the login page from beforeEach
    
    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');

    // Wait for navigation to dashboard or success indicator
    await page.waitForURL(/.*dashboard|.*home|.*blueprints/, { timeout: 10000 });

    // Verify user is logged in - check for user menu or user info display
    const userMenuVisible = await page.locator('button:has-text("Admin User"), .user-menu, [data-testid="user-menu"]').isVisible();
    expect(userMenuVisible).toBeTruthy();

    // Verify email appears somewhere (user menu, header, profile)
    const emailVisible = await page.locator(`text=${TEST_USER.email}`).isVisible();
    expect(emailVisible).toBeTruthy();
  });

  test('TC003: Failed Login with invalid credentials', async ({ page }) => {
    // We're already on the login page from beforeEach
    
    // Fill with invalid credentials
    await page.fill('input[name="email"], input[type="email"]', 'invalid@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');

    // Wait a bit for error message
    await page.waitForTimeout(2000);

    // Verify error message appears (or still on login page for mock auth)
    const errorVisible = await page.locator('text=/Invalid|Error|Failed|incorrect/i').isVisible();
    const stillOnLogin = page.url().includes('/login');
    
    // For mock authentication, either shows error or stays on login
    expect(errorVisible || stillOnLogin).toBeTruthy();
  });

  test('TC004: Session Persistence after page refresh', async ({ page }) => {
    // We're already on the login page, login first
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
    
    await page.waitForURL(/.*dashboard|.*home|.*blueprints/, { timeout: 10000 });

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify user is still logged in after refresh
    const userMenuVisible = await page.locator('.user-menu, [data-testid="user-menu"], button:has-text("Logout")').isVisible();
    expect(userMenuVisible).toBeTruthy();

    // Should not be redirected to login page
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/login|auth/i);
  });

  test('TC005: Logout Flow and session clear', async ({ page }) => {
    // Login first
    const loginButton = page.locator('a:has-text("Login"), button:has-text("Login")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
    
    await page.waitForURL(/.*dashboard|.*home|.*blueprints/, { timeout: 10000 });

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]');
    await logoutButton.click();

    // Wait for redirect to login or home page
    await page.waitForTimeout(2000);

    // Verify redirected to login or public page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login|auth|^\/$|home/i);

    // Verify user menu is no longer visible
    const userMenuVisible = await page.locator('.user-menu, [data-testid="user-menu"]').isVisible();
    expect(userMenuVisible).toBeFalsy();

    // Try to access protected route - should redirect to login
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForTimeout(2000);
    
    const redirectedUrl = page.url();
    expect(redirectedUrl).toMatch(/login|auth/i);
  });

  test('TC002-Extended: Login form validation', async ({ page }) => {
    // Navigate to login
    const loginButton = page.locator('a:has-text("Login"), button:has-text("Login")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    // Try to submit with empty fields
    await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
    await page.waitForTimeout(1000);

    // Should show validation errors or not submit
    const errorOrDisabled = await page.locator('text=/required|fill|enter/i, button[disabled]').isVisible();
    expect(errorOrDisabled).toBeTruthy();

    // Fill only email
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
    await page.waitForTimeout(1000);

    // Should show password required
    const passwordError = await page.locator('text=/password.*required/i').isVisible();
    expect(passwordError).toBeTruthy();
  });
});
