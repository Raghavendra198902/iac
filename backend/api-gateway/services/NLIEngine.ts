/**
 * Natural Language Infrastructure (NLI) Engine
 * Converts natural language commands to infrastructure code
 * 
 * Features:
 * - Parse natural language infrastructure requests
 * - Generate Terraform/CloudFormation/Kubernetes YAML
 * - Provide cost estimates
 * - Suggest best practices
 * - Multi-cloud support
 */

interface NLIRequest {
  command: string;
  context?: {
    provider?: 'aws' | 'azure' | 'gcp' | 'kubernetes';
    environment?: 'dev' | 'staging' | 'production';
    budget?: number;
  };
}

interface NLIResponse {
  understood: boolean;
  intent: string;
  entities: Record<string, any>;
  generatedCode: {
    terraform?: string;
    cloudformation?: string;
    kubernetes?: string;
    pulumi?: string;
  };
  estimatedCost: {
    monthly: number;
    currency: string;
    breakdown: Array<{ resource: string; cost: number }>;
  };
  recommendations: string[];
  alternatives: Array<{
    description: string;
    costSaving: number;
    tradeoffs: string[];
  }>;
}

export class NLIEngine {
  private readonly patterns = {
    // Infrastructure patterns
    cluster: /(?:create|deploy|setup)\s+(?:a\s+)?(?:kubernetes|k8s|eks|aks|gke)?\s*cluster/i,
    database: /(?:create|deploy|setup)\s+(?:a\s+)?(?:postgresql|mysql|mongodb|redis|dynamodb|cosmos)\s*(?:database)?/i,
    webapp: /(?:create|deploy|setup)\s+(?:a\s+)?(?:web\s*app|website|application)/i,
    loadBalancer: /(?:create|deploy|setup)\s+(?:a\s+)?load\s*balancer/i,
    storage: /(?:create|deploy|setup)\s+(?:a\s+)?(?:storage|bucket|blob|s3)/i,
    network: /(?:create|deploy|setup)\s+(?:a\s+)?(?:vpc|vnet|network)/i,
    
    // Modifiers
    highAvailability: /high(?:ly)?\s*available?|ha|99\.9+%|multi(?:-|\s)?az/i,
    autoScaling: /auto(?:-|\s)?scal(?:e|ing)|scale\s*automatically/i,
    production: /production|prod|live/i,
    staging: /staging|stage|pre(?:-|\s)?prod/i,
    development: /development|dev|test/i,
    
    // Cloud providers
    aws: /\b(?:aws|amazon)\b/i,
    azure: /\b(?:azure|microsoft)\b/i,
    gcp: /\b(?:gcp|google|google\s*cloud)\b/i,
    
    // Resources
    nodes: /(\d+)\s*nodes?/i,
    replicas: /(\d+)\s*replicas?/i,
    storage_size: /(\d+)\s*(?:gb|tb|gib|tib)/i,
    memory: /(\d+)\s*(?:gb|gib)\s*(?:memory|ram)/i,
    cpu: /(\d+)\s*(?:vcpu|cpu|cores?)/i,
  };

  public async parseCommand(request: NLIRequest): Promise<NLIResponse> {
    const { command, context } = request;
    const intent = this.detectIntent(command);
    const entities = this.extractEntities(command);
    const provider = context?.provider || this.detectProvider(command) || 'aws';
    const environment = context?.environment || this.detectEnvironment(command) || 'production';

    let response: NLIResponse = {
      understood: intent !== 'unknown',
      intent,
      entities,
      generatedCode: {},
      estimatedCost: {
        monthly: 0,
        currency: 'USD',
        breakdown: [],
      },
      recommendations: [],
      alternatives: [],
    };

    // Generate code based on intent
    switch (intent) {
      case 'create_cluster':
        response = await this.generateClusterCode(entities, provider, environment);
        break;
      case 'create_database':
        response = await this.generateDatabaseCode(entities, provider, environment);
        break;
      case 'create_webapp':
        response = await this.generateWebAppCode(entities, provider, environment);
        break;
      case 'create_loadbalancer':
        response = await this.generateLoadBalancerCode(entities, provider, environment);
        break;
      case 'create_storage':
        response = await this.generateStorageCode(entities, provider, environment);
        break;
      case 'create_network':
        response = await this.generateNetworkCode(entities, provider, environment);
        break;
      default:
        response.understood = false;
        response.recommendations = [
          'I couldn\'t understand your request. Try commands like:',
          '- "Create a Kubernetes cluster with 3 nodes"',
          '- "Deploy a PostgreSQL database with high availability"',
          '- "Setup a web application with auto-scaling"',
        ];
    }

    return response;
  }

