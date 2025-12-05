# Low-Level Design: GraphQL API Layer v3.0

## 1. Service Overview

**Service Name**: API Gateway v3  
**Ports**: 3000 (REST), 4000 (GraphQL)  
**Framework**: Node.js 20 + Express + Apollo Server  
**Purpose**: Unified API gateway with GraphQL and REST endpoints

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│            API Gateway v3 (Ports 3000, 4000)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ GraphQL      │  │ REST API     │  │ WebSocket   │ │
│  │ (Apollo)     │  │ (Express)    │  │ (Socket.io) │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│         ↓                  ↓                 ↓         │
│  ┌─────────────────────────────────────────────────┐  │
│  │        Service Mesh (gRPC/HTTP)                 │  │
│  │  ┌─────┐ ┌────────┐ ┌─────┐ ┌──────────────┐  │  │
│  │  │Auth │ │AIOps   │ │CMDB │ │Orchestrator  │  │  │
│  │  └─────┘ └────────┘ └─────┘ └──────────────┘  │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 3. Database Schema (PostgreSQL)

### 3.1 infrastructures Table

```sql
CREATE TABLE infrastructures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    region VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    template_id VARCHAR(100),
    config JSONB NOT NULL DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT check_provider CHECK (provider IN ('aws', 'azure', 'gcp', 'digitalocean', 'alibaba', 'ibm', 'oracle', 'vmware', 'kubernetes', 'edge'))
);

CREATE INDEX idx_infrastructures_provider ON infrastructures(provider);
CREATE INDEX idx_infrastructures_status ON infrastructures(status);
CREATE INDEX idx_infrastructures_created_by ON infrastructures(created_by);
```

### 3.2 compute_resources Table

```sql
CREATE TABLE compute_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID NOT NULL REFERENCES infrastructures(id) ON DELETE CASCADE,
    instance_type VARCHAR(100) NOT NULL,
    instance_id VARCHAR(255),
    cpu_cores INT NOT NULL,
    memory_gb INT NOT NULL,
    disk_gb INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    ip_address INET,
    private_ip INET,
    availability_zone VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compute_infrastructure ON compute_resources(infrastructure_id);
CREATE INDEX idx_compute_status ON compute_resources(status);
```

### 3.3 deployments Table

```sql
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID NOT NULL REFERENCES infrastructures(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    namespace VARCHAR(100) DEFAULT 'default',
    replicas INT NOT NULL DEFAULT 1,
    desired_replicas INT NOT NULL DEFAULT 1,
    available_replicas INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    image VARCHAR(500) NOT NULL,
    image_tag VARCHAR(100) DEFAULT 'latest',
    env_vars JSONB DEFAULT '{}',
    resources JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deployments_infrastructure ON deployments(infrastructure_id);
CREATE INDEX idx_deployments_status ON deployments(status);
```

### 3.4 users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    permissions JSONB DEFAULT '[]',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_role CHECK (role IN ('admin', 'developer', 'operator', 'viewer', 'user'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 3.5 audit_logs Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
```

## 4. GraphQL Schema

### 4.1 Type Definitions

```graphql
# schema.graphql

# Enums
enum CloudProvider {
  AWS
  AZURE
  GCP
  DIGITALOCEAN
  ALIBABA
  IBM
  ORACLE
  VMWARE
  KUBERNETES
  EDGE
}

enum ResourceStatus {
  PENDING
  RUNNING
  STOPPED
  FAILED
  TERMINATED
  SCALING
}

enum UserRole {
  ADMIN
  DEVELOPER
  OPERATOR
  VIEWER
  USER
}

# Types
type Infrastructure {
  id: ID!
  name: String!
  provider: CloudProvider!
  region: String!
  status: ResourceStatus!
  templateId: String
  config: JSON!
  tags: [String!]!
  createdBy: User
  createdAt: DateTime!
  updatedAt: DateTime!
  
  # Relationships
  computeResources: [ComputeResource!]!
  deployments: [Deployment!]!
  metrics: [Metric!]!
}

type ComputeResource {
  id: ID!
  infrastructureId: ID!
  instanceType: String!
  instanceId: String
  cpuCores: Int!
  memoryGb: Int!
  diskGb: Int!
  status: ResourceStatus!
  ipAddress: String
  privateIp: String
  availabilityZone: String
  metadata: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
  
  # Relationships
  infrastructure: Infrastructure!
}

