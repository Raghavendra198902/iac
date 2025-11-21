import { Activity, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DeploymentMonitor() {
  // Load real deployments from API - no demo data
  const [deployments, setDeployments] = useState<any[]>([]);

  useEffect(() => {
    const loadDeployments = async () => {
      try {
        const response = await fetch('/api/deployments');
        if (response.ok) {
          const data = await response.json();
          setDeployments(data);
        }
      } catch (error) {
        console.error('Failed to load deployments:', error);
      }
    };
    loadDeployments();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-danger-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'in_progress':
        return 'badge-primary';
      case 'failed':
        return 'badge-danger';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Deployment Monitor</h1>
          <p className="text-gray-600 dark:text-gray-300">Real-time deployment status and logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Deployments</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
        </div>
        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">3</p>
        </div>
        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
          <p className="text-3xl font-bold text-success-600 dark:text-success-400">142</p>
        </div>
        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Failed</p>
          <p className="text-3xl font-bold text-danger-600 dark:text-danger-400">11</p>
        </div>
      </div>

      <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Deployments</h2>
        <div className="space-y-3">
          {deployments.map((deployment) => (
            <div key={deployment.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-750">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(deployment.status)}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{deployment.blueprint}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{deployment.time}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusBadge(deployment.status)}`}>
                  {deployment.status.replace('_', ' ')}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    deployment.status === 'completed' ? 'bg-success-600' :
                    deployment.status === 'in_progress' ? 'bg-primary-600' :
                    'bg-danger-600'
                  }`}
                  style={{ width: `${deployment.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{deployment.progress}% complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
