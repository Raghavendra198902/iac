export interface DeploymentRequest {
  blueprintId: string;
  generationJobId: string;
  environment: 'dev' | 'staging' | 'production';
  targetCloud: 'azure' | 'aws' | 'gcp' | 'on-premise';
  format: 'terraform' | 'bicep' | 'cloudformation';
  options?: {
    dryRun?: boolean;
    autoApprove?: boolean;
    parallelism?: number;
    resourceGroup?: string;
    region?: string;
  };
}

export interface Deployment {
  id: string;
  blueprintId: string;
  generationJobId: string;
  environment: string;
  targetCloud: string;
  format: string;
  status: 'pending' | 'planning' | 'applying' | 'completed' | 'failed' | 'rolled_back';
  state?: DeploymentState;
  outputs?: Record<string, any>;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  logs?: DeploymentLog[];
}

export interface DeploymentState {
  stateId: string;
  version: number;
  resources: ResourceState[];
  lastModified: Date;
  locked: boolean;
  lockInfo?: {
    id: string;
    operation: string;
    who: string;
    version: string;
    created: Date;
  };
}

export interface ResourceState {
  id: string;
  type: string;
  name: string;
  provider: string;
  attributes: Record<string, any>;
  dependencies: string[];
  status: 'creating' | 'created' | 'updating' | 'updated' | 'deleting' | 'deleted' | 'failed';
}

export interface DeploymentLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  resource?: string;
}

export interface RollbackRequest {
  deploymentId: string;
  targetVersion?: number;
  reason: string;
}

export interface StateBackup {
  id: string;
  deploymentId: string;
  version: number;
  state: DeploymentState;
  createdAt: Date;
}

export interface CloudCredentials {
  azure?: {
    subscriptionId: string;
    tenantId: string;
    clientId: string;
    clientSecret: string;
  };
  aws?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  gcp?: {
    projectId: string;
    credentials: string; // JSON key file
  };
}
