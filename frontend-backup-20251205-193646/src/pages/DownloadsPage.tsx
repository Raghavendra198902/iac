import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Package {
  id: string;
  version: string;
  platform: string;
  architecture: string;
  releaseDate: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  checksum: string;
  mandatory: boolean;
  active: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const DownloadsPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/updates/list`);
      setPackages(response.data.updates || []);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesPlatform = selectedPlatform === 'all' || pkg.platform === selectedPlatform;
    const matchesSearch = pkg.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.version.includes(searchTerm);
    return matchesPlatform && matchesSearch && pkg.active;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getPlatformIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      windows: '🪟',
      linux: '🐧',
      macos: '🍎',
      android: '🤖',
      ios: '📱',
    };
    return icons[platform] || '📦';
  };

  const getPlatformColor = (platform: string): string => {
    const colors: Record<string, string> = {
      windows: 'bg-blue-100 text-blue-800',
      linux: 'bg-yellow-100 text-yellow-800',
      macos: 'bg-gray-100 text-gray-800',
      android: 'bg-green-100 text-green-800',
      ios: 'bg-purple-100 text-purple-800',
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  const getFileExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toUpperCase() || '';
    return ext;
  };

  const latestVersion = packages.reduce((latest, pkg) => {
    return pkg.version > latest ? pkg.version : latest;
  }, '0.0.0');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Download CMDB Agent</h1>
            <p className="text-xl text-blue-100 mb-6">
              Infrastructure monitoring and management for all platforms
            </p>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm font-medium">Latest Version:</span>
              <span className="ml-2 text-2xl font-bold">{latestVersion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-3xl mb-3">🪟</div>
            <h3 className="text-lg font-semibold mb-2">Windows</h3>
            <p className="text-gray-600 text-sm mb-4">MSI installer for Windows 7-11 and Server</p>
            <a
              href="#windows"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Download →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="text-3xl mb-3">🐧</div>
            <h3 className="text-lg font-semibold mb-2">Linux</h3>
            <p className="text-gray-600 text-sm mb-4">DEB/RPM packages for all distributions</p>
            <a
              href="#linux"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Download →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
            <div className="text-3xl mb-3">🍎</div>
            <h3 className="text-lg font-semibold mb-2">macOS</h3>
            <p className="text-gray-600 text-sm mb-4">PKG installer for macOS 10.13+</p>
            <a
              href="#macos"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Download →
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Platforms</option>
                <option value="windows">Windows</option>
                <option value="linux">Linux</option>
                <option value="macos">macOS</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by version or filename..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Downloads List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No packages found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                id={pkg.platform}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getPlatformIcon(pkg.platform)}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {pkg.fileName}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPlatformColor(pkg.platform)}`}>
                              {pkg.platform.charAt(0).toUpperCase() + pkg.platform.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">v{pkg.version}</span>
                            <span className="text-sm text-gray-500">{pkg.architecture}</span>
                            <span className="text-sm text-gray-500">{getFileExtension(pkg.fileName)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Size:</span>
                          <span className="ml-2 font-medium">{formatFileSize(pkg.fileSize)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Released:</span>
                          <span className="ml-2 font-medium">
                            {new Date(pkg.releaseDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-500">SHA-256:</span>
                          <code className="ml-2 text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {pkg.checksum.substring(0, 16)}...
                          </code>
                        </div>
                      </div>

                      {pkg.mandatory && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ⚠️ Mandatory Update
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <a
                        href={`${API_URL}${pkg.downloadUrl}`}
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        download
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(pkg.checksum)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Copy Checksum
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Installation Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Installation Instructions</h2>
          
          <div className="space-y-6">
            {/* Windows */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                🪟 Windows
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
{`# Interactive installation
msiexec /i CMDBAgent-1.0.0-x64.msi

# Silent installation with configuration
msiexec /i CMDBAgent-1.0.0-x64.msi /qn ^
  CMDB_SERVER_URL="https://your-server.com" ^
  CMDB_API_KEY="your-api-key"`}
                </pre>
              </div>
            </div>

            {/* Linux DEB */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                🐧 Linux (Debian/Ubuntu)
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
{`# Install package
sudo dpkg -i cmdb-agent_1.0.0_amd64.deb

# Configure
sudo nano /etc/cmdb-agent/environment

# Start service
sudo systemctl start cmdb-agent`}
                </pre>
              </div>
            </div>

            {/* Linux RPM */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                🐧 Linux (RHEL/CentOS/Fedora)
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
{`# Install package
sudo rpm -ivh cmdb-agent-1.0.0-1.x86_64.rpm

# Configure
sudo nano /etc/cmdb-agent/environment

# Start service
sudo systemctl start cmdb-agent`}
                </pre>
              </div>
            </div>

            {/* macOS */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                🍎 macOS
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
{`# Install package
sudo installer -pkg CMDBAgent-1.0.0.pkg -target /

# Configure
sudo nano /etc/cmdb-agent/config.json

# The service starts automatically`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 System Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>Windows:</strong> Windows 7/8/10/11, Server 2012+
            </div>
            <div>
              <strong>macOS:</strong> macOS 10.13 (High Sierra) or later
            </div>
            <div>
              <strong>Linux:</strong> Ubuntu 18.04+, RHEL/CentOS 7+, Fedora 30+
            </div>
            <div>
              <strong>Resources:</strong> 128 MB RAM, 100 MB disk space
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadsPage;
