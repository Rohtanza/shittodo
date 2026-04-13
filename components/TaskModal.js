'use client';

import { useState, useEffect } from 'react';
import { PRIORITIES, DEFAULT_CATEGORIES } from '@/lib/constants';
import SubtaskList from './SubtaskList';

export default function TaskModal({ todo, onClose, onUpdate, onAddSubtask, onToggleSubtask, onDeleteSubtask }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('low');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setPriority(todo.priority);
      setCategory(todo.category || '');
      setDueDate(todo.dueDate || '');
      setNotes(todo.notes || '');
    }
  }, [todo]);

  if (!todo) return null;

  const handleSave = () => {
    onUpdate(todo.id, {
      title,
      priority,
      category,
      dueDate: dueDate || null,
      notes,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="task-modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()} id="task-modal">
        <div className="modal__header">
          <h2 className="modal__title">Edit Task</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal__body">
          <div className="modal__field">
            <label className="modal__label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="modal__input"
              id="modal-title-input"
            />
          </div>

          <div className="modal__field">
            <label className="modal__label">Priority</label>
            <div className="modal__priority-btns">
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

          <div className="modal__row">
            <div className="modal__field modal__field--half">
              <label className="modal__label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="modal__select"
              >
                <option value="">None</option>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="modal__field modal__field--half">
              <label className="modal__label">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="modal__date"
              />
            </div>
          </div>

          <div className="modal__field">
            <label className="modal__label">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="modal__textarea"
              placeholder="Add notes..."
              rows={4}
              id="modal-notes-textarea"
            />
          </div>

          <SubtaskList
            subtasks={todo.subtasks || []}
            onAdd={(title) => onAddSubtask(todo.id, title)}
            onToggle={(subtaskId) => onToggleSubtask(todo.id, subtaskId)}
            onDelete={(subtaskId) => onDeleteSubtask(todo.id, subtaskId)}
          />
        </div>

        <div className="modal__footer">
          <button className="modal__btn modal__btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="modal__btn modal__btn--primary" onClick={handleSave} id="modal-save-btn">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
