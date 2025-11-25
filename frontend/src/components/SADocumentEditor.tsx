import { useState } from 'react';
import { FileText, Download, Plus, Trash2, Save, Sparkles, Network, Shield, Database, Layers } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

interface SADocument {
  // Header Information
  documentTitle: string;
  documentVersion: string;
  documentDate: string;
  architect: string;
  reviewers: string;
  approvers: string;
  
  // 1. System Context
  systemContext: string;
  externalSystems: Array<{
    name: string;
    type: string;
    interaction: string;
  }>;
  systemBoundaries: string;
  trustZones: string[];
  
  // 2. System Decomposition
  subsystems: Array<{
    name: string;
    purpose: string;
    responsibilities: string;
  }>;
  
  // 3. Microservices Architecture
  microservices: Array<{
    name: string;
    type: string; // stateless/stateful
    purpose: string;
    dependencies: string;
  }>;
  
  // 4. API Architecture
  apiCommunicationModel: string;
  apiEndpoints: Array<{
    service: string;
    endpoint: string;
    method: string;
    authentication: string;
  }>;
  rateLimiting: string;
  
  // 5. Data Flow
  dataFlowDescription: string;
  streamingArchitecture: string;
  batchProcessing: string;
  encryptionFlow: string;
  
  // 6. Database Design
  logicalSchema: string;
  databaseEntities: string[];
  indexingStrategy: string;
  partitioningLogic: string;
  storageTypes: string;
  
  // 7. Deployment Architecture
  deploymentModel: string;
  autoscalingRules: string;
  loadBalancing: string;
  deploymentStrategies: string;
  
  // 8. Integration Architecture
  integrations: Array<{
    system: string;
    method: string;
    purpose: string;
  }>;
  
  // 9. Security Architecture
  authenticationMechanism: string;
  authorizationModel: string;
  secretsManagement: string;
  networkSecurity: string;
  auditLogging: string;
  
  // 10. High Availability
  haArchitecture: string;
  failoverStrategy: string;
  healthChecks: string;
  autoRecovery: string;
  
  // 11. Observability
  loggingStrategy: string;
  metricsCollection: string;
  distributedTracing: string;
  alertingRules: string;
  
  // 12. Workflow Orchestration
  automatedWorkflows: string;
  eventProcessing: string;
  orchestrationPipeline: string;
  
  // 13. Analytics Pipeline
  dataIngestion: string;
  enrichmentLogic: string;
  mlIntegration: string;
  queryOptimization: string;
  
  // 14. Evidence & Forensics
  evidenceCollection: string;
  chainOfCustody: string;
  integrityVerification: string;
  secureStorage: string;
  
  // 15. Notification Architecture
  alertRouting: string;
  alertPrioritization: string;
  notificationChannels: string[];
  alertDeduplication: string;
  
  // 16. UI/UX Architecture
  uiComponentMapping: string;
  stateManagement: string;
  realtimeDashboards: string;
  roleBasedUI: string;
  
  // 17. Mobile & Agent Framework
  agentCommunication: string;
  heartbeatMechanism: string;
  updateDistribution: string;
  offlineSupport: string;
  
  // 18. Performance Engineering
  scalingStrategy: string;
  cachingStrategy: string;
  throughputOptimization: string;
  performanceTargets: string;
  
  // 19. Disaster Recovery
  rtoRpoMapping: string;
  backupStrategy: string;
  failoverPlan: string;
  drSiteStrategy: string;
  
  // 20. Governance
  architectureDecisions: Array<{
    decision: string;
    rationale: string;
    date: string;
  }>;
  versioningStrategy: string;
  reviewCheckpoints: string;
  
  // Additional
  references: string[];
  glossary: string;
  appendix: string;
}

interface Props {
  onSave: (document: SADocument) => void;
  initialData?: Partial<SADocument>;
  onCancel: () => void;
}

