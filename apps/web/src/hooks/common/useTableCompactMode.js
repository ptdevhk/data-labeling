import { useState, useEffect, useCallback } from 'react';
import { getTableCompactMode, setTableCompactMode } from '../../helpers';
import { TABLE_COMPACT_MODES_KEY } from '../../constants';

/**
 * Custom Hook: Manage table compact/adaptive mode
 * Returns [compactMode, setCompactMode].
 * Internally uses localStorage to save state and listens to storage events to keep multi-tab sync.
 */
export function useTableCompactMode(tableKey = 'global') {
  const [compactMode, setCompactModeState] = useState(() =>
    getTableCompactMode(tableKey),
  );

  const setCompactMode = useCallback(
    (value) => {
      setCompactModeState(value);
      setTableCompactMode(value, tableKey);
    },
    [tableKey],
  );

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === TABLE_COMPACT_MODES_KEY) {
        try {
          const modes = JSON.parse(e.newValue || '{}');
          setCompactModeState(!!modes[tableKey]);
        } catch {
          // ignore parse error
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [tableKey]);

  return [compactMode, setCompactMode];
}
