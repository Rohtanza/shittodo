'use client';

import { useCallback, useRef } from 'react';

export function useBlobSync() {
  const debounceTimer = useRef(null);
  const isSyncing = useRef(false);

  // Load from cloud
  const loadFromCloud = useCallback(async () => {
    try {
      const res = await fetch('/api/blob');
      if (!res.ok) return null;
      const data = await res.json();
      if (data.todos && data.todos.length > 0) {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Save to cloud (debounced — waits 2s after last change)
  const saveToCloud = useCallback((todos, customLists) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (isSyncing.current) return;
      isSyncing.current = true;

      try {
        await fetch('/api/blob', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            todos,
            lists: customLists,
            savedAt: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Cloud sync failed:', err);
      } finally {
        isSyncing.current = false;
      }
    }, 2000);
  }, []);

  return { loadFromCloud, saveToCloud };
}
