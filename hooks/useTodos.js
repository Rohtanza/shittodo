'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadTodos, saveTodos } from '@/lib/storage';
import { PRIORITY_ORDER } from '@/lib/constants';

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveTodos(todos);
  }, [todos, loaded]);

  const addTodo = useCallback((todo) => {
    const newTodo = {
      id: crypto.randomUUID(),
      title: todo.title,
      completed: false,
      priority: todo.priority || 'low',
      category: todo.category || '',
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
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
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
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: [
                ...t.subtasks,
                { id: crypto.randomUUID(), title, completed: false },
              ],
            }
          : t
      )
    );
  }, []);

  const toggleSubtask = useCallback((todoId, subtaskId) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
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
              subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
            }
          : t
      )
    );
  }, []);

  const reorderTodos = useCallback((reorderedTodos) => {
    setTodos(reorderedTodos);
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }, []);

  const importTodos = useCallback((importedTodos) => {
    setTodos(importedTodos);
  }, []);

  const getFilteredTodos = useCallback(
    (activeListId, search, statusFilter, priorityFilter, categoryFilter, sortBy) => {
      let filtered = [...todos];

      // Filter by list
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfWeek = new Date(startOfDay);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

      if (activeListId === 'today') {
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          return due >= startOfDay && due < new Date(startOfDay.getTime() + 86400000);
        });
      } else if (activeListId === 'week') {
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          return due >= startOfDay && due <= endOfWeek;
        });
      } else if (activeListId !== 'all') {
        filtered = filtered.filter((t) => t.listId === activeListId);
      }

      // Search
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.notes.toLowerCase().includes(q)
        );
      }

      // Status filter
      if (statusFilter === 'active') {
        filtered = filtered.filter((t) => !t.completed);
      } else if (statusFilter === 'completed') {
        filtered = filtered.filter((t) => t.completed);
      }

      // Priority filter
      if (priorityFilter && priorityFilter !== 'all') {
        filtered = filtered.filter((t) => t.priority === priorityFilter);
      }

      // Category filter
      if (categoryFilter && categoryFilter !== 'all') {
        filtered = filtered.filter((t) => t.category === categoryFilter);
      }

      // Sort
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'dueDate':
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          case 'priority':
            return (PRIORITY_ORDER[a.priority] || 2) - (PRIORITY_ORDER[b.priority] || 2);
          case 'alpha':
            return a.title.localeCompare(b.title);
          case 'created':
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });

      return filtered;
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
    toggleTodo,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    reorderTodos,
    clearCompleted,
    importTodos,
    getFilteredTodos,
  };
}
