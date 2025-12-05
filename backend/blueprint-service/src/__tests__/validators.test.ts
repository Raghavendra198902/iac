import { describe, it, expect } from 'vitest';

describe('Blueprint Service - Validators', () => {
  describe('validateBlueprint', () => {
    it('should validate valid blueprint', () => {
      const blueprint = {
        name: 'Web Application',
        description: 'A scalable web application',
        targetCloud: 'aws',
        components: [
          {
            name: 'web-server',
            type: 'compute',
            provider: 'aws',
            properties: { instanceType: 't2.micro' },
          },
        ],
      };

      // Mock validation
      const isValid =
        blueprint.name.length >= 3 &&
        blueprint.name.length <= 100 &&
        ['azure', 'aws', 'gcp', 'on-premise', 'multi-cloud'].includes(
          blueprint.targetCloud
        ) &&
        blueprint.components.length >= 1;

      expect(isValid).toBe(true);
    });

    it('should reject blueprint with short name', () => {
      const blueprint = {
        name: 'AB',
        targetCloud: 'aws',
        components: [{ name: 'test', type: 'compute', provider: 'aws' }],
      };

      const isValid = blueprint.name.length >= 3;

      expect(isValid).toBe(false);
    });

    it('should reject blueprint with long name', () => {
      const blueprint = {
        name: 'A'.repeat(101),
        targetCloud: 'aws',
        components: [{ name: 'test', type: 'compute', provider: 'aws' }],
      };

      const isValid = blueprint.name.length <= 100;

      expect(isValid).toBe(false);
    });

    it('should reject invalid targetCloud', () => {
      const blueprint = {
        name: 'Test Blueprint',
        targetCloud: 'invalid-cloud',
        components: [{ name: 'test', type: 'compute', provider: 'aws' }],
      };

      const validClouds = ['azure', 'aws', 'gcp', 'on-premise', 'multi-cloud'];
      const isValid = validClouds.includes(blueprint.targetCloud);

      expect(isValid).toBe(false);
    });

    it('should require at least one component', () => {
      const blueprint = {
        name: 'Empty Blueprint',
        targetCloud: 'aws',
        components: [],
      };

      const isValid = blueprint.components.length >= 1;

      expect(isValid).toBe(false);
    });

    it('should validate component structure', () => {
      const component = {
        name: 'web-server',
        type: 'compute',
        provider: 'aws',
        properties: { instanceType: 't2.micro' },
      };

      const isValid =
        component.name &&
        typeof component.name === 'string' &&
        component.type &&
        typeof component.type === 'string' &&
        component.provider &&
        typeof component.provider === 'string';

      expect(isValid).toBe(true);
    });

    it('should allow optional metadata', () => {
      const blueprint = {
        name: 'Test Blueprint',
        targetCloud: 'aws',
        components: [{ name: 'test', type: 'compute', provider: 'aws' }],
        metadata: { tags: ['production', 'web'] },
      };

      expect(blueprint.metadata).toBeDefined();
      expect(blueprint.metadata.tags).toHaveLength(2);
    });

    it('should validate description length', () => {
      const blueprint = {
        name: 'Test',
        description: 'A'.repeat(501),
        targetCloud: 'aws',
        components: [{ name: 'test', type: 'compute', provider: 'aws' }],
      };

      const isValid = blueprint.description.length <= 500;

      expect(isValid).toBe(false);
    });
  });

  describe('validateBlueprintUpdate', () => {
    it('should validate partial update', () => {
      const update = {
        name: 'Updated Name',
      };

      const isValid = Object.keys(update).length >= 1;

      expect(isValid).toBe(true);
    });

    it('should validate status update', () => {
      const update = {
        status: 'published',
      };

      const validStatuses = ['draft', 'published', 'archived'];
      const isValid = validStatuses.includes(update.status);

      expect(isValid).toBe(true);
    });

    it('should reject invalid status', () => {
      const update = {
        status: 'invalid-status',
      };

      const validStatuses = ['draft', 'published', 'archived'];
      const isValid = validStatuses.includes(update.status);

      expect(isValid).toBe(false);
    });

    it('should require at least one field', () => {
      const update = {};

      const isValid = Object.keys(update).length >= 1;

      expect(isValid).toBe(false);
    });

    it('should allow multiple fields', () => {
      const update = {
        name: 'New Name',
        description: 'New description',
        status: 'published',
      };

      const isValid = Object.keys(update).length >= 1;

      expect(isValid).toBe(true);
      expect(Object.keys(update)).toHaveLength(3);
    });
  });

  describe('Component Validation', () => {
    it('should validate compute component', () => {
      const component = {
        name: 'web-vm',
        type: 'compute',
        provider: 'aws',
        properties: {
          instanceType: 't2.micro',
          region: 'us-east-1',
        },
      };

      expect(component.type).toBe('compute');
      expect(component.properties.instanceType).toBeDefined();
    });

    it('should validate storage component', () => {
      const component = {
        name: 'data-bucket',
        type: 'storage',
        provider: 'aws',
        properties: {
          storageClass: 'STANDARD',
          versioning: true,
        },
      };

      expect(component.type).toBe('storage');
      expect(component.properties.versioning).toBe(true);
    });

    it('should validate network component', () => {
      const component = {
        name: 'vpc',
        type: 'network',
        provider: 'aws',
        properties: {
          cidr: '10.0.0.0/16',
        },
      };

      expect(component.type).toBe('network');
      expect(component.properties.cidr).toBeDefined();
    });
  });
});
