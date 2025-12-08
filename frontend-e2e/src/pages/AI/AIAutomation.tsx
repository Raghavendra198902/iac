import React, { useState } from 'react';
import { 
  BoltIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'paused' | 'inactive';
  executions: number;
  successRate: number;
  avgDuration: string;
  lastRun: string;
}

interface AutomationTask {
  id: string;
  ruleName: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: string;
  duration: string;
  actions: Array<{
    name: string;
    status: 'completed' | 'running' | 'pending' | 'failed';
  }>;
}

const AIAutomation: React.FC = () => {
  const [rules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-Scale on High CPU',
      description: 'Automatically scale up instances when CPU > 80% for 5 minutes',
      trigger: 'CPU > 80% for 5 min',
      actions: ['Scale up by 2 instances', 'Send notification', 'Update capacity plan'],
      status: 'active',
      executions: 342,
      successRate: 98.5,
      avgDuration: '45s',
      lastRun: '2 hours ago'
    },
    {
      id: '2',
      name: 'Cost Optimization - Idle Resources',
      description: 'Stop EC2 instances with <5% CPU for 24+ hours',
      trigger: 'Idle detection',
      actions: ['Stop instance', 'Tag for review', 'Generate cost report'],
      status: 'active',
      executions: 156,
      successRate: 100,
      avgDuration: '12s',
      lastRun: '1 day ago'
    },
    {
      id: '3',
      name: 'Security Patch Auto-Apply',
      description: 'Apply critical security patches during maintenance window',
      trigger: 'Critical CVE detected',
      actions: ['Create snapshot', 'Apply patch', 'Verify integrity', 'Notify team'],
      status: 'active',
      executions: 89,
      successRate: 94.3,
      avgDuration: '8m 15s',
      lastRun: '3 hours ago'
    },
    {
      id: '4',
      name: 'Database Backup Optimization',
      description: 'Optimize backup schedules based on change rate',
      trigger: 'Daily at 2 AM',
      actions: ['Analyze change rate', 'Adjust schedule', 'Compress backups'],
      status: 'active',
      executions: 245,
      successRate: 99.2,
      avgDuration: '3m 42s',
      lastRun: '12 hours ago'
    },
    {
      id: '5',
      name: 'Traffic Spike Response',
      description: 'Auto-adjust resources during traffic spikes',
      trigger: 'Traffic > 150% baseline',
      actions: ['Enable CDN cache', 'Scale app servers', 'Activate WAF rules'],
      status: 'paused',
      executions: 67,
      successRate: 95.5,
      avgDuration: '1m 23s',
      lastRun: '5 days ago'
    },
    {
      id: '6',
      name: 'Log Retention Cleanup',
      description: 'Archive old logs and clean up storage',
      trigger: 'Weekly on Sunday',
      actions: ['Archive to S3', 'Delete local copies', 'Update index'],
      status: 'active',
      executions: 52,
      successRate: 100,
      avgDuration: '15m 30s',
      lastRun: '2 days ago'
    }
  ]);

  const [tasks] = useState<AutomationTask[]>([
    {
      id: '1',
      ruleName: 'Auto-Scale on High CPU',
      status: 'running',
      startTime: '5 minutes ago',
      duration: '5m 12s',
      actions: [
        { name: 'Check CPU metrics', status: 'completed' },
        { name: 'Calculate capacity', status: 'completed' },
        { name: 'Launch new instances', status: 'running' },
        { name: 'Update load balancer', status: 'pending' },
        { name: 'Send notification', status: 'pending' }
      ]
    },
    {
      id: '2',
      ruleName: 'Security Patch Auto-Apply',
      status: 'completed',
      startTime: '3 hours ago',
      duration: '8m 23s',
      actions: [
        { name: 'Create snapshot', status: 'completed' },
        { name: 'Apply patch', status: 'completed' },
        { name: 'Verify integrity', status: 'completed' },
        { name: 'Notify team', status: 'completed' }
      ]
    },
    {
      id: '3',
      ruleName: 'Database Backup Optimization',
      status: 'completed',
      startTime: '12 hours ago',
      duration: '3m 45s',
      actions: [
        { name: 'Analyze change rate', status: 'completed' },
        { name: 'Adjust schedule', status: 'completed' },
        { name: 'Compress backups', status: 'completed' }
      ]
    },
    {
      id: '4',
      ruleName: 'Cost Optimization - Idle Resources',
      status: 'pending',
      startTime: 'Scheduled in 10 min',
      duration: 'Est. 12s',
      actions: [
        { name: 'Scan for idle resources', status: 'pending' },
        { name: 'Stop instances', status: 'pending' },
        { name: 'Generate report', status: 'pending' }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paused':
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive':
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'running':
        return <ArrowPathIcon className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BoltIcon className="w-8 h-8 text-yellow-400" />
            AI Automation
          </h1>
          <p className="text-gray-400 mt-1">
            Intelligent automation rules and workflows
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2">
          <Cog6ToothIcon className="w-5 h-5" />
          Create Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Rules</span>
            <BoltIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">5</div>
          <div className="text-sm text-gray-400 mt-1">1 paused</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Executions</span>
            <PlayIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">951</div>
          <div className="text-sm text-green-400 mt-1">This month</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Success Rate</span>
            <CheckCircleIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">97.9%</div>
          <div className="text-sm text-green-400 mt-1">↑ 2.1%</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Time Saved</span>
            <ClockIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">142h</div>
          <div className="text-sm text-gray-400 mt-1">This month</div>
        </div>
      </div>

      {/* Automation Rules */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Automation Rules</h2>
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(rule.status)}`}>
                      {rule.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{rule.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-semibold">
                      Trigger: {rule.trigger}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-green-400">
                    <PlayIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg text-yellow-400">
                    <PauseIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg text-red-400">
                    <StopIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <span className="text-xs text-gray-400 mb-2 block">Actions:</span>
                <div className="flex flex-wrap gap-2">
                  {rule.actions.map((action, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-300 border border-white/10">
                      {action}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-3 border-t border-white/10">
                <div>
                  <span className="text-xs text-gray-400 block">Executions</span>
                  <span className="text-sm text-white font-semibold">{rule.executions}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Success Rate</span>
                  <span className="text-sm text-green-400 font-semibold">{rule.successRate}%</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Avg Duration</span>
                  <span className="text-sm text-white font-semibold">{rule.avgDuration}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Last Run</span>
                  <span className="text-sm text-white font-semibold">{rule.lastRun}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Tasks */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-blue-400" />
          Active & Recent Tasks
        </h2>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-semibold">{task.ruleName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Started: {task.startTime}</span>
                  <span>Duration: {task.duration}</span>
                </div>
              </div>

              <div className="space-y-2">
                {task.actions.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10"
                  >
                    {getActionStatusIcon(action.status)}
                    <span className="text-sm text-gray-300 flex-1">{action.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(action.status)}`}>
                      {action.status}
                    </span>
                  </div>
                ))}
              </div>

              {task.status === 'running' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((task.actions.filter(a => a.status === 'completed').length / task.actions.length) * 100)}%</span>
                  </div>
                  <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all"
                      style={{ width: `${(task.actions.filter(a => a.status === 'completed').length / task.actions.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAutomation;
