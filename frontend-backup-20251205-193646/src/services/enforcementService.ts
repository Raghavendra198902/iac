/**
 * Enforcement API Service
 * Handles API calls for security enforcement events, policies, and quarantine
 */

import apiClient from '../lib/apiClient';

export interface EnforcementEvent {
  id: string;
  agentName: string;
  timestamp: string;
  type: 'policy_triggered' | 'action_executed' | 'action_failed';
  policyId: string;
  policyName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  event: any;
  actions: Array<{
    type: string;
    success: boolean;
    error?: string;
  }>;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'process' | 'network' | 'usb' | 'registry' | 'filesystem' | 'general';
  conditions: any[];
  actions: any[];
  createdAt: string;
  updatedAt: string;
  triggeredCount: number;
}

export interface QuarantinedFile {
  id: string;
  agentName: string;
  filePath: string;
  quarantinedAt: string;
  policyId: string;
  policyName: string;
  reason: string;
  size?: number;
  hash?: string;
  restored: boolean;
}

export interface EnforcementStats {
  total: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byType: {
    policy_triggered: number;
    action_executed: number;
    action_failed: number;
  };
  topPolicies: Array<{
    policyId: string;
    name: string;
    count: number;
    severity: string;
  }>;
  recentEvents: Array<{
    id: string;
    policyName: string;
    severity: string;
    timestamp: string;
  }>;
}

export interface EventsResponse {
  success: boolean;
  total: number;
  count: number;
  limit: number;
  offset: number;
  events: EnforcementEvent[];
}

export interface PoliciesResponse {
  success: boolean;
  count: number;
  policies: SecurityPolicy[];
}

export interface QuarantineResponse {
  success: boolean;
  total: number;
  count: number;
  limit: number;
  offset: number;
  files: QuarantinedFile[];
}

class EnforcementService {
  /**
   * Get enforcement events
   */
  // Get enforcement events with optional filtering
  async getEvents(params?: GetEventsParams): Promise<{ events: EnforcementEvent[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.agentName) queryParams.append('agentName', params.agentName);
      if (params.severity) queryParams.append('severity', params.severity);
      if (params.policyId) queryParams.append('policyId', params.policyId);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }
    const url = `/enforcement/events?${queryParams.toString()}`;
    console.log('[EnforcementService] getEvents URL:', url);
    return apiClient.get(url);
  }

  /**
   * Get enforcement event statistics
   */
  async getEventStats(): Promise<{ success: boolean; stats: EnforcementStats }> {
    return apiClient.get('/enforcement/events/stats');
  }

  /**
   * Get security policies
   */
  async getPolicies(params?: {
    enabled?: boolean;
    severity?: string;
    category?: string;
  }): Promise<PoliciesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.enabled !== undefined) queryParams.append('enabled', params.enabled.toString());
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.category) queryParams.append('category', params.category);

    return apiClient.get(`/enforcement/policies?${queryParams.toString()}`);
  }

  /**
   * Get a specific policy
   */
  async getPolicy(id: string): Promise<{ success: boolean; policy: SecurityPolicy }> {
    return apiClient.get(`/enforcement/policies/${id}`);
  }

  /**
   * Update a policy
   */
  async updatePolicy(
    id: string,
    updates: {
      enabled?: boolean;
      severity?: string;
      description?: string;
    }
  ): Promise<{ success: boolean; message: string; policy: SecurityPolicy }> {
    return apiClient.put(`/enforcement/policies/${id}`, updates);
  }

  /**
   * Get quarantined files
   */
  async getQuarantinedFiles(params?: {
    agentName?: string;
    restored?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<QuarantineResponse> {
    const queryParams = new URLSearchParams();
    if (params?.agentName) queryParams.append('agentName', params.agentName);
    if (params?.restored !== undefined) queryParams.append('restored', params.restored.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return apiClient.get(`/enforcement/quarantine?${queryParams.toString()}`);
  }

  /**
   * Restore a quarantined file
   */
  async restoreFile(id: string): Promise<{ success: boolean; message: string; file: QuarantinedFile }> {
    return apiClient.put(`/enforcement/quarantine/${id}/restore`);
  }
}

export const enforcementService = new EnforcementService();
export default enforcementService;
