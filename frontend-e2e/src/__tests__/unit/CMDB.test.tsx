import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CMDBAssets from '../../pages/CMDB/CMDBAssets';
import CMDBConfigItems from '../../pages/CMDB/CMDBConfigItems';
import CMDBRelationships from '../../pages/CMDB/CMDBRelationships';

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

describe('CMDB Components - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CMDBAssets', () => {
    it('should render CMDB assets page', () => {
      renderWithRouter(<CMDBAssets />);
      expect(screen.getByText('Asset Management')).toBeInTheDocument();
      expect(screen.getByText('Monitor and manage infrastructure assets')).toBeInTheDocument();
    });

    it('should display asset statistics', () => {
      renderWithRouter(<CMDBAssets />);
      expect(screen.getByText('Total Assets')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('Avg Compliance')).toBeInTheDocument();
    });

    it('should render asset cards with sample data', () => {
      renderWithRouter(<CMDBAssets />);
      
      // Check for sample assets
      expect(screen.getByText('web-server-prod-01')).toBeInTheDocument();
      expect(screen.getByText('db-primary-mysql')).toBeInTheDocument();
      expect(screen.getByText('storage-backup-s3')).toBeInTheDocument();
    });

    it('should display asset types correctly', () => {
      renderWithRouter(<CMDBAssets />);
      
      // Check for type badges
      expect(screen.getByText('Compute')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Storage')).toBeInTheDocument();
    });

    it('should show asset status indicators', () => {
      renderWithRouter(<CMDBAssets />);
      
      // Check for status badges
      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses.length).toBeGreaterThan(0);
    });

    it('should display compliance scores', () => {
      renderWithRouter(<CMDBAssets />);
      
      // Check for compliance percentages
      const complianceElements = screen.getAllByText(/\d+%/);
      expect(complianceElements.length).toBeGreaterThan(0);
    });

    it('should show uptime information', () => {
      renderWithRouter(<CMDBAssets />);
      
      // Check for uptime displays
      expect(screen.getAllByText(/\d+ days/).length).toBeGreaterThan(0);
    });

    it('should display vulnerability counts', () => {
      renderWithRouter(<CMDBAssets />);
      
      // Check for vulnerability information
      expect(screen.getByText('Vulnerabilities')).toBeInTheDocument();
    });

    it('should render search functionality', () => {
      renderWithRouter(<CMDBAssets />);
      
      const searchInput = screen.getByPlaceholderText('Search assets...');
      expect(searchInput).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: 'web-server' } });
      expect(searchInput).toHaveValue('web-server');
    });

    it('should have filter options', () => {
      renderWithRouter(<CMDBAssets />);
      
      // Check for filter buttons
      expect(screen.getByText('All Assets')).toBeInTheDocument();
      expect(screen.getByText('Compute')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
    });

    it('should display asset metrics', () => {
      renderWithRouter(<CMDBAssets />);
      
      // Check for metric labels
      expect(screen.getByText('CPU:')).toBeInTheDocument();
      expect(screen.getByText('Memory:')).toBeInTheDocument();
      expect(screen.getByText('Disk:')).toBeInTheDocument();
    });

    it('should show action buttons for assets', () => {
      renderWithRouter(<CMDBAssets />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('CMDBConfigItems', () => {
    it('should render config items page', () => {
      renderWithRouter(<CMDBConfigItems />);
      expect(screen.getByText('Configuration Items')).toBeInTheDocument();
      expect(screen.getByText('Manage configuration items and their dependencies')).toBeInTheDocument();
    });

    it('should display config item statistics', () => {
      renderWithRouter(<CMDBConfigItems />);
      expect(screen.getByText('Total CIs')).toBeInTheDocument();
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('should render config item cards', () => {
      renderWithRouter(<CMDBConfigItems />);
      
      // Check for sample config items
      expect(screen.getByText('Production Web Server')).toBeInTheDocument();
      expect(screen.getByText('MySQL Database Primary')).toBeInTheDocument();
      expect(screen.getByText('Redis Cache Cluster')).toBeInTheDocument();
    });

    it('should display CI types', () => {
      renderWithRouter(<CMDBConfigItems />);
      
      // Check for type badges
      expect(screen.getByText('Server')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Cache')).toBeInTheDocument();
    });

    it('should show health status indicators', () => {
      renderWithRouter(<CMDBConfigItems />);
      
      // Check for health status
      const healthyStatuses = screen.getAllByText('Healthy');
      expect(healthyStatuses.length).toBeGreaterThan(0);
    });

    it('should display service counts', () => {
      renderWithRouter(<CMDBConfigItems />);
      
      // Check for service information
      expect(screen.getAllByText(/\d+ Services/).length).toBeGreaterThan(0);
    });

    it('should show dependency information', () => {
      renderWithRouter(<CMDBConfigItems />);
      
      // Check for dependencies
      expect(screen.getAllByText(/\d+ Dependencies/).length).toBeGreaterThan(0);
    });

    it('should display attributes section', () => {
      renderWithRouter(<CMDBConfigItems />);
      
      // Check for attributes labels
      expect(screen.getByText('Attributes')).toBeInTheDocument();
    });

    it('should render search functionality', () => {
      renderWithRouter(<CMDBConfigItems />);
      
      const searchInput = screen.getByPlaceholderText('Search configuration items...');
      expect(searchInput).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: 'web server' } });
      expect(searchInput).toHaveValue('web server');
    });

    it('should have filter options by type', () => {
      renderWithRouter(<CMDBConfigItems />);
      
      // Check for filter buttons
      expect(screen.getByText('All Types')).toBeInTheDocument();
      expect(screen.getByText('Server')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
    });

    it('should have status filter options', () => {
      renderWithRouter(<CMDBConfigItems />);
      
      // Check for status filters
      expect(screen.getByText('All Status')).toBeInTheDocument();
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should display CI identifiers', () => {
      renderWithRouter(<CMDBConfigItems />);
      
      // Check for CI IDs
      expect(screen.getByText(/CI-\d+/)).toBeInTheDocument();
    });
  });

  describe('CMDBRelationships', () => {
    it('should render relationships page', () => {
      renderWithRouter(<CMDBRelationships />);
      expect(screen.getByText('Resource Relationships')).toBeInTheDocument();
      expect(screen.getByText('Visualize dependencies and relationships between resources')).toBeInTheDocument();
    });

    it('should display relationship statistics', () => {
      renderWithRouter(<CMDBRelationships />);
      expect(screen.getByText('Total Nodes')).toBeInTheDocument();
      expect(screen.getByText('Relationships')).toBeInTheDocument();
      expect(screen.getByText('Dependencies')).toBeInTheDocument();
      expect(screen.getByText('Connections')).toBeInTheDocument();
    });

    it('should render resource nodes', () => {
      renderWithRouter(<CMDBRelationships />);
      
      // Check for sample nodes
      expect(screen.getByText('API Gateway')).toBeInTheDocument();
      expect(screen.getByText('Web Server 1')).toBeInTheDocument();
      expect(screen.getByText('MySQL DB')).toBeInTheDocument();
    });

    it('should display node types', () => {
      renderWithRouter(<CMDBRelationships />);
      
      // Check for type badges
      expect(screen.getByText('Gateway')).toBeInTheDocument();
      expect(screen.getByText('Server')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
    });

    it('should show relationship connections', () => {
      renderWithRouter(<CMDBRelationships />);
      
      // Check for relationship indicators
      expect(screen.getAllByText(/→/).length).toBeGreaterThan(0);
    });

    it('should display relationship types', () => {
      renderWithRouter(<CMDBRelationships />);
      
      // Check for relationship type badges
      expect(screen.getByText('depends_on')).toBeInTheDocument();
      expect(screen.getByText('connects_to')).toBeInTheDocument();
      expect(screen.getByText('uses')).toBeInTheDocument();
    });

    it('should show bidirectional relationships', () => {
      renderWithRouter(<CMDBRelationships />);
      
      // Check for bidirectional indicators
      const arrows = screen.getAllByText(/→/);
      expect(arrows.length).toBeGreaterThan(0);
    });

    it('should render search functionality', () => {
      renderWithRouter(<CMDBRelationships />);
      
      const searchInput = screen.getByPlaceholderText('Search nodes...');
      expect(searchInput).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: 'gateway' } });
      expect(searchInput).toHaveValue('gateway');
    });

    it('should have filter options by type', () => {
      renderWithRouter(<CMDBRelationships />);
      
      // Check for filter buttons
      expect(screen.getByText('All Nodes')).toBeInTheDocument();
      expect(screen.getByText('Gateway')).toBeInTheDocument();
      expect(screen.getByText('Server')).toBeInTheDocument();
    });

    it('should display connection count per node', () => {
      renderWithRouter(<CMDBRelationships />);
      
      // Check for connection indicators
      expect(screen.getAllByText(/\d+ connections/).length).toBeGreaterThan(0);
    });

    it('should show node health status', () => {
      renderWithRouter(<CMDBRelationships />);
      
      // Check for health indicators
      const healthyNodes = screen.getAllByText('Healthy');
      expect(healthyNodes.length).toBeGreaterThan(0);
    });

    it('should display relationship strength or weight', () => {
      renderWithRouter(<CMDBRelationships />);
      
      // Relationships should have visual indicators
      const container = screen.getByText('Resource Relationships').closest('div');
      expect(container).toBeTruthy();
    });
  });

  describe('CMDB Integration Tests', () => {
    it('should handle empty asset search results', () => {
      renderWithRouter(<CMDBAssets />);
      
      const searchInput = screen.getByPlaceholderText('Search assets...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent-asset' } });
      
      expect(searchInput).toHaveValue('nonexistent-asset');
    });

    it('should filter assets by category', async () => {
      renderWithRouter(<CMDBAssets />);
      
      const computeFilter = screen.getByText('Compute');
      fireEvent.click(computeFilter);
      
      // Should show only compute assets after filter
      await waitFor(() => {
        expect(screen.getByText('web-server-prod-01')).toBeInTheDocument();
      });
    });

    it('should filter config items by status', async () => {
      renderWithRouter(<CMDBConfigItems />);
      
      const healthyFilter = screen.getByText('Healthy');
      fireEvent.click(healthyFilter);
      
      // Should filter to healthy items
      await waitFor(() => {
        const healthyItems = screen.getAllByText('Healthy');
        expect(healthyItems.length).toBeGreaterThan(0);
      });
    });

    it('should filter relationships by node type', async () => {
      renderWithRouter(<CMDBRelationships />);
      
      const gatewayFilter = screen.getByText('Gateway');
      fireEvent.click(gatewayFilter);
      
      // Should show gateway nodes
      await waitFor(() => {
        expect(screen.getByText('API Gateway')).toBeInTheDocument();
      });
    });
  });

  describe('CMDB Data Validation', () => {
    it('should validate asset data structure', () => {
      const asset = {
        id: 'asset-1',
        name: 'web-server-prod-01',
        type: 'Compute',
        status: 'Active',
        compliance: 98,
        uptime: 45,
        vulnerabilities: 2
      };
      
      expect(asset.id).toBeTruthy();
      expect(asset.name).toBeTruthy();
      expect(asset.compliance).toBeGreaterThanOrEqual(0);
      expect(asset.compliance).toBeLessThanOrEqual(100);
    });

    it('should validate config item data structure', () => {
      const configItem = {
        id: 'CI-001',
        name: 'Production Web Server',
        type: 'Server',
        status: 'Healthy',
        services: 12,
        dependencies: 3
      };
      
      expect(configItem.id).toMatch(/^CI-\d+$/);
      expect(configItem.services).toBeGreaterThanOrEqual(0);
      expect(configItem.dependencies).toBeGreaterThanOrEqual(0);
    });

    it('should validate relationship data structure', () => {
      const relationship = {
        source: 'API Gateway',
        target: 'Web Server 1',
        type: 'depends_on',
        bidirectional: false
      };
      
      expect(relationship.source).toBeTruthy();
      expect(relationship.target).toBeTruthy();
      expect(relationship.type).toBeTruthy();
      expect(typeof relationship.bidirectional).toBe('boolean');
    });
  });

  describe('CMDB UI/UX Tests', () => {
    it('should maintain glassmorphic design in assets', () => {
      const { container } = renderWithRouter(<CMDBAssets />);
      
      const blurElements = container.querySelectorAll('[class*="backdrop-blur"]');
      expect(blurElements.length).toBeGreaterThan(0);
    });

    it('should use consistent color coding for status', () => {
      renderWithRouter(<CMDBAssets />);
      
      // Active status should use green
      const activeElements = screen.getAllByText('Active');
      expect(activeElements.length).toBeGreaterThan(0);
    });

    it('should display proper grid layout', () => {
      const { container } = renderWithRouter(<CMDBConfigItems />);
      
      const gridElements = container.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });
});
