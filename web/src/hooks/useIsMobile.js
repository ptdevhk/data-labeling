import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is mobile size
 * Breakpoint: 480px (matches PROJECT.md responsive design spec)
 */
export function useIsMobile() {
  // Initialize with a function to get the correct initial value
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 480;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 480px)');

    // Listen for changes
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
