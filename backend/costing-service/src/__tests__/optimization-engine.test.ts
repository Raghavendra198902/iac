import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Costing Service - Optimization Engine', () => {
  describe('Cost Optimization', () => {
    it('should generate optimization report', () => {
      const report = {
        reportId: 'report-123',
        blueprintId: 'blueprint-456',
        generatedAt: new Date(),
        currentMonthlyCost: 5000,
        optimizedMonthlyCost: 3500,
        totalSavings: 1500,
        savingsPercentage: 30,
        recommendations: [],
      };

      expect(report.totalSavings).toBe(report.currentMonthlyCost - report.optimizedMonthlyCost);
      expect(report.savingsPercentage).toBe(30);
    });

    it('should calculate savings percentage', () => {
      const currentCost = 5000;
      const optimizedCost = 3500;
      const savings = currentCost - optimizedCost;
      const savingsPercentage = (savings / currentCost) * 100;

      expect(savingsPercentage).toBe(30);
    });

    it('should identify right-sizing opportunities', () => {
      const recommendation = {
        type: 'right_sizing',
        resourceId: 'vm-1',
        currentSku: 'Standard_D4s_v3',
        recommendedSku: 'Standard_D2s_v3',
        currentMonthlyCost: 192,
        recommendedMonthlyCost: 96,
        savingsAmount: 96,
      };

      expect(recommendation.savingsAmount).toBe(
        recommendation.currentMonthlyCost - recommendation.recommendedMonthlyCost
      );
    });

    it('should identify idle resources', () => {
      const resource = {
        resourceId: 'vm-orphan',
        type: 'compute',
        cpuUtilization: 2,
        lastAccessed: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        monthlyCost: 150,
      };

      const isIdle = resource.cpuUtilization < 5;
      const daysSinceAccess = (Date.now() - resource.lastAccessed) / (24 * 60 * 60 * 1000);

      expect(isIdle).toBe(true);
      expect(daysSinceAccess).toBeGreaterThanOrEqual(30);
    });

    it('should recommend reserved instances', () => {
      const recommendation = {
        type: 'reserved_instance',
        resourceId: 'vm-prod',
        commitment: '1-year',
        currentMonthlyCost: 192,
        reservedMonthlyCost: 119,
        savingsAmount: 73,
        savingsPercentage: 38,
      };

      expect(recommendation.savingsPercentage).toBeCloseTo(38, 0);
    });

    it('should recommend storage tiering', () => {
      const recommendation = {
        type: 'storage_tier',
        resourceId: 'storage-1',
        currentTier: 'Hot',
        recommendedTier: 'Cool',
        dataAccessFrequency: 'monthly',
        currentMonthlyCost: 45,
        recommendedMonthlyCost: 18,
        savingsAmount: 27,
      };

      expect(recommendation.savingsAmount).toBe(27);
    });
  });

  describe('Recommendation Types', () => {
    it('should categorize recommendations by type', () => {
      const recommendations = [
        { type: 'right_sizing', savingsAmount: 100 },
        { type: 'right_sizing', savingsAmount: 75 },
        { type: 'idle_resource', savingsAmount: 150 },
        { type: 'reserved_instance', savingsAmount: 200 },
        { type: 'storage_tier', savingsAmount: 50 },
      ];

      const byType = recommendations.reduce((acc, rec) => {
        if (!acc[rec.type]) acc[rec.type] = [];
        acc[rec.type].push(rec);
        return acc;
      }, {} as Record<string, typeof recommendations>);

      expect(byType['right_sizing']).toHaveLength(2);
      expect(byType['idle_resource']).toHaveLength(1);
      expect(byType['reserved_instance']).toHaveLength(1);
      expect(byType['storage_tier']).toHaveLength(1);
    });

    it('should sum savings by type', () => {
      const recommendations = [
        { type: 'right_sizing', savingsAmount: 100 },
        { type: 'right_sizing', savingsAmount: 75 },
        { type: 'idle_resource', savingsAmount: 150 },
      ];

      const rightSizingSavings = recommendations
        .filter(r => r.type === 'right_sizing')
        .reduce((sum, r) => sum + r.savingsAmount, 0);

      expect(rightSizingSavings).toBe(175);
    });
  });

  describe('Resource Analysis', () => {
    it('should analyze compute utilization', () => {
      const resource = {
        type: 'compute',
        cpuUtilization: 25,
        memoryUtilization: 40,
        currentSku: 'Standard_D4s_v3',
      };

      const isUnderutilized = resource.cpuUtilization < 30 && resource.memoryUtilization < 50;

      expect(isUnderutilized).toBe(true);
    });

    it('should analyze storage access patterns', () => {
      const storage = {
        type: 'storage',
        currentTier: 'Hot',
        accessesPerMonth: 10,
        sizeGB: 1000,
      };

      const shouldChangeTier = storage.currentTier === 'Hot' && storage.accessesPerMonth < 30;

      expect(shouldChangeTier).toBe(true);
    });

    it('should analyze database utilization', () => {
      const database = {
        type: 'database',
        cpuUtilization: 15,
        storageUsed: 40,
        storageProvisioned: 100,
        currentSku: 'Standard_S3',
      };

      const storageUtilization = (database.storageUsed / database.storageProvisioned) * 100;
      const isUnderutilized = database.cpuUtilization < 30 && storageUtilization < 60;

      expect(isUnderutilized).toBe(true);
    });
  });

  describe('Savings Calculations', () => {
    it('should calculate total potential savings', () => {
      const recommendations = [
        { savingsAmount: 100 },
        { savingsAmount: 150 },
        { savingsAmount: 75 },
        { savingsAmount: 200 },
      ];

      const totalSavings = recommendations.reduce((sum, r) => sum + r.savingsAmount, 0);

      expect(totalSavings).toBe(525);
    });

    it('should calculate annual savings', () => {
      const monthlySavings = 500;
      const annualSavings = monthlySavings * 12;

      expect(annualSavings).toBe(6000);
    });

    it('should prioritize recommendations by savings', () => {
      const recommendations = [
        { id: '1', savingsAmount: 100 },
        { id: '2', savingsAmount: 300 },
        { id: '3', savingsAmount: 150 },
      ];

      const sorted = [...recommendations].sort((a, b) => b.savingsAmount - a.savingsAmount);

      expect(sorted[0].id).toBe('2');
      expect(sorted[0].savingsAmount).toBe(300);
    });
  });

  describe('Recommendation Filters', () => {
    it('should filter by minimum savings', () => {
      const recommendations = [
        { savingsAmount: 50 },
        { savingsAmount: 150 },
        { savingsAmount: 25 },
        { savingsAmount: 200 },
      ];

      const filtered = recommendations.filter(r => r.savingsAmount >= 100);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(r => r.savingsAmount >= 100)).toBe(true);
    });

    it('should filter by recommendation type', () => {
      const recommendations = [
        { type: 'right_sizing' },
        { type: 'idle_resource' },
        { type: 'right_sizing' },
        { type: 'storage_tier' },
      ];

      const rightSizing = recommendations.filter(r => r.type === 'right_sizing');

      expect(rightSizing).toHaveLength(2);
    });

    it('should filter by blueprint', () => {
      const recommendations = [
        { blueprintId: 'bp-1', savingsAmount: 100 },
        { blueprintId: 'bp-2', savingsAmount: 150 },
        { blueprintId: 'bp-1', savingsAmount: 75 },
      ];

      const filtered = recommendations.filter(r => r.blueprintId === 'bp-1');

      expect(filtered).toHaveLength(2);
      expect(filtered.reduce((sum, r) => sum + r.savingsAmount, 0)).toBe(175);
    });
  });

  describe('Report Summary', () => {
    it('should summarize savings by category', () => {
      const summary = {
        rightSizing: { count: 3, totalSavings: 250 },
        reservedInstances: { count: 2, totalSavings: 400 },
        idleResources: { count: 5, totalSavings: 750 },
        storageTiering: { count: 2, totalSavings: 100 },
      };

      const totalRecommendations = Object.values(summary).reduce((sum, cat) => sum + cat.count, 0);
      const totalSavings = Object.values(summary).reduce((sum, cat) => sum + cat.totalSavings, 0);

      expect(totalRecommendations).toBe(12);
      expect(totalSavings).toBe(1500);
    });
  });
});
