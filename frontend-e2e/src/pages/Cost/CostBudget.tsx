import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  BellAlertIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Budget {
  id: string;
  name: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  variance: number;
  status: 'under' | 'on-track' | 'warning' | 'exceeded';
  alert_threshold: number;
}

interface Alert {
  id: string;
  budget: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
}

const CostBudget: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate sample budget data
    const generateData = () => {
      const sampleBudgets: Budget[] = [
        {
          id: '1',
          name: 'Production Infrastructure',
          category: 'Compute',
          allocated: 25000,
          spent: 18750,
          remaining: 6250,
          variance: -25.0,
          status: 'on-track',
          alert_threshold: 80
        },
        {
          id: '2',
          name: 'Database Services',
          category: 'Database',
          allocated: 15000,
          spent: 13500,
          remaining: 1500,
          variance: -10.0,
          status: 'warning',
          alert_threshold: 80
        },
        {
          id: '3',
          name: 'Data Storage',
          category: 'Storage',
          allocated: 12000,
          spent: 9600,
          remaining: 2400,
          variance: -20.0,
          status: 'on-track',
          alert_threshold: 80
        },
        {
          id: '4',
          name: 'Network & CDN',
          category: 'Network',
          allocated: 8000,
          spent: 6800,
          remaining: 1200,
          variance: -15.0,
          status: 'on-track',
          alert_threshold: 80
        },
        {
          id: '5',
          name: 'Development Environment',
          category: 'Compute',
          allocated: 10000,
          spent: 8200,
          remaining: 1800,
          variance: -18.0,
          status: 'on-track',
          alert_threshold: 80
        },
        {
          id: '6',
          name: 'Monitoring & Logging',
          category: 'Operations',
          allocated: 5000,
          spent: 4800,
          remaining: 200,
          variance: -4.0,
          status: 'exceeded',
          alert_threshold: 80
        }
      ];

      const sampleAlerts: Alert[] = [
        {
          id: '1',
          budget: 'Database Services',
          type: 'warning',
          message: 'Budget at 90% - approaching limit',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          budget: 'Monitoring & Logging',
          type: 'critical',
          message: 'Budget exceeded by 4%',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '3',
          budget: 'Production Infrastructure',
          type: 'info',
          message: 'On track to meet budget goals',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      setBudgets(sampleBudgets);
      setAlerts(sampleAlerts);
      setLoading(false);
    };

    generateData();
  }, []);

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);

  const budgetTrend = [
    { month: 'Jan', spent: 58000, budget: 70000 },
    { month: 'Feb', spent: 62000, budget: 70000 },
    { month: 'Mar', spent: 59000, budget: 70000 },
    { month: 'Apr', spent: 65000, budget: 70000 },
    { month: 'May', spent: 63000, budget: 70000 },
    { month: 'Jun', spent: 56450, budget: 70000 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under': return 'text-blue-400 bg-blue-400/20';
      case 'on-track': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'exceeded': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-400 bg-blue-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'critical': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <BanknotesIcon className="w-16 h-16 text-green-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-green-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Budget Management
          </h1>
          <p className="text-gray-300">Track and manage your budget allocations</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <BanknotesIcon className="w-10 h-10 text-blue-400" />
              <span className="text-3xl font-bold text-white">${totalAllocated.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Total Budget</h3>
            <p className="text-sm text-gray-300">Monthly allocation</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="w-10 h-10 text-yellow-400" />
              <span className="text-3xl font-bold text-white">${totalSpent.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Total Spent</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-400">{((totalSpent / totalAllocated) * 100).toFixed(1)}% utilized</span>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingDownIcon className="w-10 h-10 text-green-400" />
              <span className="text-3xl font-bold text-white">${totalRemaining.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Remaining</h3>
            <p className="text-sm text-gray-300">Available budget</p>
          </div>
        </div>

        {/* Budget Trend Chart */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-green-400" />
            Budget vs Actual Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="month" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={2} name="Budget" />
              <Line type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={2} name="Actual Spent" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Allocations */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-6 h-6 text-blue-400" />
              Budget Allocations
            </h2>
            <div className="space-y-4">
              {budgets.map((budget) => {
                const percentUsed = (budget.spent / budget.allocated) * 100;
                return (
                  <div key={budget.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-semibold text-lg">{budget.name}</h4>
                        <p className="text-sm text-gray-400">{budget.category}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(budget.status)}`}>
                        {budget.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Spent: ${budget.spent.toLocaleString()}</span>
                        <span className="text-gray-300">Budget: ${budget.allocated.toLocaleString()}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentUsed < 70 ? 'bg-green-400' :
                            percentUsed < 90 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">{percentUsed.toFixed(1)}% used</span>
                        <div className="flex items-center gap-1">
                          {budget.variance < 0 ? (
                            <ArrowTrendingDownIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowTrendingUpIcon className="w-4 h-4 text-red-400" />
                          )}
                          <span className={budget.variance < 0 ? 'text-green-400' : 'text-red-400'}>
                            ${Math.abs(budget.remaining).toLocaleString()} remaining
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget Alerts */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BellAlertIcon className="w-6 h-6 text-yellow-400" />
              Alerts
            </h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`rounded-xl p-4 border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start gap-3">
                    {alert.type === 'critical' ? (
                      <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" />
                    ) : alert.type === 'warning' ? (
                      <BellAlertIcon className="w-6 h-6 flex-shrink-0" />
                    ) : (
                      <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{alert.budget}</h4>
                      <p className="text-sm text-gray-200 mb-2">{alert.message}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default CostBudget;
