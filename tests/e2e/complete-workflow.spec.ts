import { test, expect } from '@playwright/test';

/**
 * End-to-End Test: Complete Blueprint to Deployment Workflow
 * 
 * This test covers the entire user journey from login to deployment:
 * 1. User authentication
 * 2. Blueprint creation
 * 3. IaC code generation
 * 4. Guardrails validation
 * 5. Cost estimation
 * 6. Deployment initiation
 * 7. Status monitoring
 */

test.describe('Complete Blueprint Workflow', () => {
  let authToken: string;
  let blueprintId: string;

  test.beforeAll(async ({ request }) => {
    // Login and get auth token
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'test123'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.token;
    expect(authToken).toBeTruthy();
  });

  test('should complete full workflow: login → blueprint → generate → validate → estimate → deploy', async ({ page, request }) => {
    // Step 1: Navigate to dashboard
    await page.goto('http://localhost:5173');
    
    // Login via UI
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Step 2: Navigate to blueprints
    await page.click('text=Blueprints');
    await page.waitForURL('**/blueprints');
    
    // Create new blueprint
    await page.click('button:has-text("New Blueprint")');
    
    // Fill blueprint form
    await page.fill('input[name="name"]', 'E2E Test Blueprint');
    await page.fill('textarea[name="description"]', 'Created by E2E test');
    await page.selectOption('select[name="cloudProvider"]', 'aws');
    await page.selectOption('select[name="region"]', 'us-east-1');
    
    // Add a compute resource
    await page.click('button:has-text("Add Resource")');
    await page.selectOption('select[name="resourceType"]', 'compute');
    await page.fill('input[name="resourceName"]', 'web-server');
    await page.fill('input[name="instanceType"]', 't2.micro');
    await page.click('button:has-text("Save Resource")');
    
    // Save blueprint
    await page.click('button:has-text("Create Blueprint")');
    
    // Wait for success message
    await expect(page.locator('.toast-success')).toContainText('Blueprint created');
    
    // Capture blueprint ID from URL
    await page.waitForURL(/.*\/blueprints\/(.+)/);
    const url = page.url();
    blueprintId = url.split('/').pop() || '';
    expect(blueprintId).toBeTruthy();

    // Step 3: Generate IaC code
    await page.click('button:has-text("Generate Code")');
    
    // Wait for generation to complete
    await expect(page.locator('.code-viewer')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.code-viewer')).toContainText('resource');
    
    // Verify Terraform code is displayed
    const codeContent = await page.locator('.code-viewer').textContent();
    expect(codeContent).toContain('provider "aws"');
    expect(codeContent).toContain('resource "aws_instance"');

    // Step 4: Validate with guardrails
    await page.click('button:has-text("Validate")');
    
    // Wait for validation results
    await expect(page.locator('.validation-results')).toBeVisible({ timeout: 15000 });
    
    // Check validation status
    const validationStatus = await page.locator('.validation-status').textContent();
    expect(['Passed', 'Passed with warnings']).toContain(validationStatus);

    // Step 5: Get cost estimate
    await page.click('button:has-text("Estimate Cost")');
    
    // Wait for cost estimation
    await expect(page.locator('.cost-estimate')).toBeVisible({ timeout: 15000 });
    
    // Verify cost is displayed
    const costText = await page.locator('.cost-estimate').textContent();
    expect(costText).toMatch(/\$\d+/);

    // Step 6: Deploy
    await page.click('button:has-text("Deploy")');
    
    // Confirm deployment
    await page.click('button:has-text("Confirm")');
    
    // Wait for deployment to start
    await expect(page.locator('.deployment-status')).toContainText('In Progress', { timeout: 10000 });
    
    // Wait for deployment to complete (with timeout)
    await expect(page.locator('.deployment-status')).toContainText('Completed', { timeout: 120000 });

    // Step 7: Verify deployment details
    await page.click('text=View Details');
    await expect(page.locator('.deployment-details')).toBeVisible();
    
    // Check deployed resources are listed
    await expect(page.locator('.resource-list')).toContainText('web-server');
  });

  test('should show deployment in monitoring dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/monitoring');
    
    // Should see the deployed blueprint
    await expect(page.locator(`.deployment-card:has-text("E2E Test Blueprint")`)).toBeVisible();
    
    // Check deployment status
    const statusBadge = page.locator(`.deployment-card:has-text("E2E Test Blueprint") .status-badge`);
    await expect(statusBadge).toContainText('Active');
  });
});

test.describe('Cost Estimation Flow', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { email: 'test@example.com', password: 'test123' }
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test('should estimate costs for different cloud providers', async ({ page, request }) => {
    // Create blueprint via API
    const blueprintResponse = await request.post('http://localhost:3000/api/blueprints', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        name: 'Multi-Cloud Cost Test',
        description: 'Testing cost estimation',
        cloudProvider: 'aws',
        region: 'us-east-1',
        resources: [
          { type: 'compute', name: 'app-server', properties: { instanceType: 't2.medium' } },
          { type: 'storage', name: 'data-bucket', properties: { size: 100 } }
        ]
      }
    });
    const blueprint = await blueprintResponse.json();

    // Navigate to blueprint
    await page.goto(`http://localhost:5173/blueprints/${blueprint.id}`);
    
    // Get AWS cost estimate
    await page.click('button:has-text("Estimate Cost")');
    await expect(page.locator('.cost-estimate')).toBeVisible();
    const awsCost = await page.locator('.monthly-cost').textContent();
    
    // Compare with Azure
    await page.click('button:has-text("Compare Providers")');
    await expect(page.locator('.provider-comparison')).toBeVisible();
    
    // Verify cost comparison table shows multiple providers
    await expect(page.locator('.comparison-table')).toContainText('AWS');
    await expect(page.locator('.comparison-table')).toContainText('Azure');
    await expect(page.locator('.comparison-table')).toContainText('GCP');
  });
});

