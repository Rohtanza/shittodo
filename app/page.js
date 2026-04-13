'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { useLists } from '@/hooks/useLists';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useBlobSync } from '@/hooks/useBlobSync';
import { exportJSON, importJSON } from '@/lib/storage';
import Sidebar from '@/components/Sidebar';
import TodoInput from '@/components/TodoInput';
import TodoList from '@/components/TodoList';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import ProgressBar from '@/components/ProgressBar';
import StatsBar from '@/components/StatsBar';
import TaskModal from '@/components/TaskModal';
import ConfettiCelebration from '@/components/ConfettiCelebration';

export default function Home() {
  const {
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
  } = useTodos();

  const {
    lists,
    activeListId,
    setActiveListId,
    addList,
    deleteList,
  } = useLists();

  const { theme, toggleTheme, mounted } = useTheme();
  const { loadFromCloud, saveToCloud, syncStatus } = useBlobSync();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [editingTodo, setEditingTodo] = useState(null);
  const [cloudLoaded, setCloudLoaded] = useState(false);

  const todoInputRef = useRef(null);
  const searchRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load from cloud on startup — always prefer cloud data if it exists
  useEffect(() => {
    if (!loaded) return;
    loadFromCloud().then((cloudData) => {
      if (cloudData && cloudData.todos && cloudData.todos.length > 0) {
        importTodos(cloudData.todos);
      }
      setCloudLoaded(true);
    });
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync to cloud on every change
  useEffect(() => {
    if (!cloudLoaded) return;
    saveToCloud(todos, lists);
  }, [todos, lists, cloudLoaded, saveToCloud]);

  const filteredTodos = useMemo(
    () => getFilteredTodos(activeListId, search, statusFilter, priorityFilter, categoryFilter, sortBy),
    [getFilteredTodos, activeListId, search, statusFilter, priorityFilter, categoryFilter, sortBy]
  );

  const filteredStats = useMemo(() => {
    const total = filteredTodos.length;
    const completed = filteredTodos.filter((t) => t.completed).length;
    return { total, completed, active: total - completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [filteredTodos]);

  const allDone = filteredTodos.length > 0 && filteredTodos.every((t) => t.completed);

  const handleExport = useCallback(() => {
    exportJSON(todos, lists);
  }, [todos, lists]);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importJSON(file);
      importTodos(data.todos);
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  }, [importTodos]);

  const handleCloseModal = useCallback(() => {
    setEditingTodo(null);
  }, []);

  useKeyboardShortcuts({
    onNewTask: () => {
      document.getElementById('todo-input-field')?.focus();
    },
    onSearch: () => {
      searchRef.current?.focus();
    },
    onCloseModal: handleCloseModal,
    onExport: handleExport,
    onToggleTheme: toggleTheme,
  });

  const activeList = lists.find((l) => l.id === activeListId);

  if (!mounted || !loaded) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        lists={lists}
        activeListId={activeListId}
        onSelectList={setActiveListId}
        onAddList={addList}
        onDeleteList={deleteList}
        theme={theme}
        onToggleTheme={toggleTheme}
        stats={stats}
      />

      <main className="main">
        <div className="main__header">
          <div className="main__title-row">
            <h2 className="main__title">
              {activeList?.name || 'All Tasks'}
              <span className={`sync-dot sync-dot--${syncStatus}`} title={
                syncStatus === 'saving' ? 'Syncing...' :
                syncStatus === 'saved' ? 'Synced to cloud' :
                syncStatus === 'error' ? 'Sync failed — check console' : ''
              } />
            </h2>
            <StatsBar stats={filteredStats} />
          </div>

          <div className="main__toolbar">
            <SearchBar value={search} onChange={setSearch} inputRef={searchRef} />
            <div className="main__actions">
              <button className="main__action-btn" onClick={handleExport} title="Export (Ctrl+E)" id="export-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="main__action-btn" onClick={() => fileInputRef.current?.click()} title="Import" id="import-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
                id="import-file-input"
              />
            </div>
          </div>
        </div>

        <ProgressBar completed={filteredStats.completed} total={filteredStats.total} />

        <TodoInput onAdd={addTodo} activeListId={activeListId} />

        <FilterBar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearCompleted={clearCompleted}
          completedCount={filteredStats.completed}
        />

        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={setEditingTodo}
          onReorder={reorderTodos}
        />

        <ConfettiCelebration trigger={allDone} />

        {editingTodo && (
          <TaskModal
            todo={editingTodo}
            onClose={handleCloseModal}
            onUpdate={(id, updates) => {
              updateTodo(id, updates);
              setEditingTodo((prev) => (prev ? { ...prev, ...updates } : null));
            }}
            onAddSubtask={(todoId, title) => {
              addSubtask(todoId, title);
              // Refresh editing todo from state
              setEditingTodo((prev) => {
                if (!prev || prev.id !== todoId) return prev;
                return {
                  ...prev,
                  subtasks: [
                    ...prev.subtasks,
                    { id: crypto.randomUUID(), title, completed: false },
                  ],
                };
              });
            }}
            onToggleSubtask={(todoId, subtaskId) => {
              toggleSubtask(todoId, subtaskId);
              setEditingTodo((prev) => {
                if (!prev || prev.id !== todoId) return prev;
                return {
                  ...prev,
                  subtasks: prev.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                  ),
                };
              });
            }}
            onDeleteSubtask={(todoId, subtaskId) => {
              deleteSubtask(todoId, subtaskId);
              setEditingTodo((prev) => {
                if (!prev || prev.id !== todoId) return prev;
                return {
                  ...prev,
                  subtasks: prev.subtasks.filter((s) => s.id !== subtaskId),
                };
              });
            }}
          />
        )}
      </main>
    </div>
  );
}
