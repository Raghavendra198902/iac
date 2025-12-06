export type TemplateCategory = 
  | 'compute' 
  | 'networking' 
  | 'database' 
  | 'storage' 
  | 'security' 
  | 'monitoring'
  | 'kubernetes'
  | 'serverless';

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'multi-cloud';

export type TemplateComplexity = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  provider: CloudProvider;
  complexity: TemplateComplexity;
  version: string;
  author: string;
  downloads: number;
  likes: number;
  rating: number;
  tags: string[];
  estimatedCost: string;
  deploymentTime: string;
  lastUpdated: string;
  isVerified: boolean;
  isFeatured: boolean;
  parameters: TemplateParameter[];
  resources: TemplateResource[];
  preview?: string;
}

export interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  description: string;
  required: boolean;
  default?: any;
  options?: string[];
  validation?: string;
}

export interface TemplateResource {
  type: string;
  name: string;
  description?: string;
  count?: number;
}

export interface TemplateFilters {
  category?: TemplateCategory;
  provider?: CloudProvider;
  complexity?: TemplateComplexity;
  verified?: boolean;
  featured?: boolean;
  minRating?: number;
}

export interface TemplateStats {
  totalTemplates: number;
  totalDownloads: number;
  averageRating: number;
  verifiedTemplates: number;
  categoryCounts: Record<TemplateCategory, number>;
}
