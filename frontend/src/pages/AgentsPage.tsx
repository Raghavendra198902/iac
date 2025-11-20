import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  CheckCircle as OnlineIcon,
  Warning as WarningIcon,
  Cancel as OfflineIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

interface AgentData {
  agentName: string;
  organizationId?: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'warning';
  totalEvents: number;
  eventCounts: {
    process_start: number;
    process_stop: number;
    suspicious_process: number;
    heartbeat: number;
  };
  uptime: string;
}

interface AgentSummary {
  totalAgents: number;
  onlineAgents: number;
  warningAgents: number;
  offlineAgents: number;
  totalEvents: number;
  totalProcessStarts: number;
  totalProcessStops: number;
  totalSuspicious: number;
}

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [summary, setSummary] = useState<AgentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      const apiBaseUrl = `http://${window.location.hostname}:3000/api`;
      
      const agentsRes = await fetch(`${apiBaseUrl}/agents`);
      if (!agentsRes.ok) throw new Error('Failed to fetch agents');
      const agentsData = await agentsRes.json();

      const summaryRes = await fetch(`${apiBaseUrl}/agents/stats/summary`);
      if (!summaryRes.ok) throw new Error('Failed to fetch summary');
      const summaryData = await summaryRes.json();

      setAgents(agentsData.agents || []);
      setSummary(summaryData.summary);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching agent data:', err);
      setError(err?.message || 'Failed to fetch agent data');
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <OnlineIcon sx={{ color: 'success.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'offline':
        return <OfflineIcon sx={{ color: 'error.main' }} />;
      default:
        return <ComputerIcon />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'online': return 'success';
      case 'warning': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  if (loading && agents.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading agent data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" gutterBottom>
            Agent Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor and manage CMDB agents in real-time
          </Typography>
        </Box>
        <Tooltip title={autoRefresh ? 'Auto-refresh enabled' : 'Click to refresh'}>
          <IconButton onClick={fetchData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="overline">
                      Total Agents
                    </Typography>
                    <Typography variant="h4">{summary.totalAgents}</Typography>
                  </Box>
                  <ComputerIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="overline">
                      Online
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {summary.onlineAgents}
                    </Typography>
                  </Box>
                  <OnlineIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="overline">
                      Total Events
                    </Typography>
                    <Typography variant="h4">{summary.totalEvents.toLocaleString()}</Typography>
                  </Box>
                  <TimelineIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="overline">
                      Suspicious
                    </Typography>
                    <Typography variant="h4" color={summary.totalSuspicious > 0 ? 'error.main' : 'text.primary'}>
                      {summary.totalSuspicious}
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Registered Agents
          </Typography>
          {agents.length === 0 ? (
            <Alert severity="info">No agents registered yet. Deploy an agent to see it here.</Alert>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Agent Name</TableCell>
                    <TableCell>Last Seen</TableCell>
                    <TableCell align="right">Total Events</TableCell>
                    <TableCell align="right">Process Starts</TableCell>
                    <TableCell align="right">Process Stops</TableCell>
                    <TableCell align="right">Suspicious</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.agentName} hover>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(agent.status)}
                          label={agent.status.toUpperCase()}
                          color={getStatusColor(agent.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {agent.agentName}
                        </Typography>
                        {agent.organizationId && (
                          <Typography variant="caption" color="text.secondary">
                            Org: {agent.organizationId}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{agent.uptime}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(agent.lastSeen).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {agent.totalEvents.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{agent.eventCounts.process_start}</TableCell>
                      <TableCell align="right">{agent.eventCounts.process_stop}</TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={agent.eventCounts.suspicious_process > 0 ? 'error.main' : 'text.primary'}
                          fontWeight={agent.eventCounts.suspicious_process > 0 ? 'bold' : 'normal'}
                        >
                          {agent.eventCounts.suspicious_process}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AgentsPage;
