/**
 * Policy Engine
 * Evaluates security policies and triggers automated enforcement actions
 */

import { EventEmitter } from 'events';
import logger from '../utils/logger';

// Policy condition types
export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 
                                'greater_than' | 'less_than' | 'matches_regex' | 'in_list' | 'not_in_list';

export interface PolicyCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

// Policy actions
export type ActionType = 'kill_process' | 'block_network' | 'quarantine_file' | 
                        'alert' | 'log' | 'block_usb' | 'block_registry';

export interface PolicyAction {
  type: ActionType;
  parameters?: Record<string, any>;
}

// Policy definition
export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'process' | 'network' | 'usb' | 'registry' | 'filesystem' | 'general';
  conditions: PolicyCondition[];
  conditionLogic: 'AND' | 'OR'; // How to combine multiple conditions
  actions: PolicyAction[];
  cooldownSeconds?: number; // Prevent repeated triggers
  metadata?: Record<string, any>;
}

// Enforcement result
export interface EnforcementResult {
  policyId: string;
  policyName: string;
  actionType: ActionType;
  success: boolean;
  error?: string;
  details?: any;
  timestamp: Date;
}

// Enforcement event
export interface EnforcementEvent {
  type: 'policy_triggered' | 'action_executed' | 'action_failed';
  policyId: string;
  policyName: string;
  severity: string;
  event: any; // Original event that triggered policy
  results: EnforcementResult[];
  timestamp: Date;
}

export class PolicyEngine extends EventEmitter {
  private policies: Map<string, SecurityPolicy> = new Map();
  private lastTriggerTimes: Map<string, Date> = new Map();
  private isRunning: boolean = false;

  constructor() {
    super();
  }

  /**
   * Start policy engine
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Policy engine already running');
      return;
    }

    this.isRunning = true;
    logger.info('Policy engine started', { policyCount: this.policies.size });
  }

  /**
   * Stop policy engine
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    logger.info('Policy engine stopped');
  }

  /**
   * Load policies
   */
  loadPolicies(policies: SecurityPolicy[]): void {
    for (const policy of policies) {
      this.addPolicy(policy);
    }
    logger.info('Policies loaded', { count: policies.length });
  }

  /**
   * Add a policy
   */
  addPolicy(policy: SecurityPolicy): void {
    this.policies.set(policy.id, policy);
    logger.info('Policy added', { id: policy.id, name: policy.name });
  }

  /**
   * Remove a policy
   */
  removePolicy(policyId: string): boolean {
    const removed = this.policies.delete(policyId);
    if (removed) {
      logger.info('Policy removed', { id: policyId });
    }
    return removed;
  }

  /**
   * Enable/disable a policy
   */
  setPolicyEnabled(policyId: string, enabled: boolean): boolean {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return false;
    }