const DEFAULT_SA: SADocument = {
  documentTitle: '',
  documentVersion: '1.0',
  documentDate: new Date().toISOString().split('T')[0],
  architect: '',
  reviewers: '',
  approvers: '',
  systemContext: '',
  externalSystems: [],
  systemBoundaries: '',
  trustZones: [''],
  subsystems: [],
  microservices: [],
  apiCommunicationModel: '',
  apiEndpoints: [],
  rateLimiting: '',
  dataFlowDescription: '',
  streamingArchitecture: '',
  batchProcessing: '',
  encryptionFlow: '',
  logicalSchema: '',
  databaseEntities: [''],
  indexingStrategy: '',
  partitioningLogic: '',
  storageTypes: '',
  deploymentModel: '',
  autoscalingRules: '',
  loadBalancing: '',
  deploymentStrategies: '',
  integrations: [],
  authenticationMechanism: '',
  authorizationModel: '',
  secretsManagement: '',
  networkSecurity: '',
  auditLogging: '',
  haArchitecture: '',
  failoverStrategy: '',
  healthChecks: '',
  autoRecovery: '',
  loggingStrategy: '',
  metricsCollection: '',
  distributedTracing: '',
  alertingRules: '',
  automatedWorkflows: '',
  eventProcessing: '',
  orchestrationPipeline: '',
  dataIngestion: '',
  enrichmentLogic: '',
  mlIntegration: '',
  queryOptimization: '',
  evidenceCollection: '',
  chainOfCustody: '',
  integrityVerification: '',
  secureStorage: '',
  alertRouting: '',
  alertPrioritization: '',
  notificationChannels: [''],
  alertDeduplication: '',
  uiComponentMapping: '',
  stateManagement: '',
  realtimeDashboards: '',
  roleBasedUI: '',
  agentCommunication: '',
  heartbeatMechanism: '',
  updateDistribution: '',
  offlineSupport: '',
  scalingStrategy: '',
  cachingStrategy: '',
  throughputOptimization: '',
  performanceTargets: '',
  rtoRpoMapping: '',
  backupStrategy: '',
  failoverPlan: '',
  drSiteStrategy: '',
  architectureDecisions: [],
  versioningStrategy: '',
  reviewCheckpoints: '',
  references: [''],
  glossary: '',
  appendix: ''
};

