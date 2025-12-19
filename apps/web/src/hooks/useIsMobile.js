import { useSyncExternalStore } from 'react';

export const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current viewport is mobile size
 * Breakpoint: 768px (matches new-api design pattern)
 */
export const useIsMobile = () => {
  const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
};
