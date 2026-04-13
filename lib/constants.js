export const PRIORITIES = {
  low: { label: 'Low', color: 'var(--priority-low)' },
  medium: { label: 'Medium', color: 'var(--priority-medium)' },
  high: { label: 'High', color: 'var(--priority-high)' },
};

export const DEFAULT_CATEGORIES = [
  'Work',
  'Personal',
  'Uni',
  'Health',
  'Other',
];

export const DEFAULT_LISTS = [
  { id: 'all', name: 'All Tasks', icon: 'inbox', isDefault: true },
  { id: 'today', name: 'Today', icon: 'today', isDefault: true },
  { id: 'week', name: 'This Week', icon: 'week', isDefault: true },
];

export const SORT_OPTIONS = [
  { value: 'created', label: 'Date Added' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'alpha', label: 'Alphabetical' },
];

export const FILTER_STATUS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Done' },
];

export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
