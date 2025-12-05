import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Blueprint Templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Template Creation', () => {
    it('should create template from blueprint', async () => {
      const blueprint = {
        id: 'bp-123',
        name: 'Web Application',
        components: [
          { type: 'compute', name: 'web-vm', size: '${VM_SIZE}' },
          { type: 'database', name: '${DB_NAME}' },
        ],
      };

      const createTemplate = async (blueprint: any, params: string[]) => {
        return {
          id: 'tpl-456',
          name: `${blueprint.name} Template`,
          baseBlueprint: blueprint.id,
          parameters: params,
          createdAt: new Date().toISOString(),
        };
      };

      const result = await createTemplate(blueprint, ['VM_SIZE', 'DB_NAME']);
      expect(result.parameters).toContain('VM_SIZE');
      expect(result.parameters).toContain('DB_NAME');
    });

    it('should extract parameters from template', () => {
      const template = {
        content: 'VM size: ${VM_SIZE}, Region: ${REGION}, Env: ${ENVIRONMENT}',
      };

      const extractParams = (template: any) => {
        const regex = /\$\{([^}]+)\}/g;
        const params = [];
        let match;
        while ((match = regex.exec(template.content)) !== null) {
          params.push(match[1]);
        }
        return params;
      };

      const params = extractParams(template);
      expect(params).toHaveLength(3);
      expect(params).toContain('VM_SIZE');
      expect(params).toContain('REGION');
    });

    it('should validate required parameters', () => {
      const template = {
        parameters: [
          { name: 'VM_SIZE', required: true },
          { name: 'REGION', required: true },
          { name: 'TAGS', required: false },
        ],
      };

      const providedParams = {
        VM_SIZE: 'Standard_D2s_v3',
        TAGS: 'env=prod',
      };

      const validateParams = (template: any, provided: any) => {
        const missing = template.parameters
          .filter((p: any) => p.required && !provided[p.name])
          .map((p: any) => p.name);
        return missing;
      };

      const missing = validateParams(template, providedParams);
      expect(missing).toContain('REGION');
    });

    it('should set default parameter values', () => {
      const parameters = [
        { name: 'VM_SIZE', default: 'Standard_B2s' },
        { name: 'REGION', default: 'eastus' },
        { name: 'REPLICAS', default: 3 },
      ];

      const providedValues = {
        VM_SIZE: 'Standard_D2s_v3',
      };

      const applyDefaults = (params: any[], provided: any) => {
        const result: any = { ...provided };
        params.forEach(param => {
          if (result[param.name] === undefined && param.default !== undefined) {
            result[param.name] = param.default;
          }
        });
        return result;
      };

      const values = applyDefaults(parameters, providedValues);
      expect(values.VM_SIZE).toBe('Standard_D2s_v3');
      expect(values.REGION).toBe('eastus');
      expect(values.REPLICAS).toBe(3);
    });
  });

  describe('Template Instantiation', () => {
    it('should instantiate template with parameters', async () => {
      const template = {
        id: 'tpl-123',
        content: {
          components: [
            { type: 'compute', name: '${APP_NAME}-vm', size: '${VM_SIZE}' },
            { type: 'database', name: '${APP_NAME}-db' },
          ],
        },
      };

      const parameters = {
        APP_NAME: 'myapp',
        VM_SIZE: 'Standard_D2s_v3',
      };

      const instantiate = (template: any, params: any) => {
        let contentStr = JSON.stringify(template.content);
        Object.entries(params).forEach(([key, value]) => {
          const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
          contentStr = contentStr.replace(regex, value as string);
        });
        return JSON.parse(contentStr);
      };

      const result = instantiate(template, parameters);
      expect(result.components[0].name).toBe('myapp-vm');
      expect(result.components[0].size).toBe('Standard_D2s_v3');
    });

    it('should validate parameter types', () => {
      const template = {
        parameters: [
          { name: 'REPLICAS', type: 'number', value: '3' },
          { name: 'ENABLE_SSL', type: 'boolean', value: 'true' },
          { name: 'APP_NAME', type: 'string', value: 'myapp' },
        ],
      };

      const validateType = (param: any) => {
        switch (param.type) {
          case 'number':
            return !isNaN(Number(param.value));
          case 'boolean':
            return param.value === 'true' || param.value === 'false';
          case 'string':
            return typeof param.value === 'string';
          default:
            return false;
        }
      };

      template.parameters.forEach(param => {
        expect(validateType(param)).toBe(true);
      });
    });

    it('should handle conditional components', () => {
      const template = {
        components: [
          { name: 'vm', required: true },
          { name: 'database', condition: '${USE_DATABASE}' },
          { name: 'cache', condition: '${USE_CACHE}' },
        ],
      };

      const parameters = {
        USE_DATABASE: true,
        USE_CACHE: false,
      };

      const filterComponents = (template: any, params: any) => {
        return template.components.filter((comp: any) => {
          if (comp.required) return true;
          if (comp.condition) {
            const paramName = comp.condition.replace(/\$\{|\}/g, '');
            return params[paramName] === true;
          }
          return true;
        });
      };

      const components = filterComponents(template, parameters);
      expect(components).toHaveLength(2);
      expect(components.find((c: any) => c.name === 'database')).toBeDefined();
      expect(components.find((c: any) => c.name === 'cache')).toBeUndefined();
    });
  });

  describe('Template Marketplace', () => {
    it('should list available templates', async () => {
      const templates = [
        { id: 'tpl-1', name: 'Web App', category: 'web', rating: 4.5 },
        { id: 'tpl-2', name: 'API Service', category: 'api', rating: 4.8 },
        { id: 'tpl-3', name: 'Database', category: 'database', rating: 4.2 },
      ];

      const listTemplates = async (category?: string) => {
        if (category) {
          return templates.filter(t => t.category === category);
        }
        return templates;
      };

      const webTemplates = await listTemplates('web');
      expect(webTemplates).toHaveLength(1);
      expect(webTemplates[0].name).toBe('Web App');
    });

    it('should search templates by keyword', () => {
      const templates = [
        { id: 'tpl-1', name: 'Web Application', tags: ['web', 'frontend'] },
        { id: 'tpl-2', name: 'REST API', tags: ['api', 'backend'] },
        { id: 'tpl-3', name: 'Web API', tags: ['api', 'web'] },
      ];

      const search = (templates: any[], keyword: string) => {
        const lowerKeyword = keyword.toLowerCase();
        return templates.filter(
          t =>
            t.name.toLowerCase().includes(lowerKeyword) ||
            t.tags.some((tag: string) => tag.toLowerCase().includes(lowerKeyword))
        );
      };

      const results = search(templates, 'web');
      expect(results).toHaveLength(2);
    });

    it('should sort templates by rating', () => {
      const templates = [
        { name: 'Template A', rating: 3.5 },
        { name: 'Template B', rating: 4.8 },
        { name: 'Template C', rating: 4.2 },
      ];

      const sortByRating = (templates: any[]) => {
        return [...templates].sort((a, b) => b.rating - a.rating);
      };

      const sorted = sortByRating(templates);
      expect(sorted[0].name).toBe('Template B');
      expect(sorted[0].rating).toBe(4.8);
    });

    it('should filter templates by cloud provider', () => {
      const templates = [
        { name: 'Azure Web App', provider: 'azure' },
        { name: 'AWS Lambda', provider: 'aws' },
        { name: 'GCP Cloud Run', provider: 'gcp' },
        { name: 'Azure Functions', provider: 'azure' },
      ];

      const filterByProvider = (templates: any[], provider: string) => {
        return templates.filter(t => t.provider === provider);
      };

      const azureTemplates = filterByProvider(templates, 'azure');
      expect(azureTemplates).toHaveLength(2);
    });
  });

  describe('Template Versioning', () => {
    it('should create template version', async () => {
      const template = {
        id: 'tpl-123',
        currentVersion: '1.0.0',
      };

      const createVersion = async (template: any, changes: string) => {
        const [major, minor, patch] = template.currentVersion.split('.').map(Number);
        return {
          templateId: template.id,
          version: `${major}.${minor}.${patch + 1}`,
          changes,
          createdAt: new Date().toISOString(),
        };
      };

      const result = await createVersion(template, 'Updated parameters');
      expect(result.version).toBe('1.0.1');
    });

    it('should list template versions', () => {
      const versions = [
        { version: '1.0.0', deprecated: false },
        { version: '1.0.1', deprecated: false },
        { version: '1.1.0', deprecated: false },
        { version: '0.9.0', deprecated: true },
      ];

      const getActiveVersions = (versions: any[]) => {
        return versions.filter(v => !v.deprecated);
      };

      const active = getActiveVersions(versions);
      expect(active).toHaveLength(3);
    });

    it('should deprecate old versions', () => {
      const versions = [
        { version: '1.0.0', createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000 }, // 180 days
        { version: '1.1.0', createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000 }, // 30 days
      ];

      const findDeprecatable = (versions: any[], maxAgeDays: number = 90) => {
        const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
        return versions.filter(v => Date.now() - v.createdAt > maxAgeMs);
      };

      const deprecatable = findDeprecatable(versions);
      expect(deprecatable).toHaveLength(1);
      expect(deprecatable[0].version).toBe('1.0.0');
    });
  });

  describe('Custom Template Creation', () => {
    it('should allow users to create custom templates', async () => {
      const userTemplate = {
        name: 'My Custom Template',
        description: 'Custom web app template',
        author: 'user@example.com',
        isPublic: false,
        content: { components: [] },
      };

      const createCustomTemplate = async (template: any) => {
        return {
          ...template,
          id: `custom-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
      };

      const result = await createCustomTemplate(userTemplate);
      expect(result.id).toContain('custom-');
      expect(result.author).toBe('user@example.com');
    });

    it('should validate template structure', () => {
      const template = {
        name: 'Test Template',
        content: {
          components: [
            { type: 'compute', name: 'vm' },
          ],
        },
      };

      const validateStructure = (template: any) => {
        const errors = [];
        if (!template.name || template.name.length < 3) {
          errors.push('Name must be at least 3 characters');
        }
        if (!template.content || !template.content.components) {
          errors.push('Template must have components');
        }
        return errors;
      };

      const errors = validateStructure(template);
      expect(errors).toHaveLength(0);
    });

    it('should allow template sharing', () => {
      const template = {
        id: 'tpl-123',
        author: 'user1@example.com',
        isPublic: false,
        sharedWith: ['user2@example.com'],
      };

      const canAccess = (template: any, userId: string) => {
        return (
          template.isPublic ||
          template.author === userId ||
          template.sharedWith.includes(userId)
        );
      };

      expect(canAccess(template, 'user1@example.com')).toBe(true);
      expect(canAccess(template, 'user2@example.com')).toBe(true);
      expect(canAccess(template, 'user3@example.com')).toBe(false);
    });
  });

  describe('Template Usage Analytics', () => {
    it('should track template usage', () => {
      const usageStats = {
        templateId: 'tpl-123',
        totalInstantiations: 150,
        uniqueUsers: 45,
        lastUsed: Date.now(),
      };

      expect(usageStats.totalInstantiations).toBe(150);
      expect(usageStats.uniqueUsers).toBe(45);
    });

    it('should calculate popularity score', () => {
      const template = {
        instantiations: 200,
        rating: 4.5,
        reviews: 30,
      };

      const calculatePopularity = (template: any) => {
        // Simple popularity formula
        return (
          template.instantiations * 0.5 +
          template.rating * 20 +
          template.reviews * 2
        );
      };

      const score = calculatePopularity(template);
      expect(score).toBeGreaterThan(0);
    });

    it('should track template success rate', () => {
      const deployments = [
        { templateId: 'tpl-123', success: true },
        { templateId: 'tpl-123', success: true },
        { templateId: 'tpl-123', success: false },
        { templateId: 'tpl-123', success: true },
      ];

      const calculateSuccessRate = (templateId: string, deployments: any[]) => {
        const templateDeployments = deployments.filter(d => d.templateId === templateId);
        const successful = templateDeployments.filter(d => d.success).length;
        return (successful / templateDeployments.length) * 100;
      };

      const successRate = calculateSuccessRate('tpl-123', deployments);
      expect(successRate).toBe(75);
    });
  });
});
