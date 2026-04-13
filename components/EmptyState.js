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
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="16" width="40" height="36" rx="4" stroke="var(--border)" strokeWidth="1.5" fill="none"/>
          <path d="M12 24h40" stroke="var(--border)" strokeWidth="1.5"/>
          <circle cx="20" cy="20" r="1.5" fill="var(--priority-high)" opacity="0.5"/>
          <circle cx="26" cy="20" r="1.5" fill="var(--priority-medium)" opacity="0.5"/>
          <circle cx="32" cy="20" r="1.5" fill="var(--priority-low)" opacity="0.5"/>
          <path d="M22 34l4 4 8-8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
        </svg>
      </div>
      <p className="empty-state__title">No tasks here yet</p>
      <blockquote className="empty-state__quote">
        &ldquo;{quote.text}&rdquo;
        <cite className="empty-state__author">&mdash; {quote.author}</cite>
      </blockquote>
    </div>
  );
}