    policy.enabled = enabled;
    logger.info('Policy state changed', { id: policyId, enabled });
    return true;
  }

  /**
   * Evaluate an event against all policies
   */
  async evaluateEvent(event: any, eventType: string): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    // Find applicable policies
    const applicablePolicies = Array.from(this.policies.values()).filter(policy => 
      policy.enabled && this.isPolicyApplicable(policy, eventType)
    );

    for (const policy of applicablePolicies) {
      try {
        // Check cooldown
        if (this.isInCooldown(policy)) {
          continue;
        }

        // Evaluate conditions
        const conditionsMet = this.evaluateConditions(policy, event);

        if (conditionsMet) {
          logger.warn('Policy triggered', {
            policyId: policy.id,
            policyName: policy.name,
            severity: policy.severity,
            eventType,
          });

          // Execute actions
          const results = await this.executeActions(policy, event);

          // Update last trigger time
          this.lastTriggerTimes.set(policy.id, new Date());

          // Emit enforcement event
          const enforcementEvent: EnforcementEvent = {
            type: 'policy_triggered',
            policyId: policy.id,
            policyName: policy.name,
            severity: policy.severity,
            event,
            results,
            timestamp: new Date(),
          };

          this.emit('enforcement', enforcementEvent);
        }
      } catch (error: any) {
        logger.error('Policy evaluation error', {
          policyId: policy.id,
          error: error.message,
        });
      }
    }
  }

  /**
   * Check if policy is applicable to event type
   */
  private isPolicyApplicable(policy: SecurityPolicy, eventType: string): boolean {
    // Map event types to policy categories
    const eventCategoryMap: Record<string, string> = {
      'process_event': 'process',
      'network_event': 'network',
      'usb_event': 'usb',
      'registry_event': 'registry',
      'filesystem_event': 'filesystem',
    };

    const eventCategory = eventCategoryMap[eventType];
    return !eventCategory || policy.category === eventCategory || policy.category === 'general';
  }

  /**
   * Check if policy is in cooldown period
   */
  private isInCooldown(policy: SecurityPolicy): boolean {
    if (!policy.cooldownSeconds) {
      return false;
    }

    const lastTrigger = this.lastTriggerTimes.get(policy.id);
    if (!lastTrigger) {
      return false;
    }

    const cooldownMs = policy.cooldownSeconds * 1000;
    const timeSinceLastTrigger = Date.now() - lastTrigger.getTime();

    return timeSinceLastTrigger < cooldownMs;
  }

  /**
   * Evaluate policy conditions
   */
  private evaluateConditions(policy: SecurityPolicy, event: any): boolean {
    if (policy.conditions.length === 0) {
      return true;
    }

    const results = policy.conditions.map(condition => 
      this.evaluateCondition(condition, event)
    );

    if (policy.conditionLogic === 'AND') {
      return results.every(r => r);
    } else {
      return results.some(r => r);
    }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: PolicyCondition, event: any): boolean {
    const value = this.getFieldValue(event, condition.field);

    if (value === undefined) {
      return false;
    }

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      
      case 'not_equals':
        return value !== condition.value;
      
      case 'contains':
        return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      
      case 'not_contains':
        return !String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      
      case 'greater_than':
        return Number(value) > Number(condition.value);
      
      case 'less_than':
        return Number(value) < Number(condition.value);
      
      case 'matches_regex':
        const regex = new RegExp(condition.value);
        return regex.test(String(value));
      
      case 'in_list':
        return Array.isArray(condition.value) && condition.value.includes(value);
      
      case 'not_in_list':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      
      default:
        logger.warn('Unknown condition operator', { operator: condition.operator });
        return false;
    }
  }

  /**
   * Get field value from event using dot notation
   */
  private getFieldValue(event: any, field: string): any {
    const parts = field.split('.');
    let value = event;

    for (const part of parts) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Execute policy actions
   */
  private async executeActions(policy: SecurityPolicy, event: any): Promise<EnforcementResult[]> {
    const results: EnforcementResult[] = [];

    for (const action of policy.actions) {
      try {
        const result = await this.executeAction(action, event, policy);
        results.push(result);

        const enforcementEvent: EnforcementEvent = {
          type: result.success ? 'action_executed' : 'action_failed',
          policyId: policy.id,
          policyName: policy.name,
          severity: policy.severity,
          event,
          results: [result],
          timestamp: new Date(),
        };

        this.emit('enforcement', enforcementEvent);
      } catch (error: any) {
        logger.error('Action execution error', {
          policyId: policy.id,
          actionType: action.type,
          error: error.message,
        });

        results.push({
          policyId: policy.id,
          policyName: policy.name,
          actionType: action.type,
          success: false,
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: PolicyAction, 
    event: any, 
    policy: SecurityPolicy
  ): Promise<EnforcementResult> {
    logger.info('Executing action', {
      policyId: policy.id,
      actionType: action.type,
    });

    // Action execution is delegated to enforcement handlers
    // The actual implementation will be in EnforcementActions class
    // This method emits events that handlers can listen to

    const result: EnforcementResult = {
      policyId: policy.id,
      policyName: policy.name,
      actionType: action.type,
      success: true,
      details: {
        event,
        parameters: action.parameters,
      },
      timestamp: new Date(),
    };

    // Emit action request event for handlers
    this.emit('action_requested', {
      action,
      event,
      policy,
      result,
    });

    return result;
  }

  /**
   * Get all policies
   */
  getPolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get enabled policies
   */
  getEnabledPolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values()).filter(p => p.enabled);
  }

  /**
   * Get policy by ID
   */
  getPolicy(policyId: string): SecurityPolicy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Get policies by category
   */
  getPoliciesByCategory(category: string): SecurityPolicy[] {
    return Array.from(this.policies.values()).filter(p => p.category === category);
  }

  /**
   * Get policy statistics
   */
  getStats(): {
    total: number;
    enabled: number;
    disabled: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const policies = Array.from(this.policies.values());

    const stats = {
      total: policies.length,
      enabled: policies.filter(p => p.enabled).length,
      disabled: policies.filter(p => !p.enabled).length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    };

    for (const policy of policies) {
      stats.byCategory[policy.category] = (stats.byCategory[policy.category] || 0) + 1;
      stats.bySeverity[policy.severity] = (stats.bySeverity[policy.severity] || 0) + 1;
    }

    return stats;
  }
}
