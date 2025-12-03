import { Download, Eye, FileText, Code, Shield, Calendar, FileCode } from 'lucide-react';
import { Artifact } from '../../types/ai.types';

interface ArtifactCardProps {
  artifact: Artifact;
  onView?: () => void;
  onDownload?: () => void;
}

export function ArtifactCard({ artifact, onView, onDownload }: ArtifactCardProps) {
  const getIcon = (type: Artifact['type']) => {
    switch (type) {
      case 'ea':
        return <FileText className="w-6 h-6" />;
      case 'sa':
        return <FileCode className="w-6 h-6" />;
      case 'ta':
        return <Code className="w-6 h-6" />;
      case 'pm':
        return <Calendar className="w-6 h-6" />;
      case 'se':
        return <Shield className="w-6 h-6" />;
      case 'compliance':
        return <Shield className="w-6 h-6" />;
    }
  };

  const getTypeLabel = (type: Artifact['type']) => {
    switch (type) {
      case 'ea':
        return 'Enterprise Architecture';
      case 'sa':
        return 'Solution Architecture';
      case 'ta':
        return 'Technical Architecture';
      case 'pm':
        return 'Project Management';
      case 'se':
        return 'Security Engineering';
      case 'compliance':
        return 'Compliance Report';
    }
  };

  const getTypeColor = (type: Artifact['type']) => {
    switch (type) {
      case 'ea':
        return 'bg-blue-100 text-blue-600';
      case 'sa':
        return 'bg-purple-100 text-purple-600';
      case 'ta':
        return 'bg-green-100 text-green-600';
      case 'pm':
        return 'bg-orange-100 text-orange-600';
      case 'se':
        return 'bg-red-100 text-red-600';
      case 'compliance':
        return 'bg-indigo-100 text-indigo-600';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${getTypeColor(artifact.type)}`}>
          {getIcon(artifact.type)}
        </div>
        <span className="text-xs text-gray-500">{artifact.format.toUpperCase()}</span>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{artifact.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{getTypeLabel(artifact.type)}</p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{formatSize(artifact.size)}</span>
        <span>{new Date(artifact.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 text-sm"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={onDownload}
          className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}
