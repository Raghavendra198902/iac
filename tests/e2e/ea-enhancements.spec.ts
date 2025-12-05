import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('EA Responsibilities Pages', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${BASE_URL}/login`);
    
    // Quick login
    await page.click('button:has-text("Admin")');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should navigate to EA Responsibilities index', async () => {
    // Navigate to EA section
    await page.click('text=Enterprise Architecture');
    await page.click('text=EA Responsibilities');
    
    // Wait for page load
    await page.waitForURL(`${BASE_URL}/ea/responsibilities`);
    
    // Check page title
    await expect(page.locator('h1')).toContainText('EA Responsibilities');
    
    // Check that all 15 areas are displayed
    const responsibilityCards = page.locator('[class*="grid"] > div');
    await expect(responsibilityCards).toHaveCount(15);
  });

  test('should navigate through responsibility pages', async () => {
    await page.goto(`${BASE_URL}/ea/responsibilities`);
    
    // Click on first responsibility area
    await page.click('text=Architecture Strategy & Governance');
    await page.waitForURL(`${BASE_URL}/ea/responsibilities/architecture-strategy-governance`);
    
    // Check page content
    await expect(page.locator('h1')).toContainText('Architecture Strategy');
    
    // Check metrics are displayed
    const metrics = page.locator('[class*="grid"] > div').first();
    await expect(metrics).toBeVisible();
    
    // Navigate to next page
    await page.click('button:has-text("Next:")');
    await page.waitForURL(`${BASE_URL}/ea/responsibilities/business-it-alignment`);
    
    // Verify navigation worked
    await expect(page.locator('h1')).toContainText('Business-IT Alignment');
  });

  test('should display metrics on responsibility pages', async () => {
    await page.goto(`${BASE_URL}/ea/responsibilities/architecture-strategy-governance`);
    
    // Check that 4 metric cards are displayed
    const metricCards = page.locator('[class*="grid grid-cols-1 md:grid-cols-4"] > div');
    await expect(metricCards).toHaveCount(4);
    
    // Verify metric cards have values
    const firstMetric = metricCards.first();
    await expect(firstMetric).toBeVisible();
    await expect(firstMetric.locator('text=/\\d+/')).toBeVisible();
  });

  test('should navigate back to index from detail page', async () => {
    await page.goto(`${BASE_URL}/ea/responsibilities/architecture-strategy-governance`);
    
    // Click back to EA Responsibilities link
    await page.click('text=Back to EA Responsibilities');
    await page.waitForURL(`${BASE_URL}/ea/responsibilities`);
    
    // Verify we're back at index
    await expect(page.locator('h1')).toContainText('EA Responsibilities');
  });

  test('should have proper sequential navigation', async () => {
    const pages = [
      'architecture-strategy-governance',
      'business-it-alignment',
      'solution-oversight',
      'portfolio-rationalization',
      'innovation-emerging-tech'
    ];
    
    let currentPageIndex = 0;
    await page.goto(`${BASE_URL}/ea/responsibilities/${pages[currentPageIndex]}`);
    
    // Test clicking "Next" 4 times
    for (let i = 0; i < 4; i++) {
      await page.click('text=/Next:/');
      currentPageIndex++;
      await page.waitForURL(`${BASE_URL}/ea/responsibilities/${pages[currentPageIndex]}`);
    }
    
    // Verify we're on the 5th page
    await expect(page).toHaveURL(`${BASE_URL}/ea/responsibilities/${pages[4]}`);
    
    // Test clicking "Prev" back
    await page.click('text=/Prev:/');
    currentPageIndex--;
    await page.waitForURL(`${BASE_URL}/ea/responsibilities/${pages[currentPageIndex]}`);
  });
});

test.describe('Analytics Dashboard', () => {
  test('should load analytics dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin")');
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    // Navigate to analytics dashboard
    await page.goto(`${BASE_URL}/ea/analytics-dashboard`);
    
    // Check title
    await expect(page.locator('h1')).toContainText('EA Analytics Dashboard');
    
    // Check time range buttons
    await expect(page.locator('button:has-text("7d")')).toBeVisible();
    await expect(page.locator('button:has-text("30d")')).toBeVisible();
    await expect(page.locator('button:has-text("90d")')).toBeVisible();
    
    // Check key metrics are displayed (should be 6)
    const metricCards = page.locator('[class*="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"] > div');
    await expect(metricCards).toHaveCount(6);
  });

  test('should change time range on analytics dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin")');
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    await page.goto(`${BASE_URL}/ea/analytics-dashboard`);
    
    // Default should be 30d
    await expect(page.locator('button:has-text("30d")')).toHaveClass(/bg-gradient/);
    
    // Click 7d button
    await page.click('button:has-text("7d")');
    await expect(page.locator('button:has-text("7d")')).toHaveClass(/bg-gradient/);
    
    // Click 90d button
    await page.click('button:has-text("90d")');
    await expect(page.locator('button:has-text("90d")')).toHaveClass(/bg-gradient/);
  });
});

test.describe('Collaboration Real-time Features', () => {
  test('should load collaboration page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin")');
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    // Navigate to collaboration
    await page.click('text=Collaboration');
    await page.waitForURL(`${BASE_URL}/collaboration`);
    
    // Check channels are loaded
    const channels = page.locator('[class*="channel"]').or(page.locator('text=/general|infrastructure|deployments/'));
    await expect(channels.first()).toBeVisible();
  });

  test('should display online users', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin")');
    await page.goto(`${BASE_URL}/collaboration`);
    
    // Check that user panel shows online users
    const onlineUsers = page.locator('text=/online|Online/');
    await expect(onlineUsers.first()).toBeVisible();
  });

  test('should send a message', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin")');
    await page.goto(`${BASE_URL}/collaboration`);
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Type a message
    const messageInput = page.locator('textarea[placeholder*="Message"]');
    await messageInput.fill('Test message from E2E test');
    
    // Send message
    await page.click('button[title*="Send"]');
    
    // Verify message appears (with some tolerance for load time)
    await expect(page.locator('text=Test message from E2E test')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('API Integration Tests', () => {
  test('should fetch EA responsibilities metrics', async ({ request }) => {
    const response = await request.get(`http://localhost:3000/api/ea/responsibilities/metrics`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('architectureStrategy');
    expect(data).toHaveProperty('businessAlignment');
    expect(data.architectureStrategy).toHaveProperty('strategies');
  });

  test('should fetch EA responsibilities overview', async ({ request }) => {
    const response = await request.get(`http://localhost:3000/api/ea/responsibilities/overview`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.totalAreas).toBe(15);
    expect(data.areas).toHaveLength(15);
  });

  test('should fetch EA responsibilities statistics', async ({ request }) => {
    const response = await request.get(`http://localhost:3000/api/ea/responsibilities/statistics`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.totalResponsibilityAreas).toBe(15);
    expect(data.totalMetricsTracked).toBeGreaterThan(0);
  });
});

test.describe('Performance Tests', () => {
  test('should load EA pages within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin")');
    await page.goto(`${BASE_URL}/ea/responsibilities`);
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle rapid navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin")');
    await page.goto(`${BASE_URL}/ea/responsibilities`);
    
    // Rapidly click through pages
    for (let i = 0; i < 5; i++) {
      await page.click('a[href*="/ea/responsibilities/"]').catch(() => {});
      await page.waitForTimeout(200);
    }
    
    // Should still be functional
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should display properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin")');
    await page.goto(`${BASE_URL}/ea/responsibilities`);
    
    // Check that content is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that cards stack vertically
    const firstCard = page.locator('[class*="grid"] > div').first();
    await expect(firstCard).toBeVisible();
  });

  test('should display analytics charts on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin")');
    await page.goto(`${BASE_URL}/ea/analytics-dashboard`);
    
    // Charts should be responsive
    await expect(page.locator('h1')).toBeVisible();
    const charts = page.locator('[class*="ResponsiveContainer"]');
    await expect(charts.first()).toBeVisible();
  });
});
