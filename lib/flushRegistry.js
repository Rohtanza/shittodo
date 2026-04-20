// Tiny module-level registry of sync flush functions.
// Used so UI affordances (e.g. the custom titlebar close button) can
// drain any pending debounced writes to localStorage before the window
// tears down, without coupling those UI pieces to specific hooks.

const flushers = new Set();

export function registerFlush(fn) {
  if (typeof fn !== 'function') return () => {};
  flushers.add(fn);
  return () => {
    flushers.delete(fn);
  };
}

export function flushAll() {
  for (const fn of flushers) {
    try {
      fn();
    } catch {
      // best-effort
    }
  }
}
