import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  CloudIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  UserGroupIcon,
  KeyIcon,
  ServerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Setting {
  id: string;
  category: string;
  name: string;
  description: string;
  value: string | boolean;
  type: 'text' | 'boolean' | 'select' | 'password';
  options?: string[];
}

interface CloudProvider {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  region: string;
  resources: number;
  lastSync: string;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    loadSettings();
    loadCloudProviders();
  }, []);

  const loadSettings = () => {
    // Sample settings data
    const sampleSettings: Setting[] = [
      {
        id: '1',
        category: 'general',
        name: 'Platform Name',
        description: 'Display name for the platform',
        value: 'IAC Dharma Platform',
        type: 'text'
      },
      {
        id: '2',
        category: 'general',
        name: 'Auto-refresh Interval',
        description: 'Dashboard refresh interval (seconds)',
        value: '30',
        type: 'select',
        options: ['10', '30', '60', '120', '300']
      },
      {
        id: '3',
        category: 'general',
        name: 'Dark Mode',
        description: 'Enable dark mode theme',
        value: true,
        type: 'boolean'
      },
      {
        id: '4',
        category: 'security',
        name: 'Two-Factor Authentication',
        description: 'Require 2FA for all users',
        value: true,
        type: 'boolean'
      },
      {
        id: '5',
        category: 'security',
        name: 'Session Timeout',
        description: 'Automatic session timeout (minutes)',
        value: '60',
        type: 'select',
        options: ['15', '30', '60', '120', '240']
      },
      {
        id: '6',
        category: 'security',
        name: 'Password Policy',
        description: 'Minimum password strength requirement',
        value: 'strong',
        type: 'select',
        options: ['basic', 'medium', 'strong', 'very-strong']
      },
      {
        id: '7',
        category: 'notifications',
        name: 'Email Notifications',
        description: 'Send email notifications for critical events',
        value: true,
        type: 'boolean'
      },
      {
        id: '8',
        category: 'notifications',
        name: 'Slack Integration',
        description: 'Enable Slack webhook notifications',
        value: false,
        type: 'boolean'
      },
      {
        id: '9',
        category: 'notifications',
        name: 'Notification Threshold',
        description: 'Minimum severity for notifications',
        value: 'warning',
        type: 'select',
        options: ['info', 'warning', 'error', 'critical']
      },
      {
        id: '10',
        category: 'api',
        name: 'API Rate Limit',
        description: 'Maximum API requests per minute',
        value: '1000',
        type: 'select',
        options: ['100', '500', '1000', '5000', '10000']
      },
      {
        id: '11',
        category: 'api',
        name: 'API Authentication',
        description: 'Require API key for all requests',
        value: true,
        type: 'boolean'
      },
      {
        id: '12',
        category: 'api',
        name: 'CORS Enabled',
        description: 'Enable Cross-Origin Resource Sharing',
        value: true,
        type: 'boolean'
      }
    ];

    setSettings(sampleSettings);
    setLoading(false);
  };

  const loadCloudProviders = () => {
    const providers: CloudProvider[] = [
      {
        id: '1',
        name: 'AWS',
        status: 'connected',
        region: 'us-east-1',
        resources: 248,
        lastSync: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: '2',
        name: 'Azure',
        status: 'connected',
        region: 'eastus',
        resources: 142,
        lastSync: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: '3',
        name: 'GCP',
        status: 'disconnected',
        region: 'us-central1',
        resources: 0,
        lastSync: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '4',
        name: 'DigitalOcean',
        status: 'connected',
        region: 'nyc3',
        resources: 28,
        lastSync: new Date(Date.now() - 900000).toISOString()
      }
    ];

    setCloudProviders(providers);
  };

  const handleSettingChange = (id: string, value: string | boolean) => {
    setSettings(settings.map(s => s.id === id ? { ...s, value } : s));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'disconnected':
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-400 bg-green-400/20';
      case 'disconnected':
        return 'text-gray-400 bg-gray-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'cloud', name: 'Cloud Providers', icon: CloudIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'api', name: 'API', icon: ServerIcon }
  ];

  const filteredSettings = settings.filter(s => s.category === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Settings
            </h1>
            <p className="text-gray-300">Configure platform settings and integrations</p>
          </div>
          {saveStatus !== 'idle' && (
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              saveStatus === 'saving' ? 'bg-blue-400/20 text-blue-400' :
              saveStatus === 'saved' ? 'bg-green-400/20 text-green-400' :
              'bg-red-400/20 text-red-400'
            }`}>
              {saveStatus === 'saving' && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
              {saveStatus === 'saved' && <CheckCircleIcon className="w-5 h-5" />}
              {saveStatus === 'error' && <XCircleIcon className="w-5 h-5" />}
              <span className="font-semibold">
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Error saving'}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Cloud Providers Tab */}
        {activeTab === 'cloud' && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CloudIcon className="w-6 h-6 text-blue-400" />
              Cloud Provider Connections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cloudProviders.map((provider) => (
                <div key={provider.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CloudIcon className="w-8 h-8 text-blue-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{provider.name}</h3>
                        <p className="text-sm text-gray-400">{provider.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(provider.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(provider.status)}`}>
                        {provider.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resources:</span>
                      <span className="text-white font-semibold">{provider.resources}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Sync:</span>
                      <span className="text-white">{new Date(provider.lastSync).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Configure
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Settings Tabs */}
        {activeTab !== 'cloud' && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 capitalize">{activeTab} Settings</h2>
            <div className="space-y-4">
              {filteredSettings.map((setting) => (
                <div key={setting.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-4">
                      <h3 className="text-lg font-semibold text-white mb-1">{setting.name}</h3>
                      <p className="text-sm text-gray-400">{setting.description}</p>
                    </div>
                    <div className="w-64">
                      {setting.type === 'boolean' ? (
                        <button
                          onClick={() => handleSettingChange(setting.id, !setting.value)}
                          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                            setting.value ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              setting.value ? 'translate-x-9' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : setting.type === 'select' ? (
                        <select
                          value={setting.value as string}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                        >
                          {setting.options?.map((option) => (
                            <option key={option} value={option} className="bg-slate-800">
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : setting.type === 'password' ? (
                        <input
                          type="password"
                          value={setting.value as string}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                        />
                      ) : (
                        <input
                          type="text"
                          value={setting.value as string}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => loadSettings()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saveStatus === 'saving' && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Settings;
