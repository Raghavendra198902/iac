import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { Database, HardDrive, X } from 'lucide-react';
import { API_URL } from '../../config/api';

interface DataEntity {
  id: string;
  name: string;
  description: string;
  category: string;
  domain: string;
  owner: string;
  sensitivity: string;
  retention_period: string;
  record_count: number;
  data_quality_score: number;
  steward: string;
  notes: string;
}

interface DataStore {
  id: string;
  name: string;
  description: string;
  store_type: string;
  technology: string;
  hosting: string;
  size_gb: number;
  backup_frequency: string;
  owner: string;
  encryption_enabled: boolean;
  compliance_certifications: string;
  notes: string;
}

export default function DataArchitecture() {
  const [activeTab, setActiveTab] = useState<'entities' | 'stores'>('entities');
  const [entities, setEntities] = useState<DataEntity[]>([]);
  const [stores, setStores] = useState<DataStore[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<DataEntity | null>(null);
  const [selectedStore, setSelectedStore] = useState<DataStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [entitiesRes, storesRes] = await Promise.all([
        fetch(`${API_URL}/data/entities`),
        fetch(`${API_URL}/data/stores`)
      ]);

      if (entitiesRes.ok) setEntities(await entitiesRes.json());
      if (storesRes.ok) setStores(await storesRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity?.toLowerCase()) {
      case 'restricted': return 'text-red-600 bg-red-50';
      case 'confidential': return 'text-orange-600 bg-orange-50';
      case 'internal': return 'text-yellow-600 bg-yellow-50';
      case 'public': return 'text-green-600 bg-green-50';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Architecture</h1>
          <p className="text-gray-600">Manage data entities and data stores</p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('entities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'entities' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Entities ({entities.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stores' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Data Stores ({stores.length})
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'entities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => (
              <div
                key={entity.id}
                onDoubleClick={() => setSelectedEntity(entity)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{entity.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSensitivityColor(entity.sensitivity)}`}>
                      {entity.sensitivity}
                    </span>
                  </div>
                  <Database className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{entity.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900">{entity.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Domain:</span>
                    <span className="font-medium text-gray-900">{entity.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Records:</span>
                    <span className="font-medium text-gray-900">{entity.record_count?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quality Score:</span>
                    <span className="font-medium text-gray-900">{entity.data_quality_score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                onDoubleClick={() => setSelectedStore(store)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h3>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      {store.store_type}
                    </span>
                  </div>
                  <HardDrive className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{store.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Technology:</span>
                    <span className="font-medium text-gray-900">{store.technology}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hosting:</span>
                    <span className="font-medium text-gray-900">{store.hosting}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium text-gray-900">{store.size_gb} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Encrypted:</span>
                    <span className="font-medium text-gray-900">{store.encryption_enabled ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Entity Detail Modal */}
        {selectedEntity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEntity.name}</h2>
                <button onClick={() => setSelectedEntity(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Category</label><p className="mt-1">{selectedEntity.category}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Domain</label><p className="mt-1">{selectedEntity.domain}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Owner</label><p className="mt-1">{selectedEntity.owner}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Steward</label><p className="mt-1">{selectedEntity.steward}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Sensitivity</label><p className="mt-1"><span className={`px-2 py-1 rounded text-xs font-medium ${getSensitivityColor(selectedEntity.sensitivity)}`}>{selectedEntity.sensitivity}</span></p></div>
                    <div><label className="text-sm font-medium text-gray-500">Retention</label><p className="mt-1">{selectedEntity.retention_period}</p></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Quality</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Record Count</label><p className="mt-1">{selectedEntity.record_count?.toLocaleString()}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Quality Score</label><p className="mt-1">{selectedEntity.data_quality_score}%</p></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p>{selectedEntity.description}</p>
                </div>
                {selectedEntity.notes && (
                  <div><h3 className="text-lg font-semibold mb-3">Notes</h3><p className="whitespace-pre-wrap">{selectedEntity.notes}</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Store Detail Modal */}
        {selectedStore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedStore.name}</h2>
                <button onClick={() => setSelectedStore(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Store Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-500">Type</label><p className="mt-1">{selectedStore.store_type}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Technology</label><p className="mt-1">{selectedStore.technology}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Hosting</label><p className="mt-1">{selectedStore.hosting}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Owner</label><p className="mt-1">{selectedStore.owner}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Size</label><p className="mt-1">{selectedStore.size_gb} GB</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Backup Frequency</label><p className="mt-1">{selectedStore.backup_frequency}</p></div>
                    <div><label className="text-sm font-medium text-gray-500">Encryption</label><p className="mt-1">{selectedStore.encryption_enabled ? 'Enabled' : 'Disabled'}</p></div>
                  </div>
                </div>
                {selectedStore.compliance_certifications && (
                  <div><h3 className="text-lg font-semibold mb-3">Compliance</h3><p>{selectedStore.compliance_certifications}</p></div>
                )}
                <div><h3 className="text-lg font-semibold mb-3">Description</h3><p>{selectedStore.description}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
