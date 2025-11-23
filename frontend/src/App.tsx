import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import AppLayout from './components/layout/AppLayout';
import ToastProvider from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Lazy load all page components for code splitting
const DashboardEnhanced = lazy(() => import('./pages/DashboardEnhanced'));
const AdvancedDashboard = lazy(() => import('./pages/AdvancedDashboard'));
const BlueprintList = lazy(() => import('./pages/BlueprintList'));
const BlueprintDetail = lazy(() => import('./pages/BlueprintDetail'));
const BlueprintEdit = lazy(() => import('./pages/BlueprintEdit'));
const NLPDesigner = lazy(() => import('./pages/NLPDesigner'));
const RiskDashboard = lazy(() => import('./pages/RiskDashboard'));
const CostDashboard = lazy(() => import('./pages/CostDashboard'));
const DeploymentMonitor = lazy(() => import('./pages/DeploymentMonitor'));
const IACGenerator = lazy(() => import('./pages/IACGenerator'));
const GuardrailsManagement = lazy(() => import('./pages/GuardrailsManagement'));
const AutomationEngine = lazy(() => import('./pages/AutomationEngine'));
const MonitoringDashboard = lazy(() => import('./pages/MonitoringDashboard'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const PerformanceAnalytics = lazy(() => import('./pages/PerformanceAnalytics'));
const UIShowcase = lazy(() => import('./pages/UIShowcase'));
const CMDB = lazy(() => import('./pages/CMDB'));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));
const AgentsPage = lazy(() => import('./pages/AgentsPage'));
const SecurityDashboard = lazy(() => import('./pages/SecurityDashboard'));
const Security = lazy(() => import('./pages/Security'));
const ReportsBuilder = lazy(() => import('./pages/ReportsBuilder'));
const IntegrationsManagement = lazy(() => import('./pages/IntegrationsManagement'));
const APIManagement = lazy(() => import('./pages/APIManagement'));
const ProjectsList = lazy(() => import('./pages/ProjectsList'));
const NewProject = lazy(() => import('./pages/NewProject'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Enterprise Features
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const SSOLoginPage = lazy(() => import('./components/SSOLogin').then(m => ({ default: m.SSOLoginPage })));

// Role-based Dashboards
const SADashboard = lazy(() => import('./pages/dashboards/SADashboard'));
const EADashboard = lazy(() => import('./pages/dashboards/EADashboard'));
const PMDashboard = lazy(() => import('./pages/dashboards/PMDashboard'));
const TADashboard = lazy(() => import('./pages/dashboards/TADashboard'));
const SEDashboard = lazy(() => import('./pages/dashboards/SEDashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ToastProvider />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* All authenticated routes */}
                <Route path="*" element={
                  <AuthProvider>
                    <InnerRoutes />
                  </AuthProvider>
                } />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Separate component for authenticated routes
function InnerRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/sso-login" element={<SSOLoginPage />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardEnhanced />} />
                
                {/* Role-based Dashboards */}
                <Route path="dashboards/sa" element={<SADashboard />} />
                <Route path="dashboards/ea" element={<EADashboard />} />
                <Route path="dashboards/pm" element={<PMDashboard />} />
                <Route path="dashboards/ta" element={<TADashboard />} />
                <Route path="dashboards/se" element={<SEDashboard />} />
                
                {/* Advanced System Dashboard */}
                <Route path="advanced" element={<AdvancedDashboard />} />
                
                {/* Enterprise Features */}
                <Route path="analytics" element={<AnalyticsDashboard />} />
                
                {/* Blueprint Routes - All authenticated users */}
                <Route path="blueprints" element={<BlueprintList />} />
                <Route path="blueprints/:id" element={<BlueprintDetail />} />
                <Route path="blueprints/:id/edit" element={<BlueprintEdit />} />
                
                {/* AI-Powered Designer - All authenticated users */}
                <Route path="designer" element={<NLPDesigner />} />
                
                {/* Risk Assessment - All authenticated users */}
                <Route path="risk" element={<RiskDashboard />} />
                
                {/* Cost Management - All authenticated users */}
                <Route path="cost" element={<CostDashboard />} />
                
                {/* Deployment Monitoring - All roles */}
                <Route path="deployments" element={<DeploymentMonitor />} />
                <Route path="deployments/:id" element={<DeploymentMonitor />} />
                
                {/* IAC Generator - All authenticated users */}
                <Route path="iac" element={<IACGenerator />} />
                
                {/* Guardrails Management - All authenticated users */}
                <Route path="guardrails" element={<GuardrailsManagement />} />
                
                {/* Automation Engine - All authenticated users */}
                <Route path="automation" element={<AutomationEngine />} />
                
                {/* Monitoring Dashboard - All roles */}
                <Route path="monitoring" element={<MonitoringDashboard />} />
                
                {/* AI Insights - All authenticated users */}
                <Route path="ai" element={<AIInsights />} />
                
                {/* Reports Builder - All authenticated users */}
                <Route path="reports" element={<ReportsBuilder />} />
                
                {/* Integrations Management - All authenticated users */}
                <Route path="integrations" element={<IntegrationsManagement />} />
                
                {/* API Management - All authenticated users */}
                <Route path="api-management" element={<APIManagement />} />
                
                {/* Performance Analytics - All authenticated users */}
                <Route path="performance" element={<PerformanceAnalytics />} />
                
                {/* CMDB - Configuration Management Database */}
                <Route path="cmdb" element={<CMDB />} />
                
                {/* Projects Management */}
                <Route path="projects" element={<ProjectsList />} />
                <Route path="projects/new" element={<NewProject />} />
                
                {/* Downloads - Agent installer packages */}
                <Route path="downloads" element={<DownloadsPage />} />
                
                {/* Agents - Agent monitoring and management */}
                <Route path="agents" element={<AgentsPage />} />
                
                {/* Security Dashboard - Enforcement monitoring */}
                <Route path="security" element={<SecurityDashboard />} />
                
                {/* Data Leakage Control - DLP monitoring */}
                <Route path="security/dlp" element={<Security />} />
                
                {/* UI Showcase - All roles */}
                <Route path="ui-showcase" element={<UIShowcase />} />
              </Route>

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
  );
}

export default App;
