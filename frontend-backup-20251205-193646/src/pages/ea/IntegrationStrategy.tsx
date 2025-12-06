import { useState } from 'react';
import { GitBranch, Cloud, Database, Zap, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { MainLayout } from '../../components/layout';

export default function IntegrationStrategy() {
  const [activeTab, setActiveTab] = useState('enterprise');

  // EA #8 - Enterprise Integration
  const enterpriseIntegrations = [
    {
      system: 'Active Directory / LDAP',
      purpose: 'Identity synchronization & authentication',
      protocol: 'LDAP/LDAPS',
      frequency: 'Real-time',
      status: 'active',
      coverage: 100
    },
    {
      system: 'Azure Active Directory',
      purpose: 'Cloud identity & SSO',
      protocol: 'SAML 2.0 / OAuth 2.0',
      frequency: 'Real-time',
      status: 'active',
      coverage: 95
    },
    {
      system: 'Splunk',
      purpose: 'SIEM event forwarding',
      protocol: 'HEC / Syslog',
      frequency: 'Real-time',
      status: 'active',
      coverage: 90
    },
    {
      system: 'ELK Stack',
      purpose: 'Log aggregation & analysis',
      protocol: 'Beats / Logstash',
      frequency: 'Real-time',
      status: 'active',
      coverage: 85
    },
    {
      system: 'QRadar',
      purpose: 'Security event correlation',
      protocol: 'Syslog / REST API',
      frequency: 'Real-time',
      status: 'planned',
      coverage: 40
    },
    {
      system: 'ServiceNow',
      purpose: 'Incident & change management',
      protocol: 'REST API',
      frequency: 'On-demand',
      status: 'active',
      coverage: 80
    },
    {
      system: 'Jira',
      purpose: 'Case tracking & workflow',
      protocol: 'REST API',
      frequency: 'On-demand',
      status: 'active',
      coverage: 90
    },
    {
      system: 'CrowdStrike / EDR',
      purpose: 'Endpoint threat intelligence',
      protocol: 'REST API / Streaming',
      frequency: 'Real-time',
      status: 'planning',
      coverage: 30
    }
  ];

  // EA #20 - Cloud Service Integrations
  const cloudIntegrations = [
    { cloud: 'AWS', services: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudWatch', 'KMS'], maturity: 4, cost: 'Medium' },
    { cloud: 'Azure', services: ['VMs', 'Blob Storage', 'SQL DB', 'Functions', 'Monitor', 'Key Vault'], maturity: 3, cost: 'Medium' },
    { cloud: 'GCP', services: ['Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Functions'], maturity: 2, cost: 'Low' }
  ];

  // EA #20 - Interoperability Strategy
  const interoperability = [
    {
      platform: 'Windows',
      agent: 'Native C++ Agent',
      protocol: 'gRPC',
      dataFormat: 'Protobuf',
      compatibility: '100%',
      status: 'production'
    },
    {
      platform: 'Linux',
      agent: 'Go Agent',
      protocol: 'gRPC',
      dataFormat: 'Protobuf',
      compatibility: '100%',
      status: 'production'
    },
    {
      platform: 'macOS',
      agent: 'Swift Agent',
      protocol: 'gRPC',
      dataFormat: 'Protobuf',
      compatibility: '95%',
      status: 'production'
    },
    {
      platform: 'Android',
      agent: 'Kotlin Agent',
      protocol: 'REST API',
      dataFormat: 'JSON',
      compatibility: '85%',
      status: 'beta'
    },
    {
      platform: 'iOS',
      agent: 'Swift Agent',
      protocol: 'REST API',
      dataFormat: 'JSON',
      compatibility: '80%',
      status: 'beta'
    }
  ];

  // API Gateway & Service Mesh
  const apiStrategy = [
    { component: 'API Gateway', technology: 'Kong / AWS API Gateway', features: ['Rate Limiting', 'Auth', 'Caching', 'Monitoring'], status: 'active' },
    { component: 'Service Mesh', technology: 'Istio / Linkerd', features: ['mTLS', 'Traffic Management', 'Observability', 'Resilience'], status: 'planning' },
    { component: 'Message Broker', technology: 'Apache Kafka', features: ['Event Streaming', 'Decouple Services', 'Replay', 'Scale'], status: 'active' },
    { component: 'Service Registry', technology: 'Consul / etcd', features: ['Service Discovery', 'Health Checks', 'KV Store'], status: 'active' }
  ];

  // EA #24 - Vendor Management
  const vendors = [
    { name: 'AWS', category: 'Cloud Provider', criticality: 'High', contract: 'Enterprise', renewal: '2026-Q2', risk: 'Low' },
    { name: 'Microsoft', category: 'Identity & Cloud', criticality: 'High', contract: 'Enterprise', renewal: '2025-Q4', risk: 'Low' },
    { name: 'Splunk', category: 'SIEM', criticality: 'High', contract: 'Standard', renewal: '2026-Q1', risk: 'Medium' },
    { name: 'HashiCorp', category: 'Infrastructure Tools', criticality: 'Medium', contract: 'Enterprise', renewal: '2026-Q3', risk: 'Low' },
    { name: 'Datadog', category: 'Monitoring', criticality: 'Medium', contract: 'Pro', renewal: '2025-Q4', risk: 'Low' }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Integration Strategy</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Enterprise integrations, API gateway, and cross-platform interoperability
          </p>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            {['enterprise', 'cloud', 'interop', 'api', 'vendors'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {tab === 'interop' ? 'Interoperability' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'enterprise' && (
          <div className="space-y-4">
            {enterpriseIntegrations.map((integration, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{integration.system}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{integration.purpose}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    integration.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                    integration.status === 'planning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {integration.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Protocol</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{integration.protocol}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{integration.frequency}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Coverage</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{integration.coverage}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      integration.coverage >= 80 ? 'bg-green-500' :
                      integration.coverage >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${integration.coverage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cloud' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cloudIntegrations.map((cloud, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Cloud className="w-8 h-8 text-blue-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{cloud.cloud}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    cloud.cost === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    cloud.cost === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {cloud.cost} Cost
                  </span>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Integrated Services</div>
                  <div className="flex flex-wrap gap-2">
                    {cloud.services.map((service, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Maturity</span>
                    <span className="font-medium text-gray-900 dark:text-white">Level {cloud.maturity}/5</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 h-2 rounded ${
                          level <= cloud.maturity ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'interop' && (
          <div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Universal Cross-Platform Strategy</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unified data format (Protobuf/JSON) with platform-specific optimized agents</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Protocol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data Format</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Compatibility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {interoperability.map((platform, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{platform.platform}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{platform.agent}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{platform.protocol}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{platform.dataFormat}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">{platform.compatibility}</span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: platform.compatibility }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          platform.status === 'production' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {platform.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apiStrategy.map((api, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{api.component}</h3>
                  </div>
                  {api.status === 'active' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">{api.technology}</div>
                <div className="space-y-2">
                  {api.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vendor & Technology Partners</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Criticality</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contract</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Renewal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {vendors.map((vendor, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{vendor.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{vendor.category}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vendor.criticality === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {vendor.criticality}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{vendor.contract}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{vendor.renewal}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vendor.risk === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                          vendor.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {vendor.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
