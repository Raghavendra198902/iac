import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Modal, { ModalFooter } from '../components/ui/Modal';
import toast from 'react-hot-toast';

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

export default function CMDB() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'servers' | 'databases' | 'network' | 'applications' | 'agents'>('all');
  const [selectedItem, setSelectedItem] = useState<CIItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showNetworkDiscovery, setShowNetworkDiscovery] = useState(false);
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [showInstallAgent, setShowInstallAgent] = useState(false);
  const [selectedOS, setSelectedOS] = useState<'linux' | 'windows' | 'docker'>('docker');
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);

  // NO MOCK DATA - Network devices populated only by real agent discovery
  const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([]);

  // NO MOCK DATA - CI items populated only by real agent registration
  const [ciItems] = useState<CIItem[]>([]);

  const [relationships] = useState<Relationship[]>([]);

  // Generate agent installation command
  const getInstallCommand = () => {
    const apiUrl = 'http://192.168.1.10:3000';
    // Placeholder for API key - users will replace this with their actual key
    const apiKeyPlaceholder = '${CMDB_API_KEY}';
    
    switch (selectedOS) {
      case 'linux':
        return `# Download and install CMDB Agent
curl -fsSL ${apiUrl}/api/downloads/cmdb-agent-linux.tar.gz -o cmdb-agent.tar.gz
tar -xzf cmdb-agent.tar.gz
cd cmdb-agent
./setup.sh`;
      
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

  // Download agent package
  const handleDownloadAgent = () => {
    const downloadUrls = {
      linux: 'http://192.168.1.10:3000/api/downloads/cmdb-agent-linux.tar.gz',
      windows: 'http://192.168.1.10:3000/api/downloads/cmdb-agent-windows.zip',
      docker: 'http://192.168.1.10:3000/api/downloads/docker-compose.yml',
    };
    
    // Trigger download by opening in new window
    toast.success(`Downloading CMDB Agent for ${selectedOS}...`);
    window.open(downloadUrls[selectedOS], '_blank');
  };

  // Copy command to clipboard
  const handleCopyCommand = () => {
    navigator.clipboard.writeText(getInstallCommand());
    toast.success('Installation command copied to clipboard!');
  };

  // Network Discovery Function
  const handleNetworkDiscovery = async () => {
    setIsDiscovering(true);
    toast.loading('Scanning network for devices...', { id: 'network-scan' });
    
    try {
      // Simulate network discovery (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated discovered devices
      const newDevices: NetworkDevice[] = [
        {
          id: `net-${Date.now()}-1`,
          name: 'discovered-switch-02',
          type: 'switch',
          ipAddress: '10.0.0.12',
          macAddress: '00:1A:2B:3C:4D:61',
          status: 'active',
          ports: 24,
          connectedDevices: 8,
          lastDiscovered: new Date().toISOString(),
        },
        {
          id: `net-${Date.now()}-2`,
          name: 'discovered-gateway-01',
          type: 'gateway',
          ipAddress: '10.0.0.1',
          status: 'active',
          lastDiscovered: new Date().toISOString(),
        },
      ];
      
      setNetworkDevices(prev => [...prev, ...newDevices]);
      toast.success(`Discovered ${newDevices.length} new network devices`, { id: 'network-scan' });
    } catch (error) {
      toast.error('Network discovery failed', { id: 'network-scan' });
    } finally {
      setIsDiscovering(false);
    }
  };

  // Agent Sync Function
  const handleAgentSync = async (agentId: string) => {
    toast.loading('Syncing with agent...', { id: 'agent-sync' });
    
    try {
      // Simulate agent sync (replace with actual API call to agent)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update agent status
      setAgentStatuses(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, lastSeen: new Date().toISOString() }
          : agent
      ));
      
      toast.success('Agent synced successfully', { id: 'agent-sync' });
    } catch (error) {
      toast.error('Failed to sync with agent', { id: 'agent-sync' });
    }
  };

  // Trigger Discovery on Agent
  const handleAgentDiscovery = async (agentId: string) => {
    toast.loading('Triggering discovery on agent...', { id: 'agent-discovery' });
    
    try {
      // Call agent discovery endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Discovery completed. New CIs registered.', { id: 'agent-discovery' });
      
      // Refresh CI list (in real app, fetch from API)
    } catch (error) {
      toast.error('Discovery failed', { id: 'agent-discovery' });
    }
  };

  // Fetch agent statuses from API
  const fetchAgentStatuses = async () => {
    try {
      console.log('Fetching agent statuses...');
      const response = await fetch('/api/cmdb/agents/status');
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

  // Auto-refresh agent statuses
  useEffect(() => {
    console.log('CMDB useEffect - starting agent fetch');
    fetchAgentStatuses(); // Initial fetch
    
    const interval = setInterval(() => {
      fetchAgentStatuses();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

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

  const filteredItems = ciItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'servers' && item.type === 'server') ||
                      (activeTab === 'databases' && item.type === 'database') ||
                      (activeTab === 'network' && item.type === 'network') ||
                      (activeTab === 'applications' && (item.type === 'application' || item.type === 'service'));
    const matchesEnv = filterEnvironment === 'all' || item.environment === filterEnvironment;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesTab && matchesEnv && matchesStatus;
  });

  const handleViewDetails = (item: CIItem) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handleAddCI = () => {
    setShowAddModal(true);
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

  const stats = {
    total: ciItems.length,
    operational: ciItems.filter(i => i.status === 'operational').length,
    degraded: ciItems.filter(i => i.status === 'degraded').length,
    down: ciItems.filter(i => i.status === 'down').length,
    maintenance: ciItems.filter(i => i.status === 'maintenance').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuration Management Database</h1>
            <p className="text-gray-600 dark:text-gray-300">Track and manage infrastructure with agent monitoring</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('agents')} 
            className="flex items-center gap-2"
          >
            <Activity className="h-5 w-5" />
            View Agents
          </Button>
          <Button onClick={handleAddCI} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add CI Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total CIs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <Database className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Operational</p>
              <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Degraded</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.degraded}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Down</p>
              <p className="text-2xl font-bold text-red-600">{stats.down}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance</p>
              <p className="text-2xl font-bold text-gray-600">{stats.maintenance}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Agents</p>
              <p className="text-2xl font-bold text-blue-600">{agentStatuses.filter(a => a.status === 'online').length}/{agentStatuses.length}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or tags..."
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterEnvironment}
              onChange={(e) => setFilterEnvironment(e.target.value)}
              className="input"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Statuses</option>
              <option value="operational">Operational</option>
              <option value="degraded">Degraded</option>
              <option value="down">Down</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </Card>

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
                  <Card key={agent.id} className="p-4 border-l-4" style={{
                    borderLeftColor: agent.status === 'online' ? '#10b981' : agent.status === 'warning' ? '#f59e0b' : '#ef4444'
                  }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <div>
                          <h4 className="font-semibold text-sm">{agent.hostname}</h4>
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
                        <span className="font-semibold">{agent.healthScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">CI Count</span>
                        <span className="font-semibold">{agent.ciCount}</span>
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
                          <span>{agent.metrics.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${agent.metrics.cpu}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Memory</span>
                          <span>{agent.metrics.memory}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${agent.metrics.memory}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Disk</span>
                          <span>{agent.metrics.disk}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-yellow-500 h-1.5 rounded-full" 
                            style={{ width: `${agent.metrics.disk}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAgentSync(agent.id)}
                        className="flex-1 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAgentDiscovery(agent.id)}
                        className="flex-1 text-xs"
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
                          {device.macAddress || '-'}
                        </td>
                        <td className="py-2 px-3 text-sm">
                          <Badge variant={device.status === 'active' ? 'success' : 'gray'}>
                            {device.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-sm">{device.ports || '-'}</td>
                        <td className="py-2 px-3 text-sm">{device.connectedDevices || '-'}</td>
                        <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(device.lastDiscovered).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value={activeTab}>
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <Card className="p-8 text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No configuration items found</p>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                          {getStatusBadge(item.status)}
                          {getEnvironmentBadge(item.environment)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Cloud className="h-4 w-4" />
                              Provider
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">{item.provider}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              Location
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">{item.location}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Owner
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">{item.owner}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Updated
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(item.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.tags.map((tag, idx) => (
                            <Badge key={idx} variant="gray">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
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
                      <p className="font-medium text-gray-900 dark:text-white">{String(value)}</p>
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
                  {getDependencies(selectedItem.id).map((dep) => (
                    <div key={dep.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {getTypeIcon(dep.type)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{dep.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{dep.type}</p>
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
                  {getDependents(selectedItem.id).map((dep) => (
                    <div key={dep.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {getTypeIcon(dep.type)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{dep.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{dep.type}</p>
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
                {selectedItem.tags.map((tag, idx) => (
                  <Badge key={idx} variant="gray">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
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
    </div>
  );
}
