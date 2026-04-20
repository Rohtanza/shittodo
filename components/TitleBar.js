'use client';

import { useEffect, useState } from 'react';

export default function TitleBar() {
  const [isTauri, setIsTauri] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const inTauri = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
    setIsTauri(inTauri);
    if (!inTauri) return;

    let unlisten;
    (async () => {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      try {
        setIsMaximized(await win.isMaximized());
        unlisten = await win.onResized(async () => {
          setIsMaximized(await win.isMaximized());
        });
      } catch {
      }
    })();

    return () => {
      if (typeof unlisten === 'function') unlisten();
    };
  }, []);

  if (!isTauri) return null;

  const handleMinimize = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().minimize();
  };

  const handleToggleMaximize = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().toggleMaximize();
  };

  const handleClose = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().close();
  };

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar__brand" data-tauri-drag-region>
        <span className="titlebar__logo-dot" aria-hidden />
        <span className="titlebar__title">ShitTodo</span>
      </div>
      <div className="titlebar__spacer" data-tauri-drag-region />
      <div className="titlebar__controls">
        <button
          type="button"
          className="titlebar__btn titlebar__btn--min"
          onClick={handleMinimize}
          aria-label="Minimize"
          title="Minimize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <rect x="1" y="4.5" width="8" height="1" />
          </svg>
        </button>
        <button
          type="button"
          className="titlebar__btn titlebar__btn--max"
          onClick={handleToggleMaximize}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <rect x="2.5" y="0.5" width="7" height="7" fill="none" strokeWidth="1" stroke="currentColor" />
              <rect x="0.5" y="2.5" width="7" height="7" fill="var(--titlebar-bg)" strokeWidth="1" stroke="currentColor" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <rect x="1" y="1" width="8" height="8" fill="none" strokeWidth="1" stroke="currentColor" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className="titlebar__btn titlebar__btn--close"
          onClick={handleClose}
          aria-label="Close"
          title="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path d="M1 1L9 9M9 1L1 9" strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
