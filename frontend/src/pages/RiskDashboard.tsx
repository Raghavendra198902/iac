import { Shield, AlertTriangle } from 'lucide-react';

export default function RiskDashboard() {
  const riskFactors = [
    { category: 'Security', count: 3, severity: 'high', color: 'danger' },
    { category: 'Availability', count: 5, severity: 'medium', color: 'warning' },
    { category: 'Cost', count: 2, severity: 'low', color: 'success' },
    { category: 'Performance', count: 1, severity: 'medium', color: 'warning' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Risk Assessment</h1>
          <p className="text-gray-600 dark:text-gray-300">Multi-dimensional infrastructure risk analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {riskFactors.map((factor) => (
          <div key={factor.category} className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{factor.category}</h3>
              <AlertTriangle className={`h-5 w-5 text-${factor.color}-600`} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{factor.count}</p>
            <p className={`text-sm text-${factor.color}-600 capitalize`}>{factor.severity} severity</p>
          </div>
        ))}
      </div>

      <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Risk Factors</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-danger-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-danger-900 dark:text-danger-300">Unencrypted Storage</h4>
                <p className="text-sm text-danger-800 dark:text-danger-400 mt-1">Storage resources do not have encryption enabled</p>
                <p className="text-sm text-danger-700 dark:text-danger-400 mt-2"><strong>Mitigation:</strong> Enable encryption at rest for all storage</p>
              </div>
              <span className="badge badge-danger">HIGH</span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-warning-900 dark:text-warning-300">Single Point of Failure</h4>
                <p className="text-sm text-warning-800 dark:text-warning-400 mt-1">Only one compute instance - no redundancy</p>
                <p className="text-sm text-warning-700 dark:text-warning-400 mt-2"><strong>Mitigation:</strong> Deploy multiple instances with load balancing</p>
              </div>
              <span className="badge badge-warning">MEDIUM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
