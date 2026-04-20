'use client';

import { useState, useRef } from 'react';
import { DEFAULT_CATEGORIES, PRIORITIES } from '@/lib/constants';
import { LIMITS } from '@/lib/validation';
import Select from './Select';
import DatePicker from './DatePicker';

const CATEGORY_OPTIONS = [
  { value: '', label: 'None' },
  ...DEFAULT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
];

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
          maxLength={LIMITS.TITLE_MAX}
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
            <Select
              value={category}
              onChange={setCategory}
              options={CATEGORY_OPTIONS}
              className="todo-input__select"
              id="todo-category-select"
              ariaLabel="Category"
            />
          </div>

          <div className="todo-input__option-group">
            <label className="todo-input__label">Due Date</label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              className="todo-input__date"
              id="todo-date-input"
              ariaLabel="Due date"
            />
          </div>
        </div>
      )}
    </form>
  );
}
