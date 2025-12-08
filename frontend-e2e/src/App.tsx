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
const NotFound = lazy(() => import('./pages/NotFound'));
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
const Cost = lazy(() => import('./pages/Cost'));
const CostAnalytics = lazy(() => import('./pages/Cost/CostAnalytics'));
const CostBudget = lazy(() => import('./pages/Cost/CostBudget'));
const CostOptimization = lazy(() => import('./pages/Cost/CostOptimization'));
const DeploymentWorkflows = lazy(() => import('./pages/Deployments/DeploymentWorkflows'));
const DevOps = lazy(() => import('./pages/DevOps'));
const DevOpsPipelines = lazy(() => import('./pages/DevOps/DevOpsPipelines'));
const DevOpsContainers = lazy(() => import('./pages/DevOps/DevOpsContainers'));
const DevOpsGit = lazy(() => import('./pages/DevOps/DevOpsGit'));
const EA = lazy(() => import('./pages/EA'));
const EABusiness = lazy(() => import('./pages/EA/EABusiness'));
const EAApplication = lazy(() => import('./pages/EA/EAApplication'));
const EAData = lazy(() => import('./pages/EA/EAData'));
const EATechnology = lazy(() => import('./pages/EA/EATechnology'));
const EAIntegration = lazy(() => import('./pages/EA/EAIntegration'));
const EASecurity = lazy(() => import('./pages/EA/EASecurity'));
const SA = lazy(() => import('./pages/SA'));
const SADesign = lazy(() => import('./pages/SA/SADesign'));
const SAStack = lazy(() => import('./pages/SA/SAStack'));
const SAPatterns = lazy(() => import('./pages/SA/SAPatterns'));
const TA = lazy(() => import('./pages/TA'));
const TAInfrastructure = lazy(() => import('./pages/TA/TAInfrastructure'));
const TANetwork = lazy(() => import('./pages/TA/TANetwork'));
const TACloud = lazy(() => import('./pages/TA/TACloud'));
const PMTimeline = lazy(() => import('./pages/Projects/PMTimeline'));
const PMResources = lazy(() => import('./pages/Projects/PMResources'));
const PMRisks = lazy(() => import('./pages/Projects/PMRisks'));
const SE = lazy(() => import('./pages/SE'));
const SEDevelopment = lazy(() => import('./pages/SE/SEDevelopment'));
const SEQuality = lazy(() => import('./pages/SE/SEQuality'));
const SERelease = lazy(() => import('./pages/SE/SERelease'));

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
                  <Route path="/cost" element={<Cost />} />
                  <Route path="/cost/analytics" element={<CostAnalytics />} />
                  <Route path="/cost/budget" element={<CostBudget />} />
                  <Route path="/cost/optimization" element={<CostOptimization />} />
                  <Route path="/devops" element={<DevOps />} />
                  <Route path="/devops/pipelines" element={<DevOpsPipelines />} />
                  <Route path="/devops/containers" element={<DevOpsContainers />} />
                  <Route path="/devops/git" element={<DevOpsGit />} />
                  <Route path="/ea" element={<EA />} />
                  <Route path="/ea/business" element={<EABusiness />} />
                  <Route path="/ea/application" element={<EAApplication />} />
                  <Route path="/ea/data" element={<EAData />} />
                  <Route path="/ea/technology" element={<EATechnology />} />
                  <Route path="/ea/integration" element={<EAIntegration />} />
                  <Route path="/ea/security" element={<EASecurity />} />
                  <Route path="/sa" element={<SA />} />
                  <Route path="/sa/design" element={<SADesign />} />
                  <Route path="/sa/stack" element={<SAStack />} />
                  <Route path="/sa/patterns" element={<SAPatterns />} />
                  <Route path="/ta" element={<TA />} />
                  <Route path="/ta/infrastructure" element={<TAInfrastructure />} />
                  <Route path="/ta/network" element={<TANetwork />} />
                  <Route path="/ta/cloud" element={<TACloud />} />
                  <Route path="/projects/timeline" element={<PMTimeline />} />
                  <Route path="/projects/resources" element={<PMResources />} />
                  <Route path="/projects/risks" element={<PMRisks />} />
                  <Route path="/se" element={<SE />} />
                  <Route path="/se/development" element={<SEDevelopment />} />
                  <Route path="/se/quality" element={<SEQuality />} />
                  <Route path="/se/release" element={<SERelease />} />
                  <Route path="/deployments/workflows" element={<DeploymentWorkflows />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
