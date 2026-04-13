'use client';

import { useState } from 'react';

export default function Sidebar({
  lists,
  activeListId,
  onSelectList,
  onAddList,
  onDeleteList,
  theme,
  onToggleTheme,
  stats,
}) {
  const [newListName, setNewListName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAddList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      onAddList(newListName.trim());
      setNewListName('');
      setIsAdding(false);
    }
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
        id="sidebar-toggle"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <h1 className="sidebar__logo">
            <span className="sidebar__logo-icon">✓</span>
            ShitTodo
          </h1>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            id="theme-toggle"
            title="Ctrl+D"
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            )}
          </button>
        </div>

        <div className="sidebar__stats">
          <div className="sidebar__stat">
            <span className="sidebar__stat-number">{stats.completed}</span>
            <span className="sidebar__stat-label">Done</span>
          </div>
          <div className="sidebar__stat">
            <span className="sidebar__stat-number">{stats.active}</span>
            <span className="sidebar__stat-label">Active</span>
          </div>
          <div className="sidebar__stat">
            <span className="sidebar__stat-number">{stats.total}</span>
            <span className="sidebar__stat-label">Total</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__section-label">Lists</div>
          {lists.map((list) => (
            <div key={list.id} className="sidebar__item-wrapper">
              <button
                className={`sidebar__item ${activeListId === list.id ? 'sidebar__item--active' : ''}`}
                onClick={() => {
                  onSelectList(list.id);
                  setMobileOpen(false);
                }}
                id={`list-${list.id}`}
              >
                <span className="sidebar__item-icon">{list.icon}</span>
                <span className="sidebar__item-name">{list.name}</span>
              </button>
              {!list.isDefault && (
                <button
                  className="sidebar__item-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteList(list.id);
                  }}
                  aria-label={`Delete ${list.name}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {isAdding ? (
            <form onSubmit={handleAddList} className="sidebar__add-form">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name..."
                className="sidebar__add-input"
                autoFocus
                onBlur={() => {
                  if (!newListName.trim()) setIsAdding(false);
                }}
                id="new-list-input"
              />
            </form>
          ) : (
            <button
              className="sidebar__add-btn"
              onClick={() => setIsAdding(true)}
              id="add-list-btn"
            >
              <span>+</span> New List
            </button>
          )}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__shortcuts">
            <span className="shortcut-hint">Ctrl+N</span> New Task
          </div>
          <div className="sidebar__shortcuts">
            <span className="shortcut-hint">Ctrl+F</span> Search
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
