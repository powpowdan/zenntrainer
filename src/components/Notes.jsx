import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
export default function Notes({ task, onUpdatePlan }) {
  const [text, setText] = useState(task?.plan || "");

  // whenever a new task is selected, update local text
  useEffect(() => {
    setText(task?.plan || "");
  }, [task]);

  if (!task) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "16px",
          opacity: 0.7,
          color: "var(--text-secondary)",
          fontSize: 14,
        }}
      >
        <p>Select a block on the timeline to view or add notes.</p>
      </div>
    );
  }

  const handleSave = () => {
    onUpdatePlan(task.id, text);
  };

  return (
    <div
      style={{
        textAlign: "left",
        padding: 12,
        borderTop: "1px solid var(--border-subtle)",
        background:
          "radial-gradient(circle at top, rgba(34,197,94,0.14), transparent 60%), var(--bg-surface-alt)",
        borderRadius: "16px 16px 0 0",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          color: task.color || "var(--accent-primary)",
          fontSize: 16,
          margin: "0 0 6px",
        }}
      >
        <strong>{task.name}</strong>{" "}
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          {task.duration} minutes
        </span>
      </h2>

      <TextField
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add session notes, drills, or steps..."
        multiline
        minRows={6}
        maxRows={12}
        fullWidth
        variant="outlined"
        sx={{
          borderRadius: 2,
          backgroundColor: "#020617",
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "15px",
            lineHeight: 1.5,
            padding: "10px",
            color: "#e5e7eb",
            "& fieldset": {
              borderColor: task?.color || "var(--border-subtle)",
            },
            "&:hover fieldset": {
              borderColor: task?.color || "var(--accent-primary)",
            },
            "&.Mui-focused fieldset": {
              borderColor: task?.color || "var(--accent-primary)",
              boxShadow: `0 0 6px ${
                task?.color || "rgba(59,130,246,0.7)"
              }55`,
            },
          },
          "& .MuiInputBase-input": {
            color: "#e5e7eb",
          },
        }}
      />

      <Button
        size="small"
        variant="outlined"
        onClick={handleSave}
        sx={{
          mt: 1.2,
          borderColor: task.color || "var(--accent-primary)",
          color: task.color || "var(--accent-primary)",
          borderRadius: 999,
          fontWeight: 600,
          textTransform: "none",
          fontSize: 13,
          px: 2.4,
          "&:hover": {
            borderColor: task.color || "var(--accent-primary)",
            backgroundColor: `${task.color || "#3b82f6"}22`,
          },
        }}
      >
        Save notes
      </Button>
    </div>
  );
}
