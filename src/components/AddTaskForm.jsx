import { useState } from "react";

export default function AddTaskForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [color, setColor] = useState("");
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");

  const palette = ["#22c55e", "#38bdf8", "#f97316", "#f97373", "#a855f7"];

  const resetForm = () => {
    setName("");
    setDuration("");
    setColor("");
    setPlan("");
    setError("");
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const numericDuration = Number(duration);

    if (!trimmedName) {
      setError("Give this block a name.");
      return;
    }

    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
      setError("Duration must be greater than 0 minutes.");
      return;
    }

    onAdd({
      name: trimmedName,
      duration: numericDuration,
      color,
      plan: plan.trim(),
    });
    resetForm();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="add-task-trigger"
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
        Add block
      </button>
    );
  }

  return (
      <div
        role="presentation"
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
        onClick={resetForm}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
        }}
      />

      {/* Bottom sheet / modal card */}
      <form
        onSubmit={handleSubmit}
        aria-labelledby="add-task-title"
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
            <span id="add-task-title">Add block</span>
          </h3>
          <button
            type="button"
            onClick={resetForm}
            aria-label="Close add block form"
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
          <label className="form-field">
            <span>Block name</span>
            <input
            placeholder="e.g. Warmup"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(error && !name.trim())}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #4b5563",
              backgroundColor: "#020617",
              color: "var(--text-primary)",
            }}
            />
          </label>

          <label className="form-field">
            <span>Duration</span>
            <input
            type="number"
            placeholder="Minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min={1}
            step="any"
            aria-invalid={Boolean(error && (!duration || Number(duration) <= 0))}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #4b5563",
              backgroundColor: "#020617",
              color: "var(--text-primary)",
            }}
            />
          </label>

          <label className="form-field">
            <span>Coaching notes <em>Optional</em></span>
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Drills, cues, or progressions..."
              rows={3}
            />
          </label>

          <div style={{ marginTop: 2 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                marginBottom: 4,
              }}
            >
              Pick a color <em>Optional</em>
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
                  aria-label={`Choose ${c} block color`}
                  aria-pressed={color === c}
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

        {error ? <p className="form-error" role="alert">{error}</p> : null}

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
            Add block
          </button>
          <button
            type="button"
            onClick={resetForm}
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
