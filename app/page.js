'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { useLists } from '@/hooks/useLists';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { exportJSON, importJSON, setStorageErrorHandler } from '@/lib/storage';
import Sidebar from '@/components/Sidebar';
import TodoInput from '@/components/TodoInput';
import TodoList from '@/components/TodoList';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import ProgressBar from '@/components/ProgressBar';
import StatsBar from '@/components/StatsBar';
import TaskModal from '@/components/TaskModal';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import ConfirmDialog from '@/components/ConfirmDialog';
import ImportDialog from '@/components/ImportDialog';
import { useToast } from '@/components/Toast';

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
    mergeTodos,
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
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [editingTodo, setEditingTodo] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const searchRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setStorageErrorHandler(({ op, error }) => {
      const isQuota = error && (error.name === 'QuotaExceededError' || /quota/i.test(error.message || ''));
      if (isQuota) {
        showToast({
          variant: 'error',
          message: 'Local storage is full. Changes may not be saved. Try exporting and clearing old tasks.',
          duration: 8000,
        });
      } else if (op === 'save-todos' || op === 'save-lists') {
        showToast({
          variant: 'error',
          message: 'Failed to save changes to local storage.',
          duration: 6000,
        });
      }
    });
    return () => setStorageErrorHandler(null);
  }, [showToast]);

  const filteredTodos = useMemo(
    () => getFilteredTodos(activeListId, search, statusFilter, priorityFilter, categoryFilter, sortBy),
    [getFilteredTodos, activeListId, search, statusFilter, priorityFilter, categoryFilter, sortBy]
  );

  const filteredStats = useMemo(() => {
    const total = filteredTodos.length;
    const completed = filteredTodos.filter((t) => t.completed).length;
    return { total, completed, active: total - completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [filteredTodos]);

  const handleExport = useCallback(() => {
    exportJSON(todos, lists);
    showToast({ variant: 'success', message: 'Backup exported.', duration: 2500 });
  }, [todos, lists, showToast]);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await importJSON(file);
      setPendingImport(data);
    } catch (err) {
      showToast({ variant: 'error', message: err.message || 'Import failed', duration: 5000 });
    }
  }, [showToast]);

  const handleCloseModal = useCallback(() => {
    setEditingTodo(null);
  }, []);

  const handleClearCompleted = useCallback(() => {
    setConfirmClear(true);
  }, []);

  const confirmClearCompleted = useCallback(() => {
    const count = filteredStats.completed;
    clearCompleted();
    setConfirmClear(false);
    showToast({
      variant: 'success',
      message: count === 1 ? 'Cleared 1 completed task.' : `Cleared ${count} completed tasks.`,
      duration: 2500,
    });
  }, [clearCompleted, filteredStats.completed, showToast]);

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

  const doReplaceImport = () => {
    if (!pendingImport) return;
    importTodos(pendingImport.todos);
    const { acceptedCount, rawCount } = pendingImport;
    const skipped = rawCount - acceptedCount;
    setPendingImport(null);
    showToast({
      variant: 'success',
      message: skipped > 0
        ? `Imported ${acceptedCount} tasks (${skipped} skipped as invalid).`
        : `Imported ${acceptedCount} tasks.`,
      duration: 4000,
    });
  };

  const doMergeImport = () => {
    if (!pendingImport) return;
    mergeTodos(pendingImport.todos);
    setPendingImport(null);
    showToast({
      variant: 'success',
      message: `Merged ${pendingImport.acceptedCount} tasks.`,
      duration: 3000,
    });
  };

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
          onClearCompleted={handleClearCompleted}
          completedCount={filteredStats.completed}
        />

        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={setEditingTodo}
          onReorder={reorderTodos}
        />

        <ConfettiCelebration
          activeCount={stats.active}
          total={stats.total}
        />

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

        <ImportDialog
          open={!!pendingImport}
          importedCount={pendingImport?.acceptedCount ?? 0}
          skippedCount={pendingImport ? pendingImport.rawCount - pendingImport.acceptedCount : 0}
          currentCount={stats.total}
          onReplace={doReplaceImport}
          onMerge={doMergeImport}
          onCancel={() => setPendingImport(null)}
        />

        <ConfirmDialog
          open={confirmClear}
          title="Clear completed tasks?"
          message={`This will permanently delete ${filteredStats.completed} completed task${filteredStats.completed === 1 ? '' : 's'}. This cannot be undone.`}
          confirmLabel={`Clear ${filteredStats.completed}`}
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={confirmClearCompleted}
          onCancel={() => setConfirmClear(false)}
        />
      </main>
    </div>
  );
}
