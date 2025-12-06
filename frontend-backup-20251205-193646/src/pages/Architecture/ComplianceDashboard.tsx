/**
 * Architecture Compliance Dashboard
 * Real-time view of architecture governance and compliance
 */

import React from 'react';
import { useQuery } from 'react-query';
import {
  Card,
  Grid,
  Typography,
  Box,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { apiService } from '../../services/api.service';

interface ComplianceMetrics {
  overall_score: number;
  standards_compliance: number;
  security_compliance: number;
  cost_governance: number;
  pending_reviews: number;
  active_violations: number;
}

interface Violation {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  policy_name: string;
  description: string;
  project_name: string;
  detected_at: string;
  status: string;
}

interface PortfolioHealth {
  total_assets: number;
  approved_templates: number;
  active_projects: number;
  deprecated_count: number;
  by_domain: Record<string, number>;
  by_status: Record<string, number>;
}

export const ComplianceDashboard: React.FC = () => {
  const { data: compliance, isLoading: loadingCompliance } = useQuery<ComplianceMetrics>(
    'compliance-metrics',
    () => apiService.get('/api/architecture/metrics/overview').then(r => r.data.governance)
  );

  const { data: violations, isLoading: loadingViolations } = useQuery<Violation[]>(
    'active-violations',
    () => apiService.get('/api/architecture/violations/active').then(r => r.data)
  );

  const { data: portfolio, isLoading: loadingPortfolio } = useQuery<PortfolioHealth>(
    'portfolio-health',
    () => apiService.get('/api/architecture/metrics/portfolio').then(r => r.data)
  );

  if (loadingCompliance || loadingViolations || loadingPortfolio) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    return 'error';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Architecture Compliance Dashboard
      </Typography>

      {/* Overall Compliance Score */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Overall Compliance Score
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" my={3}>
              <Box position="relative" display="inline-flex">
                <CircularProgress
                  variant="determinate"
                  value={compliance?.overall_score || 0}
                  size={120}
                  thickness={5}
                  color={getScoreColor(compliance?.overall_score || 0)}
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="h4" component="div" color="text.secondary">
                    {compliance?.overall_score}%
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              Target: 90%
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Standards Compliance
                </Typography>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {compliance?.standards_compliance}%
                  <TrendingUp fontSize="small" color="success" />
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={compliance?.standards_compliance || 0}
                  color="success"
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Security Baseline
                </Typography>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {compliance?.security_compliance}%
                  <TrendingDown fontSize="small" color="warning" />
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={compliance?.security_compliance || 0}
                  color="warning"
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Cost Governance
                </Typography>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {compliance?.cost_governance}%
                  <TrendingUp fontSize="small" color="success" />
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={compliance?.cost_governance || 0}
                  color="success"
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Reviews
                </Typography>
                <Typography variant="h5">
                  {compliance?.pending_reviews || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Awaiting approval
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Active Violations */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Policy Violations
            </Typography>
            {violations && violations.length === 0 ? (
              <Alert severity="success" icon={<CheckCircle />}>
                No active violations. All projects are compliant!
              </Alert>
            ) : (
              <List>
                {violations?.slice(0, 5).map((violation) => (
                  <ListItem
                    key={violation.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {violation.severity === 'critical' && <ErrorIcon color="error" />}
                        {violation.severity === 'high' && <Warning color="warning" />}
                        <Chip
                          label={violation.severity.toUpperCase()}
                          size="small"
                          color={getSeverityColor(violation.severity)}
                        />
                        <Typography variant="subtitle1" sx={{ flex: 1 }}>
                          {violation.policy_name}
                        </Typography>
                        <Button size="small" variant="contained" color="primary">
                          Remediate
                        </Button>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {violation.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Project: {violation.project_name} • Detected: {new Date(violation.detected_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
            {violations && violations.length > 5 && (
              <Button fullWidth sx={{ mt: 2 }}>
                View All {violations.length} Violations
              </Button>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Portfolio Health */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Architecture Portfolio Health
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Typography variant="h4">{portfolio?.total_assets || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Assets
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4">{portfolio?.approved_templates || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved Templates
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4">{portfolio?.active_projects || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Projects
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4" color="warning.main">
                  {portfolio?.deprecated_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deprecated Assets
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Assets by Domain
            </Typography>
            {portfolio?.by_domain && (
              <Doughnut
                data={{
                  labels: Object.keys(portfolio.by_domain),
                  datasets: [
                    {
                      data: Object.values(portfolio.by_domain),
                      backgroundColor: [
                        '#1976d2',
                        '#dc004e',
                        '#9c27b0',
                        '#f57c00',
                        '#388e3c',
                        '#00796b'
                      ]
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Assets by Status
            </Typography>
            {portfolio?.by_status && (
              <Bar
                data={{
                  labels: Object.keys(portfolio.by_status),
                  datasets: [
                    {
                      label: 'Number of Assets',
                      data: Object.values(portfolio.by_status),
                      backgroundColor: '#1976d2'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplianceDashboard;
