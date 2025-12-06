import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Hash,
  Calendar,
  HardDrive,
  Loader,
  X
} from 'lucide-react';

interface UploadedAgent {
  id: string;
  filename: string;
  platform: string;
  version: string;
  size: number;
  checksum: string;
  uploadDate: Date;
  status: 'pending' | 'verified' | 'published' | 'error';
}

const UploadAgent: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedAgents, setUploadedAgents] = useState<UploadedAgent[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Platform detection from filename
  const detectPlatform = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes('windows') || lower.endsWith('.msi') || lower.endsWith('.exe')) {
      return 'Windows';
    } else if (lower.includes('linux') || lower.endsWith('.deb') || lower.endsWith('.rpm')) {
      return 'Linux';
    } else if (lower.includes('darwin') || lower.includes('macos') || lower.endsWith('.pkg')) {
      return 'macOS';
    } else if (lower.includes('android') || lower.endsWith('.apk')) {
      return 'Android';
    }
    return 'Unknown';
  };

  // Extract version from filename
  const extractVersion = (filename: string): string => {
    const versionMatch = filename.match(/(\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : '1.0.0';
  };

  // Calculate SHA256 checksum
  const calculateChecksum = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process file
  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setUploadError(null);

    // Validate file type
    const validExtensions = ['.msi', '.exe', '.zip', '.deb', '.rpm', '.pkg', '.tar.gz', '.apk'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
      setUploadError('Invalid file type. Please upload MSI, EXE, ZIP, DEB, RPM, PKG, or APK files.');
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 500MB.');
      return;
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Calculate checksum
      setUploadProgress(20);
      const checksum = await calculateChecksum(selectedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('platform', detectPlatform(selectedFile.name));
      formData.append('version', extractVersion(selectedFile.name));
      formData.append('checksum', checksum);

      // Upload to server (mock for now)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear interval
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add to uploaded list
      const newAgent: UploadedAgent = {
        id: Math.random().toString(36).substr(2, 9),
        filename: selectedFile.name,
        platform: detectPlatform(selectedFile.name),
        version: extractVersion(selectedFile.name),
        size: selectedFile.size,
        checksum: checksum,
        uploadDate: new Date(),
        status: 'verified'
      };

      setUploadedAgents(prev => [newAgent, ...prev]);
      setSelectedFile(null);
      setUploading(false);
      setUploadProgress(0);

    } catch (error) {
      setUploadError('Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Package className="w-12 h-12 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Upload Agent
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Upload MSI, EXE, DEB, RPM, PKG, or APK agent packages for distribution
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <div
            className={`border-3 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`w-16 h-16 mx-auto mb-4 ${
              dragActive ? 'text-blue-500' : 'text-slate-400'
            }`} />
            
            {!selectedFile ? (
              <>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                  Drop agent package here
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  or click to browse files
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".msi,.exe,.zip,.deb,.rpm,.pkg,.tar.gz,.apk"
                  onChange={handleFileInput}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Select File
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                  Supported formats: MSI, EXE, ZIP, DEB, RPM, PKG, TAR.GZ, APK (Max 500MB)
                </p>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="text-left">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatSize(selectedFile.size)} • {detectPlatform(selectedFile.name)}
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-4 p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  )}
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                {!uploading && (
                  <button
                    onClick={handleUpload}
                    className="inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Agent
                  </button>
                )}
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300">{uploadError}</p>
            </div>
          )}
        </motion.div>

        {/* Uploaded Agents List */}
        {uploadedAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Uploaded Agents
            </h2>
            
            <div className="space-y-4">
              {uploadedAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {agent.filename}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          agent.status === 'verified'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : agent.status === 'published'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : agent.status === 'error'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {agent.status === 'verified' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Package className="w-4 h-4 mr-2" />
                          <span>{agent.platform}</span>
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <FileText className="w-4 h-4 mr-2" />
                          <span>v{agent.version}</span>
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <HardDrive className="w-4 h-4 mr-2" />
                          <span>{formatSize(agent.size)}</span>
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(agent.uploadDate)}</span>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center text-xs font-mono text-slate-600 dark:text-slate-400">
                          <Hash className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{agent.checksum}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                        Publish
                      </button>
                      <button className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm rounded-lg transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800"
        >
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-300 mb-4">
            Upload Guidelines
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-300">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Upload MSI files for Windows installers</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Use DEB/RPM packages for Linux distributions</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>PKG files for macOS installations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Include version number in filename (e.g., cmdb-agent-1.0.0.msi)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>SHA256 checksum will be automatically calculated</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Maximum file size: 500MB per package</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadAgent;
