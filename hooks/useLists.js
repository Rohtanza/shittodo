'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadLists, saveLists } from '@/lib/storage';
import { DEFAULT_LISTS } from '@/lib/constants';

export function useLists() {
  const [customLists, setCustomLists] = useState([]);
  const [activeListId, setActiveListId] = useState('all');

  useEffect(() => {
    setCustomLists(loadLists());
  }, []);

  useEffect(() => {
    saveLists(customLists);
  }, [customLists]);

  const allLists = [...DEFAULT_LISTS, ...customLists];

  const addList = useCallback((name) => {
    const newList = {
      id: crypto.randomUUID(),
      name,
      icon: '📁',
      isDefault: false,
    };
    setCustomLists((prev) => [...prev, newList]);
    return newList;
  }, []);

  const deleteList = useCallback((id) => {
    setCustomLists((prev) => prev.filter((l) => l.id !== id));
    setActiveListId('all');
  }, []);

  const renameList = useCallback((id, name) => {
    setCustomLists((prev) =>
      prev.map((l) => (l.id === id ? { ...l, name } : l))
    );
  }, []);

  return {
    lists: allLists,
    customLists,
    activeListId,
    setActiveListId,
    addList,
    deleteList,
    renameList,
  };
}
