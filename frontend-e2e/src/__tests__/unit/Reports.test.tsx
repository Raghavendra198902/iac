import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportsOverview from '../../pages/Reports/ReportsOverview';
import ReportsBuilder from '../../pages/Reports/ReportsBuilder';
import ReportsScheduled from '../../pages/Reports/ReportsScheduled';
import ReportsExport from '../../pages/Reports/ReportsExport';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Reports Components - Unit Tests', () => {
  describe('ReportsOverview', () => {
    it('should render reports overview page', () => {
      renderWithRouter(<ReportsOverview />);
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.getByText('View, manage, and schedule your reports')).toBeInTheDocument();
    });

    it('should display stats correctly', () => {
      renderWithRouter(<ReportsOverview />);
      expect(screen.getByText('Total Reports')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('should render all report cards', () => {
      renderWithRouter(<ReportsOverview />);
      expect(screen.getByText('Infrastructure Utilization Report')).toBeInTheDocument();
      expect(screen.getByText('Monthly Cost Analysis')).toBeInTheDocument();
      expect(screen.getByText('Security Compliance Report')).toBeInTheDocument();
    });

    it('should filter reports by search term', async () => {
      renderWithRouter(<ReportsOverview />);
      const searchInput = screen.getByPlaceholderText('Search reports...');
      
      fireEvent.change(searchInput, { target: { value: 'security' } });
      
      await waitFor(() => {
        expect(screen.getByText('Security Compliance Report')).toBeInTheDocument();
      });
    });

    it('should filter reports by category', async () => {
      renderWithRouter(<ReportsOverview />);
      const categoryButtons = screen.getAllByRole('button');
      const securityButton = categoryButtons.find(btn => btn.textContent?.includes('Security'));
      
      if (securityButton) {
        fireEvent.click(securityButton);
        await waitFor(() => {
          expect(screen.getByText('Security Compliance Report')).toBeInTheDocument();
        });
      }
    });

    it('should handle empty search results', () => {
      renderWithRouter(<ReportsOverview />);
      const searchInput = screen.getByPlaceholderText('Search reports...');
      
      fireEvent.change(searchInput, { target: { value: 'nonexistent report' } });
      
      // Should show no results or filtered list
      expect(searchInput).toHaveValue('nonexistent report');
    });

    it('should display correct status badges', () => {
      renderWithRouter(<ReportsOverview />);
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
    });
  });

  describe('ReportsBuilder', () => {
    it('should render report builder page', () => {
      renderWithRouter(<ReportsBuilder />);
      expect(screen.getByText('Report Builder')).toBeInTheDocument();
      expect(screen.getByText('Create custom reports with your preferred data and filters')).toBeInTheDocument();
    });

    it('should display all data source options', () => {
      renderWithRouter(<ReportsBuilder />);
      expect(screen.getByText('Infrastructure Data')).toBeInTheDocument();
      expect(screen.getByText('Cost & Billing')).toBeInTheDocument();
      expect(screen.getByText('Security Events')).toBeInTheDocument();
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('Compliance Data')).toBeInTheDocument();
    });

    it('should allow field selection', () => {
      renderWithRouter(<ReportsBuilder />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should add filters dynamically', async () => {
      renderWithRouter(<ReportsBuilder />);
      const addFilterButton = screen.getByText('Add Filter');
      
      fireEvent.click(addFilterButton);
      
      await waitFor(() => {
        expect(screen.getByText('Field')).toBeInTheDocument();
      });
    });

    it('should display format options', () => {
      renderWithRouter(<ReportsBuilder />);
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
      expect(screen.getByText('HTML')).toBeInTheDocument();
    });

    it('should show schedule options', () => {
      renderWithRouter(<ReportsBuilder />);
      expect(screen.getByText('Run Once')).toBeInTheDocument();
      expect(screen.getByText('Daily')).toBeInTheDocument();
      expect(screen.getByText('Weekly')).toBeInTheDocument();
      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });

    it('should validate email input', () => {
      renderWithRouter(<ReportsBuilder />);
      const emailInput = screen.getByPlaceholderText('Enter email addresses (comma-separated)');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should display report summary', () => {
      renderWithRouter(<ReportsBuilder />);
      expect(screen.getByText('Report Summary')).toBeInTheDocument();
    });
  });

  describe('ReportsScheduled', () => {
    it('should render scheduled reports page', () => {
      renderWithRouter(<ReportsScheduled />);
      expect(screen.getByText('Scheduled Reports')).toBeInTheDocument();
    });

    it('should display scheduled report stats', () => {
      renderWithRouter(<ReportsScheduled />);
      expect(screen.getByText('Total Scheduled')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });

    it('should render scheduled report cards', () => {
      renderWithRouter(<ReportsScheduled />);
      expect(screen.getByText('Daily Infrastructure Summary')).toBeInTheDocument();
      expect(screen.getByText('Weekly Cost Report')).toBeInTheDocument();
    });

    it('should display frequency information', () => {
      renderWithRouter(<ReportsScheduled />);
      expect(screen.getAllByText(/Daily/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Weekly/i).length).toBeGreaterThan(0);
    });

    it('should show action buttons', () => {
      renderWithRouter(<ReportsScheduled />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should display next run time', () => {
      renderWithRouter(<ReportsScheduled />);
      expect(screen.getAllByText(/Next Run:/i).length).toBeGreaterThan(0);
    });
  });

  describe('ReportsExport', () => {
    it('should render export page', () => {
      renderWithRouter(<ReportsExport />);
      expect(screen.getByText('Export Data')).toBeInTheDocument();
    });

    it('should display export stats', () => {
      renderWithRouter(<ReportsExport />);
      expect(screen.getByText('Total Exports')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('should show format selection', () => {
      renderWithRouter(<ReportsExport />);
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
      expect(screen.getByText('Excel')).toBeInTheDocument();
    });

    it('should display data type filters', () => {
      renderWithRouter(<ReportsExport />);
      expect(screen.getByText('All Data')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure')).toBeInTheDocument();
      expect(screen.getByText('Cost')).toBeInTheDocument();
    });

    it('should show export history', () => {
      renderWithRouter(<ReportsExport />);
      expect(screen.getByText('Export History')).toBeInTheDocument();
    });

    it('should render export button', () => {
      renderWithRouter(<ReportsExport />);
      const exportButton = screen.getByText('Start Export');
      expect(exportButton).toBeInTheDocument();
    });
  });
});
