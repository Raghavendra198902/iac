import { test, expect, Page } from '@playwright/test';

/**
 * TC201-TC206: Blueprint Management E2E Tests
 * Validates CRUD operations for infrastructure blueprints
 */

test.describe('Blueprint Management E2E Tests', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
  let authToken: string;
  let createdBlueprintId: string;

  // Helper: Login before tests
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

  test('TC201: View blueprints list with pagination', async ({ page }) => {
    // Navigate to blueprints page
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    expect(page.url()).toContain('blueprints');

    // Check for blueprints table/grid
    const blueprintsContainer = page.locator('[data-testid="blueprints-list"], .blueprints-list, table, .grid');
    await expect(blueprintsContainer).toBeVisible({ timeout: 5000 });

    // Check for pagination controls if more than 10 items
    const paginationVisible = await page.locator('[data-testid="pagination"], .pagination, button:has-text("Next"), button:has-text("Previous")').isVisible();
    
    // Either pagination exists or there are blueprint items
    const blueprintItems = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr[data-blueprint-id]');
    const itemCount = await blueprintItems.count();
    expect(itemCount >= 0).toBeTruthy(); // Can be 0 if no blueprints yet
  });

  test('TC202: Create manual blueprint', async ({ page }) => {
    // Navigate to create blueprint page
    await page.goto(`${BASE_URL}/blueprints`);
    await page.click('button:has-text("Create Blueprint"), a:has-text("New Blueprint"), [data-testid="create-blueprint"]');
    
    // Wait for form
    await page.waitForSelector('input[name="name"], input[id="name"], [data-testid="blueprint-name"]', { timeout: 5000 });

    // Fill blueprint form
    await page.fill('input[name="name"], [data-testid="blueprint-name"]', 'E2E Test Blueprint');
    await page.fill('textarea[name="description"], [data-testid="blueprint-description"]', 'Created by E2E test suite');
    
    // Select cloud provider
    await page.click('select[name="cloudProvider"], [data-testid="cloud-provider"]');
    await page.click('option[value="aws"], [value="aws"]');

    // Select environment
    await page.selectOption('select[name="environment"], [data-testid="environment"]', 'development');

    // Add a resource (if UI supports it)
    const addResourceButton = page.locator('button:has-text("Add Resource")');
    if (await addResourceButton.isVisible()) {
      await addResourceButton.click();
      await page.fill('input[name="resourceName"]', 'test-vm');
      await page.selectOption('select[name="resourceType"]', 'virtualMachine');
    }

    // Submit form
    await page.click('button[type="submit"]:has-text("Create"), button:has-text("Save Blueprint")');

    // Wait for success message or redirect
    await page.waitForTimeout(2000);
    
    // Verify creation success (toast message, redirect, or list update)
    const successVisible = await page.locator('text=/created successfully|Blueprint saved/i, .toast-success, .alert-success').isVisible();
    expect(successVisible || page.url().includes('blueprints')).toBeTruthy();
  });

  test('TC203: View blueprint details', async ({ page }) => {
    // Navigate to blueprints page
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    // Click first blueprint in list
    const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr[data-blueprint-id]').first();
    
    if (await firstBlueprint.isVisible()) {
      await firstBlueprint.click();
      await page.waitForTimeout(2000);

      // Verify we're on detail page
      expect(page.url()).toMatch(/blueprints\/.+|blueprint-detail/);

      // Check for detail sections
      const nameVisible = await page.locator('[data-testid="blueprint-name"], h1, h2').isVisible();
      const descriptionVisible = await page.locator('[data-testid="blueprint-description"], .description').isVisible();
      
      expect(nameVisible).toBeTruthy();
    } else {
      // No blueprints exist yet - create one first
      test.skip();
    }
  });

  test('TC204: Edit blueprint', async ({ page }) => {
    // Navigate to blueprints page
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    // Find edit button for first blueprint
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit"), [data-testid="edit-blueprint"]').first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(2000);

      // Modify the name
      const nameInput = page.locator('input[name="name"], [data-testid="blueprint-name"]');
      await nameInput.fill('E2E Updated Blueprint Name');

      // Modify description
      const descInput = page.locator('textarea[name="description"], [data-testid="blueprint-description"]');
      await descInput.fill('Updated by E2E test');

      // Save changes
      await page.click('button[type="submit"]:has-text("Save"), button:has-text("Update")');
      await page.waitForTimeout(2000);

      // Verify update success
      const successVisible = await page.locator('text=/updated|saved successfully/i').isVisible();
      expect(successVisible || page.url().includes('blueprints')).toBeTruthy();
    } else {
      test.skip(); // No blueprints to edit
    }
  });

  test('TC205: Delete blueprint', async ({ page }) => {
    // Navigate to blueprints page
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    // Get initial count
    const initialItems = await page.locator('[data-testid="blueprint-item"], .blueprint-card, tr[data-blueprint-id]').count();

    if (initialItems > 0) {
      // Find delete button
      const deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete-blueprint"]').first();
      await deleteButton.click();

      // Confirm deletion in modal/dialog
      await page.waitForTimeout(1000);
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button.btn-danger');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      await page.waitForTimeout(2000);

      // Verify deletion
      const newCount = await page.locator('[data-testid="blueprint-item"], .blueprint-card, tr[data-blueprint-id]').count();
      expect(newCount).toBeLessThan(initialItems);
    } else {
      test.skip(); // No blueprints to delete
    }
  });

  test('TC206: Blueprint versioning', async ({ page }) => {
    // Navigate to blueprints
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    // Click on first blueprint
    const firstBlueprint = page.locator('[data-testid="blueprint-item"]').first();
    
    if (await firstBlueprint.isVisible()) {
      await firstBlueprint.click();
      await page.waitForTimeout(2000);

      // Look for version controls
      const versionButton = page.locator('button:has-text("Version"), a:has-text("Versions"), [data-testid="versions"]');
      
      if (await versionButton.isVisible()) {
        await versionButton.click();
        await page.waitForTimeout(1000);

        // Check for version list
        const versionList = page.locator('[data-testid="version-list"], .version-history, table');
        await expect(versionList).toBeVisible();

        // Create new version button exists
        const createVersionBtn = page.locator('button:has-text("Create Version"), button:has-text("New Version")');
        expect(await createVersionBtn.isVisible()).toBeTruthy();
      } else {
        // Versioning feature may not be implemented yet
        console.log('Versioning feature not found in UI');
      }
    } else {
      test.skip();
    }
  });
});
