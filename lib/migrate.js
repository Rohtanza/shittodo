import { sanitizeTodos, sanitizeLists } from './validation';

export const CURRENT_SCHEMA_VERSION = 1;

export function migrateTodos(raw) {
  if (Array.isArray(raw)) {
    return { version: CURRENT_SCHEMA_VERSION, todos: sanitizeTodos(raw) };
  }

  if (raw && typeof raw === 'object' && Array.isArray(raw.todos)) {
    return { version: CURRENT_SCHEMA_VERSION, todos: sanitizeTodos(raw.todos) };
  }

  return { version: CURRENT_SCHEMA_VERSION, todos: [] };
}

export function migrateLists(raw) {
  if (Array.isArray(raw)) {
    return { version: CURRENT_SCHEMA_VERSION, lists: sanitizeLists(raw) };
  }

  if (raw && typeof raw === 'object' && Array.isArray(raw.lists)) {
    return { version: CURRENT_SCHEMA_VERSION, lists: sanitizeLists(raw.lists) };
  }

  return { version: CURRENT_SCHEMA_VERSION, lists: [] };
}