type Deployment {
  id: ID!
  infrastructureId: ID!
  name: String!
  namespace: String!
  replicas: Int!
  desiredReplicas: Int!
  availableReplicas: Int!
  status: ResourceStatus!
  image: String!
  imageTag: String!
  envVars: JSON
  resources: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
  
  # Relationships
  infrastructure: Infrastructure!
  pods: [Pod!]!
}

type Pod {
  name: String!
  namespace: String!
  status: String!
  ip: String
  node: String
  restartCount: Int!
  age: String!
}

type Metric {
  timestamp: DateTime!
  name: String!
  value: Float!
  labels: JSON
  unit: String
}

type Prediction {
  id: ID!
  predictionType: String!
  serviceName: String!
  probability: Float!
  confidence: Float!
  predictedAt: DateTime!
  predictedTime: DateTime
  severity: String!
  affectedComponents: [String!]!
  recommendedActions: [String!]!
  details: JSON!
}

type AnomalyEvent {
  id: ID!
  serviceName: String!
  severity: String!
  description: String!
  detectedAt: DateTime!
  resolved: Boolean!
  resolvedAt: DateTime
  affectedMetrics: [String!]!
  anomalyScore: Float!
}

type User {
  id: ID!
  email: String!
  username: String!
  role: UserRole!
  permissions: [String!]!
  lastLogin: DateTime
  createdAt: DateTime!
}

# Input Types
input CreateInfrastructureInput {
  name: String!
  provider: CloudProvider!
  region: String!
  templateId: String
  config: JSON
  tags: [String!]
}

input UpdateInfrastructureInput {
  name: String
  status: ResourceStatus
  config: JSON
  tags: [String!]
}

input CreateComputeInput {
  infrastructureId: ID!
  instanceType: String!
  count: Int = 1
}

input ScaleDeploymentInput {
  deploymentId: ID!
  replicas: Int!
}

input PredictionInput {
  serviceName: String!
  predictionType: String!
  timeWindowHours: Int = 48
  metrics: JSON
}

# Queries
type Query {
  # Infrastructure
  infrastructure(id: ID!): Infrastructure
  listInfrastructures(
    provider: CloudProvider
    status: ResourceStatus
    limit: Int = 50
    offset: Int = 0
  ): InfrastructureConnection!
  
  # Compute
  computeResource(id: ID!): ComputeResource
  computeResources(infrastructureId: ID!): [ComputeResource!]!
  
  # Deployments
  deployment(id: ID!): Deployment
  deployments(
    infrastructureId: ID
    namespace: String
    status: ResourceStatus
  ): [Deployment!]!
  
  # Predictions & Anomalies
  predictions(
    serviceName: String
    predictionType: String
    limit: Int = 20
  ): [Prediction!]!
  
  anomalies(
    serviceName: String
    severity: String
    resolved: Boolean
    limit: Int = 50
  ): [AnomalyEvent!]!
  
  # Metrics
  metrics(
    serviceName: String!
    metricName: String!
    timeRange: String = "1h"
  ): [Metric!]!
  
  # User
  me: User
  users(role: UserRole): [User!]!
}

# Mutations
type Mutation {
  # Infrastructure
  createInfrastructure(input: CreateInfrastructureInput!): Infrastructure!
  updateInfrastructure(id: ID!, input: UpdateInfrastructureInput!): Infrastructure!
  deleteInfrastructure(id: ID!): Boolean!
  
  # Compute
  createCompute(input: CreateComputeInput!): [ComputeResource!]!
  terminateCompute(id: ID!): Boolean!
  
  # Deployments
  scaleDeployment(input: ScaleDeploymentInput!): Deployment!
  restartDeployment(id: ID!): Deployment!
  rollbackDeployment(id: ID!, revisions: Int = 1): Deployment!
  
  # Predictions
  requestPrediction(input: PredictionInput!): Prediction!
  
  # Auth
  login(email: String!, password: String!): AuthPayload!
  logout: Boolean!
}

# Subscriptions
type Subscription {
  # Real-time updates
  infrastructureStatus(infrastructureId: ID!): Infrastructure!
  deploymentStatus(deploymentId: ID!): Deployment!
  anomalyAlerts(serviceName: String): AnomalyEvent!
  metricsStream(serviceName: String!, metricName: String!): Metric!
}

