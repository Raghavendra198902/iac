import { useState } from 'react';

export default function CMDBRelationships() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterRelationType, setFilterRelationType] = useState('all');

  // Sample relationship data
  const nodes = [
    { id: 'api-gateway', name: 'API Gateway', type: 'Application', status: 'active' },
    { id: 'postgres', name: 'PostgreSQL', type: 'Database', status: 'active' },
    { id: 'redis', name: 'Redis Cache', type: 'Cache', status: 'active' },
    { id: 'kafka', name: 'Kafka', type: 'Message Broker', status: 'active' },
    { id: 'zero-trust', name: 'Zero Trust', type: 'Security', status: 'active' },
    { id: 'ai-orchestrator', name: 'AI Orchestrator', type: 'ML Service', status: 'active' },
    { id: 'mlflow', name: 'MLflow', type: 'ML Platform', status: 'active' },
    { id: 'minio', name: 'MinIO', type: 'Storage', status: 'active' },
  ];

  const relationships = [
    { from: 'api-gateway', to: 'postgres', type: 'uses', description: 'Primary data store' },
    { from: 'api-gateway', to: 'redis', type: 'uses', description: 'Session cache' },
    { from: 'api-gateway', to: 'kafka', type: 'publishes', description: 'Event streaming' },
    { from: 'zero-trust', to: 'postgres', type: 'uses', description: 'Policy storage' },
    { from: 'zero-trust', to: 'redis', type: 'uses', description: 'Token cache' },
    { from: 'ai-orchestrator', to: 'postgres', type: 'uses', description: 'Metadata storage' },
    { from: 'ai-orchestrator', to: 'kafka', type: 'consumes', description: 'Job queue' },
    { from: 'ai-orchestrator', to: 'mlflow', type: 'depends-on', description: 'Model tracking' },
    { from: 'mlflow', to: 'postgres', type: 'uses', description: 'Experiment storage' },
    { from: 'mlflow', to: 'minio', type: 'uses', description: 'Artifact storage' },
    { from: 'api-gateway', to: 'zero-trust', type: 'protected-by', description: 'Security layer' },
    { from: 'api-gateway', to: 'ai-orchestrator', type: 'integrates-with', description: 'ML endpoints' },
  ];

  const relationTypes = ['all', 'uses', 'depends-on', 'publishes', 'consumes', 'protected-by', 'integrates-with'];

  const filteredRelationships = filterRelationType === 'all' 
    ? relationships 
    : relationships.filter(r => r.type === filterRelationType);

  const getNodesByRelation = (nodeId: string) => {
    const outgoing = relationships.filter(r => r.from === nodeId);
    const incoming = relationships.filter(r => r.to === nodeId);
    return { outgoing, incoming };
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Application': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Database': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Cache': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Message Broker': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Security': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ML Service': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'ML Platform': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Storage': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRelationTypeColor = (type: string) => {
    switch (type) {
      case 'uses': return 'text-blue-400';
      case 'depends-on': return 'text-purple-400';
      case 'publishes': return 'text-green-400';
      case 'consumes': return 'text-yellow-400';
      case 'protected-by': return 'text-red-400';
      case 'integrates-with': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;
  const selectedNodeRelations = selectedNode ? getNodesByRelation(selectedNode) : null;

  const stats = [
    { label: 'Total Nodes', value: nodes.length, icon: '🔷' },
    { label: 'Relationships', value: relationships.length, icon: '🔗' },
    { label: 'Dependency Types', value: relationTypes.length - 1, icon: '📊' },
    { label: 'Active Services', value: nodes.filter(n => n.status === 'active').length, icon: '✅' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 p-6">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-sm">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
            </div>
            CMDB Relationships
          </h1>
          <p className="text-gray-400">Visualize dependencies and connections between configuration items</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-8">
          <label className="block text-sm text-gray-400 mb-2">Filter by Relationship Type</label>
          <select
            value={filterRelationType}
            onChange={(e) => setFilterRelationType(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            {relationTypes.map(type => (
              <option key={type} value={type} className="bg-gray-800">
                {type === 'all' ? 'All Relationships' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Nodes Panel */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Configuration Items</h2>
            <div className="space-y-3">
              {nodes.map((node) => {
                const { outgoing, incoming } = getNodesByRelation(node.id);
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedNode === node.id
                        ? 'bg-indigo-500/20 border-indigo-500'
                        : 'bg-white/5 border-white/10 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white">{node.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(node.type)}`}>
                        {node.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {outgoing.length} outgoing
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                        {incoming.length} incoming
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Panel */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            {selectedNodeData && selectedNodeRelations ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedNodeData.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm border ${getTypeColor(selectedNodeData.type)}`}>
                    {selectedNodeData.type}
                  </span>
                </div>

                {/* Outgoing Relationships */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Outgoing Dependencies ({selectedNodeRelations.outgoing.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedNodeRelations.outgoing.map((rel, idx) => {
                      const targetNode = nodes.find(n => n.id === rel.to);
                      return (
                        <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-white">{targetNode?.name}</p>
                              <p className="text-sm text-gray-400">{rel.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${getRelationTypeColor(rel.type)}`}>
                              {rel.type}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {selectedNodeRelations.outgoing.length === 0 && (
                      <p className="text-gray-400 text-sm">No outgoing dependencies</p>
                    )}
                  </div>
                </div>

                {/* Incoming Relationships */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Incoming Dependencies ({selectedNodeRelations.incoming.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedNodeRelations.incoming.map((rel, idx) => {
                      const sourceNode = nodes.find(n => n.id === rel.from);
                      return (
                        <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-white">{sourceNode?.name}</p>
                              <p className="text-sm text-gray-400">{rel.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${getRelationTypeColor(rel.type)}`}>
                              {rel.type}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {selectedNodeRelations.incoming.length === 0 && (
                      <p className="text-gray-400 text-sm">No incoming dependencies</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Select a configuration item to view its relationships</p>
              </div>
            )}
          </div>
        </div>

        {/* All Relationships Table */}
        <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">All Relationships</h2>
          <div className="space-y-2">
            {filteredRelationships.map((rel, idx) => {
              const fromNode = nodes.find(n => n.id === rel.from);
              const toNode = nodes.find(n => n.id === rel.to);
              return (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-indigo-500/50 transition-all">
                  <div className="flex-1">
                    <span className="font-semibold text-white">{fromNode?.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ml-2 border ${getTypeColor(fromNode?.type || '')}`}>
                      {fromNode?.type}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`px-3 py-1 rounded-full text-xs ${getRelationTypeColor(rel.type)}`}>
                      {rel.type}
                    </span>
                    <svg className="w-6 h-6 text-gray-400 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <div className="flex-1 text-right">
                    <span className="font-semibold text-white">{toNode?.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ml-2 border ${getTypeColor(toNode?.type || '')}`}>
                      {toNode?.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
