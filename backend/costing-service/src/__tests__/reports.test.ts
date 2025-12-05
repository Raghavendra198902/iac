import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Cost Reports Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Report Generation', () => {
    it('should generate daily cost report', async () => {
      const generateDailyReport = async (date: string) => {
        return {
          reportId: `daily-${date}`,
          date,
          totalCost: 1250.50,
          breakdown: {
            compute: 500,
            storage: 300,
            networking: 200,
            database: 250.50,
          },
          generatedAt: new Date().toISOString(),
        };
      };

      const report = await generateDailyReport('2025-01-01');
      expect(report.totalCost).toBe(1250.50);
      expect(report.breakdown.compute).toBe(500);
    });

    it('should generate weekly cost report', async () => {
      const generateWeeklyReport = async (weekNumber: number, year: number) => {
        return {
          reportId: `weekly-${year}-w${weekNumber}`,
          weekNumber,
          year,
          totalCost: 8500,
          averageDailyCost: 8500 / 7,
          trend: 'increasing',
        };
      };

      const report = await generateWeeklyReport(1, 2025);
      expect(report.weekNumber).toBe(1);
      expect(report.averageDailyCost).toBeCloseTo(1214.29, 2);
    });

    it('should generate monthly cost report', async () => {
      const generateMonthlyReport = async (month: number, year: number) => {
        return {
          reportId: `monthly-${year}-${month}`,
          month,
          year,
          totalCost: 35000,
          budget: 40000,
          variance: -5000,
          utilizationPercent: 87.5,
        };
      };

      const report = await generateMonthlyReport(1, 2025);
      expect(report.totalCost).toBe(35000);
      expect(report.utilizationPercent).toBe(87.5);
    });

    it('should support custom date ranges', async () => {
      const generateCustomReport = async (startDate: string, endDate: string) => {
        return {
          reportId: `custom-${startDate}-${endDate}`,
          period: { start: startDate, end: endDate },
          totalCost: 5250,
          days: 15,
          averageDailyCost: 350,
        };
      };

      const report = await generateCustomReport('2025-01-01', '2025-01-15');
      expect(report.days).toBe(15);
      expect(report.averageDailyCost).toBe(350);
    });
  });

  describe('Cost Breakdown Analysis', () => {
    it('should break down costs by service', () => {
      const costs = [
        { service: 'EC2', cost: 500 },
        { service: 'RDS', cost: 300 },
        { service: 'S3', cost: 100 },
        { service: 'EC2', cost: 200 },
      ];

      const breakdownByService = (costs: any[]) => {
        return costs.reduce((acc: any, item) => {
          acc[item.service] = (acc[item.service] || 0) + item.cost;
          return acc;
        }, {});
      };

      const breakdown = breakdownByService(costs);
      expect(breakdown.EC2).toBe(700);
      expect(breakdown.RDS).toBe(300);
    });

    it('should break down costs by team', () => {
      const costs = [
        { team: 'engineering', cost: 1000 },
        { team: 'marketing', cost: 500 },
        { team: 'engineering', cost: 800 },
      ];

      const breakdownByTeam = (costs: any[]) => {
        const result: any = {};
        costs.forEach(c => {
          result[c.team] = (result[c.team] || 0) + c.cost;
        });
        return result;
      };

      const breakdown = breakdownByTeam(costs);
      expect(breakdown.engineering).toBe(1800);
      expect(breakdown.marketing).toBe(500);
    });

    it('should break down costs by environment', () => {
      const resources = [
        { env: 'production', cost: 5000 },
        { env: 'staging', cost: 1000 },
        { env: 'development', cost: 500 },
        { env: 'production', cost: 3000 },
      ];

      const breakdownByEnv = (resources: any[]) => {
        const totals: any = {};
        resources.forEach(r => {
          totals[r.env] = (totals[r.env] || 0) + r.cost;
        });
        return totals;
      };

      const breakdown = breakdownByEnv(resources);
      expect(breakdown.production).toBe(8000);
      expect(breakdown.staging).toBe(1000);
    });

    it('should calculate percentage distribution', () => {
      const breakdown = {
        compute: 5000,
        storage: 2000,
        networking: 1000,
        other: 2000,
      };

      const calculatePercentages = (breakdown: any) => {
        const total = Object.values(breakdown).reduce((sum: number, val: any) => sum + val, 0);
        const percentages: any = {};
        Object.entries(breakdown).forEach(([key, value]: any) => {
          percentages[key] = ((value / total) * 100).toFixed(2);
        });
        return percentages;
      };

      const percentages = calculatePercentages(breakdown);
      expect(parseFloat(percentages.compute)).toBe(50);
      expect(parseFloat(percentages.storage)).toBe(20);
    });
  });

  describe('Cost Trend Analysis', () => {
    it('should calculate cost trends', () => {
      const monthlyCosts = [
        { month: 'Jan', cost: 10000 },
        { month: 'Feb', cost: 12000 },
        { month: 'Mar', cost: 11000 },
      ];

      const calculateTrend = (costs: any[]) => {
        if (costs.length < 2) return 'stable';
        const last = costs[costs.length - 1].cost;
        const previous = costs[costs.length - 2].cost;
        const change = ((last - previous) / previous) * 100;
        
        if (change > 5) return 'increasing';
        if (change < -5) return 'decreasing';
        return 'stable';
      };

      const trend = calculateTrend(monthlyCosts);
      expect(trend).toBe('decreasing'); // 11000 vs 12000
    });

    it('should identify cost spikes', () => {
      const dailyCosts = [
        { date: '2025-01-01', cost: 100 },
        { date: '2025-01-02', cost: 110 },
        { date: '2025-01-03', cost: 500 }, // Spike!
        { date: '2025-01-04', cost: 105 },
      ];

      const detectSpikes = (costs: any[], threshold: number) => {
        const average = costs.reduce((sum, c) => sum + c.cost, 0) / costs.length;
        return costs.filter(c => c.cost > average * (1 + threshold / 100));
      };

      const spikes = detectSpikes(dailyCosts, 100); // 100% above average
      expect(spikes).toHaveLength(1);
      expect(spikes[0].date).toBe('2025-01-03');
    });

    it('should forecast future costs', () => {
      const historicalCosts = [8000, 8500, 9000, 9500, 10000];

      const forecastNextMonth = (costs: number[]) => {
        const avgGrowth = costs.slice(1).reduce((sum, cost, idx) => {
          return sum + (cost - costs[idx]) / costs[idx];
        }, 0) / (costs.length - 1);

        const lastCost = costs[costs.length - 1];
        return lastCost * (1 + avgGrowth);
      };

      const forecast = forecastNextMonth(historicalCosts);
      expect(forecast).toBeGreaterThan(10000);
      expect(forecast).toBeLessThan(11000);
    });
  });

  describe('Cost Anomaly Detection', () => {
    it('should detect cost anomalies', () => {
      const costs = [
        { date: '2025-01-01', cost: 100 },
        { date: '2025-01-02', cost: 105 },
        { date: '2025-01-03', cost: 300 }, // Anomaly
        { date: '2025-01-04', cost: 102 },
      ];

      const detectAnomalies = (costs: any[]) => {
        const values = costs.map(c => c.cost);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const stdDev = Math.sqrt(
          values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
        );

        return costs.filter(c => Math.abs(c.cost - mean) > 2 * stdDev);
      };

      const anomalies = detectAnomalies(costs);
      expect(anomalies.length).toBeGreaterThan(0);
    });

    it('should explain cost anomalies', () => {
      const anomaly = {
        date: '2025-01-15',
        expectedCost: 1000,
        actualCost: 3000,
        difference: 2000,
      };

      const explainAnomaly = (anomaly: any) => {
        const percentIncrease = ((anomaly.actualCost - anomaly.expectedCost) / anomaly.expectedCost) * 100;
        return {
          severity: percentIncrease > 100 ? 'critical' : percentIncrease > 50 ? 'high' : 'medium',
          message: `Cost increased by ${percentIncrease.toFixed(1)}%`,
          recommendation: 'Review resource usage for this period',
        };
      };

      const explanation = explainAnomaly(anomaly);
      expect(explanation.severity).toBe('critical');
      expect(explanation.message).toContain('200%');
    });
  });

  describe('Report Scheduling', () => {
    it('should schedule daily reports', () => {
      const schedule = {
        frequency: 'daily',
        time: '09:00',
        timezone: 'UTC',
        enabled: true,
      };

      expect(schedule.frequency).toBe('daily');
      expect(schedule.enabled).toBe(true);
    });

    it('should schedule weekly reports', () => {
      const schedule = {
        frequency: 'weekly',
        dayOfWeek: 'Monday',
        time: '10:00',
        recipients: ['team@example.com'],
      };

      expect(schedule.dayOfWeek).toBe('Monday');
      expect(schedule.recipients).toHaveLength(1);
    });

    it('should schedule monthly reports', () => {
      const schedule = {
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '08:00',
        format: 'pdf',
      };

      expect(schedule.dayOfMonth).toBe(1);
      expect(schedule.format).toBe('pdf');
    });
  });

  describe('Report Delivery', () => {
    it('should send report via email', async () => {
      const sentEmails: any[] = [];

      const sendEmailReport = async (report: any, recipients: string[]) => {
        sentEmails.push({
          to: recipients,
          subject: `Cost Report - ${report.reportId}`,
          attachment: `${report.reportId}.pdf`,
          sentAt: new Date().toISOString(),
        });
        return { sent: true };
      };

      const report = { reportId: 'monthly-2025-01', totalCost: 35000 };
      await sendEmailReport(report, ['team@example.com']);

      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].subject).toContain('monthly-2025-01');
    });

    it('should export report to dashboard', async () => {
      const exportToDashboard = async (report: any) => {
        return {
          dashboardUrl: `https://dashboard.example.com/reports/${report.reportId}`,
          published: true,
        };
      };

      const report = { reportId: 'daily-2025-01-15' };
      const result = await exportToDashboard(report);

      expect(result.published).toBe(true);
      expect(result.dashboardUrl).toContain('daily-2025-01-15');
    });

    it('should store report in S3', async () => {
      const uploadToS3 = async (report: any) => {
        return {
          bucket: 'cost-reports',
          key: `reports/${report.reportId}.json`,
          url: `s3://cost-reports/reports/${report.reportId}.json`,
        };
      };

      const report = { reportId: 'weekly-2025-w1', data: {} };
      const result = await uploadToS3(report);

      expect(result.bucket).toBe('cost-reports');
      expect(result.key).toContain('weekly-2025-w1');
    });
  });

  describe('Report Formats', () => {
    it('should export report as JSON', () => {
      const report = {
        reportId: 'monthly-2025-01',
        totalCost: 35000,
        breakdown: { compute: 15000, storage: 10000 },
      };

      const exportAsJSON = (report: any) => {
        return JSON.stringify(report, null, 2);
      };

      const json = exportAsJSON(report);
      expect(json).toContain('monthly-2025-01');
      expect(JSON.parse(json).totalCost).toBe(35000);
    });

    it('should export report as CSV', () => {
      const breakdown = [
        { service: 'EC2', cost: 500 },
        { service: 'RDS', cost: 300 },
        { service: 'S3', cost: 100 },
      ];

      const exportAsCSV = (data: any[]) => {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        return [headers, ...rows].join('\n');
      };

      const csv = exportAsCSV(breakdown);
      expect(csv).toContain('service,cost');
      expect(csv).toContain('EC2,500');
    });

    it('should generate report summary', () => {
      const report = {
        reportId: 'monthly-2025-01',
        totalCost: 35000,
        budget: 40000,
        topServices: ['EC2', 'RDS', 'S3'],
      };

      const generateSummary = (report: any) => {
        const remaining = report.budget - report.totalCost;
        const utilizationPercent = (report.totalCost / report.budget) * 100;

        return {
          summary: `Spent $${report.totalCost} of $${report.budget} budget`,
          remaining: `$${remaining} remaining`,
          utilization: `${utilizationPercent.toFixed(1)}% utilized`,
          topServices: report.topServices.join(', '),
        };
      };

      const summary = generateSummary(report);
      expect(summary.remaining).toContain('5000');
      expect(summary.utilization).toContain('87.5%');
    });
  });

  describe('Historical Report Comparison', () => {
    it('should compare month-over-month', () => {
      const thisMonth = { cost: 12000 };
      const lastMonth = { cost: 10000 };

      const compareMonths = (current: any, previous: any) => {
        const change = current.cost - previous.cost;
        const percentChange = (change / previous.cost) * 100;

        return {
          change,
          percentChange: percentChange.toFixed(1),
          trend: change > 0 ? 'increased' : 'decreased',
        };
      };

      const comparison = compareMonths(thisMonth, lastMonth);
      expect(comparison.change).toBe(2000);
      expect(comparison.percentChange).toBe('20.0');
      expect(comparison.trend).toBe('increased');
    });

    it('should compare year-over-year', () => {
      const thisYear = { totalCost: 120000, avgMonthlyCost: 10000 };
      const lastYear = { totalCost: 96000, avgMonthlyCost: 8000 };

      const compareYears = (current: any, previous: any) => {
        const growth = ((current.totalCost - previous.totalCost) / previous.totalCost) * 100;
        return {
          totalGrowth: growth.toFixed(1),
          avgMonthlyGrowth: ((current.avgMonthlyCost - previous.avgMonthlyCost) / previous.avgMonthlyCost * 100).toFixed(1),
        };
      };

      const comparison = compareYears(thisYear, lastYear);
      expect(comparison.totalGrowth).toBe('25.0');
    });
  });
});
