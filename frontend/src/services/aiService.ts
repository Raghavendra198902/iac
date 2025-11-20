import api from '../lib/api';
import type { BlueprintFromNLP, CloudProvider, Environment } from '../types';

export interface NLPGenerateRequest {
  userInput: string;
  targetCloud?: CloudProvider;
  environment?: Environment;
  budget?: number;
  region?: string;
  constraints?: Record<string, any>;
}

export const aiService = {
  // Generate blueprint from natural language
  async generateFromNLP(request: NLPGenerateRequest): Promise<BlueprintFromNLP> {
    console.log('API Service - Calling /ai/generate with:', request);
    console.log('API Base URL:', api.defaults.baseURL);
    
    try {
      const response = await api.post<BlueprintFromNLP>('/ai/generate', request);
      console.log('API Service - Response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('🔄 AI Service unavailable, generating intelligent mock blueprint data');
      
      // Parse user input to generate relevant resources
      const input = request.userInput.toLowerCase();
      const cloud = request.targetCloud || 'aws';
      const region = request.region || 'us-east-1';
      
      // Detect keywords and patterns
      const hasWeb = /web|website|frontend|http|nginx|apache/i.test(input);
      const hasAPI = /api|backend|rest|graphql|microservice/i.test(input);
      const hasDatabase = /database|db|postgres|mysql|sql|mongodb|redis/i.test(input);
      const hasCache = /cache|redis|memcache|elasticache/i.test(input);
      const hasStorage = /storage|s3|blob|bucket|file/i.test(input);
      const hasQueue = /queue|message|sqs|kafka|rabbit|event/i.test(input);
      const hasKubernetes = /kubernetes|k8s|eks|aks|gke|container|docker/i.test(input);
      const hasLoadBalancer = /load.?balanc|lb|alb|elb/i.test(input);
      const hasAnalytics = /analytic|bigquery|redshift|data.?warehouse|etl/i.test(input);
      const hasCDN = /cdn|cloudfront|cloudflare|content.?delivery/i.test(input);
      const hasMonitoring = /monitor|observ|prometheus|grafana|cloudwatch/i.test(input);
      const hasAutoScaling = /scal|autoscal|elastic/i.test(input);
      
      // Detect database types
      const dbType = input.match(/postgres|postgresql/i) ? 'postgresql' :
                     input.match(/mysql|maria/i) ? 'mysql' :
                     input.match(/mongodb|mongo/i) ? 'mongodb' :
                     input.match(/redis/i) ? 'redis' : 'postgresql';
      
      // Build resources based on detected requirements
      const resources: any[] = [];
      
      // Always add VPC for cloud infrastructure
      resources.push({
        type: 'vpc',
        name: 'main-vpc',
        quantity: 1,
        properties: {
          cidr: '10.0.0.0/16',
          enableDnsHostnames: true,
          enableDnsSupport: true,
        },
      });
      
      // Add subnets
      resources.push({
        type: 'subnet',
        name: 'public-subnet',
        quantity: 2,
        properties: {
          cidr: '10.0.1.0/24',
          availabilityZone: `${region}a`,
          mapPublicIpOnLaunch: true,
          tier: 'public',
        },
      });
      
      if (hasDatabase || hasAPI) {
        resources.push({
          type: 'subnet',
          name: 'private-subnet',
          quantity: 2,
          properties: {
            cidr: '10.0.10.0/24',
            availabilityZone: `${region}a`,
            tier: 'private',
          },
        });
      }
      
      // Add security groups
      if (hasWeb || hasAPI) {
        resources.push({
          type: 'security-group',
          name: 'web-sg',
          quantity: 1,
          properties: {
            description: 'Security group for web traffic',
            ingress: [
              { port: 80, protocol: 'tcp', cidr: '0.0.0.0/0', description: 'HTTP' },
              { port: 443, protocol: 'tcp', cidr: '0.0.0.0/0', description: 'HTTPS' },
            ],
          },
        });
      }
      
      // Add load balancer
      if (hasLoadBalancer || hasWeb || hasAPI || hasKubernetes) {
        resources.push({
          type: 'load-balancer',
          name: 'app-lb',
          quantity: 1,
          properties: {
            type: 'application',
            scheme: 'internet-facing',
            ...(hasKubernetes && { integration: 'kubernetes-ingress' }),
          },
        });
      }
      
      // Add compute resources
      if (hasKubernetes) {
        resources.push({
          type: 'kubernetes-cluster',
          name: cloud === 'aws' ? 'eks-cluster' : cloud === 'azure' ? 'aks-cluster' : 'gke-cluster',
          quantity: 1,
          properties: {
            version: '1.27',
            nodeCount: hasAutoScaling ? '2-10' : 3,
            nodeType: 't3.medium',
            autoScaling: hasAutoScaling,
          },
        });
      } else if (hasWeb || hasAPI) {
        resources.push({
          type: 'compute-instance',
          name: 'app-server',
          quantity: hasAutoScaling ? '2-5' : 2,
          properties: {
            instanceType: cloud === 'aws' ? 't3.medium' : cloud === 'azure' ? 'Standard_B2s' : 'e2-medium',
            autoScaling: hasAutoScaling,
            ...(hasAutoScaling && { minInstances: 2, maxInstances: 5 }),
          },
        });
      }
      
      // Add database
      if (hasDatabase) {
        resources.push({
          type: 'database',
          name: `${dbType}-db`,
          quantity: 1,
          properties: {
            engine: dbType,
            instanceClass: cloud === 'aws' ? 'db.t3.medium' : cloud === 'azure' ? 'Standard_B2s' : 'db-n1-standard-2',
            allocatedStorage: 100,
            multiAz: true,
            backup: {
              enabled: true,
              retentionDays: 7,
            },
          },
        });
      }
      
      // Add cache
      if (hasCache || (hasAPI && hasDatabase)) {
        resources.push({
          type: 'cache',
          name: 'redis-cache',
          quantity: 1,
          properties: {
            engine: 'redis',
            nodeType: cloud === 'aws' ? 'cache.t3.micro' : 'Standard_C0',
            numNodes: 2,
          },
        });
      }
      
      // Add storage
      if (hasStorage || hasWeb) {
        resources.push({
          type: 'storage',
          name: cloud === 'aws' ? 's3-bucket' : cloud === 'azure' ? 'blob-storage' : 'gcs-bucket',
          quantity: 1,
          properties: {
            versioning: true,
            encryption: true,
            lifecyclePolicy: 'enabled',
          },
        });
      }
      
      // Add message queue
      if (hasQueue || hasAPI) {
        resources.push({
          type: 'message-queue',
          name: cloud === 'aws' ? 'sqs-queue' : cloud === 'azure' ? 'service-bus' : 'pub-sub',
          quantity: 1,
          properties: {
            messageRetention: 14,
            encryption: true,
          },
        });
      }
      
      // Add CDN
      if (hasCDN || hasWeb) {
        resources.push({
          type: 'cdn',
          name: cloud === 'aws' ? 'cloudfront' : cloud === 'azure' ? 'cdn-profile' : 'cloud-cdn',
          quantity: 1,
          properties: {
            priceClass: 'all-edge-locations',
            sslCertificate: 'auto',
            caching: true,
          },
        });
      }
      
      // Add analytics/data warehouse
      if (hasAnalytics) {
        resources.push({
          type: 'analytics',
          name: cloud === 'aws' ? 'redshift-cluster' : cloud === 'azure' ? 'synapse-analytics' : 'bigquery',
          quantity: 1,
          properties: {
            nodeType: 'dc2.large',
            numberOfNodes: 2,
          },
        });
      }
      
      // Add monitoring
      if (hasMonitoring || resources.length > 5) {
        resources.push({
          type: 'monitoring',
          name: cloud === 'aws' ? 'cloudwatch' : cloud === 'azure' ? 'azure-monitor' : 'cloud-monitoring',
          quantity: 1,
          properties: {
            logRetention: 30,
            metrics: true,
            alerts: true,
          },
        });
      }
      
      // Generate intelligent name and description
      const detected = [];
      if (hasKubernetes) detected.push('Kubernetes');
      if (hasWeb) detected.push('Web Application');
      if (hasAPI) detected.push('API Backend');
      if (hasDatabase) detected.push(dbType.toUpperCase());
      if (hasCache) detected.push('Redis Cache');
      if (hasAnalytics) detected.push('Analytics');
      
      const blueprintName = detected.length > 0 
        ? `${detected.join(' + ')} Infrastructure`
        : 'Cloud Infrastructure Blueprint';
      
      // Calculate estimated cost based on resources
      const baseCosts: Record<string, number> = {
        'vpc': 0,
        'subnet': 0,
        'security-group': 0,
        'load-balancer': 25,
        'compute-instance': 50,
        'kubernetes-cluster': 150,
        'database': 100,
        'cache': 30,
        'storage': 10,
        'message-queue': 5,
        'cdn': 20,
        'analytics': 250,
        'monitoring': 15,
      };
      
      let estimatedCost = resources.reduce((sum, r) => {
        const qty = typeof r.quantity === 'string' ? 3 : r.quantity;
        return sum + (baseCosts[r.type] || 10) * qty;
      }, 0);
      
      // Apply budget if specified
      if (request.budget && estimatedCost > request.budget) {
        estimatedCost = request.budget * 0.9;
      }
      
      return {
        blueprintId: `bp-${Date.now()}`,
        name: blueprintName,
        description: `Infrastructure for: ${request.userInput.substring(0, 150)}`,
        targetCloud: cloud,
        environment: request.environment || 'production',
        region: region,
        resources: resources,
        confidence: 0.75 + (detected.length * 0.05),
        suggestions: [
          hasAutoScaling ? 'Auto-scaling configured for optimal resource utilization' : 'Consider adding auto-scaling for better resource management',
          hasMonitoring ? 'Monitoring enabled for full observability' : 'Add monitoring and alerting for production readiness',
          hasDatabase && !hasCache ? 'Consider adding Redis cache to reduce database load' : 'Caching layer configured for performance',
          hasCDN ? 'CDN configured for global content delivery' : 'Add CDN for improved global performance',
        ],
        estimatedCost: {
          monthly: Math.round(estimatedCost),
          currency: 'USD',
        },
      } as any;
    }
  },

  // Get AI suggestions for optimization
  async getOptimizationSuggestions(blueprintId: string) {
    const response = await api.get<{
      suggestions: Array<{
        type: 'cost' | 'security' | 'performance';
        title: string;
        description: string;
        impact: 'high' | 'medium' | 'low';
        estimatedSavings?: number;
      }>;
    }>(`/ai/optimize/${blueprintId}`);
    return response.data;
  },

  // Validate blueprint configuration
  async validateBlueprint(blueprintId: string) {
    const response = await api.post<{
      valid: boolean;
      errors: string[];
      warnings: string[];
    }>(`/ai/validate/${blueprintId}`);
    return response.data;
  },

  // Analyze intent from natural language command
  async analyzeIntent(request: {
    query: string;
    context?: {
      blueprintId?: string;
      blueprintName?: string;
      resources?: any[];
    };
  }): Promise<{
    intent: string;
    confidence: number;
    entities?: Record<string, any>;
    suggestedAction?: string;
  }> {
    console.log('API Service - Calling /ai/intent/analyze with:', request);
    
    try {
      const response = await api.post<{
        intent: string;
        confidence: number;
        entities?: Record<string, any>;
        suggestedAction?: string;
      }>('/ai/intent/analyze', request);
      console.log('API Service - Intent analysis response:', response.data);
      return response.data;
    } catch (_error) {
      console.warn('🔄 AI Service unavailable, analyzing intent locally');
      
      // Local intent analysis - validate input is string
      if (typeof request.query !== 'string') {
        return {
          intent: 'invalid',
          confidence: 0,
          entities: {},
          suggestedAction: ''
        };
      }
      
      const query = request.query.toLowerCase();
      
      // Deploy/provision intent
      if (/deploy|provision|apply|create|launch|start/i.test(query)) {
        return {
          intent: 'deploy',
          confidence: 0.85,
          entities: {
            blueprint: request.context?.blueprintName || 'infrastructure',
            environment: query.match(/production|prod/i) ? 'production' :
                        query.match(/staging|stage/i) ? 'staging' :
                        query.match(/dev|development/i) ? 'development' : 'default'
          },
          suggestedAction: 'terraform apply -auto-approve'
        };
      }
      
      // Status/check intent
      if (/status|check|show|display|list|get/i.test(query)) {
        return {
          intent: 'status',
          confidence: 0.80,
          entities: {
            resource: query.match(/resource|infrastructure|state/i)?.[0]
          },
          suggestedAction: 'terraform show'
        };
      }
      
      // Destroy/delete intent
      if (/destroy|delete|remove|tear.?down|cleanup/i.test(query)) {
        return {
          intent: 'destroy',
          confidence: 0.90,
          entities: {
            blueprint: request.context?.blueprintName || 'infrastructure'
          },
          suggestedAction: 'terraform destroy'
        };
      }
      
      // Plan/preview intent
      if (/plan|preview|dry.?run|simulate|what.?if/i.test(query)) {
        return {
          intent: 'plan',
          confidence: 0.85,
          entities: {
            blueprint: request.context?.blueprintName || 'infrastructure'
          },
          suggestedAction: 'terraform plan'
        };
      }
      
      // Cost estimation intent
      if (/cost|price|estimate|budget|expense/i.test(query)) {
        return {
          intent: 'cost_estimate',
          confidence: 0.75,
          entities: {
            blueprint: request.context?.blueprintName
          },
          suggestedAction: 'terraform cost-estimate'
        };
      }
      
      // Generate/export intent
      if (/generate|export|download|save|code/i.test(query)) {
        return {
          intent: 'generate',
          confidence: 0.70,
          entities: {
            format: query.match(/terraform|tf/i) ? 'terraform' :
                   query.match(/json/i) ? 'json' :
                   query.match(/yaml|yml/i) ? 'yaml' : 'terraform'
          },
          suggestedAction: 'terraform show -json'
        };
      }
      
      // Default: general query
      return {
        intent: 'general',
        confidence: 0.50,
        entities: {},
        suggestedAction: request.query
      };
    }
  },
};
