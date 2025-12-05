# Low-Level Design: Frontend UI v3.0 (Next.js 15)

## 1. Overview

**Framework**: Next.js 15 + React 19 + TypeScript  
**UI Library**: Tailwind CSS + shadcn/ui + Radix UI  
**State Management**: Zustand + React Query  
**Real-time**: GraphQL Subscriptions + WebSocket  
**Port**: 3001

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Next.js 15 Frontend (Port 3001)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ App Router   │  │ Server       │  │ AI Chat     │ │
│  │ (Pages)      │  │ Components   │  │ Interface   │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│         ↓                  ↓                 ↓         │
│  ┌─────────────────────────────────────────────────┐  │
│  │   State Management (Zustand + React Query)      │  │
│  └─────────────────────────────────────────────────┘  │
│         ↓                  ↓                 ↓         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ GraphQL      │  │ REST API     │  │ WebSocket   │ │
│  │ Client       │  │ Client       │  │ Client      │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 3. New Features (v3.0)

### 3.1 AI-Powered Command Interface

Natural language infrastructure commands powered by GPT-4:

```typescript
// src/features/ai-command/AICommandInterface.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AICommandResponse {
  interpretation: string;
  actions: Array<{
    type: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  confirmation_required: boolean;
}

export function AICommandInterface() {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState<AICommandResponse | null>(null);
  
  const interpretMutation = useMutation({
    mutationFn: async (command: string) => {
      const res = await fetch('/api/v3/ai/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResponse(data);
    },
  });
  
  const executeMutation = useMutation({
    mutationFn: async (actions: any[]) => {
      const res = await fetch('/api/v3/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions }),
      });
      return res.json();
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    interpretMutation.mutate(command);
  };
  
  const handleExecute = () => {
    if (response?.actions) {
      executeMutation.mutate(response.actions);
      setResponse(null);
      setCommand('');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          AI Command Interface
        </h2>
        <p className="text-gray-600 mt-2">
          Describe what you want in plain English
        </p>
      </div>
      
      {/* Command Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Example: Create 3 AWS EC2 instances in us-east-1 with 8GB RAM and deploy my API service..."
            className="min-h-[120px] pr-12 text-base"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute bottom-3 right-3"
            disabled={!command.trim() || interpretMutation.isPending}
          >
            {interpretMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
      
      {/* AI Interpretation */}
      {response && (
        <Card className="p-6 mb-6 border-2 border-purple-200">
          <h3 className="font-semibold text-lg mb-3">
            AI Interpretation
          </h3>
          <p className="text-gray-700 mb-4">{response.interpretation}</p>
          
          <div className="space-y-3">
            <h4 className="font-medium">Planned Actions:</h4>
            {response.actions.map((action, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded-lg border"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{action.type}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {action.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {JSON.stringify(action.parameters, null, 2)}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleExecute}
              disabled={executeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {executeMutation.isPending ? 'Executing...' : 'Execute Actions'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setResponse(null)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
      
      {/* Examples */}
      <div className="mt-8">
        <h3 className="font-semibold mb-3">Example Commands:</h3>
        <div className="grid gap-2">
          {EXAMPLE_COMMANDS.map((example, index) => (
            <button
              key={index}
              onClick={() => setCommand(example)}
              className="text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const EXAMPLE_COMMANDS = [
  'Create a Kubernetes cluster on GCP with 5 nodes and autoscaling enabled',
  'Scale my production API deployment to 10 replicas',
  'Show me all resources consuming more than $100/month',
  'Create a staging environment identical to production but with smaller instances',
  'Set up monitoring alerts for CPU usage above 80% on all services',
];
```

### 3.2 Real-time Predictive Analytics Dashboard

```typescript
// src/features/analytics/PredictiveDashboard.tsx

'use client';

import { useSubscription } from '@apollo/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PREDICTIONS_SUBSCRIPTION = gql`
  subscription OnPredictions($serviceName: String) {
    predictions(serviceName: $serviceName) {
      id
      predictionType
      probability
      confidence
      predictedTime
      severity
      affectedComponents
      recommendedActions
    }
  }
`;

export function PredictiveDashboard() {
  const { data, loading } = useSubscription(PREDICTIONS_SUBSCRIPTION);
  
  const predictions = data?.predictions || [];
  const criticalPredictions = predictions.filter(
    p => p.severity === 'critical' || p.severity === 'high'
  );
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Predictions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{predictions.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              +12% from last hour
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {criticalPredictions.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Auto-Remediation Rate
            </CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              87%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Success rate this week
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Predictions Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Failure Prediction Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="predictedTime" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="probability"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Critical Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalPredictions.map((prediction) => (
              <div
                key={prediction.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">
                      {prediction.predictionType}
                    </span>
                    <Badge variant={
                      prediction.severity === 'critical' ? 'destructive' : 'warning'
                    }>
                      {prediction.severity}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {prediction.probability * 100}% probability
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Affected: {prediction.affectedComponents.join(', ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    Recommended: {prediction.recommendedActions.join(', ')}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3.3 Interactive Infrastructure Canvas

Drag-and-drop infrastructure designer with real-time collaboration:

```typescript
// src/features/canvas/InfrastructureCanvas.tsx

'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './nodes/CustomNode';
import { Sidebar } from './Sidebar';
import { useInfrastructureStore } from '@/stores/infrastructureStore';

const nodeTypes = {
  custom: CustomNode,
};

