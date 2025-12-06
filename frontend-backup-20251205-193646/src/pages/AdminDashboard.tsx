import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  CloudQueue as CloudIcon,
} from '@mui/icons-material';

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetSubscriptions?: string[];
  environment?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface CircuitBreakerStat {
  name: string;
  state: 'open' | 'closed' | 'half-open';
  stats: {
    failures: number;
    successes: number;
    rejects: number;
    timeouts: number;
    fallbacks: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [metrics, setMetrics] = useState<any>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreakerStat[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, flagsRes, breakersRes, cacheRes] = await Promise.all([
        fetch('/api/metrics/summary'),
        fetch('/api/feature-flags'),
        fetch('/api/circuit-breakers/stats'),
        fetch('/api/cache/stats'),
      ]);

      setMetrics(await metricsRes.json());
      const flagsData = await flagsRes.json();
      setFeatureFlags(flagsData.flags || []);
      const breakersData = await breakersRes.json();
      setCircuitBreakers(breakersData.breakers || []);
      setCacheStats(await cacheRes.json());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Metric cards for overview
  const metricCards: MetricCard[] = [
    {
      title: 'Total Requests',
      value: metrics?.totalRequests || 0,
      change: '+12%',
      icon: <TrendingUpIcon />,
      color: '#4caf50',
    },
    {
      title: 'Avg Response Time',
      value: `${metrics?.avgResponseTime || 0}ms`,
      change: '-5%',
      icon: <SpeedIcon />,
      color: '#2196f3',
    },
    {
      title: 'Cache Hit Rate',
      value: `${cacheStats?.hitRate || 0}%`,
      change: '+3%',
      icon: <MemoryIcon />,
      color: '#ff9800',
    },
    {
      title: 'Active Connections',
      value: metrics?.activeConnections || 0,
      icon: <CloudIcon />,
      color: '#9c27b0',
    },
  ];

  // Feature flag handlers
  const handleToggleFlag = async (flagName: string, enabled: boolean) => {
    try {
      await fetch(`/api/feature-flags/${flagName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setSelectedFlag(flag);
    setFlagDialogOpen(true);
  };

  const handleDeleteFlag = async (flagName: string) => {
    if (confirm(`Delete feature flag "${flagName}"?`)) {
      try {
        await fetch(`/api/feature-flags/${flagName}`, { method: 'DELETE' });
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting flag:', error);
      }
    }
  };

  // Overview Tab
  const renderOverviewTab = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metricCards.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {metric.value}
                    </Typography>
                    {metric.change && (
                      <Chip
                        label={metric.change}
                        size="small"
                        color={metric.change.startsWith('+') ? 'success' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: metric.color,
                      borderRadius: '50%',
                      p: 1,
                      color: 'white',
                    }}
                  >
                    {metric.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Circuit Breakers Status
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell align="right">Failures</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {circuitBreakers.map((breaker) => {
                    const successRate =
                      breaker.stats.successes /
                      (breaker.stats.successes + breaker.stats.failures);
                    return (
                      <TableRow key={breaker.name}>
                        <TableCell>{breaker.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={breaker.state}
                            size="small"
                            color={
                              breaker.state === 'closed'
                                ? 'success'
                                : breaker.state === 'open'
                                ? 'error'
                                : 'warning'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">{breaker.stats.failures}</TableCell>
                        <TableCell align="right">
                          {(successRate * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cache Statistics
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Hit Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {cacheStats?.hitRate || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={cacheStats?.hitRate || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="body2">Total Keys</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {cacheStats?.keys || 0}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="body2">Memory Usage</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {((cacheStats?.memoryUsage || 0) / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Feature Flags Tab
  const renderFeatureFlagsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6">Feature Flags</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedFlag(null);
            setFlagDialogOpen(true);
          }}
        >
          New Flag
        </Button>
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Rollout</TableCell>
              <TableCell>Targeting</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {featureFlags.map((flag) => (
              <TableRow key={flag.name}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {flag.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {flag.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={flag.enabled}
                    onChange={(e) => handleToggleFlag(flag.name, e.target.checked)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  {flag.rolloutPercentage !== undefined ? (
                    <Box>
                      <Typography variant="body2">{flag.rolloutPercentage}%</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={flag.rolloutPercentage}
                        sx={{ mt: 0.5, height: 4 }}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      All users
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {flag.targetSubscriptions && flag.targetSubscriptions.length > 0 && (
                    <Box>
                      {flag.targetSubscriptions.map((sub) => (
                        <Chip key={sub} label={sub} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </Box>
                  )}
                  {flag.targetUsers && flag.targetUsers.length > 0 && (
                    <Chip
                      label={`${flag.targetUsers.length} users`}
                      size="small"
                      color="primary"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleEditFlag(flag)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="History">
                    <IconButton size="small">
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteFlag(flag.name)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label="Overview" />
          <Tab label="Feature Flags" />
          <Tab label="Monitoring" />
          <Tab label="Logs" />
        </Tabs>
      </Box>

      {tabValue === 0 && renderOverviewTab()}
      {tabValue === 1 && renderFeatureFlagsTab()}
      {tabValue === 2 && (
        <Alert severity="info">
          For detailed monitoring, visit{' '}
          <a href="http://localhost:3030" target="_blank" rel="noopener noreferrer">
            Grafana Dashboard
          </a>{' '}
          or{' '}
          <a href="http://localhost:16686" target="_blank" rel="noopener noreferrer">
            Jaeger Tracing
          </a>
        </Alert>
      )}
      {tabValue === 3 && (
        <Alert severity="info">Real-time logs coming soon</Alert>
      )}
    </Container>
  );
};

export default AdminDashboard;
