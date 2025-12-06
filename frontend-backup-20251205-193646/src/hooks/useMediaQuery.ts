import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design with media queries
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (handle both old and new APIs)
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // @ts-ignore - Legacy API fallback
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // @ts-ignore - Legacy API fallback
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
};

/**
 * Breakpoint hooks for common screen sizes
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsLargeScreen = () => useMediaQuery('(min-width: 1440px)');

/**
 * Hook for detecting touch devices
 */
export const useIsTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
};
