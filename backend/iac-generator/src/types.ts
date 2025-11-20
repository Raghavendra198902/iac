export interface GenerationRequest {
  blueprintId: string;
  targetFormat: 'terraform' | 'bicep' | 'cloudformation';
  options?: {
    includeComments?: boolean;
    moduleName?: string;
    namespace?: string;
    [key: string]: any;
  };
}

export interface GenerationJob {
  id: string;
  blueprintId: string;
  targetFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output?: GenerationOutput;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface GenerationOutput {
  code: string;
  files?: GeneratedFile[];
  metadata?: {
    resourceCount: number;
    estimatedCost?: number;
    warnings?: string[];
  };
}

export interface GeneratedFile {
  name: string;
  content: string;
  type: 'main' | 'variables' | 'outputs' | 'modules';
}

export interface Blueprint {
  id: string;
  name: string;
  target_cloud: string;
  components: Component[];
  graph_data: any;
}

export interface Component {
  id: string;
  name: string;
  type: string;
  provider: string;
  properties: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}
