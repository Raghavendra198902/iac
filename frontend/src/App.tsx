import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { Toaster } from 'react-hot-toast';

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// New Layout Demo Page - ONLY component
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Settings = lazy(() => import('./pages/Settings'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/DashboardNew'));
const DemoPage = lazy(() => import('./pages/DemoPage'));
const SystemInfo = lazy(() => import('./pages/SystemInfo'));
const UserManagement = lazy(() => import('./pages/UserManagement'));

// Enterprise Architecture Pages
const EAIndex = lazy(() => import('./pages/ea/index'));
const ArchitectureStrategy = lazy(() => import('./pages/ea/ArchitectureStrategy'));
const ApplicationArchitecture = lazy(() => import('./pages/ea/ApplicationArchitecture'));
const BusinessArchitecture = lazy(() => import('./pages/ea/BusinessArchitecture'));
const DataArchitecture = lazy(() => import('./pages/ea/DataArchitecture'));
const TechnologyArchitecture = lazy(() => import('./pages/ea/TechnologyArchitecture'));
const SecurityArchitecture = lazy(() => import('./pages/ea/SecurityArchitecture'));
const IntegrationStrategy = lazy(() => import('./pages/ea/IntegrationStrategy'));
const ComplianceGovernance = lazy(() => import('./pages/ea/ComplianceGovernance'));
const Roadmap = lazy(() => import('./pages/ea/Roadmap'));
const AnalyticsKPIs = lazy(() => import('./pages/ea/AnalyticsKPIs'));
const ArchitectureRepository = lazy(() => import('./pages/ea/ArchitectureRepository'));
const StakeholderManagement = lazy(() => import('./pages/ea/StakeholderManagement'));

// Project Management Pages
const ProjectManagement = lazy(() => import('./pages/pm/ProjectManagement'));
const PMRequirements = lazy(() => import('./pages/pm/Requirements'));

// Software Engineering Pages
const SoftwareEngineering = lazy(() => import('./pages/se/SoftwareEngineering'));
const SETasks = lazy(() => import('./pages/se/Tasks'));
const SEPlaybooks = lazy(() => import('./pages/se/Playbooks'));

// Agent Downloads
const AgentDownloads = lazy(() => import('./pages/agents/AgentDownloads'));
const UploadAgent = lazy(() => import('./pages/agents/UploadAgent'));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));
const Enforcement = lazy(() => import('./pages/agents/Enforcement'));
const Monitoring = lazy(() => import('./pages/agents/Monitoring'));

// CMDB
const CMDBPage = lazy(() => import('./pages/cmdb/CMDBPage'));

// Project Workflow
const ProjectWorkflow = lazy(() => import('./pages/workflow/ProjectWorkflow'));
const TeamCollaboration = lazy(() => import('./pages/workflow/TeamCollaboration'));

// Global Search
const GlobalSearch = lazy(() => import('./pages/GlobalSearch'));

// Collaboration
const Collaboration = lazy(() => import('./pages/Collaboration'));

// Resource Templates
const ResourceTemplates = lazy(() => import('./pages/ResourceTemplates'));

// Analytics & Insights
const InsightsDashboard = lazy(() => import('./pages/InsightsDashboard'));

// Security Center
const SecurityCenter = lazy(() => import('./pages/SecurityCenter'));

// Cost Management
const CostManagement = lazy(() => import('./pages/CostManagement'));

// AI Architecture Pages
const AIArchitectureLanding = lazy(() => import('./pages/ai/AIArchitectureLanding'));
const OneClickMode = lazy(() => import('./pages/ai/OneClickMode'));
const AdvancedMode = lazy(() => import('./pages/ai/AdvancedMode'));

// Additional Pages
const Favorites = lazy(() => import('./pages/Favorites'));
const RecentActivity = lazy(() => import('./pages/RecentActivity'));
const Profile = lazy(() => import('./pages/Profile'));
const HelpSupport = lazy(() => import('./pages/HelpSupport'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <AuthProvider>
                <WebSocketProvider>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  
                  {/* Protected Dashboard */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/demo" element={<DemoPage />} />
                  <Route path="/system" element={<SystemInfo />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/settings" element={<Settings />} />
                  
                  {/* Enterprise Architecture Routes */}
                  <Route path="/ea" element={<EAIndex />} />
                  <Route path="/ea/strategy" element={<ArchitectureStrategy />} />
                  <Route path="/ea/application" element={<ApplicationArchitecture />} />
                  <Route path="/ea/business" element={<BusinessArchitecture />} />
                  <Route path="/ea/data" element={<DataArchitecture />} />
                  <Route path="/ea/technology" element={<TechnologyArchitecture />} />
                  <Route path="/ea/security" element={<SecurityArchitecture />} />
                  <Route path="/ea/integration" element={<IntegrationStrategy />} />
                  <Route path="/ea/compliance" element={<ComplianceGovernance />} />
                  <Route path="/ea/roadmap" element={<Roadmap />} />
                  <Route path="/ea/analytics" element={<AnalyticsKPIs />} />
                  <Route path="/ea/repository" element={<ArchitectureRepository />} />
                  <Route path="/ea/stakeholders" element={<StakeholderManagement />} />
                  
                  {/* Project Management Routes */}
                  <Route path="/pm/roadmap" element={<ProjectManagement />} />
                  <Route path="/pm/requirements" element={<PMRequirements />} />
                  
                  {/* Software Engineering Routes */}
                  <Route path="/se/projects" element={<SoftwareEngineering />} />
                  <Route path="/se/tasks" element={<SETasks />} />
                  <Route path="/se/playbooks" element={<SEPlaybooks />} />
                  
                  {/* Agent Downloads */}
                  <Route path="/agents/downloads" element={<AgentDownloads />} />
                  <Route path="/agents/upload" element={<UploadAgent />} />
                  <Route path="/agents/enforcement" element={<Enforcement />} />
                  <Route path="/agents/monitoring" element={<Monitoring />} />
                  <Route path="/downloads" element={<DownloadsPage />} />
                  
                  {/* CMDB */}
                  <Route path="/cmdb" element={<CMDBPage />} />
                  
                  {/* Project Workflow */}
                  <Route path="/workflow" element={<ProjectWorkflow />} />
                  <Route path="/workflow/team" element={<TeamCollaboration />} />
                  
                  {/* Global Search */}
                  <Route path="/search" element={<GlobalSearch />} />
                  
                  {/* Collaboration */}
                  <Route path="/collaboration" element={<Collaboration />} />
                  
                  {/* Resource Templates */}
                  <Route path="/templates" element={<ResourceTemplates />} />
                  
                  {/* Analytics & Insights */}
                  <Route path="/insights" element={<InsightsDashboard />} />
                  
                  {/* Security Center */}
                  <Route path="/security" element={<SecurityCenter />} />
                  
                  {/* Cost Management */}
                  <Route path="/cost" element={<CostManagement />} />
                  
                  {/* Additional Pages */}
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/recent" element={<RecentActivity />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/help" element={<HelpSupport />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  
                  {/* AI Architecture Routes */}
                  <Route path="/ai" element={<AIArchitectureLanding />} />
                  <Route path="/ai/oneclick" element={<OneClickMode />} />
                  <Route path="/ai/advanced" element={<AdvancedMode />} />
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                </WebSocketProvider>
              </AuthProvider>
            </Suspense>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            borderRadius: '0.5rem',
            padding: '16px',
            fontSize: '14px',
            maxWidth: '500px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;
