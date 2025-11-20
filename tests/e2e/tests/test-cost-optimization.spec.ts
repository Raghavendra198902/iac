import { test, expect, Page } from '@playwright/test';

/**
 * TC501-TC503: Cost Optimization E2E Tests
 * Validates cost analysis and optimization features
 */

test.describe('Cost Optimization E2E Tests', () => {
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

  test('TC501: View cost optimization recommendations', async ({ page }) => {
    // Navigate to cost optimization page
    await page.goto(`${BASE_URL}/cost`);
    await page.waitForLoadState('networkidle');

    // Alternative: cost tab in blueprint
    if (!(await page.locator('h1:has-text("Cost"), h2:has-text("Cost")').isVisible())) {
      await page.goto(`${BASE_URL}/blueprints`);
      await page.waitForLoadState('networkidle');

      const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
      if ((await firstBlueprint.count()) === 0) {
        test.skip();
      }

      await firstBlueprint.click();
      await page.waitForTimeout(1000);

      // Click cost tab
      const costTab = page.locator('button:has-text("Cost"), button:has-text("Pricing"), [data-testid="cost-tab"]');
      if (await costTab.isVisible()) {
        await costTab.click();
        await page.waitForTimeout(1000);
      }
    }

    // Trigger cost analysis if needed
    const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Calculate Cost")');
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForTimeout(3000);
    }

    // Verify recommendations displayed
    const recommendationsList = page.locator(
      '[data-testid="cost-recommendations"], .recommendations-list, .optimization-suggestions'
    );
    const recommendationItem = page.locator(
      '[data-testid="recommendation-item"], .recommendation-card, .cost-saving'
    );

    const listVisible = await recommendationsList.isVisible();
    const itemsExist = (await recommendationItem.count()) > 0;

    if (!listVisible && !itemsExist) {
      // Check for "optimized" or "no recommendations" message
      const noRecommendations = page.locator('text=/already optimized|no recommendations|minimal cost/i');
      if (await noRecommendations.isVisible()) {
        expect(true).toBeTruthy(); // System is already optimized
        return;
      }
    }

    expect(listVisible || itemsExist).toBeTruthy();

    // Verify cost savings shown
    if (itemsExist) {
      const savingsAmount = page.locator('text=/save|\\$\\d+|\\d+%/i');
      await expect(savingsAmount.first()).toBeVisible();
    }
  });

  test('TC502: Apply cost optimization', async ({ page }) => {
    // Navigate to cost page
    await page.goto(`${BASE_URL}/cost`);
    await page.waitForLoadState('networkidle');

    // Via blueprint if direct navigation doesn't work
    if (!(await page.locator('h1:has-text("Cost"), h2:has-text("Cost")').isVisible())) {
      await page.goto(`${BASE_URL}/blueprints`);
      const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
      
      if ((await firstBlueprint.count()) === 0) {
        test.skip();
      }

      await firstBlueprint.click();
      await page.waitForTimeout(1000);

      const costTab = page.locator('button:has-text("Cost"), [data-testid="cost-tab"]');
      if (await costTab.isVisible()) {
        await costTab.click();
        await page.waitForTimeout(1000);
      }
    }

    // Trigger analysis
    const analyzeButton = page.locator('button:has-text("Analyze")');
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForTimeout(3000);
    }

    // Find first recommendation
    const firstRecommendation = page.locator(
      '[data-testid="recommendation-item"], .recommendation-card'
    ).first();

    if ((await firstRecommendation.count()) === 0) {
      test.skip(); // No recommendations available
    }

    // Apply the recommendation
    const applyButton = page.locator('button:has-text("Apply"), button:has-text("Optimize")').first();
    
    if (await applyButton.isVisible()) {
      // Record original cost if shown
      const originalCostText = await page.locator('.current-cost, .original-cost').textContent();
      
      await applyButton.click();
      await page.waitForTimeout(1000);

      // Confirm if dialog appears
      const confirmDialog = page.locator('[role="dialog"], .modal');
      if (await confirmDialog.isVisible()) {
        const confirmButton = page.locator('button:has-text("Confirm"), button.btn-primary');
        await confirmButton.click();
        await page.waitForTimeout(2000);
      }

      // Verify optimization applied
      const successMessage = page.locator('text=/applied|optimized|updated/i, .toast-success');
      const updatedMessage = page.locator('text=/cost reduced|savings applied/i');
      
      const applied = (await successMessage.isVisible()) || (await updatedMessage.isVisible());
      expect(applied).toBeTruthy();
    }
  });

  test('TC503: Compare cost scenarios', async ({ page }) => {
    // Navigate to cost comparison page
    await page.goto(`${BASE_URL}/cost/compare`);
    await page.waitForLoadState('networkidle');

    // Alternative: via blueprints
    if (page.url().includes('404') || !(await page.locator('h1, h2').isVisible())) {
      await page.goto(`${BASE_URL}/blueprints`);
      await page.waitForLoadState('networkidle');

      const firstBlueprint = page.locator('[data-testid="blueprint-item"], .blueprint-card, tr').first();
      if ((await firstBlueprint.count()) === 0) {
        test.skip();
      }

      await firstBlueprint.click();
      await page.waitForTimeout(1000);

      // Look for compare button
      const compareButton = page.locator('button:has-text("Compare"), [data-testid="compare-costs"]');
      if (await compareButton.isVisible()) {
        await compareButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // Select scenarios to compare
    const scenario1Select = page.locator('select[name="scenario1"], [data-testid="scenario-1"]');
    const scenario2Select = page.locator('select[name="scenario2"], [data-testid="scenario-2"]');

    if ((await scenario1Select.isVisible()) && (await scenario2Select.isVisible())) {
      await scenario1Select.selectOption({ index: 0 });
      await scenario2Select.selectOption({ index: 1 });

      const compareButton = page.locator('button:has-text("Compare")');
      await compareButton.click();
      await page.waitForTimeout(2000);
    }

    // Verify comparison results displayed
    const comparisonTable = page.locator('[data-testid="cost-comparison"], .comparison-table, table');
    const costChart = page.locator('canvas, svg, .chart, [data-testid="cost-chart"]');
    const pricingData = page.locator('text=/\\$\\d+|monthly|annually/i');

    const tableVisible = await comparisonTable.isVisible();
    const chartVisible = await costChart.isVisible();
    const dataVisible = await pricingData.isVisible();

    expect(tableVisible || chartVisible || dataVisible).toBeTruthy();

    // Verify both scenarios shown
    const scenario1Label = page.locator('text=/scenario 1|current|baseline/i');
    const scenario2Label = page.locator('text=/scenario 2|optimized|alternative/i');

    const bothScenariosShown = (await scenario1Label.isVisible()) && (await scenario2Label.isVisible());
    
    if (tableVisible || chartVisible) {
      expect(bothScenariosShown).toBeTruthy();
    }
  });
});
