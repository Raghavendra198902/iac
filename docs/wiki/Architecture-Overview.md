# Architecture Overview

Comprehensive deep-dive into IAC Dharma's enterprise architecture, microservices design, data flows, and technical implementation details.

---

## Table of Contents

| Section | Description | Time |
|---------|-------------|------|
| [System Architecture](#system-architecture) | High-level system diagram | 5 min |
| [Architecture Principles](#architecture-principles) | Design philosophy and patterns | 5 min |
| [Component Details](#component-details) | Deep-dive into each component | 30 min |
| [Data Flow](#data-flow) | Request flows and data pipelines | 15 min |
| [Communication Patterns](#communication-patterns) | Inter-service communication | 10 min |
| [Design Patterns](#design-patterns) | Applied architectural patterns | 10 min |
| [Security Architecture](#security-architecture) | Security layers and controls | 15 min |
| [Scalability & Performance](#scalability--performance) | Scaling strategies | 10 min |
| [Reliability & Resilience](#reliability--resilience) | HA and DR strategies | 10 min |
| [Data Architecture](#data-architecture) | Database design and data models | 15 min |
| [Deployment Architecture](#deployment-architecture) | Deployment topologies | 10 min |
| [Technology Stack](#technology-stack) | Complete tech inventory | 5 min |

**Total Reading Time**: ~2 hours

---

## System Architecture

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           IAC DHARMA PLATFORM v1.0                           │
│                    Enterprise Infrastructure Automation                       │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌─────────────────┐   ┌──────────────────────────┐  │
│  │  Web Frontend   │   │   Mobile App    │   │   CLI Tool               │  │
│  │  React 18 + TS  │   │  React Native   │   │   Node.js + Commander    │  │
│  │  Vite + Tailwind│   │  iOS + Android  │   │   iac-dharma command     │  │
│  │  Port: 5173     │   │  Expo SDK       │   │   Interactive prompts    │  │
│  │                 │   │                 │   │   ANSI colors + progress │  │
│  └────────┬────────┘   └────────┬────────┘   └──────────┬───────────────┘  │
│           │                     │                         │                   │
│           └─────────────────────┼─────────────────────────┘                   │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                                   │ HTTPS/WSS
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             GATEWAY LAYER                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    API Gateway (Express + TypeScript)                   │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Request Flow:                                                    │  │ │
│  │  │  1. TLS Termination                                              │  │ │
│  │  │  2. Authentication (JWT + OAuth 2.0)                             │  │ │
│  │  │  3. Authorization (RBAC + ABAC)                                  │  │ │
│  │  │  4. Rate Limiting (1000 req/15min/IP)                           │  │ │
│  │  │  5. Request Validation (JSON Schema)                             │  │ │
│  │  │  6. Circuit Breaker (50% error threshold)                        │  │ │
│  │  │  7. Load Balancing (Round-robin + health checks)                │  │ │
│  │  │  8. Request Transformation                                        │  │ │
│  │  │  9. Service Routing                                              │  │ │
│  │  │  10. Response Aggregation                                        │  │ │
│  │  │  11. Compression (gzip/brotli)                                   │  │ │
│  │  │  12. Response Caching (Redis)                                    │  │ │
│  │  │  13. Distributed Tracing (Jaeger)                                │  │ │
│  │  │  14. Metrics Collection (Prometheus)                             │  │ │
│  │  │  15. Logging (Structured JSON)                                   │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │  Port: 3000 | Node.js 20 LTS | Express 4.18                            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  │                │                │
                  ▼                ▼                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          CORE SERVICE LAYER                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐   │
│  │  Blueprint Svc   │  │  IAC Generator   │  │  Guardrails Engine      │   │
│  │  Port: 3001      │  │  Port: 3002      │  │  Port: 3003             │   │
│  │                  │  │                  │  │                         │   │
│  │  • CRUD ops      │  │  • Terraform     │  │  • Policy validation    │   │
│  │  • Versioning    │  │  • CloudForm     │  │  • OPA Rego engine      │   │
│  │  • Templates     │  │  • ARM           │  │  • Compliance checks    │   │
│  │  • Validation    │  │  • Pulumi        │  │  • Best practices       │   │
│  │  • Import/Export │  │  • CDK           │  │  • Security scanning    │   │
│  └──────────────────┘  └──────────────────┘  └─────────────────────────┘   │
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐   │
│  │  Costing Svc     │  │  Orchestrator    │  │  Automation Engine      │   │
│  │  Port: 3004      │  │  Port: 3005      │  │  Port: 3006             │   │
│  │                  │  │                  │  │                         │   │
│  │  • Cost estimate │  │  • Deploy mgmt   │  │  • Workflow exec        │   │
│  │  • Price API     │  │  • State track   │  │  • Scheduling           │   │
│  │  • Optimization  │  │  • Rollback      │  │  • Event triggers       │   │
│  │  • Budgets       │  │  • Notifications │  │  • Retry logic          │   │
│  │  • Reports       │  │  • Approval      │  │  • Parallel tasks       │   │
│  └──────────────────┘  └──────────────────┘  └─────────────────────────┘   │
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐   │
│  │  Monitoring Svc  │  │  CMDB Agent      │  │  Cloud Provider Svc     │   │
│  │  Port: 3007      │  │  Port: 3008      │  │  Port: 3010             │   │
│  │                  │  │                  │  │                         │   │
│  │  • Health checks │  │  • Asset disc    │  │  • AWS SDK              │   │
│  │  • Metrics       │  │  • Inventory     │  │  • Azure SDK            │   │
│  │  • Alerts        │  │  • Compliance    │  │  • GCP SDK              │   │
│  │  • Dashboards    │  │  • Drift detect  │  │  • Multi-region         │   │
│  │  • SLA tracking  │  │  • Relationships │  │  • Credential mgmt      │   │
│  └──────────────────┘  └──────────────────┘  └─────────────────────────┘   │
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                                │
│  │  SSO Service     │  │  AI Recommend    │                                │
│  │  Port: 3012      │  │  Port: 3011      │                                │
│  │                  │  │                  │                                │
│  │  • OAuth 2.0     │  │  • Cost optim    │                                │
│  │  • SAML 2.0      │  │  • Performance   │                                │
│  │  • LDAP/AD       │  │  • Security      │                                │
│  │  • MFA           │  │  • Reliability   │                                │
│  │  • Session mgmt  │  │  • ML-powered    │                                │
│  └──────────────────┘  └──────────────────┘                                │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          INTELLIGENCE LAYER                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                  AI Engine (Python 3.11 + FastAPI)                     │ │
│  │                         Port: 8000                                     │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │  ML Models:                                                       │ │ │
│  │  │  1. Cost Predictor (LSTM) - Monthly cost forecasting            │ │ │
│  │  │  2. Anomaly Detector (Isolation Forest) - Unusual patterns      │ │ │
│  │  │  3. Resource Recommender (Collaborative Filtering)              │ │ │
│  │  │  4. Pattern Recognizer (CNN) - Architecture patterns            │ │ │
│  │  │  5. Security Scanner (NLP) - Vulnerability detection            │ │ │
│  │  │  6. Optimization Engine (Genetic Algorithm) - Config tuning     │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │  Model Registry: MLflow | Inference: TensorFlow Serving              │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐    │
│  │  PostgreSQL    │  │     Redis      │  │   Object Storage (S3)      │    │
│  │  Primary DB    │  │  Cache + Queue │  │   Terraform State          │    │
│  │  Port: 5432    │  │  Port: 6379    │  │   Generated Code           │    │
│  │                │  │                │  │   Backups                  │    │
│  │  • Blueprints  │  │  • L1 Cache    │  │   Logs                     │    │
│  │  • Deployments │  │  • Sessions    │  │   Artifacts                │    │
│  │  • Users       │  │  • Rate limit  │  │                            │    │
│  │  • Policies    │  │  • Job queue   │  │   Lifecycle: 90d standard  │    │
│  │  • Audit logs  │  │  • Pub/Sub     │  │   Archive: Glacier         │    │
│  │  • CMDB assets │  │  • Locks       │  │   Encryption: AES-256      │    │
│  └────────────────┘  └────────────────┘  └────────────────────────────┘    │
│                                                                               │
│  Configuration: Master-Replica | Connection Pool: PgBouncer                  │
│  Backup: WAL + S3 | Retention: 30 days | Encryption: TLS + at-rest          │
└──────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        OBSERVABILITY LAYER                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  ┌────────────┐  │
│  │  Prometheus   │  │    Grafana    │  │     Jaeger     │  │    Loki    │  │
│  │  Port: 9090   │  │  Port: 3030   │  │  Port: 16686   │  │ Port: 3100 │  │
│  │               │  │               │  │                │  │            │  │
│  │  • Metrics    │  │  • 12 Dashbds │  │  • Dist trace  │  │  • Logs    │  │
│  │  • Targets    │  │  • Alerts     │  │  • Dependencies│  │  • Query   │  │
│  │  • Alerting   │  │  • Variables  │  │  • Latency     │  │  • Aggr    │  │
│  │  • Recording  │  │  • Annotations│  │  • Errors      │  │  • Export  │  │
│  │               │  │               │  │  • Sampling    │  │            │  │
│  │  15d retention│  │  ∞ history    │  │  7d retention  │  │ 30d retain │  │
│  └───────────────┘  └───────────────┘  └────────────────┘  └────────────┘  │
│                                                                               │
│  ┌───────────────┐  ┌───────────────┐                                       │
│  │ Alertmanager  │  │   PagerDuty   │                                       │
│  │  Port: 9093   │  │   Integration │                                       │
│  │               │  │               │                                       │
│  │  • Routing    │  │  • Incidents  │                                       │
│  │  • Grouping   │  │  • Escalation │                                       │
│  │  • Silencing  │  │  • On-call    │                                       │
│  │  • Inhibition │  │  • Runbooks   │                                       │
│  └───────────────┘  └───────────────┘                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Architecture Layers Summary

| Layer | Components | Purpose | Technology |
|-------|-----------|---------|------------|
| **Presentation** | Frontend, Mobile, CLI | User interaction | React 18, React Native, Node.js |
| **Gateway** | API Gateway | Traffic control, security | Express.js, JWT, OAuth 2.0 |
| **Core Services** | 11 microservices | Business logic | Node.js, TypeScript, Express |
| **Intelligence** | AI Engine, ML Models | Smart recommendations | Python, FastAPI, TensorFlow |
| **Data** | PostgreSQL, Redis, S3 | Data persistence | PostgreSQL 15, Redis 7 |
| **Observability** | Monitoring stack | System visibility | Prometheus, Grafana, Jaeger |

---

## Architecture Principles

### 1. Domain-Driven Design (DDD)

**Bounded Contexts**:
- **Blueprint Context**: Blueprint design and versioning
- **Deployment Context**: Infrastructure deployment and orchestration
- **Cost Context**: Cost estimation and optimization
- **Policy Context**: Guardrails and compliance
- **Monitoring Context**: Observability and alerting
- **Identity Context**: Authentication and authorization

**Ubiquitous Language**:
- Blueprint, Resource, Provider, Deployment, State
- Guardrails, Policy, Validation, Compliance
- Cost Estimate, Optimization, Recommendation

### 2. Microservices Patterns

**Service Independence**:
- Each service owns its data (Database per Service)
- Independent deployment cycles
- Technology heterogeneity (Node.js + Python)
- Failure isolation

**Communication**:
- Synchronous: HTTP/REST for request-response
- Asynchronous: Redis Pub/Sub for events
- Real-time: WebSockets for streaming

**Service Discovery**:
- Static configuration in development
- Kubernetes DNS in production
- Health check endpoints (/health)

### 3. API-First Design

**OpenAPI 3.0 Specification**:
```yaml
openapi: 3.0.0
info:
  title: IAC Dharma API
  version: 1.0.0
  description: Infrastructure Automation Platform API
paths:
  /api/blueprints:
    get:
      summary: List blueprints
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Blueprint'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
```

**Benefits**:
- Contract-first development
- Automatic client generation
- Interactive documentation (Swagger UI)
- Validation middleware

### 4. Event-Driven Architecture

**Event Types**:
- **Domain Events**: BlueprintCreated, DeploymentStarted
- **Integration Events**: CostEstimated, GuardrailsValidated
- **System Events**: ServiceHealthChanged, AlertTriggered

**Event Flow**:
```
Service A → Publish Event → Redis Pub/Sub → Subscribe → Service B
```

**Event Schema**:
```typescript
interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  occurredAt: Date;
  userId: string;
  data: Record<string, any>;
  metadata: {
    correlationId: string;
    causationId: string;
    version: number;
  };
}
```

### 5. CQRS (Command Query Responsibility Segregation)

**Command Side** (Write):
- Validates business rules
- Persists state changes
- Publishes domain events

**Query Side** (Read):
- Optimized read models
- Denormalized data
- Fast queries

**Example**:
```typescript
// Command: CreateBlueprint
class CreateBlueprintCommand {
  constructor(
    public readonly name: string,
    public readonly provider: string,
    public readonly resources: Resource[]
  ) {}
}

// Query: GetBlueprintById
class GetBlueprintByIdQuery {
  constructor(public readonly id: string) {}
}
```

### 6. Circuit Breaker Pattern

**States**:
- **Closed**: Normal operation, requests pass through
- **Open**: Threshold exceeded, requests fail fast
- **Half-Open**: Test recovery, limited requests

**Configuration**:
```typescript
const breaker = new CircuitBreaker(callService, {
  timeout: 3000,           // Request timeout
  errorThresholdPercentage: 50,  // 50% errors to open
  resetTimeout: 30000,     // Try recovery after 30s
  rollingCountTimeout: 10000,    // Rolling window
  rollingCountBuckets: 10        // Bucket granularity
});
```

### 7. Saga Pattern (Orchestration)

**Example: Deployment Saga**:
```typescript
class DeploymentSaga {
  async execute(blueprint: Blueprint) {
    // Step 1: Validate
    const validation = await this.guardrailsService.validate(blueprint);
    if (!validation.passed) {
      throw new ValidationError();
    }

    // Step 2: Estimate Cost
    const cost = await this.costingService.estimate(blueprint);
    if (cost > budget) {
      throw new BudgetExceededError();
    }

    // Step 3: Generate Code
    const code = await this.iacGeneratorService.generate(blueprint);

    // Step 4: Deploy
    try {
      const deployment = await this.orchestratorService.deploy(code);
      return deployment;
    } catch (error) {
      // Compensating transaction: rollback
      await this.orchestratorService.rollback(deployment.id);
      throw error;
    }
  }
}
```

### 8. Repository Pattern

**Interface**:
```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(criteria?: Criteria): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implementation
class BlueprintRepository implements IRepository<Blueprint> {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Blueprint | null> {
    const row = await this.db.query('SELECT * FROM blueprints WHERE id = $1', [id]);
    return row ? this.mapToDomain(row) : null;
  }

  // ... other methods
}
```

**Benefits**:
- Data access abstraction
- Testability with mocks
- Separation of concerns

---

## Component Details

### Presentation Layer

#### Web Frontend Architecture

**Component Structure**:
```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Buttons, inputs, modals
│   │   ├── layout/       # Header, sidebar, footer
│   │   └── features/     # Feature-specific components
│   ├── pages/            # Route pages
│   │   ├── Dashboard/
│   │   ├── Blueprints/
│   │   ├── Deployments/
│   │   └── Monitoring/
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API client services
│   ├── store/            # Redux store
│   │   ├── slices/       # Redux Toolkit slices
│   │   └── api/          # RTK Query APIs
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── App.tsx           # Root component
```

**State Management**:
```typescript
// Redux Toolkit slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchBlueprints = createAsyncThunk(
  'blueprints/fetchAll',
  async (params: FetchParams) => {
    const response = await api.get('/api/blueprints', { params });
    return response.data;
  }
);

const blueprintsSlice = createSlice({
  name: 'blueprints',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Synchronous reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlueprints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlueprints.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBlueprints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
```

**API Client (RTK Query)**:
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getBlueprints: builder.query<Blueprint[], void>({
      query: () => '/blueprints',
    }),
    createBlueprint: builder.mutation<Blueprint, Partial<Blueprint>>({
      query: (blueprint) => ({
        url: '/blueprints',
        method: 'POST',
        body: blueprint,
      }),
    }),
  }),
});

export const { useGetBlueprintsQuery, useCreateBlueprintMutation } = api;
```

**Routing**:
```typescript
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/blueprints" element={<BlueprintList />} />
      <Route path="/blueprints/new" element={<BlueprintCreate />} />
      <Route path="/blueprints/:id" element={<BlueprintDetail />} />
      <Route path="/deployments" element={<DeploymentList />} />
      <Route path="/deployments/:id" element={<DeploymentDetail />} />
      <Route path="/monitoring" element={<Monitoring />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
```

#### CLI Tool Architecture

**Command Structure**:
```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('iac-dharma')
  .description('IAC Dharma CLI tool')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize new project')
  .option('-n, --name <name>', 'Project name')
  .option('-t, --template <template>', 'Template to use')
  .action(async (options) => {
    const spinner = ora('Initializing project...').start();
    try {
      await initProject(options);
      spinner.succeed('Project initialized!');
    } catch (error) {
      spinner.fail('Initialization failed');
      console.error(error.message);
    }
  });

program
  .command('start')
  .description('Start all services')
  .option('-p, --profile <profile>', 'Configuration profile')
  .action(async (options) => {
    await startServices(options);
  });

program.parse();
```

**Interactive Prompts**:
```typescript
import inquirer from 'inquirer';

async function initProject(options: any) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: options.name || 'my-iac-project',
      validate: (input) => input.length > 0 || 'Name is required',
    },
    {
      type: 'list',
      name: 'provider',
      message: 'Cloud provider:',
      choices: ['AWS', 'Azure', 'GCP', 'Multi-cloud'],
    },
    {
      type: 'confirm',
      name: 'enableMonitoring',
      message: 'Enable monitoring stack?',
      default: true,
    },
  ]);

  // Create project structure
  await createProjectStructure(answers);
}
```

### Gateway Layer

#### API Gateway Implementation

**Request Pipeline**:
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}));

// 3. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Compression
app.use(compression());

// 5. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health', // Skip health checks
});
app.use('/api', limiter);

// 6. Authentication middleware
app.use('/api', authenticate);

// 7. Request logging
app.use(requestLogger);

// 8. Distributed tracing
app.use(tracingMiddleware);

// 9. Routes
app.use('/api/blueprints', blueprintRoutes);
app.use('/api/deployments', deploymentRoutes);
// ... other routes

// 10. Error handling
app.use(errorHandler);

app.listen(3000);
```

**Authentication Middleware**:
```typescript
import jwt from 'jsonwebtoken';

async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Validate token in Redis (for revocation)
    const isValid = await redis.get(`token:${token}`);
    if (!isValid) {
      return res.status(401).json({ error: 'Token revoked' });
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

**Circuit Breaker**:
```typescript
import CircuitBreaker from 'opossum';

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
};

const breaker = new CircuitBreaker(callBlueprintService, options);

breaker.on('open', () => {
  console.log('Circuit breaker opened - using fallback');
});

breaker.on('halfOpen', () => {
  console.log('Circuit breaker half-open - testing recovery');
});

async function proxyRequest(req: Request, res: Response) {
  try {
    const result = await breaker.fire(req);
    res.json(result);
  } catch (error) {
    if (breaker.opened) {
      // Return cached response or default
      const cached = await redis.get(`cache:${req.url}`);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
    throw error;
  }
}
```

**Load Balancing**:
```typescript
class LoadBalancer {
  private services: ServiceInstance[];
  private currentIndex: number = 0;

  constructor(services: ServiceInstance[]) {
    this.services = services;
    this.startHealthChecks();
  }

  // Round-robin algorithm
  getNextService(): ServiceInstance {
    const healthyServices = this.services.filter(s => s.healthy);
    
    if (healthyServices.length === 0) {
      throw new Error('No healthy services available');
    }

    const service = healthyServices[this.currentIndex % healthyServices.length];
    this.currentIndex++;
    return service;
  }

  // Health check every 10 seconds
  private startHealthChecks() {
    setInterval(async () => {
      for (const service of this.services) {
        try {
          await axios.get(`${service.url}/health`, { timeout: 2000 });
          service.healthy = true;
        } catch (error) {
          service.healthy = false;
        }
      }
    }, 10000);
  }
}
```


### Core Services Layer

#### Blueprint Service (Port: 3001)

**Data Model**:
```typescript
interface Blueprint {
  id: string;
  name: string;
  version: string;  // Semantic versioning: v1.2.3
  provider: 'aws' | 'azure' | 'gcp';
  region: string;
  resources: Resource[];
  variables: Variable[];
  outputs: Output[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    description: string;
  };
}

interface Resource {
  type: string;  // e.g., "vpc", "subnet", "ec2_instance"
  name: string;
  properties: Record<string, any>;
  dependencies: string[];  // Resource names this depends on
}
```

**API Endpoints**:
- `GET /blueprints` - List all blueprints (paginated)
- `GET /blueprints/:id` - Get blueprint by ID
- `POST /blueprints` - Create new blueprint
- `PUT /blueprints/:id` - Update blueprint
- `DELETE /blueprints/:id` - Delete blueprint
- `POST /blueprints/:id/clone` - Clone blueprint
- `GET /blueprints/:id/versions` - Get version history
- `POST /blueprints/import` - Import from JSON/YAML
- `GET /blueprints/:id/export` - Export to JSON/YAML

**Versioning Strategy**:
```typescript
class BlueprintVersioning {
  async createVersion(blueprint: Blueprint): Promise<string> {
    const currentVersion = semver.parse(blueprint.version);
    const newVersion = semver.inc(currentVersion, 'minor');
    
    // Store version in separate table
    await this.db.query(`
      INSERT INTO blueprint_versions (blueprint_id, version, content, created_at)
      VALUES ($1, $2, $3, NOW())
    `, [blueprint.id, newVersion, JSON.stringify(blueprint)]);
    
    return newVersion;
  }
  
  async getVersion(id: string, version: string): Promise<Blueprint> {
    const row = await this.db.query(`
      SELECT content FROM blueprint_versions 
      WHERE blueprint_id = $1 AND version = $2
    `, [id, version]);
    
    return JSON.parse(row.content);
  }
}
```

#### IAC Generator Service (Port: 3002)

**Generation Pipeline**:
```typescript
class IACGenerator {
  async generate(blueprint: Blueprint, format: string): Promise<string> {
    // 1. Validate blueprint
    await this.validator.validate(blueprint);
    
    // 2. Select generator strategy
    const generator = this.getGenerator(format, blueprint.provider);
    
    // 3. Generate code
    const code = await generator.generate(blueprint);
    
    // 4. Format code
    const formatted = await this.formatter.format(code, format);
    
    // 5. Run static analysis
    const analysis = await this.analyzer.analyze(formatted);
    if (analysis.hasErrors) {
      throw new CodeGenerationError(analysis.errors);
    }
    
    // 6. Store in S3
    await this.storage.save(blueprint.id, formatted);
    
    return formatted;
  }
}
```

**Terraform Generator**:
```typescript
class TerraformGenerator implements IACGeneratorStrategy {
  generate(blueprint: Blueprint): string {
    const resources = blueprint.resources
      .map(r => this.generateResource(r))
      .join('\n\n');
    
    const variables = blueprint.variables
      .map(v => this.generateVariable(v))
      .join('\n\n');
    
    const outputs = blueprint.outputs
      .map(o => this.generateOutput(o))
      .join('\n\n');
    
    return `
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    ${this.generateProviderConfig(blueprint.provider)}
  }
  
  backend "s3" {
    bucket = "iac-dharma-state-${blueprint.id}"
    key    = "terraform.tfstate"
    region = "${blueprint.region}"
  }
}

provider "${this.getProviderName(blueprint.provider)}" {
  region = "${blueprint.region}"
}

${variables}

${resources}

${outputs}
    `.trim();
  }
  
  private generateResource(resource: Resource): string {
    const props = Object.entries(resource.properties)
      .map(([key, value]) => `  ${key} = ${this.formatValue(value)}`)
      .join('\n');
    
    return `
resource "${resource.type}" "${resource.name}" {
${props}
}
    `.trim();
  }
}
```

**CloudFormation Generator**:
```typescript
class CloudFormationGenerator implements IACGeneratorStrategy {
  generate(blueprint: Blueprint): string {
    const resources = {};
    
    for (const resource of blueprint.resources) {
      resources[resource.name] = {
        Type: this.getCFResourceType(resource.type),
        Properties: this.transformProperties(resource.properties),
      };
      
      if (resource.dependencies.length > 0) {
        resources[resource.name].DependsOn = resource.dependencies;
      }
    }
    
    return JSON.stringify({
      AWSTemplateFormatVersion: '2010-09-09',
      Description: blueprint.metadata.description,
      Parameters: this.generateParameters(blueprint.variables),
      Resources: resources,
      Outputs: this.generateOutputs(blueprint.outputs),
    }, null, 2);
  }
}
```

#### Guardrails Engine (Port: 3003)

**OPA Policy Example**:
```rego
package terraform.security

import future.keywords.contains
import future.keywords.if

# Deny S3 buckets without encryption
deny[msg] {
  resource := input.resource_changes[_]
  resource.type == "aws_s3_bucket"
  not has_encryption(resource)
  
  msg := sprintf(
    "S3 bucket '%s' must have server-side encryption enabled",
    [resource.address]
  )
}

has_encryption(resource) {
  resource.change.after.server_side_encryption_configuration
}

# Deny publicly accessible RDS instances
deny[msg] {
  resource := input.resource_changes[_]
  resource.type == "aws_db_instance"
  resource.change.after.publicly_accessible == true
  
  msg := sprintf(
    "RDS instance '%s' must not be publicly accessible",
    [resource.address]
  )
}

# Warn about untagged resources
warn[msg] {
  resource := input.resource_changes[_]
  requires_tags(resource.type)
  not has_required_tags(resource)
  
  msg := sprintf(
    "Resource '%s' is missing required tags: Environment, Owner, Cost Center",
    [resource.address]
  )
}

requires_tags(type) {
  taggable_types := [
    "aws_instance",
    "aws_s3_bucket",
    "aws_rds_cluster",
    "aws_vpc",
  ]
  type == taggable_types[_]
}

has_required_tags(resource) {
  tags := resource.change.after.tags
  tags.Environment
  tags.Owner
  tags["Cost Center"]
}
```

**Policy Validation Service**:
```typescript
class GuardrailsService {
  async validate(blueprint: Blueprint): Promise<ValidationResult> {
    // 1. Generate Terraform plan
    const plan = await this.iacGenerator.generatePlan(blueprint);
    
    // 2. Convert to OPA input format
    const opaInput = {
      resource_changes: plan.resource_changes,
    };
    
    // 3. Evaluate policies
    const result = await this.opa.evaluate({
      input: opaInput,
      query: 'data.terraform',
    });
    
    // 4. Parse results
    return {
      passed: result.deny.length === 0,
      checks: {
        security: this.countByType(result, 'security'),
        compliance: this.countByType(result, 'compliance'),
        bestPractices: this.countByType(result, 'best_practices'),
      },
      violations: result.deny,
      warnings: result.warn,
    };
  }
}
```

#### Costing Service (Port: 3004)

**Price Data Sources**:
```typescript
class PricingService {
  private providers: Map<string, PricingProvider>;
  
  constructor() {
    this.providers = new Map([
      ['aws', new AWSPricingProvider()],
      ['azure', new AzurePricingProvider()],
      ['gcp', new GCPPricingProvider()],
    ]);
  }
  
  async getPrice(
    provider: string,
    resourceType: string,
    region: string,
    specs: ResourceSpecs
  ): Promise<PriceInfo> {
    const pricingProvider = this.providers.get(provider);
    if (!pricingProvider) {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    
    // Check cache first
    const cacheKey = `price:${provider}:${resourceType}:${region}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch from API
    const price = await pricingProvider.getPrice(resourceType, region, specs);
    
    // Cache for 1 hour
    await this.cache.set(cacheKey, JSON.stringify(price), 'EX', 3600);
    
    return price;
  }
}
```

**Cost Estimation Algorithm**:
```typescript
class CostEstimator {
  async estimate(blueprint: Blueprint): Promise<CostEstimate> {
    const breakdown: ResourceCost[] = [];
    let totalMonthlyCost = 0;
    
    for (const resource of blueprint.resources) {
      const price = await this.pricingService.getPrice(
        blueprint.provider,
        resource.type,
        blueprint.region,
        resource.properties
      );
      
      const quantity = this.getQuantity(resource);
      const monthlyCost = price.hourlyRate * 730 * quantity;  // 730 hours/month
      
      breakdown.push({
        resourceType: resource.type,
        resourceName: resource.name,
        quantity,
        unitPrice: price.hourlyRate,
        monthlyCost,
        details: price.details,
      });
      
      totalMonthlyCost += monthlyCost;
    }
    
    // Get optimization recommendations
    const optimizations = await this.getOptimizations(breakdown);
    const potentialSavings = optimizations.reduce((sum, opt) => sum + opt.savings, 0);
    
    return {
      totalMonthlyCost,
      breakdown,
      optimizations,
      potentialSavings,
      confidence: this.calculateConfidence(breakdown),
    };
  }
  
  private async getOptimizations(breakdown: ResourceCost[]): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];
    
    for (const resource of breakdown) {
      // Check for right-sizing opportunities
      if (resource.resourceType.includes('instance')) {
        const recommendation = await this.ai.recommendInstanceSize(resource);
        if (recommendation.savings > 0) {
          optimizations.push(recommendation);
        }
      }
      
      // Check for reserved instance opportunities
      if (resource.monthlyCost > 100) {
        const riSavings = resource.monthlyCost * 0.3;  // ~30% savings with RI
        optimizations.push({
          type: 'reserved_instance',
          resource: resource.resourceName,
          savings: riSavings,
          description: 'Consider reserved instance for long-running resources',
        });
      }
    }
    
    return optimizations;
  }
}
```

#### Orchestrator Service (Port: 3005)

**Deployment State Machine**:
```typescript
enum DeploymentStatus {
  QUEUED = 'queued',
  VALIDATING = 'validating',
  PLANNING = 'planning',
  APPROVED = 'approved',
  APPLYING = 'applying',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

class DeploymentOrchestrator {
  async deploy(blueprintId: string, options: DeployOptions): Promise<Deployment> {
    const deployment = await this.createDeployment(blueprintId, options);
    
    try {
      // State: QUEUED → VALIDATING
      await this.updateStatus(deployment.id, DeploymentStatus.VALIDATING);
      const validation = await this.guardrails.validate(blueprintId);
      if (!validation.passed) {
        throw new ValidationError(validation.violations);
      }
      
      // State: VALIDATING → PLANNING
      await this.updateStatus(deployment.id, DeploymentStatus.PLANNING);
      const plan = await this.iacGenerator.generatePlan(blueprintId);
      
      // Require approval for production
      if (options.environment === 'production' && !options.autoApply) {
        await this.updateStatus(deployment.id, DeploymentStatus.APPROVED);
        await this.requestApproval(deployment.id);
        await this.waitForApproval(deployment.id);
      }
      
      // State: PLANNING/APPROVED → APPLYING
      await this.updateStatus(deployment.id, DeploymentStatus.APPLYING);
      const result = await this.terraformExecutor.apply(plan);
      
      // State: APPLYING → COMPLETED
      await this.updateStatus(deployment.id, DeploymentStatus.COMPLETED);
      await this.saveOutputs(deployment.id, result.outputs);
      
      // Send notifications
      await this.notificationService.send({
        type: 'deployment_completed',
        deployment,
        result,
      });
      
      return deployment;
    } catch (error) {
      await this.updateStatus(deployment.id, DeploymentStatus.FAILED);
      
      if (options.rollbackOnFailure) {
        await this.rollback(deployment.id);
      }
      
      throw error;
    }
  }
  
  async rollback(deploymentId: string): Promise<void> {
    const deployment = await this.getDeployment(deploymentId);
    const previousState = await this.getPreviousState(deploymentId);
    
    if (!previousState) {
      throw new Error('No previous state found for rollback');
    }
    
    await this.updateStatus(deploymentId, 'rolling_back');
    await this.terraformExecutor.apply(previousState);
    await this.updateStatus(deploymentId, DeploymentStatus.ROLLED_BACK);
  }
}
```

**Terraform Executor**:
```typescript
class TerraformExecutor {
  async apply(plan: TerraformPlan): Promise<TerraformResult> {
    const workdir = await this.createWorkdir(plan.id);
    
    try {
      // Write Terraform files
      await fs.writeFile(`${workdir}/main.tf`, plan.code);
      await fs.writeFile(`${workdir}/variables.tfvars`, plan.variables);
      
      // Initialize
      await this.exec('terraform init', workdir);
      
      // Plan
      const planResult = await this.exec('terraform plan -out=tfplan', workdir);
      
      // Apply
      const applyResult = await this.exec('terraform apply tfplan', workdir);
      
      // Get outputs
      const outputs = await this.exec('terraform output -json', workdir);
      
      return {
        success: true,
        outputs: JSON.parse(outputs),
        resourcesCreated: this.parseResourceCount(applyResult),
      };
    } finally {
      await this.cleanup(workdir);
    }
  }
  
  private async exec(command: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`${error.message}\n${stderr}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }
}
```

---

## Data Flow

### Deployment Flow (End-to-End)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT REQUEST FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

1. USER ACTION
   │
   └──> POST /api/deployments
        {
          "blueprintId": "bp_123",
          "environment": "production",
          "autoApply": false
        }

2. API GATEWAY
   │
   ├──> Authenticate (JWT)
   ├──> Authorize (RBAC)
   ├──> Rate Limit Check
   ├──> Request Validation
   └──> Route to Orchestrator

3. ORCHESTRATOR SERVICE
   │
   ├──> Create Deployment Record (PostgreSQL)
   ├──> Publish Event: DeploymentStarted
   │
   ├──> STEP 1: Validate Blueprint
   │    │
   │    └──> Call Guardrails Service
   │         ├──> Generate Terraform Plan
   │         ├──> Run OPA Policies
   │         └──> Return Validation Result
   │
   ├──> STEP 2: Estimate Cost
   │    │
   │    └──> Call Costing Service
   │         ├──> Fetch Pricing Data (cached)
   │         ├──> Calculate Monthly Cost
   │         └──> Return Estimate
   │
   ├──> STEP 3: Get AI Recommendations
   │    │
   │    └──> Call AI Engine
   │         ├──> Load ML Models
   │         ├──> Run Inference
   │         └──> Return Recommendations
   │
   ├──> STEP 4: Generate IaC Code
   │    │
   │    └──> Call IAC Generator
   │         ├──> Select Generator (Terraform/CF/ARM)
   │         ├──> Generate Code
   │         ├──> Format & Validate
   │         └──> Store in S3
   │
   ├──> STEP 5: Approval (if production)
   │    │
   │    ├──> Send Approval Request
   │    ├──> Wait for Approval
   │    └──> Continue or Cancel
   │
   └──> STEP 6: Execute Deployment
        │
        ├──> terraform init
        ├──> terraform plan
        ├──> terraform apply
        │
        ├──> Stream Logs (WebSocket)
        ├──> Update Status (Redis Pub/Sub)
        │
        └──> Save Result
             ├──> Store State (S3)
             ├──> Update Database
             ├──> Send Notifications
             └──> Publish Event: DeploymentCompleted

4. MONITORING SERVICE
   │
   ├──> Collect Metrics
   │    ├──> Deployment Duration
   │    ├──> Success/Failure Rate
   │    └──> Resource Count
   │
   └──> Update Dashboards (Grafana)

5. NOTIFICATION
   │
   ├──> Slack Webhook
   ├──> Email (SMTP)
   └──> In-App Notification
```

### Data Flow Patterns

#### Read Flow (Query)

```
User Request → API Gateway → Service → Cache (Redis)
                                ↓ (miss)
                              Database (PostgreSQL)
                                ↓ (store)
                              Cache
                                ↓
                              Response
```

#### Write Flow (Command)

```
User Request → API Gateway → Service → Validate
                                ↓
                              Database (Write)
                                ↓
                              Clear Cache
                                ↓
                              Publish Event (Redis Pub/Sub)
                                ↓
                              Response
```

#### Event Flow

```
Service A → Publish Event → Redis Pub/Sub → Broadcast → Service B
                                                      → Service C
                                                      → Service D
```

---

## Communication Patterns

### 1. Synchronous Communication (HTTP/REST)

**Request-Response Pattern**:
```typescript
// Client
const response = await axios.post('/api/blueprints', {
  name: 'My Blueprint',
  provider: 'aws',
});

// Server
app.post('/api/blueprints', async (req, res) => {
  try {
    const blueprint = await blueprintService.create(req.body);
    res.status(201).json(blueprint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

**Pros**: Simple, easy debugging, immediate response
**Cons**: Tight coupling, service availability dependency
**Use Case**: CRUD operations, queries

### 2. Asynchronous Communication (Message Queue)

**Event Publishing**:
```typescript
// Publisher
await redis.publish('deployment.started', JSON.stringify({
  deploymentId: 'dep_123',
  blueprintId: 'bp_456',
  timestamp: new Date(),
}));

// Subscriber
redis.subscribe('deployment.started', async (message) => {
  const event = JSON.parse(message);
  await handleDeploymentStarted(event);
});
```

**Pros**: Loose coupling, resilient to service failures
**Cons**: Eventual consistency, complex debugging
**Use Case**: Event notifications, background processing

### 3. Real-Time Communication (WebSocket)

**Log Streaming**:
```typescript
// Server
io.on('connection', (socket) => {
  socket.on('subscribe:logs', (deploymentId) => {
    const logStream = getLogStream(deploymentId);
    
    logStream.on('data', (log) => {
      socket.emit('log', log);
    });
  });
});

// Client
socket.on('log', (log) => {
  console.log(log);
});
```

**Pros**: Low latency, bidirectional
**Cons**: Connection management, scalability
**Use Case**: Real-time updates, live logs, notifications

### 4. RPC Communication (gRPC)

**Service-to-Service**:
```protobuf
// blueprint.proto
service BlueprintService {
  rpc GetBlueprint (GetBlueprintRequest) returns (Blueprint);
  rpc ListBlueprints (ListBlueprintsRequest) returns (BlueprintList);
  rpc CreateBlueprint (CreateBlueprintRequest) returns (Blueprint);
}

message Blueprint {
  string id = 1;
  string name = 2;
  string version = 3;
  string provider = 4;
}
```

```typescript
// Client
const client = new BlueprintServiceClient('blueprint-service:50051');
const blueprint = await client.GetBlueprint({ id: 'bp_123' });
```

**Pros**: High performance, type safety, streaming
**Cons**: Complexity, HTTP/2 requirement
**Use Case**: Internal service communication, high throughput

---

## Design Patterns

### 1. Repository Pattern

**Abstraction**:
```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(criteria?: any): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

**Implementation**:
```typescript
class BlueprintRepository implements IRepository<Blueprint> {
  constructor(private db: Pool) {}
  
  async findById(id: string): Promise<Blueprint | null> {
    const result = await this.db.query(
      'SELECT * FROM blueprints WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this.mapToDomain(result.rows[0]) : null;
  }
  
  private mapToDomain(row: any): Blueprint {
    return {
      id: row.id,
      name: row.name,
      version: row.version,
      provider: row.provider,
      resources: JSON.parse(row.resources),
      metadata: JSON.parse(row.metadata),
    };
  }
}
```

### 2. Factory Pattern

**IAC Generator Factory**:
```typescript
interface IACGeneratorStrategy {
  generate(blueprint: Blueprint): string;
}

class IACGeneratorFactory {
  create(format: string, provider: string): IACGeneratorStrategy {
    const key = `${format}_${provider}`;
    
    switch (key) {
      case 'terraform_aws':
        return new TerraformAWSGenerator();
      case 'terraform_azure':
        return new TerraformAzureGenerator();
      case 'cloudformation_aws':
        return new CloudFormationGenerator();
      case 'arm_azure':
        return new ARMTemplateGenerator();
      default:
        throw new Error(`Unsupported combination: ${format} + ${provider}`);
    }
  }
}
```

### 3. Strategy Pattern

**Pricing Strategy**:
```typescript
interface PricingStrategy {
  calculateCost(resource: Resource): number;
}

class OnDemandPricing implements PricingStrategy {
  calculateCost(resource: Resource): number {
    return resource.hourlyRate * 730;  // Monthly hours
  }
}

class ReservedInstancePricing implements PricingStrategy {
  calculateCost(resource: Resource): number {
    const upfront = resource.riUpfront / 12;  // Monthly amortization
    const hourly = resource.riHourlyRate * 730;
    return upfront + hourly;
  }
}

class CostCalculator {
  constructor(private strategy: PricingStrategy) {}
  
  calculate(resource: Resource): number {
    return this.strategy.calculateCost(resource);
  }
}
```

### 4. Observer Pattern

**Event System**:
```typescript
interface Observer {
  update(event: DomainEvent): void;
}

class EventPublisher {
  private observers: Observer[] = [];
  
  subscribe(observer: Observer): void {
    this.observers.push(observer);
  }
  
  notify(event: DomainEvent): void {
    for (const observer of this.observers) {
      observer.update(event);
    }
  }
}

// Usage
class DeploymentNotifier implements Observer {
  update(event: DomainEvent): void {
    if (event.eventType === 'DeploymentCompleted') {
      this.sendNotification(event.data);
    }
  }
}
```

### 5. Circuit Breaker Pattern

**Implementation**:
```typescript
enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: Date | null = null;
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }
  
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    
    const elapsed = Date.now() - this.lastFailureTime.getTime();
    return elapsed >= this.resetTimeout;
  }
}
```


---

## Security Architecture

### 1. Authentication & Authorization

**Multi-Layer Security**:
```
Layer 1: TLS/SSL (Transport)
   ↓
Layer 2: JWT Authentication (Identity)
   ↓
Layer 3: RBAC Authorization (Access Control)
   ↓
Layer 4: Resource-Level Permissions (Fine-grained)
```

**JWT Token Structure**:
```typescript
interface JWTPayload {
  sub: string;              // User ID
  email: string;            // User email
  role: string;             // User role (admin, developer, viewer)
  permissions: string[];    // Fine-grained permissions
  tenantId: string;         // Multi-tenancy support
  iat: number;              // Issued at timestamp
  exp: number;              // Expiration timestamp
}

// Token generation
function generateToken(user: User): string {
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    tenantId: user.tenantId,
    iat: Date.now() / 1000,
    exp: Date.now() / 1000 + 3600,  // 1 hour
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'RS256',  // Asymmetric encryption
  });
}
```

**RBAC Implementation**:
```typescript
enum Role {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
}

const permissions = {
  [Role.ADMIN]: [
    'blueprint:*',
    'deployment:*',
    'user:*',
    'settings:*',
  ],
  [Role.DEVELOPER]: [
    'blueprint:read',
    'blueprint:create',
    'blueprint:update',
    'deployment:read',
    'deployment:create',
  ],
  [Role.VIEWER]: [
    'blueprint:read',
    'deployment:read',
  ],
};

function authorize(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const userPermissions = permissions[user.role];
    
    const hasPermission = userPermissions.some(perm => {
      if (perm.endsWith(':*')) {
        return requiredPermission.startsWith(perm.split(':')[0]);
      }
      return perm === requiredPermission;
    });
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
}

// Usage
app.post('/api/blueprints', 
  authenticate,
  authorize('blueprint:create'),
  createBlueprint
);
```

### 2. Data Security

**Encryption at Rest**:
```typescript
// Database encryption (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT,  -- Encrypted JSON
  encryption_key_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Encrypt data
INSERT INTO blueprints (name, content, encryption_key_id)
VALUES (
  'My Blueprint',
  pgp_sym_encrypt('{"resources": [...]}', 'encryption-key'),
  'key-v1'
);

-- Decrypt data
SELECT 
  id,
  name,
  pgp_sym_decrypt(content::bytea, 'encryption-key') as content
FROM blueprints;
```

**Encryption in Transit**:
- TLS 1.3 for all HTTP communications
- Certificate pinning for mobile apps
- mTLS for service-to-service communication

**Secrets Management**:
```typescript
// Using AWS Secrets Manager
class SecretsManager {
  private client: SecretsManagerClient;
  private cache: Map<string, { value: string; expiry: number }>;
  
  async getSecret(secretName: string): Promise<string> {
    // Check cache
    const cached = this.cache.get(secretName);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }
    
    // Fetch from AWS
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await this.client.send(command);
    const value = response.SecretString;
    
    // Cache for 5 minutes
    this.cache.set(secretName, {
      value,
      expiry: Date.now() + 300000,
    });
    
    return value;
  }
  
  async rotateSecret(secretName: string): Promise<void> {
    const newValue = crypto.randomBytes(32).toString('hex');
    
    const command = new PutSecretValueCommand({
      SecretId: secretName,
      SecretString: newValue,
    });
    
    await this.client.send(command);
    this.cache.delete(secretName);
  }
}
```

### 3. Network Security

**Security Groups & Firewalls**:
```yaml
# Kubernetes NetworkPolicy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
  namespace: iac-dharma
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              tier: backend
      ports:
        - protocol: TCP
          port: 3001  # Blueprint Service
        - protocol: TCP
          port: 3002  # IAC Generator
```

**API Rate Limiting**:
```typescript
// Redis-based distributed rate limiter
class RateLimiter {
  async checkLimit(key: string, limit: number, window: number): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - window;
    
    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);
    
    // Count requests in current window
    const count = await this.redis.zcard(key);
    
    if (count >= limit) {
      return false;  // Rate limit exceeded
    }
    
    // Add current request
    await this.redis.zadd(key, now, `${now}-${Math.random()}`);
    await this.redis.expire(key, Math.ceil(window / 1000));
    
    return true;
  }
}

// Middleware
async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = `rate-limit:${req.ip}`;
  const allowed = await rateLimiter.checkLimit(key, 1000, 900000);  // 1000 req/15min
  
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  next();
}
```

### 4. Input Validation & Sanitization

**Request Validation**:
```typescript
import { z } from 'zod';

// Schema definition
const BlueprintSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Name can only contain alphanumeric characters, dashes, and underscores'),
  provider: z.enum(['aws', 'azure', 'gcp']),
  region: z.string().min(1),
  resources: z.array(z.object({
    type: z.string(),
    name: z.string(),
    properties: z.record(z.any()),
  })).min(1, 'At least one resource is required'),
});

// Validation middleware
function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
}

// Usage
app.post('/api/blueprints',
  authenticate,
  authorize('blueprint:create'),
  validateRequest(BlueprintSchema),
  createBlueprint
);
```

### 5. Audit Logging

**Comprehensive Audit Trail**:
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: {
    before: any;
    after: any;
  };
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

class AuditLogger {
  async log(entry: AuditLog): Promise<void> {
    // Write to database
    await this.db.query(`
      INSERT INTO audit_logs (
        id, timestamp, user_id, action, resource, resource_id,
        changes, ip_address, user_agent, success, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      entry.id,
      entry.timestamp,
      entry.userId,
      entry.action,
      entry.resource,
      entry.resourceId,
      JSON.stringify(entry.changes),
      entry.ipAddress,
      entry.userAgent,
      entry.success,
      entry.errorMessage,
    ]);
    
    // Send to Elasticsearch for searching
    await this.elasticsearch.index({
      index: 'audit-logs',
      document: entry,
    });
    
    // Alert on sensitive actions
    if (this.isSensitiveAction(entry.action)) {
      await this.alerting.send({
        severity: 'high',
        message: `Sensitive action performed: ${entry.action}`,
        details: entry,
      });
    }
  }
  
  private isSensitiveAction(action: string): boolean {
    return [
      'user:delete',
      'blueprint:delete',
      'deployment:rollback',
      'settings:update',
    ].includes(action);
  }
}
```

---

## Scalability & Performance

### Horizontal Scaling

**Stateless Services**:
```yaml
# Kubernetes Deployment with HPA
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blueprint-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blueprint-service
  template:
    metadata:
      labels:
        app: blueprint-service
    spec:
      containers:
        - name: blueprint-service
          image: iac-dharma/blueprint-service:v1.0.0
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: blueprint-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: blueprint-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Caching Strategy

**Multi-Level Caching**:
```typescript
// L1: In-Memory Cache (Node.js)
class MemoryCache {
  private cache: Map<string, { value: any; expiry: number }>;
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  set(key: string, value: any, ttl: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }
}

// L2: Redis Cache (Distributed)
class CacheService {
  private l1: MemoryCache;
  private l2: Redis;
  
  async get(key: string): Promise<any | null> {
    // Try L1 first
    let value = this.l1.get(key);
    if (value) {
      return value;
    }
    
    // Try L2
    const cached = await this.l2.get(key);
    if (cached) {
      value = JSON.parse(cached);
      // Populate L1
      this.l1.set(key, value, 60000);  // 1 minute
      return value;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl: number): Promise<void> {
    // Set in both caches
    this.l1.set(key, value, Math.min(ttl, 60000));
    await this.l2.set(key, JSON.stringify(value), 'EX', Math.floor(ttl / 1000));
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Clear L1
    this.l1.clear();
    
    // Clear L2
    const keys = await this.l2.keys(pattern);
    if (keys.length > 0) {
      await this.l2.del(...keys);
    }
  }
}
```

### Database Optimization

**Connection Pooling**:
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,              // Maximum pool size
  min: 5,               // Minimum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Query with connection pooling
async function query(sql: string, params: any[]): Promise<any> {
  const start = Date.now();
  const result = await pool.query(sql, params);
  const duration = Date.now() - start;
  
  // Log slow queries
  if (duration > 1000) {
    logger.warn('Slow query detected', {
      sql,
      duration,
      rowCount: result.rowCount,
    });
  }
  
  return result;
}
```

**Query Optimization**:
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX idx_blueprints_provider ON blueprints(provider);
CREATE INDEX idx_blueprints_created_at ON blueprints(created_at DESC);
CREATE INDEX idx_deployments_blueprint_id ON deployments(blueprint_id);
CREATE INDEX idx_deployments_status ON deployments(status);

-- Composite index for common query patterns
CREATE INDEX idx_blueprints_user_provider ON blueprints(user_id, provider);

-- Partial index for active deployments
CREATE INDEX idx_deployments_active ON deployments(status, created_at)
WHERE status IN ('queued', 'validating', 'planning', 'applying');

-- GIN index for JSON columns
CREATE INDEX idx_blueprints_resources_gin ON blueprints USING gin(resources);

-- Full-text search index
CREATE INDEX idx_blueprints_search ON blueprints USING gin(
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);
```

---

## Reliability & Resilience

### High Availability

**Multi-Region Deployment**:
```
Primary Region (us-east-1)          Secondary Region (us-west-2)
┌─────────────────────┐            ┌─────────────────────┐
│   Load Balancer     │            │   Load Balancer     │
│         ↓           │            │         ↓           │
│   API Gateway (x3)  │  ←→        │   API Gateway (x3)  │
│         ↓           │  Sync      │         ↓           │
│   Services (x3)     │            │   Services (x3)     │
│         ↓           │            │         ↓           │
│   PostgreSQL        │  ─────→    │   PostgreSQL        │
│   (Primary)         │  Replica   │   (Replica)         │
└─────────────────────┘            └─────────────────────┘
```

**Database Replication**:
```yaml
# PostgreSQL Replication Configuration
# Primary (Master)
wal_level = replica
max_wal_senders = 5
wal_keep_size = 1GB
synchronous_commit = on
synchronous_standby_names = 'standby1'

# Standby (Replica)
primary_conninfo = 'host=primary-db port=5432 user=replicator password=secret'
primary_slot_name = 'standby1'
hot_standby = on
```

### Fault Tolerance

**Retry Logic with Exponential Backoff**:
```typescript
class RetryPolicy {
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Skip retry for non-retriable errors
        if (!this.isRetriable(error)) {
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = initialDelay * Math.pow(2, attempt);
        const jitter = Math.random() * delay * 0.1;
        await this.sleep(delay + jitter);
        
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
          error: error.message,
        });
      }
    }
    
    throw lastError;
  }
  
  private isRetriable(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx errors
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      (error.status >= 500 && error.status < 600)
    );
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**Health Checks**:
```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkS3(),
    checkDiskSpace(),
  ]);
  
  const allHealthy = checks.every(c => c.status === 'fulfilled');
  const status = allHealthy ? 'healthy' : 'unhealthy';
  
  res.status(allHealthy ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      redis: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      s3: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      disk: checks[3].status === 'fulfilled' ? 'healthy' : 'unhealthy',
    },
  });
});

async function checkDatabase(): Promise<void> {
  const result = await pool.query('SELECT 1');
  if (!result) throw new Error('Database check failed');
}

async function checkRedis(): Promise<void> {
  await redis.ping();
}
```

---

## Data Architecture

### PostgreSQL Schema

**Core Tables**:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Blueprints table
CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT 'v1.0.0',
  provider VARCHAR(20) NOT NULL,
  region VARCHAR(50) NOT NULL,
  resources JSONB NOT NULL,
  variables JSONB DEFAULT '[]',
  outputs JSONB DEFAULT '[]',
  user_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT blueprints_provider_check CHECK (provider IN ('aws', 'azure', 'gcp'))
);

-- Blueprint versions table
CREATE TABLE blueprint_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  content JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blueprint_id, version)
);

-- Deployments table
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL REFERENCES blueprints(id),
  environment VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  terraform_state_url TEXT,
  outputs JSONB,
  error_message TEXT,
  user_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  CONSTRAINT deployments_status_check CHECK (
    status IN ('queued', 'validating', 'planning', 'approved', 
               'applying', 'completed', 'failed', 'rolled_back')
  )
);

-- Cost estimates table
CREATE TABLE cost_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL REFERENCES blueprints(id),
  total_monthly_cost DECIMAL(10, 2) NOT NULL,
  breakdown JSONB NOT NULL,
  confidence DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT
);
```

### Data Relationships

```
users (1) ────────── (N) blueprints
                           │
                           │ (1)
                           │
                           ├── (N) blueprint_versions
                           │
                           ├── (N) deployments
                           │
                           └── (N) cost_estimates
```

---

## Deployment Architecture

### Container Orchestration

**Kubernetes Deployment Topology**:
```
┌────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  INGRESS LAYER                        │  │
│  │  - Nginx Ingress Controller                           │  │
│  │  - TLS Termination                                    │  │
│  │  - Rate Limiting                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  APPLICATION LAYER                    │  │
│  │                                                        │  │
│  │  API Gateway (3 replicas)                            │  │
│  │  ├─ Blueprint Service (3 replicas)                   │  │
│  │  ├─ IAC Generator (3 replicas)                       │  │
│  │  ├─ Guardrails Engine (3 replicas)                   │  │
│  │  ├─ Costing Service (3 replicas)                     │  │
│  │  ├─ Orchestrator (3 replicas)                        │  │
│  │  └─ ... (other services)                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   DATA LAYER                          │  │
│  │                                                        │  │
│  │  PostgreSQL (StatefulSet, 3 replicas)                │  │
│  │  Redis (StatefulSet, 3 replicas)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               OBSERVABILITY LAYER                     │  │
│  │                                                        │  │
│  │  Prometheus  │  Grafana  │  Jaeger  │  Loki          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Environment Strategy

```
Development → Staging → Production

Each environment has:
- Separate Kubernetes namespace
- Dedicated database
- Environment-specific secrets
- Resource quotas
- Network policies
```

---

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend** | React | 18.3.1 | UI framework |
| | TypeScript | 5.5.3 | Type safety |
| | Vite | 5.3.4 | Build tool |
| | Tailwind CSS | 3.4.6 | Styling |
| | Redux Toolkit | 2.2.6 | State management |
| **Backend** | Node.js | 20.x | Runtime |
| | Express | 4.19.2 | Web framework |
| | TypeScript | 5.5.3 | Type safety |
| **AI/ML** | Python | 3.11 | ML runtime |
| | FastAPI | 0.111.0 | API framework |
| | TensorFlow | 2.15.0 | ML framework |
| | PyTorch | 2.2.0 | ML framework |
| | Scikit-learn | 1.4.0 | ML algorithms |
| **Databases** | PostgreSQL | 16.3 | Primary database |
| | Redis | 7.2.5 | Cache & queue |
| **IaC Tools** | Terraform | 1.8.5 | IaC tool |
| | AWS CDK | 2.144.0 | IaC tool |
| | Pulumi | 3.118.0 | IaC tool |
| **Observability** | Prometheus | 2.53.0 | Metrics |
| | Grafana | 11.1.0 | Dashboards |
| | Jaeger | 1.58.0 | Tracing |
| | Loki | 3.0.0 | Logging |
| **Container** | Docker | 26.1.4 | Containerization |
| | Kubernetes | 1.30.2 | Orchestration |
| **Cloud** | AWS SDK | 3.600.0 | AWS integration |
| | Azure SDK | 1.27.0 | Azure integration |
| | GCP SDK | 14.19.0 | GCP integration |

---

## Best Practices

### 1. Service Design
- Keep services small and focused (single responsibility)
- Design for failure (circuit breakers, retries, timeouts)
- Implement comprehensive health checks
- Use semantic versioning for APIs
- Document APIs with OpenAPI specifications

### 2. Data Management
- Use database per service pattern
- Implement event-driven communication for data consistency
- Apply CQRS for read-heavy workloads
- Use optimistic locking for concurrent updates
- Implement soft deletes for audit trails

### 3. Security
- Apply defense in depth (multiple security layers)
- Use principle of least privilege
- Rotate credentials regularly
- Encrypt sensitive data at rest and in transit
- Implement comprehensive audit logging

### 4. Performance
- Cache aggressively (but invalidate correctly)
- Use connection pooling for databases
- Implement pagination for large datasets
- Optimize database queries with proper indexes
- Use CDN for static assets

### 5. Observability
- Log structured JSON with correlation IDs
- Expose Prometheus metrics for all services
- Implement distributed tracing
- Set up alerting for critical metrics
- Create runbooks for common issues

### 6. Testing
- Write unit tests for business logic (80%+ coverage)
- Implement integration tests for API contracts
- Use contract testing for service dependencies
- Perform load testing before production deployment
- Implement chaos engineering for resilience testing

### 7. Deployment
- Use infrastructure as code for all resources
- Implement blue-green or canary deployments
- Automate rollback procedures
- Use feature flags for gradual rollouts
- Maintain deployment runbooks

### 8. Development Workflow
- Follow Git Flow branching strategy
- Require code reviews for all changes
- Automate testing in CI/CD pipeline
- Use semantic commit messages
- Keep dependencies up to date

---

## Related Documentation

- [Deployment Guide](./Deployment-Guide.md) - Production deployment instructions
- [API Reference](./API-Reference.md) - Complete API documentation
- [Security Best Practices](./Security-Best-Practices.md) - Security guidelines
- [Performance Tuning](./Performance-Tuning.md) - Optimization strategies
- [Troubleshooting](./Troubleshooting.md) - Common issues and solutions

---

**Document Version**: 2.0  
**Last Updated**: 2024-06-15  
**Maintained By**: Platform Architecture Team
