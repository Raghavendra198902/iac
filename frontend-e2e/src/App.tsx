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
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Profile = lazy(() => import('./pages/Profile'));
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
const DevOps = lazy(() => import('./pages/DevOps'));
const DevOpsPipelines = lazy(() => import('./pages/DevOps/DevOpsPipelines'));
const DevOpsContainers = lazy(() => import('./pages/DevOps/DevOpsContainers'));
const DevOpsGit = lazy(() => import('./pages/DevOps/DevOpsGit'));
const DeploymentWorkflows = lazy(() => import('./pages/Deployments/DeploymentWorkflows'));
const EA = lazy(() => import('./pages/EA'));
const EABusiness = lazy(() => import('./pages/EA/EABusiness'));
const EAApplication = lazy(() => import('./pages/EA/EAApplication'));
const EAData = lazy(() => import('./pages/EA/EAData'));
const EATechnology = lazy(() => import('./pages/EA/EATechnology'));
const EASecurity = lazy(() => import('./pages/EA/EASecurity'));
const EAIntegration = lazy(() => import('./pages/EA/EAIntegration'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectsList = lazy(() => import('./pages/Projects/ProjectsList'));
const ProjectDetail = lazy(() => import('./pages/Projects/ProjectDetail'));
const ProjectsCollaboration = lazy(() => import('./pages/Projects/ProjectsCollaboration'));
const CMDB = lazy(() => import('./pages/CMDB'));
const CMDBAssets = lazy(() => import('./pages/CMDB/CMDBAssets'));
const CMDBConfigItems = lazy(() => import('./pages/CMDB/CMDBConfigItems'));
const CMDBRelationships = lazy(() => import('./pages/CMDB/CMDBRelationships'));
const AI = lazy(() => import('./pages/AI'));
const AIModels = lazy(() => import('./pages/AI/AIModels'));
const AIAutomation = lazy(() => import('./pages/AI/AIAutomation'));
const AIPredictive = lazy(() => import('./pages/AI/AIPredictive'));
const NaturalLanguageInfrastructure = lazy(() => import('./pages/NaturalLanguageInfrastructure'));
const Integrations = lazy(() => import('./pages/Integrations'));
const IntegrationsAPI = lazy(() => import('./pages/Integrations/IntegrationsAPI'));
const IntegrationsWebhooks = lazy(() => import('./pages/Integrations/IntegrationsWebhooks'));
const IntegrationsServices = lazy(() => import('./pages/Integrations/IntegrationsServices'));
const Reports = lazy(() => import('./pages/Reports'));
const ReportsBuilder = lazy(() => import('./pages/Reports/ReportsBuilder'));
const ReportsScheduled = lazy(() => import('./pages/Reports/ReportsScheduled'));
const ReportsExport = lazy(() => import('./pages/Reports/ReportsExport'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminSystem = lazy(() => import('./pages/Admin/AdminSystem'));
const AdminLicense = lazy(() => import('./pages/Admin/AdminLicense'));
const AdminBackup = lazy(() => import('./pages/Admin/AdminBackup'));
const Search = lazy(() => import('./pages/Search'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Help = lazy(() => import('./pages/Help'));

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
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected routes with Layout (navigation menu) */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/profile" element={<Profile />} />
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
                  <Route path="/deployments/workflows" element={<DeploymentWorkflows />} />
                  <Route path="/ea" element={<EA />} />
                  <Route path="/ea/business" element={<EABusiness />} />
                  <Route path="/ea/application" element={<EAApplication />} />
                  <Route path="/ea/data" element={<EAData />} />
                  <Route path="/ea/technology" element={<EATechnology />} />
                  <Route path="/ea/security" element={<EASecurity />} />
                  <Route path="/ea/integration" element={<EAIntegration />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/list" element={<ProjectsList />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/projects/collaboration" element={<ProjectsCollaboration />} />
                  <Route path="/cmdb" element={<CMDB />} />
                  <Route path="/cmdb/assets" element={<CMDBAssets />} />
                  <Route path="/cmdb/config-items" element={<CMDBConfigItems />} />
                  <Route path="/cmdb/relationships" element={<CMDBRelationships />} />
                  <Route path="/ai" element={<AI />} />
                  <Route path="/ai/models" element={<AIModels />} />
                  <Route path="/ai/automation" element={<AIAutomation />} />
                  <Route path="/ai/predictive" element={<AIPredictive />} />
                  <Route path="/ai/nli" element={<NaturalLanguageInfrastructure />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/integrations/api" element={<IntegrationsAPI />} />
                  <Route path="/integrations/webhooks" element={<IntegrationsWebhooks />} />
                  <Route path="/integrations/services" element={<IntegrationsServices />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/builder" element={<ReportsBuilder />} />
                  <Route path="/reports/scheduled" element={<ReportsScheduled />} />
                  <Route path="/reports/export" element={<ReportsExport />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/system" element={<AdminSystem />} />
                  <Route path="/admin/license" element={<AdminLicense />} />
                  <Route path="/admin/backup" element={<AdminBackup />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/help" element={<Help />} />
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
