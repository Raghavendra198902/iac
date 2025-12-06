import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { ComplianceResult } from '../../types/ai.types';

interface ComplianceMeterProps {
  results: ComplianceResult[];
}

export function ComplianceMeter({ results }: ComplianceMeterProps) {
  const overallScore =
    results.length > 0 
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length 
      : 0;

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="w-5 h-5" />;
    if (score >= 80) return <AlertTriangle className="w-5 h-5" />;
    return <XCircle className="w-5 h-5" />;
  };

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Compliance Score</h3>
        </div>
        <p className="text-sm text-gray-500">No compliance data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Compliance Score</h3>
      </div>

      {/* Overall score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall</span>
          <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              overallScore >= 95
                ? 'bg-green-600'
                : overallScore >= 80
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
      </div>

      {/* Framework scores */}
      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.framework} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`p-1 rounded ${getScoreColor(result.score)}`}>
                {getScoreIcon(result.score)}
              </span>
              <span className="text-sm font-medium">{result.framework}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {result.gaps.length} gaps
              </span>
              <span className={`text-sm font-semibold ${getScoreColor(result.score)}`}>
                {result.score.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
