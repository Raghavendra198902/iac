import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { Users, MessageSquare, X } from 'lucide-react';
import { API_URL } from '../../config/api';

interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  organization: string;
  stakeholder_type: string;
  influence_level: string;
  interest_level: string;
  engagement_status: string;
  primary_concerns: string;
  communication_preference: string;
  phone: string;
  notes: string;
}

interface Engagement {
  id: string;
  stakeholder_id: string;
  stakeholder_name: string;
  engagement_type: string;
  engagement_date: string;
  subject: string;
  summary: string;
  outcomes: string;
  follow_up_required: boolean;
  follow_up_date: string;
  notes: string;
}

export default function StakeholderManagement() {
  const [activeTab, setActiveTab] = useState<'stakeholders' | 'engagements'>('stakeholders');
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [stakeholdersRes, engagementsRes] = await Promise.all([
        fetch(`${API_URL}/stakeholders/stakeholders`),
        fetch(`${API_URL}/stakeholders/engagements`)
      ]);

      if (stakeholdersRes.ok) setStakeholders(await stakeholdersRes.json());
      if (engagementsRes.ok) setEngagements(await engagementsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInfluenceColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'very high': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEngagementColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'actively engaged': return 'text-green-600 bg-green-50';
      case 'periodically engaged': return 'text-blue-600 bg-blue-50';
      case 'not engaged': return 'text-gray-600 bg-gray-50';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stakeholder Management</h1>
          <p className="text-gray-600">Manage stakeholders and engagements</p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('stakeholders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stakeholders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Stakeholders ({stakeholders.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('engagements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'engagements' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Engagements ({engagements.length})
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'stakeholders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stakeholders.map((stakeholder) => (
              <div
                key={stakeholder.id}
                onDoubleClick={() => setSelectedStakeholder(stakeholder)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{stakeholder.name}</h3>
                    <div className="flex gap-2 flex-wrap mb-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getInfluenceColor(stakeholder.influence_level)}`}>
                        {stakeholder.influence_level}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(stakeholder.engagement_status)}`}>
                        {stakeholder.engagement_status}
                      </span>
                    </div>
                  </div>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{stakeholder.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Department:</span>
                    <span className="font-medium text-gray-900">{stakeholder.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium text-gray-900">{stakeholder.stakeholder_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Interest:</span>
                    <span className="font-medium text-gray-900">{stakeholder.interest_level}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'engagements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engagements.map((engagement) => (
              <div
                key={engagement.id}
                onDoubleClick={() => setSelectedEngagement(engagement)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{engagement.subject}</h3>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      {engagement.engagement_type}
                    </span>
                  </div>
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{engagement.summary}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stakeholder:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{engagement.stakeholder_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium text-gray-900">{new Date(engagement.engagement_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Follow-up:</span>
                    <span className="font-medium text-gray-900">{engagement.follow_up_required ? 'Required' : 'Not Required'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stakeholder Detail Modal */}
        {selectedStakeholder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedStakeholder.name}</h2>
                <button onClick={() => setSelectedStakeholder(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Email</label><p className="mt-1">{selectedStakeholder.email}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Phone</label><p className="mt-1">{selectedStakeholder.phone}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Role</label><p className="mt-1">{selectedStakeholder.role}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Department</label><p className="mt-1">{selectedStakeholder.department}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Organization</label><p className="mt-1">{selectedStakeholder.organization}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Type</label><p className="mt-1">{selectedStakeholder.stakeholder_type}</p></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Engagement Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Influence</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getInfluenceColor(selectedStakeholder.influence_level)}`}>{selectedStakeholder.influence_level}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Interest</label><p className="mt-1">{selectedStakeholder.interest_level}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Status</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getEngagementColor(selectedStakeholder.engagement_status)}`}>{selectedStakeholder.engagement_status}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Communication Preference</label><p className="mt-1">{selectedStakeholder.communication_preference}</p></div>
                  </div>
                </div>
                {selectedStakeholder.primary_concerns && (
                  <div><h3 className="text-lg font-semibold mb-3">Primary Concerns</h3><p>{selectedStakeholder.primary_concerns}</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Detail Modal */}
        {selectedEngagement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEngagement.subject}</h2>
                <button onClick={() => setSelectedEngagement(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Engagement Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Stakeholder</label><p className="mt-1">{selectedEngagement.stakeholder_name}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Type</label><p className="mt-1">{selectedEngagement.engagement_type}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Date</label><p className="mt-1">{new Date(selectedEngagement.engagement_date).toLocaleDateString()}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Follow-up Required</label><p className="mt-1">{selectedEngagement.follow_up_required ? 'Yes' : 'No'}</p></div>
                  </div>
                </div>
                <div><h3 className="text-lg font-semibold mb-3">Summary</h3><p>{selectedEngagement.summary}</p></div>
                {selectedEngagement.outcomes && (
                  <div><h3 className="text-lg font-semibold mb-3">Outcomes</h3><p>{selectedEngagement.outcomes}</p></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
