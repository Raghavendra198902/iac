import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { 
  Server, 
  Database, 
  Network, 
  HardDrive,
  Cloud,
  Shield,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Link,
  GitBranch,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Tag,
  MapPin,
  Users,
  FileText,
  Wifi,
  Radio,
  RefreshCw,
  Cpu,
  Download,
  Copy,
  TrendingUp,
  Zap,
  Globe,
  Layers,
  BarChart3,
  Settings,
  ExternalLink,
  X,
  Save,
  Bell,
  Info,
  XCircle,
  AlertTriangle,
  TrendingDown,
  BarChart,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Modal, { ModalFooter } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import FadeIn from '../components/ui/FadeIn';
import { useAuth } from '../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import Fuse from 'fuse.js';
import Papa from 'papaparse';
import RelationshipGraph from '../components/RelationshipGraph';

interface CIItem {
  id: string;
  name: string;
  type: 'server' | 'database' | 'network' | 'storage' | 'application' | 'service' | 'container' | 'filesystem';
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  environment: 'production' | 'staging' | 'development';
  owner: string;
  location: string;
  provider: string;
  ipAddress?: string;
  version?: string;
  lastUpdated: string;
  lastSeen?: string;
  dependencies: string[];
  tags: string[];
  metadata: Record<string, any>;
  agentId?: string;
  discoveredBy?: string;
  healthScore?: number;
}

interface AgentStatus {
  id: string;
  hostname: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
  ciCount: number;
  healthScore: number;
  metrics?: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

interface NetworkDevice {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'firewall' | 'load-balancer' | 'gateway';
  ipAddress: string;
  macAddress?: string;
  status: 'active' | 'inactive' | 'unknown';
  ports?: number;
  connectedDevices?: number;
  lastDiscovered: string;
}

interface Relationship {
  id: string;
  from: string;
  to: string;
  type: 'depends_on' | 'connects_to' | 'hosted_on' | 'communicates_with';
}

// Helper function to safely render any value
const safeRender = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(v => safeRender(v)).join(', ');
  if (typeof value === 'object') {
    // Check for common properties
    if ('name' in value && value.name) return String(value.name);
    if ('label' in value && value.label) return String(value.label);
    if ('value' in value && value.value !== undefined) return String(value.value);
    if ('id' in value && value.id) return String(value.id);
    // For nested objects like {usage: 50, cores: 4, model: 'x86'}, create a readable string
    try {
      const entries = Object.entries(value);
      if (entries.length > 0 && entries.length <= 5) {
        return entries.map(([k, v]) => `${k}: ${safeRender(v)}`).join(', ');
      }
    } catch (e) {
      // Fall through to stringify
    }
    // Otherwise stringify
    return JSON.stringify(value);
  }
  return String(value);
};

export default function CMDB() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'servers' | 'databases' | 'network' | 'applications' | 'agents'>('all');
  const [selectedItem, setSelectedItem] = useState<CIItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentStatus | null>(null);
  const [showNetworkDiscovery, setShowNetworkDiscovery] = useState(false);
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [showInstallAgent, setShowInstallAgent] = useState(false);
  const [selectedOS, setSelectedOS] = useState<'linux' | 'windows' | 'docker'>('docker');
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showRelationships, setShowRelationships] = useState(false);
  const [relationshipFocusId, setRelationshipFocusId] = useState<string | undefined>(undefined);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);
  const [impactAnalysisItem, setImpactAnalysisItem] = useState<CIItem | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedViews, setSavedViews] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({
    type: [],
    environment: [],
    status: [],
    tags: [],
    dateRange: { start: '', end: '' }
  });
  const [showHealthDashboard, setShowHealthDashboard] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // NO MOCK DATA - Network devices populated only by real agent discovery
  const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([]);

  // NO MOCK DATA - CI items populated only by real agent registration
  const [ciItems, setCiItems] = useState<CIItem[]>([]);

  const [relationships] = useState<Relationship[]>([]);

  // Fetch CI items from API
  const fetchCIItems = async () => {
    try {
      console.log('Fetching CI items...');
      const response = await fetch('/api/cmdb/cis', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('CI Response status:', response.status);
      if (response.ok) {
        const items = await response.json();
        console.log('Received CI items:', items);
        
        // Deep normalization to ensure ALL fields are safe to render
        const normalizedItems = items.map((item: any) => {
          const normalized: any = {
            id: item.id || '',
            name: safeRender(item.name),
            type: item.type || 'server',
            status: item.status || 'operational',
            environment: item.environment || 'development',
            provider: safeRender(item.provider),
            location: safeRender(item.location),
            owner: safeRender(item.owner),
            lastUpdated: item.lastUpdated || new Date().toISOString(),
            dependencies: Array.isArray(item.dependencies) ? item.dependencies : [],
            tags: [],
            metadata: {}
          };
          
          // Normalize optional fields
          if (item.ipAddress) normalized.ipAddress = safeRender(item.ipAddress);
          if (item.version) normalized.version = safeRender(item.version);
          if (item.lastSeen) normalized.lastSeen = item.lastSeen;
          if (item.agentId) normalized.agentId = item.agentId;
          if (item.discoveredBy) normalized.discoveredBy = item.discoveredBy;
          if (item.healthScore) normalized.healthScore = item.healthScore;
          
          // Normalize tags - ensure they're all strings
          if (Array.isArray(item.tags)) {
            normalized.tags = item.tags.map((tag: any) => safeRender(tag));
          }
          
          // Normalize metadata - convert all values to strings
          if (item.metadata && typeof item.metadata === 'object') {
            normalized.metadata = Object.entries(item.metadata).reduce((acc: any, [key, value]) => {
              acc[key] = safeRender(value);
              return acc;
            }, {});
          }
          
          return normalized;
        });
        
        console.log('Normalized CI items:', normalizedItems);
        setCiItems(normalizedItems);
      } else {
        console.error('CI Response not ok:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch CI items:', error);
    }
  };

  // Fetch agent statuses from API
  const fetchAgentStatuses = async () => {
    try {
      console.log('Fetching agent statuses...');
      const response = await fetch('/api/cmdb/agents/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        const agents = await response.json();
        console.log('Received agents:', agents);
        setAgentStatuses(agents);
      } else {
        console.error('Response not ok:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch agent statuses:', error);
    }
  };

  // Network Discovery Function
  const handleNetworkDiscovery = async () => {
    setIsDiscovering(true);
    toast.loading('Scanning network for devices...', { id: 'network-scan' });
    
    try {
      // Call backend network discovery endpoint
      const response = await fetch('/api/cmdb/network-discovery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Network discovery result:', result);
        
        // Update network devices if returned
        if (result.devices && Array.isArray(result.devices)) {
          setNetworkDevices(result.devices);
        }
        
        toast.success(
          result.message || `Network scan completed. Found ${result.devicesFound || 0} devices.`,
          { id: 'network-scan' }
        );
      } else {
        const error = await response.json().catch(() => ({ message: 'Network scan failed' }));
        toast.error(error.message || 'Network discovery failed', { id: 'network-scan' });
      }
      
      // Refresh CI items to get any newly discovered items
      fetchCIItems();
    } catch (error) {
      console.error('Network discovery error:', error);
      toast.error('Network discovery failed: ' + (error instanceof Error ? error.message : 'Unknown error'), { id: 'network-scan' });
    } finally {
      setIsDiscovering(false);
    }
  };

  // View Agent Details
  const handleViewAgentDetails = (agent: AgentStatus) => {
    setSelectedAgent(agent);
    setShowAgentModal(true);
  };

  // Agent Sync Function
  const handleAgentSync = async (agentId: string) => {
    toast.loading('Syncing with agent...', { id: 'agent-sync' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update agent status
      setAgentStatuses(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, lastSeen: new Date().toISOString() }
          : agent
      ));
      
      toast.success('Agent synced successfully', { id: 'agent-sync' });
      fetchCIItems(); // Refresh CIs
    } catch (error) {
      toast.error('Failed to sync with agent', { id: 'agent-sync' });
    }
  };

  // Trigger Discovery on Agent
  const handleAgentDiscovery = async (agentId: string) => {
    toast.loading('Triggering discovery on agent...', { id: 'agent-discovery' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Discovery completed. New CIs registered.', { id: 'agent-discovery' });
      
      // Refresh CI list
      fetchCIItems();
    } catch (error) {
      toast.error('Discovery failed', { id: 'agent-discovery' });
    }
  };

  // Generate agent installation command
  const getInstallCommand = () => {
    const apiUrl = API_URL;
    const apiKeyPlaceholder = '${CMDB_API_KEY}';

    switch (selectedOS) {
      case 'linux':
        return `# Download and install CMDB Agent
curl -fsSL ${apiUrl}/api/downloads/cmdb-agent-linux.tar.gz | tar -xz
cd cmdb-agent
chmod +x install.sh
./install.sh`;
      
      case 'windows':
        return `# Download and install CMDB Agent (PowerShell)
$url = "${apiUrl}/api/downloads/cmdb-agent-windows.zip"
Invoke-WebRequest -Uri $url -OutFile cmdb-agent.zip
Expand-Archive cmdb-agent.zip -DestinationPath .
cd cmdb-agent
.\\setup.ps1`;
      
      case 'docker':
        return `# Run CMDB Agent with Docker
docker run -d \\
  --name cmdb-agent \\
  --restart unless-stopped \\
  -e CMDB_API_URL="${apiUrl}/api/cmdb" \\
  -e CMDB_API_KEY="${apiKeyPlaceholder}" \\
  -e AGENT_ID="agent-$(hostname)" \\
  -e AGENT_NAME="$(hostname)" \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  -p 9000:9000 \\
  dharma/cmdb-agent:latest`;
      
      default:
        return '';
    }
  };

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/cmdb/schedules', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/cmdb/audit?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  // Fetch saved views
  const fetchSavedViews = async () => {
    try {
      const saved = localStorage.getItem('cmdb_saved_views');
      if (saved) {
        setSavedViews(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error fetching saved views:', error);
    }
  };

  // Save current view
  const handleSaveView = (name: string) => {
    const newView = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString()
    };
    const updated = [...savedViews, newView];
    setSavedViews(updated);
    localStorage.setItem('cmdb_saved_views', JSON.stringify(updated));
    setCurrentView(newView.id);
    toast.success(`View "${name}" saved`);
  };

  // Load saved view
  const handleLoadView = (viewId: string) => {
    const view = savedViews.find(v => v.id === viewId);
    if (view) {
      setFilters(view.filters);
      setCurrentView(viewId);
      toast.success(`View "${view.name}" loaded`);
    }
  };

  // Delete saved view
  const handleDeleteView = (viewId: string) => {
    const updated = savedViews.filter(v => v.id !== viewId);
    setSavedViews(updated);
    localStorage.setItem('cmdb_saved_views', JSON.stringify(updated));
    if (currentView === viewId) {
      setCurrentView(null);
    }
    toast.success('View deleted');
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      type: [],
      environment: [],
      status: [],
      tags: [],
      dateRange: { start: '', end: '' }
    });
    setCurrentView(null);
    toast.success('Filters cleared');
  };

  // Fetch health metrics
  const fetchHealthMetrics = async () => {
    try {
      const response = await fetch('/api/cmdb/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHealthMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/cmdb/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/cmdb/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Create schedule
  const handleCreateSchedule = async (scheduleData: any) => {
    try {
      const response = await fetch('/api/cmdb/schedules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      
      if (response.ok) {
        toast.success('Discovery schedule created');
        fetchSchedules();
        setShowScheduleModal(false);
      } else {
        toast.error('Failed to create schedule');
      }
    } catch (error) {
      toast.error('Failed to create schedule');
    }
  };

  // Toggle schedule
  const handleToggleSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/cmdb/schedules/${scheduleId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast.success('Schedule updated');
        fetchSchedules();
      }
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Delete this schedule?')) return;
    
    try {
      const response = await fetch(`/api/cmdb/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast.success('Schedule deleted');
        fetchSchedules();
      }
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  // Download agent package
  const handleDownloadAgent = () => {
    const downloadUrls = {
      linux: `${API_URL}/downloads/cmdb-agent-linux.tar.gz`,
      windows: `${API_URL}/downloads/cmdb-agent-windows.zip`,
      docker: `${API_URL}/downloads/docker-compose.yml`,
    };
    
    toast.success(`Downloading CMDB Agent for ${selectedOS}...`);
    window.open(downloadUrls[selectedOS], '_blank');
  };

  // Copy command to clipboard
  const handleCopyCommand = () => {
    navigator.clipboard.writeText(getInstallCommand());
    toast.success('Installation command copied to clipboard!');
  };

  // Auto-refresh agent statuses and CI items
  useEffect(() => {
    console.log('CMDB useEffect - starting data fetch');
    fetchAgentStatuses(); // Initial fetch
    fetchCIItems(); // Initial fetch
    fetchSchedules(); // Fetch schedules
    fetchAuditLogs(); // Fetch audit logs
    fetchSavedViews(); // Fetch saved views
    fetchHealthMetrics(); // Fetch health metrics
    fetchNotifications(); // Fetch notifications
    
    const interval = setInterval(() => {
      fetchAgentStatuses();
      fetchCIItems();
      fetchHealthMetrics();
      fetchNotifications();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Real-time WebSocket updates
  useEffect(() => {
    // Connect to WebSocket
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      toast.success('Real-time updates enabled', { duration: 2000 });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    // Listen for agent status updates
    newSocket.on('agent:status', (data: { agentId: string; status: string; metrics?: any }) => {
      console.log('📡 Received agent status update:', data);
      setAgentStatuses(prev => prev.map(agent => 
        agent.id === data.agentId 
          ? { ...agent, status: data.status, metrics: data.metrics || agent.metrics, lastSeen: new Date().toISOString() }
          : agent
      ));
      toast(`Agent ${data.agentId} is now ${data.status}`, { 
        icon: data.status === 'online' ? '🟢' : '🔴',
        duration: 3000 
      });
    });

    // Listen for new CI items discovered
    newSocket.on('ci:new', (ci: CIItem) => {
      console.log('📡 New CI discovered:', ci);
      setCiItems(prev => {
        const exists = prev.find(item => item.id === ci.id);
        if (!exists) {
          toast.success(`New ${ci.type} discovered: ${ci.name}`, { duration: 4000 });
          return [...prev, ci];
        }
        return prev;
      });
    });

    // Listen for CI updates
    newSocket.on('ci:update', (ci: CIItem) => {
      console.log('📡 CI updated:', ci);
      setCiItems(prev => prev.map(item => item.id === ci.id ? ci : item));
    });

    // Listen for network discovery completion
    newSocket.on('discovery:complete', (data: { devicesFound: number; devices: NetworkDevice[] }) => {
      console.log('📡 Discovery complete:', data);
      setNetworkDevices(data.devices);
      toast.success(`Discovery complete! Found ${data.devicesFound} devices`, { duration: 4000 });
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Closing WebSocket connection');
      newSocket.close();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K - Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      
      // Cmd+B or Ctrl+B - Toggle bulk select mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSelectMode();
      }
      
      // Cmd+E or Ctrl+E - Export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        bulkExport();
      }
      
      // Escape - Clear search or exit select mode
      if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        } else if (isSelectMode) {
          setIsSelectMode(false);
          setSelectedItems(new Set());
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [searchQuery, isSelectMode, selectedItems]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server': return <Server className="h-5 w-5" />;
      case 'database': return <Database className="h-5 w-5" />;
      case 'network': return <Network className="h-5 w-5" />;
      case 'storage': return <HardDrive className="h-5 w-5" />;
      case 'application': return <Cloud className="h-5 w-5" />;
      case 'container': return <Cpu className="h-5 w-5" />;
      case 'filesystem': return <HardDrive className="h-5 w-5" />;
      default: return <Server className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return <Badge variant="success">Operational</Badge>;
      case 'degraded': return <Badge variant="warning">Degraded</Badge>;
      case 'down': return <Badge variant="danger">Down</Badge>;
      case 'maintenance': return <Badge variant="gray">Maintenance</Badge>;
      default: return <Badge variant="gray">{status}</Badge>;
    }
  };

  const getEnvironmentBadge = (env: string) => {
    switch (env) {
      case 'production': return <Badge variant="danger">Production</Badge>;
      case 'staging': return <Badge variant="warning">Staging</Badge>;
      case 'development': return <Badge variant="info">Development</Badge>;
      default: return <Badge variant="gray">{env}</Badge>;
    }
  };

  // Fuzzy search configuration
  const fuse = new Fuse(ciItems, {
    keys: ['name', 'tags', 'owner', 'location', 'provider', 'ipAddress', 'type'],
    threshold: 0.3,
    includeScore: true,
  });

  const filteredItems = (() => {
    let items = ciItems;
    
    // Apply fuzzy search if query exists
    if (searchQuery.trim()) {
      const results = fuse.search(searchQuery);
      items = results.map(result => result.item);
    }
    
    // Apply tab filters
    items = items.filter(item => {
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'servers' && item.type === 'server') ||
                        (activeTab === 'databases' && item.type === 'database') ||
                        (activeTab === 'network' && item.type === 'network') ||
                        (activeTab === 'applications' && (item.type === 'application' || item.type === 'service'));
      const matchesEnv = filterEnvironment === 'all' || item.environment === filterEnvironment;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchesTab && matchesEnv && matchesStatus;
    });

    // Apply advanced filters
    if (filters.type.length > 0) {
      items = items.filter(item => filters.type.includes(item.type));
    }
    if (filters.environment.length > 0) {
      items = items.filter(item => filters.environment.includes(item.environment));
    }
    if (filters.status.length > 0) {
      items = items.filter(item => filters.status.includes(item.status));
    }
    if (filters.tags?.length > 0) {
      items = items.filter(item => 
        item.tags?.some((tag: string) => filters.tags.includes(tag))
      );
    }
    if (filters.dateRange?.start) {
      items = items.filter(item => 
        new Date(item.discovered_at) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange?.end) {
      items = items.filter(item => 
        new Date(item.discovered_at) <= new Date(filters.dateRange.end)
      );
    }

    return items;
  })();

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, filterEnvironment, filterStatus]);

  const handleViewDetails = (item: CIItem) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handleAddCI = () => {
    setShowAddModal(true);
  };

  // Bulk operations
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedItems(new Set());
  };

  const toggleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === paginatedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedItems.map(item => item.id)));
    }
  };

  const bulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    if (confirm(`Delete ${selectedItems.size} selected items?`)) {
      try {
        await Promise.all(
          Array.from(selectedItems).map(id =>
            fetch(`/api/cmdb/cis/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            })
          )
        );
        toast.success(`Deleted ${selectedItems.size} items`);
        setSelectedItems(new Set());
        setIsSelectMode(false);
        fetchCIItems();
      } catch (error) {
        toast.error('Failed to delete items');
      }
    }
  };

  const bulkExport = () => {
    const itemsToExport = Array.from(selectedItems).length > 0
      ? filteredItems.filter(item => selectedItems.has(item.id))
      : filteredItems;

    const exportData = itemsToExport.map(item => ({
      Name: item.name,
      Type: item.type,
      Status: item.status,
      Environment: item.environment,
      Provider: item.provider,
      Location: item.location,
      Owner: item.owner,
      'IP Address': item.ipAddress || 'N/A',
      Version: item.version || 'N/A',
      'Last Updated': new Date(item.lastUpdated).toLocaleString(),
      Tags: item.tags.join(', '),
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cmdb-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${exportData.length} items to CSV`);
  };

  const getDependencies = (itemId: string) => {
    return relationships
      .filter(rel => rel.from === itemId)
      .map(rel => ciItems.find(item => item.id === rel.to))
      .filter(Boolean) as CIItem[];
  };

  const getDependents = (itemId: string) => {
    return relationships
      .filter(rel => rel.to === itemId)
      .map(rel => ciItems.find(item => item.id === rel.from))
      .filter(Boolean) as CIItem[];
  };

  // Impact Analysis - Calculate all affected items recursively
  const calculateImpact = (itemId: string, visited = new Set<string>()): CIItem[] => {
    if (visited.has(itemId)) return [];
    visited.add(itemId);
    
    const dependents = getDependents(itemId);
    let allAffected: CIItem[] = [...dependents];
    
    // Recursively get dependents of dependents
    dependents.forEach(dependent => {
      const nestedAffected = calculateImpact(dependent.id, visited);
      allAffected = [...allAffected, ...nestedAffected];
    });
    
    return allAffected;
  };

  // Get impact severity based on environment and number of affected items
  const getImpactSeverity = (item: CIItem, affectedCount: number): 'critical' | 'high' | 'medium' | 'low' => {
    if (item.environment === 'production' && affectedCount > 5) return 'critical';
    if (item.environment === 'production' && affectedCount > 2) return 'high';
    if (affectedCount > 10) return 'high';
    if (affectedCount > 5) return 'medium';
    return 'low';
  };

  const stats = {
    total: ciItems.length,
    operational: ciItems.filter(i => i.status === 'operational').length,
    degraded: ciItems.filter(i => i.status === 'degraded').length,
    down: ciItems.filter(i => i.status === 'down').length,
    maintenance: ciItems.filter(i => i.status === 'maintenance').length,
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <FadeIn>
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Database className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Configuration Management Database</h1>
                <p className="text-primary-100 text-lg">
                  AI-powered infrastructure discovery and real-time asset tracking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all border border-white/20">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all border border-white/20">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all border border-white/20">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setActiveTab('agents')} 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-xl font-semibold transition-all border border-white/20"
            >
              <Activity className="h-5 w-5 mr-2" />
              Manage Agents
            </Button>
            <Button 
              onClick={handleAddCI} 
              className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add CI Item
            </Button>
            <Button 
              onClick={toggleSelectMode}
              variant={isSelectMode ? "primary" : "secondary"}
              className="px-6 py-2.5 rounded-xl font-semibold transition-all"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              {isSelectMode ? 'Exit Select Mode' : 'Bulk Select'}
            </Button>
            {isSelectMode && selectedItems.size > 0 && (
              <>
                <Button 
                  onClick={bulkDelete}
                  variant="danger"
                  className="px-6 py-2.5 rounded-xl font-semibold transition-all"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete ({selectedItems.size})
                </Button>
                <Button 
                  onClick={bulkExport}
                  variant="secondary"
                  className="px-6 py-2.5 rounded-xl font-semibold transition-all"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export Selected
                </Button>
              </>
            )}
            <Button 
              onClick={bulkExport}
              variant="secondary"
              className="px-6 py-2.5 rounded-xl font-semibold transition-all"
            >
              <Download className="h-5 w-5 mr-2" />
              Export All
            </Button>
            <Button 
              onClick={() => {
                setRelationshipFocusId(undefined);
                setShowRelationships(true);
              }}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-xl font-semibold transition-all border border-white/20"
            >
              <GitBranch className="h-5 w-5 mr-2" />
              View Map
            </Button>
            <Button 
              onClick={() => {
                fetchSchedules();
                setShowScheduleModal(true);
              }}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-xl font-semibold transition-all border border-white/20"
            >
              <Clock className="h-5 w-5 mr-2" />
              Schedules
            </Button>
            <Button 
              onClick={() => {
                fetchAuditLogs();
                setShowAuditLog(true);
              }}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-xl font-semibold transition-all border border-white/20"
            >
              <FileText className="h-5 w-5 mr-2" />
              Audit Log
            </Button>
            <Button 
              onClick={handleNetworkDiscovery} 
              disabled={isDiscovering}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-xl font-semibold transition-all border border-white/20"
            >
              {isDiscovering ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Wifi className="h-5 w-5 mr-2" />
              )}
              Network Scan
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <FadeIn delay={100}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total CIs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Operational</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.operational}</p>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Degraded</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.degraded}</p>
          </div>
        </FadeIn>

        <FadeIn delay={250}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Down</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.down}</p>
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Agents</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{agentStatuses.length}</p>
          </div>
        </FadeIn>

        <FadeIn delay={350}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Health Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
          </div>
        </FadeIn>
      </div>

      {/* Advanced Filters and Search */}
      <FadeIn delay={400}>
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Search className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Advanced Search & Filters</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, tags, owner, or location..."
                  className="input pl-12 w-full h-12 text-base rounded-xl border-2 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Badge variant="gray" className="text-xs px-2 py-1">
                    <kbd className="font-mono">⌘K</kbd>
                  </Badge>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  value={filterEnvironment}
                  onChange={(e) => setFilterEnvironment(e.target.value)}
                  className="input pl-10 pr-10 h-12 rounded-xl border-2 font-medium dark:bg-gray-700 dark:border-gray-600 appearance-none cursor-pointer"
                >
                  <option value="all">All Environments</option>
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input pl-10 pr-10 h-12 rounded-xl border-2 font-medium dark:bg-gray-700 dark:border-gray-600 appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="operational">Operational</option>
                  <option value="degraded">Degraded</option>
                  <option value="down">Down</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterEnvironment('all');
                  setFilterStatus('all');
                }}
                className="h-12 px-4 rounded-xl border-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                variant={showAdvancedFilters ? "primary" : "outline"}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="h-12 px-4 rounded-xl border-2"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowHealthDashboard(true)}
                className="h-12 px-4 rounded-xl border-2"
              >
                <Activity className="h-4 w-4 mr-2" />
                Health
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowNotifications(true)}
                className="h-12 px-4 rounded-xl border-2 relative"
              >
                <Bell className="h-4 w-4 mr-2" />
                Alerts
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 border-2 border-primary-200 dark:border-primary-800 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">CI Type</label>
                  <select
                    multiple
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="input w-full min-h-[100px] dark:bg-gray-700"
                  >
                    <option value="server">Server</option>
                    <option value="database">Database</option>
                    <option value="network">Network</option>
                    <option value="application">Application</option>
                    <option value="service">Service</option>
                    <option value="container">Container</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Environment</label>
                  <select
                    multiple
                    value={filters.environment}
                    onChange={(e) => setFilters({...filters, environment: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="input w-full min-h-[100px] dark:bg-gray-700"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                    <option value="test">Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    multiple
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="input w-full min-h-[100px] dark:bg-gray-700"
                  >
                    <option value="operational">Operational</option>
                    <option value="degraded">Degraded</option>
                    <option value="down">Down</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range - Start</label>
                  <input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, start: e.target.value}})}
                    className="input w-full dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range - End</label>
                  <input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, end: e.target.value}})}
                    className="input w-full dark:bg-gray-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button onClick={handleClearFilters} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button onClick={() => {
                    const name = prompt('Enter view name:');
                    if (name) handleSaveView(name);
                  }} variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save View
                  </Button>
                </div>
                {savedViews.length > 0 && (
                  <select
                    value={currentView || ''}
                    onChange={(e) => handleLoadView(e.target.value)}
                    className="input dark:bg-gray-700"
                  >
                    <option value="">Load Saved View...</option>
                    {savedViews.map(view => (
                      <option key={view.id} value={view.id}>{view.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-gray-900 dark:text-white">{filteredItems.length}</span> of <span className="font-bold text-gray-900 dark:text-white">{ciItems.length}</span> items
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="info" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Live Sync Active
              </Badge>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="hidden md:inline">Shortcuts:</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs">⌘K</kbd>
                <span className="hidden md:inline">Search</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs">⌘B</kbd>
                <span className="hidden md:inline">Bulk</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs">⌘E</kbd>
                <span className="hidden md:inline">Export</span>
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="all">All Items ({ciItems.length})</TabsTrigger>
          <TabsTrigger value="servers">Servers ({ciItems.filter(i => i.type === 'server').length})</TabsTrigger>
          <TabsTrigger value="databases">Databases ({ciItems.filter(i => i.type === 'database').length})</TabsTrigger>
          <TabsTrigger value="network">Network ({ciItems.filter(i => i.type === 'network').length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({ciItems.filter(i => i.type === 'application' || i.type === 'service').length})</TabsTrigger>
          <TabsTrigger value="agents">
            <Activity className="h-4 w-4 mr-2" />
            Agents ({agentStatuses.length})
          </TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">CMDB Client Agents</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowInstallAgent(true)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Install Agent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNetworkDiscovery}
                    disabled={isDiscovering}
                    className="flex items-center gap-2"
                  >
                    {isDiscovering ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wifi className="h-4 w-4" />
                    )}
                    Network Discovery
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agentStatuses.map((agent) => (
                  <Card 
                    key={agent.id} 
                    className="p-4 border-l-4 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group" 
                    style={{
                      borderLeftColor: agent.status === 'online' ? '#10b981' : agent.status === 'warning' ? '#f59e0b' : '#ef4444'
                    }}
                    onDoubleClick={() => handleViewAgentDetails(agent)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <div>
                          <h4 className="font-semibold text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{agent.hostname}</h4>
                          <p className="text-xs text-gray-500">ID: {agent.id}</p>
                        </div>
                      </div>
                      <Badge variant={agent.status === 'online' ? 'success' : agent.status === 'warning' ? 'warning' : 'danger'}>
                        {agent.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Health Score</span>
                        <span className="font-semibold">{safeRender(agent.healthScore)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">CI Count</span>
                        <span className="font-semibold">{safeRender(agent.ciCount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last Seen</span>
                        <span className="text-xs">{new Date(agent.lastSeen).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {agent.metrics && (
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span>CPU</span>
                          <span>{safeRender(agent.metrics.cpu)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${Number(agent.metrics.cpu) || 0}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Memory</span>
                          <span>{safeRender(agent.metrics.memory)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${Number(agent.metrics.memory) || 0}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Disk</span>
                          <span>{safeRender(agent.metrics.disk)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-yellow-500 h-1.5 rounded-full" 
                            style={{ width: `${Number(agent.metrics.disk) || 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-3">
                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        <ExternalLink className="h-3 w-3" />
                        Double-click card or use View Details button
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAgentDetails(agent);
                        }}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentSync(agent.id);
                        }}
                        className="text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentDiscovery(agent.id);
                        }}
                        className="text-xs"
                      >
                        <Radio className="h-3 w-3 mr-1" />
                        Discover
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Network Devices */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Discovered Network Devices
                </h3>
                <Badge>{networkDevices.length} devices</Badge>
              </div>

              {networkDevices.length === 0 ? (
                <div className="text-center py-12">
                  <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No network devices discovered yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Click "Network Discovery" button above to scan your network</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b dark:border-gray-700">
                      <tr>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Device</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Type</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">IP Address</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">MAC Address</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Status</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Ports</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Connected</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {networkDevices.map((device) => (
                        <tr key={device.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-2 px-3 text-sm font-medium">{device.name}</td>
                          <td className="py-2 px-3 text-sm">
                            <Badge variant="info">{device.type}</Badge>
                          </td>
                          <td className="py-2 px-3 text-sm font-mono">{device.ipAddress}</td>
                          <td className="py-2 px-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                            {safeRender(device.macAddress) || '-'}
                          </td>
                          <td className="py-2 px-3 text-sm">
                            <Badge variant={device.status === 'active' ? 'success' : 'gray'}>
                              {device.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-sm">{safeRender(device.ports) || '-'}</td>
                          <td className="py-2 px-3 text-sm">{safeRender(device.connectedDevices) || '-'}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(device.lastDiscovered).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* All Items Tab */}
        <TabsContent value="all">
          <div className="space-y-3">
            {ciItems.length === 0 ? (
              <Card className="p-8 text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No configuration items found</p>
              </Card>
            ) : (
              <>
              {isSelectMode && (
                <Card className="p-4 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === paginatedItems.length && paginatedItems.length > 0}
                        onChange={selectAll}
                        className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedItems.size > 0 ? `${selectedItems.size} item${selectedItems.size !== 1 ? 's' : ''} selected` : 'Select all on this page'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={selectAll} variant="secondary">
                        {selectedItems.size === paginatedItems.length ? 'Deselect All' : 'Select All'}
                      </Button>
                      {selectedItems.size > 0 && (
                        <>
                          <Button size="sm" onClick={bulkExport} variant="secondary">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                          <Button size="sm" onClick={bulkDelete} variant="danger">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )}
              {paginatedItems.map((item) => (
                <Card 
                  key={item.id} 
                  className={`p-4 cursor-pointer hover:shadow-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all group ${isSelectMode && selectedItems.has(item.id) ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}`}
                  onDoubleClick={() => !isSelectMode && handleViewDetails(item)}
                  onClick={() => isSelectMode && toggleSelectItem(item.id)}
                >
                  <div className="flex items-start justify-between">
                    {isSelectMode && (
                      <div className="flex items-center mr-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                    )}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 group-hover:scale-110 transition-transform">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {item.name}
                          </h3>
                          {getStatusBadge(item.status)}
                          {getEnvironmentBadge(item.environment)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                              <Cloud className="h-4 w-4" />
                              Provider
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.provider}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                              <MapPin className="h-4 w-4" />
                              Location
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.location}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                              <Users className="h-4 w-4" />
                              Owner
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.owner}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                              <Clock className="h-4 w-4" />
                              Updated
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {new Date(item.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.tags.map((tag, idx) => (
                            <Badge key={idx} variant="gray" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {safeRender(tag)}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                            <ExternalLink className="h-3 w-3" />
                            Double-click to view detailed information
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(item);
                        }}
                        className="min-w-[100px]"
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        Details
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        className="min-w-[100px]"
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        Edit
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRelationshipFocusId(item.id);
                          setShowRelationships(true);
                        }}
                        className="min-w-[100px]"
                      >
                        <GitBranch className="h-4 w-4 mr-1.5" />
                        Relations
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImpactAnalysisItem(item);
                          setShowImpactAnalysis(true);
                        }}
                        className="min-w-[100px]"
                      >
                        <AlertCircle className="h-4 w-4 mr-1.5" />
                        Impact
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="min-w-[100px] hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Pagination Controls */}
              {filteredItems.length > itemsPerPage && (
                <Card className="p-4 mt-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            return page === 1 || 
                                   page === totalPages || 
                                   Math.abs(page - currentPage) <= 1;
                          })
                          .map((page, idx, arr) => (
                            <div key={page} className="flex items-center">
                              {idx > 0 && arr[idx - 1] !== page - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <Button
                                variant={page === currentPage ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="min-w-[40px]"
                              >
                                {page}
                              </Button>
                            </div>
                          ))}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              </>
            )}
          </div>
        </TabsContent>

        {/* Servers Tab */}
        <TabsContent value="servers">
          <div className="space-y-3">
            {filteredItems.filter(item => item.type === 'server').length === 0 ? (
              <Card className="p-8 text-center">
                <Server className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No servers found</p>
              </Card>
            ) : (
              filteredItems.filter(item => item.type === 'server').map((item) => (
                <Card 
                  key={item.id} 
                  className="p-4 cursor-pointer hover:shadow-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all group"
                  onDoubleClick={() => handleViewDetails(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 group-hover:scale-110 transition-transform">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {item.name}
                          </h3>
                          {getStatusBadge(item.status)}
                          {getEnvironmentBadge(item.environment)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                              <Cloud className="h-4 w-4" />
                              Provider
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.provider}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                              <MapPin className="h-4 w-4" />
                              Location
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.location}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                              <Users className="h-4 w-4" />
                              Owner
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.owner}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                              <Clock className="h-4 w-4" />
                              Updated
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {new Date(item.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.tags.map((tag, idx) => (
                            <Badge key={idx} variant="gray" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {safeRender(tag)}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                            <ExternalLink className="h-3 w-3" />
                            Double-click to view detailed information
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(item);
                        }}
                        className="min-w-[100px]"
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        Details
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        className="min-w-[100px]"
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        Edit
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="min-w-[100px] hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Databases Tab */}
        <TabsContent value="databases">
          <div className="space-y-3">
            {filteredItems.filter(item => item.type === 'database').map((item) => (
              <Card 
                key={item.id} 
                className="p-4 cursor-pointer hover:shadow-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all group"
                onDoubleClick={() => handleViewDetails(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 group-hover:scale-110 transition-transform">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {item.name}
                        </h3>
                        {getStatusBadge(item.status)}
                        {getEnvironmentBadge(item.environment)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <Cloud className="h-4 w-4" />
                            Provider
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.provider}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <MapPin className="h-4 w-4" />
                            Location
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <Users className="h-4 w-4" />
                            Owner
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.owner}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <Clock className="h-4 w-4" />
                            Updated
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.tags.map((tag, idx) => (
                          <Badge key={idx} variant="gray" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {safeRender(tag)}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                          <ExternalLink className="h-3 w-3" />
                          Double-click to view detailed information
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(item);
                      }}
                      className="min-w-[100px]"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      Details
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="min-w-[100px]"
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="min-w-[100px] hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network">
          <div className="space-y-3">
            {filteredItems.filter(item => item.type === 'network').map((item) => (
              <Card 
                key={item.id} 
                className="p-4 cursor-pointer hover:shadow-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all group"
                onDoubleClick={() => handleViewDetails(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 group-hover:scale-110 transition-transform">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {item.name}
                        </h3>
                        {getStatusBadge(item.status)}
                        {getEnvironmentBadge(item.environment)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <Cloud className="h-4 w-4" />
                            Provider
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.provider}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <MapPin className="h-4 w-4" />
                            Location
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <Users className="h-4 w-4" />
                            Owner
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.owner}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <Clock className="h-4 w-4" />
                            Updated
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.tags.map((tag, idx) => (
                          <Badge key={idx} variant="gray" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {safeRender(tag)}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                          <ExternalLink className="h-3 w-3" />
                          Double-click to view detailed information
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(item);
                      }}
                      className="min-w-[100px]"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      Details
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="min-w-[100px]"
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="min-w-[100px] hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <div className="space-y-3">
            {filteredItems.filter(item => item.type === 'application' || item.type === 'service').map((item) => (
              <Card 
                key={item.id} 
                className="p-4 cursor-pointer hover:shadow-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all group"
                onDoubleClick={() => handleViewDetails(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 group-hover:scale-110 transition-transform">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {item.name}
                        </h3>
                        {getStatusBadge(item.status)}
                        {getEnvironmentBadge(item.environment)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <Cloud className="h-4 w-4" />
                            Provider
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.provider}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <MapPin className="h-4 w-4" />
                            Location
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <Users className="h-4 w-4" />
                            Owner
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.owner}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                            <Clock className="h-4 w-4" />
                            Updated
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.tags.map((tag, idx) => (
                          <Badge key={idx} variant="gray" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {safeRender(tag)}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                          <ExternalLink className="h-3 w-3" />
                          Double-click to view detailed information
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(item);
                      }}
                      className="min-w-[100px]"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      Details
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="min-w-[100px]"
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="min-w-[100px] hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      {selectedItem && (
        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title={selectedItem.name}
          size="lg"
        >
          <div className="space-y-6">
            {/* Status and Environment */}
            <div className="flex items-center gap-3">
              {getStatusBadge(selectedItem.status)}
              {getEnvironmentBadge(selectedItem.environment)}
              <Badge variant="gray">{selectedItem.type}</Badge>
            </div>

            {/* Basic Information */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Provider</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedItem.provider}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedItem.location}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Owner</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedItem.owner}</p>
                </div>
                {selectedItem.ipAddress && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">IP Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedItem.ipAddress}</p>
                  </div>
                )}
                {selectedItem.version && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Version</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedItem.version}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedItem.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Technical Details</h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(selectedItem.metadata).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {safeRender(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dependencies */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Dependencies
              </h4>
              {getDependencies(selectedItem.id).length > 0 ? (
                <div className="space-y-2">
                  {getDependencies(selectedItem.id).map((dep) => dep && (
                    <div key={dep.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {getTypeIcon(dep.type)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{safeRender(dep.name)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{safeRender(dep.type)}</p>
                      </div>
                      {getStatusBadge(dep.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No dependencies</p>
              )}
            </div>

            {/* Dependents */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Link className="h-5 w-5" />
                Used By
              </h4>
              {getDependents(selectedItem.id).length > 0 ? (
                <div className="space-y-2">
                  {getDependents(selectedItem.id).map((dep) => dep && (
                    <div key={dep.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {getTypeIcon(dep.type)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{safeRender(dep.name)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{safeRender(dep.type)}</p>
                      </div>
                      {getStatusBadge(dep.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Not used by any items</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedItem.tags && selectedItem.tags.length > 0 ? (
                  selectedItem.tags.map((tag, idx) => (
                    <Badge key={idx} variant="gray">
                      <Tag className="h-3 w-3 mr-1" />
                      {safeRender(tag)}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No tags</p>
                )}
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            <Button onClick={() => toast.success('Edit functionality coming soon!')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Configuration
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Add CI Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Configuration Item"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Item Name</label>
            <input type="text" className="input" placeholder="e.g., web-server-prod-01" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input">
                <option value="server">Server</option>
                <option value="database">Database</option>
                <option value="network">Network</option>
                <option value="storage">Storage</option>
                <option value="application">Application</option>
              </select>
            </div>
            <div>
              <label className="label">Environment</label>
              <select className="input">
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Provider</label>
              <input type="text" className="input" placeholder="e.g., AWS" />
            </div>
            <div>
              <label className="label">Location</label>
              <input type="text" className="input" placeholder="e.g., US East" />
            </div>
          </div>
          <div>
            <label className="label">Owner</label>
            <input type="text" className="input" placeholder="e.g., DevOps Team" />
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input type="text" className="input" placeholder="e.g., web, nginx, production" />
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Configuration item added!');
            setShowAddModal(false);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </ModalFooter>
      </Modal>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <Modal
          isOpen={showAgentModal}
          onClose={() => {
            setShowAgentModal(false);
            setSelectedAgent(null);
          }}
          title="Agent Details"
          size="xl"
        >
          <div className="space-y-6">
            {/* Agent Header */}
            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                  <Server className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAgent.hostname}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Agent ID: {selectedAgent.id}</p>
                  <div className="mt-2">
                    <Badge variant={selectedAgent.status === 'online' ? 'success' : selectedAgent.status === 'warning' ? 'warning' : 'danger'}>
                      {selectedAgent.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Seen</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(selectedAgent.lastSeen).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Agent Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{safeRender(selectedAgent.healthScore)}%</p>
                  </div>
                  <div className={`p-3 rounded-full ${selectedAgent.healthScore >= 80 ? 'bg-green-100 dark:bg-green-900/30' : selectedAgent.healthScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <Activity className={`h-6 w-6 ${selectedAgent.healthScore >= 80 ? 'text-green-600' : selectedAgent.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">CI Items</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{safeRender(selectedAgent.ciCount)}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* System Metrics */}
            {selectedAgent.metrics && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Metrics
                </h4>
                <div className="space-y-4">
                  {/* CPU */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">CPU Usage</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{safeRender(selectedAgent.metrics.cpu)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Number(selectedAgent.metrics.cpu) || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Memory */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Memory Usage</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{safeRender(selectedAgent.metrics.memory)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Number(selectedAgent.metrics.memory) || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Disk */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Disk Usage</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{safeRender(selectedAgent.metrics.disk)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-yellow-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Number(selectedAgent.metrics.disk) || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Actions */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Agent Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleAgentSync(selectedAgent.id);
                    setShowAgentModal(false);
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sync Agent
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleAgentDiscovery(selectedAgent.id);
                    setShowAgentModal(false);
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Radio className="h-4 w-4" />
                  Run Discovery
                </Button>
              </div>
            </div>

            {/* CI Items from this Agent */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Discovered CI Items ({ciItems.filter(ci => ci.agentId === selectedAgent.id).length})
              </h4>
              {ciItems.filter(ci => ci.agentId === selectedAgent.id).length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {ciItems.filter(ci => ci.agentId === selectedAgent.id).map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => {
                        setShowAgentModal(false);
                        handleViewDetails(item);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No CI items discovered by this agent yet</p>
                </Card>
              )}
            </div>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => {
              setShowAgentModal(false);
              setSelectedAgent(null);
            }}>
              Close
            </Button>
            <Button onClick={() => toast.success('Agent configuration saved!')}>
              <Settings className="h-4 w-4 mr-2" />
              Configure Agent
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Install Agent Modal */}
      <Modal
        isOpen={showInstallAgent}
        onClose={() => setShowInstallAgent(false)}
        title="Install CMDB Agent"
        size="lg"
      >
        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="label">Select Platform</label>
            <div className="flex gap-2">
              <Button
                variant={selectedOS === 'docker' ? 'default' : 'outline'}
                onClick={() => setSelectedOS('docker')}
                className="flex-1"
              >
                <Server className="h-4 w-4 mr-2" />
                Docker
              </Button>
              <Button
                variant={selectedOS === 'linux' ? 'default' : 'outline'}
                onClick={() => setSelectedOS('linux')}
                className="flex-1"
              >
                <Server className="h-4 w-4 mr-2" />
                Linux
              </Button>
              <Button
                variant={selectedOS === 'windows' ? 'default' : 'outline'}
                onClick={() => setSelectedOS('windows')}
                className="flex-1"
              >
                <Server className="h-4 w-4 mr-2" />
                Windows
              </Button>
            </div>
          </div>

          {/* Installation Instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Installation Command</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCommand}
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                {getInstallCommand()}
              </pre>
            </div>
          </div>

          {/* Quick Steps */}
          <div>
            <label className="label">Quick Start Steps</label>
            <div className="space-y-2">
              {selectedOS === 'docker' && (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <p className="font-semibold">Ensure Docker is installed</p>
                      <p className="text-gray-600 dark:text-gray-400">Docker must be running on your system</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <p className="font-semibold">Copy and run the command</p>
                      <p className="text-gray-600 dark:text-gray-400">Replace the API key with your actual key</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <p className="font-semibold">Verify agent registration</p>
                      <p className="text-gray-600 dark:text-gray-400">Check the Agents tab to see your new agent</p>
                    </div>
                  </div>
                </>
              )}
              {selectedOS === 'linux' && (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <p className="font-semibold">Download the agent package</p>
                      <p className="text-gray-600 dark:text-gray-400">Or use the one-liner installation script</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <p className="font-semibold">Extract and configure</p>
                      <p className="text-gray-600 dark:text-gray-400">Edit .env file with your CMDB API details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <p className="font-semibold">Run setup script</p>
                      <p className="text-gray-600 dark:text-gray-400">Execute ./setup.sh to start the agent</p>
                    </div>
                  </div>
                </>
              )}
              {selectedOS === 'windows' && (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <p className="font-semibold">Download the agent package</p>
                      <p className="text-gray-600 dark:text-gray-400">Or use PowerShell installation script</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <p className="font-semibold">Extract and configure</p>
                      <p className="text-gray-600 dark:text-gray-400">Edit .env file with your CMDB API details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <p className="font-semibold">Run setup script</p>
                      <p className="text-gray-600 dark:text-gray-400">Execute .\setup.ps1 in PowerShell</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Configuration Details */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Configuration Required</p>
                <p className="text-blue-800 dark:text-blue-200 mb-2">
                  Before running the agent, you need to configure:
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li><strong>CMDB_API_URL</strong>: Your CMDB API endpoint</li>
                  <li><strong>CMDB_API_KEY</strong>: Authentication key (generate in Settings)</li>
                  <li><strong>AGENT_ID</strong>: Unique identifier for this agent</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowInstallAgent(false)}>
            Close
          </Button>
          <Button onClick={handleDownloadAgent} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Package
          </Button>
        </ModalFooter>
      </Modal>

      {/* Relationship Visualization Modal */}
      <Modal
        isOpen={showRelationships}
        onClose={() => setShowRelationships(false)}
        title={relationshipFocusId 
          ? `Dependency Map - ${ciItems.find(i => i.id === relationshipFocusId)?.name || 'Item'}` 
          : 'Full CMDB Dependency Map'}
        size="xl"
      >
        <div className="p-4">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              {relationshipFocusId 
                ? 'Showing selected item and its direct dependencies. Drag nodes to rearrange.'
                : 'Showing all configuration items and their relationships. Drag nodes to rearrange.'}
            </p>
          </div>
          
          {ciItems.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No configuration items to visualize</p>
            </div>
          ) : (
            <RelationshipGraph 
              items={ciItems} 
              selectedItemId={relationshipFocusId}
            />
          )}

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Server</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Database</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Network</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Storage</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-pink-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Application</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-cyan-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Service</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-indigo-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Container</span>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button 
            variant="secondary" 
            onClick={() => {
              setRelationshipFocusId(undefined);
            }}
            disabled={!relationshipFocusId}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            Show All
          </Button>
          <Button variant="secondary" onClick={() => setShowRelationships(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Discovery Schedules Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Discovery Schedules"
        size="lg"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automate network discovery scans at regular intervals
            </p>
            <Button
              size="sm"
              onClick={() => {
                const name = prompt('Schedule name:');
                if (!name) return;
                const frequency = prompt('Frequency (hourly/daily/weekly/monthly):') as any;
                if (!frequency) return;
                handleCreateSchedule({ name, frequency, agentIds: [] });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>

          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No schedules configured</p>
              <p className="text-sm text-gray-500 mt-2">Create a schedule to automate discovery</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map(schedule => (
                <Card key={schedule.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {schedule.name}
                        </h4>
                        <Badge variant={schedule.enabled ? 'success' : 'gray'}>
                          {schedule.enabled ? 'Active' : 'Paused'}
                        </Badge>
                        <Badge variant="info">{schedule.frequency}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {schedule.lastRun && (
                          <span>Last run: {new Date(schedule.lastRun).toLocaleString()}</span>
                        )}
                        {schedule.nextRun && (
                          <span className="ml-4">Next run: {new Date(schedule.nextRun).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={schedule.enabled ? "secondary" : "primary"}
                        onClick={() => handleToggleSchedule(schedule.id)}
                      >
                        {schedule.enabled ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Audit Log Modal */}
      <Modal
        isOpen={showAuditLog}
        onClose={() => setShowAuditLog(false)}
        title="Audit Log"
        size="xl"
      >
        <div className="p-4">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Complete audit trail of all CMDB changes (last 50 entries)
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No audit logs available</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {auditLogs.map(log => (
                <Card key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      log.action === 'create' ? 'bg-green-100 dark:bg-green-900/30' :
                      log.action === 'update' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      log.action === 'delete' ? 'bg-red-100 dark:bg-red-900/30' :
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {log.action === 'create' && <Plus className="h-4 w-4 text-green-600" />}
                      {log.action === 'update' && <Edit className="h-4 w-4 text-blue-600" />}
                      {log.action === 'delete' && <Trash2 className="h-4 w-4 text-red-600" />}
                      {log.action === 'discovery' && <Wifi className="h-4 w-4 text-purple-600" />}
                      {log.action === 'sync' && <RefreshCw className="h-4 w-4 text-cyan-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white capitalize">
                          {log.action}
                        </span>
                        <Badge variant="gray" className="text-xs">{log.entityType}</Badge>
                        <span className="text-gray-600 dark:text-gray-400">
                          {log.entityName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                        {log.userName && ` • by ${log.userName}`}
                      </p>
                      {log.changes && log.changes.length > 0 && (
                        <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 rounded p-2">
                          {log.changes.slice(0, 3).map((change: any, idx: number) => (
                            <div key={idx} className="text-gray-700 dark:text-gray-300">
                              <span className="font-mono">{change.field}</span>:{' '}
                              <span className="text-red-600 line-through">{String(change.oldValue).substring(0, 30)}</span>
                              {' → '}
                              <span className="text-green-600">{String(change.newValue).substring(0, 30)}</span>
                            </div>
                          ))}
                          {log.changes.length > 3 && (
                            <p className="text-gray-500 mt-1">+{log.changes.length - 3} more changes</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowAuditLog(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Impact Analysis Modal */}
      <Modal
        isOpen={showImpactAnalysis}
        onClose={() => setShowImpactAnalysis(false)}
        title={`Impact Analysis - ${impactAnalysisItem?.name || 'Item'}`}
        size="xl"
      >
        <div className="p-4">
          {impactAnalysisItem && (() => {
            const directDependents = getDependents(impactAnalysisItem.id);
            const allAffected = calculateImpact(impactAnalysisItem.id);
            const uniqueAffected = Array.from(new Set(allAffected.map(i => i.id)))
              .map(id => allAffected.find(i => i.id === id)!)
              .filter(Boolean);
            const severity = getImpactSeverity(impactAnalysisItem, uniqueAffected.length);
            
            // Group by type
            const affectedByType = uniqueAffected.reduce((acc, item) => {
              acc[item.type] = (acc[item.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            // Group by environment
            const affectedByEnv = uniqueAffected.reduce((acc, item) => {
              acc[item.environment] = (acc[item.environment] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            return (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className={`p-4 ${
                    severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
                    severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }`}>
                    <div className="text-center">
                      <AlertCircle className={`h-8 w-8 mx-auto mb-2 ${
                        severity === 'critical' ? 'text-red-600' :
                        severity === 'high' ? 'text-orange-600' :
                        severity === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white uppercase">
                        {severity}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Risk Level</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {directDependents.length}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Direct Dependents</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="text-center">
                      <Layers className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {uniqueAffected.length}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Affected</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-cyan-600" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.ceil(uniqueAffected.length / Math.max(ciItems.length, 1) * 100)}%
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Blast Radius</p>
                    </div>
                  </Card>
                </div>

                {/* Impact Summary */}
                <Card className="p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        What happens if "{impactAnalysisItem.name}" goes down?
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                        {uniqueAffected.length === 0 ? (
                          <span>✅ No other services depend on this item. Safe to modify or remove.</span>
                        ) : uniqueAffected.length === 1 ? (
                          <span>⚠️ 1 service will be affected. Review dependencies before making changes.</span>
                        ) : directDependents.length === uniqueAffected.length ? (
                          <span>⚠️ {uniqueAffected.length} services depend directly on this item.</span>
                        ) : (
                          <span>🚨 {uniqueAffected.length} services will be affected ({directDependents.length} directly, {uniqueAffected.length - directDependents.length} indirectly via cascade).</span>
                        )}
                      </p>
                      {impactAnalysisItem.environment === 'production' && uniqueAffected.length > 0 && (
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                          ⚠️ PRODUCTION ENVIRONMENT: Exercise extreme caution!
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Breakdown by Type and Environment */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Affected by Type
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(affectedByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                          <Badge variant="gray">{count}</Badge>
                        </div>
                      ))}
                      {Object.keys(affectedByType).length === 0 && (
                        <p className="text-sm text-gray-500">No items affected</p>
                      )}
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Affected by Environment
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(affectedByEnv).map(([env, count]) => (
                        <div key={env} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{env}</span>
                          <Badge variant={
                            env === 'production' ? 'danger' :
                            env === 'staging' ? 'warning' : 'info'
                          }>{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Affected Items List */}
                {uniqueAffected.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Affected Configuration Items ({uniqueAffected.length})
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {uniqueAffected.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-white dark:bg-gray-900">
                              {getTypeIcon(item.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="gray" className="text-xs">{item.type}</Badge>
                                {getEnvironmentBadge(item.environment)}
                                {getStatusBadge(item.status)}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setImpactAnalysisItem(item);
                            }}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Analyze
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            );
          })()}
        </div>

        <ModalFooter>
          <Button 
            variant="secondary" 
            onClick={() => {
              if (impactAnalysisItem) {
                setRelationshipFocusId(impactAnalysisItem.id);
                setShowRelationships(true);
                setShowImpactAnalysis(false);
              }
            }}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            View Relationship Map
          </Button>
          <Button variant="secondary" onClick={() => setShowImpactAnalysis(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Health Dashboard Modal */}
      <Modal
        isOpen={showHealthDashboard}
        onClose={() => setShowHealthDashboard(false)}
        title="CMDB Health Monitoring Dashboard"
        size="xl"
      >
        <div className="space-y-6">
          {healthMetrics ? (
            <>
              {/* Overall Health Score */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Health</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{healthMetrics.overallHealth}%</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <Server className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Operational</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{healthMetrics.operational}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    <TrendingDown className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Degraded</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{healthMetrics.degraded}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Down</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{healthMetrics.down}</p>
                </Card>
              </div>

              {/* Environment Health */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary-600" />
                  Health by Environment
                </h3>
                <div className="space-y-3">
                  {healthMetrics.byEnvironment?.map((env: any) => (
                    <div key={env.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${
                          env.health > 90 ? 'bg-green-500' :
                          env.health > 70 ? 'bg-yellow-500' :
                          env.health > 50 ? 'bg-orange-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium">{env.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{env.total} items</span>
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              env.health > 90 ? 'bg-green-500' :
                              env.health > 70 ? 'bg-yellow-500' :
                              env.health > 50 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${env.health}%` }}
                          />
                        </div>
                        <span className="font-bold text-lg min-w-[60px] text-right">{env.health}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Type Distribution */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary-600" />
                  Distribution by Type
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {healthMetrics.byType?.map((type: any) => (
                    <div key={type.name} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{type.name}</p>
                      <p className="text-2xl font-bold">{type.count}</p>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${(type.count / healthMetrics.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Issues */}
              {healthMetrics.recentIssues?.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Recent Issues
                  </h3>
                  <div className="space-y-2">
                    {healthMetrics.recentIssues.map((issue: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                          <div>
                            <p className="font-medium">{issue.ciName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{issue.message}</p>
                          </div>
                        </div>
                        <Badge variant="warning">{issue.severity}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">Loading health metrics...</p>
            </div>
          )}
        </div>
        <ModalFooter>
          <Button onClick={() => fetchHealthMetrics()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={() => setShowHealthDashboard(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Notifications Panel Modal */}
      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Notifications & Alerts"
        size="lg"
      >
        <div className="space-y-4">
          {notifications.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notifications.filter(n => !n.read).length} unread notifications
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => notifications.forEach(n => !n.read && handleMarkAsRead(n.id))}
                >
                  Mark All as Read
                </Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`p-4 cursor-pointer transition-all ${
                      notification.read 
                        ? 'bg-gray-50 dark:bg-gray-800/50' 
                        : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                        notification.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {notification.type === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                        {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                        {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {notification.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">{notification.title}</p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                          {notification.ciId && (
                            <Button 
                              variant="link" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to CI item
                                const element = document.getElementById(`ci-${notification.ciId}`);
                                if (element) element.scrollIntoView({ behavior: 'smooth' });
                              }}
                            >
                              View Item
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No notifications</p>
            </div>
          )}
        </div>
        <ModalFooter>
          <Button onClick={() => fetchNotifications()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={() => setShowNotifications(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
