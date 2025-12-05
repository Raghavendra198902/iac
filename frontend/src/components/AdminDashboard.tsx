import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
  PlayArrow as PlayArrowIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Admin Dashboard Component
export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tenants
              </Typography>
              <Typography variant="h4">{stats?.tenants || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Projects
              </Typography>
              <Typography variant="h4">{stats?.projects || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Deployments Today
              </Typography>
              <Typography variant="h4">{stats?.deploymentsToday || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cost Savings
              </Typography>
              <Typography variant="h4">${stats?.costSavings || 0}k</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Usage (Last 30 Days)
            </Typography>
            <Line
              data={{
                labels: stats?.usageChart?.labels || [],
                datasets: [
                  {
                    label: 'API Calls',
                    data: stats?.usageChart?.apiCalls || [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                  },
                  {
                    label: 'Deployments',
                    data: stats?.usageChart?.deployments || [],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                },
              }}
            />
          </Paper>
        </Grid>

        {/* Resource Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resource Distribution
            </Typography>
            <Doughnut
              data={{
                labels: ['AWS', 'Azure', 'GCP'],
                datasets: [
                  {
                    data: stats?.resourceDistribution || [45, 30, 25],
                    backgroundColor: [
                      'rgb(255, 99, 132)',
                      'rgb(54, 162, 235)',
                      'rgb(255, 205, 86)',
                    ],
                  },
                ],
              }}
            />
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.recentActivity?.map((activity: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.resource}</TableCell>
                      <TableCell>
                        <Chip
                          label={activity.status}
                          color={activity.status === 'success' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Swagger UI Component
export const SwaggerUI: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">API Documentation</Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            href={`${API_BASE}/api-docs/json`}
            target="_blank"
          >
            Download OpenAPI Spec
          </Button>
        </Box>
        <iframe
          src={`${API_BASE}/api-docs`}
          style={{
            width: '100%',
            height: '800px',
            border: 'none',
            borderRadius: '4px',
          }}
          title="API Documentation"
        />
      </Paper>
    </Container>
  );
};

// API Playground Component
export const APIPlayground: React.FC = () => {
  const [endpoint, setEndpoint] = useState('/api/blueprints');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('{\n  "name": "Test Blueprint",\n  "provider": "aws"\n}');
  const [headers, setHeaders] = useState('{\n  "Authorization": "Bearer YOUR_TOKEN"\n}');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const config: any = {
        method: method.toLowerCase(),
        url: `${API_BASE}${endpoint}`,
        headers: JSON.parse(headers),
      };

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        config.data = JSON.parse(body);
      }

      const result = await axios(config);
      setResponse({
        status: result.status,
        headers: result.headers,
        data: result.data,
      });
    } catch (error: any) {
      setResponse({
        status: error.response?.status || 'Error',
        error: error.message,
        data: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        API Playground
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Method</InputLabel>
                  <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="PATCH">PATCH</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/api/blueprints"
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleExecute}
                  disabled={loading}
                  sx={{ height: '56px' }}
                >
                  Execute
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Headers (JSON)"
                  multiline
                  rows={6}
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  variant="outlined"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Request Body (JSON)"
                  multiline
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  variant="outlined"
                  sx={{ fontFamily: 'monospace' }}
                  disabled={method === 'GET' || method === 'DELETE'}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {response && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Response
              </Typography>

              <Box mb={2}>
                <Chip
                  label={`Status: ${response.status}`}
                  color={
                    response.status >= 200 && response.status < 300 ? 'success' : 'error'
                  }
                />
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Response Body:
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  overflowX: 'auto',
                }}
              >
                <pre>{JSON.stringify(response.data, null, 2)}</pre>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

// WebSocket Notifications Component
export const WebSocketNotifications: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      ws?.close();
    };
  }, []);

  const connectWebSocket = () => {
    const websocket = new WebSocket('ws://localhost:3000/ws');

    websocket.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      setConnected(false);
      console.log('WebSocket disconnected');
      // Reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    setWs(websocket);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h6">Real-time Notifications</Typography>
        <Chip
          label={connected ? 'Connected' : 'Disconnected'}
          color={connected ? 'success' : 'error'}
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>

      {notifications.length === 0 ? (
        <Alert severity="info">No notifications yet</Alert>
      ) : (
        <Box>
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity={notification.severity || 'info'}
              sx={{ mb: 1 }}
            >
              <Typography variant="body2">
                <strong>{notification.title}</strong>: {notification.message}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(notification.timestamp).toLocaleString()}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;
