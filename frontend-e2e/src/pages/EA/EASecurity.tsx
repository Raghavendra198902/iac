import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  LockClosedIcon,
  KeyIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';

interface SecurityControl {
  id: string;
  name: string;
  category: 'access' | 'data' | 'network' | 'application' | 'compliance';
  framework: string;
  status: 'implemented' | 'partial' | 'planned' | 'not-implemented';
  effectiveness: number;
  lastAudit: string;
  findings: number;
}

const EASecurity: React.FC = () => {
  const [controls, setControls] = useState<SecurityControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadSecurityArchitecture();
  }, []);

  const loadSecurityArchitecture = () => {
    const sampleControls: SecurityControl[] = [
      {
        id: '1',
        name: 'Multi-Factor Authentication',
        category: 'access',
        framework: 'NIST 800-53',
        status: 'implemented',
        effectiveness: 98,
        lastAudit: '2024-11-15',
        findings: 0
      },
      {
        id: '2',
        name: 'Data Encryption at Rest',
        category: 'data',
        framework: 'ISO 27001',
        status: 'implemented',
        effectiveness: 95,
        lastAudit: '2024-10-28',
        findings: 1
      },
      {
        id: '3',
        name: 'Zero Trust Network Access',
        category: 'network',
        framework: 'NIST Zero Trust',
        status: 'implemented',
        effectiveness: 92,
        lastAudit: '2024-12-01',
        findings: 2
      },
      {
        id: '4',
        name: 'API Security Gateway',
        category: 'application',
        framework: 'OWASP API Security',
        status: 'implemented',
        effectiveness: 88,
        lastAudit: '2024-11-20',
        findings: 3
      },
      {
        id: '5',
        name: 'GDPR Compliance Controls',
        category: 'compliance',
        framework: 'GDPR',
        status: 'implemented',
        effectiveness: 96,
        lastAudit: '2024-10-15',
        findings: 1
      },
      {
        id: '6',
        name: 'Database Activity Monitoring',
        category: 'data',
        framework: 'PCI DSS',
        status: 'partial',
        effectiveness: 75,
        lastAudit: '2024-11-10',
        findings: 5
      },
      {
        id: '7',
        name: 'Web Application Firewall',
        category: 'network',
        framework: 'OWASP Top 10',
        status: 'implemented',
        effectiveness: 90,
        lastAudit: '2024-12-05',
        findings: 2
      },
      {
        id: '8',
        name: 'Security Information Event Management',
        category: 'compliance',
        framework: 'SOC 2',
        status: 'implemented',
        effectiveness: 93,
        lastAudit: '2024-11-25',
        findings: 1
      },
      {
        id: '9',
        name: 'Container Security Scanning',
        category: 'application',
        framework: 'CIS Benchmarks',
        status: 'partial',
        effectiveness: 72,
        lastAudit: '2024-11-18',
        findings: 8
      },
      {
        id: '10',
        name: 'Privileged Access Management',
        category: 'access',
        framework: 'NIST 800-53',
        status: 'planned',
        effectiveness: 45,
        lastAudit: '2024-09-30',
        findings: 12
      }
    ];

    setControls(sampleControls);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'text-green-400 bg-green-400/20';
      case 'partial':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'planned':
        return 'text-blue-400 bg-blue-400/20';
      case 'not-implemented':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
      case 'partial':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />;
      case 'planned':
        return <XCircleIcon className="w-6 h-6 text-blue-400" />;
      case 'not-implemented':
        return <XCircleIcon className="w-6 h-6 text-red-400" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'access':
        return <KeyIcon className="w-5 h-5 text-blue-400" />;
      case 'data':
        return <LockClosedIcon className="w-5 h-5 text-green-400" />;
      case 'network':
        return <ShieldCheckIcon className="w-5 h-5 text-purple-400" />;
      case 'application':
        return <FingerPrintIcon className="w-5 h-5 text-orange-400" />;
      case 'compliance':
        return <CheckCircleIcon className="w-5 h-5 text-cyan-400" />;
      default:
        return null;
    }
  };

  const categories = ['all', 'access', 'data', 'network', 'application', 'compliance'];
  const filteredControls = selectedCategory === 'all' 
    ? controls 
    : controls.filter(c => c.category === selectedCategory);

  const implementedCount = controls.filter(c => c.status === 'implemented').length;
  const avgEffectiveness = controls.reduce((sum, c) => sum + c.effectiveness, 0) / controls.length;
  const totalFindings = controls.reduce((sum, c) => sum + c.findings, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-red-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading security architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
              Security Architecture
            </h1>
            <p className="text-gray-300">Security controls and compliance framework</p>
          </div>
          <div className="flex gap-2 flex-wrap">
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ShieldCheckIcon className="w-8 h-8 text-red-400" />
              <span className="text-3xl font-bold text-white">{controls.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Security Controls</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{implementedCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Implemented</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <KeyIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{avgEffectiveness.toFixed(1)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Effectiveness</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{totalFindings}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Findings</h3>
          </div>
        </div>

        {/* Security Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredControls.map((control) => (
            <div
              key={control.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(control.status)}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{control.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(control.category)}
                      <p className="text-sm text-gray-400 capitalize">{control.category}</p>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(control.status)}`}>
                        {control.status.toUpperCase().replace('-', ' ')}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500/20 text-gray-300">
                        {control.framework}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Control Effectiveness</span>
                    <span className="text-lg font-bold text-white">{control.effectiveness}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        control.effectiveness >= 90 
                          ? 'bg-green-400' 
                          : control.effectiveness >= 70 
                          ? 'bg-yellow-400' 
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${control.effectiveness}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Last Audit</p>
                    <p className="text-sm font-semibold text-white">
                      {new Date(control.lastAudit).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Findings</p>
                    <p className="text-sm font-semibold text-white">{control.findings}</p>
                  </div>
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

export default EASecurity;
