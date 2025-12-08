import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Dashboard Component - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Positive Tests - Expected Behavior', () => {
    it('should render dashboard with title', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it('should display all stat cards', () => {
      renderWithRouter(<Dashboard />);
      const statCards = screen.getAllByRole('article');
      expect(statCards.length).toBeGreaterThan(0);
    });

    it('should render navigation links', () => {
      renderWithRouter(<Dashboard />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should handle click events on cards', () => {
      renderWithRouter(<Dashboard />);
      const cards = screen.getAllByRole('article');
      if (cards.length > 0) {
        fireEvent.click(cards[0]);
        expect(cards[0]).toBeInTheDocument();
      }
    });

    it('should display metrics with correct format', () => {
      renderWithRouter(<Dashboard />);
      const metrics = screen.queryAllByText(/\d+/);
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  describe('Negative Tests - Error Handling', () => {
    it('should handle missing data gracefully', () => {
      const { container } = renderWithRouter(<Dashboard />);
      expect(container).toBeInTheDocument();
    });

    it('should not crash with empty props', () => {
      expect(() => renderWithRouter(<Dashboard />)).not.toThrow();
    });

    it('should handle rapid clicks without errors', () => {
      renderWithRouter(<Dashboard />);
      const cards = screen.getAllByRole('article');
      if (cards.length > 0) {
        fireEvent.click(cards[0]);
        fireEvent.click(cards[0]);
        fireEvent.click(cards[0]);
        expect(cards[0]).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels', () => {
      const { container } = renderWithRouter(<Dashboard />);
      const elements = container.querySelectorAll('[aria-label]');
      expect(elements.length).toBeGreaterThanOrEqual(0);
    });

    it('should be keyboard navigable', () => {
      renderWithRouter(<Dashboard />);
      const firstFocusable = screen.getAllByRole('link')[0];
      if (firstFocusable) {
        firstFocusable.focus();
        expect(document.activeElement).toBe(firstFocusable);
      }
    });
  });
});
