import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal Component', () => {
  beforeEach(() => {
    // Reset body overflow
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('should call onClose when clicking overlay', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} closeOnOverlay={true}>
        <div>Content</div>
      </Modal>
    );
    
    const overlay = screen.getByText('Content').parentElement?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('should not close on overlay click when closeOnOverlay is false', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} closeOnOverlay={false}>
        <div>Content</div>
      </Modal>
    );
    
    const overlay = screen.getByText('Content').parentElement?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    }
  });

  it('should call onClose when pressing Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('should render title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Title">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} description="Test Description">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render close button by default', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Title">
        <div>Content</div>
      </Modal>
    );
    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('should not render close button when showClose is false', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} showClose={false}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render footer', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        footer={<div>Footer Content</div>}
      >
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should apply small size', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} size="sm">
        <div>Content</div>
      </Modal>
    );
    const modalDiv = container.querySelector('.max-w-md');
    expect(modalDiv).toBeInTheDocument();
  });

  it('should apply medium size', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} size="md">
        <div>Content</div>
      </Modal>
    );
    const modalDiv = container.querySelector('.max-w-lg');
    expect(modalDiv).toBeInTheDocument();
  });

  it('should apply large size', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        <div>Content</div>
      </Modal>
    );
    const modalDiv = container.querySelector('.max-w-2xl');
    expect(modalDiv).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} className="custom-modal">
        <div>Content</div>
      </Modal>
    );
    const modalDiv = container.querySelector('.custom-modal');
    expect(modalDiv).toBeInTheDocument();
  });

  it('should prevent body scroll when open', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
  });

  it('should restore body scroll on unmount', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('should stop propagation on modal content click', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );
    
    const content = screen.getByText('Content');
    fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should have backdrop blur', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    const backdrop = container.querySelector('.backdrop-blur-sm');
    expect(backdrop).toBeInTheDocument();
  });

  it('should have animation classes', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    const modal = container.querySelector('.animate-in');
    expect(modal).toBeInTheDocument();
  });

  it('should render children correctly', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Child 1</div>
        <div>Child 2</div>
      </Modal>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});
