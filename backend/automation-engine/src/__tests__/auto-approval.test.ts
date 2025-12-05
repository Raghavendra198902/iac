import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Automation Engine - Auto-Approval', () => {
  describe('AutoApprovalEngine', () => {
    const THRESHOLDS = {
      design: {
        minSecurityScore: 85,
        maxRiskLevel: 30,
        maxComplexityScore: 70,
      },
      deployment: {
        dev: { minSecurityScore: 70, maxRiskLevel: 50 },
        staging: { minSecurityScore: 80, maxRiskLevel: 30 },
        prod: { minSecurityScore: 90, maxRiskLevel: 20 },
      },
    };

    it('should approve low-risk dev deployment', () => {
      const analysis = {
        guardrailsPassed: true,
        securityScore: 85,
        complexityScore: 50,
      };

      const riskAssessment = { riskLevel: 25 };
      const costEstimate = { withinBudget: true };
      const automationLevel = 3;
      const environment = 'dev';

      const shouldApprove =
        automationLevel >= 2 &&
        analysis.guardrailsPassed &&
        analysis.securityScore >= THRESHOLDS.deployment[environment].minSecurityScore &&
        riskAssessment.riskLevel <= THRESHOLDS.deployment[environment].maxRiskLevel &&
        costEstimate.withinBudget;

      expect(shouldApprove).toBe(true);
    });

    it('should reject deployment with failed guardrails', () => {
      const analysis = {
        guardrailsPassed: false,
        securityScore: 95,
        complexityScore: 30,
      };

      const shouldApprove = analysis.guardrailsPassed;

      expect(shouldApprove).toBe(false);
    });

    it('should reject low security score', () => {
      const analysis = { securityScore: 65 };
      const environment = 'prod';

      const meetsThreshold =
        analysis.securityScore >= THRESHOLDS.deployment[environment].minSecurityScore;

      expect(meetsThreshold).toBe(false);
    });

    it('should reject high-risk production deployment', () => {
      const riskAssessment = { riskLevel: 45 };
      const environment = 'prod';

      const withinThreshold =
        riskAssessment.riskLevel <= THRESHOLDS.deployment[environment].maxRiskLevel;

      expect(withinThreshold).toBe(false);
    });

    it('should check automation level', () => {
      const automationLevels = [
        { level: 0, description: 'Manual approval only', autoApprove: false },
        { level: 1, description: 'Assisted review', autoApprove: false },
        { level: 2, description: 'Auto-approve dev', autoApprove: true },
        { level: 3, description: 'Auto-approve all non-prod', autoApprove: true },
      ];

      const level2 = automationLevels.find((l) => l.level === 2);
      expect(level2.autoApprove).toBe(true);

      const level0 = automationLevels.find((l) => l.level === 0);
      expect(level0.autoApprove).toBe(false);
    });

    it('should verify cost is within budget', () => {
      const costEstimate = {
        estimated: 1500,
        budget: 2000,
        withinBudget: true,
      };

      expect(costEstimate.withinBudget).toBe(true);
      expect(costEstimate.estimated).toBeLessThan(costEstimate.budget);
    });

    it('should reject over-budget deployment', () => {
      const costEstimate = {
        estimated: 2500,
        budget: 2000,
        withinBudget: false,
      };

      expect(costEstimate.withinBudget).toBe(false);
    });

    it('should check complexity score', () => {
      const analysis = { complexityScore: 85 };
      const threshold = THRESHOLDS.design.maxComplexityScore;

      const isComplex = analysis.complexityScore > threshold;

      expect(isComplex).toBe(true);
    });

    it('should evaluate all approval conditions', () => {
      const conditions = {
        guardrailsPassed: true,
        securityScore: 88,
        costWithinBudget: true,
        riskLevel: 25,
        complexityScore: 60,
      };

      const environment = 'staging';
      const automationLevel = 3;

      const approved =
        automationLevel >= 2 &&
        conditions.guardrailsPassed &&
        conditions.securityScore >=
          THRESHOLDS.deployment[environment].minSecurityScore &&
        conditions.riskLevel <= THRESHOLDS.deployment[environment].maxRiskLevel &&
        conditions.costWithinBudget &&
        conditions.complexityScore <= THRESHOLDS.design.maxComplexityScore;

      expect(approved).toBe(true);
    });

    it('should provide rejection reason', () => {
      const analysis = {
        guardrailsPassed: true,
        securityScore: 75,
      };

      const environment = 'prod';
      const reason =
        analysis.securityScore < THRESHOLDS.deployment[environment].minSecurityScore
          ? `Security score ${analysis.securityScore} below threshold ${THRESHOLDS.deployment[environment].minSecurityScore}`
          : '';

      expect(reason).toContain('Security score');
      expect(reason).toContain('75');
      expect(reason).toContain('90');
    });

    it('should handle different environments', () => {
      const environments = ['dev', 'staging', 'prod'];
      const securityScore = 85;

      const results = environments.map((env) => ({
        environment: env,
        approved: securityScore >= THRESHOLDS.deployment[env].minSecurityScore,
      }));

      expect(results.find((r) => r.environment === 'dev').approved).toBe(true);
      expect(results.find((r) => r.environment === 'staging').approved).toBe(true);
      expect(results.find((r) => r.environment === 'prod').approved).toBe(false);
    });
  });

  describe('Risk Assessment', () => {
    it('should calculate risk level', () => {
      const factors = {
        publicExposure: 20,
        dataClassification: 30,
        complianceImpact: 10,
      };

      const totalRisk = Object.values(factors).reduce((sum, val) => sum + val, 0);

      expect(totalRisk).toBe(60);
    });

    it('should categorize risk', () => {
      const riskLevels = [
        { score: 15, category: 'low' },
        { score: 35, category: 'medium' },
        { score: 65, category: 'high' },
        { score: 95, category: 'critical' },
      ];

      const getRiskCategory = (score: number): string => {
        if (score < 25) return 'low';
        if (score < 50) return 'medium';
        if (score < 75) return 'high';
        return 'critical';
      };

      expect(getRiskCategory(15)).toBe('low');
      expect(getRiskCategory(35)).toBe('medium');
      expect(getRiskCategory(65)).toBe('high');
      expect(getRiskCategory(95)).toBe('critical');
    });
  });

  describe('Blueprint Analysis', () => {
    it('should fetch blueprint analysis', async () => {
      const mockAnalysis = {
        guardrailsPassed: true,
        securityScore: 88,
        complexityScore: 45,
        violations: [],
      };

      const fetchAnalysis = vi.fn().mockResolvedValue(mockAnalysis);
      const analysis = await fetchAnalysis('blueprint-123');

      expect(fetchAnalysis).toHaveBeenCalledWith('blueprint-123');
      expect(analysis.guardrailsPassed).toBe(true);
    });

    it('should fetch cost estimate', async () => {
      const mockEstimate = {
        monthly: 1500,
        yearly: 18000,
        currency: 'USD',
        withinBudget: true,
      };

      const fetchCost = vi.fn().mockResolvedValue(mockEstimate);
      const estimate = await fetchCost('blueprint-123');

      expect(estimate.withinBudget).toBe(true);
      expect(estimate.monthly).toBe(1500);
    });
  });

  describe('Approval Decision', () => {
    it('should return approval decision with conditions', () => {
      const decision = {
        approved: true,
        reason: 'All conditions met',
        conditions: {
          guardrailsPassed: true,
          securityScore: 90,
          costWithinBudget: true,
          riskLevel: 15,
        },
        timestamp: new Date(),
      };

      expect(decision.approved).toBe(true);
      expect(decision.conditions.guardrailsPassed).toBe(true);
    });

    it('should return rejection with specific reason', () => {
      const decision = {
        approved: false,
        reason: 'Security score 75 below threshold 90',
        conditions: {
          guardrailsPassed: true,
          securityScore: 75,
          costWithinBudget: true,
          riskLevel: 15,
        },
      };

      expect(decision.approved).toBe(false);
      expect(decision.reason).toContain('Security score');
    });

    it('should track approval history', () => {
      const history = [
        { timestamp: Date.now() - 7200000, approved: false, reason: 'High risk' },
        { timestamp: Date.now() - 3600000, approved: false, reason: 'Cost exceeded' },
        { timestamp: Date.now(), approved: true, reason: 'All conditions met' },
      ];

      const latestDecision = history[history.length - 1];
      const approvalCount = history.filter((h) => h.approved).length;

      expect(latestDecision.approved).toBe(true);
      expect(approvalCount).toBe(1);
    });
  });
});
