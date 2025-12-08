import React, { useState, useEffect } from 'react';
import {
  CommandLineIcon,
  ArrowPathIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DevelopmentMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'velocity' | 'quality' | 'efficiency' | 'collaboration';
}

const SEDevelopment: React.FC = () => {
  const [metrics, setMetrics] = useState<DevelopmentMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sampleMetrics: DevelopmentMetric[] = [
      { id: '1', name: 'Sprint Velocity', value: 42, unit: 'points', trend: 'up', category: 'velocity' },
      { id: '2', name: 'Code Coverage', value: 87, unit: '%', trend: 'stable', category: 'quality' },
      { id: '3', name: 'Deployment Frequency', value: 12, unit: 'per week', trend: 'up', category: 'efficiency' },
      { id: '4', name: 'Lead Time', value: 3.2, unit: 'days', trend: 'down', category: 'efficiency' },
      { id: '5', name: 'Code Review Time', value: 4.5, unit: 'hours', trend: 'down', category: 'collaboration' },
      { id: '6', name: 'Bug Resolution Time', value: 2.8, unit: 'days', trend: 'down', category: 'quality' }
    ];
    setMetrics(sampleMetrics);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <ArrowPathIcon className="w-16 h-16 text-green-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-green-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
          Software Development
        </h1>
        <p className="text-gray-300 mb-8">Development metrics, velocity, and code quality</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <CodeBracketIcon className="w-8 h-8 text-green-400 mb-2" />
            <span className="text-3xl font-bold text-white">156</span>
            <h3 className="text-lg font-semibold text-white">Commits (7d)</h3>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <CheckCircleIcon className="w-8 h-8 text-emerald-400 mb-2" />
            <span className="text-3xl font-bold text-white">87%</span>
            <h3 className="text-lg font-semibold text-white">Code Coverage</h3>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <ChartBarIcon className="w-8 h-8 text-teal-400 mb-2" />
            <span className="text-3xl font-bold text-white">42</span>
            <h3 className="text-lg font-semibold text-white">Sprint Velocity</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metrics.map((metric) => (
            <div key={metric.id} className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">{metric.name}</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-white">{metric.value}</span>
                <span className="text-lg text-gray-400 mb-1">{metric.unit}</span>
                <span className={`ml-auto text-sm font-semibold ${
                  metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
              <span className="px-3 py-1 rounded text-xs font-semibold bg-green-400/20 text-green-400 capitalize">
                {metric.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`.animation-delay-2000 { animation-delay: 2s; }`}</style>
    </div>
  );
};

export default SEDevelopment;
