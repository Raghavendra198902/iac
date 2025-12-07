import React, { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  steps: WorkflowStep[];
  progress: number;
  startTime: string;
  duration?: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: string;
}

const DeploymentWorkflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 100); // 0.1s refresh
    return () => clearInterval(interval);
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerWorkflow = async (type: string) => {
    try {
      const response = await fetch('http://localhost:4000/api/workflows/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (response.ok) {
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'paused':
        return <PauseIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Deployment Workflows
            <span className="ml-3 inline-flex items-center">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="ml-2 text-sm font-medium text-green-600">LIVE</span>
            </span>
          </h1>
          <p className="text-gray-600">Automated deployment pipelines</p>
        </div>
        <div className="space-x-3">
          <button
            onClick={() => triggerWorkflow('infrastructure')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlayIcon className="h-5 w-5 inline mr-2" />
            Deploy Infrastructure
          </button>
          <button
            onClick={() => triggerWorkflow('application')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlayIcon className="h-5 w-5 inline mr-2" />
            Deploy Application
          </button>
        </div>
      </div>

      {/* Workflows List */}
      {isLoading ? (
        <div className="text-center py-12">
          <ArrowPathIcon className="h-12 w-12 text-gray-400 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading workflows...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Workflow Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(workflow.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(workflow.status)}`}>
                      {workflow.status.toUpperCase()}
                    </span>
                    <p className="mt-2 text-sm text-gray-600">
                      Started: {new Date(workflow.startTime).toLocaleTimeString()}
                    </p>
                    {workflow.duration && (
                      <p className="text-sm text-gray-600">Duration: {workflow.duration}</p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-700">{workflow.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        workflow.status === 'completed'
                          ? 'bg-green-500'
                          : workflow.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${workflow.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Steps</h4>
                <div className="space-y-3">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full text-sm font-semibold text-gray-700 border-2 border-gray-300">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{step.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {step.duration && (
                          <span className="text-xs text-gray-600">{step.duration}</span>
                        )}
                        {getStatusIcon(step.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {workflows.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Workflows</h3>
              <p className="text-gray-600 mb-6">Click the buttons above to trigger a deployment workflow</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeploymentWorkflows;
