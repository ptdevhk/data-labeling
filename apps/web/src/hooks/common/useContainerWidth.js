import { useState, useEffect, useRef } from 'react';

/**
 * Hook for detecting container width
 * @returns {[ref, width]} Container reference and current width
 */
export const useContainerWidth = () => {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: newWidth } = entry.contentRect;
        setWidth(newWidth);
      }
    });

    resizeObserver.observe(element);

    // Initialize width
    setWidth(element.getBoundingClientRect().width);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [ref, width];
};
