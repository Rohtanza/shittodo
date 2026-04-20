'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { loadTodos, saveTodos } from '@/lib/storage';
import { PRIORITY_ORDER } from '@/lib/constants';
import { LIMITS, clampString } from '@/lib/validation';
import { registerFlush } from '@/lib/flushRegistry';

const SAVE_DEBOUNCE_MS = 200;

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);
  const pendingTodos = useRef(null);

  useEffect(() => {
    setTodos(loadTodos());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    pendingTodos.current = todos;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (pendingTodos.current) saveTodos(pendingTodos.current);
      saveTimer.current = null;
    }, SAVE_DEBOUNCE_MS);
  }, [todos, loaded]);

  useEffect(() => {
    const flush = () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      if (pendingTodos.current) saveTodos(pendingTodos.current);
    };
    window.addEventListener('beforeunload', flush);
    window.addEventListener('pagehide', flush);
    // The titlebar close button (and any future "quit" UI) calls flushAll()
    // synchronously before closing, so unsaved typing survives a window close
    // even when beforeunload/pagehide don't fire reliably (e.g. Tauri).
    const unregister = registerFlush(flush);

    return () => {
      flush();
      window.removeEventListener('beforeunload', flush);
      window.removeEventListener('pagehide', flush);
      unregister();
    };
  }, []);

  const addTodo = useCallback((todo) => {
    const title = clampString(todo.title, LIMITS.TITLE_MAX);
    if (!title) return null;
    const newTodo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority: todo.priority || 'low',
      category: clampString(todo.category, LIMITS.CATEGORY_MAX),
      dueDate: todo.dueDate || null,
      notes: '',
      subtasks: [],
      listId: todo.listId || 'all',
      order: Date.now(),
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    setTodos((prev) => [newTodo, ...prev]);
    return newTodo;
  }, []);

  const updateTodo = useCallback((id, updates) => {
    const bounded = { ...updates };
    if (typeof bounded.title === 'string') bounded.title = clampString(bounded.title, LIMITS.TITLE_MAX);
    if (typeof bounded.notes === 'string') bounded.notes = clampString(bounded.notes, LIMITS.NOTES_MAX);
    if (typeof bounded.category === 'string') bounded.category = clampString(bounded.category, LIMITS.CATEGORY_MAX);
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...bounded } : t)));
  }, []);

  const deleteTodo = useCallback((id) => {
    let snapshot = null;
    setTodos((prev) => {
      const index = prev.findIndex((t) => t.id === id);
      if (index === -1) return prev;
      snapshot = { todo: prev[index], index };
      const next = prev.slice();
      next.splice(index, 1);
      return next;
    });
    return snapshot;
  }, []);

  const restoreTodo = useCallback((todo, index) => {
    if (!todo) return;
    setTodos((prev) => {
      if (prev.some((t) => t.id === todo.id)) return prev;
      const insertAt =
        typeof index === 'number' ? Math.max(0, Math.min(index, prev.length)) : 0;
      const next = prev.slice();
      next.splice(insertAt, 0, todo);
      return next;
    });
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : null,
            }
          : t
      )
    );
  }, []);

  const addSubtask = useCallback((todoId, title) => {
    const clean = clampString(title, LIMITS.SUBTASK_TITLE_MAX);
    if (!clean) return;
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== todoId) return t;
        const existing = t.subtasks || [];
        if (existing.length >= LIMITS.SUBTASKS_PER_TODO_MAX) return t;
        return {
          ...t,
          subtasks: [
            ...existing,
            { id: crypto.randomUUID(), title: clean, completed: false },
          ],
        };
      })
    );
  }, []);

  const toggleSubtask = useCallback((todoId, subtaskId) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: (t.subtasks || []).map((s) =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              ),
            }
          : t
      )
    );
  }, []);

  const deleteSubtask = useCallback((todoId, subtaskId) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
            }
          : t
      )
    );
  }, []);

  // Receives the new order of IDs for the *visible* subset and splices them
  // into the full todos array while preserving the position of any todo that
  // is currently hidden by search/filter/list. Passing the already-filtered
  // list directly into setTodos would delete everything not visible.
  const reorderTodos = useCallback((visibleIdsInNewOrder) => {
    if (!Array.isArray(visibleIdsInNewOrder) || visibleIdsInNewOrder.length === 0) return;
    setTodos((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]));
      const visibleSet = new Set(visibleIdsInNewOrder);
      for (const id of visibleIdsInNewOrder) {
        if (!byId.has(id)) return prev;
      }
      const result = new Array(prev.length);
      let cursor = 0;
      for (let i = 0; i < prev.length; i++) {
        if (visibleSet.has(prev[i].id)) {
          const nextId = visibleIdsInNewOrder[cursor++];
          result[i] = byId.get(nextId);
        } else {
          result[i] = prev[i];
        }
      }
      return result;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }, []);

  const importTodos = useCallback((importedTodos) => {
    setTodos(importedTodos);
  }, []);

  const reassignListTodos = useCallback((fromListId, toListId = 'all') => {
    setTodos((prev) =>
      prev.map((t) => (t.listId === fromListId ? { ...t, listId: toListId } : t))
    );
  }, []);

  const deleteTodosInList = useCallback((listId) => {
    setTodos((prev) => prev.filter((t) => t.listId !== listId));
  }, []);

  const mergeTodos = useCallback((importedTodos) => {
    setTodos((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]));
      for (const t of importedTodos) {
        if (!byId.has(t.id)) byId.set(t.id, t);
      }
      return Array.from(byId.values());
    });
  }, []);

  const getFilteredTodos = useCallback(
    (activeListId, search, statusFilter, priorityFilter, categoryFilter, sortBy) => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = startOfDay.getTime() + 86400000;
      const endOfWeek = new Date(startOfDay);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

      const q = search ? search.toLowerCase() : '';

      const filtered = [];
      for (const t of todos) {
        if (activeListId === 'today') {
          if (!t.dueDate) continue;
          const due = new Date(t.dueDate).getTime();
          if (due < startOfDay.getTime() || due >= endOfDay) continue;
        } else if (activeListId === 'week') {
          if (!t.dueDate) continue;
          const due = new Date(t.dueDate).getTime();
          if (due < startOfDay.getTime() || due > endOfWeek.getTime()) continue;
        } else if (activeListId !== 'all') {
          if (t.listId !== activeListId) continue;
        }

        if (q) {
          const title = t.title ? t.title.toLowerCase() : '';
          const notes = t.notes ? t.notes.toLowerCase() : '';
          if (!title.includes(q) && !notes.includes(q)) continue;
        }

        if (statusFilter === 'active' && t.completed) continue;
        if (statusFilter === 'completed' && !t.completed) continue;

        if (priorityFilter && priorityFilter !== 'all' && t.priority !== priorityFilter) continue;
        if (categoryFilter && categoryFilter !== 'all' && t.category !== categoryFilter) continue;

        filtered.push(t);
      }

      const keyed = filtered.map((t) => ({
        todo: t,
        dueKey: t.dueDate ? new Date(t.dueDate).getTime() : null,
        createdKey: t.createdAt ? new Date(t.createdAt).getTime() : 0,
        priorityKey: PRIORITY_ORDER[t.priority] ?? 2,
        titleKey: t.title || '',
      }));

      keyed.sort((a, b) => {
        switch (sortBy) {
          case 'dueDate':
            if (a.dueKey === null && b.dueKey === null) return 0;
            if (a.dueKey === null) return 1;
            if (b.dueKey === null) return -1;
            return a.dueKey - b.dueKey;
          case 'priority':
            return a.priorityKey - b.priorityKey;
          case 'alpha':
            return a.titleKey.localeCompare(b.titleKey);
          case 'created':
          default:
            return b.createdKey - a.createdKey;
        }
      });

      return keyed.map((k) => k.todo);
    },
    [todos]
  );

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, percentage };
  }, [todos]);

  return {
    todos,
    loaded,
    stats,
    addTodo,
    updateTodo,
    deleteTodo,
    restoreTodo,
    toggleTodo,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    reorderTodos,
    reassignListTodos,
    deleteTodosInList,
    clearCompleted,
    importTodos,
    mergeTodos,
    getFilteredTodos,
  };
}
