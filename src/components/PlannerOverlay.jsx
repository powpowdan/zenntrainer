const formatClock = (seconds) => {
  const safe = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

export default function PlannerOverlay({ onClose, classRemainingSeconds, children }) {
  return (
    <div
      className="planner-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Edit plan during live class"
    >
      <div
        className="planner-overlay__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="planner-overlay__panel">
        <div className="planner-overlay__handle" aria-hidden="true" />
        <div className="planner-overlay__header">
          <div className="planner-overlay__title-group">
            <span className="planner-overlay__title">Editing live plan</span>
            {classRemainingSeconds !== undefined && (
              <span className="planner-overlay__clock" aria-label="Class remaining">
                <span className="planner-overlay__clock-label">Left</span>
                {formatClock(classRemainingSeconds)}
              </span>
            )}
          </div>
          <button
            type="button"
            className="planner-overlay__return"
            onClick={onClose}
          >
            Return to live
          </button>
        </div>
        <div className="planner-overlay__content">{children}</div>
      </div>
    </div>
  );
}