# Pagination
type InfrastructureConnection {
  edges: [InfrastructureEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type InfrastructureEdge {
  node: Infrastructure!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Auth
type AuthPayload {
  token: String!
  user: User!
  expiresIn: Int!
}

# Custom scalars
scalar DateTime
scalar JSON
```

## 5. Resolvers Implementation

### 5.1 Query Resolvers

```typescript
// src/graphql/resolvers/query.ts

import { QueryResolvers } from '../generated/graphql';
import { Context } from '../context';

export const Query: QueryResolvers = {
  // Infrastructure queries
  infrastructure: async (_parent, { id }, ctx: Context) => {
    const infra = await ctx.db.infrastructure.findUnique({
      where: { id },
      include: {
        createdBy: true,
        computeResources: true,
        deployments: true,
      },
    });
    
    if (!infra) throw new Error('Infrastructure not found');
    return infra;
  },
  
  listInfrastructures: async (_parent, args, ctx: Context) => {
    const { provider, status, limit, offset } = args;
    
    const where = {
      ...(provider && { provider }),
      ...(status && { status }),
      deletedAt: null,
    };
    
    const [infrastructures, totalCount] = await Promise.all([
      ctx.db.infrastructure.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: true,
        },
      }),
      ctx.db.infrastructure.count({ where }),
    ]);
    
    return {
      edges: infrastructures.map((node, index) => ({
        node,
        cursor: Buffer.from(`${offset + index}`).toString('base64'),
      })),
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        startCursor: infrastructures.length > 0 
          ? Buffer.from(`${offset}`).toString('base64') 
          : null,
        endCursor: infrastructures.length > 0
          ? Buffer.from(`${offset + infrastructures.length - 1}`).toString('base64')
          : null,
      },
      totalCount,
    };
  },
  
  // Predictions
  predictions: async (_parent, args, ctx: Context) => {
    const { serviceName, predictionType, limit } = args;
    
    // Call AIOps Engine service
    const response = await ctx.services.aiops.getPredictions({
      serviceName,
      predictionType,
      limit,
    });
    
    return response.data;
  },
  
  // Metrics
  metrics: async (_parent, { serviceName, metricName, timeRange }, ctx: Context) => {
    const query = `
      SELECT time, value, labels
      FROM metrics
      WHERE service_name = $1
        AND metric_name = $2
        AND time > NOW() - INTERVAL '${timeRange}'
      ORDER BY time DESC
    `;
    
    const result = await ctx.db.query(query, [serviceName, metricName]);
    
    return result.rows.map(row => ({
      timestamp: row.time,
      name: metricName,
      value: row.value,
      labels: row.labels,
    }));
  },
};
```

### 5.2 Mutation Resolvers

```typescript
// src/graphql/resolvers/mutation.ts

import { MutationResolvers } from '../generated/graphql';
import { Context } from '../context';

export const Mutation: MutationResolvers = {
  // Create infrastructure
  createInfrastructure: async (_parent, { input }, ctx: Context) => {
    // Authorization check
    if (!ctx.user) throw new Error('Unauthorized');
    
    // Validate template if provided
    if (input.templateId) {
      const template = await ctx.services.templates.get(input.templateId);
      if (!template) throw new Error('Template not found');
    }
    
    // Create infrastructure record
    const infrastructure = await ctx.db.infrastructure.create({
      data: {
        name: input.name,
        provider: input.provider,
        region: input.region,
        templateId: input.templateId,
        config: input.config || {},
        tags: input.tags || [],
        createdBy: { connect: { id: ctx.user.id } },
        status: 'pending',
      },
      include: {
        createdBy: true,
      },
    });
    
    // Trigger infrastructure provisioning
    await ctx.services.orchestrator.provisionInfrastructure({
      infrastructureId: infrastructure.id,
      provider: input.provider,
      region: input.region,
      config: input.config,
    });
    
    // Publish event to Kafka
    await ctx.kafka.send({
      topic: 'infrastructure_changes',
      messages: [{
        key: infrastructure.id,
        value: JSON.stringify({
          type: 'created',
          infrastructure,
          timestamp: new Date().toISOString(),
        }),
      }],
    });
    
    // Audit log
    await ctx.db.auditLog.create({
      data: {
        userId: ctx.user.id,
        action: 'create_infrastructure',
        resourceType: 'infrastructure',
        resourceId: infrastructure.id,
        details: { input },
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
      },
    });
    
    return infrastructure;
  },
  
  // Scale deployment
  scaleDeployment: async (_parent, { input }, ctx: Context) => {
    const { deploymentId, replicas } = input;
    
    // Get deployment
    const deployment = await ctx.db.deployment.findUnique({
      where: { id: deploymentId },
      include: { infrastructure: true },
    });
    
    if (!deployment) throw new Error('Deployment not found');
    
    // Call Kubernetes API
    await ctx.services.kubernetes.scaleDeployment({
      namespace: deployment.namespace,
      name: deployment.name,
      replicas,
    });
    
    // Update database
    const updated = await ctx.db.deployment.update({
      where: { id: deploymentId },
      data: {
        desiredReplicas: replicas,
        updatedAt: new Date(),
      },
    });
    
    // Publish event
    await ctx.kafka.send({
      topic: 'infrastructure_changes',
      messages: [{
        key: deploymentId,
        value: JSON.stringify({
          type: 'scaled',
          deployment: updated,
          oldReplicas: deployment.replicas,
          newReplicas: replicas,
        }),
      }],
    });
    
    return updated;
  },
  
  // Request prediction
  requestPrediction: async (_parent, { input }, ctx: Context) => {
    // Call AIOps Engine
    const response = await ctx.services.aiops.predict({
      predictionType: input.predictionType,
      serviceName: input.serviceName,
      timeWindow: input.timeWindowHours,
      metrics: input.metrics,
    });
    
    return response.data;
  },
};
```

### 5.3 Subscription Resolvers

```typescript
// src/graphql/resolvers/subscription.ts

