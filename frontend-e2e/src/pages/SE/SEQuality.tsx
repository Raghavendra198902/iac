import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  BugAntIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface QualityMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  status: 'pass' | 'warning' | 'fail';
  category: 'testing' | 'security' | 'performance' | 'reliability';
}

const SEQuality: React.FC = () => {
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sampleMetrics: QualityMetric[] = [
      { id: '1', name: 'Unit Test Coverage', value: 87, threshold: 80, status: 'pass', category: 'testing' },
      { id: '2', name: 'Integration Test Pass Rate', value: 94, threshold: 90, status: 'pass', category: 'testing' },
      { id: '3', name: 'Security Vulnerabilities', value: 2, threshold: 5, status: 'pass', category: 'security' },
      { id: '4', name: 'Code Smells', value: 12, threshold: 20, status: 'pass', category: 'reliability' },
      { id: '5', name: 'Technical Debt Ratio', value: 3.2, threshold: 5, status: 'pass', category: 'reliability' },
      { id: '6', name: 'Response Time (p95)', value: 245, threshold: 300, status: 'pass', category: 'performance' }
    ];
    setMetrics(sampleMetrics);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'fail': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <ArrowPathIcon className="w-16 h-16 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
          Quality Assurance
        </h1>
        <p className="text-gray-300 mb-8">Testing, security, and quality metrics</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <CheckCircleIcon className="w-8 h-8 text-green-400 mb-2" />
            <span className="text-3xl font-bold text-white">94%</span>
            <h3 className="text-lg font-semibold text-white">Test Pass Rate</h3>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <ShieldCheckIcon className="w-8 h-8 text-purple-400 mb-2" />
            <span className="text-3xl font-bold text-white">2</span>
            <h3 className="text-lg font-semibold text-white">Vulnerabilities</h3>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <BugAntIcon className="w-8 h-8 text-yellow-400 mb-2" />
            <span className="text-3xl font-bold text-white">8</span>
            <h3 className="text-lg font-semibold text-white">Open Bugs</h3>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <ChartBarIcon className="w-8 h-8 text-pink-400 mb-2" />
            <span className="text-3xl font-bold text-white">3.2%</span>
            <h3 className="text-lg font-semibold text-white">Tech Debt</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metrics.map((metric) => (
            <div key={metric.id} className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{metric.name}</h3>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(metric.status)}`}>
                    {metric.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-3xl font-bold text-white">{metric.value}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Threshold</span>
                <span className="text-white font-semibold">{metric.threshold}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`.animation-delay-2000 { animation-delay: 2s; }`}</style>
    </div>
  );
};

export default SEQuality;
