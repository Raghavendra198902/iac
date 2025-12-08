import React, { useState } from 'react';
import {
  DocumentTextIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  ServerIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface License {
  type: string;
  status: 'active' | 'expiring' | 'expired';
  expiryDate: string;
  licensedTo: string;
  users: number;
  maxUsers: number;
  features: string[];
}

const AdminLicense: React.FC = () => {
  const [license] = useState<License>({
    type: 'Enterprise',
    status: 'active',
    expiryDate: '2026-12-31',
    licensedTo: 'ACME Corporation',
    users: 45,
    maxUsers: 100,
    features: [
      'Multi-Cloud Support',
      'AI-Powered Recommendations',
      'Advanced Security',
      'Compliance Management',
      'Custom Integrations',
      'Priority Support',
      '24/7 Monitoring',
      'SSO Integration',
      'API Access',
      'Unlimited Projects'
    ]
  });

  const [licenseKey] = useState<string>('XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expiring':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'expired':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'expiring':
        return <ClockIcon className="w-5 h-5" />;
      case 'expired':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const daysUntilExpiry = Math.floor((new Date(license.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const userUsagePercent = (license.users / license.maxUsers) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <KeyIcon className="w-8 h-8 text-yellow-400" />
            License Management
          </h1>
          <p className="text-gray-400 mt-1">
            View and manage your platform license
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2">
          <KeyIcon className="w-5 h-5" />
          Update License
        </button>
      </div>

      {/* License Status Banner */}
      <div className={`backdrop-blur-xl rounded-2xl border p-6 ${
        license.status === 'active' 
          ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30'
          : license.status === 'expiring'
          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
          : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon(license.status)}
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {license.type} License
              </h2>
              <p className="text-gray-300">
                Licensed to: <span className="font-semibold">{license.licensedTo}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(license.status)}`}>
              {license.status.toUpperCase()}
            </span>
            <p className="text-sm text-gray-400 mt-2">
              {daysUntilExpiry > 0 
                ? `Expires in ${daysUntilExpiry} days`
                : 'Expired'
              }
            </p>
          </div>
        </div>
      </div>

      {/* License Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">License Type</span>
            <DocumentTextIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{license.type}</div>
          <div className="text-sm text-gray-400 mt-1">Full access</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Users</span>
            <UserGroupIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{license.users}/{license.maxUsers}</div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${userUsagePercent > 80 ? 'bg-red-500' : userUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${userUsagePercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Features</span>
            <ServerIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{license.features.length}</div>
          <div className="text-sm text-green-400 mt-1">All enabled</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Expiry Date</span>
            <ClockIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{license.expiryDate}</div>
          <div className="text-sm text-gray-400 mt-1">{daysUntilExpiry} days left</div>
        </div>
      </div>

      {/* License Key */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <KeyIcon className="w-6 h-6 text-yellow-400" />
          License Key
        </h2>
        <div className="flex items-center gap-4">
          <code className="flex-1 px-4 py-3 bg-black/30 rounded-lg text-gray-300 font-mono text-lg tracking-wider">
            {licenseKey}
          </code>
          <button className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-semibold">
            Copy
          </button>
        </div>
      </div>

      {/* Licensed Features */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 text-green-400" />
          Licensed Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {license.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-white font-semibold">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* License Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">License Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">License ID:</span>
              <span className="text-white font-semibold">LIC-2024-ENT-001</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Issue Date:</span>
              <span className="text-white font-semibold">2024-01-01</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Expiry Date:</span>
              <span className="text-white font-semibold">{license.expiryDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">License Type:</span>
              <span className="text-white font-semibold">{license.type}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Organization:</span>
              <span className="text-white font-semibold">{license.licensedTo}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Support Level:</span>
              <span className="text-white font-semibold">Priority</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Usage Statistics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Active Users</span>
                <span className="text-white font-semibold">{license.users} / {license.maxUsers}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  style={{ width: `${userUsagePercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">License Validity</span>
                <span className="text-white font-semibold">{Math.floor((daysUntilExpiry / 730) * 100)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-yellow-500 h-3 rounded-full"
                  style={{ width: `${Math.floor((daysUntilExpiry / 730) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Features Enabled</span>
                <span className="text-white font-semibold">100%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">License Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">
            Renew License
          </button>
          <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold">
            Upgrade Plan
          </button>
          <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLicense;
