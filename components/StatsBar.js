'use client';

export default function StatsBar({ stats }) {
  return (
    <div className="stats-bar" id="stats-bar">
      <div className="stats-bar__ring">
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke="var(--border)"
            strokeWidth="3"
          />
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeDasharray={`${stats.percentage * 0.94} 94`}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
            className="stats-bar__ring-fill"
          />
        </svg>
        <span className="stats-bar__ring-text">{stats.percentage}%</span>
      </div>
      <div className="stats-bar__info">
        <span className="stats-bar__completed">
          {stats.completed} of {stats.total} completed
        </span>
      </div>
    </div>
  );
}
