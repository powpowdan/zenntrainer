export default function TaskBlock({
  task,
  highlight,
  onSelect,
  selected,
}) {
  const PIXELS_PER_MINUTE = 6;

  const isActive = highlight || selected;

  const accent = task.color || "var(--accent-primary)";

  return (
    <div
      onClick={onSelect}
      style={{
        width: "100%",
        minWidth: 0,
        height: `${task.duration * PIXELS_PER_MINUTE}px`,
        backgroundColor: isActive
          ? "rgba(15,23,42,0.85)"
          : "rgba(15,23,42,0.7)",
        border: "1px solid var(--border-subtle)",
        borderLeft: `3px solid ${accent}aa`,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        color: "var(--text-primary)",
        cursor: "grab",
        fontSize: isActive ? "15px" : "14px",
        fontWeight: isActive ? "600" : "500",
        letterSpacing: "0.3px",
        userSelect: "none",
        boxShadow: isActive
          ? "0 0 12px rgba(15,23,42,0.9)"
          : "0 1px 3px rgba(0,0,0,0.4)",
        transition: "all 0.2s ease",
        backdropFilter: "blur(4px)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span style={{ fontWeight: 600 }}>{task.name}</span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            {task.duration} min
          </span>
        </span>
        {task.plan ? (
          <span
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "220px",
            }}
          >
            {task.plan}
          </span>
        ) : (
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            Add notes in panel →
          </span>
        )}
      </div>
    </div>
  );
}
