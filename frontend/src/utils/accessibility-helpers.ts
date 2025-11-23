/**
 * Accessibility utility functions for the IAC platform
 */

/**
 * Manages focus trap for modal dialogs
 */
export class FocusTrap {
  private element: HTMLElement;
  private focusableElements: HTMLElement[];
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.focusableElements = this.getFocusableElements();
    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(this.element.querySelectorAll(selector)) as HTMLElement[];
  }

  activate() {
    this.element.addEventListener('keydown', this.handleKeydown);
    this.firstFocusable?.focus();
  }

  deactivate() {
    this.element.removeEventListener('keydown', this.handleKeydown);
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  };
}

/**
 * Announces message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Generates unique IDs for accessibility labels
 */
let idCounter = 0;
export const generateAccessibleId = (prefix: string = 'accessible'): string => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

/**
 * Check if element has accessible name
 */
export const hasAccessibleName = (element: HTMLElement): boolean => {
  return !!(
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent?.trim()
  );
};

/**
 * Manages skip links for keyboard navigation
 */
export const createSkipLink = (targetId: string, text: string = 'Skip to main content'): HTMLAnchorElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded';
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  return skipLink;
};

/**
 * Keyboard event helpers
 */
export const isEnterOrSpace = (event: KeyboardEvent): boolean => {
  return event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';
};

export const isEscape = (event: KeyboardEvent): boolean => {
  return event.key === 'Escape' || event.key === 'Esc';
};

export const isArrowKey = (event: KeyboardEvent): boolean => {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
};

/**
 * Manages roving tabindex for keyboard navigation
 */
export class RovingTabIndex {
  private items: HTMLElement[];
  private currentIndex: number = 0;

  constructor(items: HTMLElement[]) {
    this.items = items;
    this.setTabIndexes();
  }

  private setTabIndexes() {
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1');
    });
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.setTabIndexes();
    this.items[this.currentIndex].focus();
  }

  previous() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.setTabIndexes();
    this.items[this.currentIndex].focus();
  }

  first() {
    this.currentIndex = 0;
    this.setTabIndexes();
    this.items[this.currentIndex].focus();
  }

  last() {
    this.currentIndex = this.items.length - 1;
    this.setTabIndexes();
    this.items[this.currentIndex].focus();
  }
}

/**
 * Check for reduced motion preference
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check for high contrast mode
 */
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Get color contrast ratio (WCAG)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Simple luminance calculation (simplified for demo)
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export const meetsWCAGAA = (foreground: string, background: string, isLargeText: boolean = false): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};
