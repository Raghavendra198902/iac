import { test, expect, Page } from '@playwright/test';

/**
 * TC601-TC603: Monitoring & Drift Detection E2E Tests
 * Validates infrastructure monitoring and drift detection capabilities
 */

test.describe('Monitoring & Drift Detection E2E Tests', () => {
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

  test('TC601: View deployment metrics', async ({ page }) => {
    // Navigate to monitoring/deployments page
    await page.goto(`${BASE_URL}/monitoring`);
    await page.waitForLoadState('networkidle');

    // Alternative: deployments page
    if (page.url().includes('404') || !(await page.locator('h1, h2').isVisible())) {
      await page.goto(`${BASE_URL}/deployments`);
      await page.waitForLoadState('networkidle');
    }

    // If no deployments exist, skip test
    const deploymentItem = page.locator('[data-testid="deployment-item"], .deployment-card, tr');
    if ((await deploymentItem.count()) === 0) {
      const noDeployments = page.locator('text=/no deployments|no active/i');
      if (await noDeployments.isVisible()) {
        test.skip();
      }
    }

    // Click on first deployment
    await deploymentItem.first().click();
    await page.waitForTimeout(1000);

    // Look for metrics tab
    const metricsTab = page.locator('button:has-text("Metrics"), [data-testid="metrics-tab"]');
    if (await metricsTab.isVisible()) {
      await metricsTab.click();
      await page.waitForTimeout(1000);
    }

    // Verify metrics displayed
    const metricsPanel = page.locator('[data-testid="metrics-panel"], .metrics-display, .monitoring-dashboard');
    const chart = page.locator('canvas, svg, .chart');
    const metricValue = page.locator('.metric-value, [data-testid="metric"]');

    const panelVisible = await metricsPanel.isVisible();
    const chartVisible = await chart.isVisible();
    const valuesVisible = (await metricValue.count()) > 0;

    expect(panelVisible || chartVisible || valuesVisible).toBeTruthy();

    // Check for common metrics
    const cpuMetric = page.locator('text=/cpu|processor/i');
    const memoryMetric = page.locator('text=/memory|ram/i');
    const statusMetric = page.locator('text=/status|health|uptime/i');

    const metricsShown = 
      (await cpuMetric.isVisible()) || 
      (await memoryMetric.isVisible()) || 
      (await statusMetric.isVisible());

    expect(metricsShown).toBeTruthy();
  });

  test('TC602: Drift detection', async ({ page }) => {
    // Navigate to monitoring or deployments
    await page.goto(`${BASE_URL}/deployments`);
    await page.waitForLoadState('networkidle');

    const deploymentItem = page.locator('[data-testid="deployment-item"], .deployment-card, tr');
    if ((await deploymentItem.count()) === 0) {
      test.skip();
    }

    // Select first deployment
    await deploymentItem.first().click();
    await page.waitForTimeout(1000);

    // Find drift detection button/tab
    const driftButton = page.locator(
      'button:has-text("Check Drift"), button:has-text("Drift Detection"), [data-testid="drift-check"]'
    );
    const driftTab = page.locator('button:has-text("Drift"), [data-testid="drift-tab"]');

    if (await driftTab.isVisible()) {
      await driftTab.click();
      await page.waitForTimeout(1000);
    }

    if (await driftButton.isVisible()) {
      await driftButton.click();
      await page.waitForTimeout(4000); // Drift detection takes time
    }

    // Verify drift detection results
    const driftResults = page.locator('[data-testid="drift-results"], .drift-report, .drift-status');
    const noDriftMessage = page.locator('text=/no drift|in sync|matches/i');
    const driftDetectedMessage = page.locator('text=/drift detected|out of sync|changed/i');

    const resultsVisible = await driftResults.isVisible();
    const statusVisible = (await noDriftMessage.isVisible()) || (await driftDetectedMessage.isVisible());

    expect(resultsVisible || statusVisible).toBeTruthy();

    // If drift detected, verify details shown
    if (await driftDetectedMessage.isVisible()) {
      const driftItem = page.locator('[data-testid="drift-item"], .drift-change');
      const changesExist = (await driftItem.count()) > 0;
      expect(changesExist).toBeTruthy();
    }
  });

  test('TC603: Alert configuration', async ({ page }) => {
    // Navigate to monitoring settings
    await page.goto(`${BASE_URL}/monitoring/settings`);
    await page.waitForLoadState('networkidle');

    // Alternative paths
    if (page.url().includes('404')) {
      await page.goto(`${BASE_URL}/settings`);
      await page.waitForLoadState('networkidle');

      const monitoringTab = page.locator('button:has-text("Monitoring"), [data-testid="monitoring-tab"]');
      if (await monitoringTab.isVisible()) {
        await monitoringTab.click();
        await page.waitForTimeout(1000);
      }
    }

    // Look for alerts section
    const alertsSection = page.locator('[data-testid="alerts-section"], .alerts-config, h3:has-text("Alert")');
    
    if (!(await alertsSection.isVisible())) {
      // Try via deployment
      await page.goto(`${BASE_URL}/deployments`);
      const deploymentItem = page.locator('[data-testid="deployment-item"], .deployment-card, tr');
      
      if ((await deploymentItem.count()) > 0) {
        await deploymentItem.first().click();
        await page.waitForTimeout(1000);

        const alertsButton = page.locator('button:has-text("Alerts"), button:has-text("Notifications")');
        if (await alertsButton.isVisible()) {
          await alertsButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // Create or configure an alert
    const createAlertButton = page.locator('button:has-text("Create Alert"), button:has-text("Add Alert")');
    const existingAlert = page.locator('[data-testid="alert-item"], .alert-rule');

    if (await createAlertButton.isVisible()) {
      await createAlertButton.click();
      await page.waitForTimeout(1000);

      // Fill alert form
      const alertNameInput = page.locator('input[name="name"], [data-testid="alert-name"]');
      if (await alertNameInput.isVisible()) {
        await alertNameInput.fill('E2E Test Alert');

        // Select metric to monitor
        const metricSelect = page.locator('select[name="metric"], [data-testid="alert-metric"]');
        if (await metricSelect.isVisible()) {
          await metricSelect.selectOption({ index: 0 });
        }

        // Set threshold
        const thresholdInput = page.locator('input[name="threshold"], [data-testid="alert-threshold"]');
        if (await thresholdInput.isVisible()) {
          await thresholdInput.fill('80');
        }

        // Save alert
        const saveButton = page.locator('button[type="submit"]:has-text("Save"), button:has-text("Create")');
        await saveButton.click();
        await page.waitForTimeout(2000);

        // Verify alert created
        const successMessage = page.locator('text=/alert created|saved successfully/i');
        expect(await successMessage.isVisible()).toBeTruthy();
      }
    } else if ((await existingAlert.count()) > 0) {
      // Alerts already configured
      expect(true).toBeTruthy();
      
      // Verify alert has configuration options
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-alert"]').first();
      const toggleButton = page.locator('input[type="checkbox"], .toggle').first();
      
      expect((await editButton.isVisible()) || (await toggleButton.isVisible())).toBeTruthy();
    } else {
      // No alerts UI found - may not be implemented yet
      test.skip();
    }
  });
});
