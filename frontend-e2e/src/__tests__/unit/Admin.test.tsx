import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminSystem from '../../pages/Admin/AdminSystem';
import AdminLicense from '../../pages/Admin/AdminLicense';
import AdminBackup from '../../pages/Admin/AdminBackup';

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

describe('Admin Components - Unit Tests', () => {
  describe('AdminSystem', () => {
    it('should render system admin page', () => {
      renderWithRouter(<AdminSystem />);
      expect(screen.getByText('System Administration')).toBeInTheDocument();
    });

    it('should display system metrics', () => {
      renderWithRouter(<AdminSystem />);
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
      expect(screen.getByText('Memory Usage')).toBeInTheDocument();
      expect(screen.getByText('Disk Usage')).toBeInTheDocument();
      expect(screen.getByText('Network I/O')).toBeInTheDocument();
    });

    it('should render service list', () => {
      renderWithRouter(<AdminSystem />);
      expect(screen.getByText('API Gateway')).toBeInTheDocument();
      expect(screen.getByText('IAC Generator')).toBeInTheDocument();
      expect(screen.getByText('AI Orchestrator')).toBeInTheDocument();
    });

    it('should display service status', () => {
      renderWithRouter(<AdminSystem />);
      const runningStatus = screen.getAllByText('Running');
      expect(runningStatus.length).toBeGreaterThan(0);
    });

    it('should show system information', () => {
      renderWithRouter(<AdminSystem />);
      expect(screen.getByText('System Information')).toBeInTheDocument();
    });

    it('should render quick action buttons', () => {
      renderWithRouter(<AdminSystem />);
      expect(screen.getByText('Restart All Services')).toBeInTheDocument();
      expect(screen.getByText('Run Health Check')).toBeInTheDocument();
      expect(screen.getByText('Clear Cache')).toBeInTheDocument();
    });

    it('should display service stats', () => {
      renderWithRouter(<AdminSystem />);
      expect(screen.getByText('Total Services')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Uptime')).toBeInTheDocument();
    });

    it('should show memory and CPU per service', () => {
      renderWithRouter(<AdminSystem />);
      const memoryElements = screen.getAllByText(/MB/);
      expect(memoryElements.length).toBeGreaterThan(0);
    });
  });

  describe('AdminLicense', () => {
    it('should render license page', () => {
      renderWithRouter(<AdminLicense />);
      expect(screen.getByText('License Management')).toBeInTheDocument();
    });

    it('should display license details', () => {
      renderWithRouter(<AdminLicense />);
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should show license expiry information', () => {
      renderWithRouter(<AdminLicense />);
      expect(screen.getByText(/Expires:/)).toBeInTheDocument();
    });

    it('should display licensed organization', () => {
      renderWithRouter(<AdminLicense />);
      expect(screen.getByText('Licensed To:')).toBeInTheDocument();
    });

    it('should render feature list', () => {
      renderWithRouter(<AdminLicense />);
      expect(screen.getByText('Multi-Cloud Support')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Advanced Security')).toBeInTheDocument();
    });

    it('should show user capacity', () => {
      renderWithRouter(<AdminLicense />);
      expect(screen.getByText(/Users:/)).toBeInTheDocument();
    });

    it('should display action buttons', () => {
      renderWithRouter(<AdminLicense />);
      expect(screen.getByText('Renew License')).toBeInTheDocument();
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    it('should render license key section', () => {
      renderWithRouter(<AdminLicense />);
      expect(screen.getByText('License Key')).toBeInTheDocument();
    });

    it('should show usage statistics', () => {
      renderWithRouter(<AdminLicense />);
      expect(screen.getByText('Usage Statistics')).toBeInTheDocument();
    });
  });

  describe('AdminBackup', () => {
    it('should render backup page', () => {
      renderWithRouter(<AdminBackup />);
      expect(screen.getByText('Backup & Recovery')).toBeInTheDocument();
    });

    it('should display backup stats', () => {
      renderWithRouter(<AdminBackup />);
      expect(screen.getByText('Total Backups')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('should render backup list', () => {
      renderWithRouter(<AdminBackup />);
      expect(screen.getByText('Full System Backup')).toBeInTheDocument();
      expect(screen.getByText('Database Backup')).toBeInTheDocument();
    });

    it('should display backup types', () => {
      renderWithRouter(<AdminBackup />);
      expect(screen.getByText('Full')).toBeInTheDocument();
      expect(screen.getByText('Incremental')).toBeInTheDocument();
      expect(screen.getByText('Differential')).toBeInTheDocument();
    });

    it('should show backup schedules', () => {
      renderWithRouter(<AdminBackup />);
      expect(screen.getByText('Backup Schedules')).toBeInTheDocument();
    });

    it('should display configuration settings', () => {
      renderWithRouter(<AdminBackup />);
      expect(screen.getByText('Configuration')).toBeInTheDocument();
      expect(screen.getByText('Storage Location')).toBeInTheDocument();
      expect(screen.getByText('Encryption')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      renderWithRouter(<AdminBackup />);
      expect(screen.getByText('Start Manual Backup')).toBeInTheDocument();
    });

    it('should show backup sizes', () => {
      renderWithRouter(<AdminBackup />);
      const sizeElements = screen.getAllByText(/GB|MB/);
      expect(sizeElements.length).toBeGreaterThan(0);
    });

    it('should display backup duration', () => {
      renderWithRouter(<AdminBackup />);
      const durationElements = screen.getAllByText(/min/);
      expect(durationElements.length).toBeGreaterThan(0);
    });
  });
});
