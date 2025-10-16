import { useState, useEffect } from 'react';

/**
 * Hook to manage sidebar collapsed state
 * Syncs state with body class for CSS variable control
 */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    // Check localStorage for persisted state
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    // Apply body class for CSS variables
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }

    // Persist state
    localStorage.setItem('sidebar-collapsed', collapsed.toString());
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  return { collapsed, toggleCollapsed, setCollapsed };
}
