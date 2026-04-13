'use client';

import { useState, useRef } from 'react';
import { DEFAULT_CATEGORIES, PRIORITIES } from '@/lib/constants';

export default function TodoInput({ onAdd, activeListId }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('low');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      priority,
      category,
      dueDate: dueDate || null,
      listId: activeListId !== 'all' && activeListId !== 'today' && activeListId !== 'week'
        ? activeListId
        : 'all',
    });

    setTitle('');
    setPriority('low');
    setCategory('');
    setDueDate('');
    setShowOptions(false);
    inputRef.current?.focus();
  };

  return (
    <form className="todo-input" onSubmit={handleSubmit} id="todo-input-form">
      <div className="todo-input__main">
        <div className={`todo-input__priority-dot todo-input__priority-dot--${priority}`} />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="todo-input__field"
          id="todo-input-field"
        />
        <button
          type="button"
          className={`todo-input__options-toggle ${showOptions ? 'todo-input__options-toggle--active' : ''}`}
          onClick={() => setShowOptions(!showOptions)}
          aria-label="Task options"
          id="todo-options-toggle"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
        <button type="submit" className="todo-input__submit" disabled={!title.trim()} id="todo-submit-btn">
          Add
        </button>
      </div>

      {showOptions && (
        <div className="todo-input__options">
          <div className="todo-input__option-group">
            <label className="todo-input__label">Priority</label>
            <div className="todo-input__priority-btns">
              {Object.entries(PRIORITIES).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  className={`todo-input__priority-btn ${priority === key ? 'todo-input__priority-btn--active' : ''}`}
                  onClick={() => setPriority(key)}
                  style={{ '--btn-color': val.color }}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div className="todo-input__option-group">
            <label className="todo-input__label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="todo-input__select"
              id="todo-category-select"
            >
              <option value="">None</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="todo-input__option-group">
            <label className="todo-input__label">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="todo-input__date"
              id="todo-date-input"
            />
          </div>
        </div>
      )}
    </form>
  );
}