test.describe('Drift Detection Workflow', () => {
  test('should detect and report infrastructure drift', async ({ page, request }) => {
    // Login
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { email: 'test@example.com', password: 'test123' }
    });
    const { token } = await loginResponse.json();

    await page.goto('http://localhost:5173/monitoring');
    
    // Wait for drift detection to run
    await page.click('button:has-text("Run Drift Detection")');
    
    // Wait for results
    await expect(page.locator('.drift-results')).toBeVisible({ timeout: 30000 });
    
    // Check if drift is detected
    const driftStatus = await page.locator('.drift-status').textContent();
    expect(['No Drift', 'Drift Detected']).toContain(driftStatus);
    
    // If drift detected, verify details are shown
    if (driftStatus === 'Drift Detected') {
      await expect(page.locator('.drift-details')).toBeVisible();
      await expect(page.locator('.drift-resources')).not.toHaveCount(0);
    }
  });
});

test.describe('Multi-Cloud Deployment', () => {
  test('should deploy same blueprint to multiple cloud providers', async ({ page, request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { email: 'test@example.com', password: 'test123' }
    });
    const { token } = await loginResponse.json();

    // Create cloud-agnostic blueprint
    const blueprintResponse = await request.post('http://localhost:3000/api/blueprints', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Multi-Cloud App',
        description: 'Deploy to multiple clouds',
        cloudProvider: 'aws',
        region: 'us-east-1',
        resources: [
          { type: 'compute', name: 'web-app', properties: { cpu: 2, memory: 4 } }
        ]
      }
    });
    const blueprint = await blueprintResponse.json();

    await page.goto(`http://localhost:5173/blueprints/${blueprint.id}`);
    
    // Deploy to AWS
    await page.selectOption('select[name="cloudProvider"]', 'aws');
    await page.click('button:has-text("Deploy")');
    await expect(page.locator('.deployment-status')).toContainText('Completed', { timeout: 60000 });
    
    // Deploy to Azure
    await page.click('button:has-text("Deploy to Another Cloud")');
    await page.selectOption('select[name="cloudProvider"]', 'azure');
    await page.selectOption('select[name="region"]', 'eastus');
    await page.click('button:has-text("Deploy")');
    await expect(page.locator('.deployment-status')).toContainText('Completed', { timeout: 60000 });
    
    // Verify both deployments exist
    await page.goto('http://localhost:5173/monitoring');
    await expect(page.locator('.deployment-card:has-text("AWS")')).toBeVisible();
    await expect(page.locator('.deployment-card:has-text("Azure")')).toBeVisible();
  });
});

test.describe('Error Handling and Recovery', () => {
  test('should handle invalid blueprint gracefully', async ({ page }) => {
    await page.goto('http://localhost:5173/blueprints/new');
    
    // Try to create blueprint without required fields
    await page.click('button:has-text("Create Blueprint")');
    
    // Should show validation errors
    await expect(page.locator('.error-message')).toContainText('required');
    
    // Fill valid data
    await page.fill('input[name="name"]', 'Valid Blueprint');
    await page.selectOption('select[name="cloudProvider"]', 'aws');
    await page.selectOption('select[name="region"]', 'us-east-1');
    
    // Should now succeed
    await page.click('button:has-text("Create Blueprint")');
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should handle deployment failure with rollback', async ({ page, request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { email: 'test@example.com', password: 'test123' }
    });
    const { token } = await loginResponse.json();

    // Create blueprint with invalid configuration
    const blueprintResponse = await request.post('http://localhost:3000/api/blueprints', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Failing Blueprint',
        cloudProvider: 'aws',
        region: 'invalid-region',
        resources: [{ type: 'compute', name: 'server', properties: {} }]
      }
    });
    const blueprint = await blueprintResponse.json();

    await page.goto(`http://localhost:5173/blueprints/${blueprint.id}`);
    
    // Attempt deployment
    await page.click('button:has-text("Deploy")');
    
    // Should show failure
    await expect(page.locator('.deployment-status')).toContainText('Failed', { timeout: 30000 });
    
    // Rollback option should be available
    await expect(page.locator('button:has-text("Rollback")')).toBeVisible();
    
    // Execute rollback
    await page.click('button:has-text("Rollback")');
    await expect(page.locator('.toast-success')).toContainText('Rollback completed');
  });
});

test.describe('Performance Tests', () => {
  test('should handle concurrent blueprint creations', async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { email: 'test@example.com', password: 'test123' }
    });
    const { token } = await loginResponse.json();

    // Create 10 blueprints concurrently
    const promises = Array(10).fill(null).map((_, i) =>
      request.post('http://localhost:3000/api/blueprints', {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          name: `Concurrent Blueprint ${i}`,
          cloudProvider: 'aws',
          region: 'us-east-1',
          resources: [{ type: 'compute', name: `server-${i}`, properties: { instanceType: 't2.micro' } }]
        }
      })
    );

    const responses = await Promise.all(promises);
    
    // All should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });
  });

  test('should load dashboard within performance budget', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
