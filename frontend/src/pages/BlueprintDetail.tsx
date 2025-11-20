import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Cloud, 
  Server, 
  DollarSign, 
  Calendar, 
  User, 
  Code, 
  Download,
  Play,
  AlertTriangle,
  ArrowLeft,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, Table, TableCell, TableRow, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { blueprintService } from '../services/blueprintService';
import Button from '../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import type { Blueprint } from '../types';
import toast from 'react-hot-toast';
import { exportTemplates, defaultTemplate, type ExportTemplate } from '../config/exportTemplates';

export default function BlueprintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(defaultTemplate);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word'>('pdf');

  useEffect(() => {
    if (id) {
      loadBlueprint(id);
    }
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExportMenu && !target.closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const toggleResourceExpansion = (resourceId: string) => {
    setExpandedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  const loadBlueprint = async (blueprintId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await blueprintService.getById(blueprintId);
      setBlueprint(data);
    } catch (err) {
      console.warn('Failed to load blueprint from API, checking localStorage');
      
      // Try to load from localStorage first
      const storageKey = `blueprint_${blueprintId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const parsedBlueprint = JSON.parse(savedData);
          setBlueprint(parsedBlueprint);
          toast.success('✓ Loaded from local storage');
          setLoading(false);
          return;
        } catch (parseError) {
          console.error('Failed to parse localStorage data:', parseError);
        }
      }
      
      // Fallback to mock blueprint data
      const mockBlueprint: Blueprint = {
        id: blueprintId,
        name: 'Sample Infrastructure Blueprint',
        description: 'A sample blueprint for demonstration purposes with web application infrastructure',
        version: '1.0.0',
        targetCloud: 'aws',
        environment: 'production',
        resources: [
          {
            id: '1',
            type: 'vpc',
            name: 'main-vpc',
            quantity: 1,
            properties: {
              cidr: '10.0.0.0/16',
              enableDnsHostnames: true,
              enableDnsSupport: true,
            },
            reasoning: 'Virtual Private Cloud to isolate and secure the infrastructure',
            confidence: 0.95,
            estimatedCost: 0,
          },
          {
            id: '2',
            type: 'subnet',
            name: 'public-subnet',
            quantity: 2,
            properties: {
              cidr: '10.0.1.0/24',
              availabilityZone: 'us-east-1a',
              mapPublicIpOnLaunch: true,
            },
            reasoning: 'Public subnets across multiple availability zones for high availability',
            confidence: 0.92,
            estimatedCost: 0,
          },
          {
            id: '3',
            type: 'security-group',
            name: 'web-sg',
            sku: 'sg-web-001',
            quantity: 1,
            properties: {
              description: 'Security group for web servers',
              ingress: [
                { port: 80, protocol: 'tcp', cidr: '0.0.0.0/0' },
                { port: 443, protocol: 'tcp', cidr: '0.0.0.0/0' },
              ],
              egress: [
                { port: 0, protocol: '-1', cidr: '0.0.0.0/0' },
              ],
            },
            reasoning: 'Allows HTTP/HTTPS traffic from internet while restricting other access',
            confidence: 0.88,
            estimatedCost: 0,
          },
          {
            id: '4',
            type: 'load-balancer',
            name: 'app-lb',
            sku: 'alb-standard',
            quantity: 1,
            properties: {
              type: 'application',
              scheme: 'internet-facing',
              listeners: [
                { port: 80, protocol: 'HTTP' },
                { port: 443, protocol: 'HTTPS' },
              ],
            },
            reasoning: 'Application Load Balancer for distributing traffic across multiple instances',
            confidence: 0.90,
            estimatedCost: 22.50,
          },
          {
            id: '5',
            type: 'ec2-instance',
            name: 'web-server',
            sku: 't3.medium',
            quantity: 2,
            properties: {
              instanceType: 't3.medium',
              ami: 'ami-0c55b159cbfafe1f0',
              storage: '30GB',
              monitoring: true,
            },
            reasoning: 'Web application servers with balanced compute and memory',
            confidence: 0.85,
            estimatedCost: 60.74,
          },
          {
            id: '6',
            type: 'rds-database',
            name: 'primary-db',
            sku: 'db.t3.medium',
            quantity: 1,
            properties: {
              engine: 'postgresql',
              engineVersion: '14.5',
              instanceClass: 'db.t3.medium',
              allocatedStorage: 100,
              multiAz: true,
              backupRetention: 7,
            },
            reasoning: 'PostgreSQL database with Multi-AZ for high availability and automatic backups',
            confidence: 0.93,
            estimatedCost: 145.60,
          },
          {
            id: '7',
            type: 's3-bucket',
            name: 'static-assets',
            sku: 's3-standard',
            quantity: 1,
            properties: {
              storageClass: 'STANDARD',
              versioning: true,
              encryption: 'AES256',
            },
            reasoning: 'S3 bucket for storing static assets and backups',
            confidence: 0.87,
            estimatedCost: 23.00,
          },
        ],
        metadata: {
          tags: {
            Project: 'Dharma-IAC',
            Environment: 'Production',
            ManagedBy: 'Dharma',
          },
          estimatedSetupTime: '30-45 minutes',
          complexity: 'medium',
        },
        createdBy: 'demo@example.com',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      };
      
      setBlueprint(mockBlueprint);
      toast.success('Loaded sample blueprint data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this blueprint?')) return;
    
    try {
      await blueprintService.delete(id);
      toast.success('Blueprint deleted successfully');
      navigate('/blueprints');
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete blueprint');
    }
  };

  const handleDeploy = () => {
    if (blueprint) {
      navigate('/iac', { state: { blueprint } });
    }
  };

  const handleExportPDF = () => {
    if (!blueprint) return;

    try {
      const template = exportTemplates[selectedTemplate];
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPos = 20;

      // Convert hex color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 59, g: 130, b: 246 };
      };

      const headerColor = hexToRgb(template.headerColor);
      const headerTextColor = hexToRgb(template.headerTextColor);

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPos + requiredHeight > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
          return true;
        }
        return false;
      };

      // Helper function to add text with wrapping
      const addText = (text: string, fontSize: number, isBold = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          checkPageBreak(fontSize / 2);
          pdf.text(line, margin, yPos);
          yPos += fontSize / 2;
        });
      };

      // Title Section
      if (template.includeTitle) {
        pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        pdf.setTextColor(headerTextColor.r, headerTextColor.g, headerTextColor.b);
        pdf.setFontSize(template.fontSize.title);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Infrastructure Blueprint', pageWidth / 2, 15, { align: 'center' });
        pdf.setFontSize(template.fontSize.heading);
        pdf.text(blueprint.name, pageWidth / 2, 28, { align: 'center' });
        
        yPos = 50;
        pdf.setTextColor(0, 0, 0);
      }

      // Company Info (if included in template)
      if (template.includeLogo && template.companyInfo) {
        checkPageBreak(30);
        pdf.setFontSize(template.fontSize.heading);
        pdf.setFont('helvetica', 'bold');
        pdf.text(template.companyInfo.name, margin, yPos);
        yPos += 6;
        
        if (template.companyInfo.tagline) {
          pdf.setFontSize(template.fontSize.small);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(100, 100, 100);
          pdf.text(template.companyInfo.tagline, margin, yPos);
          yPos += 5;
        }
        
        if (template.companyInfo.website || template.companyInfo.email) {
          pdf.setFontSize(template.fontSize.small);
          pdf.setFont('helvetica', 'normal');
          const contactInfo = [template.companyInfo.website, template.companyInfo.email].filter(Boolean).join(' | ');
          pdf.text(contactInfo, margin, yPos);
          yPos += template.spacing.section;
        }
        
        pdf.setTextColor(0, 0, 0);
      }

      // Basic Information Section
      if (template.includeBasicInfo) {
        addText('Basic Information', template.fontSize.heading, true);
        yPos += 3;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += template.spacing.paragraph;

        addText(`Description: ${blueprint.description}`, template.fontSize.body);
        addText(`Version: ${blueprint.version}`, template.fontSize.body);
        addText(`Cloud Provider: ${blueprint.targetCloud.toUpperCase()}`, template.fontSize.body);
        addText(`Environment: ${blueprint.environment.charAt(0).toUpperCase() + blueprint.environment.slice(1)}`, template.fontSize.body);
        addText(`Created By: ${blueprint.createdBy}`, template.fontSize.body);
        addText(`Created: ${new Date(blueprint.createdAt).toLocaleDateString()}`, template.fontSize.body);
        addText(`Last Updated: ${new Date(blueprint.updatedAt).toLocaleDateString()}`, template.fontSize.body);
        yPos += template.spacing.section;
      }

      // Cost Summary Section
      if (template.includeCostSummary) {
        checkPageBreak(30);
        addText('Cost Summary', template.fontSize.heading, true);
        yPos += 3;
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += template.spacing.paragraph;

        pdf.setFillColor(239, 246, 255);
        pdf.rect(margin, yPos, maxWidth, 15, 'F');
        pdf.setFontSize(template.fontSize.heading - 2);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Total Estimated Monthly Cost: $${totalCost.toFixed(2)}`, margin + 5, yPos + 10);
        yPos += 20 + template.spacing.section;
      }

      // Resources Section
      if (template.includeResources) {
        checkPageBreak(30);
        addText(`Infrastructure Resources (${blueprint.resources.length})`, template.fontSize.heading, true);
        yPos += 3;
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += template.spacing.paragraph + 2;

        blueprint.resources.forEach((resource, index) => {
          checkPageBreak(50);

          // Resource header with background
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin, yPos, maxWidth, 8, 'F');
          pdf.setFontSize(template.fontSize.body + 1);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`[${index + 1}] ${resource.name}`, margin + 3, yPos + 6);
          yPos += 12;

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(template.fontSize.body);
          
          addText(`  Type: ${resource.type}`, template.fontSize.body);
          if (resource.sku) addText(`  SKU: ${resource.sku}`, template.fontSize.body);
          if (resource.quantity) addText(`  Quantity: ${resource.quantity}`, template.fontSize.body);
          if (resource.confidence) addText(`  Confidence: ${(resource.confidence * 100).toFixed(0)}%`, template.fontSize.body);
          if (resource.estimatedCost !== undefined) {
            addText(`  Estimated Cost: $${resource.estimatedCost.toFixed(2)}/month`, template.fontSize.body);
          }
          
          if (template.includeReasoning && resource.reasoning) {
            addText(`  💡 ${resource.reasoning}`, template.fontSize.body);
          }

          // Properties
          if (template.includeProperties && resource.properties) {
            const props = Object.entries(resource.properties).slice(0, 5);
            if (props.length > 0) {
              addText(`  Properties:`, template.fontSize.body, true);
              props.forEach(([key, value]) => {
                addText(`    • ${key}: ${value}`, template.fontSize.small);
              });
            }
          }

          yPos += template.spacing.paragraph;
        });
      }

      // Footer
      if (template.includeFooter) {
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(template.fontSize.small);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(128, 128, 128);
          pdf.text(
            `Generated by Dharma IAC Platform - ${new Date().toLocaleDateString()}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
          pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        }
      }

      // Save PDF
      const templateName = template.name.replace(/\s+/g, '-').toLowerCase();
      const fileName = `blueprint-${blueprint.name.replace(/\s+/g, '-').toLowerCase()}-${templateName}-${Date.now()}.pdf`;
      pdf.save(fileName);
      
      toast.success(`Blueprint exported as PDF (${template.name} template)`);
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export blueprint as PDF');
    }
  };

  const handleExportWord = async () => {
    if (!blueprint) return;

    try {
      const { name, description, targetCloud, environment, status, createdAt, resources } = blueprint;
      
      // Calculate total cost
      const totalCost = resources.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);

      // Create document sections
      const children = [];

      // Title
      children.push(
        new Paragraph({
          text: 'Infrastructure Blueprint',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // Blueprint name
      children.push(
        new Paragraph({
          text: name,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // Basic Information Section
      children.push(
        new Paragraph({
          text: 'Basic Information',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const basicInfo = [
        ['Cloud Provider:', targetCloud.toUpperCase()],
        ['Environment:', environment],
        ['Status:', status],
        ['Created:', new Date(createdAt).toLocaleDateString()],
        ['Total Resources:', resources.length.toString()],
        ['Description:', description || 'N/A']
      ];

      basicInfo.forEach(([label, value]) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: label, bold: true }),
              new TextRun({ text: ` ${value}` })
            ],
            spacing: { after: 100 }
          })
        );
      });

      // Cost Summary Section
      children.push(
        new Paragraph({
          text: 'Cost Summary',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Estimated Monthly Cost: ', bold: true }),
            new TextRun({ text: `$${totalCost.toFixed(2)}`, bold: true, color: '2563EB' })
          ],
          spacing: { after: 400 }
        })
      );

      // Resources Section
      children.push(
        new Paragraph({
          text: 'Resources',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      resources.forEach((resource, index) => {
        // Resource heading
        children.push(
          new Paragraph({
            text: `${index + 1}. ${resource.name}`,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 300, after: 150 }
          })
        );

        // Resource details
        const details = [
          ['Type:', resource.type],
          ...(resource.sku ? [['SKU:', resource.sku]] : []),
          ...(resource.quantity ? [['Quantity:', resource.quantity.toString()]] : []),
          ...(resource.confidence ? [['Confidence:', `${(resource.confidence * 100).toFixed(0)}%`]] : []),
          ...(resource.estimatedCost !== undefined ? [['Cost:', `$${resource.estimatedCost.toFixed(2)}/month`]] : [])
        ];

        details.forEach(([label, value]) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `  ${label} `, bold: true }),
                new TextRun({ text: value })
              ],
              spacing: { after: 80 }
            })
          );
        });

        // Reasoning
        if (resource.reasoning) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: '  💡 Reasoning: ', bold: true }),
                new TextRun({ text: resource.reasoning, italics: true })
              ],
              spacing: { after: 200 }
            })
          );
        }

        // Properties table if available
        if (resource.properties && Object.keys(resource.properties).length > 0) {
          children.push(
            new Paragraph({
              text: '  Properties:',
              bold: true,
              spacing: { before: 100, after: 100 }
            })
          );

          Object.entries(resource.properties).forEach(([key, value]) => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `    • ${key}: ` }),
                  new TextRun({ text: String(value), color: '6B7280' })
                ],
                spacing: { after: 80 }
              })
            );
          });
        }
      });

      // Footer
      children.push(
        new Paragraph({
          text: `Generated by Dharma IAC Platform - ${new Date().toLocaleDateString()}`,
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
          }
        })
      );

      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: children
        }]
      });

      // Generate and save
      const blob = await Packer.toBlob(doc);
      const fileName = `blueprint-${blueprint.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.docx`;
      saveAs(blob, fileName);

      toast.success('Blueprint exported as Word document successfully');
    } catch (error) {
      console.error('Word export failed:', error);
      toast.error('Failed to export blueprint as Word document');
    }
  };

  const totalCost = blueprint?.resources.reduce((sum, r) => sum + (r.estimatedCost || 0), 0) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="space-y-6">
        <Button onClick={() => navigate('/blueprints')} className="btn-secondary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blueprints
        </Button>
        <div className="card bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800">
          <div className="flex items-center gap-2 text-danger-700 dark:text-danger-400">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-medium">{error || 'Blueprint not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{blueprint.name}</h1>
              <span className="badge badge-gray">v{blueprint.version}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{blueprint.description}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {blueprint.createdBy}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(blueprint.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/blueprints')} className="btn-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleDeploy} className="btn-primary">
            <Play className="h-4 w-4 mr-2" />
            Deploy
          </Button>
          <Button onClick={() => navigate(`/blueprints/${id}/edit`)} className="btn-secondary">
            <Edit className="h-4 w-4" />
          </Button>
          <Button onClick={handleDelete} className="btn-danger">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cloud Provider</p>
              <p className="font-semibold text-gray-900 dark:text-white uppercase">{blueprint.targetCloud}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Server className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Environment</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">{blueprint.environment}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resources</p>
              <p className="font-semibold text-gray-900 dark:text-white">{blueprint.resources.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Est. Monthly Cost</p>
              <p className="font-semibold text-gray-900 dark:text-white">${totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="resources" className="w-full">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Infrastructure Resources ({blueprint.resources.length})
              </h2>
              <div className="relative">
                <Button 
                  onClick={() => setShowExportMenu(!showExportMenu)} 
                  className="btn-secondary btn-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Export Document</h3>
                    </div>
                    
                    {/* Template Selection */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Select Template
                      </label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {Object.entries(exportTemplates).map(([key, template]) => (
                          <option key={key} value={key}>
                            {template.name} - {template.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Format Selection */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setExportFormat('pdf');
                          handleExportPDF();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </button>
                      <button
                        onClick={() => {
                          setExportFormat('word');
                          handleExportWord();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export as Word
                      </button>
                    </div>

                    {/* Template Preview */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Includes:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {exportTemplates[selectedTemplate].includeBasicInfo && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">Basic Info</span>
                          )}
                          {exportTemplates[selectedTemplate].includeCostSummary && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">Costs</span>
                          )}
                          {exportTemplates[selectedTemplate].includeProperties && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">Properties</span>
                          )}
                          {exportTemplates[selectedTemplate].includeReasoning && (
                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs">Reasoning</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">{blueprint.resources.map((resource, index) => {
                const resourceId = resource.id || `resource-${index}`;
                const isExpanded = expandedResources.has(resourceId);
                
                return (
                  <div 
                    key={resourceId} 
                    className="card bg-white dark:bg-gray-800 border dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                    onDoubleClick={() => toggleResourceExpansion(resourceId)}
                    title="Double-click to expand details"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded">
                            <Server className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{resource.name}</h3>
                              {resource.quantity && resource.quantity > 1 && (
                                <span className="badge badge-primary">x{resource.quantity}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{resource.type}</p>
                          </div>
                          <div className="text-gray-400 dark:text-gray-500">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                        </div>

                        {resource.sku && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">SKU: {resource.sku}</p>
                        )}

                        {resource.reasoning && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-900 dark:text-blue-300 italic">
                              💡 {resource.reasoning}
                            </p>
                          </div>
                        )}

                        {isExpanded && resource.properties && Object.keys(resource.properties).length > 0 && (
                          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="border-t dark:border-gray-700 pt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Code className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  Configuration Properties ({Object.keys(resource.properties).length})
                                </h4>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border dark:border-gray-700">
                                <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(resource.properties, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        {resource.confidence && (
                          <div className="mb-2">
                            <span className={`badge ${resource.confidence >= 0.8 ? 'badge-success' : resource.confidence >= 0.6 ? 'badge-warning' : 'badge-danger'}`}>
                              {(resource.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        )}
                        {resource.estimatedCost !== undefined && (
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ${resource.estimatedCost.toFixed(2)}/mo
                          </div>
                        )}
                      </div>
                    </div>
                    {!isExpanded && (
                      <div className="mt-3 pt-3 border-t dark:border-gray-700 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          💡 Double-click to view detailed configuration
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cost Summary */}
            <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-300">Total Estimated Cost</h3>
                  <p className="text-sm text-primary-700 dark:text-primary-400">Monthly infrastructure cost estimate</p>
                </div>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  ${totalCost.toFixed(2)}/mo
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="configuration">
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Blueprint Configuration</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Blueprint ID</label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm mt-1">{blueprint.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Version</label>
                  <p className="text-gray-900 dark:text-white mt-1">{blueprint.version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cloud Provider</label>
                  <p className="text-gray-900 dark:text-white mt-1 uppercase">{blueprint.targetCloud}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Environment</label>
                  <p className="text-gray-900 dark:text-white mt-1 capitalize">{blueprint.environment}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created By</label>
                  <p className="text-gray-900 dark:text-white mt-1">{blueprint.createdBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {new Date(blueprint.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {new Date(blueprint.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resource Count</label>
                  <p className="text-gray-900 dark:text-white mt-1">{blueprint.resources.length}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metadata">
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Additional Metadata</h2>
            {blueprint.metadata && Object.keys(blueprint.metadata).length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border dark:border-gray-700">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                  {JSON.stringify(blueprint.metadata, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No additional metadata available</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={handleDeploy} className="btn-primary justify-start">
            <Play className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Deploy Infrastructure</div>
              <div className="text-xs opacity-80">Generate IaC and deploy</div>
            </div>
          </Button>
          <Button onClick={() => navigate(`/risk-assessment?blueprintId=${id}`)} className="btn-secondary justify-start">
            <AlertTriangle className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Risk Assessment</div>
              <div className="text-xs opacity-80">Analyze potential risks</div>
            </div>
          </Button>
          <Button onClick={() => navigate(`/cost-analysis?blueprintId=${id}`)} className="btn-secondary justify-start">
            <DollarSign className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Cost Analysis</div>
              <div className="text-xs opacity-80">Detailed cost breakdown</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