import { SubscriptionResolvers } from '../generated/graphql';
import { Context } from '../context';
import { withFilter } from 'graphql-subscriptions';

export const Subscription: SubscriptionResolvers = {
  // Infrastructure status updates
  infrastructureStatus: {
    subscribe: withFilter(
      (_parent, _args, ctx: Context) => ctx.pubsub.asyncIterator(['INFRASTRUCTURE_STATUS']),
      (payload, variables) => {
        return payload.infrastructureStatus.id === variables.infrastructureId;
      }
    ),
  },
  
  // Anomaly alerts
  anomalyAlerts: {
    subscribe: withFilter(
      (_parent, _args, ctx: Context) => ctx.pubsub.asyncIterator(['ANOMALY_ALERT']),
      (payload, variables) => {
        if (!variables.serviceName) return true;
        return payload.anomalyAlerts.serviceName === variables.serviceName;
      }
    ),
  },
  
  // Real-time metrics stream
  metricsStream: {
    subscribe: async function* (_parent, { serviceName, metricName }, ctx: Context) {
      // Subscribe to Kafka topic
      const consumer = ctx.kafka.consumer({ groupId: `metrics-${ctx.user.id}` });
      await consumer.connect();
      await consumer.subscribe({ topic: 'metrics' });
      
      await consumer.run({
        eachMessage: async ({ message }) => {
          const metric = JSON.parse(message.value.toString());
          
          if (metric.service === serviceName && metric.metric === metricName) {
            yield {
              metricsStream: {
                timestamp: new Date(metric.timestamp),
                name: metric.metric,
                value: metric.value,
                labels: metric.labels,
              },
            };
          }
        },
      });
    },
  },
};
```

## 6. DataLoader Implementation

```typescript
// src/graphql/dataloaders.ts

import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

export function createDataLoaders(db: PrismaClient) {
  return {
    // Batch load infrastructures
    infrastructureLoader: new DataLoader(async (ids: readonly string[]) => {
      const infrastructures = await db.infrastructure.findMany({
        where: { id: { in: [...ids] } },
      });
      
      const map = new Map(infrastructures.map(i => [i.id, i]));
      return ids.map(id => map.get(id) || null);
    }),
    
    // Batch load compute resources
    computeResourcesByInfraLoader: new DataLoader(async (infraIds: readonly string[]) => {
      const resources = await db.computeResource.findMany({
        where: { infrastructureId: { in: [...infraIds] } },
      });
      
      const grouped = new Map<string, any[]>();
      resources.forEach(r => {
        const list = grouped.get(r.infrastructureId) || [];
        list.push(r);
        grouped.set(r.infrastructureId, list);
      });
      
      return infraIds.map(id => grouped.get(id) || []);
    }),
    
    // Batch load deployments
    deploymentsByInfraLoader: new DataLoader(async (infraIds: readonly string[]) => {
      const deployments = await db.deployment.findMany({
        where: { infrastructureId: { in: [...infraIds] } },
      });
      
      const grouped = new Map<string, any[]>();
      deployments.forEach(d => {
        const list = grouped.get(d.infrastructureId) || [];
        list.push(d);
        grouped.set(d.infrastructureId, list);
      });
      
      return infraIds.map(id => grouped.get(id) || []);
    }),
  };
}
```

## 7. Authentication & Authorization

### 7.1 JWT Authentication

```typescript
// src/auth/jwt.ts

