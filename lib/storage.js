const TODOS_KEY = 'shittodo_todos';
const LISTS_KEY = 'shittodo_lists';
const THEME_KEY = 'shittodo_theme';

export function loadTodos() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TODOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error('Failed to save todos:', e);
  }
}

export function loadLists() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LISTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLists(lists) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  } catch (e) {
    console.error('Failed to save lists:', e);
  }
}

export function loadTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
}

export function exportJSON(todos, lists) {
  const data = JSON.stringify({ todos, lists, exportedAt: new Date().toISOString() }, null, 2);
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
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.todos && Array.isArray(data.todos)) {
          resolve(data);
        } else {
          reject(new Error('Invalid backup file format'));
        }
      } catch {
        reject(new Error('Failed to parse backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
