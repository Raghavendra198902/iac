import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import DashboardEnhanced from '../pages/DashboardEnhanced';
import * as AuthContext from '../contexts/AuthContext';

// Mock the role-specific dashboard components
vi.mock('../pages/dashboards/EADashboard', () => ({
  default: () => <div data-testid="ea-dashboard">EA Dashboard</div>,
}));

vi.mock('../pages/dashboards/SADashboard', () => ({
  default: () => <div data-testid="sa-dashboard">SA Dashboard</div>,
}));

vi.mock('../pages/dashboards/TADashboard', () => ({
  default: () => <div data-testid="ta-dashboard">TA Dashboard</div>,
}));

vi.mock('../pages/dashboards/PMDashboard', () => ({
  default: () => <div data-testid="pm-dashboard">PM Dashboard</div>,
}));

vi.mock('../pages/dashboards/SEDashboard', () => ({
  default: () => <div data-testid="se-dashboard">SE Dashboard</div>,
}));

describe('DashboardEnhanced - Role-Based Routing', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders EA Dashboard for Enterprise Architect role', () => {
    vi.spyOn(AuthContext, 'useRoleAccess').mockReturnValue({
      isEA: true,
      isSA: false,
      isTA: false,
      isPM: false,
      isSE: false,
      isConsultant: false,
      isAdmin: false,
      isArchitect: true,
    });

    renderWithRouter(<DashboardEnhanced />);
    expect(screen.getByTestId('ea-dashboard')).toBeInTheDocument();
  });

  it('renders SA Dashboard for Solution Architect role', () => {
    vi.spyOn(AuthContext, 'useRoleAccess').mockReturnValue({
      isEA: false,
      isSA: true,
      isTA: false,
      isPM: false,
      isSE: false,
      isConsultant: false,
      isAdmin: false,
      isArchitect: true,
    });

    renderWithRouter(<DashboardEnhanced />);
    expect(screen.getByTestId('sa-dashboard')).toBeInTheDocument();
  });

  it('renders TA Dashboard for Technical Architect role', () => {
    vi.spyOn(AuthContext, 'useRoleAccess').mockReturnValue({
      isEA: false,
      isSA: false,
      isTA: true,
      isPM: false,
      isSE: false,
      isConsultant: false,
      isAdmin: false,
      isArchitect: true,
    });

    renderWithRouter(<DashboardEnhanced />);
    expect(screen.getByTestId('ta-dashboard')).toBeInTheDocument();
  });

  it('renders PM Dashboard for Project Manager role', () => {
    vi.spyOn(AuthContext, 'useRoleAccess').mockReturnValue({
      isEA: false,
      isSA: false,
      isTA: false,
      isPM: true,
      isSE: false,
      isConsultant: false,
      isAdmin: false,
      isArchitect: false,
    });

    renderWithRouter(<DashboardEnhanced />);
    expect(screen.getByTestId('pm-dashboard')).toBeInTheDocument();
  });

  it('renders SE Dashboard for System Engineer role', () => {
    vi.spyOn(AuthContext, 'useRoleAccess').mockReturnValue({
      isEA: false,
      isSA: false,
      isTA: false,
      isPM: false,
      isSE: true,
      isConsultant: false,
      isAdmin: false,
      isArchitect: false,
    });

    renderWithRouter(<DashboardEnhanced />);
    expect(screen.getByTestId('se-dashboard')).toBeInTheDocument();
  });

  it('renders generic dashboard for users without specific roles', () => {
    vi.spyOn(AuthContext, 'useRoleAccess').mockReturnValue({
      isEA: false,
      isSA: false,
      isTA: false,
      isPM: false,
      isSE: false,
      isConsultant: true,
      isAdmin: false,
      isArchitect: false,
    });

    renderWithRouter(<DashboardEnhanced />);
    // Should render the generic dashboard fallback
    expect(screen.getByText(/Welcome to IAC DHARMA Platform/i)).toBeInTheDocument();
  });

  it('prioritizes EA role when user has multiple roles', () => {
    vi.spyOn(AuthContext, 'useRoleAccess').mockReturnValue({
      isEA: true,
      isSA: true,
      isTA: true,
      isPM: false,
      isSE: false,
      isConsultant: false,
      isAdmin: false,
      isArchitect: true,
    });

    renderWithRouter(<DashboardEnhanced />);
    // EA should take precedence
    expect(screen.getByTestId('ea-dashboard')).toBeInTheDocument();
  });
});
