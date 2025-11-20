import { FileText, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlueprintList() {
  const blueprints = [
    { id: '1', name: 'Production Web App', cloud: 'Azure', environment: 'Production', resources: 12, status: 'Active', updatedAt: '2 hours ago' },
    { id: '2', name: 'Microservices Stack', cloud: 'AWS', environment: 'Production', resources: 24, status: 'Active', updatedAt: '5 hours ago' },
    { id: '3', name: 'Data Analytics Pipeline', cloud: 'GCP', environment: 'Staging', resources: 8, status: 'Draft', updatedAt: '1 day ago' },
    { id: '4', name: 'Dev Environment', cloud: 'Azure', environment: 'Development', resources: 5, status: 'Active', updatedAt: '2 days ago' },
  ];

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
          {blueprints.map((blueprint) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
