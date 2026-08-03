const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

const getDuration = (task) => Number(task.duration) || 0;

export default function LiveClass({
  tasks,
  activeTask,
  activeIndex,
  elapsedTime,
  totalDuration,
  isRunning,
  isComplete,
  transitionTask,
  onPause,
  onResume,
  onReset,
  onPrevious,
  onNext,
  onExit,
}) {
  const startOffset = tasks
    .slice(0, Math.max(activeIndex, 0))
    .reduce((sum, task) => sum + getDuration(task) * 60, 0);
  const blockRemaining = activeTask
    ? Math.max(0, startOffset + getDuration(activeTask) * 60 - elapsedTime)
    : 0;
  const classRemaining = Math.max(0, totalDuration - elapsedTime);
  const nextTask = activeIndex >= 0 ? tasks[activeIndex + 1] : null;

  if (isComplete) {
    return (
      <main className="live-shell live-complete">
        <header className="live-header">
          <div>
            <span className="live-kicker">Class complete</span>
            <h1>Nice work.</h1>
          </div>
          <button className="live-text-button" onClick={onExit}>
            Leave
          </button>
        </header>
        <section className="complete-card">
          <div className="complete-mark">✓</div>
          <p>All blocks finished</p>
          <span>{formatTime(totalDuration)} planned</span>
          <button className="live-primary-button" onClick={onReset}>
            Run again
          </button>
        </section>
      </main>
    );
  }

  if (!activeTask) {
    return (
      <main className="live-shell live-empty">
        <p>Add at least one timed block to run a class.</p>
        <button className="live-primary-button" onClick={onExit}>
          Back to class plan
        </button>
      </main>
    );
  }

  return (
    <main className="live-shell">
      <header className="live-header">
        <div>
          <span className="live-kicker">Live class</span>
          <h1>Class in progress</h1>
        </div>
        <button className="live-text-button" onClick={onExit}>
          Exit
        </button>
      </header>

      <section className="live-class-clock" aria-label="Class remaining">
        <span>Class remaining</span>
        <strong>{formatTime(classRemaining)}</strong>
      </section>

      <section
        className="live-block-card"
      >
        {transitionTask && (
          <div className="live-transition" role="status">
            <span>Up next</span>
            <strong>{transitionTask.name}</strong>
          </div>
        )}
        <div className="live-block-meta">
          <span>Block {String(activeIndex + 1).padStart(2, "0")}</span>
          <span>{tasks.length} total</span>
        </div>
        <h2>{activeTask.name}</h2>
        <div className="live-block-clock">{formatTime(blockRemaining)}</div>
        <span className="live-block-label">Block remaining</span>
        <div className="live-notes">
          <span className="live-section-label">Coach notes</span>
          {activeTask.plan ? (
            <p>{activeTask.plan}</p>
          ) : (
            <p className="live-muted">No notes for this block.</p>
          )}
        </div>
      </section>

      <section className="live-next-card">
        <span className="live-section-label">Next</span>
        {nextTask ? (
          <div>
            <strong>{nextTask.name}</strong>
            <span>{formatTime(getDuration(nextTask) * 60)}</span>
          </div>
        ) : (
          <p className="live-muted">Final block</p>
        )}
      </section>

      <nav className="live-controls" aria-label="Live class controls">
        <button className="live-secondary-button" onClick={onPrevious} disabled={activeIndex === 0}>
          Previous
        </button>
        <button className="live-pause-button" onClick={isRunning ? onPause : onResume}>
          {isRunning ? "Pause" : "Resume"}
        </button>
        <button className="live-secondary-button" onClick={onNext} disabled={activeIndex === tasks.length - 1}>
          Next
        </button>
      </nav>
      <button className="live-reset-button" onClick={onReset}>
        Reset class
      </button>
    </main>
  );
}
