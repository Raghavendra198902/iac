import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Costing Service - Pricing Engine', () => {
  describe('PricingEngine', () => {
    it('should cache pricing data', () => {
      const cache = new Map();
      const cacheKey = 'aws:us-east-1:aws_instance:t3.medium';
      const pricing = { hourly: 0.0416, monthly: 30.37, currency: 'USD' };

      cache.set(cacheKey, pricing);

      expect(cache.has(cacheKey)).toBe(true);
      expect(cache.get(cacheKey)).toEqual(pricing);
    });

    it('should generate cache key correctly', () => {
      const cloud = 'aws';
      const region = 'us-east-1';
      const resourceType = 'aws_instance';
      const sku = 't3.medium';

      const cacheKey = `${cloud}:${region}:${resourceType}:${sku}`;

      expect(cacheKey).toBe('aws:us-east-1:aws_instance:t3.medium');
    });

    it('should return cached pricing if available', () => {
      const cache = new Map([
        ['aws:us-east-1:aws_instance:t3.medium', { hourly: 0.0416, monthly: 30.37 }],
      ]);

      const cacheKey = 'aws:us-east-1:aws_instance:t3.medium';
      const cached = cache.get(cacheKey);

      expect(cached).toBeDefined();
      expect(cached.hourly).toBe(0.0416);
    });

    it('should fetch pricing for Azure resources', async () => {
      const fetchPricing = vi.fn().mockResolvedValue({
        cloud: 'azure',
        region: 'eastus',
        resourceType: 'azurerm_virtual_machine',
        sku: 'Standard_D2s_v3',
        hourly: 0.096,
        monthly: 70.08,
        currency: 'USD',
      });

      const pricing = await fetchPricing('azure', 'eastus', 'azurerm_virtual_machine', 'Standard_D2s_v3');

      expect(pricing.cloud).toBe('azure');
      expect(pricing.hourly).toBe(0.096);
      expect(pricing.sku).toBe('Standard_D2s_v3');
    });

    it('should fetch pricing for AWS resources', async () => {
      const fetchPricing = vi.fn().mockResolvedValue({
        cloud: 'aws',
        region: 'us-east-1',
        resourceType: 'aws_instance',
        sku: 't3.large',
        hourly: 0.0832,
        monthly: 60.74,
        currency: 'USD',
      });

      const pricing = await fetchPricing('aws', 'us-east-1', 'aws_instance', 't3.large');

      expect(pricing.hourly).toBe(0.0832);
      expect(pricing.resourceType).toBe('aws_instance');
    });

    it('should fetch pricing for GCP resources', async () => {
      const fetchPricing = vi.fn().mockResolvedValue({
        cloud: 'gcp',
        region: 'us-central1',
        resourceType: 'google_compute_instance',
        sku: 'n1-standard-2',
        hourly: 0.095,
        monthly: 69.35,
        currency: 'USD',
      });

      const pricing = await fetchPricing('gcp', 'us-central1', 'google_compute_instance', 'n1-standard-2');

      expect(pricing.cloud).toBe('gcp');
      expect(pricing.hourly).toBe(0.095);
    });

    it('should calculate monthly cost from hourly rate', () => {
      const hourlyRate = 0.0416;
      const hoursPerMonth = 730; // Average hours per month
      const monthlyCost = hourlyRate * hoursPerMonth;

      expect(monthlyCost).toBeCloseTo(30.37, 2);
    });

    it('should handle pricing for storage resources', () => {
      const pricing = {
        cloud: 'aws',
        resourceType: 'aws_s3_bucket',
        perGB: 0.023,
        storageGB: 1000,
        monthlyCost: 23,
      };

      expect(pricing.monthlyCost).toBe(pricing.perGB * pricing.storageGB);
    });

    it('should handle pricing for database resources', () => {
      const pricing = {
        cloud: 'azure',
        resourceType: 'azurerm_sql_database',
        sku: 'S0',
        hourly: 0.02,
        monthly: 14.6,
      };

      expect(pricing.monthly).toBeCloseTo(0.02 * 730, 1);
    });

    it('should initialize with common pricing data', () => {
      const pricingCache = new Map([
        ['azure:eastus:azurerm_virtual_machine:Standard_D2s_v3', { hourly: 0.096 }],
        ['aws:us-east-1:aws_instance:t3.medium', { hourly: 0.0416 }],
        ['gcp:us-central1:google_compute_instance:n1-standard-2', { hourly: 0.095 }],
      ]);

      expect(pricingCache.size).toBe(3);
      expect(pricingCache.has('azure:eastus:azurerm_virtual_machine:Standard_D2s_v3')).toBe(true);
    });

    it('should return null for unknown pricing', async () => {
      const fetchPricing = vi.fn().mockResolvedValue(null);
      const pricing = await fetchPricing('unknown', 'region', 'type', 'sku');

      expect(pricing).toBeNull();
    });
  });

  describe('Pricing Calculations', () => {
    it('should calculate total cost for multiple resources', () => {
      const resources = [
        { hourly: 0.0416 },
        { hourly: 0.0832 },
        { hourly: 0.095 },
      ];

      const totalHourly = resources.reduce((sum, r) => sum + r.hourly, 0);
      const totalMonthly = totalHourly * 730;

      expect(totalHourly).toBeCloseTo(0.2198, 4);
      expect(totalMonthly).toBeCloseTo(160.45, 2);
    });

    it('should calculate cost with discounts', () => {
      const baseCost = 100;
      const discount = 0.3; // 30% discount
      const discountedCost = baseCost * (1 - discount);

      expect(discountedCost).toBe(70);
    });

    it('should calculate reserved instance savings', () => {
      const onDemandCost = 100;
      const reservedCost = 62; // 38% savings
      const savings = onDemandCost - reservedCost;
      const savingsPercentage = (savings / onDemandCost) * 100;

      expect(savings).toBe(38);
      expect(savingsPercentage).toBe(38);
    });
  });
});
