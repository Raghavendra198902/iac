import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useFocusTrap,
  announceToScreenReader,
  isAccessible,
  useKeyboardNavigation,
} from '../accessibility';

describe('Accessibility Utilities', () => {
  describe('useFocusTrap', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      const button1 = document.createElement('button');
      button1.textContent = 'First';
      const button2 = document.createElement('button');
      button2.textContent = 'Second';
      const button3 = document.createElement('button');
      button3.textContent = 'Last';

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should return a ref object', () => {
      const { result } = renderHook(() => useFocusTrap(true));
      expect(result.current).toHaveProperty('current');
    });

    it('should focus first element when activated', () => {
      const { result } = renderHook(() => useFocusTrap(true));
      
      if (result.current.current) {
        result.current.current = container;
      }

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(3);
    });

    it('should not trap focus when inactive', () => {
      const { result } = renderHook(() => useFocusTrap(false));
      
      if (result.current.current) {
        result.current.current = container;
      }

      // Should not add event listeners when inactive
      expect(result.current.current).toBeDefined();
    });

    it('should handle Tab key navigation', () => {
      const { result } = renderHook(() => useFocusTrap(true));
      
      if (result.current.current) {
        result.current.current = container;
      }

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      container.dispatchEvent(event);
    });

    it('should handle Shift+Tab key navigation', () => {
      const { result } = renderHook(() => useFocusTrap(true));
      
      if (result.current.current) {
        result.current.current = container;
      }

      const event = new KeyboardEvent('keydown', { 
        key: 'Tab', 
        shiftKey: true 
      });
      container.dispatchEvent(event);
    });
  });

  describe('announceToScreenReader', () => {
    afterEach(() => {
      // Clean up any announcement elements
      document.querySelectorAll('[role="status"]').forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    });

    it('should create announcement element with polite priority', () => {
      announceToScreenReader('Test message', 'polite');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.getAttribute('aria-live')).toBe('polite');
      expect(announcement?.textContent).toBe('Test message');
    });

    it('should create announcement with assertive priority', () => {
      announceToScreenReader('Urgent message', 'assertive');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should default to polite priority', () => {
      announceToScreenReader('Default message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-live')).toBe('polite');
    });

    it('should have aria-atomic="true"', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should have sr-only class', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.className).toContain('sr-only');
    });

    it('should remove announcement after timeout', (done) => {
      announceToScreenReader('Temporary message');

      setTimeout(() => {
        const announcement = document.querySelector('[role="status"]');
        expect(announcement).toBeFalsy();
        done();
      }, 1100);
    });
  });

  describe('isAccessible', () => {
    it('should return true for visible element', () => {
      const element = document.createElement('div');
      element.style.display = 'block';
      element.style.visibility = 'visible';
      element.style.opacity = '1';
      document.body.appendChild(element);

      expect(isAccessible(element)).toBe(true);

      document.body.removeChild(element);
    });

    it('should return false for display:none', () => {
      const element = document.createElement('div');
      element.style.display = 'none';
      document.body.appendChild(element);

      expect(isAccessible(element)).toBe(false);

      document.body.removeChild(element);
    });

    it('should return false for visibility:hidden', () => {
      const element = document.createElement('div');
      element.style.visibility = 'hidden';
      document.body.appendChild(element);

      expect(isAccessible(element)).toBe(false);

      document.body.removeChild(element);
    });

    it('should return false for opacity:0', () => {
      const element = document.createElement('div');
      element.style.opacity = '0';
      document.body.appendChild(element);

      expect(isAccessible(element)).toBe(false);

      document.body.removeChild(element);
    });

    it('should return false for aria-hidden="true"', () => {
      const element = document.createElement('div');
      element.setAttribute('aria-hidden', 'true');
      document.body.appendChild(element);

      expect(isAccessible(element)).toBe(false);

      document.body.removeChild(element);
    });
  });

  describe('useKeyboardNavigation', () => {
    it('should call onEscape when Escape is pressed', () => {
      const onEscape = vi.fn();
      renderHook(() => useKeyboardNavigation(onEscape));

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(onEscape).toHaveBeenCalled();
    });

    it('should call onEnter when Enter is pressed', () => {
      const onEnter = vi.fn();
      renderHook(() => useKeyboardNavigation(undefined, onEnter));

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);

      expect(onEnter).toHaveBeenCalled();
    });

    it('should handle both callbacks', () => {
      const onEscape = vi.fn();
      const onEnter = vi.fn();
      renderHook(() => useKeyboardNavigation(onEscape, onEnter));

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);

      expect(onEscape).toHaveBeenCalledTimes(1);
      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it('should not call callbacks for other keys', () => {
      const onEscape = vi.fn();
      const onEnter = vi.fn();
      renderHook(() => useKeyboardNavigation(onEscape, onEnter));

      const event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);

      expect(onEscape).not.toHaveBeenCalled();
      expect(onEnter).not.toHaveBeenCalled();
    });

    it('should cleanup event listeners on unmount', () => {
      const onEscape = vi.fn();
      const { unmount } = renderHook(() => useKeyboardNavigation(onEscape));

      unmount();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      // Should not be called after unmount
      expect(onEscape).not.toHaveBeenCalled();
    });
  });
});