  private detectIntent(command: string): string {
    if (this.patterns.cluster.test(command)) return 'create_cluster';
    if (this.patterns.database.test(command)) return 'create_database';
    if (this.patterns.webapp.test(command)) return 'create_webapp';
    if (this.patterns.loadBalancer.test(command)) return 'create_loadbalancer';
    if (this.patterns.storage.test(command)) return 'create_storage';
    if (this.patterns.network.test(command)) return 'create_network';
    return 'unknown';
  }

  private extractEntities(command: string): Record<string, any> {
    const entities: Record<string, any> = {
      highAvailability: this.patterns.highAvailability.test(command),
      autoScaling: this.patterns.autoScaling.test(command),
    };

    // Extract numbers
    const nodesMatch = command.match(this.patterns.nodes);
    if (nodesMatch) entities.nodes = parseInt(nodesMatch[1]);

    const replicasMatch = command.match(this.patterns.replicas);
    if (replicasMatch) entities.replicas = parseInt(replicasMatch[1]);

    const storageMatch = command.match(this.patterns.storage_size);
    if (storageMatch) entities.storageSize = parseInt(storageMatch[1]);

    const memoryMatch = command.match(this.patterns.memory);
    if (memoryMatch) entities.memory = parseInt(memoryMatch[1]);

    const cpuMatch = command.match(this.patterns.cpu);
    if (cpuMatch) entities.cpu = parseInt(cpuMatch[1]);

    return entities;
  }

  private detectProvider(command: string): 'aws' | 'azure' | 'gcp' | 'kubernetes' {
    if (this.patterns.aws.test(command)) return 'aws';
    if (this.patterns.azure.test(command)) return 'azure';
    if (this.patterns.gcp.test(command)) return 'gcp';
    return 'aws'; // default
  }

  private detectEnvironment(command: string): 'dev' | 'staging' | 'production' {
    if (this.patterns.development.test(command)) return 'dev';
    if (this.patterns.staging.test(command)) return 'staging';
    if (this.patterns.production.test(command)) return 'production';
    return 'production'; // default to production for safety
  }

