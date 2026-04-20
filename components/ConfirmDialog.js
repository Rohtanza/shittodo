'use client';

import { useEffect, useRef } from 'react';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  extraAction = null,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    confirmRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel?.();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm?.();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (prev && typeof prev.focus === 'function') {
        try { prev.focus(); } catch { /* ignore */ }
      }
    };
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-overlay" onMouseDown={onCancel} role="presentation">
      <div
        className="confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="confirm__title">{title}</h2>
        {message && <p className="confirm__message">{message}</p>}
        <div className={`confirm__actions ${extraAction ? 'confirm__actions--triple' : ''}`}>
          <button
            type="button"
            className="confirm__btn confirm__btn--secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          {extraAction && (
            <button
              type="button"
              className={`confirm__btn ${extraAction.variant === 'danger' ? 'confirm__btn--danger' : 'confirm__btn--secondary'}`}
              onClick={extraAction.onClick}
            >
              {extraAction.label}
            </button>
          )}
          <button
            ref={confirmRef}
            type="button"
            className={`confirm__btn confirm__btn--primary ${variant === 'danger' ? 'confirm__btn--danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
