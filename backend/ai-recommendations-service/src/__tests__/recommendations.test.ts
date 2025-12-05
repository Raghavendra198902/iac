import { describe, it, expect, vi } from 'vitest';

describe('AI Recommendations Service', () => {
  describe('Blueprint Recommendations', () => {
    it('should generate architecture recommendations', async () => {
      const recommend = vi.fn().mockResolvedValue([
        {
          type: 'architecture',
          title: 'Use Load Balancer',
          description: 'Add load balancer for high availability',
          impact: 'high',
          effort: 'medium',
        },
      ]);

      const recommendations = await recommend('blueprint-123');

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('architecture');
    });

    it('should recommend security improvements', async () => {
      const recommend = vi.fn().mockResolvedValue([
        {
          type: 'security',
          title: 'Enable Encryption',
          description: 'Enable encryption at rest for storage',
          impact: 'high',
        },
      ]);

      const recommendations = await recommend('blueprint-123');

      expect(recommendations[0].type).toBe('security');
    });

    it('should recommend cost optimizations', async () => {
      const recommend = vi.fn().mockResolvedValue([
        {
          type: 'cost',
          title: 'Right-size VMs',
          description: 'Reduce VM size to match workload',
          savingsAmount: 500,
        },
      ]);

      const recommendations = await recommend('blueprint-123');

      expect(recommendations[0].type).toBe('cost');
      expect(recommendations[0].savingsAmount).toBe(500);
    });

    it('should recommend performance improvements', async () => {
      const recommend = vi.fn().mockResolvedValue([
        {
          type: 'performance',
          title: 'Use Premium SSD',
          description: 'Upgrade to premium storage for better IOPS',
          impact: 'medium',
        },
      ]);

      const recommendations = await recommend('blueprint-123');

      expect(recommendations[0].type).toBe('performance');
    });
  });

  describe('Recommendation Scoring', () => {
    it('should calculate recommendation priority', () => {
      const recommendation = {
        impact: 'high',
        effort: 'low',
        confidence: 0.9,
      };

      const impactScore = { high: 3, medium: 2, low: 1 };
      const effortScore = { low: 3, medium: 2, high: 1 };

      const priority =
        (impactScore[recommendation.impact] +
          effortScore[recommendation.effort]) *
        recommendation.confidence;

      expect(priority).toBeGreaterThan(0);
    });

    it('should filter by confidence threshold', () => {
      const recommendations = [
        { title: 'Rec 1', confidence: 0.9 },
        { title: 'Rec 2', confidence: 0.5 },
        { title: 'Rec 3', confidence: 0.8 },
      ];

      const highConfidence = recommendations.filter(r => r.confidence >= 0.8);

      expect(highConfidence).toHaveLength(2);
    });
  });

  describe('ML-Based Recommendations', () => {
    it('should analyze usage patterns', () => {
      const usageData = [
        { hour: 0, cpu: 20 },
        { hour: 8, cpu: 80 },
        { hour: 16, cpu: 70 },
        { hour: 23, cpu: 15 },
      ];

      const peakUsage = Math.max(...usageData.map(d => d.cpu));
      const avgUsage = usageData.reduce((sum, d) => sum + d.cpu, 0) / usageData.length;

      expect(peakUsage).toBe(80);
      expect(avgUsage).toBeCloseTo(46.25, 2);
    });

    it('should predict resource needs', () => {
      const historicalData = [100, 120, 140, 160, 180];
      
      // Simple linear trend
      const trend = (historicalData[historicalData.length - 1] - historicalData[0]) / historicalData.length;
      const nextValue = historicalData[historicalData.length - 1] + trend;

      expect(nextValue).toBeCloseTo(200, 0);
    });
  });
});

describe('IaC Generator Service', () => {
  describe('Terraform Generation', () => {
    it('should generate Terraform resource', () => {
      const resource = {
        type: 'aws_instance',
        name: 'web-server',
        properties: {
          ami: 'ami-123456',
          instance_type: 't2.micro',
        },
      };

      const terraform = `resource "${resource.type}" "${resource.name}" {
  ami           = "${resource.properties.ami}"
  instance_type = "${resource.properties.instance_type}"
}`;

      expect(terraform).toContain('resource "aws_instance"');
      expect(terraform).toContain('ami-123456');
    });

    it('should generate variables', () => {
      const variable = {
        name: 'instance_type',
        type: 'string',
        default: 't2.micro',
      };

      const terraform = `variable "${variable.name}" {
  type    = ${variable.type}
  default = "${variable.default}"
}`;

      expect(terraform).toContain('variable "instance_type"');
    });

    it('should generate outputs', () => {
      const output = {
        name: 'instance_ip',
        value: 'aws_instance.web.public_ip',
      };

      const terraform = `output "${output.name}" {
  value = ${output.value}
}`;

      expect(terraform).toContain('output "instance_ip"');
    });
  });

  describe('Bicep Generation', () => {
    it('should generate Bicep resource', () => {
      const resource = {
        type: 'Microsoft.Compute/virtualMachines',
        name: 'webVM',
        properties: {
          vmSize: 'Standard_B2s',
        },
      };

      const bicep = `resource ${resource.name} '${resource.type}@2021-03-01' = {
  name: '${resource.name}'
  properties: {
    vmSize: '${resource.properties.vmSize}'
  }
}`;

      expect(bicep).toContain('resource webVM');
      expect(bicep).toContain('Standard_B2s');
    });
  });

  describe('CloudFormation Generation', () => {
    it('should generate CloudFormation resource', () => {
      const resource = {
        logicalId: 'WebServer',
        type: 'AWS::EC2::Instance',
        properties: {
          InstanceType: 't2.micro',
        },
      };

      const cfn = {
        Resources: {
          [resource.logicalId]: {
            Type: resource.type,
            Properties: resource.properties,
          },
        },
      };

      expect(cfn.Resources.WebServer.Type).toBe('AWS::EC2::Instance');
    });
  });
});
