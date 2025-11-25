import { useState } from 'react';
import { X, Database, Server, Network, HardDrive, Code, Link as LinkIcon } from 'lucide-react';
import { API_URL } from '../config/api';

interface Asset {
  id: number;
  assetType: string;
  assetName: string;
  assetDescription?: string;
  environment?: string;
  status: string;
}

interface ProjectAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  stepId?: string;
  stepTitle?: string;
}

const assetIconMap: Record<string, any> = {
  server: Server,
  database: Database,
  network: Network,
  storage: HardDrive,
  application: Code,
};

const assetColorMap: Record<string, string> = {
  server: 'bg-blue-100 text-blue-700 border-blue-200',
  database: 'bg-purple-100 text-purple-700 border-purple-200',
  network: 'bg-green-100 text-green-700 border-green-200',
  storage: 'bg-orange-100 text-orange-700 border-orange-200',
  application: 'bg-pink-100 text-pink-700 border-pink-200',
};

export default function ProjectAssetsModal({ isOpen, onClose, projectId, projectName, stepId, stepTitle }: ProjectAssetsModalProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    if (isOpen) {
      fetchAssets();
    }
  });

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const url = stepId
        ? `${API_URL}/projects/${projectId}/steps/${stepId}/assets`
        : `${API_URL}/projects/${projectId}/assets`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch assets');
      const data = await response.json();
      setAssets(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching assets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.assetType]) {
      acc[asset.assetType] = [];
    }
    acc[asset.assetType].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Database className="w-6 h-6" />
                CMDB Assets
              </h2>
              <p className="text-green-100">
                {stepTitle ? `${stepTitle} - ${projectName}` : projectName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading assets...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-semibold mb-2">Error Loading Assets</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold mb-2">No Assets Linked</p>
              <p className="text-gray-500 text-sm">
                No infrastructure assets have been linked to {stepTitle ? 'this workflow step' : 'this project'} yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(groupedAssets).map(([type, typeAssets]) => {
                  const Icon = assetIconMap[type] || Database;
                  const colorClass = assetColorMap[type] || 'bg-gray-100 text-gray-700 border-gray-200';
                  
                  return (
                    <div key={type} className={`p-3 rounded-lg border ${colorClass}`}>
                      <Icon className="w-5 h-5 mb-2" />
                      <div className="text-2xl font-bold">{typeAssets.length}</div>
                      <div className="text-xs font-semibold capitalize">{type}s</div>
                    </div>
                  );
                })}
              </div>

              {/* Asset List by Type */}
              {Object.entries(groupedAssets).map(([type, typeAssets]) => {
                const Icon = assetIconMap[type] || Database;
                const colorClass = assetColorMap[type] || 'bg-gray-100 text-gray-700 border-gray-200';

                return (
                  <div key={type} className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 capitalize">
                      <Icon className="w-5 h-5" />
                      {type}s ({typeAssets.length})
                    </h3>
                    <div className="space-y-2">
                      {typeAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{asset.assetName}</h4>
                              {asset.assetDescription && (
                                <p className="text-sm text-gray-600 mt-1">{asset.assetDescription}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {asset.environment && (
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  asset.environment === 'production'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : asset.environment === 'staging'
                                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                  {asset.environment}
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                asset.status === 'active'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}>
                                {asset.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <LinkIcon className="w-4 h-4 inline mr-1" />
              {assets.length} {assets.length === 1 ? 'asset' : 'assets'} linked
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
