export const LIMITS = {
  TITLE_MAX: 500,
  NOTES_MAX: 10_000,
  CATEGORY_MAX: 100,
  SUBTASK_TITLE_MAX: 500,
  SUBTASKS_PER_TODO_MAX: 500,
  LIST_NAME_MAX: 100,
};

const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);

export function clampString(value, max) {
  if (typeof value !== 'string') return '';
  return value.length > max ? value.slice(0, max) : value;
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}

function safeUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeSubtask(s) {
  if (!s || typeof s !== 'object') return null;
  const title = clampString(s.title, LIMITS.SUBTASK_TITLE_MAX);
  if (!title) return null;
  return {
    id: isNonEmptyString(s.id) ? s.id : safeUUID(),
    title,
    completed: Boolean(s.completed),
  };
}

export function sanitizeTodo(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const title = clampString(raw.title, LIMITS.TITLE_MAX);
  if (!title) return null;

  const priority = VALID_PRIORITIES.has(raw.priority) ? raw.priority : 'low';
  const category = clampString(raw.category, LIMITS.CATEGORY_MAX);
  const notes = clampString(raw.notes, LIMITS.NOTES_MAX);

  let dueDate = null;
  if (typeof raw.dueDate === 'string' && raw.dueDate) {
    const parsed = new Date(raw.dueDate);
    if (!Number.isNaN(parsed.getTime())) dueDate = raw.dueDate;
  }

  let createdAt;
  if (typeof raw.createdAt === 'string' && !Number.isNaN(new Date(raw.createdAt).getTime())) {
    createdAt = raw.createdAt;
  } else {
    createdAt = new Date().toISOString();
  }

  let completedAt = null;
  if (typeof raw.completedAt === 'string' && !Number.isNaN(new Date(raw.completedAt).getTime())) {
    completedAt = raw.completedAt;
  }

  const rawSubtasks = Array.isArray(raw.subtasks) ? raw.subtasks : [];
  const subtasks = rawSubtasks
    .slice(0, LIMITS.SUBTASKS_PER_TODO_MAX)
    .map(sanitizeSubtask)
    .filter(Boolean);

  return {
    id: isNonEmptyString(raw.id) ? raw.id : safeUUID(),
    title,
    completed: Boolean(raw.completed),
    priority,
    category,
    dueDate,
    notes,
    subtasks,
    listId: isNonEmptyString(raw.listId) ? raw.listId : 'all',
    order: typeof raw.order === 'number' && Number.isFinite(raw.order) ? raw.order : Date.now(),
    createdAt,
    completedAt,
  };
}

export function sanitizeTodos(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(sanitizeTodo).filter(Boolean);
}

export function sanitizeList(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = clampString(raw.name, LIMITS.LIST_NAME_MAX);
  if (!name) return null;
  return {
    id: isNonEmptyString(raw.id) ? raw.id : safeUUID(),
    name,
    icon: isNonEmptyString(raw.icon) ? raw.icon : 'folder',
    isDefault: Boolean(raw.isDefault),
  };
}

export function sanitizeLists(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(sanitizeList).filter(Boolean);
}
