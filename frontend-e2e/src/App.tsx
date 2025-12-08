import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load components
const Layout = lazy(() => import('./components/Layout'));
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Settings = lazy(() => import('./pages/Settings'));
const CloudSettings = lazy(() => import('./pages/Settings/CloudSettings').then(module => ({ default: module.CloudSettings })));
const BackupRecovery = lazy(() => import('./pages/Settings/BackupRecovery'));
const Infrastructure = lazy(() => import('./pages/Infrastructure'));
const InfrastructureResources = lazy(() => import('./pages/Infrastructure/InfrastructureResources'));
const InfrastructureTemplates = lazy(() => import('./pages/Infrastructure/InfrastructureTemplates'));
const InfrastructureGenerator = lazy(() => import('./pages/Infrastructure/InfrastructureGenerator'));
const InfrastructureTopology = lazy(() => import('./pages/Infrastructure/InfrastructureTopology'));
const Monitoring = lazy(() => import('./pages/Monitoring'));
const MonitoringPerformance = lazy(() => import('./pages/Monitoring/MonitoringPerformance'));
const MonitoringHealth = lazy(() => import('./pages/Monitoring/MonitoringHealth'));
const MonitoringAlerts = lazy(() => import('./pages/Monitoring/MonitoringAlerts'));
const LogAggregation = lazy(() => import('./pages/Monitoring/LogAggregation'));
const Security = lazy(() => import('./pages/Security'));
const SecurityCompliance = lazy(() => import('./pages/Security/SecurityCompliance'));
const SecurityAudit = lazy(() => import('./pages/Security/SecurityAudit'));
const SecurityAccess = lazy(() => import('./pages/Security/SecurityAccess'));
const CostAnalytics = lazy(() => import('./pages/Cost/CostAnalytics'));
const CostBudget = lazy(() => import('./pages/Cost/CostBudget'));
const CostOptimization = lazy(() => import('./pages/Cost/CostOptimization'));
const DeploymentWorkflows = lazy(() => import('./pages/Deployments/DeploymentWorkflows'));
const NaturalLanguageInfrastructure = lazy(() => import('./pages/NaturalLanguageInfrastructure'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public routes without navigation */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes with Layout (navigation menu) */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/cloud" element={<CloudSettings />} />
                  <Route path="/settings/backup" element={<BackupRecovery />} />
                  <Route path="/infrastructure" element={<Infrastructure />} />
                  <Route path="/infrastructure/resources" element={<InfrastructureResources />} />
                  <Route path="/infrastructure/templates" element={<InfrastructureTemplates />} />
                  <Route path="/infrastructure/generator" element={<InfrastructureGenerator />} />
                  <Route path="/infrastructure/topology" element={<InfrastructureTopology />} />
                  <Route path="/monitoring" element={<Monitoring />} />
                  <Route path="/monitoring/performance" element={<MonitoringPerformance />} />
                  <Route path="/monitoring/health" element={<MonitoringHealth />} />
                  <Route path="/monitoring/alerts" element={<MonitoringAlerts />} />
                  <Route path="/monitoring/logs" element={<LogAggregation />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/security/compliance" element={<SecurityCompliance />} />
                  <Route path="/security/audit" element={<SecurityAudit />} />
                  <Route path="/security/access" element={<SecurityAccess />} />
                  <Route path="/cost/analytics" element={<CostAnalytics />} />
                  <Route path="/cost/budget" element={<CostBudget />} />
                  <Route path="/cost/optimization" element={<CostOptimization />} />
                  <Route path="/deployments/workflows" element={<DeploymentWorkflows />} />
                  <Route path="/ai/nli" element={<NaturalLanguageInfrastructure />} />
                </Route>
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
