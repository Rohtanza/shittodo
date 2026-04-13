'use client';

import { useState } from 'react';

export default function SubtaskList({ subtasks, onAdd, onToggle, onDelete }) {
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAdd(newTitle.trim());
      setNewTitle('');
    }
  };

  return (
    <div className="subtask-list">
      <div className="subtask-list__header">
        <span className="subtask-list__label">Subtasks</span>
        {subtasks.length > 0 && (
          <span className="subtask-list__count">
            {subtasks.filter((s) => s.completed).length}/{subtasks.length}
          </span>
        )}
      </div>

      <div className="subtask-list__items">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="subtask-item">
            <button
              className={`subtask-item__checkbox ${subtask.completed ? 'subtask-item__checkbox--checked' : ''}`}
              onClick={() => onToggle(subtask.id)}
            >
              {subtask.completed && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className={`subtask-item__title ${subtask.completed ? 'subtask-item__title--done' : ''}`}>
              {subtask.title}
            </span>
            <button
              className="subtask-item__delete"
              onClick={() => onDelete(subtask.id)}
              aria-label="Delete subtask"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="subtask-list__add">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add subtask..."
          className="subtask-list__input"
        />
      </form>
    </div>
  );
}
