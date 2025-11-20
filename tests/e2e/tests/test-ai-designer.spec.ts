import { test, expect, Page } from '@playwright/test';

/**
 * TC101-TC104: AI-Powered Blueprint Generation E2E Tests
 * Validates AI-driven infrastructure design capabilities
 */

test.describe('AI Designer E2E Tests', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

  async function login(page: Page) {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"], input[type="email"]', 'admin@iac.dharma');
    await page.fill('input[name="password"], input[type="password"]', 'test_password_123');
    await page.click('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
    await page.waitForURL(/.*dashboard|.*home|.*blueprints/, { timeout: 10000 });
  }

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC101: Generate simple infrastructure (single VM)', async ({ page }) => {
    // Navigate to AI Designer
    await page.goto(`${BASE_URL}/ai-designer`);
    await page.waitForLoadState('networkidle');

    // Find AI prompt input
    const promptInput = page.locator('textarea[name="prompt"], [data-testid="ai-prompt"], input[placeholder*="describe"]');
    await expect(promptInput).toBeVisible({ timeout: 5000 });

    // Enter simple prompt
    await promptInput.fill('Create a single virtual machine for development');

    // Select cloud provider
    const providerSelect = page.locator('select[name="cloudProvider"], [data-testid="cloud-provider"]');
    if (await providerSelect.isVisible()) {
      await providerSelect.selectOption('aws');
    }

    // Click generate button
    await page.click('button:has-text("Generate"), button:has-text("Create Blueprint"), [data-testid="generate-btn"]');

    // Wait for generation (may take a few seconds)
    await page.waitForTimeout(5000);

    // Verify blueprint was generated
    const blueprintCanvas = page.locator('[data-testid="blueprint-canvas"], .blueprint-view, .generated-blueprint');
    const successMessage = page.locator('text=/generated|created|success/i');
    
    const canvasVisible = await blueprintCanvas.isVisible();
    const messageVisible = await successMessage.isVisible();
    
    expect(canvasVisible || messageVisible).toBeTruthy();

    // Verify at least one resource shown
    const resourceCount = await page.locator('[data-testid="resource-item"], .resource-card, .blueprint-resource').count();
    expect(resourceCount).toBeGreaterThan(0);
  });

  test('TC102: Generate complex multi-tier architecture', async ({ page }) => {
    // Navigate to AI Designer
    await page.goto(`${BASE_URL}/ai-designer`);
    await page.waitForLoadState('networkidle');

    // Enter complex prompt
    const promptInput = page.locator('textarea[name="prompt"], [data-testid="ai-prompt"]');
    await promptInput.fill('Create a three-tier web application with load balancer, auto-scaling web servers, application servers, and a database cluster with read replicas');

    // Select cloud provider
    const providerSelect = page.locator('select[name="cloudProvider"]');
    if (await providerSelect.isVisible()) {
      await providerSelect.selectOption('azure');
    }

    // Generate
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(8000); // Complex generation takes longer

    // Verify multiple resources generated
    const resourceCount = await page.locator('[data-testid="resource-item"], .resource-card, .blueprint-resource').count();
    expect(resourceCount).toBeGreaterThanOrEqual(3); // At least 3 tiers

    // Check for specific resource types if UI shows them
    const hasLoadBalancer = await page.locator('text=/load balancer|lb/i').isVisible();
    const hasDatabase = await page.locator('text=/database|db|sql/i').isVisible();
    
    // At least one tier component should be visible
    expect(hasLoadBalancer || hasDatabase).toBeTruthy();
  });

  test('TC103: Edit generated blueprint', async ({ page }) => {
    // Generate a blueprint first
    await page.goto(`${BASE_URL}/ai-designer`);
    await page.waitForLoadState('networkidle');

    const promptInput = page.locator('textarea[name="prompt"], [data-testid="ai-prompt"]');
    await promptInput.fill('Create a simple web server with database');
    
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(5000);

    // Find edit button or editable resource
    const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-resource"]').first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);

      // Modify resource properties (example: change instance size)
      const instanceSizeSelect = page.locator('select[name="instanceSize"], [data-testid="instance-size"]');
      if (await instanceSizeSelect.isVisible()) {
        await instanceSizeSelect.selectOption({ index: 1 }); // Select second option
      }

      // Modify resource name
      const nameInput = page.locator('input[name="resourceName"], [data-testid="resource-name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('edited-resource-name');
      }

      // Save changes
      await page.click('button:has-text("Save"), button:has-text("Update")');
      await page.waitForTimeout(1000);

      // Verify changes saved
      const savedMessage = await page.locator('text=/saved|updated/i').isVisible();
      expect(savedMessage).toBeTruthy();
    }
  });

  test('TC104: Save blueprint', async ({ page }) => {
    // Generate a blueprint
    await page.goto(`${BASE_URL}/ai-designer`);
    await page.waitForLoadState('networkidle');

    const promptInput = page.locator('textarea[name="prompt"], [data-testid="ai-prompt"]');
    await promptInput.fill('Create a containerized application with Kubernetes cluster');
    
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(5000);

    // Find save/export button
    const saveButton = page.locator('button:has-text("Save Blueprint"), button:has-text("Save"), [data-testid="save-blueprint"]');
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Fill save form if modal appears
    const nameInput = page.locator('input[name="name"], [data-testid="blueprint-name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('E2E AI Generated Blueprint');
      
      const saveConfirm = page.locator('button[type="submit"]:has-text("Save"), button.btn-primary:has-text("Save")');
      await saveConfirm.click();
    }

    await page.waitForTimeout(2000);

    // Verify save success
    const successMessage = page.locator('text=/saved successfully|blueprint created/i, .toast-success');
    const redirectedToList = page.url().includes('blueprints');
    
    expect(await successMessage.isVisible() || redirectedToList).toBeTruthy();

    // Verify blueprint appears in list
    if (redirectedToList) {
      const blueprintItem = page.locator('text=/E2E AI Generated/i');
      await expect(blueprintItem).toBeVisible({ timeout: 5000 });
    }
  });
});
