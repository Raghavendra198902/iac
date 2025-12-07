import React, { useState, useEffect, useRef } from 'react';
import { 
  ServerIcon, 
  CircleStackIcon, 
  CloudIcon, 
  CubeIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface Node {
  id: string;
  type: 'server' | 'database' | 'cloud' | 'container' | 'service';
  label: string;
  status: 'healthy' | 'warning' | 'error';
  x: number;
  y: number;
  connections: string[];
}

const InfrastructureTopology: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTopology();
    const interval = setInterval(fetchTopology, 100);
    return () => clearInterval(interval);
  }, []);

  const fetchTopology = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/topology');
      if (response.ok) {
        const data = await response.json();
        setNodes(data.nodes);
      }
    } catch (error) {
      console.error('Failed to fetch topology:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'server':
        return ServerIcon;
      case 'database':
        return CircleStackIcon;
      case 'cloud':
        return CloudIcon;
      case 'container':
        return CubeIcon;
      default:
        return ServerIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500 border-green-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'error':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Infrastructure Topology
              <span className="ml-3 inline-flex items-center">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="ml-2 text-sm font-medium text-green-600">LIVE</span>
              </span>
            </h1>
            <p className="text-gray-600">Real-time infrastructure network visualization</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Topology Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowPathIcon className="h-12 w-12 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div 
            ref={canvasRef}
            className="absolute inset-0 p-8"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          >
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes.map((node) =>
                node.connections.map((targetId) => {
                  const target = nodes.find((n) => n.id === targetId);
                  if (!target) return null;
                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="#d1d5db"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                })
              )}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const Icon = getNodeIcon(node.type);
              return (
                <div
                  key={node.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                  style={{ left: node.x, top: node.y }}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className={`relative w-20 h-20 rounded-xl shadow-lg border-2 ${getStatusColor(node.status)} backdrop-blur-sm bg-opacity-90 flex items-center justify-center`}>
                    <Icon className="h-10 w-10 text-white" />
                    <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${getStatusDotColor(node.status)} ring-2 ring-white`}></div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-semibold text-gray-900 bg-white px-2 py-1 rounded shadow-sm">
                      {node.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl border-l border-gray-200 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Node Details</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {(() => {
                const Icon = getNodeIcon(selectedNode.type);
                return <Icon className="h-8 w-8 text-blue-600" />;
              })()}
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{selectedNode.label}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold text-gray-900 capitalize">{selectedNode.type}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                selectedNode.status === 'healthy' ? 'bg-green-100 text-green-800' :
                selectedNode.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedNode.status.toUpperCase()}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Connections ({selectedNode.connections.length})</p>
              <div className="space-y-2">
                {selectedNode.connections.map((connId) => {
                  const connNode = nodes.find((n) => n.id === connId);
                  return connNode ? (
                    <div key={connId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-900">{connNode.label}</span>
                      <span className={`w-2 h-2 rounded-full ${getStatusDotColor(connNode.status)}`}></span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Metrics</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">CPU Usage</span>
                  <span className="text-sm font-semibold text-gray-900">{Math.floor(Math.random() * 40 + 30)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Memory</span>
                  <span className="text-sm font-semibold text-gray-900">{Math.floor(Math.random() * 30 + 40)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Network</span>
                  <span className="text-sm font-semibold text-gray-900">{Math.floor(Math.random() * 100)} Mbps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-xs text-gray-700">Healthy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-xs text-gray-700">Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-xs text-gray-700">Error</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureTopology;
