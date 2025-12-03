import React, { useState } from 'react';
import { MainLayout } from '../../components/layout';
import { motion, AnimatePresence } from 'framer-motion';
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
  Activity,
  TrendingUp,
  Copy,
  Check,
  Laptop,
  MonitorDown,
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
  const [platform, setPlatform] = useState<'linux' | 'windows' | 'macos'>('linux');
  const [copied, setCopied] = useState(false);
  const [highContrast, setHighContrast] = useState(true);

  const agents: Agent[] = [
    {
      id: 'system-monitor',
      name: 'System Monitor for Windows',
      platform: 'Windows',
      icon: Monitor,
      version: '1.0.0',
      size: '150 KB',
      architecture: ['x64', 'x86'],
      description: '🆕 NEW! Lightweight system monitoring tool built with NSIS. Real-time system metrics with minimal footprint.',
      features: [
        '✨ Brand new NSIS-based installer',
        '📊 CPU, Memory, Disk monitoring',
        '🔄 60-second refresh cycle',
        '📝 Automatic logging to file',
        '🎯 Professional Modern UI',
        '🔧 Start Menu shortcuts',
        '🗑️ Clean uninstaller',
        '⚡ Ultra-lightweight (150 KB)',
      ],
      requirements: {
        os: 'Windows 10/11, Server 2016+',
        ram: '128 MB minimum',
        disk: '5 MB available space',
        cpu: 'Any modern processor',
      },
      downloadUrl: '/downloads/SystemMonitor-Setup-1.0.0.exe',
      checksum: 'sha256:8aad8014732cf6ed0808b39acaa4fcae239042ca84b68fab4e56cb369442b47f',
      releaseDate: '2025-11-26',
      color: 'blue',
    },
    {
      id: 'windows',
      name: 'CMDB Agent for Windows',
      platform: 'Windows',
      icon: Shield,
      version: '1.0.0',
      size: '161 KB',
      architecture: ['x64'],
      description: 'Enterprise CMDB agent with full inventory and monitoring capabilities.',
      features: [
        'One-click installation with GUI wizard',
        'Automatic service creation and startup',
        'Real-time system monitoring',
        'Hardware and software inventory',
        'Heartbeat to CMDB server every 60 seconds',
        'Windows Task Scheduler integration',
        'Registry-based configuration',
        'Uninstaller included',
      ],
      requirements: {
        os: 'Windows 10/11, Server 2016+',
        ram: '512 MB minimum',
        disk: '10 MB available space',
        cpu: 'Any modern processor',
      },
      downloadUrl: '/downloads/CMDBAgent-Setup-1.0.0.exe',
      checksum: 'sha256:161KB NSIS self-extracting installer',
      releaseDate: '2025-11-25',
      color: 'indigo',
    },
    {
      id: 'linux',
      name: 'CMDB Agent for Linux',
      platform: 'Linux',
      icon: Terminal,
      version: '2.4.1',
      size: '11 KB',
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
      checksum: 'sha256:d523182f3fa83ff1ae776849fb519832760cebb6e4c1a145ddd2b665f151299e',
      releaseDate: '2024-11-20',
      color: 'green',
    },
    {
      id: 'macos',
      name: 'CMDB Agent for macOS',
      platform: 'macOS',
      icon: Monitor,
      version: '2.4.0',
      size: '9.7 KB',
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
      checksum: 'sha256:1f2b9b87294470734c9558f321c881659f283045fa248c762cb7280d95424093',
      releaseDate: '2024-11-18',
      color: 'purple',
    },
    {
      id: 'android',
      name: 'CMDB Agent for Android',
      platform: 'Android',
      icon: Smartphone,
      version: '1.8.2',
      size: '9.8 KB',
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
      checksum: 'sha256:da13aabe97185bef267c4e7d40fcd6c7125fa7e224b44747f68fbaafd15e12d5',
      releaseDate: '2024-11-15',
      color: 'orange',
    },
    {
      id: 'cloud',
      name: 'Cloud Agent (Docker/K8s)',
      platform: 'Container',
      icon: Cloud,
      version: '3.0.1',
      size: '50 KB',
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
      checksum: 'sha256:714245626a7d7f65a87e70ccd91e4b7de7c2a94f70adf03288b2662e4debd539',
      releaseDate: '2024-11-22',
      color: 'cyan',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', hover: 'hover:bg-indigo-100' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', hover: 'hover:bg-green-100' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', hover: 'hover:bg-orange-100' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', hover: 'hover:bg-cyan-100' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <MainLayout>
      <div className={`min-h-screen relative overflow-hidden ${highContrast ? 'bg-white dark:bg-black' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950'}` }>
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 -left-4 w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-0 right-4 w-96 h-96 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-8 text-white shadow-2xl"
          >
          <div className="flex items-center gap-4 mb-4">
            <div className="ml-auto">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={() => setHighContrast(!highContrast)}
                />
                <span className="text-sm">High contrast</span>
              </label>
            </div>
            <motion.div
              className="p-3 bg-white/20 rounded-lg backdrop-blur-sm"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Download className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                CMDB Agent Downloads
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs px-3 py-1 bg-white/25 dark:bg-white/20 rounded-full font-normal flex items-center gap-1.5"
                >
                  <Activity className="w-3 h-3" />
                  Live
                </motion.span>
              </h1>
              <p className="text-blue-100 text-lg">
                Cross-platform agents for comprehensive IT asset discovery and monitoring
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Platforms', value: '6', icon: Server },
              { label: 'Active Deployments', value: '10K+', icon: Shield },
              { label: 'Uptime', value: '99.9%', icon: CheckCircle },
              { label: 'Latest Release', value: 'Today', icon: Package },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`${highContrast ? 'bg-blue-700 text-white border-blue-600 hover:bg-blue-800' : 'bg-white/15 dark:bg-white/10 text-white border-white/25 hover:bg-white/25'} backdrop-blur-sm rounded-lg p-4 border transition-all duration-300`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-sm text-blue-50">{stat.label}</span>
                </div>
                <motion.div
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="text-2xl font-bold text-white"
                >
                  {stat.value}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Platform Tabs & Copy Command */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 p-0 shadow-lg"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <button
              onClick={() => setPlatform('linux')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${platform==='linux' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            >
              <Terminal className="h-4 w-4 inline mr-2" /> Linux
            </button>
            <button
              onClick={() => setPlatform('windows')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${platform==='windows' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            >
              <MonitorDown className="h-4 w-4 inline mr-2" /> Windows
            </button>
            <button
              onClick={() => setPlatform('macos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${platform==='macos' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            >
              <Laptop className="h-4 w-4 inline mr-2" /> macOS
            </button>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Install command</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm overflow-x-auto">
                {platform === 'linux' && 'curl -fsSL https://download.iac.example/agent/install.sh | bash'}
                {platform === 'windows' && 'powershell -Command "iwr https://download.iac.example/agent/install.ps1 -UseBasicParsing | iex"'}
                {platform === 'macos' && 'curl -fsSL https://download.iac.example/agent/install-macos.sh | bash'}
              </code>
              <button
                onClick={() => {
                  const text = platform === 'linux'
                    ? 'curl -fsSL https://download.iac.example/agent/install.sh | bash'
                    : platform === 'windows'
                    ? 'powershell -Command "iwr https://download.iac.example/agent/install.ps1 -UseBasicParsing | iex"'
                    : 'curl -fsSL https://download.iac.example/agent/install-macos.sh | bash';
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const colors = getColorClasses(agent.color);

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * agents.indexOf(agent) }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`${highContrast ? 'bg-white dark:bg-gray-900' : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl'} rounded-xl border-2 ${colors.border} overflow-hidden hover:shadow-2xl transition-all duration-300`}
              >
                {/* Card Header */}
                <div className={`${highContrast ? 'bg-gray-50 dark:bg-gray-800' : `${colors.bg} dark:${colors.bg}/50`} p-6 border-b ${colors.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`p-3 ${highContrast ? 'bg-white dark:bg-gray-900' : 'bg-white dark:bg-gray-900'} rounded-lg border ${colors.border} shadow-sm`}
                      >
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{agent.name}</h3>
                        <p className="text-sm text-gray-800 dark:text-gray-300">{agent.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${colors.text}`}>v{agent.version}</div>
                      <div className="text-xs text-gray-900 dark:text-gray-200">{agent.size}</div>
                    </div>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 text-sm">{agent.description}</p>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Architecture */}
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">Architecture:</span>
                    <div className="flex gap-2">
                      {agent.architecture.map((arch) => (
                        <span
                          key={arch}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs rounded-full"
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
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        <strong>OS:</strong> {agent.requirements.os}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-900 dark:text-gray-100">
                      <div>RAM: {agent.requirements.ram}</div>
                      <div>Disk: {agent.requirements.disk}</div>
                    </div>
                  </div>

                  {/* Features Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Key Features</span>
                    </div>
                    <ul className="space-y-1">
                      {agent.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-900 dark:text-gray-100">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {agent.features.length > 4 && (
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="text-xs text-blue-700 dark:text-blue-400 hover:text-blue-800 font-medium"
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
                    <span className="text-gray-900 dark:text-gray-100">Released: {agent.releaseDate}</span>
                    <button
                      className="flex items-center gap-1 text-gray-900 dark:text-gray-100 hover:text-gray-950 dark:hover:text-white"
                      title={agent.checksum}
                    >
                      <Lock className="w-3 h-3" />
                      Checksum
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Installation Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`${highContrast ? 'bg-white dark:bg-gray-900' : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl'} rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg`}
        >
          <div className="flex items-center gap-3 mb-4">
            <FileCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick Installation Guide
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-900 dark:text-gray-100">Windows Installation</span>
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm text-gray-900 dark:text-gray-100">
                <div>1. Download .msi installer</div>
                <div>2. Run as Administrator</div>
                <div>3. Follow setup wizard</div>
                <div>4. Verify: <code className="bg-white px-2 py-1 rounded">cmdb-agent --version</code></div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-900 dark:text-gray-100">Linux Installation</span>
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm text-gray-900 dark:text-gray-100">
                <div>tar -xzf cmdb-agent.tar.gz</div>
                <div>sudo ./install.sh</div>
                <div>systemctl enable cmdb-agent</div>
                <div>systemctl start cmdb-agent</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={
            highContrast 
              ? 'bg-amber-100 dark:bg-amber-900 backdrop-blur-xl border-l-4 border-amber-400 dark:border-amber-600 rounded-lg p-4 shadow-lg'
              : 'bg-amber-50 dark:bg-amber-900/30 backdrop-blur-xl border-l-4 border-amber-400 dark:border-amber-600 rounded-lg p-4 shadow-lg'
          }
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-800 dark:text-amber-300 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Security Verification</h4>
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Always verify the SHA-256 checksum after download. All agents are signed with our
                code-signing certificate. For enterprise deployments, contact your IT administrator
                for internal distribution channels.
              </p>
            </div>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <selectedAgent.icon className={`w-6 h-6 ${getColorClasses(selectedAgent.color).text}`} />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedAgent.name}</h2>
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
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Complete Feature Set
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedAgent.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* System Requirements */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-500" />
                    System Requirements
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
