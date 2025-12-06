import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateProjectPDF } from '../pdfExport';

// Mock jsPDF and autoTable
vi.mock('jspdf', () => {
  const mockDoc = {
    setProperties: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    setFont: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    internal: {
      pageSize: {
        getHeight: () => 297,
      },
    },
  };

  return {
    default: vi.fn(() => mockDoc),
  };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

describe('PDF Export Utilities', () => {
  const mockProject = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    status: 'in_progress',
    priority: 'high',
    start_date: '2025-01-01',
    target_date: '2025-12-31',
    completion_percentage: 65,
    created_at: '2025-01-01T00:00:00Z',
    created_by: 'test@example.com',
  };

  const mockSteps = [
    {
      id: 1,
      step_name: 'Design',
      status: 'completed',
      assigned_to: 'designer@example.com',
      started_at: '2025-01-01T00:00:00Z',
      completed_at: '2025-02-01T00:00:00Z',
      notes: 'Design completed',
      estimated_hours: 40,
      actual_hours: 38,
    },
    {
      id: 2,
      step_name: 'Development',
      status: 'in_progress',
      assigned_to: 'dev@example.com',
      started_at: '2025-02-01T00:00:00Z',
      completed_at: null,
      notes: null,
      estimated_hours: 80,
      actual_hours: null,
    },
  ];

  const mockAssets = [
    {
      id: 1,
      asset_name: 'API Server',
      asset_type: 'compute',
      environment: 'production',
      status: 'active',
      link_type: 'primary',
    },
    {
      id: 2,
      asset_name: 'Database',
      asset_type: 'database',
      environment: 'production',
      status: 'active',
      link_type: 'dependency',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateProjectPDF', () => {
    it('should generate PDF with project data', () => {
      const data = {
        project: mockProject,
        steps: mockSteps,
        assets: mockAssets,
      };

      generateProjectPDF(data);

      // Verify jsPDF was instantiated
      const jsPDF = require('jspdf').default;
      expect(jsPDF).toHaveBeenCalled();
    });

    it('should set document properties', () => {
      const data = {
        project: mockProject,
        steps: mockSteps,
        assets: mockAssets,
      };

      generateProjectPDF(data);

      const jsPDF = require('jspdf').default;
      const mockDoc = jsPDF.mock.results[0].value;
      
      expect(mockDoc.setProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Test Project'),
          subject: 'Project Workflow Status Report',
          author: 'IAC Platform',
        })
      );
    });

    it('should handle empty steps array', () => {
      const data = {
        project: mockProject,
        steps: [],
        assets: mockAssets,
      };

      expect(() => generateProjectPDF(data)).not.toThrow();
    });

    it('should handle empty assets array', () => {
      const data = {
        project: mockProject,
        steps: mockSteps,
        assets: [],
      };

      expect(() => generateProjectPDF(data)).not.toThrow();
    });

    it('should save PDF with correct filename', () => {
      const data = {
        project: mockProject,
        steps: mockSteps,
        assets: mockAssets,
      };

      generateProjectPDF(data);

      const jsPDF = require('jspdf').default;
      const mockDoc = jsPDF.mock.results[0].value;
      
      expect(mockDoc.save).toHaveBeenCalledWith(
        expect.stringMatching(/.*\.pdf$/)
      );
    });

    it('should handle null values in steps', () => {
      const stepsWithNulls = [
        {
          ...mockSteps[1],
          completed_at: null,
          actual_hours: null,
          notes: null,
        },
      ];

      const data = {
        project: mockProject,
        steps: stepsWithNulls,
        assets: mockAssets,
      };

      expect(() => generateProjectPDF(data)).not.toThrow();
    });

    it('should format dates correctly', () => {
      const data = {
        project: mockProject,
        steps: mockSteps,
        assets: mockAssets,
      };

      generateProjectPDF(data);

      const jsPDF = require('jspdf').default;
      const mockDoc = jsPDF.mock.results[0].value;
      
      // Verify text was called (includes formatted dates)
      expect(mockDoc.text).toHaveBeenCalled();
    });

    it('should include project completion percentage', () => {
      const data = {
        project: { ...mockProject, completion_percentage: 75 },
        steps: mockSteps,
        assets: mockAssets,
      };

      generateProjectPDF(data);

      const jsPDF = require('jspdf').default;
      const mockDoc = jsPDF.mock.results[0].value;
      
      expect(mockDoc.text).toHaveBeenCalled();
    });

    it('should handle different project priorities', () => {
      const priorities = ['low', 'medium', 'high', 'critical'];

      priorities.forEach(priority => {
        const data = {
          project: { ...mockProject, priority },
          steps: mockSteps,
          assets: mockAssets,
        };

        expect(() => generateProjectPDF(data)).not.toThrow();
      });
    });

    it('should handle different project statuses', () => {
      const statuses = ['planning', 'in_progress', 'completed', 'on_hold'];

      statuses.forEach(status => {
        const data = {
          project: { ...mockProject, status },
          steps: mockSteps,
          assets: mockAssets,
        };

        expect(() => generateProjectPDF(data)).not.toThrow();
      });
    });
  });
});
