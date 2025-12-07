import React, { useState, useEffect } from 'react';
import {
  CloudIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface CloudProvider {
  id: string;
  name: string;
  type: 'aws' | 'azure' | 'gcp' | 'digitalocean' | 'alibaba';
  enabled: boolean;
  connected: boolean;
  credentials?: {
    configured?: boolean;
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    clientId?: string;
    clientSecret?: string;
    tenantId?: string;
    subscriptionId?: string;
    projectId?: string;
    serviceAccountKey?: string;
    apiToken?: string;
  };
  lastConnected?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export const CloudSettings: React.FC = () => {
  const [providers, setProviders] = useState<CloudProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/cloud-providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers || []);
      } else {
        console.error('Failed to fetch providers:', response.statusText);
        setProviders([]);
      }
    } catch (error) {
      console.error('Failed to fetch cloud providers:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureProvider = (provider: CloudProvider) => {
    setSelectedProvider(provider);
    // Only spread credentials if they're actual credential fields, not just {configured: true}
    const credentialsToUse = provider.credentials?.configured 
      ? {} 
      : (provider.credentials || {});
    
    setFormData({
      ...credentialsToUse,
      enabled: provider.enabled,
    });
    setShowConfigModal(true);
  };

  const handleSaveConfiguration = async () => {
    if (!selectedProvider) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/settings/cloud-providers/${selectedProvider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: formData.enabled,
          credentials: formData,
        }),
      });

      if (response.ok) {
        alert('Cloud provider configuration saved successfully!');
        setShowConfigModal(false);
        fetchProviders();
      } else {
        const error = await response.json();
        alert(`Failed to save configuration: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Error saving configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    try {
      const response = await fetch(`/api/settings/cloud-providers/${providerId}/test`, {
        method: 'POST',
      });

      const result = await response.json();
      if (result.success) {
        alert(`✓ Connection successful!\n\n${result.message || 'Connected to ' + providerId}`);
        fetchProviders();
      } else {
        alert(`✗ Connection failed:\n\n${result.message || 'Unable to connect'}`);
      }
    } catch (error) {
      alert('Connection test failed. Please check your credentials.');
    }
  };

  const handleToggleProvider = async (provider: CloudProvider) => {
    try {
      const response = await fetch(`/api/settings/cloud-providers/${provider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: !provider.enabled,
          credentials: provider.credentials,
        }),
      });

      if (response.ok) {
        fetchProviders();
      }
    } catch (error) {
      console.error('Failed to toggle provider:', error);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'aws':
        return '☁️';
      case 'azure':
        return '🔷';
      case 'gcp':
        return '🌐';
      case 'digitalocean':
        return '🌊';
      case 'alibaba':
        return '🐘';
      default:
        return '☁️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'disconnected':
        return 'text-gray-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const renderCredentialFields = () => {
    if (!selectedProvider) return null;

    switch (selectedProvider.type) {
      case 'aws':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Access Key ID *
              </label>
              <input
                type="text"
                value={formData.accessKeyId || ''}
                onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="AKIAIOSFODNN7EXAMPLE"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secret Access Key *
              </label>
              <input
                type="password"
                value={formData.secretAccessKey || ''}
                onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Region
              </label>
              <input
                type="text"
                value={formData.region || ''}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="us-east-1"
              />
            </div>
          </>
        );

      case 'azure':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client ID *
              </label>
              <input
                type="text"
                value={formData.clientId || ''}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="00000000-0000-0000-0000-000000000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client Secret *
              </label>
              <input
                type="password"
                value={formData.clientSecret || ''}
                onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Your client secret"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tenant ID *
              </label>
              <input
                type="text"
                value={formData.tenantId || ''}
                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="00000000-0000-0000-0000-000000000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subscription ID
              </label>
              <input
                type="text"
                value={formData.subscriptionId || ''}
                onChange={(e) => setFormData({ ...formData, subscriptionId: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="00000000-0000-0000-0000-000000000000"
              />
            </div>
          </>
        );

      case 'gcp':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project ID *
              </label>
              <input
                type="text"
                value={formData.projectId || ''}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="my-project-id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Account Key (JSON) *
              </label>
              <textarea
                value={formData.serviceAccountKey || ''}
                onChange={(e) => setFormData({ ...formData, serviceAccountKey: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder='{"type": "service_account", ...}'
                rows={6}
              />
            </div>
          </>
        );

      case 'digitalocean':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Token *
              </label>
              <input
                type="password"
                value={formData.apiToken || ''}
                onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="dop_v1_..."
              />
            </div>
          </>
        );

      case 'alibaba':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Access Key ID *
              </label>
              <input
                type="text"
                value={formData.accessKeyId || ''}
                onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="LTAI..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Access Key Secret *
              </label>
              <input
                type="password"
                value={formData.secretAccessKey || ''}
                onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Your access key secret"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Region
              </label>
              <input
                type="text"
                value={formData.region || ''}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="cn-hangzhou"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CloudIcon className="h-8 w-8 text-purple-500" />
            Cloud Provider Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Configure cloud provider credentials for automated infrastructure discovery
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-blue-400 font-semibold mb-1">Secure Credential Storage</h3>
            <p className="text-gray-300 text-sm">
              All credentials are encrypted and stored securely. They are only used for infrastructure discovery and management.
              Without configured cloud providers, network scans will only discover local/on-premise resources.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers && providers.length > 0 ? (
          providers
            .filter((provider) => provider && provider.id)
            .map((provider) => {
              if (!provider || !provider.id) return null;
              return (
                <div
                  key={provider.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all"
                >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getProviderIcon(provider.type || 'unknown')}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{provider.name || 'Unknown Provider'}</h3>
                  <p className="text-sm text-gray-400 capitalize">{provider.type || 'unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {provider.status === 'connected' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-gray-500" />
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className={`font-medium capitalize ${getStatusColor(provider.status || 'disconnected')}`}>
                  {provider.status || 'disconnected'}
                </span>
              </div>
              {provider.lastConnected && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Last Connected:</span>
                  <span className="text-gray-300">
                    {new Date(provider.lastConnected).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Enabled:</span>
                <button
                  onClick={() => handleToggleProvider(provider)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    provider.enabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      provider.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleConfigureProvider(provider)}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                Configure
              </button>
              {provider.enabled && provider.credentials && (
                <button
                  onClick={() => handleTestConnection(provider.id)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                  title="Test Connection"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
              );
            })
        ) : (
          <div className="col-span-full text-center py-12">
            <CloudIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No cloud providers available</p>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getProviderIcon(selectedProvider.type)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Configure {selectedProvider.name}</h2>
                    <p className="text-gray-400 text-sm">Enter your credentials to enable cloud discovery</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <label className="text-white font-medium">Enable Provider</label>
                  <p className="text-gray-400 text-sm">Allow scanning for resources on this cloud provider</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.enabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Credential Fields */}
              {renderCredentialFields()}

              {/* Info Note */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <KeyIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-200 text-sm">
                    <strong>Security Note:</strong> Credentials are encrypted and stored securely.
                    Never share your credentials or commit them to version control.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfiguration}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
