import { useState } from 'react';
import { Zap, Play, Pause, RotateCcw, Clock, CheckCircle, XCircle, Settings } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Progress from '../components/ui/Progress';
import Alert from '../components/ui/Alert';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  steps: number;
  currentStep: number;
  duration: string;
  lastRun: string;
}

interface AutomationTask {
  id: string;
  name: string;
  type: 'deployment' | 'backup' | 'scaling' | 'monitoring';
  schedule: string;
  enabled: boolean;
  lastExecution: string;
  nextExecution: string;
  successRate: number;
}

const AutomationEngine = () => {
  const [workflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Deploy to Production',
      description: 'Full production deployment pipeline',
      status: 'running',
      progress: 65,
      steps: 8,
      currentStep: 5,
      duration: '12m 34s',
      lastRun: '2025-11-16T14:30:00Z',
    },
    {
      id: '2',
      name: 'Database Backup',
      description: 'Automated database backup and verification',
      status: 'completed',
      progress: 100,
      steps: 4,
      currentStep: 4,
      duration: '5m 12s',
      lastRun: '2025-11-16T12:00:00Z',
    },
    {
      id: '3',
      name: 'Infrastructure Scale Up',
      description: 'Scale infrastructure for peak hours',
      status: 'paused',
      progress: 40,
      steps: 6,
      currentStep: 3,
      duration: '8m 45s',
      lastRun: '2025-11-16T10:15:00Z',
    },
  ]);

  const [tasks] = useState<AutomationTask[]>([
    {
      id: '1',
      name: 'Daily Backup',
      type: 'backup',
      schedule: 'Daily at 2:00 AM',
      enabled: true,
      lastExecution: '2025-11-16T02:00:00Z',
      nextExecution: '2025-11-17T02:00:00Z',
      successRate: 98.5,
    },
    {
      id: '2',
      name: 'Auto-scaling Check',
      type: 'scaling',
      schedule: 'Every 15 minutes',
      enabled: true,
      lastExecution: '2025-11-16T14:45:00Z',
      nextExecution: '2025-11-16T15:00:00Z',
      successRate: 99.2,
    },
    {
      id: '3',
      name: 'Health Monitoring',
      type: 'monitoring',
      schedule: 'Every 5 minutes',
      enabled: true,
      lastExecution: '2025-11-16T14:55:00Z',
      nextExecution: '2025-11-16T15:00:00Z',
      successRate: 100,
    },
    {
      id: '4',
      name: 'Weekly Deployment',
      type: 'deployment',
      schedule: 'Sunday at 11:00 PM',
      enabled: false,
      lastExecution: '2025-11-10T23:00:00Z',
      nextExecution: '2025-11-17T23:00:00Z',
      successRate: 95.8,
    },
  ]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'paused':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-orange-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deployment':
        return 'text-blue-600 dark:text-blue-400';
      case 'backup':
        return 'text-green-600 dark:text-green-400';
      case 'scaling':
        return 'text-purple-600 dark:text-purple-400';
      case 'monitoring':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const runningWorkflows = workflows.filter((w) => w.status === 'running').length;
  const completedWorkflows = workflows.filter((w) => w.status === 'completed').length;
  const activeTask = tasks.filter((t) => t.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Automation Engine
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Workflow automation and orchestration
          </p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Zap className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {runningWorkflows}
              </p>
            </div>
            <Play className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {completedWorkflows}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {activeTask}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">98.2%</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Active Workflow Alert */}
      {runningWorkflows > 0 && (
        <Alert variant="info" title={`${runningWorkflows} workflow(s) currently running`}>
          Monitor progress below
        </Alert>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Tabs defaultValue="workflows">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <TabsList>
              <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
              <TabsTrigger value="tasks">Scheduled Tasks</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="workflows">
            <div className="p-6">
              <div className="space-y-6">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(workflow.status)}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {workflow.name}
                          </h3>
                          <Badge variant={getStatusVariant(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          {workflow.description}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {workflow.status === 'running' && (
                          <button className="btn btn-warning btn-sm">
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </button>
                        )}
                        {workflow.status === 'paused' && (
                          <button className="btn btn-success btn-sm">
                            <Play className="w-4 h-4 mr-1" />
                            Resume
                          </button>
                        )}
                        <button className="btn btn-secondary btn-sm">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restart
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          Step {workflow.currentStep} of {workflow.steps}
                        </span>
                        <span>Duration: {workflow.duration}</span>
                      </div>
                      <Progress
                        value={workflow.progress}
                        variant={
                          workflow.status === 'completed'
                            ? 'success'
                            : workflow.status === 'running'
                            ? 'info'
                            : 'default'
                        }
                        showLabel
                      />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Last run: {new Date(workflow.lastRun).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="p-6">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {task.name}
                          </h3>
                          <span className={`text-sm font-medium uppercase ${getTypeColor(task.type)}`}>
                            {task.type}
                          </span>
                          <Badge variant={task.enabled ? 'success' : 'default'}>
                            {task.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Schedule</p>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">
                              {task.schedule}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Success Rate</p>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">
                              {task.successRate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Last Execution</p>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">
                              {new Date(task.lastExecution).toLocaleTimeString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Next Execution</p>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">
                              {new Date(task.nextExecution).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button className="btn btn-secondary btn-sm">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          className={`btn btn-sm ${
                            task.enabled ? 'btn-warning' : 'btn-success'
                          }`}
                        >
                          {task.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button className="btn btn-primary btn-sm">
                          <Play className="w-4 h-4 mr-1" />
                          Run Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="p-6">
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Workflow execution history</p>
                <p className="text-sm mt-2">View past executions and their results</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="p-6">
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Automation Settings</p>
                <p className="text-sm mt-2">Configure global automation preferences</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AutomationEngine;