import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function authenticateUser(db: any, token: string): Promise<User | null> {
  try {
    const decoded = verifyToken(token);
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });
    return user;
  } catch {
    return null;
  }
}
```

### 7.2 Authorization Middleware

```typescript
// src/auth/permissions.ts

type Permission = 
  | 'infrastructure:create'
  | 'infrastructure:read'
  | 'infrastructure:update'
  | 'infrastructure:delete'
  | 'deployment:scale'
  | 'deployment:restart'
  | 'prediction:request';

const rolePermissions: Record<string, Permission[]> = {
  admin: [
    'infrastructure:create',
    'infrastructure:read',
    'infrastructure:update',
    'infrastructure:delete',
    'deployment:scale',
    'deployment:restart',
    'prediction:request',
  ],
  developer: [
    'infrastructure:create',
    'infrastructure:read',
    'infrastructure:update',
    'deployment:scale',
    'deployment:restart',
    'prediction:request',
  ],
  operator: [
    'infrastructure:read',
    'deployment:scale',
    'deployment:restart',
    'prediction:request',
  ],
  viewer: [
    'infrastructure:read',
    'prediction:request',
  ],
};

export function hasPermission(user: any, permission: Permission): boolean {
  const permissions = rolePermissions[user.role] || [];
  return permissions.includes(permission);
}

export function requirePermission(permission: Permission) {
  return (resolver: any) => {
    return async (parent: any, args: any, ctx: any, info: any) => {
      if (!ctx.user) throw new Error('Unauthorized');
      if (!hasPermission(ctx.user, permission)) {
        throw new Error(`Permission denied: ${permission}`);
      }
      return resolver(parent, args, ctx, info);
    };
  };
}
```

## 8. Rate Limiting

```typescript
// src/middleware/rateLimiter.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  message: 'Too many requests, please try again later',
});

export const graphqlLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:graphql:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 500, // 500 queries per 15 minutes
  skip: (req) => {
    // Skip rate limiting for introspection queries
    const query = req.body?.query || '';
    return query.includes('__schema') || query.includes('__type');
  },
});
```

## 9. Error Handling

```typescript
// src/graphql/errors.ts

import { GraphQLError } from 'graphql';

export class NotFoundError extends GraphQLError {
  constructor(resource: string) {
    super(`${resource} not found`, {
      extensions: {
        code: 'NOT_FOUND',
        http: { status: 404 },
      },
    });
  }
}

export class UnauthorizedError extends GraphQLError {
  constructor(message = 'Unauthorized') {
    super(message, {
      extensions: {
        code: 'UNAUTHORIZED',
        http: { status: 401 },
      },
    });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message = 'Forbidden') {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    });
  }
}

export class ValidationError extends GraphQLError {
  constructor(message: string, field?: string) {
    super(message, {
      extensions: {
        code: 'VALIDATION_ERROR',
        field,
        http: { status: 400 },
      },
    });
  }
}
```

## 10. Testing

### 10.1 Query Tests

```typescript
// tests/graphql/infrastructure.test.ts

import { gql } from 'graphql-tag';
import { createTestServer } from '../helpers/testServer';

describe('Infrastructure Queries', () => {
  let server: any;
  
  beforeAll(async () => {
    server = await createTestServer();
  });
  
  test('should list infrastructures', async () => {
    const query = gql`
      query {
        listInfrastructures(limit: 10) {
          edges {
            node {
              id
              name
              provider
              status
            }
          }
          totalCount
        }
      }
    `;
    
    const result = await server.executeOperation({ query });
    
    expect(result.errors).toBeUndefined();
    expect(result.data?.listInfrastructures).toBeDefined();
    expect(result.data?.listInfrastructures.totalCount).toBeGreaterThanOrEqual(0);
  });
  
  test('should get infrastructure by ID', async () => {
    const query = gql`
      query GetInfra($id: ID!) {
        infrastructure(id: $id) {
          id
          name
          computeResources {
            id
            instanceType
          }
        }
      }
    `;
    
    const result = await server.executeOperation({
      query,
      variables: { id: 'test-infra-id' },
    });
    
    expect(result.errors).toBeUndefined();
    expect(result.data?.infrastructure).toBeDefined();
  });
});
```

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Status**: Ready for Implementation
