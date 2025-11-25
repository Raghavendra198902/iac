import { useState } from 'react';
import { Download, Network, Database, Shield, Layers, GitBranch, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import mermaid from 'mermaid';

interface DiagramGeneratorProps {
  document: any;
  documentType: 'LLD' | 'SA';
  onClose: () => void;
}

type DiagramType = 'architecture' | 'dataflow' | 'deployment' | 'security' | 'sequence';

export default function DiagramGenerator({ document, documentType, onClose }: DiagramGeneratorProps) {
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType>('architecture');
  const [mermaidCode, setMermaidCode] = useState('');
  const [diagramSvg, setDiagramSvg] = useState('');

  // Initialize mermaid
  useState(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    });
  });

  const generateMermaidCode = (type: DiagramType): string => {
    switch (type) {
      case 'architecture':
        return generateArchitectureDiagram();
      case 'dataflow':
        return generateDataFlowDiagram();
      case 'deployment':
        return generateDeploymentDiagram();
      case 'security':
        return generateSecurityDiagram();
      case 'sequence':
        return generateSequenceDiagram();
      default:
        return '';
    }
  };

  const generateArchitectureDiagram = (): string => {
    if (documentType === 'SA' && document.microservices) {
      let diagram = 'graph TB\n';
      diagram += '  Client[Client Applications]\n';
      diagram += '  Gateway[API Gateway]\n';
      diagram += '  Client --> Gateway\n\n';

      // Add microservices
      document.microservices.forEach((service: any, index: number) => {
        const nodeId = `MS${index}`;
        diagram += `  ${nodeId}["${service.name}"]\n`;
        diagram += `  Gateway --> ${nodeId}\n`;
      });

      // Add database
      diagram += '\n  DB[(Database)]\n';
      document.microservices.forEach((service: any, index: number) => {
        if (service.type === 'stateful') {
          diagram += `  MS${index} --> DB\n`;
        }
      });

      // Add external systems
      if (document.externalSystems?.length > 0) {
        diagram += '\n  subgraph External Systems\n';
        document.externalSystems.forEach((sys: any, index: number) => {
          diagram += `    EXT${index}["${sys.name}"]\n`;
        });
        diagram += '  end\n';
        diagram += '  Gateway -.-> EXT0\n';
      }

      return diagram;
    }

    if (documentType === 'LLD' && document.components) {
      let diagram = 'graph TB\n';
      diagram += '  Client[Client]\n';
      
      document.components.forEach((comp: any, index: number) => {
        const nodeId = `C${index}`;
        diagram += `  ${nodeId}["${comp.name}<br/>${comp.technology}"]\n`;
        
        if (index === 0) {
          diagram += `  Client --> ${nodeId}\n`;
        } else {
          diagram += `  C${index - 1} --> ${nodeId}\n`;
        }
      });

      diagram += '  DB[(Database)]\n';
      diagram += `  C${document.components.length - 1} --> DB\n`;

      return diagram;
    }

    return 'graph TB\n  A[System] --> B[Component]\n  B --> C[Database]';
  };

  const generateDataFlowDiagram = (): string => {
    let diagram = 'graph LR\n';
    
    if (documentType === 'SA') {
      diagram += '  Agent[Agent/Client]\n';
      diagram += '  Gateway[Ingestion Gateway]\n';
      diagram += '  Queue[Message Queue]\n';
      diagram += '  Processor[Stream Processor]\n';
      diagram += '  Storage[(Storage)]\n';
      diagram += '  Analytics[Analytics Engine]\n';
      diagram += '  UI[Dashboard]\n\n';
      
      diagram += '  Agent -->|Events| Gateway\n';
      diagram += '  Gateway -->|Publish| Queue\n';
      diagram += '  Queue -->|Consume| Processor\n';
      diagram += '  Processor -->|Store| Storage\n';
      diagram += '  Processor -->|Analyze| Analytics\n';
      diagram += '  Analytics -->|Results| UI\n';
      diagram += '  Storage -.->|Query| UI\n';
    } else {
      diagram += '  Input[Input Data]\n';
      diagram += '  Validation[Validation]\n';
      diagram += '  Processing[Business Logic]\n';
      diagram += '  Storage[(Database)]\n';
      diagram += '  Output[Output]\n\n';
      
      diagram += '  Input --> Validation\n';
      diagram += '  Validation --> Processing\n';
      diagram += '  Processing --> Storage\n';
      diagram += '  Storage --> Output\n';
    }

    return diagram;
  };

  const generateDeploymentDiagram = (): string => {
    let diagram = 'graph TB\n';
    diagram += '  subgraph "Cloud Infrastructure"\n';
    diagram += '    subgraph "Kubernetes Cluster"\n';
    diagram += '      subgraph "Namespace: Production"\n';
    diagram += '        LB[Load Balancer]\n';
    diagram += '        Gateway[API Gateway Pod]\n';
    diagram += '        App1[App Service Pod 1]\n';
    diagram += '        App2[App Service Pod 2]\n';
    diagram += '        App3[App Service Pod 3]\n';
    diagram += '      end\n';
    diagram += '    end\n';
    diagram += '    subgraph "Data Tier"\n';
    diagram += '      DB1[(Primary DB)]\n';
    diagram += '      DB2[(Replica DB)]\n';
    diagram += '      Cache[(Redis Cache)]\n';
    diagram += '    end\n';
    diagram += '  end\n\n';
    
    diagram += '  Internet((Internet)) --> LB\n';
    diagram += '  LB --> Gateway\n';
    diagram += '  Gateway --> App1\n';
    diagram += '  Gateway --> App2\n';
    diagram += '  Gateway --> App3\n';
    diagram += '  App1 --> DB1\n';
    diagram += '  App2 --> DB1\n';
    diagram += '  App3 --> DB1\n';
    diagram += '  DB1 -.->|Replication| DB2\n';
    diagram += '  App1 --> Cache\n';
    diagram += '  App2 --> Cache\n';
    diagram += '  App3 --> Cache\n';

    return diagram;
  };

  const generateSecurityDiagram = (): string => {
    let diagram = 'graph TB\n';
    diagram += '  User[User]\n';
    diagram += '  WAF[Web Application Firewall]\n';
    diagram += '  Auth[Authentication Service]\n';
    diagram += '  Gateway[API Gateway]\n';
    diagram += '  AuthZ[Authorization Service]\n';
    diagram += '  App[Application Services]\n';
    diagram += '  Secrets[Secrets Manager]\n';
    diagram += '  DB[(Encrypted Database)]\n';
    diagram += '  Audit[Audit Logger]\n\n';
    
    diagram += '  User -->|HTTPS| WAF\n';
    diagram += '  WAF --> Auth\n';
    diagram += '  Auth -->|JWT Token| Gateway\n';
    diagram += '  Gateway --> AuthZ\n';
    diagram += '  AuthZ -->|Authorized| App\n';
    diagram += '  App -->|Get Secrets| Secrets\n';
    diagram += '  App -->|TLS| DB\n';
    diagram += '  App --> Audit\n';
    diagram += '  Gateway --> Audit\n';
    diagram += '  Auth --> Audit\n';

    return diagram;
  };

  const generateSequenceDiagram = (): string => {
    let diagram = 'sequenceDiagram\n';
    
    if (documentType === 'SA' && document.apiEndpoints?.length > 0) {
      const endpoint = document.apiEndpoints[0];
      diagram += '  participant Client\n';
      diagram += '  participant Gateway\n';
      diagram += '  participant Auth\n';
      diagram += '  participant Service\n';
      diagram += '  participant Database\n\n';
      
      diagram += `  Client->>Gateway: ${endpoint.method} ${endpoint.endpoint}\n`;
      diagram += '  Gateway->>Auth: Validate Token\n';
      diagram += '  Auth-->>Gateway: Token Valid\n';
      diagram += '  Gateway->>Service: Forward Request\n';
      diagram += '  Service->>Database: Query Data\n';
      diagram += '  Database-->>Service: Return Results\n';
      diagram += '  Service-->>Gateway: Response\n';
      diagram += '  Gateway-->>Client: HTTP 200 OK\n';
    } else {
      diagram += '  participant Client\n';
      diagram += '  participant Server\n';
      diagram += '  participant Database\n\n';
      
      diagram += '  Client->>Server: Request\n';
      diagram += '  Server->>Database: Query\n';
      diagram += '  Database-->>Server: Data\n';
      diagram += '  Server-->>Client: Response\n';
    }

    return diagram;
  };

  const renderDiagram = async (type: DiagramType) => {
    setSelectedDiagram(type);
    const code = generateMermaidCode(type);
    setMermaidCode(code);

    try {
      const { svg } = await mermaid.render('diagram-preview', code);
      setDiagramSvg(svg);
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      toast.error('Failed to render diagram');
    }
  };

  const downloadDiagram = (format: 'svg' | 'png' | 'mermaid') => {
    if (format === 'mermaid') {
      const blob = new Blob([mermaidCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.documentTitle || 'diagram'}_${selectedDiagram}.mmd`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Mermaid code downloaded!');
      return;
    }

    if (format === 'svg') {
      const blob = new Blob([diagramSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.documentTitle || 'diagram'}_${selectedDiagram}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('SVG downloaded!');
      return;
    }

    if (format === 'png') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${document.documentTitle || 'diagram'}_${selectedDiagram}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('PNG downloaded!');
          }
        });
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(diagramSvg);
    }
  };

  const diagramTypes = [
    { id: 'architecture' as DiagramType, label: 'Architecture', icon: Network, description: 'System components and relationships' },
    { id: 'dataflow' as DiagramType, label: 'Data Flow', icon: GitBranch, description: 'Data movement through system' },
    { id: 'deployment' as DiagramType, label: 'Deployment', icon: Layers, description: 'Infrastructure and deployment' },
    { id: 'security' as DiagramType, label: 'Security', icon: Shield, description: 'Security layers and controls' },
    { id: 'sequence' as DiagramType, label: 'Sequence', icon: Database, description: 'Request/response flow' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Architecture Diagram Generator</h2>
            <p className="text-sm text-gray-600 mt-1">{document.documentTitle || 'Untitled Document'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Diagram Types */}
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Diagram Types</h3>
            <div className="space-y-2">
              {diagramTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => renderDiagram(type.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                      selectedDiagram === type.id
                        ? 'bg-blue-100 border-2 border-blue-400 text-blue-700'
                        : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Export Options */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Export</h3>
              <div className="space-y-2">
                <button
                  onClick={() => downloadDiagram('svg')}
                  disabled={!diagramSvg}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  SVG
                </button>
                <button
                  onClick={() => downloadDiagram('png')}
                  disabled={!diagramSvg}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  PNG
                </button>
                <button
                  onClick={() => downloadDiagram('mermaid')}
                  disabled={!mermaidCode}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <Code className="w-4 h-4" />
                  Mermaid
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Diagram Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Instructions */}
            {!diagramSvg && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <Network className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Select a Diagram Type
                  </h3>
                  <p className="text-gray-500">
                    Choose a diagram type from the sidebar to visualize your architecture.
                    Diagrams are auto-generated from your {documentType} document.
                  </p>
                </div>
              </div>
            )}

            {/* Diagram Display */}
            {diagramSvg && (
              <>
                <div className="flex-1 overflow-auto p-6 bg-gray-50">
                  <div 
                    className="bg-white rounded-lg shadow-sm p-6 inline-block min-w-full"
                    dangerouslySetInnerHTML={{ __html: diagramSvg }}
                  />
                </div>

                {/* Mermaid Code Section */}
                <div className="border-t bg-white p-4">
                  <details className="cursor-pointer">
                    <summary className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      View Mermaid Code
                    </summary>
                    <pre className="mt-3 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
                      {mermaidCode}
                    </pre>
                  </details>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            💡 Tip: Click diagram types to switch views. Export in multiple formats.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
