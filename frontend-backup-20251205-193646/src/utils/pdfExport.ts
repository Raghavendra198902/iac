import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  target_date: string;
  completion_percentage: number;
  created_at: string;
  created_by: string;
}

interface WorkflowStep {
  id: number;
  step_name: string;
  status: string;
  assigned_to: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  estimated_hours: number;
  actual_hours: number | null;
}

interface Asset {
  id: number;
  asset_name: string;
  asset_type: string;
  environment: string;
  status: string;
  link_type: string;
}

interface ExportData {
  project: Project;
  steps: WorkflowStep[];
  assets: Asset[];
}

/**
 * Generate a professional PDF report for a project workflow
 */
export const generateProjectPDF = (data: ExportData): void => {
  const { project, steps, assets } = data;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `${project.name} - Workflow Report`,
    subject: 'Project Workflow Status Report',
    author: 'IAC Platform',
    keywords: 'workflow, project, report',
    creator: 'IAC Platform'
  });

  let yPosition = 20;

  // === HEADER ===
  doc.setFontSize(22);
  doc.setTextColor(31, 41, 55); // gray-800
  doc.text('Project Workflow Report', 105, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, yPosition, { align: 'center' });
  
  yPosition += 15;

  // === PROJECT DETAILS ===
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Project Overview', 14, yPosition);
  yPosition += 8;

  // Project info table
  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: [
      ['Project Name', project.name],
      ['Description', project.description || 'N/A'],
      ['Status', project.status],
      ['Priority', project.priority],
      ['Progress', `${project.completion_percentage}%`],
      ['Start Date', new Date(project.start_date).toLocaleDateString()],
      ['Target Date', new Date(project.target_date).toLocaleDateString()],
      ['Created By', project.created_by],
      ['Created At', new Date(project.created_at).toLocaleDateString()],
    ],
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // === WORKFLOW STEPS ===
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Workflow Steps', 14, yPosition);
  yPosition += 8;

  // Steps table
  const stepsData = steps.map((step) => {
    const duration = step.completed_at && step.started_at
      ? calculateDuration(step.started_at, step.completed_at)
      : 'N/A';
    
    return [
      step.step_name,
      getStatusBadge(step.status),
      step.assigned_to || 'Unassigned',
      step.started_at ? new Date(step.started_at).toLocaleDateString() : 'Not started',
      step.completed_at ? new Date(step.completed_at).toLocaleDateString() : 'In progress',
      duration,
      step.notes || 'No notes',
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Step', 'Status', 'Assigned To', 'Started', 'Completed', 'Duration', 'Notes']],
    body: stepsData,
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 20 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 },
      6: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      // Color-code status column
      if (data.column.index === 1 && data.section === 'body') {
        const status = steps[data.row.index].status;
        if (status === 'completed') {
          data.cell.styles.textColor = [34, 197, 94]; // green-500
        } else if (status === 'in_progress') {
          data.cell.styles.textColor = [59, 130, 246]; // blue-500
        } else {
          data.cell.styles.textColor = [156, 163, 175]; // gray-400
        }
      }
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page for assets
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // === LINKED ASSETS ===
  if (assets && assets.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text('Linked Infrastructure Assets', 14, yPosition);
    yPosition += 8;

    // Assets table
    const assetsData = assets.map((asset) => [
      asset.asset_name,
      asset.asset_type,
      asset.environment,
      asset.status,
      asset.link_type || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Asset Name', 'Type', 'Environment', 'Status', 'Link Type']],
      body: assetsData,
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // === SUMMARY STATISTICS ===
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Summary Statistics', 14, yPosition);
  yPosition += 8;

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const inProgressSteps = steps.filter(s => s.status === 'in_progress').length;
  const pendingSteps = steps.filter(s => s.status === 'pending').length;
  const totalEstimatedHours = steps.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);
  const totalActualHours = steps.reduce((sum, s) => sum + (s.actual_hours || 0), 0);

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: [
      ['Total Steps', steps.length.toString()],
      ['Completed Steps', completedSteps.toString()],
      ['In Progress Steps', inProgressSteps.toString()],
      ['Pending Steps', pendingSteps.toString()],
      ['Completion Rate', `${Math.round((completedSteps / steps.length) * 100)}%`],
      ['Total Linked Assets', assets?.length.toString() || '0'],
      ['Estimated Hours', totalEstimatedHours.toString()],
      ['Actual Hours', totalActualHours > 0 ? totalActualHours.toString() : 'N/A'],
      ['Hours Variance', totalActualHours > 0 ? `${totalActualHours - totalEstimatedHours}h` : 'N/A'],
    ],
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'IAC Platform - Workflow Management System',
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Save the PDF
  const fileName = `${project.name.replace(/[^a-z0-9]/gi, '_')}_workflow_report_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

/**
 * Generate a summary PDF report for all projects (Dashboard export)
 */
export const generateDashboardPDF = (projects: Project[]): void => {
  const doc = new jsPDF();

  doc.setProperties({
    title: 'Workflow Dashboard Report',
    subject: 'All Projects Summary',
    author: 'IAC Platform',
    keywords: 'workflow, dashboard, projects',
    creator: 'IAC Platform'
  });

  let yPosition = 20;

  // === HEADER ===
  doc.setFontSize(22);
  doc.setTextColor(31, 41, 55);
  doc.text('Workflow Dashboard Report', 105, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, yPosition, { align: 'center' });
  
  yPosition += 15;

  // === SUMMARY STATISTICS ===
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Overview', 14, yPosition);
  yPosition += 8;

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const avgCompletion = projects.reduce((sum, p) => sum + p.completion_percentage, 0) / totalProjects;

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: [
      ['Total Projects', totalProjects.toString()],
      ['Active Projects', activeProjects.toString()],
      ['Completed Projects', completedProjects.toString()],
      ['Average Completion', `${Math.round(avgCompletion)}%`],
    ],
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // === ALL PROJECTS TABLE ===
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('All Projects', 14, yPosition);
  yPosition += 8;

  const projectsData = projects.map(p => [
    p.name,
    p.status,
    p.priority,
    `${p.completion_percentage}%`,
    new Date(p.start_date).toLocaleDateString(),
    new Date(p.target_date).toLocaleDateString(),
    p.created_by,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Project Name', 'Status', 'Priority', 'Progress', 'Start Date', 'Target Date', 'Owner']],
    body: projectsData,
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  });

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'IAC Platform - Workflow Management System',
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  const fileName = `workflow_dashboard_report_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

// Helper functions
function getStatusBadge(status: string): string {
  switch (status) {
    case 'completed':
      return '✓ Completed';
    case 'in_progress':
      return '● In Progress';
    case 'pending':
      return '○ Pending';
    default:
      return status;
  }
}

function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  }
  return `${diffHours}h`;
}
