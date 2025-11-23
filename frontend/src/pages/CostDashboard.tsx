import { DollarSign, TrendingDown, TrendingUp, AlertCircle, Cloud, PieChart, BarChart3, Calendar, Target, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AIRecommendationsPanel } from '../components/AIRecommendationsPanel';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import FadeIn from '../components/ui/FadeIn';

interface CostData {
  currentMonth: number;
  savings: number;
  budgetUtilization: number;
  budget: number;
  trend: 'up' | 'down';
  trendPercentage: number;
}

interface ForecastData {
  month: string;
  actual?: number;
  forecast: number;
  lower: number;
  upper: number;
}

interface CostBreakdown {
  service: string;
  cost: number;
  percentage: number;
  trend: 'up' | 'down';
  change: number;
}

interface CloudCost {
  provider: string;
  cost: number;
  services: number;
  trend: 'up' | 'down';
  percentage: number;
}

interface Anomaly {
  id: string;
  date: string;
  service: string;
  expected: number;
  actual: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
}

export default function CostDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Load real cost data from APIs - no demo data
  const [costData, setCostData] = useState<CostData>({
    currentMonth: 0,
    savings: 0,
    budgetUtilization: 0,
    budget: 0,
    trend: 'down',
    trendPercentage: 0,
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [cloudCosts, setCloudCosts] = useState<CloudCost[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [costRes, recommendationsRes, forecastRes, breakdownRes, cloudRes, anomalyRes] = await Promise.all([
          fetch('/api/costs/summary'),
          fetch('/api/costs/recommendations'),
          fetch('/api/costs/forecast'),
          fetch('/api/costs/breakdown'),
          fetch('/api/costs/cloud-comparison'),
          fetch('/api/costs/anomalies')
        ]);
        if (costRes.ok) setCostData(await costRes.json());
        if (recommendationsRes.ok) setRecommendations(await recommendationsRes.json());
        if (forecastRes.ok) setForecastData(await forecastRes.json());
        if (breakdownRes.ok) setCostBreakdown(await breakdownRes.json());
        if (cloudRes.ok) setCloudCosts(await cloudRes.json());
        if (anomalyRes.ok) setAnomalies(await anomalyRes.json());
      } catch (error) {
        console.error('Failed to load cost data:', error);
      }
    };
    loadData();
  }, []);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const pieData = costBreakdown.map(item => ({ name: item.service, value: item.cost }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cost Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">TCO calculation, forecasting, and cost optimization</p>
          </div>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <FadeIn delay={0.1}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Month Spend</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${costData.currentMonth.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 mb-1 ${costData.trend === 'down' ? 'text-green-600' : 'text-red-600'}`}>
                {costData.trend === 'down' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                <span className="text-sm font-medium">{costData.trendPercentage}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Based on actual usage</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 shadow-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-900 dark:text-green-300 mb-1">Potential Savings</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              ${costData.savings.toLocaleString()}
            </p>
            <p className="text-xs text-green-800 dark:text-green-300 mt-2 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              From AI recommendations
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Budget Utilization</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {costData.budgetUtilization}%
            </p>
            <div className="mt-3">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    costData.budgetUtilization > 90 ? 'bg-red-500' : 
                    costData.budgetUtilization > 75 ? 'bg-orange-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(costData.budgetUtilization, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                ${costData.currentMonth.toLocaleString()} / ${costData.budget.toLocaleString()}
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-6 shadow-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-900 dark:text-orange-300 mb-1">Cost Anomalies</p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">
              {anomalies.length}
            </p>
            <p className="text-xs text-orange-800 dark:text-orange-300 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Detected by ML
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Cost Forecast */}
      <FadeIn delay={0.5}>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cost Forecast (Next 6 Months)</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">ML-powered predictive analysis with confidence intervals</p>
              </div>
            </div>
            <Badge variant="default">95% Confidence</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : '#fff', 
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Area type="monotone" dataKey="upper" stroke="none" fill="#93c5fd" fillOpacity={0.2} name="Upper Bound" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#93c5fd" fillOpacity={0.2} name="Lower Bound" />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
              <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </FadeIn>

      {/* Tabs for Detailed Views */}
      <Tabs defaultValue="breakdown">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <TabsList>
              <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
              <TabsTrigger value="clouds">Multi-Cloud Comparison</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="breakdown">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost by Service - Bar Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Cost by Service
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="service" tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1f2937' : '#fff', 
                          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="cost" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Cost Distribution - Pie Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Cost Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1f2937' : '#fff', 
                          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px'
                        }} 
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Details</h3>
                <div className="space-y-3">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                          <span className="font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                            {item.service[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.service}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={item.trend === 'down' ? 'success' : 'warning'}>
                              {item.trend === 'down' ? '↓' : '↑'} {item.change}%
                            </Badge>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {item.percentage}% of total
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          ${item.cost.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">this month</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clouds">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Multi-Cloud Cost Comparison</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Compare spending across cloud providers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cloudCosts.map((cloud, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cloud.provider}</h3>
                      <Badge variant={cloud.trend === 'down' ? 'success' : 'warning'}>
                        {cloud.trend === 'down' ? '↓' : '↑'}
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      ${cloud.cost.toLocaleString()}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Services:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{cloud.services}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">% of Total:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{cloud.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="anomalies">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cost Anomaly Detection</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ML-detected unusual spending patterns</p>
                </div>
              </div>

              <div className="space-y-4">
                {anomalies.map((anomaly) => (
                  <div key={anomaly.id} className={`p-4 rounded-lg border ${
                    anomaly.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    anomaly.severity === 'medium' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
                    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={
                            anomaly.severity === 'high' ? 'error' :
                            anomaly.severity === 'medium' ? 'warning' :
                            'default'
                          }>
                            {anomaly.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{anomaly.date}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{anomaly.service}</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Expected: ${anomaly.expected.toLocaleString()} | Actual: ${anomaly.actual.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                          +{anomaly.deviation}%
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">deviation</p>
                      </div>
                    </div>
                  </div>
                ))}

                {anomalies.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No anomalies detected</p>
                    <p className="text-sm mt-2">Your spending is within expected ranges</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimization">
            <div className="p-6">
              {/* AI-Powered Recommendations */}
              <AIRecommendationsPanel />

              <div className="mt-6">
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
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
