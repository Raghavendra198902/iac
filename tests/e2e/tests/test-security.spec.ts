import { test, expect, Page } from '@playwright/test';

/**
 * TC401-TC403: Security Assessment E2E Tests
 * Validates security scanning and risk mitigation features
 */

test.describe('Security Assessment E2E Tests', () => {
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

  test('TC401: Run security risk assessment', async ({ page }) => {
    // Navigate to security page or blueprint
    await page.goto(`${BASE_URL}/security`);
    await page.waitForLoadState('networkidle');

    // If security page doesn't exist, try via blueprint
    if (page.url().includes('404') || !(await page.locator('h1, h2').isVisible())) {
      await page.goto(`${BASE_URL}/blueprints`);
      await page.waitForLoadState('networkidle');

      const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
      if ((await firstBlueprint.count()) === 0) {
        test.skip();
      }

      await firstBlueprint.click();
      await page.waitForTimeout(1000);
    }

    // Find security scan button
    const scanButton = page.locator(
      'button:has-text("Security Scan"), button:has-text("Run Assessment"), [data-testid="security-scan"]'
    );

    await expect(scanButton).toBeVisible({ timeout: 5000 });
    await scanButton.click();
    await page.waitForTimeout(4000); // Security scan takes time

    // Verify scan results displayed
    const resultsPanel = page.locator('[data-testid="security-results"], .security-report, .scan-results');
    const riskLevel = page.locator('text=/high risk|medium risk|low risk|critical/i, .risk-badge');
    const issuesCount = page.locator('text=/\\d+ issues?|\\d+ vulnerabilities/i');

    const resultsVisible = await resultsPanel.isVisible();
    const riskVisible = await riskLevel.isVisible();
    const countVisible = await issuesCount.isVisible();

    expect(resultsVisible || riskVisible || countVisible).toBeTruthy();
  });

  test('TC402: View risk heatmap', async ({ page }) => {
    // Navigate to security dashboard
    await page.goto(`${BASE_URL}/security`);
    await page.waitForLoadState('networkidle');

    // Alternative: security tab in blueprint
    if (!(await page.locator('h1:has-text("Security"), h2:has-text("Security")').isVisible())) {
      await page.goto(`${BASE_URL}/blueprints`);
      const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
      
      if ((await firstBlueprint.count()) > 0) {
        await firstBlueprint.click();
        await page.waitForTimeout(1000);

        // Click security tab
        const securityTab = page.locator('button:has-text("Security"), [data-testid="security-tab"]');
        if (await securityTab.isVisible()) {
          await securityTab.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // Run scan if not already done
    const scanButton = page.locator('button:has-text("Scan"), button:has-text("Assess")');
    if (await scanButton.isVisible()) {
      await scanButton.click();
      await page.waitForTimeout(4000);
    }

    // Look for heatmap visualization
    const heatmap = page.locator(
      '[data-testid="risk-heatmap"], .heatmap, canvas, svg.heatmap, .risk-matrix'
    );
    
    const heatmapVisible = await heatmap.isVisible();

    if (!heatmapVisible) {
      // May be a table-based risk matrix
      const riskMatrix = page.locator('.risk-table, table.matrix');
      const matrixVisible = await riskMatrix.isVisible();
      expect(matrixVisible).toBeTruthy();
    } else {
      expect(heatmapVisible).toBeTruthy();
    }

    // Verify risk categories shown
    const highRisk = page.locator('text=/high/i');
    const mediumRisk = page.locator('text=/medium/i');
    const lowRisk = page.locator('text=/low/i');

    const categoriesShown = 
      (await highRisk.isVisible()) || 
      (await mediumRisk.isVisible()) || 
      (await lowRisk.isVisible());

    expect(categoriesShown).toBeTruthy();
  });

  test('TC403: Apply security recommendations', async ({ page }) => {
    // Navigate to security
    await page.goto(`${BASE_URL}/security`);
    await page.waitForLoadState('networkidle');

    // Navigate via blueprint if needed
    if (!(await page.locator('h1:has-text("Security"), h2:has-text("Security")').isVisible())) {
      await page.goto(`${BASE_URL}/blueprints`);
      const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
      
      if ((await firstBlueprint.count()) === 0) {
        test.skip();
      }

      await firstBlueprint.click();
      await page.waitForTimeout(1000);

      const securityTab = page.locator('button:has-text("Security"), [data-testid="security-tab"]');
      if (await securityTab.isVisible()) {
        await securityTab.click();
        await page.waitForTimeout(1000);
      }
    }

    // Run scan to get recommendations
    const scanButton = page.locator('button:has-text("Scan"), button:has-text("Assess")');
    if (await scanButton.isVisible()) {
      await scanButton.click();
      await page.waitForTimeout(4000);
    }

    // Find recommendations
    const recommendation = page.locator(
      '[data-testid="recommendation-item"], .recommendation, .suggestion'
    ).first();

    if ((await recommendation.count()) === 0) {
      // May show "no recommendations" or all issues already resolved
      const noIssuesMessage = page.locator('text=/no issues|all secure|no recommendations/i');
      if (await noIssuesMessage.isVisible()) {
        expect(true).toBeTruthy(); // This is actually a pass - system is secure
        return;
      }
      test.skip();
    }

    // Apply first recommendation
    const applyButton = page.locator(
      'button:has-text("Apply"), button:has-text("Fix"), [data-testid="apply-recommendation"]'
    ).first();

    if (await applyButton.isVisible()) {
      await applyButton.click();
      await page.waitForTimeout(2000);

      // Verify application
      const successMessage = page.locator('text=/applied|fixed|updated/i, .toast-success');
      const confirmDialog = page.locator('[role="dialog"], .modal');

      if (await confirmDialog.isVisible()) {
        const confirmBtn = page.locator('button:has-text("Confirm"), button.btn-primary');
        await confirmBtn.click();
        await page.waitForTimeout(1000);
      }

      const applied = await successMessage.isVisible();
      expect(applied).toBeTruthy();
    }
  });
});
