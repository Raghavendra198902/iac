import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Risk {
  id: string;
  title: string;
  project: string;
  category: 'technical' | 'security' | 'resource' | 'schedule' | 'budget' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  probability: number;
  impact: number;
  status: 'open' | 'mitigating' | 'resolved' | 'accepted';
  description: string;
  mitigation: string;
  owner: string;
  dueDate: string;
  riskScore: number;
}

const PMRisks: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = () => {
    const sampleRisks: Risk[] = [
      {
        id: '1',
        title: 'Database Performance Degradation',
        project: 'IAC Dharma v3.0',
        category: 'technical',
        severity: 'high',
        probability: 60,
        impact: 80,
        status: 'mitigating',
        description: 'PostgreSQL performance issues under high load may affect user experience',
        mitigation: 'Implementing read replicas and connection pooling; monitoring query performance',
        owner: 'Sarah Chen',
        dueDate: '2024-12-15',
        riskScore: 48
      },
      {
        id: '2',
        title: 'Zero Trust Implementation Complexity',
        project: 'IAC Dharma v3.0',
        category: 'security',
        severity: 'high',
        probability: 70,
        impact: 75,
        status: 'mitigating',
        description: 'Complex zero trust architecture may introduce unforeseen security gaps',
        mitigation: 'Conducting security audit and penetration testing; implementing defense in depth',
        owner: 'Emily Watson',
        dueDate: '2024-12-10',
        riskScore: 52.5
      },
      {
        id: '3',
        title: 'Key Personnel Availability',
        project: 'IAC Dharma v3.0',
        category: 'resource',
        severity: 'medium',
        probability: 40,
        impact: 70,
        status: 'open',
        description: 'Limited availability of ML engineers may delay AIOps features',
        mitigation: 'Cross-training team members; engaging contractors as backup',
        owner: 'David Kim',
        dueDate: '2024-12-20',
        riskScore: 28
      },
      {
        id: '4',
        title: 'Production Deployment Timeline',
        project: 'IAC Dharma v3.0',
        category: 'schedule',
        severity: 'medium',
        probability: 50,
        impact: 60,
        status: 'open',
        description: 'Aggressive deployment schedule may lead to quality issues',
        mitigation: 'Implementing comprehensive testing; scheduling buffer time',
        owner: 'Lisa Anderson',
        dueDate: '2024-12-22',
        riskScore: 30
      },
      {
        id: '5',
        title: 'Cloud Cost Overrun',
        project: 'IAC Dharma v3.0',
        category: 'budget',
        severity: 'medium',
        probability: 55,
        impact: 50,
        status: 'mitigating',
        description: 'Multi-cloud infrastructure costs exceeding budget projections',
        mitigation: 'Implementing cost monitoring and optimization; rightsizing resources',
        owner: 'James Wilson',
        dueDate: '2024-12-31',
        riskScore: 27.5
      },
      {
        id: '6',
        title: 'GDPR Compliance Gap',
        project: 'IAC Dharma v3.0',
        category: 'compliance',
        severity: 'critical',
        probability: 30,
        impact: 95,
        status: 'open',
        description: 'Data residency requirements may not be fully met for EU customers',
        mitigation: 'Engaging compliance consultant; implementing data localization features',
        owner: 'Emily Watson',
        dueDate: '2024-12-18',
        riskScore: 28.5
      },
      {
        id: '7',
        title: 'API Rate Limiting Issues',
        project: 'IAC Dharma v3.0',
        category: 'technical',
        severity: 'low',
        probability: 35,
        impact: 40,
        status: 'accepted',
        description: 'GraphQL API may experience rate limiting under extreme load',
        mitigation: 'Documented acceptable risk; implementing caching strategies',
        owner: 'Michael Rodriguez',
        dueDate: '2025-01-15',
        riskScore: 14
      },
      {
        id: '8',
        title: 'Third-Party Service Dependency',
        project: 'IAC Dharma v3.0',
        category: 'technical',
        severity: 'medium',
        probability: 45,
        impact: 65,
        status: 'resolved',
        description: 'External API dependencies create single point of failure',
        mitigation: 'Implemented circuit breakers and fallback mechanisms; monitoring SLAs',
        owner: 'Sarah Chen',
        dueDate: '2024-12-05',
        riskScore: 29.25
      }
    ];

    setRisks(sampleRisks);
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'high':
        return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'low':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-red-400 bg-red-400/20';
      case 'mitigating':
        return 'text-blue-400 bg-blue-400/20';
      case 'resolved':
        return 'text-green-400 bg-green-400/20';
      case 'accepted':
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const categories = ['all', 'technical', 'security', 'resource', 'schedule', 'budget', 'compliance'];
  const severities = ['all', 'critical', 'high', 'medium', 'low'];

  const filteredRisks = risks.filter(r => {
    const categoryMatch = selectedCategory === 'all' || r.category === selectedCategory;
    const severityMatch = selectedSeverity === 'all' || r.severity === selectedSeverity;
    return categoryMatch && severityMatch;
  });

  const criticalRisks = risks.filter(r => r.severity === 'critical' && r.status !== 'resolved').length;
  const openRisks = risks.filter(r => r.status === 'open').length;
  const avgRiskScore = risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-red-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading risks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
            Risk Management
          </h1>
          <p className="text-gray-300">Project risks, mitigation strategies, and tracking</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <div className="flex gap-2">
            <span className="text-gray-300 font-semibold self-center">Category:</span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="text-gray-300 font-semibold self-center">Severity:</span>
            {severities.map((severity) => (
              <button
                key={severity}
                onClick={() => setSelectedSeverity(severity)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedSeverity === severity
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {severity}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              <span className="text-3xl font-bold text-white">{risks.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Risks</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ShieldExclamationIcon className="w-8 h-8 text-orange-400" />
              <span className="text-3xl font-bold text-white">{criticalRisks}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Critical/High</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{openRisks}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Open</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{avgRiskScore.toFixed(1)}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Avg Risk Score</h3>
          </div>
        </div>

        {/* Risks List */}
        <div className="space-y-4">
          {filteredRisks.map((risk) => (
            <div
              key={risk.id}
              className={`backdrop-blur-xl bg-white/10 rounded-2xl p-6 border-2 hover:bg-white/15 transition-all ${getSeverityColor(risk.severity)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{risk.title}</h3>
                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getSeverityColor(risk.severity)}`}>
                        {risk.severity.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(risk.status)}`}>
                        {risk.status.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-white/10 text-gray-300 capitalize">
                        {risk.category}
                      </span>
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-purple-400/20 text-purple-400">
                        Score: {risk.riskScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-white">{risk.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Mitigation Strategy</p>
                  <p className="text-sm text-white">{risk.mitigation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Probability</span>
                    <span className="text-white font-semibold">{risk.probability}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                      style={{ width: `${risk.probability}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Impact</span>
                    <span className="text-white font-semibold">{risk.impact}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                      style={{ width: `${risk.impact}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Owner: <span className="text-white font-semibold">{risk.owner}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Due: <span className="text-white font-semibold">{risk.dueDate}</span></span>
                </div>
                <div>
                  <span className="text-sm text-gray-300">Project: <span className="text-white font-semibold">{risk.project}</span></span>
                </div>
              </div>
            </div>
          ))}
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

export default PMRisks;
