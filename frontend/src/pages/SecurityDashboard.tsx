import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  Filter,
  RefreshCw,
  TrendingUp,
  FileWarning,
  Zap,
  BarChart3,
  Heart,
} from 'lucide-react';
import Badge, { type BadgeVariant } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Alert from '../components/ui/Alert';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';
import EventAnalytics from '../components/security/EventAnalytics';
import ExportButtons from '../components/security/ExportButtons';
import NotificationControls, { triggerNotification } from '../components/security/NotificationControls';
// import { SystemHealth } from '../components/security/SystemHealth';
import enforcementService from '../services/enforcementService';
import type {
  EnforcementEvent,
  SecurityPolicy,
  QuarantinedFile,
  EnforcementStats,
} from '../services/enforcementService';

const SecurityDashboard = () => {
  const [events, setEvents] = useState<EnforcementEvent[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [quarantinedFiles, setQuarantinedFiles] = useState<QuarantinedFile[]>([]);
  const [stats, setStats] = useState<EnforcementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    // Load notification preferences
    const savedNotif = localStorage.getItem('security-notifications');
    const savedSound = localStorage.getItem('security-sound');
    setNotificationsEnabled(savedNotif === 'true');
    setSoundEnabled(savedSound === 'true');
  }, []);

  useEffect(() => {
    // Initialize WebSocket connection - use dynamic URL based on hostname
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const hostname = window.location.hostname;
    const API_URL = import.meta.env.VITE_API_URL || `${protocol}//${hostname}:3000`;
    console.log('[WebSocket] Connecting to:', API_URL);
    const socketInstance = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    // Listen for real-time enforcement events
    socketInstance.on('enforcement:event', (event: EnforcementEvent) => {
      console.log('Real-time event received:', event);
      setEvents((prev) => [event, ...prev].slice(0, 100)); // Keep last 100 events
      
      // Trigger notification for high/critical events
      triggerNotification(event, notificationsEnabled, soundEnabled);
      
      // Refresh stats when new event arrives
      loadStats();
    });

    setSocket(socketInstance);

    // Initial data load
    loadData();

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Reload data when filter changes
  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [severityFilter]);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [eventsRes, policiesRes, filesRes, statsRes] = await Promise.all([
        enforcementService.getEvents({ limit: 100, severity: severityFilter || undefined }),
        enforcementService.getPolicies(),
        enforcementService.getQuarantinedFiles({ limit: 10, restored: false }),
        enforcementService.getEventStats(),
      ]);

      setEvents(eventsRes.events);
      setPolicies(policiesRes.policies);
      setQuarantinedFiles(filesRes.files);
      setStats(statsRes.stats);
    } catch (error) {
      console.error('Failed to load enforcement data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsRes = await enforcementService.getEventStats();
      setStats(statsRes.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const togglePolicy = async (policyId: string, enabled: boolean) => {
    try {
      await enforcementService.updatePolicy(policyId, { enabled });
      await loadData();
    } catch (error) {
      console.error('Failed to update policy:', error);
    }
  };

  const restoreFile = async (fileId: string) => {
    try {
      await enforcementService.restoreFile(fileId);
      await loadData();
    } catch (error) {
      console.error('Failed to restore file:', error);
    }
  };

    const getSeverityColor = (severity: string): BadgeVariant => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Activity className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            Security Enforcement
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring and policy management
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Export Buttons */}
          <ExportButtons events={events} />
          
          {/* Notification Controls */}
          <NotificationControls />
          
          {/* WebSocket Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
          <Button
            onClick={loadData}
            variant="secondary"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical Events</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {stats.bySeverity.critical}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">High Severity</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {stats.bySeverity.high}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quarantined Files</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {quarantinedFiles.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FileWarning className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          {/* <TabsTrigger value="health">
            <Heart className="w-4 h-4 mr-2" />
            System Health
          </TabsTrigger> */}
          <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
          <TabsTrigger value="quarantine">Quarantine ({quarantinedFiles.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && stats.topPolicies.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Top Triggered Policies
              </h3>
              <div className="space-y-3">
                {stats.topPolicies.map((policy) => (
                  <div key={policy.policyId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant={getSeverityColor(policy.severity)}>{policy.severity}</Badge>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {policy.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {policy.count}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">triggers</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {stats && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Critical</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stats.bySeverity.critical}
                    </span>
                  </div>
                  <Progress
                    value={(stats.bySeverity.critical / stats.total) * 100}
                    className="bg-red-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">High</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stats.bySeverity.high}
                    </span>
                  </div>
                  <Progress
                    value={(stats.bySeverity.high / stats.total) * 100}
                    className="bg-orange-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Medium</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stats.bySeverity.medium}
                    </span>
                  </div>
                  <Progress
                    value={(stats.bySeverity.medium / stats.total) * 100}
                    className="bg-yellow-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Low</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stats.bySeverity.low}
                    </span>
                  </div>
                  <Progress
                    value={(stats.bySeverity.low / stats.total) * 100}
                    className="bg-blue-600"
                  />
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <EventAnalytics events={events} />
        </TabsContent>

        {/* System Health Tab */}
        {/* <TabsContent value="health" className="space-y-6">
          <SystemHealth />
        </TabsContent> */}

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {events.length === 0 ? (
            <Alert variant="info">
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">No enforcement events</p>
                <p className="text-sm">All systems are secure. No policy violations detected.</p>
              </div>
            </Alert>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Card key={event.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getSeverityIcon(event.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(event.severity)}>{event.severity}</Badge>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {event.policyName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Agent: {event.agentName}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                          <span>{new Date(event.timestamp).toLocaleString()}</span>
                          <span>Type: {event.type}</span>
                          <span>
                            Actions: {event.actions.filter((a) => a.success).length}/
                            {event.actions.length} successful
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-3">
          {policies.map((policy) => (
            <Card key={policy.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant={getSeverityColor(policy.severity)}>{policy.severity}</Badge>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{policy.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{policy.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-500">
                      <span>Category: {policy.category}</span>
                      <span>Triggered: {policy.triggeredCount} times</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePolicy(policy.id, !policy.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      policy.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        policy.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Quarantine Tab */}
        <TabsContent value="quarantine" className="space-y-3">
          {quarantinedFiles.length === 0 ? (
            <Alert variant="success">
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">No quarantined files</p>
                <p className="text-sm">All files are clean.</p>
              </div>
            </Alert>
          ) : (
            quarantinedFiles.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <FileWarning className="w-5 h-5 text-red-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white break-all">
                        {file.filePath}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{file.reason}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>Agent: {file.agentName}</span>
                        <span>Policy: {file.policyName}</span>
                        <span>{new Date(file.quarantinedAt).toLocaleString()}</span>
                        {file.size && <span>Size: {(file.size / 1024).toFixed(2)} KB</span>}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => restoreFile(file.id)}
                    variant="secondary"
                    size="sm"
                    className="ml-4"
                  >
                    Restore
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
