'use client';

import { useState } from 'react';

const ICONS = {
  inbox: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  ),
  today: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  week: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  folder: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
};

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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <h1 className="sidebar__logo">
            <span className="sidebar__logo-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            shittodo
          </h1>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            id="theme-toggle"
            title="Toggle theme (Ctrl+Shift+D)"
          >
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                <span className="sidebar__item-icon">{ICONS[list.icon] || ICONS.folder}</span>
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New List
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
          <div className="sidebar__shortcuts">
            <span className="shortcut-hint">Ctrl+E</span> Export
          </div>
          <div className="sidebar__shortcuts">
            <span className="shortcut-hint">Ctrl+Shift+D</span> Theme
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
