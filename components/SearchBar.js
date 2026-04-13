'use client';

import { useRef } from 'react';

export default function SearchBar({ value, onChange, inputRef: externalRef }) {
  const internalRef = useRef(null);
  const ref = externalRef || internalRef;

  return (
    <div className="search-bar" id="search-bar">
      <svg className="search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tasks..."
        className="search-bar__input"
        id="search-input"
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
