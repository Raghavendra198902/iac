import { DollarSign, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AIRecommendationsPanel } from '../components/AIRecommendationsPanel';

export default function CostDashboard() {
  // Load real cost data from APIs - no demo data
  const [costData, setCostData] = useState<any>({
    currentMonth: 0,
    savings: 0,
    budgetUtilization: 0,
    budget: 0,
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [costRes, recommendationsRes] = await Promise.all([
          fetch('/api/costs/summary'),
          fetch('/api/costs/recommendations')
        ]);
        if (costRes.ok) setCostData(await costRes.json());
        if (recommendationsRes.ok) setRecommendations(await recommendationsRes.json());
      } catch (error) {
        console.error('Failed to load cost data:', error);
      }
    };
    loadData();
  }, []);

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
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${costData.currentMonth.toLocaleString()}
          </p>
          <p className="text-sm text-success-600 dark:text-success-400 mt-1 flex items-center gap-1">
            <TrendingDown className="h-4 w-4" />
            Based on actual usage
          </p>
        </div>

        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Potential Savings</p>
          <p className="text-3xl font-bold text-success-600 dark:text-success-400">
            ${costData.savings.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">From ML recommendations</p>
        </div>

        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Budget Utilization</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {costData.budgetUtilization}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ${costData.currentMonth.toLocaleString()} / ${costData.budget.toLocaleString()}
          </p>
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      <AIRecommendationsPanel />

      <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Additional Cost Recommendations
        </h2>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No additional recommendations at this time
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-success-900 dark:text-success-300">{rec.title}</h4>
                    <p className="text-sm text-success-800 dark:text-success-400 mt-1">{rec.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="badge badge-success">{rec.priority}</span>
                      <span className="text-sm text-success-700 dark:text-success-400">{rec.confidence}% confidence</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-success-600 dark:text-success-400">{rec.savings}</p>
                    <p className="text-sm text-success-700 dark:text-success-400">monthly</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
