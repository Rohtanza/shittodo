'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function Select({
  value,
  onChange,
  options,
  className = '',
  id,
  ariaLabel,
  placeholder = 'Select…',
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected ? selected.label : placeholder;

  const close = useCallback(() => {
    setOpen(false);
    setActiveIdx(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        close();
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % options.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + options.length) % options.length);
      } else if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault();
        onChange(options[activeIdx].value);
        close();
      }
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [open, activeIdx, options, onChange, close]);

  useEffect(() => {
    if (!open || activeIdx < 0 || !menuRef.current) return;
    const el = menuRef.current.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, open]);

  const toggle = () => {
    if (open) {
      close();
    } else {
      const idx = options.findIndex((o) => o.value === value);
      setActiveIdx(idx >= 0 ? idx : 0);
      setOpen(true);
    }
  };

  const selectOption = (optValue) => {
    onChange(optValue);
    close();
  };

  return (
    <div
      className={`select ${open ? 'select--open' : ''}`}
      ref={wrapperRef}
    >
      <button
        type="button"
        className={`select__trigger ${className}`}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        id={id}
      >
        <span className="select__value">{displayLabel}</span>
        <svg
          className="select__chevron"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="select__menu" role="listbox" ref={menuRef}>
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isActive = i === activeIdx;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                data-idx={i}
                className={`select__option ${isSelected ? 'select__option--selected' : ''} ${isActive ? 'select__option--active' : ''}`}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => selectOption(opt.value)}
              >
                <span className="select__option-label">{opt.label}</span>
                {isSelected && (
                  <svg
                    className="select__option-check"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    aria-hidden
                  >
                    <path
                      d="M2.5 6.5L5 9L9.5 3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
