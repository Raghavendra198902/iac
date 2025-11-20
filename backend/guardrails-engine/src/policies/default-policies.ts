import { Policy } from '../types';

export const defaultPolicies: Policy[] = [
  // Security Policies
  {
    id: 'sec-001',
    name: 'Encryption at Rest Required',
    description: 'Storage resources must have encryption at rest enabled',
    category: 'security',
    severity: 'critical',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.encryption_enabled',
      operator: 'notEquals',
      value: true,
      scope: ['storage', 'database']
    },
    remediation: {
      type: 'auto',
      action: 'Enable encryption at rest',
      parameters: { encryption_enabled: true }
    },
    tags: ['encryption', 'data-protection', 'compliance']
  },
  {
    id: 'sec-002',
    name: 'Public Access Prohibited',
    description: 'Resources should not allow public internet access',
    category: 'security',
    severity: 'critical',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.public_access',
      operator: 'equals',
      value: true,
      scope: ['storage', 'database', 'network']
    },
    remediation: {
      type: 'auto',
      action: 'Disable public access',
      parameters: { public_access: false }
    },
    tags: ['network-security', 'access-control']
  },
  {
    id: 'sec-003',
    name: 'TLS 1.2+ Required',
    description: 'Minimum TLS version must be 1.2 or higher',
    category: 'security',
    severity: 'high',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.min_tls_version',
      operator: 'lessThan',
      value: '1.2',
      scope: ['app_service', 'api_gateway', 'load_balancer']
    },
    remediation: {
      type: 'auto',
      action: 'Set minimum TLS version to 1.2',
      parameters: { min_tls_version: '1.2' }
    },
    tags: ['encryption', 'transport-security']
  },
  {
    id: 'sec-004',
    name: 'Strong Authentication Required',
    description: 'Multi-factor authentication must be enabled',
    category: 'security',
    severity: 'high',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.mfa_enabled',
      operator: 'notEquals',
      value: true,
      scope: ['identity', 'user_pool']
    },
    remediation: {
      type: 'manual',
      action: 'Enable MFA for users'
    },
    tags: ['authentication', 'identity']
  },
  {
    id: 'sec-005',
    name: 'Network Segmentation',
    description: 'Resources must be deployed in private subnets',
    category: 'security',
    severity: 'high',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.subnet_type',
      operator: 'notEquals',
      value: 'private',
      scope: ['compute', 'database', 'storage']
    },
    remediation: {
      type: 'suggest',
      action: 'Deploy resource in private subnet'
    },
    tags: ['network-security', 'isolation']
  },

  // Compliance Policies
  {
    id: 'comp-001',
    name: 'Resource Tagging Required',
    description: 'All resources must have required tags: Environment, Owner, CostCenter',
    category: 'compliance',
    severity: 'medium',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.tags',
      operator: 'notContains',
      value: 'Environment'
    },
    remediation: {
      type: 'auto',
      action: 'Add required tags',
      parameters: {
        tags: {
          Environment: '${environment}',
          Owner: 'IAC-DHARMA',
          CostCenter: 'Unknown'
        }
      }
    },
    tags: ['governance', 'tagging']
  },
  {
    id: 'comp-002',
    name: 'Naming Convention',
    description: 'Resource names must follow naming convention: {env}-{app}-{resource}-{region}',
    category: 'compliance',
    severity: 'low',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'name',
      operator: 'matches',
      value: '^(?!(dev|staging|prod)-[a-z0-9]+-[a-z0-9]+-[a-z]+$)'
    },
    remediation: {
      type: 'suggest',
      action: 'Rename resource following naming convention'
    },
    tags: ['naming', 'standards']
  },
  {
    id: 'comp-003',
    name: 'Audit Logging Enabled',
    description: 'Audit logging must be enabled for compliance',
    category: 'compliance',
    severity: 'high',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.audit_logging',
      operator: 'notEquals',
      value: true,
      scope: ['database', 'storage', 'compute']
    },
    remediation: {
      type: 'auto',
      action: 'Enable audit logging',
      parameters: { audit_logging: true }
    },
    tags: ['logging', 'compliance', 'audit']
  },
  {
    id: 'comp-004',
    name: 'Data Residency',
    description: 'Resources must be deployed in approved regions',
    category: 'compliance',
    severity: 'critical',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.region',
      operator: 'notContains',
      value: 'approved-regions' // Will be checked against approved list
    },
    remediation: {
      type: 'manual',
      action: 'Deploy resource in approved region'
    },
    tags: ['compliance', 'data-residency', 'gdpr']
  },
  {
    id: 'comp-005',
    name: 'Backup Policy Required',
    description: 'Critical resources must have backup policy configured',
    category: 'compliance',
    severity: 'high',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.backup_policy',
      operator: 'equals',
      value: undefined,
      scope: ['database', 'storage']
    },
    remediation: {
      type: 'suggest',
      action: 'Configure backup policy with 30-day retention'
    },
    tags: ['backup', 'disaster-recovery']
  },

  // Cost Optimization Policies
  {
    id: 'cost-001',
    name: 'Right-Sizing',
    description: 'VM sizes must not exceed recommended specifications',
    category: 'cost',
    severity: 'medium',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.size',
      operator: 'matches',
      value: '.*(XL|XXL|_32|_64).*', // Large instance sizes
      scope: ['compute']
    },
    remediation: {
      type: 'suggest',
      action: 'Consider using smaller instance size'
    },
    tags: ['cost-optimization', 'right-sizing']
  },
  {
    id: 'cost-002',
    name: 'Reserved Instances',
    description: 'Long-running production resources should use reserved instances',
    category: 'cost',
    severity: 'low',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.pricing_model',
      operator: 'notEquals',
      value: 'reserved',
      scope: ['compute', 'database']
    },
    remediation: {
      type: 'suggest',
      action: 'Consider using reserved instances for cost savings'
    },
    tags: ['cost-optimization', 'reserved-capacity']
  },
  {
    id: 'cost-003',
    name: 'Auto-Scaling Configured',
    description: 'Resources should have auto-scaling enabled for cost efficiency',
    category: 'cost',
    severity: 'medium',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.auto_scaling',
      operator: 'notEquals',
      value: true,
      scope: ['compute', 'app_service']
    },
    remediation: {
      type: 'auto',
      action: 'Enable auto-scaling',
      parameters: { 
        auto_scaling: true,
        min_instances: 1,
        max_instances: 10
      }
    },
    tags: ['cost-optimization', 'auto-scaling']
  },
  {
    id: 'cost-004',
    name: 'Idle Resource Detection',
    description: 'Resources should have utilization monitoring to detect idle resources',
    category: 'cost',
    severity: 'low',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.monitoring_enabled',
      operator: 'notEquals',
      value: true
    },
    remediation: {
      type: 'auto',
      action: 'Enable monitoring',
      parameters: { monitoring_enabled: true }
    },
    tags: ['cost-optimization', 'monitoring']
  },

  // Operational Policies
  {
    id: 'ops-001',
    name: 'High Availability',
    description: 'Production resources must be deployed across multiple availability zones',
    category: 'operational',
    severity: 'high',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.availability_zones',
      operator: 'lessThan',
      value: 2,
      scope: ['compute', 'database', 'load_balancer']
    },
    remediation: {
      type: 'suggest',
      action: 'Deploy across multiple availability zones'
    },
    tags: ['high-availability', 'resilience']
  },
  {
    id: 'ops-002',
    name: 'Monitoring Enabled',
    description: 'All resources must have monitoring and alerting configured',
    category: 'operational',
    severity: 'medium',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.monitoring_enabled',
      operator: 'notEquals',
      value: true
    },
    remediation: {
      type: 'auto',
      action: 'Enable monitoring and alerting',
      parameters: { monitoring_enabled: true }
    },
    tags: ['monitoring', 'observability']
  },
  {
    id: 'ops-003',
    name: 'Disaster Recovery',
    description: 'Critical resources must have disaster recovery plan',
    category: 'operational',
    severity: 'high',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.dr_enabled',
      operator: 'notEquals',
      value: true,
      scope: ['database', 'storage']
    },
    remediation: {
      type: 'suggest',
      action: 'Configure disaster recovery with geo-replication'
    },
    tags: ['disaster-recovery', 'business-continuity']
  },
  {
    id: 'ops-004',
    name: 'Health Checks',
    description: 'Application resources must have health checks configured',
    category: 'operational',
    severity: 'medium',
    enabled: true,
    rule: {
      type: 'configuration',
      condition: 'properties.health_check',
      operator: 'equals',
      value: undefined,
      scope: ['app_service', 'api_gateway', 'load_balancer']
    },
    remediation: {
      type: 'auto',
      action: 'Configure health check endpoint',
      parameters: { 
        health_check: {
          path: '/health',
          interval: 30,
          timeout: 5
        }
      }
    },
    tags: ['health-check', 'monitoring']
  }
];
