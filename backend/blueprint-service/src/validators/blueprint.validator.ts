/**
 * Blueprint validation logic for IAC Dharma
 * 
 * Validates blueprints for:
 * - Cloud provider specific resource constraints
 * - Resource dependency graphs
 * - Cost thresholds
 * - Naming conventions
 * - Security best practices
 */

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  cloudProvider: 'aws' | 'azure' | 'gcp';
  region: string;
  resources: Resource[];
  metadata?: Record<string, any>;
}

export interface Resource {
  id?: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  dependsOn?: string[];
  tags?: Record<string, string>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
  code: string;
}

// Resource type mappings
const AWS_RESOURCE_TYPES = [
  'ec2', 'rds', 's3', 'lambda', 'vpc', 'subnet', 'security-group',
  'iam-role', 'iam-policy', 'load-balancer', 'auto-scaling-group'
];

const AZURE_RESOURCE_TYPES = [
  'vm', 'sql-database', 'storage-account', 'function-app', 'vnet',
  'subnet', 'nsg', 'load-balancer', 'app-service'
];

const GCP_RESOURCE_TYPES = [
  'compute-instance', 'cloud-sql', 'storage-bucket', 'cloud-function',
  'vpc', 'subnet', 'firewall', 'load-balancer'
];

/**
 * Main validation function
 */
export const validateBlueprint = (blueprint: Blueprint): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Basic validation
  validateBasicFields(blueprint, errors);
  
  // Resource validation
  validateResources(blueprint, errors, warnings);
  
  // Dependency graph validation
  validateDependencyGraph(blueprint.resources, errors);
  
  // Cloud provider specific validation
  validateCloudProvider(blueprint, errors, warnings);
  
  // Naming convention validation
  validateNamingConventions(blueprint, warnings);
  
  // Cost threshold validation
  validateCostThreshold(blueprint, warnings);
  
  // Security validation
  validateSecurity(blueprint, errors, warnings);
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate basic required fields
 */
const validateBasicFields = (blueprint: Blueprint, errors: ValidationError[]) => {
  if (!blueprint.name || blueprint.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Blueprint name is required',
      severity: 'error',
      code: 'REQUIRED_FIELD'
    });
  }
  
  if (!blueprint.cloudProvider) {
    errors.push({
      field: 'cloudProvider',
      message: 'Cloud provider is required',
      severity: 'error',
      code: 'REQUIRED_FIELD'
    });
  } else if (!['aws', 'azure', 'gcp'].includes(blueprint.cloudProvider)) {
    errors.push({
      field: 'cloudProvider',
      message: 'Invalid cloud provider. Must be aws, azure, or gcp',
      severity: 'error',
      code: 'INVALID_VALUE'
    });
  }
  
  if (!blueprint.region || blueprint.region.trim().length === 0) {
    errors.push({
      field: 'region',
      message: 'Region is required',
      severity: 'error',
      code: 'REQUIRED_FIELD'
    });
  }
  
  if (!blueprint.resources || !Array.isArray(blueprint.resources)) {
    errors.push({
      field: 'resources',
      message: 'Resources array is required',
      severity: 'error',
      code: 'REQUIRED_FIELD'
    });
  } else if (blueprint.resources.length === 0) {
    errors.push({
      field: 'resources',
      message: 'At least one resource is required',
      severity: 'error',
      code: 'MIN_LENGTH'
    });
  }
};

/**
 * Validate individual resources
 */
