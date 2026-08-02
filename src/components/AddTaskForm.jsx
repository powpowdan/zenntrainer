import { useState } from "react";

export default function AddTaskForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [color, setColor] = useState("");

  const palette = ["#22c55e", "#38bdf8", "#f97316", "#f97373", "#a855f7"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ name, duration: Number(duration), color });
    setName("");
    setDuration("");
    setColor("");
    setIsOpen(false); // hide form after adding
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          width: "100%",
          padding: "10px 14px",
          fontSize: "15px",
          background:
            "linear-gradient(90deg, var(--accent-primary), var(--accent-success))",
          color: "white",
          border: "none",
          borderRadius: "999px",
          fontWeight: 600,
          letterSpacing: 0.4,
        }}
      >
        ➕ Add Task
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Scrim */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
        }}
      />

      {/* Bottom sheet / modal card */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          margin: "0 auto",
          background: "var(--bg-surface-alt)",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: "14px 14px 12px",
          boxShadow: "0 -16px 40px rgba(0,0,0,0.85)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Add task
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: 18,
              lineHeight: 1,
              padding: 4,
              borderRadius: 999,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <input
            placeholder="Task name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #4b5563",
              backgroundColor: "#020617",
              color: "var(--text-primary)",
            }}
          />

          <input
            type="number"
            placeholder="Duration (min)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min={1}
            required
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #4b5563",
              backgroundColor: "#020617",
              color: "var(--text-primary)",
            }}
          />

          <div style={{ marginTop: 2 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                marginBottom: 4,
              }}
            >
              Pick a color (optional)
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {palette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "999px",
                    border:
                      color === c ? "2px solid #e5e7eb" : "1px solid #4b5563",
                    padding: 0,
                    backgroundColor: c,
                    boxShadow:
                      color === c ? "0 0 0 2px rgba(15,23,42,0.9)" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <button
            type="submit"
            style={{
              flex: 1,
              background:
                "linear-gradient(90deg, var(--accent-primary), var(--accent-success))",
              color: "white",
              border: "none",
              padding: "9px",
              borderRadius: "999px",
              marginRight: 6,
              fontWeight: 600,
            }}
          >
            Add task
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              background: "#111827",
              color: "var(--text-secondary)",
              border: "1px solid #4b5563",
              padding: "9px 14px",
              borderRadius: "999px",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
