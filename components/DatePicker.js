'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(str) {
  if (!str || typeof str !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDisplay(d) {
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildMonthGrid(viewDate) {
  const first = startOfMonth(viewDate);
  const firstDow = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DatePicker({
  value,
  onChange,
  className = '',
  id,
  ariaLabel,
  placeholder = 'Pick a date',
}) {
  const selected = useMemo(() => parseISO(value), [value]);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selected || new Date());
  const wrapperRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    setViewDate(selected || new Date());
    const onPointer = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, selected]);

  const today = useMemo(() => new Date(), []);
  const grid = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const pick = (d) => {
    onChange(toISODate(d));
    close();
  };

  const clear = () => {
    onChange('');
    close();
  };

  const displayLabel = selected ? formatDisplay(selected) : placeholder;

  return (
    <div
      ref={wrapperRef}
      className={`datepicker ${open ? 'datepicker--open' : ''}`}
    >
      <button
        type="button"
        className={`datepicker__trigger ${className}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel || 'Pick date'}
        id={id}
      >
        <span className={`datepicker__value ${selected ? '' : 'datepicker__value--placeholder'}`}>
          {displayLabel}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="datepicker__popover" role="dialog" aria-label="Calendar">
          <div className="datepicker__header">
            <button
              type="button"
              className="datepicker__nav"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="datepicker__title">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button
              type="button"
              className="datepicker__nav"
              onClick={nextMonth}
              aria-label="Next month"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="datepicker__weekdays">
            {WEEKDAYS.map((w) => (
              <div key={w} className="datepicker__weekday">{w}</div>
            ))}
          </div>

          <div className="datepicker__grid">
            {grid.map((d, i) => {
              if (!d) return <div key={`e-${i}`} className="datepicker__day datepicker__day--empty" />;
              const isToday = isSameDay(d, today);
              const isSelected = isSameDay(d, selected);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  tabIndex={-1}
                  className={[
                    'datepicker__day',
                    isToday ? 'datepicker__day--today' : '',
                    isSelected ? 'datepicker__day--selected' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => pick(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="datepicker__footer">
            <button type="button" className="datepicker__footer-btn" onClick={() => pick(today)}>
              Today
            </button>
            <button type="button" className="datepicker__footer-btn" onClick={clear}>
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
