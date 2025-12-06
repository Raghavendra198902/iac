# Quick Reference Guide - E2E Frontend Pages

## 📦 Import Pages

### Single Import
```typescript
import { InfrastructureDashboard } from '@/pages';
import { MonitoringPerformance } from '@/pages';
import { SecurityCompliance } from '@/pages';
```

### Multiple Imports
```typescript
import {
  InfrastructureDashboard,
  MonitoringDashboard,
  SecurityDashboard,
  CostDashboard
} from '@/pages';
```

## 🗺️ React Router Setup

### Basic Route Configuration
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  Home,
  Dashboard,
  InfrastructureDashboard,
  InfrastructureResources,
  InfrastructureTemplates,
  InfrastructureGenerator,
  MonitoringDashboard,
  MonitoringPerformance,
  MonitoringHealth,
  MonitoringAlerts,
  SecurityDashboard,
  SecurityCompliance,
  SecurityAudit,
  SecurityAccess,
  CostDashboard,
  CostAnalytics,
  CostBudget,
  CostOptimization,
  DevOpsDashboard,
  DevOpsPipelines,
  DevOpsContainers,
  DevOpsGit,
  EADashboard,
  EABusiness,
  EAApplication,
  EAData,
  EATechnology,
  EASecurity,
  EAIntegration,
  ProjectsDashboard,
  ProjectsList,
  ProjectDetail,
  ProjectsCollaboration,
  CMDBDashboard,
  CMDBAssets,
  CMDBConfigItems,
  CMDBRelationships,
  AIDashboard,
  AIModels,
  AIAutomation,
  AIPredictive,
  IntegrationsDashboard,
  IntegrationsAPI,
  IntegrationsWebhooks,
  IntegrationsServices,
  ReportsDashboard,
  ReportsBuilder,
  ReportsScheduled,
  ReportsExport,
  AdminDashboard,
  AdminSystem,
  AdminLicense,
  AdminBackup,
  Profile,
  Settings,
  Search,
  Notifications,
  Help,
  Unauthorized,
  NotFound,
  Login,
  Register
} from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Infrastructure */}
        <Route path="/infrastructure" element={<InfrastructureDashboard />} />
        <Route path="/infrastructure/resources" element={<InfrastructureResources />} />
        <Route path="/infrastructure/templates" element={<InfrastructureTemplates />} />
        <Route path="/infrastructure/generator" element={<InfrastructureGenerator />} />

        {/* Monitoring */}
        <Route path="/monitoring" element={<MonitoringDashboard />} />
        <Route path="/monitoring/performance" element={<MonitoringPerformance />} />
        <Route path="/monitoring/health" element={<MonitoringHealth />} />
        <Route path="/monitoring/alerts" element={<MonitoringAlerts />} />

        {/* Security */}
        <Route path="/security" element={<SecurityDashboard />} />
        <Route path="/security/compliance" element={<SecurityCompliance />} />
        <Route path="/security/audit" element={<SecurityAudit />} />
        <Route path="/security/access" element={<SecurityAccess />} />

        {/* Cost */}
        <Route path="/cost" element={<CostDashboard />} />
        <Route path="/cost/analytics" element={<CostAnalytics />} />
        <Route path="/cost/budget" element={<CostBudget />} />
        <Route path="/cost/optimization" element={<CostOptimization />} />

        {/* DevOps */}
        <Route path="/devops" element={<DevOpsDashboard />} />
        <Route path="/devops/pipelines" element={<DevOpsPipelines />} />
        <Route path="/devops/containers" element={<DevOpsContainers />} />
        <Route path="/devops/git" element={<DevOpsGit />} />

        {/* Enterprise Architecture */}
        <Route path="/ea" element={<EADashboard />} />
        <Route path="/ea/business" element={<EABusiness />} />
        <Route path="/ea/application" element={<EAApplication />} />
        <Route path="/ea/data" element={<EAData />} />
        <Route path="/ea/technology" element={<EATechnology />} />
        <Route path="/ea/security" element={<EASecurity />} />
        <Route path="/ea/integration" element={<EAIntegration />} />

        {/* Projects */}
        <Route path="/projects" element={<ProjectsDashboard />} />
        <Route path="/projects/list" element={<ProjectsList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/collaboration" element={<ProjectsCollaboration />} />

        {/* CMDB */}
        <Route path="/cmdb" element={<CMDBDashboard />} />
        <Route path="/cmdb/assets" element={<CMDBAssets />} />
        <Route path="/cmdb/config-items" element={<CMDBConfigItems />} />
        <Route path="/cmdb/relationships" element={<CMDBRelationships />} />

        {/* AI */}
        <Route path="/ai" element={<AIDashboard />} />
        <Route path="/ai/models" element={<AIModels />} />
        <Route path="/ai/automation" element={<AIAutomation />} />
        <Route path="/ai/predictive" element={<AIPredictive />} />

        {/* Integrations */}
        <Route path="/integrations" element={<IntegrationsDashboard />} />
        <Route path="/integrations/api" element={<IntegrationsAPI />} />
        <Route path="/integrations/webhooks" element={<IntegrationsWebhooks />} />
        <Route path="/integrations/services" element={<IntegrationsServices />} />

        {/* Reports */}
        <Route path="/reports" element={<ReportsDashboard />} />
        <Route path="/reports/builder" element={<ReportsBuilder />} />
        <Route path="/reports/scheduled" element={<ReportsScheduled />} />
        <Route path="/reports/export" element={<ReportsExport />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/system" element={<AdminSystem />} />
        <Route path="/admin/license" element={<AdminLicense />} />
        <Route path="/admin/backup" element={<AdminBackup />} />

        {/* Utility */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/help" element={<Help />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## 🔗 Navigation Links

### Sidebar Navigation Example
```typescript
// src/components/Sidebar.tsx
import { Link } from 'react-router-dom';

const navigationItems = [
  {
    name: 'Infrastructure',
    icon: ServerIcon,
    href: '/infrastructure',
    children: [
      { name: 'Resources', href: '/infrastructure/resources' },
      { name: 'Templates', href: '/infrastructure/templates' },
      { name: 'Generator', href: '/infrastructure/generator' },
    ],
  },
  {
    name: 'Monitoring',
    icon: ChartBarIcon,
    href: '/monitoring',
    children: [
      { name: 'Performance', href: '/monitoring/performance' },
      { name: 'Health', href: '/monitoring/health' },
      { name: 'Alerts', href: '/monitoring/alerts' },
    ],
  },
  // ... add more sections
];

export function Sidebar() {
  return (
    <nav>
      {navigationItems.map((item) => (
        <div key={item.name}>
          <Link to={item.href}>{item.name}</Link>
          {item.children?.map((child) => (
            <Link key={child.name} to={child.href}>
              {child.name}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
```

## 🎨 Customization Guide

### Update Page Colors
Each page has color themes defined in the gradient classes:
```typescript
// Change gradient in any page component
<h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
  Your Title
</h1>
```

### Update Background
```typescript
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  {/* Your content */}
</div>
```

### Add Real Data
Replace mock data with API calls:
```typescript
import { useEffect, useState } from 'react';

function YourPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/your-endpoint')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    // Use {data} instead of mock data
  );
}
```

## 🧪 Testing

### Example Test
```typescript
// src/pages/Infrastructure/__tests__/index.test.tsx
import { render, screen } from '@testing-library/react';
import InfrastructureDashboard from '../index';

describe('InfrastructureDashboard', () => {
  it('renders the dashboard title', () => {
    render(<InfrastructureDashboard />);
    expect(screen.getByText('Infrastructure Dashboard')).toBeInTheDocument();
  });

  it('displays resource cards', () => {
    render(<InfrastructureDashboard />);
    expect(screen.getByText('EC2 Instances')).toBeInTheDocument();
  });
});
```

## 📊 Page Features Summary

| Category | Pages | Key Features |
|----------|-------|--------------|
| Infrastructure | 4 | Resource management, templates, IAC generation |
| Monitoring | 4 | Real-time metrics, health checks, alerts |
| Security | 4 | Threat monitoring, compliance, audit logs |
| Cost | 4 | Spend tracking, budgets, optimization |
| DevOps | 4 | CI/CD, containers, Git operations |
| EA | 7 | Business/app/data/tech architecture |
| Projects | 4 | Project management, collaboration |
| CMDB | 4 | Asset inventory, CI management |
| AI | 4 | ML models, automation, predictions |
| Integrations | 4 | API/webhooks/services management |
| Reports | 4 | Report builder, scheduling, export |
| Admin | 4 | System config, licensing, backup |
| Utility | 7 | Profile, settings, search, help, errors |

## 🚀 Performance Tips

1. **Lazy Loading**: Use React.lazy() for code splitting
```typescript
const InfrastructureDashboard = React.lazy(() => import('@/pages/Infrastructure'));
```

2. **Memoization**: Use React.memo() for expensive components
```typescript
export default React.memo(InfrastructureDashboard);
```

3. **Virtual Scrolling**: For large lists, use react-window or react-virtualized

4. **Image Optimization**: Use next/image or similar for optimized images

## 📚 Additional Resources

- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Created with ❤️ for the E2E IAC Platform**