export function InfrastructureCanvas() {
  const { infrastructure, updateInfrastructure } = useInfrastructureStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(infrastructure.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(infrastructure.edges);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      const type = event.dataTransfer.getData('application/reactflow');
      const position = {
        x: event.clientX,
        y: event.clientY,
      };
      
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: type,
          type,
          config: {},
        },
      };
      
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDeploy = async () => {
    const infrastructure = {
      nodes,
      edges,
    };
    
    await updateInfrastructure(infrastructure);
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <Button onClick={handleDeploy} size="lg">
            Deploy Infrastructure
          </Button>
          <Button variant="outline" size="lg">
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
}

// Custom Node Component
// src/features/canvas/nodes/CustomNode.tsx

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Server, Database, Globe, Box } from 'lucide-react';

const iconMap = {
  compute: Server,
  database: Database,
  loadbalancer: Globe,
  storage: Box,
};

export const CustomNode = memo(({ data }: any) => {
  const Icon = iconMap[data.type as keyof typeof iconMap] || Server;
  
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 transition-colors">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-blue-600" />
        <div>
          <div className="font-bold text-sm">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type}</div>
        </div>
      </div>
      
      {data.status && (
        <div className="mt-2 text-xs">
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
            data.status === 'running' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          {data.status}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
```

### 3.4 Cost Optimization Dashboard

```typescript
// src/features/cost/CostOptimizationDashboard.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DollarSign, TrendingDown, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CostOptimizationDashboard() {
  const { data: costData } = useQuery({
    queryKey: ['cost-analysis'],
    queryFn: async () => {
      const res = await fetch('/api/v3/cost/analysis');
      return res.json();
    },
  });
  
  const { data: recommendations } = useQuery({
    queryKey: ['cost-recommendations'],
    queryFn: async () => {
      const res = await fetch('/api/v3/cost/recommendations');
      return res.json();
    },
  });
  
  return (
    <div className="space-y-6">
      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Current Spend
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${costData?.currentMonth.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Projected Spend
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              ${costData?.projected.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              End of month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Potential Savings
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${costData?.potentialSavings.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Per month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Optimization Score
            </CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {costData?.optimizationScore}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Room for improvement
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie
                data={costData?.byService}
                cx={200}
                cy={150}
                labelLine={false}
                label
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {costData?.byService.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cost by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={400} height={300} data={costData?.byProvider}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cost" fill="#8b5cf6" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Cost Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations?.map((rec: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <Lightbulb className="w-5 h-5 text-yellow-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{rec.title}</span>
                    <Badge variant="outline">
                      Save ${rec.monthlySavings}/mo
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {rec.description}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Apply Recommendation</Button>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
```

## 4. State Management

### 4.1 Zustand Stores

```typescript
// src/stores/infrastructureStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface InfrastructureState {
  infrastructures: Infrastructure[];
  selectedInfrastructure: Infrastructure | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchInfrastructures: () => Promise<void>;
  selectInfrastructure: (id: string) => void;
  createInfrastructure: (data: CreateInfrastructureInput) => Promise<void>;
  updateInfrastructure: (id: string, data: UpdateInfrastructureInput) => Promise<void>;
  deleteInfrastructure: (id: string) => Promise<void>;
}

export const useInfrastructureStore = create<InfrastructureState>()(
  devtools(
    persist(
      (set, get) => ({
        infrastructures: [],
        selectedInfrastructure: null,
        loading: false,
        error: null,
        
        fetchInfrastructures: async () => {
          set({ loading: true, error: null });
          try {
            const res = await fetch('/api/v3/infrastructures');
            const data = await res.json();
            set({ infrastructures: data, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },
        
        selectInfrastructure: (id: string) => {
          const infra = get().infrastructures.find(i => i.id === id);
          set({ selectedInfrastructure: infra || null });
        },
        
        createInfrastructure: async (data) => {
          set({ loading: true });
          try {
            const res = await fetch('/api/v3/infrastructures', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            const newInfra = await res.json();
            set(state => ({
              infrastructures: [...state.infrastructures, newInfra],
              loading: false,
            }));
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },
        
        // ... other actions
      }),
      {
        name: 'infrastructure-storage',
      }
    )
  )
);
```

## 5. API Integration

### 5.1 GraphQL Client Setup

```typescript
// src/lib/apollo-client.ts

import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'include',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

### 5.2 React Query Setup

```typescript
// src/lib/react-query.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

## 6. Performance Optimizations

### 6.1 Server Components

```typescript
// app/dashboard/page.tsx

import { Suspense } from 'react';
import { InfrastructureList } from '@/components/InfrastructureList';
import { MetricsOverview } from '@/components/MetricsOverview';
import { Skeleton } from '@/components/ui/skeleton';

// Server Component - No client-side JavaScript
export default async function DashboardPage() {
  // Fetch data on server
  const infrastructures = await fetchInfrastructures();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <MetricsOverview />
      </Suspense>
      
      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <InfrastructureList infrastructures={infrastructures} />
      </Suspense>
    </div>
  );
}
```

### 6.2 Image Optimization

```typescript
// next.config.js

module.exports = {
  images: {
    domains: ['cdn.iacdharma.io'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};
```

## 7. Testing

### 7.1 Component Tests

```typescript
// src/features/ai-command/__tests__/AICommandInterface.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AICommandInterface } from '../AICommandInterface';
import { queryClient } from '@/lib/react-query';

describe('AICommandInterface', () => {
  it('renders command input', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AICommandInterface />
      </QueryClientProvider>
    );
    
    expect(screen.getByPlaceholderText(/Example:/)).toBeInTheDocument();
  });
  
  it('submits command and shows interpretation', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AICommandInterface />
      </QueryClientProvider>
    );
    
    const input = screen.getByPlaceholderText(/Example:/);
    const button = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, {
      target: { value: 'Create 3 AWS instances' },
    });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/AI Interpretation/)).toBeInTheDocument();
    });
  });
});
```

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Status**: Ready for Implementation
