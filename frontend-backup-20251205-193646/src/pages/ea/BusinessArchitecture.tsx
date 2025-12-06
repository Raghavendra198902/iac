import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { API_URL } from '../../config/api';
import {
  Building, GitBranch, Layers, TrendingUp, CheckCircle, AlertCircle,
  Clock, DollarSign, Activity, Users, Target, Zap
} from 'lucide-react';

const API_BASE = API_URL;

export default function BusinessArchitecture() {
  const [activeTab, setActiveTab] = useState('capabilities');
  const [loading, setLoading] = useState(true);
  
  // Data from API
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [valueStreams, setValueStreams] = useState<any[]>([]);
  
  // Selected items for modals
  const [selectedCapability, setSelectedCapability] = useState<any>(null);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedValueStream, setSelectedValueStream] = useState<any>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [capRes, procRes, svcRes, vsRes] = await Promise.all([
        fetch(`${API_BASE}/business/capabilities`),
        fetch(`${API_BASE}/business/processes`),
        fetch(`${API_BASE}/business/services`),
        fetch(`${API_BASE}/business/value-streams`)
      ]);

      if (capRes.ok) setCapabilities(await capRes.json());
      if (procRes.ok) setProcesses(await procRes.json());
      if (svcRes.ok) setServices(await svcRes.json());
      if (vsRes.ok) setValueStreams(await vsRes.json());
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaturityColor = (level: string) => {
    const colors: any = {
      'Initial': 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      'Managed': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      'Defined': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      'Quantitatively Managed': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      'Optimizing': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    };
    return colors[level] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  };

  const getCriticalityColor = (crit: string) => {
    const colors: any = {
      'Critical': 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      'High': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      'Medium': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      'Low': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    };
    return colors[crit] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Business Architecture
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage business capabilities, processes, services, and value streams
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['capabilities', 'processes', 'services', 'value-streams'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </nav>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        )}

        {/* Capabilities Tab */}
        {!loading && activeTab === 'capabilities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, idx) => (
              <div
                key={cap.id || idx}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onDoubleClick={() => setSelectedCapability(cap)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {cap.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {cap.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Category</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {cap.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Maturity</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getMaturityColor(cap.maturity_level)}`}>
                      {cap.maturity_level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Criticality</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCriticalityColor(cap.criticality)}`}>
                      {cap.criticality}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-500 italic text-center">
                  Double-click for details
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Processes Tab */}
        {!loading && activeTab === 'processes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processes.map((proc, idx) => (
              <div
                key={proc.id || idx}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onDoubleClick={() => setSelectedProcess(proc)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {proc.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{proc.description}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      Owner: {proc.owner} • {proc.frequency}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    {proc.process_type}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Automation</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{proc.automation_level}%</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Activity className="w-5 h-5 mx-auto mb-1 text-green-600" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Efficiency</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{proc.efficiency_score}%</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-xs text-gray-600 dark:text-gray-400">Cycle Time</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{proc.cycle_time}</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-500 italic text-center">
                  Double-click for metrics
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Services Tab */}
        {!loading && activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, idx) => (
              <div
                key={svc.id || idx}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onDoubleClick={() => setSelectedService(svc)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {svc.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{svc.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    {svc.service_type}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>SLA: {svc.sla_target}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{svc.availability}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>{svc.usage_volume}</span>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-500 italic text-center">
                  Double-click for details
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Value Streams Tab */}
        {!loading && activeTab === 'value-streams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {valueStreams.map((vs, idx) => (
              <div
                key={vs.id || idx}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onDoubleClick={() => setSelectedValueStream(vs)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {vs.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{vs.description}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                      {vs.category}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lead Time</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{vs.lead_time}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Throughput</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{vs.throughput}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Quality</div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{vs.quality_score}%</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">CSAT</div>
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">{vs.customer_satisfaction}%</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Value</div>
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      ${(vs.annual_value / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-500 italic text-center">
                  Double-click for stages
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Capability Detail Modal */}
        {selectedCapability && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCapability.name}</h2>
                  <button onClick={() => setSelectedCapability(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedCapability.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedCapability.category}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Maturity Level</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedCapability.maturity_level}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Criticality</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedCapability.criticality}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Investment Priority</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedCapability.investment_priority}</div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button onClick={() => setSelectedCapability(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Process Detail Modal */}
        {selectedProcess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProcess.name}</h2>
                  <button onClick={() => setSelectedProcess(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProcess.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Automation</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProcess.automation_level}%</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Efficiency</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProcess.efficiency_score}%</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Complexity</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProcess.complexity}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Process Details</div>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600 dark:text-gray-400">Owner:</span> {selectedProcess.owner}</div>
                      <div><span className="text-gray-600 dark:text-gray-400">Type:</span> {selectedProcess.process_type}</div>
                      <div><span className="text-gray-600 dark:text-gray-400">Frequency:</span> {selectedProcess.frequency}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Performance</div>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600 dark:text-gray-400">Cycle Time:</span> {selectedProcess.cycle_time}</div>
                      <div><span className="text-gray-600 dark:text-gray-400">Cost/Execution:</span> ${selectedProcess.cost_per_execution}</div>
                      <div><span className="text-gray-600 dark:text-gray-400">Capability:</span> {selectedProcess.capability_name || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button onClick={() => setSelectedProcess(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Detail Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedService.name}</h2>
                  <button onClick={() => setSelectedService(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedService.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Service Type</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.service_type}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenue Impact</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.revenue_impact}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Service Level Agreement</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600 dark:text-gray-400">SLA Target:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">{selectedService.sla_target}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600 dark:text-gray-400">Availability:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">{selectedService.availability}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600 dark:text-gray-400">Usage Volume:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">{selectedService.usage_volume}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Owner</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{selectedService.owner}</div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button onClick={() => setSelectedService(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Value Stream Detail Modal */}
        {selectedValueStream && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedValueStream.name}</h2>
                  <button onClick={() => setSelectedValueStream(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedValueStream.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quality Score</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{selectedValueStream.quality_score}%</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer Satisfaction</div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedValueStream.customer_satisfaction}%</div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Annual Value</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ${(selectedValueStream.annual_value / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Value Stream Stages</h3>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {JSON.parse(selectedValueStream.stages || '[]').map((stage: string, idx: number) => (
                      <div key={idx} className="flex items-center">
                        <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg whitespace-nowrap">
                          {stage}
                        </div>
                        {idx < JSON.parse(selectedValueStream.stages).length - 1 && (
                          <svg className="w-6 h-6 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lead Time</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedValueStream.lead_time}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Throughput</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedValueStream.throughput}</div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button onClick={() => setSelectedValueStream(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
