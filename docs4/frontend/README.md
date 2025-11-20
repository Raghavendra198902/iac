# IAC DHARMA Frontend

Modern React 18 + TypeScript + Vite frontend for the Intelligent Infrastructure Design & Deployment Platform.

## Features

- 🤖 **AI-Powered Blueprint Designer**: Natural language to infrastructure conversion  
- 🛡️ **Risk Assessment Dashboard**: Multi-dimensional security & cost analysis  
- 💰 **Cost Management**: TCO calculation & ML-powered optimization  
- 📊 **Deployment Monitoring**: Real-time status tracking & drift detection  
- 📝 **Blueprint Management**: CRUD, versioning, approval workflows

## Tech Stack

- **React 18** - Latest React with concurrent features
- **TypeScript** - Full type safety
- **Vite** - Lightning-fast HMR and builds
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Axios** - HTTP client with interceptors
- **Lucide Icons** - Beautiful icons

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_AI_DESIGNER=true
VITE_ENABLE_RISK_ASSESSMENT=true
VITE_APP_NAME="IAC DHARMA"
```

## Project Structure

```
src/
├── components/layout/   # Layout components (AppLayout)
├── pages/              # Route pages
│   ├── Dashboard.tsx           # Main dashboard
│   ├── Login.tsx               # Authentication
│   ├── NLPDesigner.tsx         # AI blueprint generator
│   ├── BlueprintList.tsx       # Blueprint list & filters
│   ├── BlueprintDetail.tsx     # Blueprint details
│   ├── RiskDashboard.tsx       # Risk assessment
│   ├── CostDashboard.tsx       # Cost management
│   └── DeploymentMonitor.tsx   # Deployment tracking
├── services/api.ts     # API client methods
├── lib/apiClient.ts    # Axios HTTP client
├── types/index.ts      # TypeScript types
├── App.tsx            # Main app with routing
└── index.css          # Global styles
```

## Pages

### Dashboard (`/dashboard`)
- Key metrics: blueprints, deployments, risk score, monthly cost
- Quick actions: AI Designer, Blueprint Browser
- Recent activity

### AI Designer (`/designer`)
- Natural language input with examples
- Cloud provider, environment, budget constraints
- AI-generated blueprints with confidence scores
- Resource recommendations with cost estimates

### Blueprint Management (`/blueprints`)
- Search and filter by cloud/environment
- CRUD operations
- Version history
- IaC code generation (Terraform/Bicep/CloudFormation)

### Risk Assessment (`/risk`)
- Multi-dimensional risk scoring
- Security, availability, cost, performance analysis
- Mitigation recommendations

### Cost Management (`/cost`)
- Current spend tracking
- Budget utilization
- ML optimization recommendations
- Savings identification

### Deployment Monitor (`/deployments`)
- Real-time status tracking
- Progress indicators
- Logs and error messages
- Drift detection

## API Integration

```typescript
import { aiApi, blueprintApi } from './services/api';

// Generate blueprint from NLP
const blueprint = await aiApi.generateBlueprint({
  userInput: "I need a scalable web app on Azure",
  targetCloud: 'azure'
});

// Assess risk
const assessment = await aiApi.assessRisk({
  blueprintId: blueprint.blueprintId
});

// Get cost recommendations
const recommendations = await aiApi.getRecommendations({
  blueprintId: blueprint.blueprintId,
  type: 'cost'
});
```

## Development

```bash
# Start dev server
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Copyright © 2024 IAC DHARMA Platform
