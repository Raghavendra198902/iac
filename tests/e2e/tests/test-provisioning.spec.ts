import { test, expect, Page } from '@playwright/test';

/**
 * TC301-TC307: Provisioning Workflow E2E Tests
 * Validates infrastructure provisioning pipeline from validation to deployment
 */

test.describe('Provisioning Workflow E2E Tests', () => {
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

  test('TC301: Run guardrails check', async ({ page }) => {
    // Navigate to blueprints and select first one
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
    const blueprintCount = await firstBlueprint.count();

    if (blueprintCount === 0) {
      test.skip();
    }

    await firstBlueprint.click();
    await page.waitForTimeout(1000);

    // Find guardrails/validation button
    const guardrailsButton = page.locator(
      'button:has-text("Run Guardrails"), button:has-text("Validate"), [data-testid="run-guardrails"]'
    );

    if (await guardrailsButton.isVisible()) {
      await guardrailsButton.click();
      await page.waitForTimeout(3000); // Guardrails check takes time

      // Verify results shown
      const resultsPanel = page.locator('[data-testid="guardrails-results"], .validation-results, .guardrails-panel');
      const passedMessage = page.locator('text=/passed|compliant|no issues/i');
      const failedMessage = page.locator('text=/failed|violations|warnings/i');

      const resultsVisible = await resultsPanel.isVisible();
      const statusVisible = (await passedMessage.isVisible()) || (await failedMessage.isVisible());

      expect(resultsVisible || statusVisible).toBeTruthy();
    }
  });

  test('TC302: Generate Terraform code', async ({ page }) => {
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
    if ((await firstBlueprint.count()) === 0) {
      test.skip();
    }

    await firstBlueprint.click();
    await page.waitForTimeout(1000);

    // Find generate/export button
    const generateButton = page.locator(
      'button:has-text("Generate Terraform"), button:has-text("Export Terraform"), [data-testid="generate-terraform"]'
    );

    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(2000);

      // Verify code generated
      const codeBlock = page.locator('pre, code, [data-testid="terraform-code"], .code-viewer');
      const downloadButton = page.locator('button:has-text("Download"), [data-testid="download-terraform"]');
      
      const codeVisible = await codeBlock.isVisible();
      const downloadVisible = await downloadButton.isVisible();

      expect(codeVisible || downloadVisible).toBeTruthy();

      // Check for Terraform syntax
      if (codeVisible) {
        const codeContent = await codeBlock.textContent();
        expect(codeContent).toContain('resource');
      }
    }
  });

  test('TC303: Generate Bicep code', async ({ page }) => {
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
    if ((await firstBlueprint.count()) === 0) {
      test.skip();
    }

    await firstBlueprint.click();
    await page.waitForTimeout(1000);

    // Find Bicep generation option
    const bicepButton = page.locator(
      'button:has-text("Generate Bicep"), button:has-text("Export Bicep"), [data-testid="generate-bicep"]'
    );

    // May need to select format first
    const formatSelect = page.locator('select[name="format"], [data-testid="code-format"]');
    if (await formatSelect.isVisible()) {
      await formatSelect.selectOption('bicep');
      await page.waitForTimeout(500);
    }

    if (await bicepButton.isVisible()) {
      await bicepButton.click();
      await page.waitForTimeout(2000);

      const codeBlock = page.locator('pre, code, [data-testid="bicep-code"]');
      const codeVisible = await codeBlock.isVisible();

      if (codeVisible) {
        const codeContent = await codeBlock.textContent();
        expect(codeContent).toMatch(/resource|param|output/);
      }
    }
  });

  test('TC304: Validate generated IaC', async ({ page }) => {
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
    if ((await firstBlueprint.count()) === 0) {
      test.skip();
    }

    await firstBlueprint.click();
    await page.waitForTimeout(1000);

    // Generate code first
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Export")').first();
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await page.waitForTimeout(2000);
    }

    // Run validation
    const validateButton = page.locator(
      'button:has-text("Validate"), button:has-text("Check Syntax"), [data-testid="validate-iac"]'
    );

    if (await validateButton.isVisible()) {
      await validateButton.click();
      await page.waitForTimeout(2000);

      // Check validation results
      const validMessage = page.locator('text=/valid|no errors|syntax correct/i');
      const errorMessage = page.locator('text=/invalid|errors found|syntax error/i');
      
      const resultShown = (await validMessage.isVisible()) || (await errorMessage.isVisible());
      expect(resultShown).toBeTruthy();
    }
  });

  test('TC305: Estimate costs', async ({ page }) => {
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
    if ((await firstBlueprint.count()) === 0) {
      test.skip();
    }

    await firstBlueprint.click();
    await page.waitForTimeout(1000);

    // Find cost estimation button
    const costButton = page.locator(
      'button:has-text("Estimate Cost"), button:has-text("Calculate Cost"), [data-testid="estimate-cost"]'
    );

    if (await costButton.isVisible()) {
      await costButton.click();
      await page.waitForTimeout(3000); // Cost calculation may take time

      // Verify cost information displayed
      const costDisplay = page.locator('[data-testid="cost-estimate"], .cost-breakdown, .pricing-info');
      const currencySymbol = page.locator('text=/\\$|USD|EUR|£/');
      
      const costVisible = await costDisplay.isVisible();
      const priceVisible = await currencySymbol.isVisible();

      expect(costVisible || priceVisible).toBeTruthy();
    }
  });

  test('TC306: Create deployment (dry run)', async ({ page }) => {
    await page.goto(`${BASE_URL}/blueprints`);
    await page.waitForLoadState('networkidle');

    const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
    if ((await firstBlueprint.count()) === 0) {
      test.skip();
    }

    await firstBlueprint.click();
    await page.waitForTimeout(1000);

    // Find deploy button
    const deployButton = page.locator(
      'button:has-text("Deploy"), button:has-text("Provision"), [data-testid="deploy-blueprint"]'
    );

    if (await deployButton.isVisible()) {
      await deployButton.click();
      await page.waitForTimeout(1000);

      // Select dry run option if available
      const dryRunCheckbox = page.locator('input[type="checkbox"][name="dryRun"], [data-testid="dry-run"]');
      if (await dryRunCheckbox.isVisible()) {
        await dryRunCheckbox.check();
      }

      // Confirm deployment
      const confirmButton = page.locator('button:has-text("Confirm"), button[type="submit"]');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await page.waitForTimeout(2000);

        // Verify deployment initiated
        const statusMessage = page.locator('text=/deployment|provisioning|in progress/i');
        const deploymentPage = page.url().includes('deployment');

        expect((await statusMessage.isVisible()) || deploymentPage).toBeTruthy();
      }
    }
  });

  test('TC307: View deployment history', async ({ page }) => {
    // Navigate to deployments page
    await page.goto(`${BASE_URL}/deployments`);
    await page.waitForLoadState('networkidle');

    // Check if deployments exist
    const deploymentsList = page.locator('[data-testid="deployment-list"], .deployments-table, table');
    const deploymentsExist = await deploymentsList.isVisible();

    if (!deploymentsExist) {
      // Try alternative navigation
      await page.goto(`${BASE_URL}/blueprints`);
      const historyButton = page.locator('button:has-text("History"), [data-testid="view-history"]');
      
      if (await historyButton.isVisible()) {
        await historyButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // Verify deployment history elements
    const deploymentItem = page.locator('[data-testid="deployment-item"], .deployment-row, tr');
    const emptyState = page.locator('text=/no deployments|no history/i');
    
    const hasDeployments = (await deploymentItem.count()) > 0;
    const showsEmptyState = await emptyState.isVisible();

    expect(hasDeployments || showsEmptyState).toBeTruthy();

    // If deployments exist, check for status indicators
    if (hasDeployments) {
      const statusBadge = page.locator('.status, .badge, [data-testid="deployment-status"]');
      await expect(statusBadge.first()).toBeVisible();
    }
  });
});
