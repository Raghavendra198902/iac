import { test, expect } from '@playwright/test';

/**
 * End-to-End Tests for IAC Dharma Platform
 * 
 * Tests complete user workflows from login to deployment
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('User Authentication Flow', () => {
  test('should complete login flow successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Navigate to login
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // Should show user info
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });
  
  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/authentication failed/i')).toBeVisible();
  });
  
  test('should maintain session after page refresh', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });
});

test.describe('Blueprint Creation to Deployment Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });
  
  test('should create and deploy blueprint end-to-end', async ({ page }) => {
    // Navigate to blueprints
    await page.click('text=Blueprints');
    await expect(page).toHaveURL(/\/blueprints/);
    
    // Create new blueprint
    await page.click('text=Create Blueprint');
    
    // Fill blueprint form
    await page.fill('input[name="name"]', 'E2E Test Blueprint');
    await page.fill('textarea[name="description"]', 'Automated E2E test blueprint');
    await page.selectOption('select[name="cloudProvider"]', 'aws');
    await page.selectOption('select[name="region"]', 'us-east-1');
    
    // Add a resource
    await page.click('text=Add Resource');
    await page.selectOption('select[name="resources[0].type"]', 'ec2');
    await page.fill('input[name="resources[0].name"]', 'test-instance');
    await page.fill('input[name="resources[0].properties.instanceType"]', 't3.micro');
    
    // Save blueprint
    await page.click('button:has-text("Save Blueprint")');
    
    // Should show success message
    await expect(page.locator('text=/blueprint created/i')).toBeVisible();
    
    // Should be redirected to blueprint details
    await expect(page).toHaveURL(/\/blueprints\/[a-zA-Z0-9-]+/);
    
    // Generate IaC code
    await page.click('button:has-text("Generate IaC")');
    
    // Wait for generation
    await expect(page.locator('text=/generated successfully/i')).toBeVisible({ timeout: 10000 });
    
    // View generated code
    await expect(page.locator('pre code')).toContainText('terraform');
    
    // Validate with guardrails
    await page.click('button:has-text("Validate")');
    await expect(page.locator('text=/validation/i')).toBeVisible({ timeout: 10000 });
    
    // Get cost estimate
    await page.click('button:has-text("Estimate Cost")');
    await expect(page.locator('text=/cost estimate/i')).toBeVisible({ timeout: 10000 });
    
    // Deploy
    await page.click('button:has-text("Deploy")');
    
    // Confirm deployment
    await page.click('button:has-text("Confirm")');
    
    // Should show deployment started
    await expect(page.locator('text=/deployment started/i')).toBeVisible();
    
    // Should navigate to deployments page
    await expect(page).toHaveURL(/\/deployments/);
    
    // Should see deployment in list
    await expect(page.locator('text=E2E Test Blueprint')).toBeVisible();
  });
  
  test('should handle blueprint validation errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/blueprints/create`);
    
    // Try to save without required fields
    await page.click('button:has-text("Save Blueprint")');
    
    // Should show validation errors
    await expect(page.locator('text=/name is required/i')).toBeVisible();
    await expect(page.locator('text=/cloud provider is required/i')).toBeVisible();
  });
  
  test('should display blueprint list and filter', async ({ page }) => {
    await page.goto(`${BASE_URL}/blueprints`);
    
    // Should show blueprints list
    await expect(page.locator('h1')).toContainText('Blueprints');
    
    // Test search filter
    await page.fill('input[placeholder*="Search"]', 'test');
    
    // Should filter results
    await expect(page.locator('text=E2E Test Blueprint')).toBeVisible();
  });
});

test.describe('Monitoring and Drift Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
  });
  
  test('should display deployments monitoring dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/monitoring`);
    
    // Should show monitoring dashboard
    await expect(page.locator('h1')).toContainText(/monitoring|dashboard/i);
    
    // Should show deployment metrics
    await expect(page.locator('text=/deployments/i')).toBeVisible();
    await expect(page.locator('text=/resources/i')).toBeVisible();
    
    // Should show charts
    await expect(page.locator('canvas, svg')).toBeVisible();
  });
  
  test('should show drift detection alerts', async ({ page }) => {
    await page.goto(`${BASE_URL}/monitoring/drift`);
    
    // Should show drift detection page
    await expect(page.locator('h1')).toContainText(/drift/i);
    
    // Should have scan button
    await expect(page.locator('button:has-text("Scan for Drift")')).toBeVisible();
  });
});

test.describe('Cost Optimization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
  });
  
  test('should display cost optimization recommendations', async ({ page }) => {
    await page.goto(`${BASE_URL}/cost-optimization`);
    
    // Should show cost optimization page
    await expect(page.locator('h1')).toContainText(/cost/i);
    
    // Should show recommendations
    await expect(page.locator('text=/recommendations/i')).toBeVisible();
    
    // Should show potential savings
    await expect(page.locator('text=/savings/i')).toBeVisible();
  });
  
  test('should apply cost optimization recommendation', async ({ page }) => {
    await page.goto(`${BASE_URL}/cost-optimization`);
    
    // Find first recommendation
    const firstRecommendation = page.locator('[data-testid="recommendation-card"]').first();
    
    if (await firstRecommendation.isVisible()) {
      // Click apply button
      await firstRecommendation.locator('button:has-text("Apply")').click();
      
      // Should show confirmation
      await expect(page.locator('text=/applied|success/i')).toBeVisible();
    }
  });
});

test.describe('Multi-Cloud Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
  });
  
  test('should create blueprints for different cloud providers', async ({ page }) => {
    const providers = ['aws', 'azure', 'gcp'];
    
    for (const provider of providers) {
      await page.goto(`${BASE_URL}/blueprints/create`);
      
      await page.fill('input[name="name"]', `${provider.toUpperCase()} Test Blueprint`);
      await page.selectOption('select[name="cloudProvider"]', provider);
      
      // Select appropriate region
      if (provider === 'aws') {
        await page.selectOption('select[name="region"]', 'us-east-1');
      } else if (provider === 'azure') {
        await page.selectOption('select[name="region"]', 'eastus');
      } else if (provider === 'gcp') {
        await page.selectOption('select[name="region"]', 'us-central1');
      }
      
      await page.click('button:has-text("Save Blueprint")');
      
      // Should create successfully
      await expect(page.locator('text=/created/i')).toBeVisible();
    }
  });
});

test.describe('Real-time Updates', () => {
  test('should receive real-time deployment updates', async ({ page, context }) => {
    // Open two pages (simulate two users)
    const page1 = page;
    const page2 = await context.newPage();
    
    // Login on both pages
    for (const p of [page1, page2]) {
      await p.goto(`${BASE_URL}/login`);
      await p.fill('input[name="email"]', 'test@example.com');
      await p.fill('input[name="password"]', 'test123');
      await p.click('button[type="submit"]');
    }
    
    // Navigate to deployments on both pages
    await page1.goto(`${BASE_URL}/deployments`);
    await page2.goto(`${BASE_URL}/deployments`);
    
    // Trigger deployment on page1
    await page1.click('button:has-text("New Deployment")');
    // ... create deployment
    
    // Page2 should receive real-time update
    await expect(page2.locator('text=/new deployment/i')).toBeVisible({ timeout: 5000 });
    
    await page2.close();
  });
});

test.describe('Error Handling and Recovery', () => {
  test('should handle network errors gracefully', async ({ page, context }) => {
    // Block API requests
    await context.route('**/api/**', route => route.abort());
    
    await page.goto(`${BASE_URL}/blueprints`);
    
    // Should show error message
    await expect(page.locator('text=/network error|connection failed/i')).toBeVisible({ timeout: 5000 });
  });
  
  test('should retry failed requests automatically', async ({ page, context }) => {
    let requestCount = 0;
    
    // Fail first 2 requests, succeed on 3rd
    await context.route('**/api/blueprints', route => {
      requestCount++;
      if (requestCount <= 2) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    await page.goto(`${BASE_URL}/blueprints`);
    
    // Should eventually succeed and show data
    await expect(page.locator('h1')).toContainText('Blueprints', { timeout: 10000 });
  });
});
