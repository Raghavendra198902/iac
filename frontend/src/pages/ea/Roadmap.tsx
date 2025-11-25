import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { Calendar, Target, X } from 'lucide-react';
import { API_URL } from '../../config/api';

interface Initiative {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  owner: string;
  start_date: string;
  end_date: string;
  budget: number;
  progress: number;
  dependencies: string;
  business_value: string;
  notes: string;
}

interface Milestone {
  id: string;
  initiative_id: string;
  initiative_name: string;
  name: string;
  description: string;
  due_date: string;
  status: string;
  completion_percentage: number;
  deliverables: string;
  notes: string;
}

export default function Roadmap() {
  const [activeTab, setActiveTab] = useState<'initiatives' | 'milestones'>('initiatives');
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [initiativesRes, milestonesRes] = await Promise.all([
        fetch(`${API_URL}/roadmap/initiatives`),
        fetch(`${API_URL}/roadmap/milestones`)
      ]);

      if (initiativesRes.ok) setInitiatives(await initiativesRes.json());
      if (milestonesRes.ok) setMilestones(await milestonesRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in progress': return 'text-blue-600 bg-blue-50';
      case 'planning': return 'text-purple-600 bg-purple-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'not started': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EA Roadmap</h1>
          <p className="text-gray-600">Strategic initiatives and milestones</p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('initiatives')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'initiatives' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Initiatives ({initiatives.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'milestones' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Milestones ({milestones.length})
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'initiatives' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiatives.map((initiative) => (
              <div
                key={initiative.id}
                onDoubleClick={() => setSelectedInitiative(initiative)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{initiative.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(initiative.priority)}`}>
                        {initiative.priority}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(initiative.status)}`}>
                        {initiative.status}
                      </span>
                    </div>
                  </div>
                  <Target className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{initiative.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900">{initiative.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Owner:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{initiative.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Progress:</span>
                    <span className="font-medium text-gray-900">{initiative.progress}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget:</span>
                    <span className="font-medium text-gray-900">${initiative.budget?.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${initiative.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                onDoubleClick={() => setSelectedMilestone(milestone)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{milestone.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{milestone.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Initiative:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{milestone.initiative_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date:</span>
                    <span className="font-medium text-gray-900">{new Date(milestone.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completion:</span>
                    <span className="font-medium text-gray-900">{milestone.completion_percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Initiative Detail Modal */}
        {selectedInitiative && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedInitiative.name}</h2>
                <button onClick={() => setSelectedInitiative(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Initiative Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Category</label><p className="mt-1">{selectedInitiative.category}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Owner</label><p className="mt-1">{selectedInitiative.owner}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Priority</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedInitiative.priority)}`}>{selectedInitiative.priority}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedInitiative.status)}`}>{selectedInitiative.status}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Start Date</label><p className="mt-1">{new Date(selectedInitiative.start_date).toLocaleDateString()}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">End Date</label><p className="mt-1">{new Date(selectedInitiative.end_date).toLocaleDateString()}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Budget</label><p className="mt-1">${selectedInitiative.budget?.toLocaleString()}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Progress</label><p className="mt-1">{selectedInitiative.progress}%</p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedInitiative.description}</p></div>
                {selectedInitiative.business_value && (
                  <div><h3 className="text-lg font-semibold mb-3">Business Value</h3><p>{selectedInitiative.business_value}</p></div>
                )}
                {selectedInitiative.dependencies && (
                  <div><h3 className="text-lg font-semibold mb-3">Dependencies</h3><p>{selectedInitiative.dependencies}</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Milestone Detail Modal */}
        {selectedMilestone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMilestone.name}</h2>
                <button onClick={() => setSelectedMilestone(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Milestone Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Initiative</label><p className="mt-1">{selectedMilestone.initiative_name}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedMilestone.status)}`}>{selectedMilestone.status}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Due Date</label><p className="mt-1">{new Date(selectedMilestone.due_date).toLocaleDateString()}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Completion</label><p className="mt-1">{selectedMilestone.completion_percentage}%</p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedMilestone.description}</p></div>
                {selectedMilestone.deliverables && (
                  <div><h3 className="text-lg font-semibold mb-3">Deliverables</h3><p>{selectedMilestone.deliverables}</p></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
