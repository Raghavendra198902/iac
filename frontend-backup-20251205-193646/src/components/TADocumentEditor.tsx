import { useState } from 'react';
import { X, Save, Sparkles, FileCode, Plus, Trash2, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { API_URL } from '../config/api';

interface TADocumentProps {
  onSave: (document: any) => void;
  onCancel: () => void;
}

export default function TADocumentEditor({ onSave, onCancel }: TADocumentProps) {
  const [activeSection, setActiveSection] = useState(1);
  const [generating, setGenerating] = useState(false);

  // Document metadata
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentVersion, setDocumentVersion] = useState('1.0');
  const [architect, setArchitect] = useState('');
  const [systemName, setSystemName] = useState('');

  // Section 1: Component Architecture
  const [components, setComponents] = useState([{ name: '', layer: 'API', purpose: '', technologies: '' }]);

  // Section 2: Technology Stack
  const [techStack, setTechStack] = useState({
    backend: '',
    frontend: '',
    agents: '',
    databases: '',
    messageBrokers: '',
    cicd: '',
    codeQuality: ''
  });

  // Section 3: API Contracts
  const [apiContracts, setApiContracts] = useState([{ endpoint: '', method: 'GET', request: '', response: '', errorCodes: '' }]);

  // Section 4: Sequence Diagrams
  const [sequenceDiagrams, setSequenceDiagrams] = useState([{ flow: '', steps: '' }]);

  // Section 5: Database Physical Schema
  const [databaseSchema, setDatabaseSchema] = useState([{ table: '', columns: '', indexes: '', partitioning: '' }]);

  // Section 6: Data Integrity Rules
  const [integrityRules, setIntegrityRules] = useState([{ field: '', validation: '', enforcement: '' }]);

  // Section 7: Event Processing
  const [eventProcessing, setEventProcessing] = useState({
    ingestion: '',
    enrichment: '',
    failover: '',
    deadLetter: '',
    normalization: ''
  });

  // Section 8: Caching Architecture
  const [cachingStrategy, setCachingStrategy] = useState({
    patterns: '',
    invalidation: '',
    queryCaching: '',
    sessionCaching: '',
    bloomFilters: ''
  });

  // Section 9: Security Hardening
  const [securityHardening, setSecurityHardening] = useState({
    sanitization: '',
    injectionProtection: '',
    middlewares: '',
    tlsEnforcement: '',
    jwtPolicies: '',
    cookieRules: ''
  });

  // Section 10: Cryptographic Architecture
  const [cryptography, setCryptography] = useState({
    encryption: '',
    keyExchange: '',
    hashing: '',
    keyStorage: '',
    certRotation: '',
    randomGeneration: ''
  });

  // Section 11: Message Broker
  const [messageBroker, setMessageBroker] = useState({
    topicNaming: '',
    partitioning: '',
    consumerGroups: '',
    retryTopics: '',
    backpressure: '',
    schemaRegistry: ''
  });

  // Section 12: File & Evidence Handling
  const [evidenceHandling, setEvidenceHandling] = useState({
    multipartUpload: '',
    virusScanning: '',
    checksumVerification: '',
    tamperProof: '',
    signedMetadata: '',
    secureStorage: ''
  });

  // Section 13: Agent Architecture
  const [agentArchitecture, setAgentArchitecture] = useState({
    lifecycle: '',
    offlineBuffering: '',
    signedConfigs: '',
    encryption: '',
    privilegeHandling: '',
    commandSandbox: ''
  });

  // Section 14: Load Balancing
  const [loadBalancing, setLoadBalancing] = useState({
    routingPolicies: '',
    layer4vs7: '',
    stickySessions: '',
    grpcBalancing: '',
    failoverRouting: ''
  });

  // Section 15: Logging Architecture
  const [loggingArchitecture, setLoggingArchitecture] = useState({
    structuredLogging: '',
    logLevels: '',
    sampling: '',
    redaction: '',
    logShipping: ''
  });

  // Section 16: Observability
  const [observability, setObservability] = useState({
    tracing: '',
    tracePropagation: '',
    spanNaming: '',
    flameGraphs: '',
    alerting: ''
  });

  // Section 17: Performance Engineering
  const [performance, setPerformance] = useState({
    latencyBudget: '',
    queryOptimization: '',
    asyncVsSync: '',
    benchmarking: '',
    profiling: '',
    autoscaling: ''
  });

  // Section 18: Testing Architecture
  const [testing, setTesting] = useState({
    unitTesting: '',
    integrationTesting: '',
    contractTesting: '',
    e2eTesting: '',
    loadTesting: '',
    securityTesting: ''
  });

  // Section 19: Deployment Model
  const [deploymentModel, setDeploymentModel] = useState({
    helmCharts: '',
    gitops: '',
    canaryDeployments: '',
    featureFlags: '',
    secretsInjection: ''
  });

  // Section 20: Architecture Governance
  const [governance, setGovernance] = useState({
    adrTemplates: '',
    reviewCheckpoints: '',
    breakingChanges: '',
    complianceScanning: '',
    documentation: ''
  });

  const [references, setReferences] = useState(['']);

  const generateWithAI = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/repository/artifacts/generate-ta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemName, architect })
      });

      if (!response.ok) throw new Error('Failed to generate TA');

      const data = await response.json();
      
      // Populate all fields with AI-generated data
      setDocumentTitle(data.documentTitle || `${systemName} - Technical Architecture`);
      setComponents(data.components || components);
      setTechStack(data.techStack || techStack);
      setApiContracts(data.apiContracts || apiContracts);
      setSequenceDiagrams(data.sequenceDiagrams || sequenceDiagrams);
      setDatabaseSchema(data.databaseSchema || databaseSchema);
      setIntegrityRules(data.integrityRules || integrityRules);
      setEventProcessing(data.eventProcessing || eventProcessing);
      setCachingStrategy(data.cachingStrategy || cachingStrategy);
      setSecurityHardening(data.securityHardening || securityHardening);
      setCryptography(data.cryptography || cryptography);
      setMessageBroker(data.messageBroker || messageBroker);
      setEvidenceHandling(data.evidenceHandling || evidenceHandling);
      setAgentArchitecture(data.agentArchitecture || agentArchitecture);
      setLoadBalancing(data.loadBalancing || loadBalancing);
      setLoggingArchitecture(data.loggingArchitecture || loggingArchitecture);
      setObservability(data.observability || observability);
      setPerformance(data.performance || performance);
      setTesting(data.testing || testing);
      setDeploymentModel(data.deploymentModel || deploymentModel);
      setGovernance(data.governance || governance);
      setReferences(data.references || references);
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Failed to generate TA document with AI');
    } finally {
      setGenerating(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text(documentTitle || 'Technical Architecture Document', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Version: ${documentVersion}`, 20, yPos);
    yPos += 7;
    doc.text(`Architect: ${architect}`, 20, yPos);
    yPos += 7;
    doc.text(`System: ${systemName}`, 20, yPos);
    yPos += 15;

    // Add sections
    const sections = [
      { title: '1. Low-Level Component Architecture', data: components },
      { title: '2. Technology Stack Specification', data: techStack },
      { title: '3. Internal API Contract Definitions', data: apiContracts },
      { title: '4. Sequence Diagrams', data: sequenceDiagrams },
      { title: '5. Database Physical Schema', data: databaseSchema },
      { title: '6. Data Integrity & Validation Rules', data: integrityRules },
      { title: '7. Event Processing Architecture', data: eventProcessing },
      { title: '8. Caching Layer Architecture', data: cachingStrategy },
      { title: '9. Security Hardening Blueprint', data: securityHardening },
      { title: '10. Cryptographic Architecture', data: cryptography },
      { title: '11. Message Broker Architecture', data: messageBroker },
      { title: '12. File & Evidence Handling Architecture', data: evidenceHandling },
      { title: '13. Agent Architecture (Technical)', data: agentArchitecture },
      { title: '14. Load Balancing & Routing Architecture', data: loadBalancing },
      { title: '15. Logging Architecture (Deep Level)', data: loggingArchitecture },
      { title: '16. Observability & Distributed Tracing', data: observability },
      { title: '17. Performance Engineering', data: performance },
      { title: '18. Testing Architecture', data: testing },
      { title: '19. Deployment Technical Model', data: deploymentModel },
      { title: '20. Technical Architecture Governance', data: governance }
    ];

    sections.forEach(section => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text(section.title, 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text(JSON.stringify(section.data).substring(0, 100) + '...', 20, yPos);
      yPos += 15;
    });

    doc.save(`${systemName || 'System'}_Technical_Architecture.pdf`);
  };

  const handleSave = () => {
    const taDocument = {
      documentTitle,
      documentVersion,
      architect,
      systemName,
      components,
      techStack,
      apiContracts,
      sequenceDiagrams,
      databaseSchema,
      integrityRules,
      eventProcessing,
      cachingStrategy,
      securityHardening,
      cryptography,
      messageBroker,
      evidenceHandling,
      agentArchitecture,
      loadBalancing,
      loggingArchitecture,
      observability,
      performance,
      testing,
      deploymentModel,
      governance,
      references
    };
    onSave(taDocument);
  };

  const sections = [
    { id: 1, title: 'Component Architecture' },
    { id: 2, title: 'Technology Stack' },
    { id: 3, title: 'API Contracts' },
    { id: 4, title: 'Sequence Diagrams' },
    { id: 5, title: 'Database Schema' },
    { id: 6, title: 'Data Integrity' },
    { id: 7, title: 'Event Processing' },
    { id: 8, title: 'Caching Architecture' },
    { id: 9, title: 'Security Hardening' },
    { id: 10, title: 'Cryptography' },
    { id: 11, title: 'Message Broker' },
    { id: 12, title: 'Evidence Handling' },
    { id: 13, title: 'Agent Architecture' },
    { id: 14, title: 'Load Balancing' },
    { id: 15, title: 'Logging' },
    { id: 16, title: 'Observability' },
    { id: 17, title: 'Performance' },
    { id: 18, title: 'Testing' },
    { id: 19, title: 'Deployment' },
    { id: 20, title: 'Governance' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Horizontal Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">TA Sections</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? 'bg-white text-blue-700 border-t-2 border-x border-blue-500 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>{section.id}. {section.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCode className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Technical Architecture Document</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateWithAI}
              disabled={generating || !systemName}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate with AI'}
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export PDF
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Document Info */}
          {activeSection === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Document Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Document Title</label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="e.g., SIEM Platform - Technical Architecture"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Version</label>
                    <input
                      type="text"
                      value={documentVersion}
                      onChange={(e) => setDocumentVersion(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Architect</label>
                    <input
                      type="text"
                      value={architect}
                      onChange={(e) => setArchitect(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Lead Technical Architect"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">System Name</label>
                    <input
                      type="text"
                      value={systemName}
                      onChange={(e) => setSystemName(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="e.g., DHARMA SIEM Platform"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">1. Low-Level Component Architecture</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Detailed breakdown of each internal service component, controllers, services, repositories, helpers, utilities
                </p>
                {components.map((comp, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded mb-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => {
                          const updated = [...components];
                          updated[idx].name = e.target.value;
                          setComponents(updated);
                        }}
                        className="px-3 py-2 border rounded"
                        placeholder="Component Name"
                      />
                      <select
                        value={comp.layer}
                        onChange={(e) => {
                          const updated = [...components];
                          updated[idx].layer = e.target.value;
                          setComponents(updated);
                        }}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="API">API Layer</option>
                        <option value="Service">Service Layer</option>
                        <option value="Data">Data Layer</option>
                        <option value="Infrastructure">Infrastructure Layer</option>
                      </select>
                      <input
                        type="text"
                        value={comp.purpose}
                        onChange={(e) => {
                          const updated = [...components];
                          updated[idx].purpose = e.target.value;
                          setComponents(updated);
                        }}
                        className="px-3 py-2 border rounded"
                        placeholder="Purpose & Responsibility"
                      />
                      <input
                        type="text"
                        value={comp.technologies}
                        onChange={(e) => {
                          const updated = [...components];
                          updated[idx].technologies = e.target.value;
                          setComponents(updated);
                        }}
                        className="px-3 py-2 border rounded"
                        placeholder="Technologies Used"
                      />
                    </div>
                    <button
                      onClick={() => setComponents(components.filter((_, i) => i !== idx))}
                      className="mt-2 text-red-600 text-sm flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setComponents([...components, { name: '', layer: 'API', purpose: '', technologies: '' }])}
                  className="text-blue-600 flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Component
                </button>
              </div>
            </div>
          )}

          {/* Section 2: Technology Stack */}
          {activeSection === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">2. Technology Stack Specification</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Backend Languages & Frameworks</label>
                  <textarea
                    value={techStack.backend}
                    onChange={(e) => setTechStack({ ...techStack, backend: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="Python/FastAPI, Go, Node.js/Express"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frontend Stack</label>
                  <textarea
                    value={techStack.frontend}
                    onChange={(e) => setTechStack({ ...techStack, frontend: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="React 18, TypeScript, MUI, Tailwind, WebSockets"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Agent Stack</label>
                  <textarea
                    value={techStack.agents}
                    onChange={(e) => setTechStack({ ...techStack, agents: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="Python, Go, C++, Swift/Kotlin for mobile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Databases</label>
                  <textarea
                    value={techStack.databases}
                    onChange={(e) => setTechStack({ ...techStack, databases: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="PostgreSQL, TimescaleDB, Redis, MongoDB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message Brokers</label>
                  <textarea
                    value={techStack.messageBrokers}
                    onChange={(e) => setTechStack({ ...techStack, messageBrokers: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="Kafka/RabbitMQ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CI/CD Stack</label>
                  <textarea
                    value={techStack.cicd}
                    onChange={(e) => setTechStack({ ...techStack, cicd: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="GitHub Actions, Docker, Kubernetes, Helm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Code Quality Tools</label>
                  <textarea
                    value={techStack.codeQuality}
                    onChange={(e) => setTechStack({ ...techStack, codeQuality: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="Black, ESLint, SonarQube, Prettier"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: API Contracts */}
          {activeSection === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">3. Internal API Contract Definitions</h3>
              <p className="text-sm text-gray-600">OpenAPI/Swagger definitions, request/response schemas</p>
              {apiContracts.map((api, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded mb-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={api.endpoint}
                      onChange={(e) => {
                        const updated = [...apiContracts];
                        updated[idx].endpoint = e.target.value;
                        setApiContracts(updated);
                      }}
                      className="px-3 py-2 border rounded"
                      placeholder="/api/v1/events"
                    />
                    <select
                      value={api.method}
                      onChange={(e) => {
                        const updated = [...apiContracts];
                        updated[idx].method = e.target.value;
                        setApiContracts(updated);
                      }}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                    <textarea
                      value={api.request}
                      onChange={(e) => {
                        const updated = [...apiContracts];
                        updated[idx].request = e.target.value;
                        setApiContracts(updated);
                      }}
                      className="px-3 py-2 border rounded"
                      rows={2}
                      placeholder="Request Schema"
                    />
                    <textarea
                      value={api.response}
                      onChange={(e) => {
                        const updated = [...apiContracts];
                        updated[idx].response = e.target.value;
                        setApiContracts(updated);
                      }}
                      className="px-3 py-2 border rounded"
                      rows={2}
                      placeholder="Response Schema"
                    />
                    <input
                      type="text"
                      value={api.errorCodes}
                      onChange={(e) => {
                        const updated = [...apiContracts];
                        updated[idx].errorCodes = e.target.value;
                        setApiContracts(updated);
                      }}
                      className="px-3 py-2 border rounded col-span-2"
                      placeholder="Error Codes: 400, 401, 404, 500"
                    />
                  </div>
                  <button
                    onClick={() => setApiContracts(apiContracts.filter((_, i) => i !== idx))}
                    className="mt-2 text-red-600 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => setApiContracts([...apiContracts, { endpoint: '', method: 'GET', request: '', response: '', errorCodes: '' }])}
                className="text-blue-600 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" /> Add API Contract
              </button>
            </div>
          )}

          {/* Section 4: Sequence Diagrams */}
          {activeSection === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">4. Sequence Diagrams (Deep Detail)</h3>
              <p className="text-sm text-gray-600">Authentication, agent events, enrichment pipelines</p>
              {sequenceDiagrams.map((seq, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded mb-3">
                  <input
                    type="text"
                    value={seq.flow}
                    onChange={(e) => {
                      const updated = [...sequenceDiagrams];
                      updated[idx].flow = e.target.value;
                      setSequenceDiagrams(updated);
                    }}
                    className="w-full px-3 py-2 border rounded mb-2"
                    placeholder="Flow Name (e.g., Authentication Flow)"
                  />
                  <textarea
                    value={seq.steps}
                    onChange={(e) => {
                      const updated = [...sequenceDiagrams];
                      updated[idx].steps = e.target.value;
                      setSequenceDiagrams(updated);
                    }}
                    className="w-full px-3 py-2 border rounded"
                    rows={4}
                    placeholder="Sequence steps: Client → Gateway → Auth → Token → Refresh"
                  />
                  <button
                    onClick={() => setSequenceDiagrams(sequenceDiagrams.filter((_, i) => i !== idx))}
                    className="mt-2 text-red-600 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => setSequenceDiagrams([...sequenceDiagrams, { flow: '', steps: '' }])}
                className="text-blue-600 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Sequence Diagram
              </button>
            </div>
          )}

          {/* Section 5: Database Schema */}
          {activeSection === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">5. Database Physical Schema</h3>
              <p className="text-sm text-gray-600">Table structures, indexes, partitioning, hypertables</p>
              {databaseSchema.map((table, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded mb-3">
                  <input
                    type="text"
                    value={table.table}
                    onChange={(e) => {
                      const updated = [...databaseSchema];
                      updated[idx].table = e.target.value;
                      setDatabaseSchema(updated);
                    }}
                    className="w-full px-3 py-2 border rounded mb-2"
                    placeholder="Table Name (e.g., events)"
                  />
                  <textarea
                    value={table.columns}
                    onChange={(e) => {
                      const updated = [...databaseSchema];
                      updated[idx].columns = e.target.value;
                      setDatabaseSchema(updated);
                    }}
                    className="w-full px-3 py-2 border rounded mb-2"
                    rows={2}
                    placeholder="Columns with PK, FK, constraints"
                  />
                  <textarea
                    value={table.indexes}
                    onChange={(e) => {
                      const updated = [...databaseSchema];
                      updated[idx].indexes = e.target.value;
                      setDatabaseSchema(updated);
                    }}
                    className="w-full px-3 py-2 border rounded mb-2"
                    rows={2}
                    placeholder="Indexes: btree, hash, GIN, BRIN"
                  />
                  <input
                    type="text"
                    value={table.partitioning}
                    onChange={(e) => {
                      const updated = [...databaseSchema];
                      updated[idx].partitioning = e.target.value;
                      setDatabaseSchema(updated);
                    }}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Partitioning Strategy"
                  />
                  <button
                    onClick={() => setDatabaseSchema(databaseSchema.filter((_, i) => i !== idx))}
                    className="mt-2 text-red-600 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => setDatabaseSchema([...databaseSchema, { table: '', columns: '', indexes: '', partitioning: '' }])}
                className="text-blue-600 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Table
              </button>
            </div>
          )}

          {/* Sections 6-20 follow similar patterns - I'll create condensed versions for brevity */}
          
          {/* Section 6: Data Integrity */}
          {activeSection === 6 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">6. Data Integrity & Validation Rules</h3>
              {integrityRules.map((rule, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded mb-3">
                  <input
                    type="text"
                    value={rule.field}
                    onChange={(e) => {
                      const updated = [...integrityRules];
                      updated[idx].field = e.target.value;
                      setIntegrityRules(updated);
                    }}
                    className="w-full px-3 py-2 border rounded mb-2"
                    placeholder="Field Name"
                  />
                  <textarea
                    value={rule.validation}
                    onChange={(e) => {
                      const updated = [...integrityRules];
                      updated[idx].validation = e.target.value;
                      setIntegrityRules(updated);
                    }}
                    className="w-full px-3 py-2 border rounded mb-2"
                    rows={2}
                    placeholder="Validation Rules"
                  />
                  <input
                    type="text"
                    value={rule.enforcement}
                    onChange={(e) => {
                      const updated = [...integrityRules];
                      updated[idx].enforcement = e.target.value;
                      setIntegrityRules(updated);
                    }}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enforcement Level"
                  />
                  <button
                    onClick={() => setIntegrityRules(integrityRules.filter((_, i) => i !== idx))}
                    className="mt-2 text-red-600 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => setIntegrityRules([...integrityRules, { field: '', validation: '', enforcement: '' }])}
                className="text-blue-600 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Rule
              </button>
            </div>
          )}

          {/* Sections 7-20: Structured object forms */}
          {activeSection === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">7. Event Processing Architecture</h3>
              {Object.keys(eventProcessing).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={eventProcessing[key as keyof typeof eventProcessing]}
                    onChange={(e) => setEventProcessing({ ...eventProcessing, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 8 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">8. Caching Layer Architecture</h3>
              {Object.keys(cachingStrategy).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={cachingStrategy[key as keyof typeof cachingStrategy]}
                    onChange={(e) => setCachingStrategy({ ...cachingStrategy, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 9 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">9. Security Hardening Blueprint</h3>
              {Object.keys(securityHardening).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={securityHardening[key as keyof typeof securityHardening]}
                    onChange={(e) => setSecurityHardening({ ...securityHardening, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 10 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">10. Cryptographic Architecture</h3>
              {Object.keys(cryptography).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={cryptography[key as keyof typeof cryptography]}
                    onChange={(e) => setCryptography({ ...cryptography, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 11 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">11. Message Broker Architecture</h3>
              {Object.keys(messageBroker).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={messageBroker[key as keyof typeof messageBroker]}
                    onChange={(e) => setMessageBroker({ ...messageBroker, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 12 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">12. File & Evidence Handling Architecture</h3>
              {Object.keys(evidenceHandling).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={evidenceHandling[key as keyof typeof evidenceHandling]}
                    onChange={(e) => setEvidenceHandling({ ...evidenceHandling, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 13 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">13. Agent Architecture (Technical)</h3>
              {Object.keys(agentArchitecture).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={agentArchitecture[key as keyof typeof agentArchitecture]}
                    onChange={(e) => setAgentArchitecture({ ...agentArchitecture, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 14 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">14. Load Balancing & Routing Architecture</h3>
              {Object.keys(loadBalancing).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={loadBalancing[key as keyof typeof loadBalancing]}
                    onChange={(e) => setLoadBalancing({ ...loadBalancing, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 15 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">15. Logging Architecture (Deep Level)</h3>
              {Object.keys(loggingArchitecture).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={loggingArchitecture[key as keyof typeof loggingArchitecture]}
                    onChange={(e) => setLoggingArchitecture({ ...loggingArchitecture, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 16 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">16. Observability & Distributed Tracing</h3>
              {Object.keys(observability).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={observability[key as keyof typeof observability]}
                    onChange={(e) => setObservability({ ...observability, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 17 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">17. Performance Engineering</h3>
              {Object.keys(performance).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={performance[key as keyof typeof performance]}
                    onChange={(e) => setPerformance({ ...performance, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 18 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">18. Testing Architecture</h3>
              {Object.keys(testing).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={testing[key as keyof typeof testing]}
                    onChange={(e) => setTesting({ ...testing, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 19 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">19. Deployment Technical Model</h3>
              {Object.keys(deploymentModel).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={deploymentModel[key as keyof typeof deploymentModel]}
                    onChange={(e) => setDeploymentModel({ ...deploymentModel, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 20 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">20. Technical Architecture Governance</h3>
              {Object.keys(governance).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <textarea
                    value={governance[key as keyof typeof governance]}
                    onChange={(e) => setGovernance({ ...governance, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>
              ))}

              <div className="mt-8">
                <h4 className="text-md font-semibold mb-3">References</h4>
                {references.map((ref, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={ref}
                      onChange={(e) => {
                        const updated = [...references];
                        updated[idx] = e.target.value;
                        setReferences(updated);
                      }}
                      className="flex-1 px-3 py-2 border rounded"
                      placeholder="Reference URL or document"
                    />
                    <button
                      onClick={() => setReferences(references.filter((_, i) => i !== idx))}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setReferences([...references, ''])}
                  className="text-blue-600 flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Reference
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
