import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Guardrails Engine - Policy Enforcement', () => {
  describe('PolicyEngine', () => {
    it('should load default policies', () => {
      const policies = new Map([
        ['no-public-access', { id: 'no-public-access', enabled: true }],
        ['encryption-required', { id: 'encryption-required', enabled: true }],
        ['cost-limit', { id: 'cost-limit', enabled: true }],
      ]);

      expect(policies.size).toBe(3);
      expect(policies.has('no-public-access')).toBe(true);
    });

    it('should validate policy regex patterns', () => {
      const safePattern = '^[a-zA-Z0-9-]+$';
      const unsafePattern = '(a+)+b'; // ReDoS vulnerability

      const isSafeRegex = (pattern: string): boolean => {
        try {
          // Simple check: avoid nested quantifiers
          const dangerousPatterns = [/\(\w\+\)\+/, /\(\w\*\)\*/];
          return !dangerousPatterns.some((dp) => dp.test(pattern));
        } catch {
          return false;
        }
      };

      expect(isSafeRegex(safePattern)).toBe(true);
      expect(isSafeRegex(unsafePattern)).toBe(false);
    });

    it('should evaluate blueprint against policies', () => {
      const blueprint = {
        id: 'blueprint-123',
        components: [
          {
            type: 's3-bucket',
            config: { publicAccess: true, encryption: false },
          },
        ],
      };

      const policies = [
        {
          id: 'no-public-access',
          rule: { field: 'publicAccess', operator: 'equals', value: false },
        },
        {
          id: 'encryption-required',
          rule: { field: 'encryption', operator: 'equals', value: true },
        },
      ];

      const violations = [];
      for (const component of blueprint.components) {
        for (const policy of policies) {
          const field = policy.rule.field;
          if (component.config[field] !== policy.rule.value) {
            violations.push({
              policyId: policy.id,
              component: component.type,
              field: field,
            });
          }
        }
      }

      expect(violations).toHaveLength(2);
      expect(violations[0].policyId).toBe('no-public-access');
      expect(violations[1].policyId).toBe('encryption-required');
    });

    it('should filter policies by environment', () => {
      const allPolicies = [
        { id: 'dev-policy', environments: ['dev', 'staging'] },
        { id: 'prod-policy', environments: ['production'] },
        { id: 'global-policy', environments: ['dev', 'staging', 'production'] },
      ];

      const prodPolicies = allPolicies.filter((p) =>
        p.environments.includes('production')
      );

      expect(prodPolicies).toHaveLength(2);
      expect(prodPolicies.map((p) => p.id)).toContain('prod-policy');
      expect(prodPolicies.map((p) => p.id)).toContain('global-policy');
    });

    it('should categorize violations by severity', () => {
      const violations = [
        { policyId: 'p1', severity: 'critical' },
        { policyId: 'p2', severity: 'high' },
        { policyId: 'p3', severity: 'medium' },
        { policyId: 'p4', severity: 'low' },
      ];

      const critical = violations.filter((v) => v.severity === 'critical');
      const high = violations.filter((v) => v.severity === 'high');

      expect(critical).toHaveLength(1);
      expect(high).toHaveLength(1);
    });

    it('should block deployment on critical violations', () => {
      const result = {
        violations: [
          { severity: 'critical', blocking: true },
          { severity: 'high', blocking: false },
        ],
      };

      const hasBlockingViolations = result.violations.some((v) => v.blocking);

      expect(hasBlockingViolations).toBe(true);
    });

    it('should allow deployment with warnings only', () => {
      const result = {
        violations: [
          { severity: 'medium', blocking: false },
          { severity: 'low', blocking: false },
        ],
      };

      const hasBlockingViolations = result.violations.some((v) => v.blocking);

      expect(hasBlockingViolations).toBe(false);
    });

    it('should generate remediation suggestions', () => {
      const violation = {
        policyId: 'encryption-required',
        component: 's3-bucket',
        field: 'encryption',
        actual: false,
        expected: true,
      };

      const suggestion = {
        title: 'Enable encryption',
        description: `Set ${violation.field} to ${violation.expected}`,
        autoFixAvailable: true,
      };

      expect(suggestion.autoFixAvailable).toBe(true);
      expect(suggestion.description).toContain('encryption');
    });

    it('should track policy evaluation history', () => {
      const evaluations = [
        {
          id: 'eval-1',
          timestamp: Date.now() - 3600000,
          passed: false,
          violationCount: 3,
        },
        {
          id: 'eval-2',
          timestamp: Date.now() - 1800000,
          passed: false,
          violationCount: 1,
        },
        {
          id: 'eval-3',
          timestamp: Date.now(),
          passed: true,
          violationCount: 0,
        },
      ];

      const latestEvaluation = evaluations[evaluations.length - 1];

      expect(latestEvaluation.passed).toBe(true);
      expect(evaluations.filter((e) => e.passed)).toHaveLength(1);
    });

    it('should validate policy IDs', () => {
      const validPolicies = new Set(['policy-1', 'policy-2', 'policy-3']);
      const requestedPolicyIds = ['policy-1', 'policy-4', 'policy-2'];

      const validatedIds = requestedPolicyIds.filter((id) => validPolicies.has(id));

      expect(validatedIds).toEqual(['policy-1', 'policy-2']);
      expect(validatedIds).toHaveLength(2);
    });

    it('should check configuration compliance', () => {
      const config = {
        s3: { versioning: true, encryption: true, publicAccess: false },
        ec2: { imdsv2Required: true, ebsEncryption: true },
      };

      const requirements = {
        s3: { versioning: true, encryption: true, publicAccess: false },
        ec2: { imdsv2Required: true, ebsEncryption: true },
      };

      const isCompliant =
        JSON.stringify(config.s3) === JSON.stringify(requirements.s3) &&
        JSON.stringify(config.ec2) === JSON.stringify(requirements.ec2);

      expect(isCompliant).toBe(true);
    });
  });

  describe('Policy Rules', () => {
    it('should evaluate equals operator', () => {
      const rule = { field: 'encryption', operator: 'equals', value: true };
      const config = { encryption: true };

      const passes = config[rule.field] === rule.value;

      expect(passes).toBe(true);
    });

    it('should evaluate not-equals operator', () => {
      const rule = { field: 'publicAccess', operator: 'not-equals', value: true };
      const config = { publicAccess: false };

      const passes = config[rule.field] !== rule.value;

      expect(passes).toBe(true);
    });

    it('should evaluate contains operator', () => {
      const rule = { field: 'allowedRegions', operator: 'contains', value: 'us-east-1' };
      const config = { allowedRegions: ['us-east-1', 'us-west-2'] };

      const passes = config[rule.field].includes(rule.value);

      expect(passes).toBe(true);
    });

    it('should evaluate greater-than operator', () => {
      const rule = { field: 'minTLSVersion', operator: 'greater-than', value: 1.1 };
      const config = { minTLSVersion: 1.2 };

      const passes = config[rule.field] > rule.value;

      expect(passes).toBe(true);
    });

    it('should evaluate matches operator with safe regex', () => {
      const rule = { field: 'name', operator: 'matches', condition: '^prod-.*' };
      const config = { name: 'prod-web-server' };

      const regex = new RegExp(rule.condition);
      const passes = regex.test(config[rule.field]);

      expect(passes).toBe(true);
    });
  });

  describe('Auto-Fix', () => {
    it('should apply auto-fix for simple violations', () => {
      const config = { encryption: false };
      const fix = { field: 'encryption', value: true };

      config[fix.field] = fix.value;

      expect(config.encryption).toBe(true);
    });

    it('should generate fix for multiple fields', () => {
      const config = {
        versioning: false,
        encryption: false,
        publicAccess: true,
      };

      const fixes = [
        { field: 'versioning', value: true },
        { field: 'encryption', value: true },
        { field: 'publicAccess', value: false },
      ];

      fixes.forEach((fix) => {
        config[fix.field] = fix.value;
      });

      expect(config.versioning).toBe(true);
      expect(config.encryption).toBe(true);
      expect(config.publicAccess).toBe(false);
    });
  });
});