  private async generateClusterCode(
    entities: Record<string, any>,
    provider: string,
    environment: string
  ): Promise<NLIResponse> {
    const nodes = entities.nodes || 3;
    const ha = entities.highAvailability;
    const autoScale = entities.autoScaling;

    let terraform = '';
    let kubernetes = '';
    let costBreakdown: Array<{ resource: string; cost: number }> = [];
    let recommendations: string[] = [];

    if (provider === 'aws') {
      terraform = `# AWS EKS Cluster Configuration
# Generated by NLI Engine

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "cluster_name" {
  default = "iac-${environment}-cluster"
}

variable "region" {
  default = "us-east-1"
}

# VPC for EKS
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "\${var.cluster_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = ${!ha}
  enable_dns_hostnames = true

  tags = {
    Environment = "${environment}"
    ManagedBy   = "IAC-Dharma-NLI"
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Enable IRSA
  enable_irsa = true

  # Cluster endpoint access
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # Cluster logging
  cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  # Node groups
  eks_managed_node_groups = {
    main = {
      min_size     = ${ha ? '2' : '1'}
      max_size     = ${autoScale ? nodes * 2 : nodes}
      desired_size = ${nodes}

      instance_types = ["m5.large"]
      capacity_type  = "ON_DEMAND"

      labels = {
        Environment = "${environment}"
        NodeGroup   = "main"
      }

      tags = {
        Environment = "${environment}"
      }
    }
  }

  tags = {
    Environment = "${environment}"
    ManagedBy   = "IAC-Dharma-NLI"
  }
}

# Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}

output "configure_kubectl" {
  description = "Configure kubectl"
  value       = "aws eks update-kubeconfig --region \${var.region} --name \${module.eks.cluster_name}"
}
`;

      // Cost estimation
      const nodeCost = 0.096 * 24 * 30; // m5.large hourly cost * hours/month
      const controlPlaneCost = 73; // EKS control plane cost
      const natGatewayCost = ha ? 96 : 32; // NAT Gateway costs
      const ebsCost = nodes * 20 * 0.10; // 20GB per node at $0.10/GB/month

      costBreakdown = [
        { resource: 'EKS Control Plane', cost: controlPlaneCost },
        { resource: `EC2 Instances (${nodes}x m5.large)`, cost: nodeCost * nodes },
        { resource: ha ? 'NAT Gateways (HA)' : 'NAT Gateway', cost: natGatewayCost },
        { resource: 'EBS Volumes', cost: ebsCost },
      ];

      recommendations = [
        ha
          ? '✓ High availability enabled with multi-AZ deployment'
          : '⚠️ Consider enabling high availability for production workloads',
        autoScale
          ? '✓ Auto-scaling configured for dynamic workload handling'
          : '💡 Add auto-scaling for cost optimization during low traffic',
        '🔐 Enable Pod Security Standards (PSS) for security',
        '📊 Install metrics-server for resource monitoring',
        '🔄 Configure cluster autoscaler for node scaling',
      ];
    }

    kubernetes = `# Kubernetes Sample Deployment
# Deploy after cluster is created

apiVersion: v1
kind: Namespace
metadata:
  name: ${environment}
  labels:
    environment: ${environment}

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app
  namespace: ${environment}
spec:
  replicas: ${entities.replicas || 3}
  selector:
    matchLabels:
      app: sample-app
  template:
    metadata:
      labels:
        app: sample-app
    spec:
      containers:
      - name: app
        image: nginx:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: sample-app
  namespace: ${environment}
spec:
  type: LoadBalancer
  selector:
    app: sample-app
  ports:
  - port: 80
    targetPort: 80
`;

    const totalCost = costBreakdown.reduce((sum, item) => sum + item.cost, 0);

    return {
      understood: true,
      intent: 'create_cluster',
      entities,
      generatedCode: {
        terraform,
        kubernetes,
      },
      estimatedCost: {
        monthly: Math.round(totalCost),
        currency: 'USD',
        breakdown: costBreakdown,
      },
      recommendations,
      alternatives: [
        {
          description: 'Use Spot Instances for non-production workloads',
          costSaving: Math.round(totalCost * 0.7),
          tradeoffs: ['Instances can be interrupted', 'Not suitable for stateful workloads'],
        },
        {
          description: 'Use smaller instance types (t3.medium)',
          costSaving: Math.round(totalCost * 0.4),
          tradeoffs: ['Lower performance', 'May need more nodes for same capacity'],
        },
      ],
    };
  }

  private async generateDatabaseCode(
    entities: Record<string, any>,
    provider: string,
    environment: string
  ): Promise<NLIResponse> {
    const ha = entities.highAvailability;
    const storageSize = entities.storageSize || 100;

    const terraform = `# RDS PostgreSQL Database Configuration
# Generated by NLI Engine

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "db_name" {
  default = "iac_${environment}_db"
}

# Security Group
resource "aws_security_group" "rds" {
  name_description = "RDS PostgreSQL security group"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "rds-\${var.db_name}"
    Environment = "${environment}"
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = var.db_name

  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "${ha ? 'db.m6g.large' : 'db.t3.medium'}"
  allocated_storage    = ${storageSize}
  storage_type         = "gp3"
  storage_encrypted    = true

  db_name  = replace(var.db_name, "-", "_")
  username = "admin"
  password = random_password.db_password.result

  multi_az               = ${ha}
  publicly_accessible    = false
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = ${environment === 'production' ? 30 : 7}
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  deletion_protection = ${environment === 'production'}
  skip_final_snapshot = ${environment !== 'production'}

  tags = {
    Name        = var.db_name
    Environment = "${environment}"
    ManagedBy   = "IAC-Dharma-NLI"
  }
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "aws_secretsmanager_secret" "db_password" {
  name = "\${var.db_name}-password"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db_password.result
}

output "db_endpoint" {
  value       = aws_db_instance.main.endpoint
  description = "Database endpoint"
}

output "db_name" {
  value       = aws_db_instance.main.db_name
  description = "Database name"
}

output "password_secret_arn" {
  value       = aws_secretsmanager_secret.db_password.arn
  description = "ARN of the secret containing database password"
}
`;

    const instanceCost = ha ? 182.5 : 60; // m6g.large vs t3.medium monthly
    const storageCost = storageSize * 0.115; // gp3 storage cost
    const backupCost = storageSize * 0.095; // backup storage

    return {
      understood: true,
      intent: 'create_database',
      entities,
      generatedCode: {
        terraform,
      },
      estimatedCost: {
        monthly: Math.round(instanceCost + storageCost + backupCost),
        currency: 'USD',
        breakdown: [
          { resource: ha ? 'RDS Instance (Multi-AZ)' : 'RDS Instance', cost: instanceCost },
          { resource: `Storage (${storageSize}GB gp3)`, cost: storageCost },
          { resource: 'Automated Backups', cost: backupCost },
        ],
      },
      recommendations: [
        ha
          ? '✓ Multi-AZ deployment for 99.95% availability'
          : '⚠️ Enable Multi-AZ for production databases',
        '🔐 Password stored securely in AWS Secrets Manager',
        '📊 CloudWatch logs enabled for monitoring',
        '💾 Automated backups configured',
        environment === 'production'
          ? '✓ Deletion protection enabled'
          : '⚠️ Consider enabling deletion protection',
      ],
      alternatives: [
        {
          description: 'Use Aurora Serverless for variable workloads',
          costSaving: 0,
          tradeoffs: ['Pay per ACU usage', 'Better for spiky traffic', 'Auto-scaling capacity'],
        },
        {
          description: 'Use smaller instance (db.t3.small)',
          costSaving: 30,
          tradeoffs: ['Lower performance', 'Limited connections', 'Not suitable for high traffic'],
        },
      ],
    };
  }

