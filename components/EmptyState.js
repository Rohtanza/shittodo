'use client';

import { useState, useEffect } from 'react';
import { getRandomQuote } from '@/lib/quotes';

export default function EmptyState() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  if (!quote) return null;

  return (
    <div className="empty-state" id="empty-state">
      <div className="empty-state__icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="12" width="28" height="28" rx="4" stroke="var(--border)" strokeWidth="1.5" />
          <path d="M10 20h28" stroke="var(--border)" strokeWidth="1.5" />
          <path d="M18 28l3 3 6-6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
        </svg>
      </div>
      <p className="empty-state__title">No tasks yet</p>
      <blockquote className="empty-state__quote">
        &ldquo;{quote.text}&rdquo;
        <cite className="empty-state__author">{quote.author}</cite>
      </blockquote>
    </div>
  );
}
