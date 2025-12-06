import { useState } from 'react';
import { Shield, FileText, CheckCircle2, AlertTriangle, Leaf, Scale, Globe } from 'lucide-react';
import { MainLayout } from '../../components/layout';

export default function ComplianceGovernance() {
  const [activeTab, setActiveTab] = useState('frameworks');

  // EA #9 - Compliance Frameworks
  const complianceFrameworks = [
    {
      framework: 'ISO 27001',
      coverage: 92,
      status: 'certified',
      lastAudit: '2024-11-15',
      nextAudit: '2025-11-15',
      gaps: 3,
      controls: 114
    },
    {
      framework: 'SOC 2 Type II',
      coverage: 88,
      status: 'in-progress',
      lastAudit: '2024-09-01',
      nextAudit: '2025-09-01',
      gaps: 8,
      controls: 64
    },
    {
      framework: 'GDPR',
      coverage: 95,
      status: 'compliant',
      lastAudit: '2024-10-20',
      nextAudit: '2025-10-20',
      gaps: 2,
      controls: 42
    },
    {
      framework: 'HIPAA',
      coverage: 78,
      status: 'planned',
      lastAudit: 'N/A',
      nextAudit: '2026-Q1',
      gaps: 15,
      controls: 45
    },
    {
      framework: 'PCI DSS',
      coverage: 85,
      status: 'in-progress',
      lastAudit: '2024-08-10',
      nextAudit: '2025-08-10',
      gaps: 6,
      controls: 78
    },
    {
      framework: 'NIST CSF',
      coverage: 90,
      status: 'compliant',
      lastAudit: '2024-11-01',
      nextAudit: '2025-11-01',
      gaps: 4,
      controls: 98
    }
  ];

  // EA #25 - Data Residency & Legal
  const dataResidency = [
    { region: 'EU (GDPR)', requirement: 'Data must remain in EU', status: 'compliant', datacenters: ['Frankfurt', 'Amsterdam'], risk: 'low' },
    { region: 'US', requirement: 'Subject to CLOUD Act', status: 'compliant', datacenters: ['Virginia', 'Oregon'], risk: 'medium' },
    { region: 'UK (Post-Brexit)', requirement: 'Adequacy decision required', status: 'compliant', datacenters: ['London'], risk: 'low' },
    { region: 'India (CERT-In)', requirement: 'Local storage for citizen data', status: 'in-progress', datacenters: ['Mumbai'], risk: 'medium' },
    { region: 'China', requirement: 'Localization + government access', status: 'not-applicable', datacenters: [], risk: 'high' }
  ];

  // Audit Trail & Retention
  const retentionPolicies = [
    { dataType: 'Security Logs', retention: '7 years', classification: 'Restricted', compliance: 'ISO 27001, SOC2', storage: 'S3 Glacier' },
    { dataType: 'User Activity', retention: '5 years', classification: 'Confidential', compliance: 'GDPR, SOC2', storage: 'S3 IA' },
    { dataType: 'System Metrics', retention: '3 years', classification: 'Internal', compliance: 'Internal Policy', storage: 'S3 Standard' },
    { dataType: 'PII Data', retention: '2 years + consent', classification: 'Highly Sensitive', compliance: 'GDPR', storage: 'Encrypted RDS' },
    { dataType: 'Audit Trails', retention: '10 years', classification: 'Restricted', compliance: 'SOX, ISO 27001', storage: 'Immutable Storage' }
  ];

  // EA #26 - Sustainability & Green Architecture
  const sustainabilityMetrics = [
    { metric: 'Carbon Footprint', value: '2.4 tons CO₂/month', target: '< 2 tons CO₂/month', status: 'in-progress', trend: 'improving' },
    { metric: 'Energy Efficiency', value: 'PUE 1.3', target: 'PUE < 1.2', status: 'good', trend: 'stable' },
    { metric: 'Renewable Energy %', value: '65%', target: '> 80%', status: 'in-progress', trend: 'improving' },
    { metric: 'Hardware Lifecycle', value: '4.5 years avg', target: '> 5 years', status: 'good', trend: 'improving' },
    { metric: 'Virtualization Ratio', value: '12:1', target: '> 15:1', status: 'in-progress', trend: 'improving' }
  ];

  // Access Review Cycles
  const accessReviews = [
    { review: 'Admin Access', frequency: 'Quarterly', lastReview: '2024-11-01', nextReview: '2025-02-01', completion: 100, findings: 2 },
    { review: 'Privileged Access', frequency: 'Monthly', lastReview: '2024-11-20', nextReview: '2024-12-20', completion: 95, findings: 1 },
    { review: 'User Permissions', frequency: 'Semi-annual', lastReview: '2024-10-15', nextReview: '2025-04-15', completion: 88, findings: 5 },
    { review: 'External Access', frequency: 'Quarterly', lastReview: '2024-11-10', nextReview: '2025-02-10', completion: 100, findings: 0 }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      certified: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      compliant: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      planned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      'not-applicable': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      good: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      improving: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      stable: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
    };
    return colors[status] || colors['in-progress'];
  };

  const getRiskColor = (risk: string) => {
    return risk === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
           risk === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
           'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Compliance & Governance</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Regulatory compliance, data governance, and sustainability initiatives
          </p>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            {['frameworks', 'residency', 'retention', 'sustainability', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'frameworks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceFrameworks.map((framework, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{framework.framework}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                    {framework.status}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Coverage</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{framework.coverage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${framework.coverage >= 90 ? 'bg-green-500' : framework.coverage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${framework.coverage}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Controls</div>
                      <div className="font-medium text-gray-900 dark:text-white">{framework.controls}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Gaps</div>
                      <div className={`font-medium ${framework.gaps === 0 ? 'text-green-600' : 'text-orange-600'}`}>{framework.gaps}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    Next Audit: {framework.nextAudit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'residency' && (
          <div className="space-y-4">
            {dataResidency.map((residency, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{residency.region}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{residency.requirement}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(residency.status)}`}>
                      {residency.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(residency.risk)}`}>
                      {residency.risk} risk
                    </span>
                  </div>
                </div>
                {residency.datacenters.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Datacenters</div>
                    <div className="flex flex-wrap gap-2">
                      {residency.datacenters.map((dc, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
                          {dc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'retention' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Retention & Destruction Policies</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Retention</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Classification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Compliance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Storage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {retentionPolicies.map((policy, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{policy.dataType}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{policy.retention}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          policy.classification === 'Highly Sensitive' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          policy.classification === 'Restricted' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                          policy.classification === 'Confidential' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {policy.classification}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{policy.compliance}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{policy.storage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sustainability' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Green Architecture Initiative</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Committed to reducing environmental impact through efficient resource utilization and renewable energy adoption
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sustainabilityMetrics.map((metric, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{metric.metric}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Target</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.target}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Trend:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.trend)}`}>
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {accessReviews.map((review, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{review.review}</h3>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{review.frequency}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Review</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{review.lastReview}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next Review</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{review.nextReview}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completion</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{review.completion}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Findings</div>
                    <div className={`text-sm font-medium ${review.findings === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {review.findings}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${review.completion === 100 ? 'bg-green-500' : review.completion >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                    style={{ width: `${review.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
