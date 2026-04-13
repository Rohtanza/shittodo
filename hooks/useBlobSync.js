'use client';

import { useCallback, useRef, useState } from 'react';

export function useBlobSync() {
  const debounceTimer = useRef(null);
  const isSyncing = useRef(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  // Load from cloud
  const loadFromCloud = useCallback(async () => {
    try {
      const res = await fetch('/api/blob');
      if (!res.ok) {
        console.error('Cloud load failed:', res.status, await res.text());
        return null;
      }
      const data = await res.json();
      if (data.todos && data.todos.length > 0) {
        return data;
      }
      return null;
    } catch (err) {
      console.error('Cloud load error:', err);
      return null;
    }
  }, []);

  // Save to cloud (debounced — waits 1.5s after last change)
  const saveToCloud = useCallback((todos, customLists) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setSyncStatus('saving');

    debounceTimer.current = setTimeout(async () => {
      if (isSyncing.current) return;
      isSyncing.current = true;

      try {
        const res = await fetch('/api/blob', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            todos,
            lists: customLists,
            savedAt: new Date().toISOString(),
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error('Cloud save failed:', res.status, text);
          setSyncStatus('error');
        } else {
          setSyncStatus('saved');
          // Reset to idle after 2s
          setTimeout(() => setSyncStatus('idle'), 2000);
        }
      } catch (err) {
        console.error('Cloud save error:', err);
        setSyncStatus('error');
      } finally {
        isSyncing.current = false;
      }
    }, 1500);
  }, []);

  return { loadFromCloud, saveToCloud, syncStatus };
}
