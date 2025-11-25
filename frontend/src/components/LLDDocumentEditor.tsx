import { useState } from 'react';
import { FileText, Download, Plus, Trash2, Image, Link as LinkIcon, Save, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

interface LLDSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface LLDDocument {
  // Header Information
  documentTitle: string;
  documentVersion: string;
  documentDate: string;
  author: string;
  reviewers: string;
  approvers: string;
  
  // Executive Summary
  executiveSummary: string;
  businessContext: string;
  objectives: string[];
  scope: string;
  
  // System Overview
  systemName: string;
  systemPurpose: string;
  systemBoundaries: string;
  
  // Architecture Details
  architecturalStyle: string;
  technologyStack: string[];
  components: Array<{
    name: string;
    description: string;
    technology: string;
    responsibilities: string;
  }>;
  
  // Data Design
  dataModels: string;
  databaseSchema: string;
  dataFlow: string;
  
  // Interface Design
  apiEndpoints: Array<{
    method: string;
    endpoint: string;
    description: string;
    request: string;
    response: string;
  }>;
  
  // Security Design
  authentication: string;
  authorization: string;
  dataEncryption: string;
  securityControls: string[];
  
  // Deployment Architecture
  deploymentModel: string;
  infrastructure: string;
  scalability: string;
  availability: string;
  
  // Performance Requirements
  responseTime: string;
  throughput: string;
  concurrency: string;
  
  // Error Handling
  errorHandlingStrategy: string;
  logging: string;
  monitoring: string;
  
  // Testing Strategy
  unitTesting: string;
  integrationTesting: string;
  performanceTesting: string;
  
  // Additional Sections
  customSections: LLDSection[];
  
  // References
  references: string[];
  glossary: string;
  appendix: string;
}

interface Props {
  onSave: (document: LLDDocument) => void;
  initialData?: Partial<LLDDocument>;
  onCancel: () => void;
}

const DEFAULT_LLD: LLDDocument = {
  documentTitle: '',
  documentVersion: '1.0',
  documentDate: new Date().toISOString().split('T')[0],
  author: '',
  reviewers: '',
  approvers: '',
  executiveSummary: '',
  businessContext: '',
  objectives: [''],
  scope: '',
  systemName: '',
  systemPurpose: '',
  systemBoundaries: '',
  architecturalStyle: '',
  technologyStack: [''],
  components: [],
  dataModels: '',
  databaseSchema: '',
  dataFlow: '',
  apiEndpoints: [],
  authentication: '',
  authorization: '',
  dataEncryption: '',
  securityControls: [''],
  deploymentModel: '',
  infrastructure: '',
  scalability: '',
  availability: '',
  responseTime: '',
  throughput: '',
  concurrency: '',
  errorHandlingStrategy: '',
  logging: '',
  monitoring: '',
  unitTesting: '',
  integrationTesting: '',
  performanceTesting: '',
  customSections: [],
  references: [''],
  glossary: '',
  appendix: ''
};

export default function LLDDocumentEditor({ onSave, initialData, onCancel }: Props) {
  const [document, setDocument] = useState<LLDDocument>({
    ...DEFAULT_LLD,
    ...initialData
  });

  const [activeSection, setActiveSection] = useState<string>('header');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(true);

  const updateField = (field: keyof LLDDocument, value: any) => {
    setDocument(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof LLDDocument) => {
    const current = document[field] as any[];
    updateField(field, [...current, '']);
  };

  const updateArrayItem = (field: keyof LLDDocument, index: number, value: string) => {
    const current = document[field] as any[];
    const updated = [...current];
    updated[index] = value;
    updateField(field, updated);
  };

  const removeArrayItem = (field: keyof LLDDocument, index: number) => {
    const current = document[field] as any[];
    updateField(field, current.filter((_, i) => i !== index));
  };

  const addComponent = () => {
    updateField('components', [
      ...document.components,
      { name: '', description: '', technology: '', responsibilities: '' }
    ]);
  };

  const updateComponent = (index: number, field: string, value: string) => {
    const updated = [...document.components];
    updated[index] = { ...updated[index], [field]: value };
    updateField('components', updated);
  };

  const addAPIEndpoint = () => {
    updateField('apiEndpoints', [
      ...document.apiEndpoints,
      { method: 'GET', endpoint: '', description: '', request: '', response: '' }
    ]);
  };

  const updateAPIEndpoint = (index: number, field: string, value: string) => {
    const updated = [...document.apiEndpoints];
    updated[index] = { ...updated[index], [field]: value };
    updateField('apiEndpoints', updated);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    let y = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const lineHeight = 7;
    const margin = 20;
    const maxWidth = 170;

    const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      if (y > pageHeight - 30) {
        pdf.addPage();
        y = 20;
      }
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > pageHeight - 30) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, margin, y);
        y += lineHeight;
      });
    };

    const addSection = (title: string, content: string) => {
      y += 5;
      addText(title, 14, true);
      y += 3;
      if (content) addText(content, 11, false);
      y += 5;
    };

    // Title Page
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(document.documentTitle || 'Low-Level Design Document', margin, 40);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Version: ${document.documentVersion}`, margin, 55);
    pdf.text(`Date: ${document.documentDate}`, margin, 62);
    pdf.text(`Author: ${document.author}`, margin, 69);
    
    pdf.addPage();
    y = 20;

    // Table of Contents
    addText('TABLE OF CONTENTS', 16, true);
    y += 5;
    const sections = [
      '1. Executive Summary',
      '2. System Overview',
      '3. Architecture Design',
      '4. Data Design',
      '5. Interface Design',
      '6. Security Design',
      '7. Deployment Architecture',
      '8. Performance Requirements',
      '9. Error Handling & Logging',
      '10. Testing Strategy',
      '11. References'
    ];
    sections.forEach(section => addText(section, 11, false));
    
    pdf.addPage();
    y = 20;

    // Document Sections
    if (document.executiveSummary) {
      addSection('1. EXECUTIVE SUMMARY', document.executiveSummary);
    }

    if (document.businessContext) {
      addSection('1.1 Business Context', document.businessContext);
    }

    if (document.objectives.length > 0 && document.objectives[0]) {
      addText('1.2 Objectives', 12, true);
      document.objectives.forEach((obj, i) => {
        if (obj) addText(`${i + 1}. ${obj}`, 11, false);
      });
      y += 5;
    }

    if (document.scope) {
      addSection('1.3 Scope', document.scope);
    }

    if (document.systemName || document.systemPurpose) {
      addSection('2. SYSTEM OVERVIEW', '');
      if (document.systemName) addText(`System Name: ${document.systemName}`, 11, false);
      if (document.systemPurpose) addText(`Purpose: ${document.systemPurpose}`, 11, false);
      if (document.systemBoundaries) addText(`Boundaries: ${document.systemBoundaries}`, 11, false);
    }

    if (document.architecturalStyle || document.technologyStack.length > 0) {
      addSection('3. ARCHITECTURE DESIGN', '');
      if (document.architecturalStyle) addText(`Architectural Style: ${document.architecturalStyle}`, 11, false);
      
      if (document.technologyStack.length > 0 && document.technologyStack[0]) {
        addText('Technology Stack:', 11, true);
        document.technologyStack.forEach(tech => {
          if (tech) addText(`• ${tech}`, 11, false);
        });
      }
    }

    if (document.components.length > 0) {
      addText('3.1 Components', 12, true);
      document.components.forEach((comp, i) => {
        if (comp.name) {
          y += 3;
          addText(`Component ${i + 1}: ${comp.name}`, 11, true);
          if (comp.description) addText(`Description: ${comp.description}`, 10, false);
          if (comp.technology) addText(`Technology: ${comp.technology}`, 10, false);
          if (comp.responsibilities) addText(`Responsibilities: ${comp.responsibilities}`, 10, false);
        }
      });
    }

    if (document.dataModels || document.databaseSchema) {
      addSection('4. DATA DESIGN', '');
      if (document.dataModels) addText(document.dataModels, 11, false);
      if (document.databaseSchema) {
        addText('Database Schema:', 11, true);
        addText(document.databaseSchema, 10, false);
      }
    }

    if (document.apiEndpoints.length > 0) {
      addSection('5. INTERFACE DESIGN', '');
      addText('API Endpoints:', 11, true);
      document.apiEndpoints.forEach((api, i) => {
        if (api.endpoint) {
          y += 3;
          addText(`${api.method} ${api.endpoint}`, 11, true);
          if (api.description) addText(api.description, 10, false);
          if (api.request) addText(`Request: ${api.request}`, 10, false);
          if (api.response) addText(`Response: ${api.response}`, 10, false);
        }
      });
    }

    if (document.authentication || document.authorization) {
      addSection('6. SECURITY DESIGN', '');
      if (document.authentication) addText(`Authentication: ${document.authentication}`, 11, false);
      if (document.authorization) addText(`Authorization: ${document.authorization}`, 11, false);
      if (document.dataEncryption) addText(`Encryption: ${document.dataEncryption}`, 11, false);
      
      if (document.securityControls.length > 0 && document.securityControls[0]) {
        addText('Security Controls:', 11, true);
        document.securityControls.forEach(control => {
          if (control) addText(`• ${control}`, 11, false);
        });
      }
    }

    if (document.deploymentModel) {
      addSection('7. DEPLOYMENT ARCHITECTURE', document.deploymentModel);
      if (document.infrastructure) addText(`Infrastructure: ${document.infrastructure}`, 11, false);
      if (document.scalability) addText(`Scalability: ${document.scalability}`, 11, false);
      if (document.availability) addText(`Availability: ${document.availability}`, 11, false);
    }

    if (document.responseTime || document.throughput) {
      addSection('8. PERFORMANCE REQUIREMENTS', '');
      if (document.responseTime) addText(`Response Time: ${document.responseTime}`, 11, false);
      if (document.throughput) addText(`Throughput: ${document.throughput}`, 11, false);
      if (document.concurrency) addText(`Concurrency: ${document.concurrency}`, 11, false);
    }

    if (document.errorHandlingStrategy || document.logging) {
      addSection('9. ERROR HANDLING & LOGGING', '');
      if (document.errorHandlingStrategy) addText(document.errorHandlingStrategy, 11, false);
      if (document.logging) addText(`Logging: ${document.logging}`, 11, false);
      if (document.monitoring) addText(`Monitoring: ${document.monitoring}`, 11, false);
    }

    if (document.unitTesting || document.integrationTesting) {
      addSection('10. TESTING STRATEGY', '');
      if (document.unitTesting) addText(`Unit Testing: ${document.unitTesting}`, 11, false);
      if (document.integrationTesting) addText(`Integration Testing: ${document.integrationTesting}`, 11, false);
      if (document.performanceTesting) addText(`Performance Testing: ${document.performanceTesting}`, 11, false);
    }

    if (document.references.length > 0 && document.references[0]) {
      addSection('11. REFERENCES', '');
      document.references.forEach((ref, i) => {
        if (ref) addText(`[${i + 1}] ${ref}`, 11, false);
      });
    }

    // Save PDF
    const filename = `LLD_${document.documentTitle.replace(/\s+/g, '_')}_v${document.documentVersion}.pdf`;
    pdf.save(filename);
    toast.success('PDF exported successfully!');
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
    if (!document.systemPurpose) {
      toast.error('Please enter a system purpose/description first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_URL}/repository/artifacts/generate-lld`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: document.documentTitle,
          description: document.systemPurpose,
          systemType: detectSystemType(document.systemPurpose),
          technologiesUsed: document.technologyStack.filter(t => t.trim())
        })
      });

      if (!response.ok) throw new Error('Failed to generate LLD');

      const generatedLLD = await response.json();
      setDocument(prev => ({
        ...prev,
        ...generatedLLD
      }));
      setShowAIPrompt(false);
      toast.success('✨ LLD document generated with AI! You can now edit any section.');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate LLD document');
    } finally {
      setIsGenerating(false);
    }
  };

  const detectSystemType = (description: string): string => {
    const lower = description.toLowerCase();
    if (lower.includes('web') || lower.includes('website')) return 'web';
    if (lower.includes('mobile') || lower.includes('app')) return 'mobile';
    if (lower.includes('api') || lower.includes('service')) return 'api';
    if (lower.includes('data') || lower.includes('analytics')) return 'data';
    if (lower.includes('iot') || lower.includes('device')) return 'iot';
    return 'web';
  };

  const sections = [
    { id: 'header', label: 'Document Info', icon: FileText },
    { id: 'summary', label: 'Executive Summary', icon: FileText },
    { id: 'system', label: 'System Overview', icon: FileText },
    { id: 'architecture', label: 'Architecture', icon: FileText },
    { id: 'data', label: 'Data Design', icon: FileText },
    { id: 'interface', label: 'Interfaces', icon: LinkIcon },
    { id: 'security', label: 'Security', icon: FileText },
    { id: 'deployment', label: 'Deployment', icon: FileText },
    { id: 'performance', label: 'Performance', icon: FileText },
    { id: 'testing', label: 'Testing', icon: FileText },
    { id: 'references', label: 'References', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* AI Generation Banner */}
      {showAIPrompt && (
        <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">✨ Generate with AI</h3>
              <p className="text-sm text-gray-700 mb-3">
                Enter the <strong>Document Title</strong> and <strong>System Purpose</strong> below, then click "Generate with AI" 
                to automatically fill all sections with intelligent suggestions that you can customize.
              </p>
              <button
                onClick={generateWithAI}
                disabled={isGenerating || !document.documentTitle || !document.systemPurpose}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Complete LLD with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Document Sections</h3>
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
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header Section */}
          {activeSection === 'header' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Document Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Title *</label>
                  <input
                    type="text"
                    value={document.documentTitle}
                    onChange={(e) => updateField('documentTitle', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Microservices Architecture LLD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                  <input
                    type="text"
                    value={document.documentVersion}
                    onChange={(e) => updateField('documentVersion', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={document.documentDate}
                    onChange={(e) => updateField('documentDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    value={document.author}
                    onChange={(e) => updateField('author', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Author name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reviewers</label>
                  <input
                    type="text"
                    value={document.reviewers}
                    onChange={(e) => updateField('reviewers', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Comma-separated names"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Approvers</label>
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

          {/* Executive Summary Section */}
          {activeSection === 'summary' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Executive Summary</label>
                <textarea
                  value={document.executiveSummary}
                  onChange={(e) => updateField('executiveSummary', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-32"
                  placeholder="High-level overview of the system design..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Context</label>
                <textarea
                  value={document.businessContext}
                  onChange={(e) => updateField('businessContext', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                  placeholder="Business problem and context..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objectives</label>
                {document.objectives.map((obj, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => updateArrayItem('objectives', index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder={`Objective ${index + 1}`}
                    />
                    <button
                      onClick={() => removeArrayItem('objectives', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('objectives')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Objective
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
                <textarea
                  value={document.scope}
                  onChange={(e) => updateField('scope', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                  placeholder="What's in scope and out of scope..."
                />
              </div>
            </div>
          )}

          {/* System Overview Section */}
          {activeSection === 'system' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                <input
                  type="text"
                  value={document.systemName}
                  onChange={(e) => updateField('systemName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">System Purpose</label>
                <textarea
                  value={document.systemPurpose}
                  onChange={(e) => updateField('systemPurpose', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">System Boundaries</label>
                <textarea
                  value={document.systemBoundaries}
                  onChange={(e) => updateField('systemBoundaries', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                  placeholder="What the system includes and excludes..."
                />
              </div>
            </div>
          )}

          {/* Architecture Section */}
          {activeSection === 'architecture' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Architecture Design</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Architectural Style</label>
                <input
                  type="text"
                  value={document.architecturalStyle}
                  onChange={(e) => updateField('architecturalStyle', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Microservices, Layered, Event-Driven"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technology Stack</label>
                {document.technologyStack.map((tech, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => updateArrayItem('technologyStack', index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="e.g., React, Node.js, PostgreSQL"
                    />
                    <button
                      onClick={() => removeArrayItem('technologyStack', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('technologyStack')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Technology
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Components</label>
                {document.components.map((comp, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Component {index + 1}</h4>
                      <button
                        onClick={() => {
                          const updated = document.components.filter((_, i) => i !== index);
                          updateField('components', updated);
                        }}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => updateComponent(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Component name"
                      />
                      <textarea
                        value={comp.description}
                        onChange={(e) => updateComponent(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg h-20"
                        placeholder="Description"
                      />
                      <input
                        type="text"
                        value={comp.technology}
                        onChange={(e) => updateComponent(index, 'technology', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Technology"
                      />
                      <textarea
                        value={comp.responsibilities}
                        onChange={(e) => updateComponent(index, 'responsibilities', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg h-20"
                        placeholder="Responsibilities"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addComponent}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Component
                </button>
              </div>
            </div>
          )}

          {/* Data Design */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Data Design</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Models</label>
                <textarea
                  value={document.dataModels}
                  onChange={(e) => updateField('dataModels', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-32"
                  placeholder="Describe data models and entities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Database Schema</label>
                <textarea
                  value={document.databaseSchema}
                  onChange={(e) => updateField('databaseSchema', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-48 font-mono text-sm"
                  placeholder="CREATE TABLE users (&#10;  id UUID PRIMARY KEY,&#10;  name VARCHAR(255),&#10;  ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Flow</label>
                <textarea
                  value={document.dataFlow}
                  onChange={(e) => updateField('dataFlow', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                  placeholder="Describe how data flows through the system..."
                />
              </div>
            </div>
          )}

          {/* Interface Design */}
          {activeSection === 'interface' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Interface Design</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">API Endpoints</label>
                {document.apiEndpoints.map((api, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Endpoint {index + 1}</h4>
                      <button
                        onClick={() => {
                          const updated = document.apiEndpoints.filter((_, i) => i !== index);
                          updateField('apiEndpoints', updated);
                        }}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <select
                          value={api.method}
                          onChange={(e) => updateAPIEndpoint(index, 'method', e.target.value)}
                          className="px-3 py-2 border rounded-lg"
                        >
                          <option>GET</option>
                          <option>POST</option>
                          <option>PUT</option>
                          <option>DELETE</option>
                          <option>PATCH</option>
                        </select>
                        <input
                          type="text"
                          value={api.endpoint}
                          onChange={(e) => updateAPIEndpoint(index, 'endpoint', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm"
                          placeholder="/api/users/{id}"
                        />
                      </div>
                      <textarea
                        value={api.description}
                        onChange={(e) => updateAPIEndpoint(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg h-16"
                        placeholder="Endpoint description"
                      />
                      <textarea
                        value={api.request}
                        onChange={(e) => updateAPIEndpoint(index, 'request', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg h-20 font-mono text-sm"
                        placeholder="Request body/parameters"
                      />
                      <textarea
                        value={api.response}
                        onChange={(e) => updateAPIEndpoint(index, 'response', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg h-20 font-mono text-sm"
                        placeholder="Response format"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addAPIEndpoint}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add API Endpoint
                </button>
              </div>
            </div>
          )}

          {/* Security, Deployment, Performance, Testing sections similar structure... */}
          {/* I'll add the remaining sections in the same pattern */}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Security Design</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Authentication</label>
                <textarea
                  value={document.authentication}
                  onChange={(e) => updateField('authentication', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                  placeholder="JWT, OAuth2, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Authorization</label>
                <textarea
                  value={document.authorization}
                  onChange={(e) => updateField('authorization', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                  placeholder="RBAC, ABAC, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Encryption</label>
                <textarea
                  value={document.dataEncryption}
                  onChange={(e) => updateField('dataEncryption', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                />
              </div>
            </div>
          )}

          {activeSection === 'deployment' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Deployment Architecture</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deployment Model</label>
                <textarea
                  value={document.deploymentModel}
                  onChange={(e) => updateField('deploymentModel', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-32"
                  placeholder="Kubernetes, Docker, Cloud services..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Infrastructure</label>
                <textarea
                  value={document.infrastructure}
                  onChange={(e) => updateField('infrastructure', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                />
              </div>
            </div>
          )}

          {activeSection === 'performance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Performance Requirements</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Time</label>
                <input
                  type="text"
                  value={document.responseTime}
                  onChange={(e) => updateField('responseTime', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., < 200ms for 95th percentile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Throughput</label>
                <input
                  type="text"
                  value={document.throughput}
                  onChange={(e) => updateField('throughput', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., 10,000 requests/second"
                />
              </div>
            </div>
          )}

          {activeSection === 'testing' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Testing Strategy</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Testing</label>
                <textarea
                  value={document.unitTesting}
                  onChange={(e) => updateField('unitTesting', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Integration Testing</label>
                <textarea
                  value={document.integrationTesting}
                  onChange={(e) => updateField('integrationTesting', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                />
              </div>
            </div>
          )}

          {activeSection === 'references' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">References & Glossary</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">References</label>
                {document.references.map((ref, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={ref}
                      onChange={(e) => updateArrayItem('references', index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="Reference link or document"
                    />
                    <button
                      onClick={() => removeArrayItem('references', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('references')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Reference
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Glossary</label>
                <textarea
                  value={document.glossary}
                  onChange={(e) => updateField('glossary', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-32"
                  placeholder="Define technical terms and acronyms..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer with Actions */}
      <div className="fixed bottom-0 right-0 left-64 bg-white border-t p-4 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Document
        </button>
      </div>
    </div>
  );
}
