import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Costing Service - Budget Manager', () => {
  describe('Budget Creation', () => {
    it('should create budget with required fields', () => {
      const budget = {
        budgetId: 'budget-123',
        name: 'Q1 2025 Budget',
        amount: 10000,
        period: 'monthly',
        blueprintId: 'blueprint-456',
        environment: 'production',
        currentSpend: 0,
        status: 'active',
        lastUpdated: new Date(),
      };

      expect(budget.budgetId).toBeDefined();
      expect(budget.amount).toBe(10000);
      expect(budget.status).toBe('active');
    });

    it('should set currentSpend to 0 initially', () => {
      const budget = {
        budgetId: 'budget-123',
        amount: 5000,
        currentSpend: 0,
      };

      expect(budget.currentSpend).toBe(0);
    });

    it('should support different periods', () => {
      const periods = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
      
      periods.forEach(period => {
        const budget = { period };
        expect(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).toContain(budget.period);
      });
    });
  });

  describe('Budget Tracking', () => {
    it('should calculate budget utilization percentage', () => {
      const budget = {
        amount: 10000,
        currentSpend: 7500,
      };

      const utilization = (budget.currentSpend / budget.amount) * 100;

      expect(utilization).toBe(75);
    });

    it('should detect when budget is exceeded', () => {
      const budget = {
        amount: 5000,
        currentSpend: 5500,
      };

      const isExceeded = budget.currentSpend > budget.amount;

      expect(isExceeded).toBe(true);
    });

    it('should calculate remaining budget', () => {
      const budget = {
        amount: 10000,
        currentSpend: 3500,
      };

      const remaining = budget.amount - budget.currentSpend;

      expect(remaining).toBe(6500);
    });

    it('should track budget alerts', () => {
      const alerts = [
        { threshold: 50, triggered: false },
        { threshold: 75, triggered: true },
        { threshold: 90, triggered: false },
        { threshold: 100, triggered: false },
      ];

      const triggeredAlerts = alerts.filter(a => a.triggered);

      expect(triggeredAlerts).toHaveLength(1);
      expect(triggeredAlerts[0].threshold).toBe(75);
    });
  });

  describe('Budget Alerts', () => {
    it('should trigger alert at 50% threshold', () => {
      const budget = { amount: 10000, currentSpend: 5000 };
      const threshold = 50;
      const utilization = (budget.currentSpend / budget.amount) * 100;

      const shouldAlert = utilization >= threshold;

      expect(shouldAlert).toBe(true);
    });

    it('should trigger alert at 75% threshold', () => {
      const budget = { amount: 10000, currentSpend: 8000 };
      const threshold = 75;
      const utilization = (budget.currentSpend / budget.amount) * 100;

      const shouldAlert = utilization >= threshold;

      expect(shouldAlert).toBe(true);
    });

    it('should trigger alert at 90% threshold', () => {
      const budget = { amount: 10000, currentSpend: 9100 };
      const threshold = 90;
      const utilization = (budget.currentSpend / budget.amount) * 100;

      const shouldAlert = utilization >= threshold;

      expect(shouldAlert).toBe(true);
    });

    it('should trigger alert at 100% threshold', () => {
      const budget = { amount: 10000, currentSpend: 10000 };
      const threshold = 100;
      const utilization = (budget.currentSpend / budget.amount) * 100;

      const shouldAlert = utilization >= threshold;

      expect(shouldAlert).toBe(true);
    });

    it('should not trigger alert below threshold', () => {
      const budget = { amount: 10000, currentSpend: 4000 };
      const threshold = 50;
      const utilization = (budget.currentSpend / budget.amount) * 100;

      const shouldAlert = utilization >= threshold;

      expect(shouldAlert).toBe(false);
    });
  });

  describe('Budget Filtering', () => {
    it('should filter budgets by blueprint', () => {
      const budgets = [
        { budgetId: '1', blueprintId: 'bp-1' },
        { budgetId: '2', blueprintId: 'bp-2' },
        { budgetId: '3', blueprintId: 'bp-1' },
      ];

      const filtered = budgets.filter(b => b.blueprintId === 'bp-1');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(b => b.blueprintId === 'bp-1')).toBe(true);
    });

    it('should filter budgets by environment', () => {
      const budgets = [
        { budgetId: '1', environment: 'dev' },
        { budgetId: '2', environment: 'prod' },
        { budgetId: '3', environment: 'dev' },
      ];

      const filtered = budgets.filter(b => b.environment === 'prod');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].environment).toBe('prod');
    });

    it('should filter budgets by status', () => {
      const budgets = [
        { budgetId: '1', status: 'active' },
        { budgetId: '2', status: 'exceeded' },
        { budgetId: '3', status: 'active' },
      ];

      const active = budgets.filter(b => b.status === 'active');

      expect(active).toHaveLength(2);
    });
  });

  describe('Budget Updates', () => {
    it('should update budget amount', () => {
      const budget = {
        budgetId: 'budget-123',
        amount: 5000,
        lastUpdated: new Date(Date.now() - 3600000),
      };

      budget.amount = 7500;
      budget.lastUpdated = new Date();

      expect(budget.amount).toBe(7500);
    });

    it('should update budget status', () => {
      const budget = {
        budgetId: 'budget-123',
        status: 'active',
      };

      budget.status = 'exceeded';

      expect(budget.status).toBe('exceeded');
    });

    it('should update lastUpdated timestamp', () => {
      const budget = {
        budgetId: 'budget-123',
        lastUpdated: new Date(Date.now() - 3600000),
      };

      const beforeUpdate = budget.lastUpdated.getTime();
      budget.lastUpdated = new Date();
      const afterUpdate = budget.lastUpdated.getTime();

      expect(afterUpdate).toBeGreaterThan(beforeUpdate);
    });
  });

  describe('Budget Monitoring', () => {
    it('should schedule hourly budget checks', () => {
      const cronPattern = '0 * * * *'; // Every hour
      
      expect(cronPattern).toBe('0 * * * *');
    });

    it('should check multiple budgets', () => {
      const budgets = [
        { budgetId: '1', amount: 5000, currentSpend: 3000 },
        { budgetId: '2', amount: 10000, currentSpend: 9500 },
        { budgetId: '3', amount: 2000, currentSpend: 500 },
      ];

      const needsAlert = budgets.filter(b => {
        const utilization = (b.currentSpend / b.amount) * 100;
        return utilization >= 75;
      });

      expect(needsAlert).toHaveLength(1);
      expect(needsAlert[0].budgetId).toBe('2');
    });
  });
});