const validateResources = (
  blueprint: Blueprint,
  errors: ValidationError[],
  warnings: ValidationWarning[]
) => {
  blueprint.resources?.forEach((resource, index) => {
    if (!resource.type) {
      errors.push({
        field: `resources[${index}].type`,
        message: 'Resource type is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!resource.name) {
      errors.push({
        field: `resources[${index}].name`,
        message: 'Resource name is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!resource.properties || Object.keys(resource.properties).length === 0) {
      warnings.push({
        field: `resources[${index}].properties`,
        message: 'Resource has no properties defined',
        severity: 'warning',
        code: 'MISSING_PROPERTIES'
      });
    }
    
    // Check for required tags
    if (!resource.tags || Object.keys(resource.tags).length === 0) {
      warnings.push({
        field: `resources[${index}].tags`,
        message: 'Resource should have tags for better organization',
        severity: 'warning',
        code: 'MISSING_TAGS'
      });
    }
  });
};

/**
 * Validate resource dependency graph
 */
const validateDependencyGraph = (
  resources: Resource[],
  errors: ValidationError[]
) => {
  const resourceNames = new Set(resources.map(r => r.name));
  
  resources.forEach((resource, index) => {
    if (resource.dependsOn) {
      resource.dependsOn.forEach(dep => {
        if (!resourceNames.has(dep)) {
          errors.push({
            field: `resources[${index}].dependsOn`,
            message: `Dependency '${dep}' does not exist in blueprint`,
            severity: 'error',
            code: 'INVALID_DEPENDENCY'
          });
        }
      });
    }
  });
  
  // Check for circular dependencies
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const hasCycle = (resourceName: string): boolean => {
    visited.add(resourceName);
    recursionStack.add(resourceName);
    
    const resource = resources.find(r => r.name === resourceName);
    if (resource?.dependsOn) {
      for (const dep of resource.dependsOn) {
        if (!visited.has(dep)) {
          if (hasCycle(dep)) {
            return true;
          }
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }
    }
    
    recursionStack.delete(resourceName);
    return false;
  };
  
  for (const resource of resources) {
    if (!visited.has(resource.name)) {
      if (hasCycle(resource.name)) {
        errors.push({
          field: 'resources',
          message: 'Circular dependency detected in resource graph',
          severity: 'error',
          code: 'CIRCULAR_DEPENDENCY'
        });
        break;
      }
    }
  }
};

/**
 * Cloud provider specific validation
 */
const validateCloudProvider = (
  blueprint: Blueprint,
  errors: ValidationError[],
  warnings: ValidationWarning[]
) => {
  const validTypes = 
    blueprint.cloudProvider === 'aws' ? AWS_RESOURCE_TYPES :
    blueprint.cloudProvider === 'azure' ? AZURE_RESOURCE_TYPES :
    GCP_RESOURCE_TYPES;
  
  blueprint.resources?.forEach((resource, index) => {
    const normalizedType = resource.type.toLowerCase();
    if (!validTypes.includes(normalizedType)) {
      warnings.push({
        field: `resources[${index}].type`,
        message: `Resource type '${resource.type}' may not be valid for ${blueprint.cloudProvider}`,
        severity: 'warning',
        code: 'UNKNOWN_RESOURCE_TYPE'
      });
    }
  });
  
  // AWS specific validations
  if (blueprint.cloudProvider === 'aws') {
    validateAWSRegion(blueprint.region, errors);
  }
  
  // Azure specific validations
  if (blueprint.cloudProvider === 'azure') {
    validateAzureRegion(blueprint.region, errors);
  }
  
  // GCP specific validations
  if (blueprint.cloudProvider === 'gcp') {
    validateGCPRegion(blueprint.region, errors);
  }
};

const validateAWSRegion = (region: string, errors: ValidationError[]) => {
  const validRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-central-1', 'ap-southeast-1'
  ];
  
  if (!validRegions.includes(region)) {
    errors.push({
      field: 'region',
      message: `Invalid AWS region: ${region}`,
      severity: 'error',
      code: 'INVALID_REGION'
    });
  }
};

const validateAzureRegion = (region: string, errors: ValidationError[]) => {
  const validRegions = [
    'eastus', 'westus', 'centralus', 'northeurope',
    'westeurope', 'southeastasia'
  ];
  
  if (!validRegions.includes(region.toLowerCase())) {
    errors.push({
      field: 'region',
      message: `Invalid Azure region: ${region}`,
      severity: 'error',
      code: 'INVALID_REGION'
    });
  }
};

const validateGCPRegion = (region: string, errors: ValidationError[]) => {
  const validRegions = [
    'us-central1', 'us-east1', 'us-west1',
    'europe-west1', 'asia-southeast1'
  ];
  
  if (!validRegions.includes(region.toLowerCase())) {
    errors.push({
      field: 'region',
      message: `Invalid GCP region: ${region}`,
      severity: 'error',
      code: 'INVALID_REGION'
    });
  }
};

/**
 * Validate naming conventions
 */
const validateNamingConventions = (
  blueprint: Blueprint,
  warnings: ValidationWarning[]
) => {
  // Blueprint name should be kebab-case or snake_case
  if (!/^[a-z0-9-_]+$/.test(blueprint.name)) {
    warnings.push({
      field: 'name',
      message: 'Blueprint name should use lowercase letters, numbers, hyphens, or underscores only',
      severity: 'warning',
      code: 'NAMING_CONVENTION'
    });
  }
  
  // Resource names validation
  blueprint.resources?.forEach((resource, index) => {
    if (!/^[a-zA-Z0-9-_]+$/.test(resource.name)) {
      warnings.push({
        field: `resources[${index}].name`,
        message: 'Resource name should use alphanumeric characters, hyphens, or underscores only',
        severity: 'warning',
        code: 'NAMING_CONVENTION'
      });
    }
  });
};

/**
 * Validate cost threshold
 */
const validateCostThreshold = (
  blueprint: Blueprint,
  warnings: ValidationWarning[]
) => {
  const estimatedCost = estimateBasicCost(blueprint);
  const threshold = 1000; // $1000 threshold
  
  if (estimatedCost > threshold) {
    warnings.push({
      field: 'resources',
      message: `Estimated cost ($${estimatedCost}) exceeds recommended threshold ($${threshold})`,
      severity: 'warning',
      code: 'COST_THRESHOLD'
    });
  }
};

/**
 * Basic cost estimation (placeholder)
 */
const estimateBasicCost = (blueprint: Blueprint): number => {
  // Simple cost estimation based on resource count
  // Real implementation would query pricing APIs
  return blueprint.resources.length * 50; // $50 per resource estimate
};

/**
 * Security validation
 */
const validateSecurity = (
  blueprint: Blueprint,
  errors: ValidationError[],
  warnings: ValidationWarning[]
) => {
  blueprint.resources?.forEach((resource, index) => {
    // Check for public access warnings
    if (resource.properties?.public === true || resource.properties?.publicAccess === 'enabled') {
      warnings.push({
        field: `resources[${index}].properties`,
        message: 'Resource configured for public access - ensure this is intentional',
        severity: 'warning',
        code: 'PUBLIC_ACCESS'
      });
    }
    
    // Check for encryption
    if (resource.type.includes('storage') || resource.type.includes('database')) {
      if (!resource.properties?.encryption && !resource.properties?.encrypted) {
        warnings.push({
          field: `resources[${index}].properties`,
          message: 'Storage/database resource should have encryption enabled',
          severity: 'warning',
          code: 'ENCRYPTION_RECOMMENDED'
        });
      }
    }
    
    // Check for required tags
    const requiredTags = ['environment', 'owner', 'project'];
    const missingTags = requiredTags.filter(tag => !resource.tags?.[tag]);
    
    if (missingTags.length > 0) {
      warnings.push({
        field: `resources[${index}].tags`,
        message: `Missing recommended tags: ${missingTags.join(', ')}`,
        severity: 'warning',
        code: 'MISSING_REQUIRED_TAGS'
      });
    }
  });
};

export default validateBlueprint;
