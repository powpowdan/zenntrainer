import { useEffect, useRef, useState } from "react";

export default function AddTaskForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");
  const triggerRef = useRef(null);
  const firstFieldRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      firstFieldRef.current?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName("");
    setDuration("");
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
      plan: plan.trim(),
    });
    resetForm();
  };

  if (!isOpen) {
    return (
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        type="button"
        className="add-task-trigger"
        style={{
          width: "100%",
          padding: "10px 14px",
          fontSize: "15px",
          background: "var(--text-primary)",
          color: "var(--app)",
          border: "none",
          borderRadius: "var(--radius-pill)",
          fontWeight: 600,
          letterSpacing: "0.4px",
        }}
      >
        Add block
      </button>
    );
  }

  return (
    <div
      role="presentation"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          resetForm();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={resetForm}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.65)",
        }}
      />

      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        aria-describedby={error ? "add-task-error" : undefined}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          margin: "0 auto",
          background: "var(--elevated)",
          borderTopLeftRadius: "var(--radius-md)",
          borderTopRightRadius: "var(--radius-md)",
          padding: "14px 14px 12px",
          boxShadow: "0 -16px 40px rgba(0, 0, 0, 0.85)",
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
              minWidth: 44,
              minHeight: 44,
              padding: 8,
              borderRadius: "var(--radius-pill)",
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
              id="add-task-name"
              ref={firstFieldRef}
              placeholder="e.g. Warmup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(error && !name.trim())}
            />
          </label>

          <label className="form-field">
            <span>Duration</span>
            <input
              id="add-task-duration"
              type="number"
              placeholder="Minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={1}
              step="any"
              aria-invalid={Boolean(error && (!duration || Number(duration) <= 0))}
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
        </div>

        {error ? <p id="add-task-error" className="form-error" role="alert">{error}</p> : null}

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
              background: "var(--text-primary)",
              color: "var(--app)",
              border: "none",
              padding: "9px",
              borderRadius: "var(--radius-pill)",
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
              background: "var(--surface)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-strong)",
              padding: "9px 14px",
              borderRadius: "var(--radius-pill)",
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
