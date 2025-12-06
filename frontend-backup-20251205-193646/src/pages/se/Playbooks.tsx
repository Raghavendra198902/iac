import { useState } from 'react';
import { MainLayout } from '../../components/layout';
import {
  BookOpen,
  Play,
  Code2,
  Server,
  Database,
  Shield,
  GitBranch,
  Workflow,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  FileCode,
  Settings,
  Zap,
  Download,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  command?: string;
  completed: boolean;
}

interface Playbook {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: PlaybookStep[];
  tags: string[];
  icon: any;
  expanded?: boolean;
}

export default function Playbooks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [playbooks, setPlaybooks] = useState<Playbook[]>([
    {
      id: '1',
      title: 'Backend API Setup',
      description: 'Complete guide to setting up a production-ready FastAPI/Node.js backend with authentication, database, and logging',
      category: 'Backend',
      difficulty: 'intermediate',
      estimatedTime: '4-6 hours',
      icon: Server,
      tags: ['api', 'backend', 'authentication', 'database'],
      expanded: false,
      steps: [
        {
          id: '1-1',
          title: 'Initialize Project Structure',
          description: 'Create project directories and initial configuration files',
          command: 'mkdir -p backend/{routes,models,middleware,utils,config} && npm init -y',
          completed: false,
        },
        {
          id: '1-2',
          title: 'Install Dependencies',
          description: 'Install required packages: Express, PostgreSQL client, JWT, bcrypt, dotenv',
          command: 'npm install express pg jsonwebtoken bcrypt dotenv cors helmet',
          completed: false,
        },
        {
          id: '1-3',
          title: 'Database Connection Setup',
          description: 'Configure PostgreSQL connection pool with environment variables',
          command: 'Create config/database.ts with connection pool configuration',
          completed: false,
        },
        {
          id: '1-4',
          title: 'Authentication Middleware',
          description: 'Implement JWT authentication middleware for protected routes',
          command: 'Create middleware/auth.ts with token validation logic',
          completed: false,
        },
        {
          id: '1-5',
          title: 'Error Handling Middleware',
          description: 'Add centralized error handling for consistent API responses',
          command: 'Create middleware/errorHandler.ts with custom error classes',
          completed: false,
        },
        {
          id: '1-6',
          title: 'API Routes Setup',
          description: 'Create RESTful API routes with proper HTTP methods',
          command: 'Create routes for authentication, users, and resources',
          completed: false,
        },
        {
          id: '1-7',
          title: 'Logging Configuration',
          description: 'Set up structured logging with Winston or Pino',
          command: 'npm install winston && configure logger in utils/logger.ts',
          completed: false,
        },
        {
          id: '1-8',
          title: 'Environment Configuration',
          description: 'Set up .env file with all required environment variables',
          command: 'Create .env with DB_HOST, DB_PORT, JWT_SECRET, etc.',
          completed: false,
        },
      ],
    },
    {
      id: '2',
      title: 'Frontend React Application',
      description: 'Build a modern React application with TypeScript, Tailwind CSS, and state management',
      category: 'Frontend',
      difficulty: 'intermediate',
      estimatedTime: '6-8 hours',
      icon: Code2,
      tags: ['react', 'typescript', 'tailwind', 'state-management'],
      expanded: false,
      steps: [
        {
          id: '2-1',
          title: 'Create React App with TypeScript',
          description: 'Initialize React project with TypeScript template',
          command: 'npx create-react-app frontend --template typescript',
          completed: false,
        },
        {
          id: '2-2',
          title: 'Install Tailwind CSS',
          description: 'Set up Tailwind CSS for styling',
          command: 'npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p',
          completed: false,
        },
        {
          id: '2-3',
          title: 'Install React Router',
          description: 'Add routing capabilities to the application',
          command: 'npm install react-router-dom @types/react-router-dom',
          completed: false,
        },
        {
          id: '2-4',
          title: 'State Management Setup',
          description: 'Configure Redux Toolkit or Zustand for state management',
          command: 'npm install @reduxjs/toolkit react-redux',
          completed: false,
        },
        {
          id: '2-5',
          title: 'API Client Configuration',
          description: 'Set up Axios or Fetch wrapper for API calls',
          command: 'Create services/api.ts with base configuration and interceptors',
          completed: false,
        },
        {
          id: '2-6',
          title: 'Component Library Setup',
          description: 'Create reusable component library with TypeScript interfaces',
          command: 'Create components/{Button,Input,Card,Modal} with proper typing',
          completed: false,
        },
        {
          id: '2-7',
          title: 'Authentication Flow',
          description: 'Implement login, registration, and protected routes',
          command: 'Create auth context and protected route components',
          completed: false,
        },
        {
          id: '2-8',
          title: 'Dark Mode Support',
          description: 'Add dark mode toggle with system preference detection',
          command: 'Create ThemeContext and implement dark mode classes',
          completed: false,
        },
      ],
    },
    {
      id: '3',
      title: 'Database Schema Migration',
      description: 'Create and manage database schemas with migrations using Alembic or Flyway',
      category: 'Database',
      difficulty: 'intermediate',
      estimatedTime: '2-3 hours',
      icon: Database,
      tags: ['database', 'migrations', 'schema', 'postgresql'],
      expanded: false,
      steps: [
        {
          id: '3-1',
          title: 'Install Migration Tool',
          description: 'Install Alembic (Python) or Flyway (Java) for database migrations',
          command: 'pip install alembic',
          completed: false,
        },
        {
          id: '3-2',
          title: 'Initialize Migration Environment',
          description: 'Set up migration directory structure and configuration',
          command: 'alembic init migrations',
          completed: false,
        },
        {
          id: '3-3',
          title: 'Configure Database Connection',
          description: 'Update alembic.ini with database connection string',
          command: 'Edit alembic.ini: sqlalchemy.url = postgresql://user:pass@host/db',
          completed: false,
        },
        {
          id: '3-4',
          title: 'Create Initial Schema',
          description: 'Generate first migration with base tables (users, roles, permissions)',
          command: 'alembic revision -m "initial_schema"',
          completed: false,
        },
        {
          id: '3-5',
          title: 'Add Indexes and Constraints',
          description: 'Create indexes for frequently queried columns and foreign key constraints',
          command: 'Add CREATE INDEX and ALTER TABLE statements in migration',
          completed: false,
        },
        {
          id: '3-6',
          title: 'Run Migrations',
          description: 'Apply migrations to database',
          command: 'alembic upgrade head',
          completed: false,
        },
        {
          id: '3-7',
          title: 'Seed Initial Data',
          description: 'Create seed data script for default users and configurations',
          command: 'Create scripts/seed.sql with INSERT statements',
          completed: false,
        },
      ],
    },
    {
      id: '4',
      title: 'Docker Containerization',
      description: 'Containerize applications with Docker and Docker Compose for consistent deployment',
      category: 'DevOps',
      difficulty: 'beginner',
      estimatedTime: '3-4 hours',
      icon: GitBranch,
      tags: ['docker', 'containers', 'devops', 'deployment'],
      expanded: false,
      steps: [
        {
          id: '4-1',
          title: 'Create Dockerfile for Backend',
          description: 'Write multi-stage Dockerfile for Node.js/Python backend',
          command: 'Create Dockerfile with build and production stages',
          completed: false,
        },
        {
          id: '4-2',
          title: 'Create Dockerfile for Frontend',
          description: 'Build optimized production Docker image for React app',
          command: 'Create Dockerfile with nginx to serve static files',
          completed: false,
        },
        {
          id: '4-3',
          title: 'Write Docker Compose File',
          description: 'Define all services (backend, frontend, database) in docker-compose.yml',
          command: 'Create docker-compose.yml with services, networks, and volumes',
          completed: false,
        },
        {
          id: '4-4',
          title: 'Configure Environment Variables',
          description: 'Set up .env file for Docker Compose with all required variables',
          command: 'Create .env with DB credentials, API keys, ports, etc.',
          completed: false,
        },
        {
          id: '4-5',
          title: 'Add Health Checks',
          description: 'Implement health check endpoints and Docker health checks',
          command: 'Add HEALTHCHECK in Dockerfile and health endpoints in apps',
          completed: false,
        },
        {
          id: '4-6',
          title: 'Build and Test Containers',
          description: 'Build images and verify all services start correctly',
          command: 'docker-compose build && docker-compose up',
          completed: false,
        },
        {
          id: '4-7',
          title: 'Volume Persistence',
          description: 'Configure volumes for database data and logs persistence',
          command: 'Define named volumes in docker-compose.yml',
          completed: false,
        },
      ],
    },
    {
      id: '5',
      title: 'CI/CD Pipeline Setup',
      description: 'Automate testing and deployment with GitHub Actions or GitLab CI',
      category: 'DevOps',
      difficulty: 'advanced',
      estimatedTime: '4-5 hours',
      icon: Workflow,
      tags: ['ci-cd', 'automation', 'github-actions', 'deployment'],
      expanded: false,
      steps: [
        {
          id: '5-1',
          title: 'Create Workflow File',
          description: 'Set up GitHub Actions workflow or GitLab CI pipeline',
          command: 'Create .github/workflows/ci-cd.yml',
          completed: false,
        },
        {
          id: '5-2',
          title: 'Configure Build Jobs',
          description: 'Define build steps for all services (backend, frontend, agents)',
          command: 'Add jobs for install, build, lint, and test',
          completed: false,
        },
        {
          id: '5-3',
          title: 'Add Automated Testing',
          description: 'Run unit tests, integration tests, and code coverage',
          command: 'Configure test runners (Jest, Pytest) in CI pipeline',
          completed: false,
        },
        {
          id: '5-4',
          title: 'Security Scanning',
          description: 'Add dependency scanning and SAST tools',
          command: 'Integrate Snyk or npm audit in pipeline',
          completed: false,
        },
        {
          id: '5-5',
          title: 'Docker Image Build and Push',
          description: 'Build Docker images and push to container registry',
          command: 'Add docker build and docker push steps with tags',
          completed: false,
        },
        {
          id: '5-6',
          title: 'Deployment to Staging',
          description: 'Automatically deploy to staging environment on merge to develop',
          command: 'Add deployment job with SSH or kubectl commands',
          completed: false,
        },
        {
          id: '5-7',
          title: 'Production Deployment',
          description: 'Deploy to production with manual approval gate',
          command: 'Add production deployment with environment protection rules',
          completed: false,
        },
        {
          id: '5-8',
          title: 'Notification Setup',
          description: 'Configure Slack/email notifications for pipeline status',
          command: 'Add notification step for success/failure alerts',
          completed: false,
        },
      ],
    },
    {
      id: '6',
      title: 'Security Hardening',
      description: 'Implement security best practices for authentication, encryption, and access control',
      category: 'Security',
      difficulty: 'advanced',
      estimatedTime: '5-6 hours',
      icon: Shield,
      tags: ['security', 'authentication', 'encryption', 'rbac'],
      expanded: false,
      steps: [
        {
          id: '6-1',
          title: 'Implement Rate Limiting',
          description: 'Add rate limiting to prevent brute force attacks',
          command: 'Install express-rate-limit and configure limits per endpoint',
          completed: false,
        },
        {
          id: '6-2',
          title: 'Add Helmet.js Security Headers',
          description: 'Configure security headers for Express applications',
          command: 'npm install helmet && app.use(helmet())',
          completed: false,
        },
        {
          id: '6-3',
          title: 'Enable CORS Properly',
          description: 'Configure CORS with whitelist of allowed origins',
          command: 'Set up CORS middleware with origin validation',
          completed: false,
        },
        {
          id: '6-4',
          title: 'Input Validation and Sanitization',
          description: 'Validate and sanitize all user inputs to prevent injection attacks',
          command: 'Use Joi or Yup for schema validation on all endpoints',
          completed: false,
        },
        {
          id: '6-5',
          title: 'Secure Password Hashing',
          description: 'Use bcrypt with proper salt rounds for password storage',
          command: 'Implement bcrypt.hash with 12+ rounds for all passwords',
          completed: false,
        },
        {
          id: '6-6',
          title: 'JWT Token Security',
          description: 'Implement secure JWT with short expiry and refresh tokens',
          command: 'Use RS256 algorithm, 15-min access tokens, secure refresh flow',
          completed: false,
        },
        {
          id: '6-7',
          title: 'SQL Injection Prevention',
          description: 'Use parameterized queries and ORM for all database operations',
          command: 'Replace raw SQL with prepared statements or ORM methods',
          completed: false,
        },
        {
          id: '6-8',
          title: 'Security Audit Logging',
          description: 'Log all authentication attempts, permission changes, and sensitive operations',
          command: 'Implement audit logging middleware for security events',
          completed: false,
        },
      ],
    },
    {
      id: '7',
      title: 'Agent Development and Deployment',
      description: 'Build and deploy cross-platform agents for system monitoring and management',
      category: 'Agent',
      difficulty: 'advanced',
      estimatedTime: '8-10 hours',
      icon: Terminal,
      tags: ['agent', 'golang', 'monitoring', 'deployment'],
      expanded: false,
      steps: [
        {
          id: '7-1',
          title: 'Initialize Go Project',
          description: 'Set up Go module for agent development',
          command: 'go mod init github.com/org/agent && go mod tidy',
          completed: false,
        },
        {
          id: '7-2',
          title: 'System Metrics Collection',
          description: 'Implement CPU, memory, disk, and network metrics gathering',
          command: 'Use gopsutil library for cross-platform system metrics',
          completed: false,
        },
        {
          id: '7-3',
          title: 'Secure Communication',
          description: 'Implement TLS communication with API server',
          command: 'Configure TLS client with certificate pinning',
          completed: false,
        },
        {
          id: '7-4',
          title: 'Configuration Management',
          description: 'Add configuration file parsing and validation',
          command: 'Create config.yaml parser with struct validation',
          completed: false,
        },
        {
          id: '7-5',
          title: 'Heartbeat Mechanism',
          description: 'Implement periodic heartbeat to report agent status',
          command: 'Create ticker-based heartbeat sender every 30 seconds',
          completed: false,
        },
        {
          id: '7-6',
          title: 'Cross-Platform Build',
          description: 'Build agent binaries for Windows, Linux, and macOS',
          command: 'GOOS=linux GOARCH=amd64 go build -o agent-linux',
          completed: false,
        },
        {
          id: '7-7',
          title: 'Service Installation',
          description: 'Create service installer for Windows (MSI) and Linux (systemd)',
          command: 'Build MSI with WiX and systemd service file',
          completed: false,
        },
        {
          id: '7-8',
          title: 'Auto-Update Mechanism',
          description: 'Implement self-update capability with signature verification',
          command: 'Add version check and binary replacement logic',
          completed: false,
        },
      ],
    },
    {
      id: '8',
      title: 'Monitoring and Observability',
      description: 'Set up comprehensive monitoring with Prometheus, Grafana, and distributed tracing',
      category: 'Observability',
      difficulty: 'intermediate',
      estimatedTime: '4-5 hours',
      icon: BarChart3,
      tags: ['monitoring', 'prometheus', 'grafana', 'tracing'],
      expanded: false,
      steps: [
        {
          id: '8-1',
          title: 'Install Prometheus',
          description: 'Set up Prometheus server for metrics collection',
          command: 'docker run -p 9090:9090 prom/prometheus',
          completed: false,
        },
        {
          id: '8-2',
          title: 'Add Metrics Exporters',
          description: 'Instrument applications with Prometheus client libraries',
          command: 'npm install prom-client && expose /metrics endpoint',
          completed: false,
        },
        {
          id: '8-3',
          title: 'Configure Grafana',
          description: 'Install Grafana and connect to Prometheus data source',
          command: 'docker run -p 3000:3000 grafana/grafana',
          completed: false,
        },
        {
          id: '8-4',
          title: 'Create Dashboards',
          description: 'Build Grafana dashboards for application metrics',
          command: 'Import community dashboards and customize for your apps',
          completed: false,
        },
        {
          id: '8-5',
          title: 'Set Up Alerting',
          description: 'Configure alert rules for critical metrics',
          command: 'Create alertmanager rules for high CPU, errors, downtime',
          completed: false,
        },
        {
          id: '8-6',
          title: 'Distributed Tracing',
          description: 'Implement Jaeger or Zipkin for request tracing',
          command: 'Add OpenTelemetry instrumentation to services',
          completed: false,
        },
        {
          id: '8-7',
          title: 'Log Aggregation',
          description: 'Set up centralized logging with ELK or Loki',
          command: 'Configure log shipping from all services',
          completed: false,
        },
      ],
    },
  ]);

  const togglePlaybook = (id: string) => {
    setPlaybooks(
      playbooks.map((pb) => (pb.id === id ? { ...pb, expanded: !pb.expanded } : pb))
    );
  };

  const toggleStep = (playbookId: string, stepId: string) => {
    setPlaybooks(
      playbooks.map((pb) =>
        pb.id === playbookId
          ? {
              ...pb,
              steps: pb.steps.map((step) =>
                step.id === stepId ? { ...step, completed: !step.completed } : step
              ),
            }
          : pb
      )
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'advanced':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Backend: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300',
      Frontend: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300',
      Database: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300',
      DevOps: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300',
      Security: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300',
      Agent: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-300',
      Observability: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-300',
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  const filteredPlaybooks = playbooks.filter((pb) => {
    const matchesSearch =
      pb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pb.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || pb.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800 rounded-xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              className="p-3 bg-white/20 rounded-lg backdrop-blur-sm"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <BookOpen className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Implementation Playbooks</h1>
              <p className="text-indigo-100 text-lg font-medium">
                Step-by-step guides for implementing engineering best practices across the full stack
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total Playbooks', value: playbooks.length.toString(), icon: BookOpen },
              { label: 'Categories', value: '7', icon: Filter },
              {
                label: 'Total Steps',
                value: playbooks.reduce((acc, pb) => acc + pb.steps.length, 0).toString(),
                icon: CheckCircle2,
              },
              { label: 'Avg. Time', value: '4-5 hrs', icon: Clock },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/25"
              >
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className="w-5 h-5" />
                  <span className="text-sm text-indigo-100 font-medium">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search playbooks by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              <option value="all">All Categories</option>
              <option value="Backend">Backend</option>
              <option value="Frontend">Frontend</option>
              <option value="Database">Database</option>
              <option value="DevOps">DevOps</option>
              <option value="Security">Security</option>
              <option value="Agent">Agent</option>
              <option value="Observability">Observability</option>
            </select>
          </div>
        </div>

        {/* Playbooks */}
        <div className="space-y-4">
          {filteredPlaybooks.map((playbook, idx) => {
            const Icon = playbook.icon;
            const completedSteps = playbook.steps.filter((s) => s.completed).length;
            const progress = (completedSteps / playbook.steps.length) * 100;

            return (
              <motion.div
                key={playbook.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                {/* Playbook Header */}
                <button
                  onClick={() => togglePlaybook(playbook.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {playbook.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border-2 ${getCategoryColor(
                            playbook.category
                          )}`}
                        >
                          {playbook.category}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border-2 ${getDifficultyColor(
                            playbook.difficulty
                          )}`}
                        >
                          {playbook.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">
                        {playbook.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">{playbook.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-semibold">
                            {completedSteps}/{playbook.steps.length} steps
                          </span>
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {playbook.expanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </button>

                {/* Playbook Steps */}
                <AnimatePresence>
                  {playbook.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="p-6 space-y-4">
                        {playbook.steps.map((step, stepIdx) => (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: stepIdx * 0.05 }}
                            className={`p-4 rounded-lg border-2 ${
                              step.completed
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleStep(playbook.id, step.id)}
                                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  step.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-400 dark:border-gray-500 hover:border-indigo-500'
                                }`}
                              >
                                {step.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                              </button>
                              <div className="flex-1">
                                <h4
                                  className={`font-bold mb-1 ${
                                    step.completed
                                      ? 'text-green-800 dark:text-green-300 line-through'
                                      : 'text-gray-900 dark:text-gray-100'
                                  }`}
                                >
                                  Step {stepIdx + 1}: {step.title}
                                </h4>
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
                                  {step.description}
                                </p>
                                {step.command && (
                                  <div className="bg-gray-900 dark:bg-black rounded p-3 font-mono text-sm text-green-400 overflow-x-auto">
                                    <code>{step.command}</code>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
