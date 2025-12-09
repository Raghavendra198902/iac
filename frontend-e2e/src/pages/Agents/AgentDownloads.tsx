import React, { useState, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  ServerIcon,
  CommandLineIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  CpuChipIcon,
  CloudArrowDownIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface AgentPackage {
  id: string;
  name: string;
  platform: string;
  version: string;
  size: string;
  description: string;
  downloadUrl: string;
  checksum: string;
  icon: React.ReactNode;
  releaseDate: string;
  downloads: number;
  status: 'stable' | 'beta' | 'deprecated';
  requirements: string[];
  features: string[];
  compatibility: string[];
}

interface DownloadStats {
  totalDownloads: number;
  last24Hours: number;
  popularAgent: string;
}

interface SystemInfo {
  platform: string;
  arch: string;
  detected: boolean;
}

const AgentDownloads: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<AgentPackage | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({ platform: 'Unknown', arch: 'Unknown', detected: false });

  // Detect user's system
  useEffect(() => {
    const detectSystem = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      let platform = 'Unknown';
      let arch = 'x64';

      if (userAgent.includes('win')) platform = 'Windows';
      else if (userAgent.includes('mac')) platform = 'macOS';
      else if (userAgent.includes('linux')) platform = 'Linux';

      if (userAgent.includes('arm') || userAgent.includes('aarch64')) arch = 'arm64';

      setSystemInfo({ platform, arch, detected: true });
      
      // Auto-select detected platform
      if (platform !== 'Unknown') {
        setSelectedPlatform(platform);
      }
    };

    detectSystem();
  }, []);

  const stats: DownloadStats = {
    totalDownloads: 15847,
    last24Hours: 342,
    popularAgent: 'Windows Agent',
  };

  const agents: AgentPackage[] = [
    {
      id: 'windows',
      name: 'Windows Agent',
      platform: 'Windows',
      version: '1.4.0',
      size: '13 MB',
      description: 'Enterprise-grade Windows agent with complete security monitoring, WMI integration, Registry monitoring, Event Log API, PDH performance counters, Windows Defender, Firewall, and Windows Update tracking',
      downloadUrl: '/downloads/cmdb-agent-windows-amd64-v1.4.exe',
      checksum: 'SHA256: 8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      icon: <ServerIcon className="h-8 w-8 text-blue-500" />,
      releaseDate: '2025-12-09',
      downloads: 8420,
      status: 'stable',
      requirements: ['Windows Server 2016+', 'Windows 10/11', '2 GB RAM', '100 MB Disk', 'Administrator privileges'],
      features: [
        'Complete Windows security monitoring (Defender, Firewall, Updates)',
        'Real-time WMI monitoring (11 WMI classes)',
        'Registry change tracking and policies',
        'Event Log API integration (5 log sources)',
        'PDH performance counters (40+ metrics)',
        'CPU, Memory, Disk, Network monitoring',
        'Threat detection and tracking',
        'Firewall rule management',
        'Windows Update status',
        'Auto-update capability',
        'Encrypted communication',
        'Role-based access control'
      ],
      compatibility: ['Windows Server 2016', 'Windows Server 2019', 'Windows Server 2022', 'Windows 10', 'Windows 11'],
    },
    {
      id: 'windows-cli',
      name: 'Windows CLI Tool',
      platform: 'Windows',
      version: '1.0.0',
      size: '5.9 MB',
      description: 'Advanced command-line interface for Windows agent management, configuration, and troubleshooting',
      downloadUrl: '/downloads/cmdb-agent-cli-windows-amd64.exe',
      checksum: 'SHA256: 9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
      icon: <CommandLineIcon className="h-8 w-8 text-purple-500" />,
      releaseDate: '2025-12-03',
      downloads: 3215,
      status: 'stable',
      requirements: ['Windows 10+', 'PowerShell 5.1+', '512 MB RAM'],
      features: [
        'Agent lifecycle management',
        'Configuration validation',
        'Real-time diagnostics',
        'Bulk operations',
        'Script automation',
        'Remote management',
        'Log analysis',
        'Performance profiling'
      ],
      compatibility: ['Windows 10', 'Windows 11', 'Windows Server 2016+'],
    },
    {
      id: 'windows-package',
      name: 'Windows Complete Package',
      platform: 'Windows',
      version: '1.0.0',
      size: '6.0 MB',
      description: 'Complete distribution bundle with agent, CLI, PowerShell modules, installation scripts, and comprehensive documentation',
      downloadUrl: '/downloads/cmdb-agent-windows-1.0.0.zip',
      checksum: 'SHA256: 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      icon: <DocumentTextIcon className="h-8 w-8 text-green-500" />,
      releaseDate: '2025-12-03',
      downloads: 2894,
      status: 'stable',
      requirements: ['Windows Server 2016+', 'Windows 10/11', 'PowerShell 5.1+', '200 MB Disk'],
      features: [
        'One-click installation',
        'Automated configuration',
        'Rollback support',
        'Silent installation',
        'Group Policy templates',
        'MSI installer included',
        'Update manager',
        'Migration tools'
      ],
      compatibility: ['Windows Server 2016+', 'Windows 10+'],
    },
    {
      id: 'linux',
      name: 'Linux Agent',
      platform: 'Linux',
      version: '1.0.0',
      size: '7.2 MB',
      description: 'Production-ready Linux agent with systemd integration, cgroups monitoring, and comprehensive hardware detection',
      downloadUrl: '/downloads/cmdb-agent-linux-amd64',
      checksum: 'SHA256: 2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
      icon: <ServerIcon className="h-8 w-8 text-orange-500" />,
      releaseDate: '2025-12-03',
      downloads: 1142,
      status: 'stable',
      requirements: ['Linux Kernel 4.x+', 'systemd', '1 GB RAM', '50 MB Disk', 'glibc 2.28+'],
      features: [
        'systemd service integration',
        'cgroups v2 monitoring',
        'eBPF tracing support',
        'Container detection',
        'Network statistics',
        'Disk I/O monitoring',
        'Process tree tracking',
        'SELinux/AppArmor support'
      ],
      compatibility: ['Ubuntu 18.04+', 'RHEL 7+', 'CentOS 7+', 'Debian 10+', 'Fedora 30+', 'SUSE 15+'],
    },
    {
      id: 'linux-arm',
      name: 'Linux Agent (ARM64)',
      platform: 'Linux',
      version: '1.0.0',
      size: '6.9 MB',
      description: 'Optimized Linux agent for ARM64 architecture including Raspberry Pi and AWS Graviton processors',
      downloadUrl: '/downloads/cmdb-agent-linux-arm64',
      checksum: 'SHA256: 3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
      icon: <CpuChipIcon className="h-8 w-8 text-red-500" />,
      releaseDate: '2025-12-03',
      downloads: 176,
      status: 'stable',
      requirements: ['ARM64 processor', 'Linux Kernel 4.x+', 'systemd', '512 MB RAM'],
      features: [
        'ARM-optimized binary',
        'Low memory footprint',
        'Energy-efficient monitoring',
        'IoT device support',
        'Edge computing ready',
        'Raspberry Pi optimized',
        'AWS Graviton support',
        'Container-native'
      ],
      compatibility: ['Raspberry Pi 4+', 'AWS Graviton', 'ARM-based servers', 'IoT devices'],
    },
    {
      id: 'macos',
      name: 'macOS Agent',
      platform: 'macOS',
      version: '1.0.0',
      size: '6.8 MB',
      description: 'Native macOS agent with launchd integration, System Extensions support, and MDM compatibility',
      downloadUrl: '/downloads/cmdb-agent-darwin-amd64',
      checksum: 'SHA256: 4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      icon: <ServerIcon className="h-8 w-8 text-gray-500" />,
      releaseDate: '2025-12-03',
      downloads: 0,
      status: 'beta',
      requirements: ['macOS 11 Big Sur+', 'Apple Silicon or Intel', '1 GB RAM', '100 MB Disk'],
      features: [
        'launchd service management',
        'System Extensions support',
        'MDM profile support',
        'Unified logging',
        'XProtect integration',
        'Gatekeeper compatible',
        'Notarized application',
        'Universal binary (Intel + ARM)'
      ],
      compatibility: ['macOS 11 Big Sur', 'macOS 12 Monterey', 'macOS 13 Ventura', 'macOS 14 Sonoma', 'macOS 15 Sequoia'],
    },
    {
      id: 'docker',
      name: 'Docker Container',
      platform: 'Docker',
      version: '1.0.0',
      size: '45 MB',
      description: 'Containerized agent for Docker and Kubernetes environments with auto-discovery and orchestration support',
      downloadUrl: 'docker pull ghcr.io/iac/cmdb-agent:latest',
      checksum: 'SHA256: 5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
      icon: <CloudArrowDownIcon className="h-8 w-8 text-cyan-500" />,
      releaseDate: '2025-12-03',
      downloads: 0,
      status: 'beta',
      requirements: ['Docker 20.x+', 'Kubernetes 1.20+ (optional)', '256 MB RAM', '100 MB Storage'],
      features: [
        'Multi-architecture support',
        'Kubernetes DaemonSet ready',
        'Service mesh aware',
        'Auto-discovery',
        'Health check endpoints',
        'Prometheus metrics',
        'OpenTelemetry support',
        'Zero-downtime updates'
      ],
      compatibility: ['Docker', 'Kubernetes', 'OpenShift', 'ECS', 'AKS', 'GKE', 'EKS'],
    },
  ];

  const filteredAgents = selectedPlatform === 'all' 
    ? agents.filter(agent => 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.platform.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : agents.filter(agent => 
        agent.platform.toLowerCase() === selectedPlatform.toLowerCase() &&
        (agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const platforms = ['all', 'Windows', 'Linux', 'macOS', 'Docker'];

  const handleDownload = (agent: AgentPackage) => {
    console.log(`Downloading ${agent.name}...`);
    
    // Simulate download progress
    setDownloadProgress(prev => ({ ...prev, [agent.id]: 0 }));
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const current = prev[agent.id] || 0;
        if (current >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[agent.id];
              return newProgress;
            });
          }, 2000);
          return prev;
        }
        return { ...prev, [agent.id]: current + 10 };
      });
    }, 200);
    
    // In production, this would trigger actual download
    if (agent.downloadUrl.startsWith('http') || agent.downloadUrl.startsWith('/')) {
      window.open(agent.downloadUrl, '_blank');
    } else {
      // For docker commands, show modal
      setSelectedAgent(agent);
      setShowModal(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stable':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-400 bg-green-400/10 rounded-full border border-green-400/20">
            <CheckBadgeIcon className="h-3 w-3" />
            Stable
          </span>
        );
      case 'beta':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-400 bg-yellow-400/10 rounded-full border border-yellow-400/20">
            <ExclamationTriangleIcon className="h-3 w-3" />
            Beta
          </span>
        );
      case 'deprecated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 bg-red-400/10 rounded-full border border-red-400/20">
            <ExclamationTriangleIcon className="h-3 w-3" />
            Deprecated
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDownloads = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <ArrowDownTrayIcon className="h-8 w-8 text-blue-400" />
                Agent Downloads
              </h1>
              <p className="mt-2 text-gray-300">
                Download enterprise-grade CMDB agents for comprehensive infrastructure monitoring
              </p>
              {systemInfo.detected && (
                <p className="mt-1 text-sm text-blue-400 flex items-center gap-2">
                  <InformationCircleIcon className="h-4 w-4" />
                  Detected: {systemInfo.platform} ({systemInfo.arch})
                </p>
              )}
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-blue-500/10 backdrop-blur-xl rounded-lg border border-blue-500/20 px-4 py-2">
                <div className="text-xs text-blue-400">Total Downloads</div>
                <div className="text-2xl font-bold text-white">{stats.totalDownloads.toLocaleString()}</div>
              </div>
              <div className="bg-green-500/10 backdrop-blur-xl rounded-lg border border-green-500/20 px-4 py-2">
                <div className="text-xs text-green-400">Last 24h</div>
                <div className="text-2xl font-bold text-white">{stats.last24Hours}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search agents by name, description, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Platform Filter */}
          
          {/* Platform Filter */}
          <div className="flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPlatform === platform
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-xl border border-white/20'
                }`}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
            
            <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
              <span>{filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} available</span>
            </div>
          </div>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredAgents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ServerIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Icon, Version, and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-shrink-0">
                    {agent.icon}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-medium text-gray-400">
                      v{agent.version}
                    </span>
                    {getStatusBadge(agent.status)}
                  </div>
                </div>

                {/* Name and Platform */}
                <h3 className="text-xl font-semibold text-white mb-1">
                  {agent.name}
                </h3>
                <p className="text-sm text-blue-400 mb-3">{agent.platform}</p>

                {/* Description */}
                <p className="text-sm text-gray-300 mb-4 min-h-[60px] line-clamp-3">
                  {agent.description}
                </p>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <DocumentTextIcon className="h-4 w-4" />
                      Size:
                    </span>
                    <span className="text-white font-medium">{agent.size}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      Released:
                    </span>
                    <span className="text-white font-medium">{formatDate(agent.releaseDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <ChartBarIcon className="h-4 w-4" />
                      Downloads:
                    </span>
                    <span className="text-white font-medium">{formatDownloads(agent.downloads)}</span>
                  </div>
                </div>

                {/* Requirements Preview */}
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setSelectedAgent(agent);
                      setShowModal(true);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <InformationCircleIcon className="h-4 w-4" />
                    View requirements & features
                  </button>
                </div>

                {/* Download Progress */}
                {downloadProgress[agent.id] !== undefined && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 transition-all duration-300"
                        style={{ width: `${downloadProgress[agent.id]}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Downloading... {downloadProgress[agent.id]}%</p>
                  </div>
                )}

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(agent)}
                  disabled={downloadProgress[agent.id] !== undefined}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    downloadProgress[agent.id] !== undefined
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  {downloadProgress[agent.id] !== undefined ? 'Downloading...' : 'Download'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Details Modal */}
        {showModal && selectedAgent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-900 border-b border-white/20 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedAgent.icon}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                    <p className="text-sm text-gray-400">Version {selectedAgent.version}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300">{selectedAgent.description}</p>
                </div>

                {/* System Requirements */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">System Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedAgent.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedAgent.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compatibility */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Compatibility</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.compatibility.map((comp, idx) => (
                      <span key={idx} className="px-3 py-1 text-sm bg-white/10 text-gray-300 rounded-full border border-white/20">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Checksum */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Checksum</h3>
                  <div className="bg-black/30 rounded-lg p-3">
                    <code className="text-xs text-green-400 font-mono break-all">{selectedAgent.checksum}</code>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => {
                    handleDownload(selectedAgent);
                    setShowModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Download {selectedAgent.name}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Installation Instructions */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">{/* Windows Installation */}
          {/* Windows Installation */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CodeBracketIcon className="h-6 w-6 text-blue-400" />
              Windows Installation
            </h3>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300">
              <p className="text-green-400"># Download and Install</p>
              <p className="mt-2">Invoke-WebRequest -Uri "http://localhost:3000/downloads/cmdb-agent-windows-1.0.0.zip" `</p>
              <p>  -OutFile "cmdb-agent.zip"</p>
              <p className="mt-2">Expand-Archive -Path "cmdb-agent.zip" -DestinationPath "C:\Temp\cmdb-agent"</p>
              <p className="mt-2">cd C:\Temp\cmdb-agent</p>
              <p>.\install-windows.ps1</p>
              <p className="mt-4 text-green-400"># Verify Installation</p>
              <p>Get-Service CMDBAgent</p>
            </div>
          </div>

          {/* Linux Installation */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CodeBracketIcon className="h-6 w-6 text-orange-400" />
              Linux Installation
            </h3>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300">
              <p className="text-green-400"># Download and Install</p>
              <p className="mt-2">wget http://localhost:3000/downloads/cmdb-agent-linux-amd64</p>
              <p>chmod +x cmdb-agent-linux-amd64</p>
              <p>sudo mv cmdb-agent-linux-amd64 /usr/local/bin/cmdb-agent</p>
              <p className="mt-4 text-green-400"># Create systemd service</p>
              <p>sudo cmdb-agent install</p>
              <p className="mt-4 text-green-400"># Start service</p>
              <p>sudo systemctl start cmdb-agent</p>
              <p>sudo systemctl enable cmdb-agent</p>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8">
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <CheckCircleIcon className="h-7 w-7 text-green-400" />
            Agent Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <ServerIcon className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">System Inventory</h4>
                <p className="text-sm text-gray-300">Comprehensive hardware and software discovery</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">Security Monitoring</h4>
                <p className="text-sm text-gray-300">Real-time security assessment and compliance tracking</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CommandLineIcon className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">CLI Management</h4>
                <p className="text-sm text-gray-300">Powerful command-line tools for agent management</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">Auto-Discovery</h4>
                <p className="text-sm text-gray-300">Automatic detection of infrastructure changes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DocumentTextIcon className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">License Tracking</h4>
                <p className="text-sm text-gray-300">Monitor and manage software license compliance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CodeBracketIcon className="h-6 w-6 text-pink-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">REST API</h4>
                <p className="text-sm text-gray-300">30+ API endpoints with RBAC and rate limiting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDownloads;
