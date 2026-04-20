'use client';

import { FILTER_STATUS, SORT_OPTIONS, DEFAULT_CATEGORIES } from '@/lib/constants';
import Select from './Select';

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  ...DEFAULT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
];

export default function FilterBar({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  onClearCompleted,
  completedCount,
}) {
  return (
    <div className="filter-bar" id="filter-bar">
      <div className="filter-bar__group filter-bar__status">
        {FILTER_STATUS.map((f) => (
          <button
            key={f.value}
            className={`filter-bar__chip ${statusFilter === f.value ? 'filter-bar__chip--active' : ''}`}
            onClick={() => onStatusChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="filter-bar__group filter-bar__selects">
        <Select
          value={priorityFilter}
          onChange={onPriorityChange}
          options={PRIORITY_OPTIONS}
          className="filter-bar__select"
          id="priority-filter"
          ariaLabel="Filter by priority"
        />

        <Select
          value={categoryFilter}
          onChange={onCategoryChange}
          options={CATEGORY_OPTIONS}
          className="filter-bar__select"
          id="category-filter"
          ariaLabel="Filter by category"
        />

        <Select
          value={sortBy}
          onChange={onSortChange}
          options={SORT_OPTIONS}
          className="filter-bar__select"
          id="sort-select"
          ariaLabel="Sort"
        />
      </div>

      {completedCount > 0 && (
        <button
          className="filter-bar__clear-btn"
          onClick={onClearCompleted}
          id="clear-completed-btn"
        >
          Clear {completedCount} done
        </button>
      )}
    </div>
  );
}
