'use client';

import { useEffect, useMemo, useState } from 'react';
import { PRIORITIES, DEFAULT_CATEGORIES } from '@/lib/constants';
import { LIMITS } from '@/lib/validation';
import SubtaskList from './SubtaskList';
import Select from './Select';
import DatePicker from './DatePicker';
import ConfirmDialog from './ConfirmDialog';

const CATEGORY_OPTIONS = [
  { value: '', label: 'None' },
  ...DEFAULT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
];

export default function TaskModal({ todo, onClose, onUpdate, onAddSubtask, onToggleSubtask, onDeleteSubtask }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('low');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setPriority(todo.priority);
      setCategory(todo.category || '');
      setDueDate(todo.dueDate || '');
      setNotes(todo.notes || '');
    }
  }, [todo]);

  const isDirty = useMemo(() => {
    if (!todo) return false;
    return (
      title !== todo.title ||
      priority !== todo.priority ||
      category !== (todo.category || '') ||
      dueDate !== (todo.dueDate || '') ||
      notes !== (todo.notes || '')
    );
  }, [todo, title, priority, category, dueDate, notes]);

  if (!todo) return null;

  const requestClose = () => {
    if (isDirty) {
      setConfirmDiscard(true);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onUpdate(todo.id, {
      title: trimmedTitle,
      priority,
      category,
      dueDate: dueDate || null,
      notes,
    });
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={requestClose} id="task-modal-overlay">
        <div className="modal" onClick={(e) => e.stopPropagation()} id="task-modal">
          <div className="modal__header">
            <h2 className="modal__title">Edit Task</h2>
            <button className="modal__close" onClick={requestClose} aria-label="Close modal">
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
                maxLength={LIMITS.TITLE_MAX}
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
                <Select
                  value={category}
                  onChange={setCategory}
                  options={CATEGORY_OPTIONS}
                  className="modal__select"
                  ariaLabel="Category"
                />
              </div>

              <div className="modal__field modal__field--half">
                <label className="modal__label">Due Date</label>
                <DatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  className="modal__date"
                  ariaLabel="Due date"
                />
              </div>
            </div>

            <div className="modal__field">
              <label className="modal__label">Notes</label>
              <textarea
                value={notes}
                maxLength={LIMITS.NOTES_MAX}
                onChange={(e) => setNotes(e.target.value)}
                className="modal__textarea"
                placeholder="Add notes..."
                rows={4}
                id="modal-notes-textarea"
              />
              {notes.length > LIMITS.NOTES_MAX * 0.9 && (
                <div className="modal__hint">
                  {notes.length.toLocaleString()} / {LIMITS.NOTES_MAX.toLocaleString()}
                </div>
              )}
            </div>

            <SubtaskList
              subtasks={todo.subtasks || []}
              onAdd={(t) => onAddSubtask(todo.id, t)}
              onToggle={(subtaskId) => onToggleSubtask(todo.id, subtaskId)}
              onDelete={(subtaskId) => onDeleteSubtask(todo.id, subtaskId)}
            />
          </div>

          <div className="modal__footer">
            <button className="modal__btn modal__btn--secondary" onClick={requestClose}>
              Cancel
            </button>
            <button
              className="modal__btn modal__btn--primary"
              onClick={handleSave}
              disabled={!title.trim()}
              id="modal-save-btn"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard unsaved changes?"
        message="You have unsaved changes. Close without saving?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        variant="danger"
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </>
  );
}
