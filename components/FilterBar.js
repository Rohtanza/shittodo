'use client';

import { FILTER_STATUS, SORT_OPTIONS, DEFAULT_CATEGORIES } from '@/lib/constants';

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
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="filter-bar__select"
          id="priority-filter"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="filter-bar__select"
          id="category-filter"
        >
          <option value="all">All Categories</option>
          {DEFAULT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="filter-bar__select"
          id="sort-select"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
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
