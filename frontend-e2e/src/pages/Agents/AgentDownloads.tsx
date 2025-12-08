import React, { useState } from 'react';
import {
  ArrowDownTrayIcon,
  ServerIcon,
  CommandLineIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
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
}

const AgentDownloads: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const agents: AgentPackage[] = [
    {
      id: 'windows',
      name: 'Windows Agent',
      platform: 'Windows',
      version: '1.0.0',
      size: '8.5 MB',
      description: 'Native Windows agent with WMI integration, Registry monitoring, and Windows Service installation',
      downloadUrl: '/downloads/cmdb-agent-windows-amd64.exe',
      checksum: 'SHA256: abc123...',
      icon: <ServerIcon className="h-8 w-8 text-blue-500" />,
    },
    {
      id: 'windows-cli',
      name: 'Windows CLI Tool',
      platform: 'Windows',
      version: '1.0.0',
      size: '5.9 MB',
      description: 'Command-line management tool for Windows agent',
      downloadUrl: '/downloads/cmdb-agent-cli-windows-amd64.exe',
      checksum: 'SHA256: def456...',
      icon: <CommandLineIcon className="h-8 w-8 text-purple-500" />,
    },
    {
      id: 'windows-package',
      name: 'Windows Complete Package',
      platform: 'Windows',
      version: '1.0.0',
      size: '6.0 MB',
      description: 'Complete distribution package with agent, CLI, installation scripts, and documentation',
      downloadUrl: '/downloads/cmdb-agent-windows-1.0.0.zip',
      checksum: 'SHA256: ghi789...',
      icon: <DocumentTextIcon className="h-8 w-8 text-green-500" />,
    },
    {
      id: 'linux',
      name: 'Linux Agent',
      platform: 'Linux',
      version: '1.0.0',
      size: '7.2 MB',
      description: 'Native Linux agent with systemd integration and comprehensive hardware monitoring',
      downloadUrl: '/downloads/cmdb-agent-linux-amd64',
      checksum: 'SHA256: jkl012...',
      icon: <ServerIcon className="h-8 w-8 text-orange-500" />,
    },
    {
      id: 'macos',
      name: 'macOS Agent',
      platform: 'macOS',
      version: '1.0.0',
      size: '6.8 MB',
      description: 'Native macOS agent with launchd integration',
      downloadUrl: '/downloads/cmdb-agent-darwin-amd64',
      checksum: 'SHA256: mno345...',
      icon: <ServerIcon className="h-8 w-8 text-gray-500" />,
    },
  ];

  const filteredAgents = selectedPlatform === 'all' 
    ? agents 
    : agents.filter(agent => agent.platform.toLowerCase() === selectedPlatform.toLowerCase());

  const platforms = ['all', 'Windows', 'Linux', 'macOS'];

  const handleDownload = (agent: AgentPackage) => {
    console.log(`Downloading ${agent.name}...`);
    // In production, this would trigger actual download
    window.open(agent.downloadUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <ArrowDownTrayIcon className="h-8 w-8 text-blue-400" />
                Agent Downloads
              </h1>
              <p className="mt-2 text-gray-300">
                Download CMDB agents for your infrastructure monitoring needs
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPlatform === platform
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-xl'
                }`}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all"
            >
              {/* Icon and Platform */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-shrink-0">
                  {agent.icon}
                </div>
                <span className="text-xs font-medium text-gray-400">
                  v{agent.version}
                </span>
              </div>

              {/* Name and Platform */}
              <h3 className="text-xl font-semibold text-white mb-1">
                {agent.name}
              </h3>
              <p className="text-sm text-blue-400 mb-3">{agent.platform}</p>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-4 min-h-[60px]">
                {agent.description}
              </p>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white font-medium">{agent.size}</span>
                </div>
                <div className="flex items-start justify-between text-xs">
                  <span className="text-gray-400">Checksum:</span>
                  <span className="text-gray-500 font-mono text-right break-all ml-2">
                    {agent.checksum}
                  </span>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(agent)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download
              </button>
            </div>
          ))}
        </div>

        {/* Installation Instructions */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
