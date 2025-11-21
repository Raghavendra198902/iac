import { FileText, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Blueprint {
  id: string;
  name: string;
  cloud: string;
  environment: string;
  resources: number;
  status: string;
  updatedAt: string;
}

export default function BlueprintList() {
  // Load blueprints from API - no demo data
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlueprints = async () => {
      try {
        const response = await fetch('/api/blueprints');
        if (response.ok) {
          const data = await response.json();
          setBlueprints(data);
        }
      } catch (error) {
        console.error('Failed to load blueprints:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBlueprints();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Blueprints</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your infrastructure designs</p>
        </div>
        <Link to="/designer" className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Blueprint
        </Link>
      </div>

      <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input type="text" placeholder="Search blueprints..." className="input pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400" />
          </div>
          <select className="input w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
            <option>All Clouds</option>
            <option>Azure</option>
            <option>AWS</option>
            <option>GCP</option>
            <option>On-Premise</option>
          </select>
          <select className="input w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
            <option>All Environments</option>
            <option>Production</option>
            <option>Staging</option>
            <option>Development</option>
          </select>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Loading blueprints...
            </div>
          ) : blueprints.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No blueprints yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first blueprint using the AI Designer
              </p>
              <Link to="/designer" className="btn-primary inline-flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Blueprint
              </Link>
            </div>
          ) : (
            blueprints.map((blueprint) => (
            <Link
              key={blueprint.id}
              to={`/blueprints/${blueprint.id}`}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{blueprint.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {blueprint.cloud} • {blueprint.environment} • {blueprint.resources} resources
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${blueprint.status === 'Active' ? 'badge-success' : 'badge-gray'}`}>
                  {blueprint.status}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{blueprint.updatedAt}</span>
              </div>
            </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
