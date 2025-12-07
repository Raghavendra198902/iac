import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Chip,
  Grid,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Code as CodeIcon,
  AttachMoney as MoneyIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface NLIResponse {
  understood: boolean;
  intent: string;
  entities: Record<string, any>;
  generatedCode: {
    terraform?: string;
    cloudformation?: string;
    kubernetes?: string;
    pulumi?: string;
  };
  estimatedCost: {
    monthly: number;
    currency: string;
    breakdown: Array<{ resource: string; cost: number }>;
  };
  recommendations: string[];
  alternatives: Array<{
    description: string;
    costSaving: number;
    tradeoffs: string[];
  }>;
}

const NaturalLanguageInfrastructure: React.FC = () => {
  const [command, setCommand] = useState('');
  const [provider, setProvider] = useState<'aws' | 'azure' | 'gcp' | 'kubernetes'>('aws');
  const [environment, setEnvironment] = useState<'dev' | 'staging' | 'production'>('production');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<NLIResponse | null>(null);
  const [error, setError] = useState('');
  const [codeTab, setCodeTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const exampleCommands = [
    'Create a Kubernetes cluster with 3 nodes',
    'Deploy a PostgreSQL database with high availability',
    'Setup a web application with auto-scaling',
    'Create a highly available web app with 5 replicas',
    'Setup an EKS cluster with auto-scaling',
  ];

  const handleSubmit = async () => {
    if (!command.trim()) {
      setError('Please enter a command');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('http://localhost:4000/api/nli/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          context: {
            provider,
            environment,
          },
        }),
      });

      const data = await res.json();
      setResponse(data);

      if (!data.understood) {
        setError('Command not understood. Try one of the example commands.');
      }
    } catch (err: any) {
      setError(`Failed to process command: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeLanguage = (index: number): string => {
    const codeKeys = Object.keys(response?.generatedCode || {});
    const key = codeKeys[index];
    if (key === 'terraform') return 'hcl';
    if (key === 'kubernetes') return 'yaml';
    if (key === 'cloudformation') return 'yaml';
    if (key === 'pulumi') return 'typescript';
    return 'text';
  };

  const getCurrentCode = (): string => {
    const codeKeys = Object.keys(response?.generatedCode || {});
    const key = codeKeys[codeTab];
    return response?.generatedCode[key as keyof typeof response.generatedCode] || '';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🤖 Natural Language Infrastructure
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Describe your infrastructure needs in plain English, and let AI generate the code for you.
      </Typography>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Describe Your Infrastructure
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="e.g., Create a Kubernetes cluster with 3 nodes on AWS"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Cloud Provider</InputLabel>
                    <Select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value as any)}
                      disabled={loading}
                    >
                      <MenuItem value="aws">AWS</MenuItem>
                      <MenuItem value="azure">Azure</MenuItem>
                      <MenuItem value="gcp">Google Cloud</MenuItem>
                      <MenuItem value="kubernetes">Kubernetes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Environment</InputLabel>
                    <Select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as any)}
                      disabled={loading}
                    >
                      <MenuItem value="dev">Development</MenuItem>
                      <MenuItem value="staging">Staging</MenuItem>
                      <MenuItem value="production">Production</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                onClick={handleSubmit}
                disabled={loading || !command.trim()}
              >
                {loading ? 'Generating...' : 'Generate Infrastructure Code'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" gutterBottom>
                Try these examples:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {exampleCommands.map((example, index) => (
                  <Chip
                    key={index}
                    label={example}
                    onClick={() => setCommand(example)}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {response && response.understood && (
            <>
              {/* Cost Estimation */}
              <Card elevation={3} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Cost Estimation</Typography>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      p: 2,
                      borderRadius: 1,
                      textAlign: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold">
                      ${response.estimatedCost.monthly}/month
                    </Typography>
                    <Typography variant="caption">Estimated monthly cost</Typography>
                  </Box>

                  {response.estimatedCost.breakdown.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Cost Breakdown:
                      </Typography>
                      {response.estimatedCost.breakdown.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            py: 0.5,
                          }}
                        >
                          <Typography variant="body2">{item.resource}</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            ${item.cost.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              {response.recommendations.length > 0 && (
                <Card elevation={3} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="h6">Recommendations</Typography>
                    </Box>

                    {response.recommendations.map((rec, index) => (
                      <Alert
                        key={index}
                        severity={
                          rec.startsWith('✓')
                            ? 'success'
                            : rec.startsWith('⚠️')
                            ? 'warning'
                            : 'info'
                        }
                        icon={rec.startsWith('✓') ? <CheckIcon /> : undefined}
                        sx={{ mb: 1 }}
                      >
                        {rec}
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Alternatives */}
              {response.alternatives.length > 0 && (
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Alternative Options
                    </Typography>

                    {response.alternatives.map((alt, index) => (
                      <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography sx={{ flexGrow: 1 }}>{alt.description}</Typography>
                            <Chip
                              label={`Save $${alt.costSaving}/mo`}
                              color="success"
                              size="small"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="subtitle2" gutterBottom>
                            Tradeoffs:
                          </Typography>
                          <ul>
                            {alt.tradeoffs.map((tradeoff, i) => (
                              <li key={i}>
                                <Typography variant="body2">{tradeoff}</Typography>
                              </li>
                            ))}
                          </ul>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Grid>

        {/* Generated Code Section */}
        {response && response.understood && Object.keys(response.generatedCode).length > 0 && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CodeIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Generated Code</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => handleCopyCode(getCurrentCode())}
                  >
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                </Box>

                <Tabs
                  value={codeTab}
                  onChange={(_, newValue) => setCodeTab(newValue)}
                  sx={{ mb: 2 }}
                >
                  {Object.keys(response.generatedCode).map((key, index) => (
                    <Tab key={key} label={key.toUpperCase()} />
                  ))}
                </Tabs>

                <Paper elevation={0} sx={{ bgcolor: '#1e1e1e', borderRadius: 1 }}>
                  <SyntaxHighlighter
                    language={getCodeLanguage(codeTab)}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: 4,
                      fontSize: '0.875rem',
                      maxHeight: '500px',
                    }}
                  >
                    {getCurrentCode()}
                  </SyntaxHighlighter>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default NaturalLanguageInfrastructure;
