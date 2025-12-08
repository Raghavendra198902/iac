import React, { useState, useEffect } from 'react';
import {
  GlobeAltIcon,
  ArrowPathIcon,
  SignalIcon,
  ShieldCheckIcon,
  ServerIcon,
  CloudIcon,
  ArrowsRightLeftIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface NetworkZone {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dmz' | 'management';
  subnet: string;
  vlan: number;
  connectivity: {
    bandwidth: number;
    latency: number;
    packetLoss: number;
  };
  security: {
    firewall: boolean;
    ids: boolean;
    encryption: boolean;
  };
  resources: number;
  traffic: number;
}

const TANetwork: React.FC = () => {
  const [zones, setZones] = useState<NetworkZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadNetworkZones();
  }, []);

  const loadNetworkZones = () => {
    const sampleZones: NetworkZone[] = [
      {
        id: '1',
        name: 'Public Web Zone',
        type: 'public',
        subnet: '10.0.1.0/24',
        vlan: 100,
        connectivity: { bandwidth: 10000, latency: 5, packetLoss: 0.01 },
        security: { firewall: true, ids: true, encryption: true },
        resources: 24,
        traffic: 8500
      },
      {
        id: '2',
        name: 'Application Tier',
        type: 'private',
        subnet: '10.0.10.0/24',
        vlan: 200,
        connectivity: { bandwidth: 10000, latency: 1, packetLoss: 0.001 },
        security: { firewall: true, ids: true, encryption: true },
        resources: 48,
        traffic: 12000
      },
      {
        id: '3',
        name: 'Database Layer',
        type: 'private',
        subnet: '10.0.20.0/24',
        vlan: 300,
        connectivity: { bandwidth: 10000, latency: 1, packetLoss: 0.001 },
        security: { firewall: true, ids: true, encryption: true },
        resources: 16,
        traffic: 6500
      },
      {
        id: '4',
        name: 'DMZ Services',
        type: 'dmz',
        subnet: '10.0.5.0/24',
        vlan: 150,
        connectivity: { bandwidth: 5000, latency: 3, packetLoss: 0.01 },
        security: { firewall: true, ids: true, encryption: true },
        resources: 12,
        traffic: 3200
      },
      {
        id: '5',
        name: 'Management Network',
        type: 'management',
        subnet: '10.0.99.0/24',
        vlan: 999,
        connectivity: { bandwidth: 1000, latency: 2, packetLoss: 0.001 },
        security: { firewall: true, ids: true, encryption: true },
        resources: 8,
        traffic: 450
      },
      {
        id: '6',
        name: 'API Gateway Zone',
        type: 'dmz',
        subnet: '10.0.6.0/24',
        vlan: 160,
        connectivity: { bandwidth: 10000, latency: 2, packetLoss: 0.005 },
        security: { firewall: true, ids: true, encryption: true },
        resources: 18,
        traffic: 9800
      }
    ];

    setZones(sampleZones);
    setLoading(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public':
        return 'text-blue-400 bg-blue-400/20';
      case 'private':
        return 'text-purple-400 bg-purple-400/20';
      case 'dmz':
        return 'text-orange-400 bg-orange-400/20';
      case 'management':
        return 'text-cyan-400 bg-cyan-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <GlobeAltIcon className="w-6 h-6 text-blue-400" />;
      case 'private':
        return <ShieldCheckIcon className="w-6 h-6 text-purple-400" />;
      case 'dmz':
        return <FireIcon className="w-6 h-6 text-orange-400" />;
      case 'management':
        return <ServerIcon className="w-6 h-6 text-cyan-400" />;
      default:
        return <CloudIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const types = ['all', 'public', 'private', 'dmz', 'management'];
  const filteredZones = selectedType === 'all' ? zones : zones.filter(z => z.type === selectedType);

  const totalBandwidth = zones.reduce((sum, z) => sum + z.connectivity.bandwidth, 0);
  const totalResources = zones.reduce((sum, z) => sum + z.resources, 0);
  const totalTraffic = zones.reduce((sum, z) => sum + z.traffic, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading network architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Network Architecture
            </h1>
            <p className="text-gray-300">Network zones, connectivity, and security architecture</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedType === type
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <GlobeAltIcon className="w-8 h-8 text-indigo-400" />
              <span className="text-3xl font-bold text-white">{zones.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Network Zones</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <SignalIcon className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{(totalBandwidth / 1000).toFixed(0)} Gbps</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Bandwidth</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ServerIcon className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">{totalResources}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Resources</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ArrowsRightLeftIcon className="w-8 h-8 text-pink-400" />
              <span className="text-3xl font-bold text-white">{(totalTraffic / 1000).toFixed(1)}K</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Traffic (Mbps)</h3>
          </div>
        </div>

        {/* Network Zones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredZones.map((zone) => (
            <div
              key={zone.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getTypeIcon(zone.type)}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{zone.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(zone.type)}`}>
                        {zone.type.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-white/10 text-gray-300">
                        VLAN {zone.vlan}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Subnet Range</p>
                  <p className="text-lg font-bold text-white font-mono">{zone.subnet}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Bandwidth</p>
                    <p className="text-lg font-bold text-white">{zone.connectivity.bandwidth} Mbps</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Latency</p>
                    <p className="text-lg font-bold text-white">{zone.connectivity.latency}ms</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Loss</p>
                    <p className="text-lg font-bold text-white">{zone.connectivity.packetLoss}%</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">Security Features</p>
                  <div className="flex gap-2">
                    {zone.security.firewall && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-400/20 text-green-400">
                        ✓ Firewall
                      </span>
                    )}
                    {zone.security.ids && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-400/20 text-green-400">
                        ✓ IDS/IPS
                      </span>
                    )}
                    {zone.security.encryption && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-400/20 text-green-400">
                        ✓ Encryption
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <div>
                    <p className="text-xs text-gray-400">Resources</p>
                    <p className="text-sm font-semibold text-white">{zone.resources} hosts</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Traffic</p>
                    <p className="text-sm font-semibold text-white">{zone.traffic} Mbps</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Utilization</p>
                    <p className="text-sm font-semibold text-white">
                      {((zone.traffic / zone.connectivity.bandwidth) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default TANetwork;
