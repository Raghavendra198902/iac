/**
 * Default Security Policies
 * Pre-configured policies for common threats and suspicious behaviors
 */

import { SecurityPolicy } from './PolicyEngine';

export const DEFAULT_POLICIES: SecurityPolicy[] = [
  // Process Policies
  {
    id: 'proc-001',
    name: 'Suspicious Process Names',
    description: 'Detect and kill processes with suspicious names commonly used by malware',
    enabled: true,
    severity: 'high',
    category: 'process',
    conditionLogic: 'OR',
    conditions: [
      {
        field: 'process.name',
        operator: 'matches_regex',
        value: '.*(cryptominer|keylogger|ransomware|backdoor|trojan).*',
      },
      {
        field: 'process.command',
        operator: 'contains',
        value: 'mimikatz',
      },
      {
        field: 'process.command',
        operator: 'contains',
        value: 'powersploit',
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'Suspicious process detected' } },
      { type: 'log', parameters: { level: 'error' } },
      { type: 'kill_process' },
    ],
    cooldownSeconds: 60,
  },

  {
    id: 'proc-002',
    name: 'Unexpected System Process Location',
    description: 'Detect system processes running from non-standard locations',
    enabled: true,
    severity: 'critical',
    category: 'process',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'process.name',
        operator: 'in_list',
        value: ['svchost.exe', 'lsass.exe', 'csrss.exe', 'winlogon.exe'],
      },
      {
        field: 'process.path',
        operator: 'not_contains',
        value: 'System32',
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'System process in unusual location' } },
      { type: 'kill_process' },
      { type: 'log', parameters: { level: 'error' } },
    ],
    cooldownSeconds: 30,
  },

  {
    id: 'proc-003',
    name: 'High Memory Usage Process',
    description: 'Alert on processes consuming excessive memory',
    enabled: false, // Disabled by default to prevent false positives
    severity: 'medium',
    category: 'process',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'process.memory',
        operator: 'greater_than',
        value: 2000000000, // 2GB
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'Process consuming excessive memory' } },
      { type: 'log', parameters: { level: 'warn' } },
    ],
    cooldownSeconds: 300,
  },

  // Network Policies
  {
    id: 'net-001',
    name: 'Suspicious Port Connection',
    description: 'Block connections to suspicious ports commonly used by malware',
    enabled: true,
    severity: 'high',
    category: 'network',
    conditionLogic: 'OR',
    conditions: [
      {
        field: 'connection.remotePort',
        operator: 'in_list',
        value: [4444, 5555, 6666, 7777, 8888, 9999], // Common C&C ports
      },
      {
        field: 'connection.remotePort',
        operator: 'equals',
        value: 6667, // IRC
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'Connection to suspicious port detected' } },
      { type: 'block_network' },
      { type: 'log', parameters: { level: 'error' } },
    ],
    cooldownSeconds: 60,
  },

  {
    id: 'net-002',
    name: 'SMB Connection to Private IP',
    description: 'Detect SMB connections to private IPs (potential lateral movement)',
    enabled: true,
    severity: 'high',
    category: 'network',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'connection.remotePort',
        operator: 'equals',
        value: 445,
      },
      {
        field: 'connection.remoteAddress',
        operator: 'matches_regex',
        value: '^(10\\.|172\\.(1[6-9]|2[0-9]|3[01])\\.|192\\.168\\.)',
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'SMB connection to private IP detected' } },
      { type: 'log', parameters: { level: 'warn' } },
    ],
    cooldownSeconds: 120,
  },

  {
    id: 'net-003',
    name: 'RDP Connection Attempt',
    description: 'Monitor RDP connections for unauthorized access',
    enabled: true,
    severity: 'medium',
    category: 'network',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'connection.remotePort',
        operator: 'equals',
        value: 3389,
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'RDP connection detected' } },
      { type: 'log', parameters: { level: 'info' } },
    ],
    cooldownSeconds: 300,
  },

  // USB Policies
  {
    id: 'usb-001',
    name: 'Unknown USB Device',
    description: 'Alert on USB devices from unknown vendors',
    enabled: true,
    severity: 'medium',
    category: 'usb',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'device.vendor',
        operator: 'not_in_list',
        value: ['Kingston', 'SanDisk', 'Samsung', 'Logitech', 'Microsoft', 'Apple'],
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'Unknown USB device connected' } },
      { type: 'log', parameters: { level: 'warn' } },
    ],
    cooldownSeconds: 60,
  },

  {
    id: 'usb-002',
    name: 'USB Mass Storage Device',
    description: 'Block USB mass storage devices (data exfiltration prevention)',
    enabled: false, // Disabled by default - can be strict
    severity: 'high',
    category: 'usb',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'device.deviceClass',
        operator: 'contains',
        value: 'storage',
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'USB storage device blocked' } },
      { type: 'block_usb' },
      { type: 'log', parameters: { level: 'warn' } },
    ],
    cooldownSeconds: 30,
  },

  // Registry Policies (Windows)
  {
    id: 'reg-001',
    name: 'Autostart Registry Modification',
    description: 'Detect additions to autostart registry keys (persistence mechanism)',
    enabled: true,
    severity: 'high',
    category: 'registry',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'key.path',
        operator: 'contains',
        value: 'Run',
      },
      {
        field: 'type',
        operator: 'in_list',
        value: ['registry_added', 'registry_modified'],
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'Autostart registry key modified' } },
      { type: 'log', parameters: { level: 'error' } },
    ],
    cooldownSeconds: 30,
  },

  {
    id: 'reg-002',
    name: 'Windows Service Creation',
    description: 'Monitor creation of new Windows services',
    enabled: true,
    severity: 'medium',
    category: 'registry',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'key.path',
        operator: 'contains',
        value: 'Services',
      },
      {
        field: 'type',
        operator: 'equals',
        value: 'registry_added',
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'New Windows service created' } },
      { type: 'log', parameters: { level: 'info' } },
    ],
    cooldownSeconds: 60,
  },

  // Filesystem Policies
  {
    id: 'fs-001',
    name: 'Critical System File Modification',
    description: 'Detect modifications to critical system files',
    enabled: true,
    severity: 'critical',
    category: 'filesystem',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'change.path',
        operator: 'matches_regex',
        value: '.*(passwd|shadow|sudoers|sshd_config|hosts).*',
      },
      {
        field: 'change.changeType',
        operator: 'equals',
        value: 'modified',
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'Critical system file modified' } },
      { type: 'log', parameters: { level: 'error' } },
    ],
    cooldownSeconds: 30,
  },

  {
    id: 'fs-002',
    name: 'Suspicious File Creation in System Directory',
    description: 'Detect new files in system directories',
    enabled: true,
    severity: 'high',
    category: 'filesystem',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'change.path',
        operator: 'matches_regex',
        value: '.*(System32|Windows|etc).*',
      },
      {
        field: 'change.changeType',
        operator: 'equals',
        value: 'created',
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'New file in system directory' } },
      { type: 'quarantine_file' },
      { type: 'log', parameters: { level: 'error' } },
    ],
    cooldownSeconds: 60,
  },

  {
    id: 'fs-003',
    name: 'Hosts File Modification',
    description: 'Detect changes to the hosts file (DNS hijacking)',
    enabled: true,
    severity: 'high',
    category: 'filesystem',
    conditionLogic: 'AND',
    conditions: [
      {
        field: 'change.path',
        operator: 'contains',
        value: 'hosts',
      },
      {
        field: 'change.changeType',
        operator: 'equals',
        value: 'modified',
      },
    ],
    actions: [
      { type: 'alert', parameters: { message: 'Hosts file modified - potential DNS hijacking' } },
      { type: 'log', parameters: { level: 'error' } },
    ],
    cooldownSeconds: 30,
  },
];

/**
 * Get default policies
 */
export function getDefaultPolicies(): SecurityPolicy[] {
  return DEFAULT_POLICIES.map(policy => ({ ...policy }));
}

/**
 * Get policies by category
 */
export function getPoliciesByCategory(category: string): SecurityPolicy[] {
  return DEFAULT_POLICIES.filter(p => p.category === category).map(p => ({ ...p }));
}

/**
 * Get policies by severity
 */
export function getPoliciesBySeverity(severity: string): SecurityPolicy[] {
  return DEFAULT_POLICIES.filter(p => p.severity === severity).map(p => ({ ...p }));
}

/**
 * Get enabled policies only
 */
export function getEnabledPolicies(): SecurityPolicy[] {
  return DEFAULT_POLICIES.filter(p => p.enabled).map(p => ({ ...p }));
}
