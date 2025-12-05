import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Cost Monitor Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cost Tracking', () => {
    it('should track resource costs', () => {
      const resources = [
        { id: 'vm-1', type: 'compute', costPerHour: 0.5 },
        { id: 'db-1', type: 'database', costPerHour: 1.2 },
        { id: 'storage-1', type: 'storage', costPerMonth: 10 },
      ];

      const calculateDailyCost = (resources: any[]) => {
        return resources.reduce((total, resource) => {
          if (resource.costPerHour) {
            return total + resource.costPerHour * 24;
          }
          if (resource.costPerMonth) {
            return total + resource.costPerMonth / 30;
          }
          return total;
        }, 0);
      };

      const dailyCost = calculateDailyCost(resources);
      expect(dailyCost).toBeGreaterThan(0);
      expect(dailyCost).toBeCloseTo(40.8 + 0.33, 1);
    });

    it('should aggregate costs by tag', () => {
      const resources = [
        { id: 'vm-1', cost: 100, tags: { env: 'prod', team: 'backend' } },
        { id: 'vm-2', cost: 150, tags: { env: 'prod', team: 'frontend' } },
        { id: 'db-1', cost: 200, tags: { env: 'prod', team: 'backend' } },
      ];

      const aggregateByTag = (resources: any[], tagKey: string) => {
        const result: any = {};
        resources.forEach(resource => {
          const tagValue = resource.tags[tagKey];
          if (tagValue) {
            result[tagValue] = (result[tagValue] || 0) + resource.cost;
          }
        });
        return result;
      };

      const costsByTeam = aggregateByTag(resources, 'team');
      expect(costsByTeam['backend']).toBe(300);
      expect(costsByTeam['frontend']).toBe(150);
    });

    it('should calculate cost trends', () => {
      const dailyCosts = [
        { date: '2025-12-01', cost: 100 },
        { date: '2025-12-02', cost: 120 },
        { date: '2025-12-03', cost: 140 },
      ];

      const calculateTrend = (costs: any[]) => {
        if (costs.length < 2) return 0;
        const first = costs[0].cost;
        const last = costs[costs.length - 1].cost;
        return ((last - first) / first) * 100;
      };

      const trend = calculateTrend(dailyCosts);
      expect(trend).toBe(40); // 40% increase
    });

    it('should identify cost spikes', () => {
      const costs = [100, 105, 110, 250, 115, 120];

      const detectSpikes = (costs: number[], threshold: number = 50) => {
        const spikes = [];
        const avg = costs.reduce((a, b) => a + b, 0) / costs.length;
        
        costs.forEach((cost, index) => {
          const percentAboveAvg = ((cost - avg) / avg) * 100;
          if (percentAboveAvg > threshold) {
            spikes.push({ index, cost, percentAboveAvg });
          }
        });
        
        return spikes;
      };

      const spikes = detectSpikes(costs);
      expect(spikes.length).toBeGreaterThan(0);
      expect(spikes[0].cost).toBe(250);
    });
  });

  describe('Budget Monitoring', () => {
    it('should check budget utilization', () => {
      const budget = { limit: 1000, spent: 750 };

      const getUtilization = (budget: any) => (budget.spent / budget.limit) * 100;

      expect(getUtilization(budget)).toBe(75);
    });

    it('should trigger alert at threshold', () => {
      const alerts: string[] = [];

      const checkBudget = (spent: number, limit: number, thresholds: number[]) => {
        const utilization = (spent / limit) * 100;
        thresholds.forEach(threshold => {
          if (utilization >= threshold) {
            alerts.push(`Budget ${threshold}% utilized`);
          }
        });
      };

      checkBudget(850, 1000, [50, 75, 90]);
      expect(alerts).toContain('Budget 75% utilized');
      expect(alerts).not.toContain('Budget 90% utilized');
    });

    it('should project budget exhaustion date', () => {
      const budget = { limit: 1000, spent: 750 };
      const dailySpend = 50;

      const projectExhaustion = (budget: any, dailySpend: number) => {
        const remaining = budget.limit - budget.spent;
        const daysRemaining = remaining / dailySpend;
        return Math.floor(daysRemaining);
      };

      const daysLeft = projectExhaustion(budget, dailySpend);
      expect(daysLeft).toBe(5);
    });

    it('should recommend budget adjustments', () => {
      const budget = { limit: 1000, spent: 950 };
      const averageDailySpend = 100;

      const recommendBudget = (budget: any, dailySpend: number, daysInMonth: number = 30) => {
        const projectedSpend = dailySpend * daysInMonth;
        if (projectedSpend > budget.limit) {
          return Math.ceil(projectedSpend * 1.1); // 10% buffer
        }
        return budget.limit;
      };

      const recommendation = recommendBudget(budget, averageDailySpend);
      expect(recommendation).toBeGreaterThan(budget.limit);
    });
  });

  describe('Cost Anomaly Detection', () => {
    it('should detect unusual cost patterns', () => {
      const costs = [100, 105, 102, 108, 500, 103];

      const detectAnomalies = (costs: number[]) => {
        const mean = costs.reduce((a, b) => a + b, 0) / costs.length;
        const stdDev = Math.sqrt(
          costs.reduce((sum, cost) => sum + Math.pow(cost - mean, 2), 0) / costs.length
        );

        const anomalies = [];
        costs.forEach((cost, index) => {
          const zScore = (cost - mean) / stdDev;
          if (Math.abs(zScore) > 2) {
            anomalies.push({ index, cost, zScore });
          }
        });

        return anomalies;
      };

      const anomalies = detectAnomalies(costs);
      expect(anomalies.length).toBeGreaterThan(0);
    });

    it('should compare with historical data', () => {
      const currentCost = 500;
      const historicalAverage = 300;

      const calculateDeviation = (current: number, historical: number) => {
        return ((current - historical) / historical) * 100;
      };

      const deviation = calculateDeviation(currentCost, historicalAverage);
      expect(deviation).toBeCloseTo(66.67, 1);
    });

    it('should identify cost optimization opportunities', () => {
      const resources = [
        { id: 'vm-1', utilizationCPU: 10, cost: 100 },
        { id: 'vm-2', utilizationCPU: 80, cost: 100 },
        { id: 'vm-3', utilizationCPU: 5, cost: 100 },
      ];

      const findOptimizationOpportunities = (resources: any[], threshold: number = 30) => {
        return resources
          .filter(r => r.utilizationCPU < threshold)
          .map(r => ({
            ...r,
            recommendation: 'Consider downsizing or removing',
            potentialSavings: r.cost * 0.5,
          }));
      };

      const opportunities = findOptimizationOpportunities(resources);
      expect(opportunities).toHaveLength(2);
      expect(opportunities[0].potentialSavings).toBe(50);
    });
  });

  describe('Cost Forecasting', () => {
    it('should forecast monthly costs', () => {
      const dailyCosts = [100, 105, 110, 115, 120];

      const forecastMonth = (dailyCosts: number[]) => {
        const average = dailyCosts.reduce((a, b) => a + b, 0) / dailyCosts.length;
        return average * 30;
      };

      const forecast = forecastMonth(dailyCosts);
      expect(forecast).toBe(110 * 30);
    });

    it('should apply growth rate to forecast', () => {
      const currentMonthlyCost = 1000;
      const growthRate = 0.1; // 10% per month

      const forecastWithGrowth = (current: number, rate: number, months: number) => {
        return current * Math.pow(1 + rate, months);
      };

      const forecast3Months = forecastWithGrowth(currentMonthlyCost, growthRate, 3);
      expect(forecast3Months).toBeGreaterThan(currentMonthlyCost);
      expect(forecast3Months).toBeCloseTo(1331, 0);
    });

    it('should factor in planned changes', () => {
      const currentCost = 1000;
      const plannedChanges = [
        { type: 'add', impact: 200 },
        { type: 'remove', impact: -100 },
        { type: 'optimize', impact: -50 },
      ];

      const applyChanges = (current: number, changes: any[]) => {
        return changes.reduce((total, change) => total + change.impact, current);
      };

      const projectedCost = applyChanges(currentCost, plannedChanges);
      expect(projectedCost).toBe(1050);
    });
  });

  describe('Cost Allocation', () => {
    it('should allocate shared costs', () => {
      const sharedCost = 300;
      const teams = [
        { name: 'team-a', resourceCount: 5 },
        { name: 'team-b', resourceCount: 10 },
        { name: 'team-c', resourceCount: 5 },
      ];

      const allocateByUsage = (sharedCost: number, teams: any[]) => {
        const totalResources = teams.reduce((sum, t) => sum + t.resourceCount, 0);
        return teams.map(team => ({
          ...team,
          allocatedCost: (team.resourceCount / totalResources) * sharedCost,
        }));
      };

      const allocated = allocateByUsage(sharedCost, teams);
      expect(allocated[0].allocatedCost).toBe(75); // 5/20 * 300
      expect(allocated[1].allocatedCost).toBe(150); // 10/20 * 300
    });

    it('should track cost by environment', () => {
      const resources = [
        { id: 'r1', cost: 100, environment: 'prod' },
        { id: 'r2', cost: 50, environment: 'dev' },
        { id: 'r3', cost: 150, environment: 'prod' },
      ];

      const groupByEnvironment = (resources: any[]) => {
        return resources.reduce((acc, resource) => {
          const env = resource.environment;
          acc[env] = (acc[env] || 0) + resource.cost;
          return acc;
        }, {} as any);
      };

      const costsByEnv = groupByEnvironment(resources);
      expect(costsByEnv.prod).toBe(250);
      expect(costsByEnv.dev).toBe(50);
    });
  });

  describe('Cost Reports', () => {
    it('should generate daily cost report', () => {
      const resources = [
        { id: 'vm-1', cost: 12 },
        { id: 'db-1', cost: 28.8 },
      ];

      const generateDailyReport = (resources: any[]) => ({
        date: new Date().toISOString().split('T')[0],
        totalCost: resources.reduce((sum, r) => sum + r.cost, 0),
        resourceCount: resources.length,
        resources,
      });

      const report = generateDailyReport(resources);
      expect(report.totalCost).toBe(40.8);
      expect(report.resourceCount).toBe(2);
    });

    it('should generate cost breakdown by service', () => {
      const resources = [
        { id: 'vm-1', service: 'compute', cost: 100 },
        { id: 'vm-2', service: 'compute', cost: 150 },
        { id: 'db-1', service: 'database', cost: 200 },
      ];

      const breakdownByService = (resources: any[]) => {
        const breakdown: any = {};
        resources.forEach(resource => {
          const service = resource.service;
          if (!breakdown[service]) {
            breakdown[service] = { total: 0, count: 0 };
          }
          breakdown[service].total += resource.cost;
          breakdown[service].count += 1;
        });
        return breakdown;
      };

      const breakdown = breakdownByService(resources);
      expect(breakdown.compute.total).toBe(250);
      expect(breakdown.compute.count).toBe(2);
      expect(breakdown.database.total).toBe(200);
    });
  });
});
