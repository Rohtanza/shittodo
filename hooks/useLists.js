'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadLists, saveLists } from '@/lib/storage';
import { DEFAULT_LISTS } from '@/lib/constants';
import { LIMITS, clampString } from '@/lib/validation';

export function useLists() {
  const [customLists, setCustomLists] = useState([]);
  const [activeListId, setActiveListId] = useState('all');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCustomLists(loadLists());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveLists(customLists);
  }, [customLists, loaded]);

  const allLists = [...DEFAULT_LISTS, ...customLists];

  const addList = useCallback((name) => {
    const clean = clampString(name, LIMITS.LIST_NAME_MAX).trim();
    if (!clean) return null;
    const newList = {
      id: crypto.randomUUID(),
      name: clean,
      icon: 'folder',
      isDefault: false,
    };
    setCustomLists((prev) => [...prev, newList]);
    return newList;
  }, []);

  const deleteList = useCallback((id) => {
    setCustomLists((prev) => prev.filter((l) => l.id !== id));
    setActiveListId((current) => (current === id ? 'all' : current));
  }, []);

  const renameList = useCallback((id, name) => {
    const clean = clampString(name, LIMITS.LIST_NAME_MAX).trim();
    if (!clean) return;
    setCustomLists((prev) =>
      prev.map((l) => (l.id === id ? { ...l, name: clean } : l))
    );
  }, []);

  const importLists = useCallback((importedLists) => {
    const cleaned = Array.isArray(importedLists)
      ? importedLists.filter((l) => l && !l.isDefault)
      : [];
    setCustomLists(cleaned);
    setActiveListId('all');
  }, []);

  const mergeLists = useCallback((importedLists) => {
    if (!Array.isArray(importedLists) || importedLists.length === 0) return;
    setCustomLists((prev) => {
      const byId = new Map(prev.map((l) => [l.id, l]));
      for (const l of importedLists) {
        if (!l || l.isDefault) continue;
        if (!byId.has(l.id)) byId.set(l.id, l);
      }
      return Array.from(byId.values());
    });
  }, []);

  return {
    lists: allLists,
    customLists,
    activeListId,
    setActiveListId,
    addList,
    deleteList,
    renameList,
    importLists,
    mergeLists,
    loaded,
  };
}
