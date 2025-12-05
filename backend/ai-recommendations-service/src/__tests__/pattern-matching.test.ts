import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Architecture Pattern Matching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Pattern Recognition', () => {
    it('should identify microservices architecture', () => {
      const blueprint = {
        services: [
          { name: 'user-service', type: 'api', dependencies: ['database'] },
          { name: 'order-service', type: 'api', dependencies: ['database', 'message-queue'] },
          { name: 'notification-service', type: 'worker', dependencies: ['message-queue'] },
        ],
        communication: 'rest-api',
      };

      const identifyPattern = (blueprint: any) => {
        if (blueprint.services.length >= 3 && blueprint.services.some((s: any) => s.type === 'api')) {
          return 'microservices';
        }
        return 'monolith';
      };

      const pattern = identifyPattern(blueprint);
      expect(pattern).toBe('microservices');
    });

    it('should identify serverless architecture', () => {
      const blueprint = {
        components: [
          { type: 'lambda', runtime: 'nodejs18.x' },
          { type: 'api-gateway', routes: ['/users', '/orders'] },
          { type: 'dynamodb', tables: ['users', 'orders'] },
        ],
      };

      const isServerless = (blueprint: any) => {
        return blueprint.components.some((c: any) => 
          c.type === 'lambda' || c.type === 'cloud-function'
        );
      };

      expect(isServerless(blueprint)).toBe(true);
    });

    it('should identify event-driven architecture', () => {
      const blueprint = {
        components: [
          { name: 'order-handler', triggers: ['order-created'] },
          { name: 'notification-handler', triggers: ['user-registered', 'order-created'] },
          { name: 'event-bus', type: 'message-queue' },
        ],
      };

      const isEventDriven = (blueprint: any) => {
        return blueprint.components.some((c: any) => c.triggers && c.triggers.length > 0);
      };

      expect(isEventDriven(blueprint)).toBe(true);
    });

    it('should identify three-tier architecture', () => {
      const blueprint = {
        layers: [
          { name: 'presentation', components: ['web-ui', 'api-gateway'] },
          { name: 'application', components: ['business-logic', 'services'] },
          { name: 'data', components: ['database', 'cache'] },
        ],
      };

      const isThreeTier = (blueprint: any) => {
        return blueprint.layers?.length === 3 && 
               blueprint.layers.some((l: any) => l.name === 'presentation') &&
               blueprint.layers.some((l: any) => l.name === 'data');
      };

      expect(isThreeTier(blueprint)).toBe(true);
    });
  });

  describe('Anti-Pattern Detection', () => {
    it('should detect god object anti-pattern', () => {
      const components = [
        { name: 'UserManager', methods: 50, dependencies: 15 },
        { name: 'OrderService', methods: 8, dependencies: 3 },
        { name: 'NotificationService', methods: 5, dependencies: 2 },
      ];

      const detectGodObject = (components: any[]) => {
        return components.filter(c => c.methods > 20 || c.dependencies > 10);
      };

      const godObjects = detectGodObject(components);
      expect(godObjects).toHaveLength(1);
      expect(godObjects[0].name).toBe('UserManager');
    });

    it('should detect circular dependencies', () => {
      const dependencies: any = {
        'service-a': ['service-b'],
        'service-b': ['service-c'],
        'service-c': ['service-a'], // Circular!
      };

      const detectCircular = (deps: any) => {
        const visiting = new Set<string>();
        const hasCycle = (service: string): boolean => {
          if (visiting.has(service)) return true;
          visiting.add(service);
          const serviceDeps = deps[service] || [];
          for (const dep of serviceDeps) {
            if (hasCycle(dep)) return true;
          }
          visiting.delete(service);
          return false;
        };

        return Object.keys(deps).some(service => hasCycle(service));
      };

      expect(detectCircular(dependencies)).toBe(true);
    });

    it('should detect hardcoded credentials', () => {
      const config = {
        database: {
          host: 'localhost',
          username: 'admin',
          password: 'password123', // Hardcoded!
        },
        apiKey: 'sk-1234567890abcdef',
      };

      const detectHardcodedSecrets = (config: any) => {
        const secrets: string[] = [];
        const check = (obj: any, path: string = '') => {
          for (const key in obj) {
            const fullPath = path ? `${path}.${key}` : key;
            if (typeof obj[key] === 'string') {
              if (key.toLowerCase().includes('password') || 
                  key.toLowerCase().includes('secret') ||
                  key.toLowerCase().includes('apikey')) {
                secrets.push(fullPath);
              }
            } else if (typeof obj[key] === 'object') {
              check(obj[key], fullPath);
            }
          }
        };
        check(config);
        return secrets;
      };

      const found = detectHardcodedSecrets(config);
      expect(found).toContain('database.password');
      expect(found).toContain('apiKey');
    });

    it('should detect missing error handling', () => {
      const functions = [
        { name: 'fetchData', hasTryCatch: true, hasErrorHandling: true },
        { name: 'processOrder', hasTryCatch: false, hasErrorHandling: false },
        { name: 'sendNotification', hasTryCatch: true, hasErrorHandling: true },
      ];

      const missingErrorHandling = functions.filter(f => !f.hasTryCatch || !f.hasErrorHandling);
      expect(missingErrorHandling).toHaveLength(1);
      expect(missingErrorHandling[0].name).toBe('processOrder');
    });
  });

  describe('Best Practice Suggestions', () => {
    it('should suggest naming convention improvements', () => {
      const components = [
        { name: 'userservice' }, // Should be UserService or user-service
        { name: 'Order_Handler' }, // Inconsistent
        { name: 'notification-service' }, // Good
      ];

      const checkNaming = (name: string) => {
        const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(name);
        const isKebabCase = /^[a-z][a-z0-9-]*$/.test(name);
        return { isPascalCase, isKebabCase, consistent: isPascalCase || isKebabCase };
      };

      const userService = checkNaming(components[0].name);
      expect(userService.consistent).toBe(false);

      const notificationService = checkNaming(components[2].name);
      expect(notificationService.consistent).toBe(true);
    });

    it('should suggest resource right-sizing', () => {
      const resources = [
        { name: 'web-server', cpu: '8 cores', memory: '32GB', avgCpuUsage: 15, avgMemUsage: 20 },
        { name: 'api-server', cpu: '4 cores', memory: '16GB', avgCpuUsage: 65, avgMemUsage: 70 },
      ];

      const getRightSizingSuggestions = (resource: any) => {
        const suggestions: string[] = [];
        if (resource.avgCpuUsage < 30) {
          suggestions.push('CPU is underutilized - consider downsizing');
        }
        if (resource.avgMemUsage < 30) {
          suggestions.push('Memory is underutilized - consider downsizing');
        }
        return suggestions;
      };

      const webServerSuggestions = getRightSizingSuggestions(resources[0]);
      expect(webServerSuggestions.length).toBeGreaterThan(0);
      expect(webServerSuggestions[0]).toContain('underutilized');
    });

    it('should suggest security improvements', () => {
      const service = {
        name: 'api-service',
        encryption: false,
        authentication: true,
        publicAccess: true,
        logging: false,
      };

      const getSecuritySuggestions = (service: any) => {
        const suggestions: string[] = [];
        if (!service.encryption) suggestions.push('Enable encryption at rest and in transit');
        if (service.publicAccess) suggestions.push('Consider restricting public access');
        if (!service.logging) suggestions.push('Enable audit logging');
        return suggestions;
      };

      const suggestions = getSecuritySuggestions(service);
      expect(suggestions).toHaveLength(3);
      expect(suggestions).toContain('Enable encryption at rest and in transit');
    });
  });

  describe('Similarity Scoring', () => {
    it('should compare blueprint similarity', () => {
      const blueprint1 = {
        services: ['web', 'api', 'database'],
        provider: 'aws',
        features: ['load-balancing', 'auto-scaling'],
      };

      const blueprint2 = {
        services: ['web', 'api', 'cache', 'database'],
        provider: 'aws',
        features: ['load-balancing', 'monitoring'],
      };

      const calculateSimilarity = (bp1: any, bp2: any) => {
        const commonServices = bp1.services.filter((s: string) => bp2.services.includes(s)).length;
        const totalServices = new Set([...bp1.services, ...bp2.services]).size;
        const serviceSimilarity = commonServices / totalServices;

        const providerMatch = bp1.provider === bp2.provider ? 1 : 0;
        
        const commonFeatures = bp1.features.filter((f: string) => bp2.features.includes(f)).length;
        const totalFeatures = new Set([...bp1.features, ...bp2.features]).size;
        const featureSimilarity = commonFeatures / totalFeatures;

        return ((serviceSimilarity * 0.5) + (providerMatch * 0.2) + (featureSimilarity * 0.3));
      };

      const similarity = calculateSimilarity(blueprint1, blueprint2);
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThan(1);
    });

    it('should find similar patterns', () => {
      const patterns = [
        { id: '1', name: 'Web App', services: ['web', 'api', 'db'], score: 0 },
        { id: '2', name: 'Mobile Backend', services: ['api', 'db', 'cache'], score: 0 },
        { id: '3', name: 'E-commerce', services: ['web', 'api', 'db', 'queue'], score: 0 },
      ];

      const query = { services: ['web', 'api', 'db'] };

      const findSimilar = (query: any, patterns: any[]) => {
        return patterns.map(p => {
          const common = p.services.filter((s: string) => query.services.includes(s)).length;
          const similarity = common / Math.max(p.services.length, query.services.length);
          return { ...p, score: similarity };
        }).sort((a, b) => b.score - a.score);
      };

      const results = findSimilar(query, patterns);
      expect(results[0].name).toBe('Web App'); // Exact match
      expect(results[0].score).toBe(1);
    });
  });

  describe('Pattern Templates', () => {
    it('should retrieve pattern template', () => {
      const templates: any = {
        'three-tier-web': {
          name: 'Three-Tier Web Application',
          layers: ['presentation', 'application', 'data'],
          components: {
            presentation: ['load-balancer', 'web-server'],
            application: ['app-server', 'api-gateway'],
            data: ['database', 'cache'],
          },
        },
      };

      const getTemplate = (patternId: string) => templates[patternId];

      const template = getTemplate('three-tier-web');
      expect(template.name).toBe('Three-Tier Web Application');
      expect(template.layers).toHaveLength(3);
    });

    it('should apply pattern template', () => {
      const template = {
        components: [
          { type: 'web-server', count: 2 },
          { type: 'database', count: 1 },
        ],
      };

      const applyTemplate = (template: any, config: any) => {
        return template.components.map((comp: any) => ({
          ...comp,
          ...config,
        }));
      };

      const config = { region: 'us-east-1', environment: 'production' };
      const result = applyTemplate(template, config);

      expect(result[0].region).toBe('us-east-1');
      expect(result[0].type).toBe('web-server');
    });

    it('should validate template compatibility', () => {
      const template = {
        requiredFeatures: ['load-balancing', 'auto-scaling'],
        supportedProviders: ['aws', 'azure'],
      };

      const blueprint = {
        provider: 'aws',
        features: ['load-balancing', 'monitoring'],
      };

      const isCompatible = (template: any, blueprint: any) => {
        const providerSupported = template.supportedProviders.includes(blueprint.provider);
        const hasRequiredFeatures = template.requiredFeatures.every((f: string) => 
          blueprint.features.includes(f)
        );
        return providerSupported && hasRequiredFeatures;
      };

      expect(isCompatible(template, blueprint)).toBe(false); // Missing auto-scaling
    });
  });

  describe('Custom Pattern Definition', () => {
    it('should define custom pattern', () => {
      const customPattern = {
        id: 'custom-1',
        name: 'Custom Microservices',
        rules: [
          { type: 'service-count', min: 3, max: 10 },
          { type: 'communication', allowed: ['rest', 'grpc'] },
          { type: 'required-component', value: 'api-gateway' },
        ],
      };

      expect(customPattern.rules).toHaveLength(3);
      expect(customPattern.rules[0].min).toBe(3);
    });

    it('should validate against custom pattern', () => {
      const pattern = {
        rules: [
          { type: 'service-count', min: 2, max: 5 },
          { type: 'has-database', required: true },
        ],
      };

      const blueprint = {
        services: ['web', 'api', 'worker'],
        components: ['database', 'cache'],
      };

      const validatePattern = (blueprint: any, pattern: any) => {
        const errors: string[] = [];
        
        pattern.rules.forEach((rule: any) => {
          if (rule.type === 'service-count') {
            const count = blueprint.services.length;
            if (count < rule.min || count > rule.max) {
              errors.push(`Service count ${count} outside range ${rule.min}-${rule.max}`);
            }
          }
          if (rule.type === 'has-database') {
            if (rule.required && !blueprint.components.includes('database')) {
              errors.push('Database component is required');
            }
          }
        });
        
        return { valid: errors.length === 0, errors };
      };

      const result = validatePattern(blueprint, pattern);
      expect(result.valid).toBe(true);
    });

    it('should match patterns with regex', () => {
      const pattern = /^(user|order|product)-service$/;

      const services = [
        'user-service',
        'order-service',
        'invalid-name',
        'product-service',
      ];

      const matching = services.filter(s => pattern.test(s));
      expect(matching).toHaveLength(3);
      expect(matching).not.toContain('invalid-name');
    });
  });
});
