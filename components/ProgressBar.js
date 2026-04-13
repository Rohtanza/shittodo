'use client';

export default function ProgressBar({ completed, total }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress-bar" id="progress-bar">
      <div className="progress-bar__info">
        <span className="progress-bar__text">
          {completed} of {total} tasks done
        </span>
        <span className="progress-bar__percentage">{percentage}%</span>
      </div>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
