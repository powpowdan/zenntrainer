import { Box } from "@mui/material";

export default function TaskBlock({
  task,
  sequence,
  height,
  onSelect,
  selected,
}) {
  return (
    <Box
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${sequence}. ${task.name}, ${task.duration} minutes${selected ? ", selected" : ""}`}
      sx={{
        width: "100%",
        minWidth: 0,
        minHeight: 64,
        height: `${height}px`,
        backgroundColor: selected ? "var(--elevated)" : "var(--surface)",
        border: "1px solid var(--border-subtle)",
        borderLeft: "3px solid var(--border-subtle)",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        color: "var(--text-primary)",
        cursor: "grab",
        fontSize: selected ? "15px" : "14px",
        fontWeight: selected ? 600 : 500,
        letterSpacing: "0.3px",
        userSelect: "none",
        boxShadow: selected
          ? "0 0 12px color-mix(in srgb, var(--accent) 22%, transparent)"
          : "0 1px 3px rgba(0, 0, 0, 0.4)",
        outline: selected ? "2px solid var(--accent)" : undefined,
        outlineOffset: selected ? "2px" : undefined,
        transition: "all 0.2s ease",
        "&:focus-visible": {
          outline: "3px solid var(--accent)",
          outlineOffset: "3px",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <Box
          component="span"
          sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}
        >
          <span className="task-block-title" style={{ fontWeight: 600 }}>
            <span className="task-block-sequence">{sequence}</span>
            {task.name}
          </span>
          <Box
            component="span"
            sx={{
              fontSize: "11px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              fontFamily: "var(--font-numeric)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {task.duration} min
          </Box>
        </Box>
        <span className="task-block-state" aria-hidden="true">
          {selected ? "Selected" : ""}
        </span>
        {task.plan ? (
          <Box
            component="span"
            sx={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "220px",
            }}
          >
            {task.plan}
          </Box>
        ) : (
          <Box component="span" sx={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Add notes in editor
          </Box>
        )}
      </Box>
    </Box>
  );
}
