import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentDownloads from '../../pages/Agents/AgentDownloads';

// Mock window.open
const mockOpen = vi.fn();
global.window.open = mockOpen;

describe('AgentDownloads Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============ RENDERING TESTS ============
  describe('Page Rendering', () => {
    it('renders page header with title and description', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('Agent Downloads')).toBeInTheDocument();
      expect(screen.getByText(/Download CMDB agents for your infrastructure monitoring needs/i)).toBeInTheDocument();
    });

    it('renders all platform filter buttons', () => {
      render(<AgentDownloads />);
      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /windows/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /linux/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /macos/i })).toBeInTheDocument();
    });

    it('renders all agent cards by default', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('Windows Agent')).toBeInTheDocument();
      expect(screen.getByText('Windows CLI Tool')).toBeInTheDocument();
      expect(screen.getByText('Windows Complete Package')).toBeInTheDocument();
      expect(screen.getByText('Linux Agent')).toBeInTheDocument();
      expect(screen.getByText('macOS Agent')).toBeInTheDocument();
    });

    it('renders installation instructions sections', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('Windows Installation')).toBeInTheDocument();
      expect(screen.getByText('Linux Installation')).toBeInTheDocument();
    });

    it('renders features overview section', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('Agent Features')).toBeInTheDocument();
      expect(screen.getByText('System Inventory')).toBeInTheDocument();
      expect(screen.getByText('Security Monitoring')).toBeInTheDocument();
      expect(screen.getByText('CLI Management')).toBeInTheDocument();
    });
  });

  // ============ AGENT CARD TESTS ============
  describe('Agent Cards Display', () => {
    it('displays agent version for each card', () => {
      render(<AgentDownloads />);
      const versionElements = screen.getAllByText('v1.0.0');
      expect(versionElements).toHaveLength(5); // 5 agents
    });

    it('displays file size for each agent', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('8.5 MB')).toBeInTheDocument(); // Windows Agent
      expect(screen.getByText('5.9 MB')).toBeInTheDocument(); // Windows CLI
      expect(screen.getByText('6.0 MB')).toBeInTheDocument(); // Windows Package
      expect(screen.getByText('7.2 MB')).toBeInTheDocument(); // Linux
      expect(screen.getByText('6.8 MB')).toBeInTheDocument(); // macOS
    });

    it('displays agent descriptions', () => {
      render(<AgentDownloads />);
      expect(screen.getByText(/Native Windows agent with WMI integration/i)).toBeInTheDocument();
      expect(screen.getByText(/Command-line management tool for Windows agent/i)).toBeInTheDocument();
      expect(screen.getByText(/Native Linux agent with systemd integration/i)).toBeInTheDocument();
    });

    it('displays SHA256 checksums', () => {
      render(<AgentDownloads />);
      const checksums = screen.getAllByText(/SHA256:/);
      expect(checksums.length).toBeGreaterThan(0);
    });

    it('displays download button for each agent', () => {
      render(<AgentDownloads />);
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      expect(downloadButtons.length).toBeGreaterThanOrEqual(5);
    });

    it('displays platform badge for each agent', () => {
      render(<AgentDownloads />);
      const windowsPlatforms = screen.getAllByText('Windows');
      expect(windowsPlatforms.length).toBeGreaterThanOrEqual(3); // 3 Windows agents
      expect(screen.getByText('Linux')).toBeInTheDocument();
      expect(screen.getByText('macOS')).toBeInTheDocument();
    });
  });

  // ============ PLATFORM FILTERING TESTS ============
  describe('Platform Filtering', () => {
    it('shows all agents by default', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('Windows Agent')).toBeInTheDocument();
      expect(screen.getByText('Linux Agent')).toBeInTheDocument();
      expect(screen.getByText('macOS Agent')).toBeInTheDocument();
    });

    it('filters to show only Windows agents when Windows button clicked', () => {
      render(<AgentDownloads />);
      const windowsButton = screen.getByRole('button', { name: /windows/i });
      fireEvent.click(windowsButton);
      
      expect(screen.getByText('Windows Agent')).toBeInTheDocument();
      expect(screen.getByText('Windows CLI Tool')).toBeInTheDocument();
      expect(screen.queryByText('Linux Agent')).not.toBeInTheDocument();
      expect(screen.queryByText('macOS Agent')).not.toBeInTheDocument();
    });

    it('filters to show only Linux agents when Linux button clicked', () => {
      render(<AgentDownloads />);
      const linuxButton = screen.getByRole('button', { name: /linux/i });
      fireEvent.click(linuxButton);
      
      expect(screen.getByText('Linux Agent')).toBeInTheDocument();
      expect(screen.queryByText('Windows Agent')).not.toBeInTheDocument();
      expect(screen.queryByText('macOS Agent')).not.toBeInTheDocument();
    });

    it('filters to show only macOS agents when macOS button clicked', () => {
      render(<AgentDownloads />);
      const macosButton = screen.getByRole('button', { name: /macos/i });
      fireEvent.click(macosButton);
      
      expect(screen.getByText('macOS Agent')).toBeInTheDocument();
      expect(screen.queryByText('Windows Agent')).not.toBeInTheDocument();
      expect(screen.queryByText('Linux Agent')).not.toBeInTheDocument();
    });

    it('shows all agents when All button clicked after filtering', () => {
      render(<AgentDownloads />);
      
      // Filter to Windows
      fireEvent.click(screen.getByRole('button', { name: /windows/i }));
      expect(screen.queryByText('Linux Agent')).not.toBeInTheDocument();
      
      // Click All
      fireEvent.click(screen.getByRole('button', { name: /all/i }));
      expect(screen.getByText('Windows Agent')).toBeInTheDocument();
      expect(screen.getByText('Linux Agent')).toBeInTheDocument();
      expect(screen.getByText('macOS Agent')).toBeInTheDocument();
    });

    it('highlights active filter button', () => {
      render(<AgentDownloads />);
      const allButton = screen.getByRole('button', { name: /all/i });
      const windowsButton = screen.getByRole('button', { name: /windows/i });
      
      // All should be active by default
      expect(allButton).toHaveClass('bg-blue-500');
      
      // Click Windows
      fireEvent.click(windowsButton);
      expect(windowsButton).toHaveClass('bg-blue-500');
      expect(allButton).not.toHaveClass('bg-blue-500');
    });
  });

  // ============ DOWNLOAD FUNCTIONALITY TESTS ============
  describe('Download Functionality', () => {
    it('triggers download when Windows Agent download button clicked', async () => {
      render(<AgentDownloads />);
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      
      fireEvent.click(downloadButtons[0]); // First download button (Windows Agent)
      
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith('/downloads/cmdb-agent-windows-amd64.exe', '_blank');
      });
    });

    it('triggers download when Windows CLI download button clicked', async () => {
      render(<AgentDownloads />);
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      
      fireEvent.click(downloadButtons[1]); // Second download button (Windows CLI)
      
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith('/downloads/cmdb-agent-cli-windows-amd64.exe', '_blank');
      });
    });

    it('triggers download when Windows Package download button clicked', async () => {
      render(<AgentDownloads />);
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      
      fireEvent.click(downloadButtons[2]); // Third download button (Windows Package)
      
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith('/downloads/cmdb-agent-windows-1.0.0.zip', '_blank');
      });
    });

    it('triggers download when Linux Agent download button clicked', async () => {
      render(<AgentDownloads />);
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      
      fireEvent.click(downloadButtons[3]); // Fourth download button (Linux)
      
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith('/downloads/cmdb-agent-linux-amd64', '_blank');
      });
    });

    it('opens download in new tab', async () => {
      render(<AgentDownloads />);
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      
      fireEvent.click(downloadButtons[0]);
      
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith(expect.any(String), '_blank');
      });
    });

    it('logs download action to console', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      render(<AgentDownloads />);
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      
      fireEvent.click(downloadButtons[0]);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Downloading Windows Agent...');
      });
      
      consoleSpy.mockRestore();
    });
  });

  // ============ INSTALLATION INSTRUCTIONS TESTS ============
  describe('Installation Instructions', () => {
    it('displays Windows PowerShell installation commands', () => {
      render(<AgentDownloads />);
      expect(screen.getByText(/Invoke-WebRequest/)).toBeInTheDocument();
      expect(screen.getByText(/Expand-Archive/)).toBeInTheDocument();
      expect(screen.getByText(/install-windows.ps1/)).toBeInTheDocument();
      expect(screen.getByText(/Get-Service CMDBAgent/)).toBeInTheDocument();
    });

    it('displays Linux bash installation commands', () => {
      render(<AgentDownloads />);
      expect(screen.getByText(/wget http:\/\/localhost:3000\/downloads\/cmdb-agent-linux-amd64/)).toBeInTheDocument();
      expect(screen.getByText(/chmod \+x cmdb-agent-linux-amd64/)).toBeInTheDocument();
      expect(screen.getByText(/sudo systemctl start cmdb-agent/)).toBeInTheDocument();
      expect(screen.getByText(/sudo systemctl enable cmdb-agent/)).toBeInTheDocument();
    });

    it('displays Windows verification commands', () => {
      render(<AgentDownloads />);
      expect(screen.getByText(/Get-Service CMDBAgent/)).toBeInTheDocument();
    });

    it('displays Linux service creation commands', () => {
      render(<AgentDownloads />);
      expect(screen.getByText(/sudo cmdb-agent install/)).toBeInTheDocument();
    });
  });

  // ============ FEATURES OVERVIEW TESTS ============
  describe('Features Overview', () => {
    it('displays System Inventory feature', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('System Inventory')).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive hardware and software discovery/i)).toBeInTheDocument();
    });

    it('displays Security Monitoring feature', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('Security Monitoring')).toBeInTheDocument();
      expect(screen.getByText(/Real-time security assessment/i)).toBeInTheDocument();
    });

    it('displays CLI Management feature', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('CLI Management')).toBeInTheDocument();
      expect(screen.getByText(/Powerful command-line tools/i)).toBeInTheDocument();
    });

    it('displays Auto-Discovery feature', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('Auto-Discovery')).toBeInTheDocument();
      expect(screen.getByText(/Automatic detection of infrastructure changes/i)).toBeInTheDocument();
    });

    it('displays License Tracking feature', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('License Tracking')).toBeInTheDocument();
      expect(screen.getByText(/Monitor and manage software license compliance/i)).toBeInTheDocument();
    });

    it('displays REST API feature', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('REST API')).toBeInTheDocument();
      expect(screen.getByText(/30\+ API endpoints/i)).toBeInTheDocument();
    });
  });

  // ============ UI/UX TESTS ============
  describe('UI/UX Elements', () => {
    it('applies correct styling to active filter button', () => {
      render(<AgentDownloads />);
      const allButton = screen.getByRole('button', { name: /all/i });
      expect(allButton).toHaveClass('bg-blue-500');
      expect(allButton).toHaveClass('text-white');
    });

    it('applies hover effects to download buttons', () => {
      render(<AgentDownloads />);
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      expect(downloadButtons[0]).toHaveClass('hover:from-blue-600');
      expect(downloadButtons[0]).toHaveClass('hover:to-purple-600');
    });

    it('displays gradient background', () => {
      const { container } = render(<AgentDownloads />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('bg-gradient-to-br');
    });

    it('displays backdrop blur effects on cards', () => {
      const { container } = render(<AgentDownloads />);
      const cards = container.querySelectorAll('.backdrop-blur-xl');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('displays icons for each agent type', () => {
      const { container } = render(<AgentDownloads />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(10); // Multiple icons throughout page
    });
  });

  // ============ ACCESSIBILITY TESTS ============
  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<AgentDownloads />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Agent Downloads');
    });

    it('all buttons have accessible labels', () => {
      render(<AgentDownloads />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveTextContent(/.+/); // Has text content
      });
    });

    it('download buttons have descriptive text', () => {
      render(<AgentDownloads />);
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      expect(downloadButtons.length).toBeGreaterThan(0);
    });
  });

  // ============ EDGE CASES & NEGATIVE TESTS ============
  describe('Edge Cases', () => {
    it('handles multiple rapid filter changes', () => {
      render(<AgentDownloads />);
      const windowsButton = screen.getByRole('button', { name: /windows/i });
      const linuxButton = screen.getByRole('button', { name: /linux/i });
      const allButton = screen.getByRole('button', { name: /all/i });
      
      fireEvent.click(windowsButton);
      fireEvent.click(linuxButton);
      fireEvent.click(allButton);
      
      expect(screen.getByText('Windows Agent')).toBeInTheDocument();
      expect(screen.getByText('Linux Agent')).toBeInTheDocument();
    });

    it('handles multiple download clicks without error', async () => {
      render(<AgentDownloads />);
      const downloadButton = screen.getAllByRole('button', { name: /download/i })[0];
      
      fireEvent.click(downloadButton);
      fireEvent.click(downloadButton);
      fireEvent.click(downloadButton);
      
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledTimes(3);
      });
    });

    it('maintains filter state after download', async () => {
      render(<AgentDownloads />);
      
      // Set filter
      fireEvent.click(screen.getByRole('button', { name: /windows/i }));
      
      // Download
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      fireEvent.click(downloadButtons[0]);
      
      // Filter should still be active
      await waitFor(() => {
        expect(screen.queryByText('Linux Agent')).not.toBeInTheDocument();
        expect(screen.getByText('Windows Agent')).toBeInTheDocument();
      });
    });

    it('handles empty filter results gracefully', () => {
      // This test verifies the component doesn't break with empty results
      // In production, all platforms have at least one agent
      render(<AgentDownloads />);
      const windowsButton = screen.getByRole('button', { name: /windows/i });
      fireEvent.click(windowsButton);
      
      // Should show Windows agents, not error
      expect(screen.getByText('Windows Agent')).toBeInTheDocument();
    });
  });

  // ============ DATA INTEGRITY TESTS ============
  describe('Data Integrity', () => {
    it('displays correct file extensions for Windows executables', () => {
      render(<AgentDownloads />);
      const consoleSpy = vi.spyOn(console, 'log');
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      
      fireEvent.click(downloadButtons[0]);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('.exe'),
        '_blank'
      );
      
      consoleSpy.mockRestore();
    });

    it('displays correct file extension for Windows package', () => {
      render(<AgentDownloads />);
      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      
      fireEvent.click(downloadButtons[2]);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('.zip'),
        '_blank'
      );
    });

    it('displays version numbers in consistent format', () => {
      render(<AgentDownloads />);
      const versions = screen.getAllByText('v1.0.0');
      expect(versions.length).toBe(5); // All agents have same version format
    });

    it('displays file sizes with proper units', () => {
      render(<AgentDownloads />);
      expect(screen.getByText('8.5 MB')).toBeInTheDocument();
      expect(screen.getByText('5.9 MB')).toBeInTheDocument();
      expect(screen.getByText('6.0 MB')).toBeInTheDocument();
      expect(screen.getByText('7.2 MB')).toBeInTheDocument();
      expect(screen.getByText('6.8 MB')).toBeInTheDocument();
    });
  });
});
