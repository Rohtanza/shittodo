'use client';

import { useState } from 'react';
import { PRIORITIES } from '@/lib/constants';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const subtasksDone = todo.subtasks?.filter((s) => s.completed).length || 0;
  const subtasksTotal = todo.subtasks?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item ${todo.completed ? 'todo-item--completed' : ''} ${isDragging ? 'todo-item--dragging' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`todo-${todo.id}`}
    >
      <button className="todo-item__drag" {...attributes} {...listeners} aria-label="Drag to reorder">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </button>

      <button
        className={`todo-item__checkbox ${todo.completed ? 'todo-item__checkbox--checked' : ''}`}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
        style={{ '--check-color': PRIORITIES[todo.priority]?.color }}
      >
        {todo.completed && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="todo-item__content" onClick={() => onEdit(todo)}>
        <div className="todo-item__title-row">
          <span className={`todo-item__title ${todo.completed ? 'todo-item__title--done' : ''}`}>
            {todo.title}
          </span>
        </div>

        <div className="todo-item__meta">
          {todo.priority && todo.priority !== 'low' && (
            <span
              className="todo-item__tag todo-item__tag--priority"
              style={{ '--tag-color': PRIORITIES[todo.priority]?.color }}
            >
              {PRIORITIES[todo.priority]?.label}
            </span>
          )}
          {todo.category && (
            <span className="todo-item__tag todo-item__tag--category">
              {todo.category}
            </span>
          )}
          {todo.dueDate && (
            <span className={`todo-item__tag todo-item__tag--date ${isOverdue ? 'todo-item__tag--overdue' : ''}`}>
              {formatDate(todo.dueDate)}
            </span>
          )}
          {subtasksTotal > 0 && (
            <span className="todo-item__tag todo-item__tag--subtasks">
              ✓ {subtasksDone}/{subtasksTotal}
            </span>
          )}
          {todo.notes && (
            <span className="todo-item__tag todo-item__tag--notes">
              📝
            </span>
          )}
        </div>
      </div>

      <button
        className={`todo-item__delete ${isHovered ? 'todo-item__delete--visible' : ''}`}
        onClick={() => onDelete(todo.id)}
        aria-label="Delete task"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
