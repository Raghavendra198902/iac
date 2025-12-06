/**
 * Activity Feed Types
 * Defines the structure for real-time activity tracking across the workflow system
 */

export type ActivityType = 
  | 'project_created'
  | 'project_updated'
  | 'step_started'
  | 'step_completed'
  | 'step_blocked'
  | 'asset_linked'
  | 'asset_removed'
  | 'user_joined'
  | 'user_left'
  | 'comment_added'
  | 'approval_requested'
  | 'approval_granted'
  | 'approval_denied'
  | 'pdf_exported'
  | 'milestone_reached'
  | 'deadline_approaching'
  | 'risk_identified';

export type ActivityPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  timestamp: Date;
  priority: ActivityPriority;
  metadata?: {
    stepNumber?: number;
    stepTitle?: string;
    assetCount?: number;
    assetType?: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
    approver?: string;
    [key: string]: any;
  };
  icon?: string;
  color?: string;
}

export interface ActivityFilter {
  types?: ActivityType[];
  priorities?: ActivityPriority[];
  projectIds?: string[];
  userIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

export interface ActivityStats {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesByPriority: Record<ActivityPriority, number>;
  activeUsers: number;
  activeProjects: number;
  activitiesLast24h: number;
  activitiesLast7d: number;
  activitiesLast30d: number;
}
