'use client';

import { useEffect, useRef } from 'react';

export default function ImportDialog({
  open,
  importedCount,
  skippedCount,
  currentCount,
  onReplace,
  onMerge,
  onCancel,
}) {
  const mergeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    mergeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel?.();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-overlay" onMouseDown={onCancel} role="presentation">
      <div
        className="confirm confirm--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="import-title" className="confirm__title">Import backup</h2>
        <p className="confirm__message">
          This backup contains <strong>{importedCount}</strong> task{importedCount === 1 ? '' : 's'}
          {skippedCount > 0 && ` (${skippedCount} skipped as invalid)`}.
          Your current list has <strong>{currentCount}</strong>.
        </p>
        <p className="confirm__message confirm__message--muted">
          <strong>Merge</strong> keeps your current tasks and adds any new ones.
          <strong> Replace</strong> wipes your current tasks and installs the backup.
        </p>
        <div className="confirm__actions confirm__actions--triple">
          <button
            type="button"
            className="confirm__btn confirm__btn--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="confirm__btn confirm__btn--danger"
            onClick={onReplace}
          >
            Replace all
          </button>
          <button
            ref={mergeRef}
            type="button"
            className="confirm__btn confirm__btn--primary"
            onClick={onMerge}
          >
            Merge
          </button>
        </div>
      </div>
    </div>
  );
}