export default function SADocumentEditor({ onSave, initialData, onCancel }: Props) {
  const [document, setDocument] = useState<SADocument>({
    ...DEFAULT_SA,
    ...initialData
  });

  const [activeSection, setActiveSection] = useState<string>('header');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(true);

  const updateField = (field: keyof SADocument, value: any) => {
    setDocument(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof SADocument, defaultItem?: any) => {
    const current = document[field] as any[];
    const newItem = defaultItem || '';
    updateField(field, [...current, newItem]);
  };

  const updateArrayItem = (field: keyof SADocument, index: number, value: any) => {
    const current = document[field] as any[];
    const updated = [...current];
    updated[index] = value;
    updateField(field, updated);
  };

  const removeArrayItem = (field: keyof SADocument, index: number) => {
    const current = document[field] as any[];
    updateField(field, current.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!document.documentTitle) {
      toast.error('Document title is required');
      return;
    }
    onSave(document);
  };

  const generateWithAI = async () => {
    if (!document.documentTitle) {
      toast.error('Please enter a document title first');
      return;
    }
    if (!document.systemContext) {
      toast.error('Please enter a system context/description first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_URL}/repository/artifacts/generate-sa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: document.documentTitle,
          description: document.systemContext,
          platformType: detectPlatformType(document.systemContext)
        })
      });

      if (!response.ok) throw new Error('Failed to generate SA');

      const generatedSA = await response.json();
      setDocument(prev => ({
        ...prev,
        ...generatedSA
      }));
      setShowAIPrompt(false);
      toast.success('✨ SA document generated with AI! You can now edit any section.');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate SA document');
    } finally {
      setIsGenerating(false);
    }
  };

  const detectPlatformType = (description: string): string => {
    const lower = description.toLowerCase();
    if (lower.includes('security') || lower.includes('siem') || lower.includes('edr')) return 'security';
    if (lower.includes('ecommerce') || lower.includes('retail')) return 'ecommerce';
    if (lower.includes('finance') || lower.includes('banking')) return 'finance';
    if (lower.includes('healthcare') || lower.includes('medical')) return 'healthcare';
    if (lower.includes('iot') || lower.includes('device')) return 'iot';
    return 'enterprise';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    const marginBottom = 20;

    const checkPageBreak = (neededSpace: number) => {
      if (yPos + neededSpace > pageHeight - marginBottom) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Title Page
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Solution Architecture Document', 105, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setFontSize(16);
    doc.text(document.documentTitle, 105, yPos, { align: 'center' });
    yPos += 20;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Version: ${document.documentVersion}`, 20, yPos);
    yPos += 7;
    doc.text(`Date: ${document.documentDate}`, 20, yPos);
    yPos += 7;
    doc.text(`Architect: ${document.architect}`, 20, yPos);
    yPos += 7;
    doc.text(`Reviewers: ${document.reviewers}`, 20, yPos);
    yPos += 7;
    doc.text(`Approvers: ${document.approvers}`, 20, yPos);

    // Table of Contents
    doc.addPage();
    yPos = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Table of Contents', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const sections = [
      '1. System Context Definition',
      '2. High-Level System Decomposition',
      '3. Microservices & Component Boundaries',
      '4. API Architecture & Communication',
      '5. Data Flow Architecture',
      '6. Database & Storage Design',
      '7. Deployment Architecture',
      '8. Integration Architecture',
      '9. Security Architecture',
      '10. High Availability & Failover',
      '11. Observability & Telemetry',
      '12. Workflow & Orchestration',
      '13. Data Processing & Analytics',
      '14. Evidence & Forensics',
      '15. Notification & Alerting',
      '16. UI/UX Architecture',
      '17. Mobile & Agent Framework',
      '18. Performance Engineering',
      '19. Disaster Recovery',
      '20. Architecture Governance'
    ];

    sections.forEach(section => {
      doc.text(section, 25, yPos);
      yPos += 6;
    });

    // Content sections
    const addSection = (title: string, content: string) => {
      checkPageBreak(30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(content || 'Not specified', 170);
      lines.forEach((line: string) => {
        checkPageBreak(7);
        doc.text(line, 20, yPos);
        yPos += 6;
      });
      yPos += 5;
    };

    doc.addPage();
    yPos = 20;

    addSection('1. System Context Definition', document.systemContext);
    addSection('System Boundaries', document.systemBoundaries);
    
    addSection('2. High-Level System Decomposition', 
      document.subsystems.map(s => `${s.name}: ${s.purpose}`).join('\n'));
    
    addSection('3. Microservices Architecture', 
      document.microservices.map(m => `${m.name} (${m.type}): ${m.purpose}`).join('\n'));
    
    addSection('4. API Architecture', document.apiCommunicationModel);
    addSection('Rate Limiting', document.rateLimiting);
    
    addSection('5. Data Flow Architecture', document.dataFlowDescription);
    addSection('Streaming Architecture', document.streamingArchitecture);
    
    addSection('6. Database & Storage Design', document.logicalSchema);
    addSection('Indexing Strategy', document.indexingStrategy);
    
    addSection('7. Deployment Architecture', document.deploymentModel);
    addSection('Autoscaling Rules', document.autoscalingRules);
    
    addSection('8. Integration Architecture', 
      document.integrations.map(i => `${i.system} (${i.method}): ${i.purpose}`).join('\n'));
    
    addSection('9. Security Architecture', document.authenticationMechanism);
    addSection('Authorization Model', document.authorizationModel);
    addSection('Secrets Management', document.secretsManagement);
    
    addSection('10. High Availability & Failover', document.haArchitecture);
    addSection('Failover Strategy', document.failoverStrategy);
    
    addSection('11. Observability & Telemetry', document.loggingStrategy);
    addSection('Metrics Collection', document.metricsCollection);
    
    addSection('12. Workflow & Orchestration', document.automatedWorkflows);
    addSection('Event Processing', document.eventProcessing);
    
    addSection('13. Data Processing & Analytics', document.dataIngestion);
    addSection('ML Integration', document.mlIntegration);
    
    addSection('14. Evidence & Forensics', document.evidenceCollection);
    addSection('Chain of Custody', document.chainOfCustody);
    
    addSection('15. Notification & Alerting', document.alertRouting);
    addSection('Alert Prioritization', document.alertPrioritization);
    
    addSection('16. UI/UX Architecture', document.uiComponentMapping);
    addSection('State Management', document.stateManagement);
    
    addSection('17. Mobile & Agent Framework', document.agentCommunication);
    addSection('Heartbeat Mechanism', document.heartbeatMechanism);
    
    addSection('18. Performance Engineering', document.scalingStrategy);
    addSection('Caching Strategy', document.cachingStrategy);
    
    addSection('19. Disaster Recovery', document.rtoRpoMapping);
    addSection('Backup Strategy', document.backupStrategy);
    
    addSection('20. Architecture Governance', 
      document.architectureDecisions.map(ad => `${ad.decision} (${ad.date}): ${ad.rationale}`).join('\n'));

    // Save PDF
    doc.save(`SA_${document.documentTitle.replace(/\s+/g, '_')}_v${document.documentVersion}.pdf`);
    toast.success('PDF exported successfully!');
  };

  const sections = [
    { id: 'header', label: 'Document Info', icon: FileText },
    { id: 'context', label: '1. System Context', icon: Network },
    { id: 'decomposition', label: '2. Decomposition', icon: Layers },
    { id: 'microservices', label: '3. Microservices', icon: Network },
    { id: 'api', label: '4. API Architecture', icon: Network },
    { id: 'dataflow', label: '5. Data Flow', icon: Database },
    { id: 'database', label: '6. Database Design', icon: Database },
    { id: 'deployment', label: '7. Deployment', icon: Layers },
    { id: 'integration', label: '8. Integration', icon: Network },
    { id: 'security', label: '9. Security', icon: Shield },
    { id: 'ha', label: '10. High Availability', icon: Network },
    { id: 'observability', label: '11. Observability', icon: FileText },
    { id: 'workflow', label: '12. Workflow', icon: Layers },
    { id: 'analytics', label: '13. Analytics', icon: Database },
    { id: 'forensics', label: '14. Forensics', icon: Shield },
    { id: 'notifications', label: '15. Notifications', icon: FileText },
    { id: 'ui', label: '16. UI/UX', icon: FileText },
    { id: 'mobile', label: '17. Mobile/Agent', icon: Network },
    { id: 'performance', label: '18. Performance', icon: Layers },
    { id: 'dr', label: '19. Disaster Recovery', icon: Shield },
    { id: 'governance', label: '20. Governance', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* AI Generation Banner */}
      {showAIPrompt && (
        <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border-2 border-indigo-300">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">✨ Generate with AI</h3>
              <p className="text-sm text-gray-700 mb-3">
                Enter the <strong>Document Title</strong> and <strong>System Context</strong> below, then click "Generate with AI" 
                to automatically fill all 20 sections with intelligent micro-level architecture details.
              </p>
              <button
                onClick={generateWithAI}
                disabled={isGenerating || !document.documentTitle || !document.systemContext}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Complete SA with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">SA Sections</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-white text-indigo-700 border-t-2 border-x border-indigo-500 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
            
            {/* Header Section */}
            {activeSection === 'header' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Document Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Title *</label>
                    <input
                      type="text"
                      value={document.documentTitle}
                      onChange={(e) => updateField('documentTitle', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., SIEM Platform Architecture"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input
                      type="text"
                      value={document.documentVersion}
                      onChange={(e) => updateField('documentVersion', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={document.documentDate}
                      onChange={(e) => updateField('documentDate', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Solution Architect</label>
                    <input
                      type="text"
                      value={document.architect}
                      onChange={(e) => updateField('architect', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reviewers</label>
                    <input
                      type="text"
                      value={document.reviewers}
                      onChange={(e) => updateField('reviewers', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Comma-separated names"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Approvers</label>
                    <input
                      type="text"
                      value={document.approvers}
                      onChange={(e) => updateField('approvers', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Comma-separated names"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 1. System Context */}
            {activeSection === 'context' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">1. System Context Definition</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Context Description *</label>
                  <textarea
                    value={document.systemContext}
                    onChange={(e) => updateField('systemContext', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg h-32"
                    placeholder="Describe the system context, external actors, and overall purpose"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">External Systems</label>
                  {document.externalSystems.map((system, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={system.name}
                        onChange={(e) => updateArrayItem('externalSystems', index, { ...system, name: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg"
                        placeholder="System name (e.g., Active Directory)"
                      />
                      <input
                        type="text"
                        value={system.type}
                        onChange={(e) => updateArrayItem('externalSystems', index, { ...system, type: e.target.value })}
                        className="w-32 px-3 py-2 border rounded-lg"
                        placeholder="Type"
                      />
                      <input
                        type="text"
                        value={system.interaction}
                        onChange={(e) => updateArrayItem('externalSystems', index, { ...system, interaction: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg"
                        placeholder="Interaction method"
                      />
                      <button
                        onClick={() => removeArrayItem('externalSystems', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('externalSystems', { name: '', type: '', interaction: '' })}
                    className="px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add External System
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Boundaries</label>
                  <textarea
                    value={document.systemBoundaries}
                    onChange={(e) => updateField('systemBoundaries', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg h-24"
                    placeholder="Define clear system boundaries and what's in/out of scope"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trust Zones</label>
                  {document.trustZones.map((zone, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={zone}
                        onChange={(e) => updateArrayItem('trustZones', index, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg"
                        placeholder="Trust zone (e.g., DMZ, Internal, External)"
                      />
                      <button
                        onClick={() => removeArrayItem('trustZones', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('trustZones')}
                    className="px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Trust Zone
                  </button>
                </div>
              </div>
            )}

            {/* Additional sections would continue here with similar patterns for all 20 sections */}
            {/* For brevity, showing structure for a few more key sections */}

            {/* 3. Microservices */}
            {activeSection === 'microservices' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">3. Microservices & Component Boundaries</h2>
                <p className="text-sm text-gray-600">Define each microservice with its type, purpose, and dependencies</p>
                
                {document.microservices.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateArrayItem('microservices', index, { ...service, name: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                        placeholder="Service name"
                      />
                      <select
                        value={service.type}
                        onChange={(e) => updateArrayItem('microservices', index, { ...service, type: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                      >
                        <option value="">Select type</option>
                        <option value="stateless">Stateless</option>
                        <option value="stateful">Stateful</option>
                      </select>
                    </div>
                    <textarea
                      value={service.purpose}
                      onChange={(e) => updateArrayItem('microservices', index, { ...service, purpose: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg mb-2"
                      placeholder="Purpose and responsibilities"
                      rows={2}
                    />
                    <input
                      type="text"
                      value={service.dependencies}
                      onChange={(e) => updateArrayItem('microservices', index, { ...service, dependencies: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg mb-2"
                      placeholder="Dependencies (comma-separated)"
                    />
                    <button
                      onClick={() => removeArrayItem('microservices', index)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('microservices', { name: '', type: '', purpose: '', dependencies: '' })}
                  className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Microservice
                </button>
              </div>
            )}

            {/* Placeholder sections for remaining content */}
            {['decomposition', 'api', 'dataflow', 'database', 'deployment', 'integration', 
              'security', 'ha', 'observability', 'workflow', 'analytics', 'forensics', 
              'notifications', 'ui', 'mobile', 'performance', 'dr', 'governance'].includes(activeSection) && 
              !['microservices'].includes(activeSection) && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                <p className="text-gray-600">
                  This section will be populated by AI generation. Click "Generate with AI" above after filling document title and system context.
                </p>
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    💡 <strong>Tip:</strong> Use the AI generation feature to automatically populate all 20 SA sections with comprehensive micro-level architecture details.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      {/* Footer Actions */}
      <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
        >
          Cancel
        </button>
        <div className="flex gap-3">
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Document
          </button>
        </div>
      </div>
    </div>
  );
}
