import { useState } from 'react';
import { MainLayout } from '../../components/layout';
import {
  Download,
  Monitor,
  Smartphone,
  Server,
  Shield,
  CheckCircle,
  AlertCircle,
  Package,
  HardDrive,
  Cpu,
  ExternalLink,
  Terminal,
  FileCode,
  Lock,
  Zap,
  Cloud,
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  platform: string;
  icon: any;
  version: string;
  size: string;
  architecture: string[];
  description: string;
  features: string[];
  requirements: {
    os: string;
    ram: string;
    disk: string;
    cpu: string;
  };
  downloadUrl: string;
  checksum: string;
  releaseDate: string;
  color: string;
}

export default function AgentDownloads() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const agents: Agent[] = [
    {
      id: 'windows',
      name: 'CMDB Agent for Windows',
      platform: 'Windows',
      icon: Monitor,
      version: '2.4.1',
      size: '45 MB',
      architecture: ['x64', 'x86'],
      description: 'Comprehensive CMDB agent for Windows endpoints with real-time monitoring and compliance tracking.',
      features: [
        'Real-time configuration discovery',
        'Hardware and software inventory',
        'Security compliance scanning',
        'Automated vulnerability detection',
        'Network topology mapping',
        'Event log collection and analysis',
        'Windows Registry monitoring',
        'Active Directory integration',
      ],
      requirements: {
        os: 'Windows 10/11, Server 2016+',
        ram: '2 GB minimum, 4 GB recommended',
        disk: '500 MB available space',
        cpu: 'Intel Core i3 or equivalent',
      },
      downloadUrl: '/downloads/cmdb-agent-windows-2.4.1.msi',
      checksum: 'sha256:a7f8d9e6c4b2a1f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5',
      releaseDate: '2024-11-20',
      color: 'blue',
    },
    {
      id: 'linux',
      name: 'CMDB Agent for Linux',
      platform: 'Linux',
      icon: Terminal,
      version: '2.4.1',
      size: '38 MB',
      architecture: ['x86_64', 'aarch64'],
      description: 'Lightweight CMDB agent for Linux servers and workstations with minimal resource footprint.',
      features: [
        'Package manager integration',
        'Kernel and module tracking',
        'Container discovery (Docker, Podman)',
        'System metrics collection',
        'Process and service monitoring',
        'Security patch tracking',
        'Log aggregation and forwarding',
        'Custom script execution',
      ],
      requirements: {
        os: 'RHEL/CentOS 7+, Ubuntu 18.04+, Debian 10+',
        ram: '1 GB minimum, 2 GB recommended',
        disk: '300 MB available space',
        cpu: 'x86_64 or ARM64',
      },
      downloadUrl: '/downloads/cmdb-agent-linux-2.4.1.tar.gz',
      checksum: 'sha256:b8e9f0d1e5c3b2a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6',
      releaseDate: '2024-11-20',
      color: 'green',
    },
    {
      id: 'macos',
      name: 'CMDB Agent for macOS',
      platform: 'macOS',
      icon: Monitor,
      version: '2.4.0',
      size: '42 MB',
      architecture: ['Intel', 'Apple Silicon'],
      description: 'Native CMDB agent for macOS with Gatekeeper and notarization support.',
      features: [
        'System profiler integration',
        'Application inventory',
        'FileVault and T2 chip monitoring',
        'Xcode and developer tools tracking',
        'Homebrew package detection',
        'MDM integration support',
        'Keychain security analysis',
        'Network configuration monitoring',
      ],
      requirements: {
        os: 'macOS 11 (Big Sur) or later',
        ram: '2 GB minimum, 4 GB recommended',
        disk: '400 MB available space',
        cpu: 'Intel Core i5 or Apple M1/M2',
      },
      downloadUrl: '/downloads/cmdb-agent-macos-2.4.0.pkg',
      checksum: 'sha256:c9f0e1d2e6c4b3a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7',
      releaseDate: '2024-11-18',
      color: 'purple',
    },
    {
      id: 'android',
      name: 'CMDB Agent for Android',
      platform: 'Android',
      icon: Smartphone,
      version: '1.8.2',
      size: '28 MB',
      architecture: ['ARM', 'ARM64'],
      description: 'Mobile CMDB agent for Android devices with enterprise mobility management.',
      features: [
        'Device profile collection',
        'App inventory and permissions',
        'Network and WiFi scanning',
        'Battery and performance metrics',
        'Location tracking (with consent)',
        'Security policy enforcement',
        'Remote wipe capability',
        'Certificate pinning',
      ],
      requirements: {
        os: 'Android 8.0 (Oreo) or later',
        ram: '512 MB available',
        disk: '100 MB available space',
        cpu: 'ARMv7 or later',
      },
      downloadUrl: '/downloads/cmdb-agent-android-1.8.2.apk',
      checksum: 'sha256:d0e1f2e3d7c5b4a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8',
      releaseDate: '2024-11-15',
      color: 'orange',
    },
    {
      id: 'cloud',
      name: 'Cloud Agent (Docker/K8s)',
      platform: 'Container',
      icon: Cloud,
      version: '3.0.1',
      size: '125 MB',
      architecture: ['amd64', 'arm64'],
      description: 'Containerized CMDB agent for cloud-native environments with Kubernetes support.',
      features: [
        'Kubernetes pod discovery',
        'Docker container tracking',
        'Cloud provider integration (AWS, Azure, GCP)',
        'Service mesh observability',
        'Resource utilization metrics',
        'Auto-scaling event tracking',
        'ConfigMap and Secret monitoring',
        'Multi-cluster support',
      ],
      requirements: {
        os: 'Docker 20.10+, Kubernetes 1.21+',
        ram: '512 MB minimum, 1 GB recommended',
        disk: '500 MB available space',
        cpu: '0.5 vCPU minimum',
      },
      downloadUrl: '/downloads/cmdb-agent-cloud-3.0.1.tar',
      checksum: 'sha256:e1f2d3e4c8b6a5f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9',
      releaseDate: '2024-11-22',
      color: 'cyan',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', hover: 'hover:bg-green-100' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', hover: 'hover:bg-orange-100' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', hover: 'hover:bg-cyan-100' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Download className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">CMDB Agent Downloads</h1>
              <p className="text-blue-100 text-lg">
                Cross-platform agents for comprehensive IT asset discovery and monitoring
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Platforms', value: '5+', icon: Server },
              { label: 'Active Deployments', value: '10K+', icon: Shield },
              { label: 'Uptime', value: '99.9%', icon: CheckCircle },
              { label: 'Latest Version', value: '2.4.1', icon: Package },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-sm text-blue-100">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const colors = getColorClasses(agent.color);

            return (
              <div
                key={agent.id}
                className={`bg-white rounded-xl border-2 ${colors.border} overflow-hidden hover:shadow-xl transition-all`}
              >
                {/* Card Header */}
                <div className={`${colors.bg} p-6 border-b ${colors.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 bg-white rounded-lg border ${colors.border}`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                        <p className="text-sm text-gray-600">{agent.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${colors.text}`}>v{agent.version}</div>
                      <div className="text-xs text-gray-500">{agent.size}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{agent.description}</p>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Architecture */}
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Architecture:</span>
                    <div className="flex gap-2">
                      {agent.architecture.map((arch) => (
                        <span
                          key={arch}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {arch}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        <strong>OS:</strong> {agent.requirements.os}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>• RAM: {agent.requirements.ram}</div>
                      <div>• Disk: {agent.requirements.disk}</div>
                    </div>
                  </div>

                  {/* Features Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">Key Features</span>
                    </div>
                    <ul className="space-y-1">
                      {agent.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {agent.features.length > 4 && (
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        +{agent.features.length - 4} more features...
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <a
                      href={agent.downloadUrl}
                      download
                      className={`flex-1 px-4 py-3 ${colors.text} border-2 ${colors.border} rounded-lg hover:${colors.bg} transition-colors flex items-center justify-center gap-2 font-semibold no-underline`}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    <button
                      onClick={() => setSelectedAgent(agent)}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FileCode className="w-4 h-4" />
                      Details
                    </button>
                  </div>

                  {/* Release Info */}
                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>Released: {agent.releaseDate}</span>
                    <button
                      className="flex items-center gap-1 hover:text-gray-700"
                      title={agent.checksum}
                    >
                      <Lock className="w-3 h-3" />
                      Checksum
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Installation Guide */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileCode className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Installation Guide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                Windows Installation
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700">
                <div>1. Download .msi installer</div>
                <div>2. Run as Administrator</div>
                <div>3. Follow setup wizard</div>
                <div>4. Verify: <code className="bg-white px-2 py-1 rounded">cmdb-agent --version</code></div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-600" />
                Linux Installation
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700">
                <div>$ tar -xzf cmdb-agent.tar.gz</div>
                <div>$ sudo ./install.sh</div>
                <div>$ systemctl enable cmdb-agent</div>
                <div>$ systemctl start cmdb-agent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Security Verification</h4>
              <p className="text-sm text-amber-800">
                Always verify the SHA-256 checksum after download. All agents are signed with our
                code-signing certificate. For enterprise deployments, contact your IT administrator
                for internal distribution channels.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <selectedAgent.icon className={`w-6 h-6 ${getColorClasses(selectedAgent.color).text}`} />
                <h2 className="text-2xl font-bold text-gray-900">{selectedAgent.name}</h2>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Full Feature List */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Complete Feature Set
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedAgent.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* System Requirements */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-500" />
                  System Requirements
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div><strong>OS:</strong> {selectedAgent.requirements.os}</div>
                  <div><strong>RAM:</strong> {selectedAgent.requirements.ram}</div>
                  <div><strong>Disk:</strong> {selectedAgent.requirements.disk}</div>
                  <div><strong>CPU:</strong> {selectedAgent.requirements.cpu}</div>
                </div>
              </div>

              {/* Download Action */}
              <a
                href={selectedAgent.downloadUrl}
                download
                onClick={() => setSelectedAgent(null)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold no-underline"
              >
                <Download className="w-5 h-5" />
                Download {selectedAgent.name} v{selectedAgent.version}
              </a>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
