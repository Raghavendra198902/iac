import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Computer as ComputerIcon,
  Terminal as LinuxIcon,
  Code as SourceIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

interface DownloadOption {
  url: string;
  size?: string;
  description: string;
  instructions?: string;
  sha256?: string;
}

interface AgentInfo {
  name: string;
  version: string;
  description: string;
  platforms: string[];
  downloads: {
    source?: {
      linux: string;
      windows: string;
      docker: string;
    };
    standalone?: {
      windows?: DownloadOption;
      linux?: DownloadOption;
    };
    installers?: {
      windows?: DownloadOption;
      linux?: DownloadOption;
    };
  };
  requirements: {
    standalone?: string;
    source?: string;
    docker?: string;
  };
  recommended?: {
    windows?: string;
    linux?: string;
  };
}

const DownloadsPage: React.FC = () => {
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgentInfo();
  }, []);

  const fetchAgentInfo = async () => {
    try {
      const apiBaseUrl = `http://${window.location.hostname}:3000/api`;
      const response = await fetch(`${apiBaseUrl}/downloads/agent-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAgentInfo(data);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching agent info:', err);
      setError(err?.message || 'Failed to fetch agent information');
      setLoading(false);
    }
  };  const handleDownload = (url: string) => {
    const apiBaseUrl = `http://${window.location.hostname}:3000`;
    window.location.href = `${apiBaseUrl}${url}`;
  };  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading download options...</Typography>
      </Container>
    );
  }

  if (error || !agentInfo) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Agent information not available'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Download CMDB Agent
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {agentInfo.description}
        </Typography>
        <Chip label={`Version ${agentInfo.version}`} color="primary" sx={{ mr: 1 }} />
        {agentInfo.platforms.map((platform) => (
          <Chip key={platform} label={platform} variant="outlined" sx={{ mr: 1 }} />
        ))}
      </Box>

      {/* Documentation Section */}
      <Card elevation={3} sx={{ mb: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon sx={{ fontSize: 48, mr: 2 }} />
              <Box>
                <Typography variant="h5" gutterBottom>
                  Agent User Manual
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Complete installation, configuration, and troubleshooting guide
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload('/api/downloads/agent-manual.pdf')}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Download PDF Manual
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Installer Packages Section - GUI Installation */}
      {agentInfo.downloads.installers && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Professional Installers (GUI Setup)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Complete installer packages with graphical setup wizard
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {agentInfo.downloads.installers.windows && (
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ComputerIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6">Windows Installer</Typography>
                        <Chip label={agentInfo.downloads.installers.windows.size} size="small" color="primary" />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Professional GUI installer with configuration wizard
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Interactive GUI setup" primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Configuration wizard" primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Start menu shortcuts" primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    </List>
                    <Button variant="contained" fullWidth startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(agentInfo.downloads.installers!.windows!.url)}>
                      Download Windows Installer
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {agentInfo.downloads.installers.linux && (
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LinuxIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6">Linux Installer</Typography>
                        <Chip label={agentInfo.downloads.installers.linux.size} size="small" color="primary" />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Self-extracting installer with automated setup
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Self-extracting archive" primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Automated setup script" primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Single command installation" primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    </List>
                    <Button variant="contained" fullWidth startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(agentInfo.downloads.installers!.linux!.url)}>
                      Download Linux Installer
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
          <Divider sx={{ my: 4 }} />
        </>
      )}

      {/* Standalone Executables Section */}
      {agentInfo.downloads.standalone && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Standalone Executables
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            No installation required - includes Node.js runtime
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {agentInfo.downloads.standalone.windows && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ComputerIcon sx={{ fontSize: 30, mr: 2 }} />
                      <Box>
                        <Typography variant="h6">Windows Executable</Typography>
                        <Chip
                          label={agentInfo.downloads.standalone.windows.size}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {agentInfo.downloads.standalone.windows.description}
                    </Typography>
                    {agentInfo.downloads.standalone.windows.sha256 && (
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          SHA256: <Typography variant="caption" component="code" sx={{ wordBreak: 'break-all' }}>
                            {agentInfo.downloads.standalone.windows.sha256}
                          </Typography>
                        </Typography>
                      </Box>
                    )}
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        handleDownload(
                          agentInfo.downloads.standalone!.windows!.url
                        )
                      }
                    >
                      Download Windows Executable
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {agentInfo.downloads.standalone.linux && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LinuxIcon sx={{ fontSize: 30, mr: 2 }} />
                      <Box>
                        <Typography variant="h6">Linux Executable</Typography>
                        <Chip
                          label={agentInfo.downloads.standalone.linux.size}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {agentInfo.downloads.standalone.linux.description}
                    </Typography>
                    {agentInfo.downloads.standalone.linux.sha256 && (
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          SHA256: <Typography variant="caption" component="code" sx={{ wordBreak: 'break-all' }}>
                            {agentInfo.downloads.standalone.linux.sha256}
                          </Typography>
                        </Typography>
                      </Box>
                    )}
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        handleDownload(
                          agentInfo.downloads.standalone!.linux!.url,
                          'cmdb-agent-linux'
                        )
                      }
                    >
                      Download Linux Binary
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Source Code Section */}
      {agentInfo.downloads.source && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Source Code
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            For developers who want to build from source
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LinuxIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Linux Source</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Complete source code for Linux
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<SourceIcon />}
                    onClick={() =>
                      handleDownload(
                        agentInfo.downloads.source!.linux,
                        'cmdb-agent-linux.tar.gz'
                      )
                    }
                  >
                    Download TAR.GZ
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ComputerIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Windows Source</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Complete source code for Windows
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<SourceIcon />}
                    onClick={() =>
                      handleDownload(
                        agentInfo.downloads.source!.windows,
                        'cmdb-agent-windows.zip'
                      )
                    }
                  >
                    Download ZIP
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SourceIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Docker Compose</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Docker deployment configuration
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() =>
                      handleDownload(
                        agentInfo.downloads.source!.docker,
                        'docker-compose.yml'
                      )
                    }
                  >
                    Download YAML
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Requirements Section */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          System Requirements
        </Typography>
        <List dense>
          {agentInfo.requirements.standalone && (
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Standalone Executables"
                secondary={agentInfo.requirements.standalone}
              />
            </ListItem>
          )}
          {agentInfo.requirements.source && (
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Source Code"
                secondary={`Node.js ${agentInfo.requirements.source}`}
              />
            </ListItem>
          )}
          {agentInfo.requirements.docker && (
            <ListItem>
              <ListItemIcon>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Docker Deployment"
                secondary={agentInfo.requirements.docker}
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Container>
  );
};

export default DownloadsPage;