  private async generateWebAppCode(
    entities: Record<string, any>,
    provider: string,
    environment: string
  ): Promise<NLIResponse> {
    const autoScale = entities.autoScaling;
    const ha = entities.highAvailability;

    const kubernetes = `# Web Application Deployment
# Generated by NLI Engine

apiVersion: v1
kind: Namespace
metadata:
  name: ${environment}

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
  namespace: ${environment}
spec:
  replicas: ${ha ? 3 : 2}
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: your-webapp-image:latest
        ports:
        - containerPort: 8080
        env:
        - name: ENVIRONMENT
          value: "${environment}"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
${
  autoScale
    ? `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webapp-hpa
  namespace: ${environment}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webapp
  minReplicas: ${ha ? 3 : 2}
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

---
`
    : ''
}apiVersion: v1
kind: Service
metadata:
  name: webapp
  namespace: ${environment}
spec:
  type: ClusterIP
  selector:
    app: webapp
  ports:
  - port: 80
    targetPort: 8080

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp
  namespace: ${environment}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - ${environment}.yourdomain.com
    secretName: webapp-tls
  rules:
  - host: ${environment}.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: webapp
            port:
              number: 80
`;

    return {
      understood: true,
      intent: 'create_webapp',
      entities,
      generatedCode: {
        kubernetes,
      },
      estimatedCost: {
        monthly: 50,
        currency: 'USD',
        breakdown: [
          { resource: 'Container resources', cost: 40 },
          { resource: 'Load balancer', cost: 10 },
        ],
      },
      recommendations: [
        autoScale ? '✓ Auto-scaling configured based on CPU/memory' : '💡 Consider enabling auto-scaling',
        ha ? '✓ High availability with 3 replicas' : '⚠️ Add more replicas for production',
        '🔐 HTTPS configured with cert-manager',
        '🏥 Health checks configured',
        '📊 Ready for Prometheus monitoring',
      ],
      alternatives: [],
    };
  }

  private async generateLoadBalancerCode(
    entities: Record<string, any>,
    provider: string,
    environment: string
  ): Promise<NLIResponse> {
    return {
      understood: true,
      intent: 'create_loadbalancer',
      entities,
      generatedCode: {},
      estimatedCost: { monthly: 0, currency: 'USD', breakdown: [] },
      recommendations: ['Load balancer generation coming soon'],
      alternatives: [],
    };
  }

  private async generateStorageCode(
    entities: Record<string, any>,
    provider: string,
    environment: string
  ): Promise<NLIResponse> {
    return {
      understood: true,
      intent: 'create_storage',
      entities,
      generatedCode: {},
      estimatedCost: { monthly: 0, currency: 'USD', breakdown: [] },
      recommendations: ['Storage generation coming soon'],
      alternatives: [],
    };
  }

  private async generateNetworkCode(
    entities: Record<string, any>,
    provider: string,
    environment: string
  ): Promise<NLIResponse> {
    return {
      understood: true,
      intent: 'create_network',
      entities,
      generatedCode: {},
      estimatedCost: { monthly: 0, currency: 'USD', breakdown: [] },
      recommendations: ['Network generation coming soon'],
      alternatives: [],
    };
  }
}
