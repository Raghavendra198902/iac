import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';
import DashboardEnhanced from './pages/DashboardEnhanced';
import AdvancedDashboard from './pages/AdvancedDashboard';
import BlueprintList from './pages/BlueprintList';
import BlueprintDetail from './pages/BlueprintDetail';
import BlueprintEdit from './pages/BlueprintEdit';
import NLPDesigner from './pages/NLPDesigner';
import RiskDashboard from './pages/RiskDashboard';
import CostDashboard from './pages/CostDashboard';
import DeploymentMonitor from './pages/DeploymentMonitor';
import IACGenerator from './pages/IACGenerator';
import GuardrailsManagement from './pages/GuardrailsManagement';
import AutomationEngine from './pages/AutomationEngine';
import MonitoringDashboard from './pages/MonitoringDashboard';
import AIInsights from './pages/AIInsights';
import PerformanceAnalytics from './pages/PerformanceAnalytics';
import UIShowcase from './pages/UIShowcase';
import CMDB from './pages/CMDB';
import DownloadsPage from './pages/DownloadsPage';
import AgentsPage from './pages/AgentsPage';
import SecurityDashboard from './pages/SecurityDashboard';
import Security from './pages/Security';
import ReportsBuilder from './pages/ReportsBuilder';
import IntegrationsManagement from './pages/IntegrationsManagement';
import ProjectsList from './pages/ProjectsList';
import NewProject from './pages/NewProject';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ToastProvider from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, RoleBasedRoute } from './components/ProtectedRoute';

// Enterprise Features
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { SSOLoginPage } from './components/SSOLogin';

// Role-based Dashboards
import SADashboard from './pages/dashboards/SADashboard';
import EADashboard from './pages/dashboards/EADashboard';
import PMDashboard from './pages/dashboards/PMDashboard';
import TADashboard from './pages/dashboards/TADashboard';
import SEDashboard from './pages/dashboards/SEDashboard';

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
            <Routes>
              {/* All authenticated routes */}
              <Route path="*" element={
                <AuthProvider>
                  <InnerRoutes />
                </AuthProvider>
              } />
            </Routes>
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
