import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Server, Database, Network, HardDrive, Cloud, Shield } from 'lucide-react';

interface CIItem {
  id: string;
  name: string;
  type: 'server' | 'database' | 'network' | 'storage' | 'application' | 'service' | 'container' | 'filesystem';
  dependencies: string[];
}

interface RelationshipGraphProps {
  items: CIItem[];
  selectedItemId?: string;
}

const getNodeColor = (type: string): string => {
  switch (type) {
    case 'server': return '#3b82f6'; // blue
    case 'database': return '#8b5cf6'; // purple
    case 'network': return '#10b981'; // green
    case 'storage': return '#f59e0b'; // amber
    case 'application': return '#ec4899'; // pink
    case 'service': return '#06b6d4'; // cyan
    case 'container': return '#6366f1'; // indigo
    default: return '#6b7280'; // gray
  }
};

const getIcon = (type: string) => {
  const iconProps = { size: 20, className: 'text-white' };
  switch (type) {
    case 'server': return <Server {...iconProps} />;
    case 'database': return <Database {...iconProps} />;
    case 'network': return <Network {...iconProps} />;
    case 'storage': return <HardDrive {...iconProps} />;
    case 'application': return <Cloud {...iconProps} />;
    case 'service': return <Shield {...iconProps} />;
    default: return <Server {...iconProps} />;
  }
};

export default function RelationshipGraph({ items, selectedItemId }: RelationshipGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Create nodes from CI items
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // If a specific item is selected, show only its relationships
    let itemsToShow = items;
    if (selectedItemId) {
      const selectedItem = items.find(i => i.id === selectedItemId);
      if (selectedItem) {
        // Show selected item and its direct dependencies
        const depIds = new Set([selectedItemId, ...selectedItem.dependencies]);
        itemsToShow = items.filter(i => depIds.has(i.id));
      }
    }

    // Create nodes
    itemsToShow.forEach((item, index) => {
      const isSelected = item.id === selectedItemId;
      const color = getNodeColor(item.type);
      
      newNodes.push({
        id: item.id,
        type: 'default',
        position: { 
          x: (index % 5) * 250, 
          y: Math.floor(index / 5) * 150 
        },
        data: { 
          label: (
            <div className="flex items-center gap-2">
              <div style={{ 
                background: color,
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getIcon(item.type)}
              </div>
              <div>
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{item.type}</div>
              </div>
            </div>
          )
        },
        style: {
          background: 'white',
          border: isSelected ? `3px solid ${color}` : `2px solid ${color}`,
          borderRadius: '8px',
          padding: '10px',
          minWidth: '200px',
          boxShadow: isSelected ? '0 8px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
        },
      });
    });

    // Create edges from dependencies
    itemsToShow.forEach(item => {
      item.dependencies.forEach(depId => {
        // Only create edge if both nodes exist
        if (itemsToShow.find(i => i.id === depId)) {
          newEdges.push({
            id: `${item.id}-${depId}`,
            source: item.id,
            target: depId,
            type: 'smoothstep',
            animated: item.id === selectedItemId,
            style: { 
              stroke: getNodeColor(item.type),
              strokeWidth: item.id === selectedItemId ? 3 : 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: getNodeColor(item.type),
            },
            label: 'depends on',
            labelStyle: { 
              fontSize: 10, 
              fontWeight: 500,
              fill: '#6b7280',
            },
            labelBgStyle: {
              fill: 'white',
              fillOpacity: 0.9,
            },
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [items, selectedItemId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
