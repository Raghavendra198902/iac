import { DollarSign, TrendingDown } from 'lucide-react';

export default function CostDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cost Management</h1>
          <p className="text-gray-600 dark:text-gray-300">TCO calculation and cost optimization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Month</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">$12,450</p>
          <p className="text-sm text-success-600 dark:text-success-400 mt-1 flex items-center gap-1">
            <TrendingDown className="h-4 w-4" />
            15% lower than last month
          </p>
        </div>

        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Potential Savings</p>
          <p className="text-3xl font-bold text-success-600 dark:text-success-400">$2,340</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">From ML recommendations</p>
        </div>

        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Budget Utilization</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">62%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">$12,450 / $20,000</p>
        </div>
      </div>

      <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cost Optimization Recommendations</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-success-900 dark:text-success-300">Reserved Instances</h4>
                <p className="text-sm text-success-800 dark:text-success-400 mt-1">Commit to 1-year reserved instances for predictable workloads</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge badge-success">HIGH PRIORITY</span>
                  <span className="text-sm text-success-700 dark:text-success-400">85% confidence</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success-600 dark:text-success-400">$1,200</p>
                <p className="text-sm text-success-700 dark:text-success-400">monthly savings</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-success-900 dark:text-success-300">Storage Lifecycle Policies</h4>
                <p className="text-sm text-success-800 dark:text-success-400 mt-1">Move infrequently accessed data to cheaper storage tiers</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge badge-warning">MEDIUM PRIORITY</span>
                  <span className="text-sm text-success-700 dark:text-success-400">78% confidence</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success-600 dark:text-success-400">$450</p>
                <p className="text-sm text-success-700 dark:text-success-400">monthly savings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
