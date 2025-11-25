export type SearchCategory = 'all' | 'projects' | 'tasks' | 'team' | 'documents' | 'activities';

export interface SearchResult {
  id: string;
  category: SearchCategory;
  title: string;
  description?: string;
  subtitle?: string;
  metadata?: Record<string, any>;
  url?: string;
  icon?: string;
  timestamp?: Date;
  relevance?: number;
}

export interface SearchFilter {
  category: SearchCategory;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  priority?: string[];
  assignee?: string[];
  tags?: string[];
}

export interface SearchStats {
  totalResults: number;
  resultsByCategory: Record<SearchCategory, number>;
  searchTime: number;
}
