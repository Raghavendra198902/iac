import React, { useState } from 'react';
import { 
  CpuChipIcon, 
  ChartBarIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface Model {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'active' | 'training' | 'inactive' | 'deployed';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: string;
  lastTrained: string;
  predictions: number;
  avgLatency: string;
  framework: string;
}

interface TrainingRun {
  id: string;
  modelName: string;
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  startTime: string;
  duration: string;
  accuracy: number;
  loss: number;
  epochs: number;
}

const AIModels: React.FC = () => {
  const [models] = useState<Model[]>([
    {
      id: '1',
      name: 'Cost Forecasting LSTM',
      type: 'Time Series',
      version: 'v2.3.1',
      status: 'active',
      accuracy: 94.5,
      precision: 93.2,
      recall: 95.1,
      f1Score: 94.1,
      trainingData: '180 days history',
      lastTrained: '2 days ago',
      predictions: 45203,
      avgLatency: '12ms',
      framework: 'TensorFlow'
    },
    {
      id: '2',
      name: 'Anomaly Detection (Isolation Forest)',
      type: 'Unsupervised',
      version: 'v1.8.4',
      status: 'active',
      accuracy: 97.2,
      precision: 96.8,
      recall: 97.5,
      f1Score: 97.1,
      trainingData: '90 days metrics',
      lastTrained: '5 hours ago',
      predictions: 128456,
      avgLatency: '8ms',
      framework: 'Scikit-learn'
    },
    {
      id: '3',
      name: 'Resource Right-Sizing',
      type: 'Classification',
      version: 'v3.1.0',
      status: 'deployed',
      accuracy: 91.8,
      precision: 90.3,
      recall: 92.7,
      f1Score: 91.5,
      trainingData: '1.2M samples',
      lastTrained: '1 day ago',
      predictions: 67832,
      avgLatency: '15ms',
      framework: 'PyTorch'
    },
    {
      id: '4',
      name: 'Security Threat Classifier',
      type: 'Deep Learning',
      version: 'v2.0.5',
      status: 'active',
      accuracy: 98.3,
      precision: 98.1,
      recall: 98.6,
      f1Score: 98.3,
      trainingData: '500K incidents',
      lastTrained: '12 hours ago',
      predictions: 92145,
      avgLatency: '10ms',
      framework: 'TensorFlow'
    },
    {
      id: '5',
      name: 'Performance Predictor',
      type: 'Regression',
      version: 'v1.5.2',
      status: 'training',
      accuracy: 89.3,
      precision: 88.7,
      recall: 90.1,
      f1Score: 89.4,
      trainingData: '60 days telemetry',
      lastTrained: 'Training now',
      predictions: 34567,
      avgLatency: '18ms',
      framework: 'XGBoost'
    },
    {
      id: '6',
      name: 'NLP Architecture Generator',
      type: 'Transformer',
      version: 'v0.9.8',
      status: 'inactive',
      accuracy: 86.7,
      precision: 85.2,
      recall: 87.9,
      f1Score: 86.5,
      trainingData: '50K blueprints',
      lastTrained: '7 days ago',
      predictions: 12389,
      avgLatency: '250ms',
      framework: 'Hugging Face'
    }
  ]);

  const [trainingRuns] = useState<TrainingRun[]>([
    {
      id: '1',
      modelName: 'Cost Forecasting LSTM',
      status: 'completed',
      startTime: '2 days ago',
      duration: '45m 23s',
      accuracy: 94.5,
      loss: 0.087,
      epochs: 150
    },
    {
      id: '2',
      modelName: 'Performance Predictor',
      status: 'running',
      startTime: '15 minutes ago',
      duration: '15m 42s',
      accuracy: 89.3,
      loss: 0.124,
      epochs: 67
    },
    {
      id: '3',
      modelName: 'Anomaly Detection',
      status: 'completed',
      startTime: '5 hours ago',
      duration: '23m 18s',
      accuracy: 97.2,
      loss: 0.045,
      epochs: 100
    },
    {
      id: '4',
      modelName: 'NLP Architecture Generator',
      status: 'scheduled',
      startTime: 'In 2 hours',
      duration: 'Est. 2h 15m',
      accuracy: 0,
      loss: 0,
      epochs: 200
    },
    {
      id: '5',
      modelName: 'Resource Right-Sizing',
      status: 'completed',
      startTime: '1 day ago',
      duration: '1h 12m',
      accuracy: 91.8,
      loss: 0.112,
      epochs: 180
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'deployed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'training':
      case 'running':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'deployed':
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'training':
      case 'running':
        return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CpuChipIcon className="w-8 h-8 text-blue-400" />
            ML Models
          </h1>
          <p className="text-gray-400 mt-1">
            Machine learning models and training pipelines
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2">
          <BeakerIcon className="w-5 h-5" />
          Train New Model
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Models</span>
            <CpuChipIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">6</div>
          <div className="text-sm text-gray-400 mt-1">4 active</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Accuracy</span>
            <ChartBarIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">92.1%</div>
          <div className="text-sm text-green-400 mt-1">↑ 3.2%</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Predictions</span>
            <ArrowTrendingUpIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">380K</div>
          <div className="text-sm text-gray-400 mt-1">This month</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Avg Latency</span>
            <ClockIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">53ms</div>
          <div className="text-sm text-green-400 mt-1">↓ 12ms</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Training</span>
            <ArrowPathIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">1</div>
          <div className="text-sm text-yellow-400 mt-1">In progress</div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Deployed Models</h2>
        <div className="space-y-4">
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(model.status)}`}>
                      {getStatusIcon(model.status)}
                      {model.status}
                    </span>
                    <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400">
                      {model.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      Type: <span className="text-white">{model.type}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      Framework: <span className="text-white">{model.framework}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      Last trained: <span className="text-white">{model.lastTrained}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block mb-1">Accuracy</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-green-400">{model.accuracy}%</span>
                  </div>
                  <div className="mt-2 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                      style={{ width: `${model.accuracy}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block mb-1">Precision</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-400">{model.precision}%</span>
                  </div>
                  <div className="mt-2 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full"
                      style={{ width: `${model.precision}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block mb-1">Recall</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-purple-400">{model.recall}%</span>
                  </div>
                  <div className="mt-2 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                      style={{ width: `${model.recall}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block mb-1">F1 Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-yellow-400">{model.f1Score}%</span>
                  </div>
                  <div className="mt-2 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full"
                      style={{ width: `${model.f1Score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <span className="text-gray-400">
                    Training Data: <span className="text-white">{model.trainingData}</span>
                  </span>
                  <span className="text-gray-400">
                    Predictions: <span className="text-white">{model.predictions.toLocaleString()}</span>
                  </span>
                  <span className="text-gray-400">
                    Avg Latency: <span className="text-white">{model.avgLatency}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm">
                    Retrain
                  </button>
                  <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Training Runs */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ArrowPathIcon className="w-6 h-6 text-yellow-400" />
          Recent Training Runs
        </h2>
        <div className="space-y-3">
          {trainingRuns.map((run) => (
            <div
              key={run.id}
              className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-semibold">{run.modelName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(run.status)}`}>
                    {getStatusIcon(run.status)}
                    {run.status}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  Started: {run.startTime}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-gray-400 block">Duration</span>
                  <span className="text-sm text-white font-semibold">{run.duration}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Epochs</span>
                  <span className="text-sm text-white font-semibold">{run.epochs}</span>
                </div>
                {run.status !== 'scheduled' && (
                  <>
                    <div>
                      <span className="text-xs text-gray-400 block">Accuracy</span>
                      <span className="text-sm text-green-400 font-semibold">{run.accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Loss</span>
                      <span className="text-sm text-red-400 font-semibold">{run.loss}</span>
                    </div>
                  </>
                )}
              </div>

              {run.status === 'running' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Training Progress</span>
                    <span>{Math.round((run.epochs / 100) * 100)}%</span>
                  </div>
                  <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full transition-all animate-pulse"
                      style={{ width: `${(run.epochs / 100) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIModels;
