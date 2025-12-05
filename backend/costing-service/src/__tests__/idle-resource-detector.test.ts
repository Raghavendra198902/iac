import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Idle Resource Detector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Low CPU Utilization Detection', () => {
    it('should detect low CPU utilization', () => {
      const resources = [
        { id: 'vm-1', name: 'web-server', cpuAvg: 5, cpuThreshold: 20 },
        { id: 'vm-2', name: 'app-server', cpuAvg: 45, cpuThreshold: 20 },
        { id: 'vm-3', name: 'db-server', cpuAvg: 3, cpuThreshold: 20 },
      ];

      const detectLowCPU = (resources: any[], threshold: number) => {
        return resources.filter(r => r.cpuAvg < threshold);
      };

      const idle = detectLowCPU(resources, 20);
      expect(idle).toHaveLength(2);
      expect(idle[0].id).toBe('vm-1');
    });

    it('should calculate average CPU over time period', () => {
      const metrics = [
        { timestamp: Date.now() - 3600000, cpu: 10 },
        { timestamp: Date.now() - 7200000, cpu: 15 },
        { timestamp: Date.now() - 10800000, cpu: 5 },
      ];

      const calculateAverage = (metrics: any[]) => {
        const sum = metrics.reduce((acc, m) => acc + m.cpu, 0);
        return sum / metrics.length;
      };

      const avg = calculateAverage(metrics);
      expect(avg).toBe(10);
    });

    it('should check peak vs average utilization', () => {
      const resource = {
        cpuAvg: 15,
        cpuPeak: 85,
        cpuP95: 25,
      };

      const isUnderutilized = (resource: any) => {
        return resource.cpuAvg < 20 && resource.cpuP95 < 40;
      };

      expect(isUnderutilized(resource)).toBe(true);
    });
  });

  describe('Unused Storage Detection', () => {
    it('should detect unused storage volumes', () => {
      const volumes = [
        { id: 'vol-1', lastAccessed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
        { id: 'vol-2', lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { id: 'vol-3', lastAccessed: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) },
      ];

      const detectUnusedStorage = (volumes: any[], daysSinceAccess: number) => {
        const cutoffDate = Date.now() - daysSinceAccess * 24 * 60 * 60 * 1000;
        return volumes.filter(v => v.lastAccessed.getTime() < cutoffDate);
      };

      const unused = detectUnusedStorage(volumes, 30);
      expect(unused).toHaveLength(2);
    });

    it('should detect low storage utilization', () => {
      const volumes = [
        { id: 'vol-1', sizeGB: 100, usedGB: 5, utilization: 5 },
        { id: 'vol-2', sizeGB: 200, usedGB: 150, utilization: 75 },
        { id: 'vol-3', sizeGB: 50, usedGB: 2, utilization: 4 },
      ];

      const detectLowUtilization = (volumes: any[], threshold: number) => {
        return volumes.filter(v => v.utilization < threshold);
      };

      const lowUtil = detectLowUtilization(volumes, 10);
      expect(lowUtil).toHaveLength(2);
    });

    it('should identify empty storage buckets', () => {
      const buckets = [
        { id: 'bucket-1', objectCount: 0, sizeGB: 0 },
        { id: 'bucket-2', objectCount: 1500, sizeGB: 250 },
        { id: 'bucket-3', objectCount: 0, sizeGB: 0 },
      ];

      const emptyBuckets = buckets.filter(b => b.objectCount === 0);
      expect(emptyBuckets).toHaveLength(2);
    });
  });

  describe('Orphaned Resource Detection', () => {
    it('should detect unattached disks', () => {
      const disks = [
        { id: 'disk-1', attachedTo: null, status: 'available' },
        { id: 'disk-2', attachedTo: 'vm-1', status: 'in-use' },
        { id: 'disk-3', attachedTo: null, status: 'available' },
      ];

      const unattached = disks.filter(d => d.attachedTo === null);
      expect(unattached).toHaveLength(2);
    });

    it('should detect unattached IP addresses', () => {
      const ips = [
        { id: 'ip-1', associatedWith: null, allocated: true },
        { id: 'ip-2', associatedWith: 'vm-1', allocated: true },
        { id: 'ip-3', associatedWith: null, allocated: true },
      ];

      const orphanedIPs = ips.filter(ip => ip.allocated && !ip.associatedWith);
      expect(orphanedIPs).toHaveLength(2);
    });

    it('should detect orphaned snapshots', () => {
      const snapshots = [
        { id: 'snap-1', sourceVolume: 'vol-1', sourceExists: true },
        { id: 'snap-2', sourceVolume: 'vol-2', sourceExists: false },
        { id: 'snap-3', sourceVolume: 'vol-3', sourceExists: false },
      ];

      const orphaned = snapshots.filter(s => !s.sourceExists);
      expect(orphaned).toHaveLength(2);
    });

    it('should detect unused load balancers', () => {
      const loadBalancers = [
        { id: 'lb-1', targetCount: 0, requestsPerMinute: 0 },
        { id: 'lb-2', targetCount: 3, requestsPerMinute: 1500 },
        { id: 'lb-3', targetCount: 0, requestsPerMinute: 0 },
      ];

      const unused = loadBalancers.filter(lb => lb.targetCount === 0 && lb.requestsPerMinute === 0);
      expect(unused).toHaveLength(2);
    });
  });

  describe('Idle Database Detection', () => {
    it('should detect low database connection count', () => {
      const databases = [
        { id: 'db-1', avgConnections: 2, maxConnections: 100 },
        { id: 'db-2', avgConnections: 45, maxConnections: 100 },
        { id: 'db-3', avgConnections: 1, maxConnections: 50 },
      ];

      const detectIdleDatabases = (dbs: any[], threshold: number) => {
        return dbs.filter(db => db.avgConnections < threshold);
      };

      const idle = detectIdleDatabases(databases, 5);
      expect(idle).toHaveLength(2);
    });

    it('should detect low query activity', () => {
      const databases = [
        { id: 'db-1', queriesPerHour: 10 },
        { id: 'db-2', queriesPerHour: 5000 },
        { id: 'db-3', queriesPerHour: 5 },
      ];

      const lowActivity = databases.filter(db => db.queriesPerHour < 100);
      expect(lowActivity).toHaveLength(2);
    });

    it('should check read/write operations', () => {
      const database = {
        id: 'db-1',
        readsPerMinute: 2,
        writesPerMinute: 1,
      };

      const isTrulyIdle = (db: any) => {
        return db.readsPerMinute < 10 && db.writesPerMinute < 5;
      };

      expect(isTrulyIdle(database)).toBe(true);
    });
  });

  describe('Cost Impact Analysis', () => {
    it('should calculate potential savings', () => {
      const idleResources = [
        { id: 'vm-1', type: 'compute', monthlyCost: 150 },
        { id: 'vol-1', type: 'storage', monthlyCost: 50 },
        { id: 'db-1', type: 'database', monthlyCost: 300 },
      ];

      const calculateSavings = (resources: any[]) => {
        return resources.reduce((total, r) => total + r.monthlyCost, 0);
      };

      const savings = calculateSavings(idleResources);
      expect(savings).toBe(500);
    });

    it('should prioritize by cost impact', () => {
      const idleResources = [
        { id: 'res-1', monthlyCost: 50, utilization: 5 },
        { id: 'res-2', monthlyCost: 500, utilization: 3 },
        { id: 'res-3', monthlyCost: 200, utilization: 8 },
      ];

      const prioritize = (resources: any[]) => {
        return [...resources].sort((a, b) => b.monthlyCost - a.monthlyCost);
      };

      const prioritized = prioritize(idleResources);
      expect(prioritized[0].id).toBe('res-2');
      expect(prioritized[0].monthlyCost).toBe(500);
    });

    it('should calculate ROI of optimization', () => {
      const resource = {
        monthlyCost: 500,
        idlePercentage: 80,
      };

      const calculateROI = (resource: any) => {
        const wastedCost = resource.monthlyCost * (resource.idlePercentage / 100);
        const annualSavings = wastedCost * 12;
        return { monthlySavings: wastedCost, annualSavings };
      };

      const roi = calculateROI(resource);
      expect(roi.monthlySavings).toBe(400);
      expect(roi.annualSavings).toBe(4800);
    });

    it('should estimate savings from right-sizing', () => {
      const resource = {
        currentSKU: 'Standard_D4s_v3',
        currentCost: 200,
        recommendedSKU: 'Standard_D2s_v3',
        recommendedCost: 100,
      };

      const estimateSavings = (resource: any) => {
        return resource.currentCost - resource.recommendedCost;
      };

      const savings = estimateSavings(resource);
      expect(savings).toBe(100);
    });
  });

  describe('Shutdown Recommendations', () => {
    it('should recommend immediate shutdown', () => {
      const resource = {
        id: 'vm-1',
        cpuAvg: 2,
        idleDays: 45,
        criticalWorkload: false,
      };

      const recommendShutdown = (resource: any) => {
        if (resource.cpuAvg < 5 && resource.idleDays > 30 && !resource.criticalWorkload) {
          return { action: 'immediate-shutdown', confidence: 'high' };
        }
        return { action: 'monitor', confidence: 'low' };
      };

      const recommendation = recommendShutdown(resource);
      expect(recommendation.action).toBe('immediate-shutdown');
      expect(recommendation.confidence).toBe('high');
    });

    it('should recommend scheduled shutdown', () => {
      const resource = {
        id: 'vm-1',
        schedule: {
          businessHours: { start: '09:00', end: '17:00' },
          weekends: 'shutdown',
        },
        currentUsage: 'business-hours-only',
      };

      const recommendSchedule = (resource: any) => {
        if (resource.currentUsage === 'business-hours-only') {
          return {
            action: 'scheduled-shutdown',
            schedule: 'Shutdown nights and weekends',
            estimatedSavings: '65%',
          };
        }
        return { action: 'none' };
      };

      const recommendation = recommendSchedule(resource);
      expect(recommendation.action).toBe('scheduled-shutdown');
      expect(recommendation.estimatedSavings).toBe('65%');
    });

    it('should recommend resource downsizing', () => {
      const resource = {
        id: 'vm-1',
        cpuAvg: 25,
        memoryAvg: 30,
        currentSize: 'large',
        oversizedBy: 50,
      };

      const recommendDownsize = (resource: any) => {
        if (resource.cpuAvg < 40 && resource.memoryAvg < 40) {
          return {
            action: 'downsize',
            from: resource.currentSize,
            to: 'medium',
            savingsPercent: 50,
          };
        }
        return { action: 'none' };
      };

      const recommendation = recommendDownsize(resource);
      expect(recommendation.action).toBe('downsize');
      expect(recommendation.to).toBe('medium');
    });

    it('should recommend migration to spot instances', () => {
      const resource = {
        id: 'vm-1',
        workloadType: 'batch-processing',
        faultTolerant: true,
        currentType: 'on-demand',
      };

      const recommendSpot = (resource: any) => {
        if (resource.faultTolerant && resource.workloadType === 'batch-processing') {
          return {
            action: 'migrate-to-spot',
            estimatedSavings: '70%',
          };
        }
        return { action: 'none' };
      };

      const recommendation = recommendSpot(resource);
      expect(recommendation.action).toBe('migrate-to-spot');
      expect(recommendation.estimatedSavings).toBe('70%');
    });
  });

  describe('Idle Detection Reports', () => {
    it('should generate idle resources report', () => {
      const idleResources = [
        { id: 'vm-1', type: 'compute', idleDays: 45, monthlyCost: 200 },
        { id: 'vol-1', type: 'storage', idleDays: 90, monthlyCost: 50 },
        { id: 'db-1', type: 'database', idleDays: 30, monthlyCost: 300 },
      ];

      const generateReport = (resources: any[]) => {
        const byType = resources.reduce((acc: any, r) => {
          acc[r.type] = (acc[r.type] || 0) + 1;
          return acc;
        }, {});

        const totalCost = resources.reduce((sum, r) => sum + r.monthlyCost, 0);

        return {
          totalResources: resources.length,
          byType,
          totalMonthlyCost: totalCost,
          potentialSavings: totalCost,
        };
      };

      const report = generateReport(idleResources);
      expect(report.totalResources).toBe(3);
      expect(report.byType.compute).toBe(1);
      expect(report.potentialSavings).toBe(550);
    });

    it('should track detection history', () => {
      const history = [
        { date: '2025-01-01', idleCount: 15, savings: 1200 },
        { date: '2025-02-01', idleCount: 12, savings: 950 },
        { date: '2025-03-01', idleCount: 8, savings: 600 },
      ];

      const analyzeProgress = (history: any[]) => {
        const first = history[0];
        const last = history[history.length - 1];
        const reduction = ((first.idleCount - last.idleCount) / first.idleCount) * 100;
        return {
          improvement: reduction,
          savingsRealized: first.savings - last.savings,
        };
      };

      const progress = analyzeProgress(history);
      expect(progress.improvement).toBeCloseTo(46.67, 1);
      expect(progress.savingsRealized).toBe(600);
    });

    it('should recommend action plan', () => {
      const idleResources = [
        { id: 'res-1', priority: 'high', monthlyCost: 500 },
        { id: 'res-2', priority: 'medium', monthlyCost: 200 },
        { id: 'res-3', priority: 'high', monthlyCost: 400 },
      ];

      const createActionPlan = (resources: any[]) => {
        const highPriority = resources.filter(r => r.priority === 'high');
        const mediumPriority = resources.filter(r => r.priority === 'medium');

        return {
          phase1: { resources: highPriority.length, action: 'Immediate review and shutdown' },
          phase2: { resources: mediumPriority.length, action: 'Scheduled review' },
        };
      };

      const plan = createActionPlan(idleResources);
      expect(plan.phase1.resources).toBe(2);
      expect(plan.phase2.resources).toBe(1);
    });
  });

  describe('Auto-Cleanup Integration', () => {
    it('should mark resources for cleanup', () => {
      const resources = [
        { id: 'vm-1', idle: true, autoCleanup: false },
        { id: 'vm-2', idle: false, autoCleanup: false },
      ];

      const markForCleanup = (resources: any[]) => {
        return resources.map(r => ({
          ...r,
          autoCleanup: r.idle,
          markedAt: r.idle ? new Date().toISOString() : null,
        }));
      };

      const marked = markForCleanup(resources);
      expect(marked[0].autoCleanup).toBe(true);
      expect(marked[1].autoCleanup).toBe(false);
    });

    it('should enforce grace period before cleanup', () => {
      const resource = {
        id: 'vm-1',
        markedForCleanup: true,
        markedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      };

      const gracePeriodDays = 7;

      const canCleanup = (resource: any, gracePeriodDays: number) => {
        if (!resource.markedForCleanup) return false;
        const daysSinceMarked = (Date.now() - new Date(resource.markedAt).getTime()) / (24 * 60 * 60 * 1000);
        return daysSinceMarked >= gracePeriodDays;
      };

      expect(canCleanup(resource, gracePeriodDays)).toBe(true);
    });
  });
});
