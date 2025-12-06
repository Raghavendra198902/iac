import { CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { AIAgent } from '../../types/ai.types';

interface AgentStatusIndicatorProps {
  agents: AIAgent[];
}

export function AgentStatusIndicator({ agents }: AgentStatusIndicatorProps) {
  const getStatusIcon = (status: AIAgent['status']) => {
    switch (status) {
      case 'idle':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'processing':
        return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: AIAgent['status']) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-100 text-gray-600';
      case 'processing':
        return 'bg-blue-100 text-blue-600';
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'failed':
        return 'bg-red-100 text-red-600';
    }
  };

  if (agents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No active agents</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <div key={agent.id} className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(agent.status)}
              <span className="font-medium">{agent.name}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(agent.status)}`}>
              {agent.status}
            </span>
          </div>

          {agent.message && (
            <p className="text-sm text-gray-600 mb-2">{agent.message}</p>
          )}

          {agent.status === 'processing' && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{agent.progress}%</span>
                {agent.duration && <span>{agent.duration}s elapsed</span>}
              </div>
            </>
          )}

          {agent.status === 'completed' && agent.duration && (
            <p className="text-xs text-gray-500">Completed in {agent.duration}s</p>
          )}
        </div>
      ))}
    </div>
  );
}
