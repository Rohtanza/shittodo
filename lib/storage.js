import { CURRENT_SCHEMA_VERSION, migrateTodos, migrateLists } from './migrate';
import { sanitizeTodos, sanitizeLists } from './validation';

const TODOS_KEY = 'shittodo_todos';
const LISTS_KEY = 'shittodo_lists';
const THEME_KEY = 'shittodo_theme';

let storageErrorHandler = null;

export function setStorageErrorHandler(fn) {
  storageErrorHandler = typeof fn === 'function' ? fn : null;
}

function reportStorageError(op, err) {
  console.error(`[storage] ${op} failed:`, err);
  if (storageErrorHandler) {
    try {
      storageErrorHandler({ op, error: err });
    } catch (handlerErr) {
      console.error('[storage] error handler threw:', handlerErr);
    }
  }
}

function parseJSON(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadTodos() {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = parseJSON(localStorage.getItem(TODOS_KEY));
    const { version, todos } = migrateTodos(parsed);
    if (!parsed || parsed.version !== version) {
      try {
        localStorage.setItem(
          TODOS_KEY,
          JSON.stringify({ version, todos })
        );
      } catch (e) {
        reportStorageError('migrate-todos', e);
      }
    }
    return todos;
  } catch (e) {
    reportStorageError('load-todos', e);
    return [];
  }
}

export function saveTodos(todos) {
  if (typeof window === 'undefined') return { ok: true };
  try {
    const payload = JSON.stringify({
      version: CURRENT_SCHEMA_VERSION,
      todos: sanitizeTodos(todos),
    });
    localStorage.setItem(TODOS_KEY, payload);
    return { ok: true };
  } catch (e) {
    reportStorageError('save-todos', e);
    return { ok: false, error: e };
  }
}

export function loadLists() {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = parseJSON(localStorage.getItem(LISTS_KEY));
    const { version, lists } = migrateLists(parsed);
    if (!parsed || parsed.version !== version) {
      try {
        localStorage.setItem(
          LISTS_KEY,
          JSON.stringify({ version, lists })
        );
      } catch (e) {
        reportStorageError('migrate-lists', e);
      }
    }
    return lists;
  } catch (e) {
    reportStorageError('load-lists', e);
    return [];
  }
}

export function saveLists(lists) {
  if (typeof window === 'undefined') return { ok: true };
  try {
    const payload = JSON.stringify({
      version: CURRENT_SCHEMA_VERSION,
      lists: sanitizeLists(lists),
    });
    localStorage.setItem(LISTS_KEY, payload);
    return { ok: true };
  } catch (e) {
    reportStorageError('save-lists', e);
    return { ok: false, error: e };
  }
}

export function loadTheme() {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function saveTheme(theme) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    reportStorageError('save-theme', e);
  }
}

export function exportJSON(todos, lists) {
  const data = JSON.stringify(
    {
      version: CURRENT_SCHEMA_VERSION,
      todos,
      lists,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shittodo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 25 * 1024 * 1024) {
      reject(new Error('Backup file is too large (>25MB)'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== 'object' || !Array.isArray(data.todos)) {
          reject(new Error('Invalid backup: missing todos array'));
          return;
        }
        const sanitizedTodos = sanitizeTodos(data.todos);
        const sanitizedLists = Array.isArray(data.lists) ? sanitizeLists(data.lists) : [];
        resolve({
          todos: sanitizedTodos,
          lists: sanitizedLists,
          rawCount: data.todos.length,
          acceptedCount: sanitizedTodos.length,
        });
      } catch {
        reject(new Error('Failed to parse backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
