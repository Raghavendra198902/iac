import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const InfrastructureResources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'aws',
    region: '',
    templateId: '',
    config: '{}',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/infrastructure/resources');
      const data = await response.json();
      setResources(data);
    } catch (err) {
      console.log('No API data available, showing empty state');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/infrastructure/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          provider: formData.provider,
          region: formData.region,
          templateId: formData.templateId || undefined,
          config: JSON.parse(formData.config || '{}'),
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          provider: 'aws',
          region: '',
          templateId: '',
          config: '{}',
          tags: ''
        });
        await fetchResources();
      } else {
        alert('Failed to create resource');
      }
    } catch (err) {
      console.error('Error creating resource:', err);
      alert('Error creating resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScanNetwork = async () => {
    setScanning(true);
    try {
      const response = await fetch('/api/infrastructure/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.added > 0) {
          alert(
            `✓ Network scan completed!\n\n` +
            `Discovered: ${result.discovered || 0} local resources\n` +
            `Added: ${result.added || 0} new resources\n` +
            `Skipped: ${result.skipped || 0} (already exist)\n\n` +
            `${result.note || ''}`
          );
          await fetchResources();
        } else if (result.added === 0) {
          alert(
            `Network scan completed!\n\n` +
            `Found ${result.discovered || 0} local resources, but all already exist in your inventory.\n\n` +
            `${result.note || ''}`
          );
        }
      } else {
        const errorMsg = result.message || result.error || 'Unknown error occurred';
        alert(`Network scan failed:\n\n${errorMsg}`);
      }
    } catch (err) {
      console.error('Error scanning network:', err);
      alert(
        'Network scan failed. Please check:\n\n' +
        '• Backend API is running\n' +
        '• Network connectivity\n' +
        '• Database connection\n\n' +
        'Error: ' + (err instanceof Error ? err.message : 'Connection error')
      );
    } finally {
      setScanning(false);
    }
  };

  const handleEditResource = (resource: any) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name,
      provider: resource.provider.toLowerCase(),
      region: resource.region,
      templateId: resource.templateId || '',
      config: JSON.stringify(resource.config || {}, null, 2),
      tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/infrastructure/resources/${selectedResource.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          provider: formData.provider,
          region: formData.region,
          templateId: formData.templateId,
          config: JSON.parse(formData.config || '{}'),
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
        }),
      });

      if (response.ok) {
        alert('Resource updated successfully!');
        setShowEditModal(false);
        fetchResources();
      } else {
        alert('Failed to update resource');
      }
    } catch (error) {
      console.error('Failed to update resource:', error);
      alert('Error updating resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (resource: any) => {
    setSelectedResource(resource);
    setShowDeleteModal(true);
  };

  const handleDeleteResource = async () => {
    if (!selectedResource) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/infrastructure/resources/${selectedResource.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Resource deleted successfully!');
        setShowDeleteModal(false);
        setSelectedResource(null);
        fetchResources();
      } else {
        alert('Failed to delete resource');
      }
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Error deleting resource');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
      case 'active':
      case 'healthy':
        return 'bg-green-500';
      case 'stopped':
      case 'inactive':
        return 'bg-gray-500';
      case 'pending':
      case 'creating':
        return 'bg-yellow-500';
      case 'error':
      case 'failed':
        return 'bg-red-500';
      case 'terminating':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusLabel = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown';
  };

  const handleResourceDoubleClick = (resource: any) => {
    setSelectedResource(resource);
    setShowDetailModal(true);
  };

  const getIpAddress = (resource: any) => {
    // Try to extract IP from config or return placeholder
    if (resource.config?.ip) return resource.config.ip;
    if (resource.config?.ipAddress) return resource.config.ipAddress;
    if (resource.config?.privateIp) return resource.config.privateIp;
    // Generate placeholder IP based on provider
    const hash = resource.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const octet = (hash % 200) + 10;
    return `10.0.${Math.floor(octet / 10)}.${octet % 100}`;
  };

  const filteredResources = resources.filter(resource => 
    (filterType === 'all' || resource.provider === filterType) &&
    (resource.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     resource.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent"></div>
          <p className="mt-4 text-gray-300">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}
        ></div>
      ))}

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Infrastructure Resources
          </h1>
          <p className="text-gray-300">Manage all your cloud resources across providers</p>
        </div>

        {/* Controls */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-12 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
              >
                <option value="all">All Providers</option>
                <option value="AWS">AWS</option>
                <option value="AZURE">Azure</option>
                <option value="GCP">GCP</option>
                <option value="KUBERNETES">Kubernetes</option>
                <option value="ON-PREMISE">On-Premise</option>
              </select>
            </div>

            {/* Scan Network Button */}
            <button 
              onClick={handleScanNetwork}
              disabled={scanning}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              {scanning ? 'Scanning...' : 'Scan Network'}
            </button>

            {/* Add Button */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Resource
            </button>
          </div>
        </div>

        {/* Resources Table */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cost/Month</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <p className="text-lg mb-2">No resources found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((resource) => (
                    <tr 
                      key={resource.id} 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onDoubleClick={() => handleResourceDoubleClick(resource)}
                      title="Double-click for details"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(resource.status)}`}></div>
                            <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${getStatusColor(resource.status)} animate-ping opacity-75`}></div>
                          </div>
                          <span className="text-white font-medium">{resource.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-400/20 text-blue-400 rounded-full text-xs font-semibold">
                          {resource.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{resource.provider}</td>
                      <td className="px-6 py-4 text-gray-300">{resource.region}</td>
                      <td className="px-6 py-4">
                        <span className="text-cyan-400 font-mono text-sm">{getIpAddress(resource)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(resource.status)}`}></div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            resource.status?.toLowerCase() === 'running' || resource.status?.toLowerCase() === 'active' || resource.status?.toLowerCase() === 'healthy'
                              ? 'bg-green-400/20 text-green-400'
                              : resource.status?.toLowerCase() === 'stopped' || resource.status?.toLowerCase() === 'inactive'
                              ? 'bg-gray-400/20 text-gray-400'
                              : resource.status?.toLowerCase() === 'error' || resource.status?.toLowerCase() === 'failed'
                              ? 'bg-red-400/20 text-red-400'
                              : resource.status?.toLowerCase() === 'pending' || resource.status?.toLowerCase() === 'creating'
                              ? 'bg-yellow-400/20 text-yellow-400'
                              : 'bg-blue-400/20 text-blue-400'
                          }`}>
                            {getStatusLabel(resource.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">{resource.cost || '$0.00'}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditResource(resource)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                            title="Edit resource"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(resource)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Delete resource"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Resource Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Add New Resource</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-300" />
                </button>
              </div>

              <form onSubmit={handleAddResource} className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-semibold">Resource Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., prod-web-server-01"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-semibold">Provider *</label>
                    <select
                      required
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="aws">AWS</option>
                      <option value="azure">Azure</option>
                      <option value="gcp">GCP</option>
                      <option value="kubernetes">Kubernetes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-semibold">Region *</label>
                    <input
                      type="text"
                      required
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., us-east-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-semibold">Template ID (optional)</label>
                  <input
                    type="text"
                    value={formData.templateId}
                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Template UUID"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-semibold">Configuration (JSON)</label>
                  <textarea
                    value={formData.config}
                    onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    rows={4}
                    placeholder='{"instance_type": "t3.medium", "disk_size": 100}'
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-semibold">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="production, web-server, critical"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating...' : 'Create Resource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Resource Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full border border-purple-500/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Edit Resource
                </h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateResource} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Resource Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData({...formData, provider: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="aws">AWS</option>
                      <option value="azure">Azure</option>
                      <option value="gcp">GCP</option>
                      <option value="kubernetes">Kubernetes</option>
                      <option value="on-premise">On-Premise</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Region</label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Configuration (JSON)</label>
                  <textarea
                    value={formData.config}
                    onChange={(e) => setFormData({...formData, config: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="production, critical, database"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Update Resource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-red-500/30">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100/10 mb-4">
                  <TrashIcon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Resource</h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete <span className="text-white font-semibold">{selectedResource?.name}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteResource}
                    disabled={submitting}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resource Detail Modal */}
        {showDetailModal && selectedResource && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedResource.status)}`}></div>
                    <div className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor(selectedResource.status)} animate-ping opacity-75`}></div>
                  </div>
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {selectedResource.name}
                  </h3>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-400 mb-3">Basic Information</h4>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase">Resource ID</label>
                    <p className="text-white font-mono text-sm mt-1">{selectedResource.id}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase">Type</label>
                    <p className="text-white mt-1">
                      <span className="px-3 py-1 bg-blue-400/20 text-blue-400 rounded-full text-sm font-semibold">
                        {selectedResource.type}
                      </span>
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase">Provider</label>
                    <p className="text-white mt-1 font-semibold">{selectedResource.provider}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase">Region</label>
                    <p className="text-white mt-1">{selectedResource.region}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase">IP Address</label>
                    <p className="text-cyan-400 font-mono text-sm mt-1">{getIpAddress(selectedResource)}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedResource.status)}`}></div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedResource.status?.toLowerCase() === 'running' || selectedResource.status?.toLowerCase() === 'active' || selectedResource.status?.toLowerCase() === 'healthy'
                          ? 'bg-green-400/20 text-green-400'
                          : selectedResource.status?.toLowerCase() === 'stopped' || selectedResource.status?.toLowerCase() === 'inactive'
                          ? 'bg-gray-400/20 text-gray-400'
                          : selectedResource.status?.toLowerCase() === 'error' || selectedResource.status?.toLowerCase() === 'failed'
                          ? 'bg-red-400/20 text-red-400'
                          : 'bg-yellow-400/20 text-yellow-400'
                      }`}>
                        {getStatusLabel(selectedResource.status)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase">Cost/Month</label>
                    <p className="text-white mt-1 font-semibold text-lg">{selectedResource.cost || '$0.00'}</p>
                  </div>
                </div>

                {/* Configuration & Tags */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-400 mb-3">Configuration</h4>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase mb-2 block">Configuration Details</label>
                    <pre className="text-white font-mono text-xs bg-black/30 rounded p-3 overflow-x-auto">
{JSON.stringify(selectedResource.config || {}, null, 2)}
                    </pre>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedResource.tags && selectedResource.tags.length > 0 ? (
                        selectedResource.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No tags</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase mb-2 block">Created At</label>
                    <p className="text-white text-sm">
                      {selectedResource.created_at ? new Date(selectedResource.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-xs text-gray-400 uppercase mb-2 block">Updated At</label>
                    <p className="text-white text-sm">
                      {selectedResource.updated_at ? new Date(selectedResource.updated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditResource(selectedResource);
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Edit Resource
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default InfrastructureResources;
