import { useEffect, useState } from "react";

const PALETTE = ["#22c55e", "#38bdf8", "#f97316", "#f97373", "#a855f7"];

export default function Notes({ task, onUpdateTask, onDeleteTask }) {
  const [name, setName] = useState(task?.name || "");
  const [duration, setDuration] = useState(task?.duration || "");
  const [color, setColor] = useState(task?.color || "");
  const [text, setText] = useState(task?.plan || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(task?.name || "");
    setDuration(task?.duration || "");
    setColor(task?.color || "");
    setText(task?.plan || "");
    setError("");
  }, [task]);

  if (!task) {
    return (
      <div className="block-editor block-editor-empty">
        <p>Select a block on the timeline to edit its details.</p>
      </div>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
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

    onUpdateTask(task.id, {
      name: trimmedName,
      duration: numericDuration,
      color: color || task.color,
      plan: text.trim(),
    });
    setError("");
  };

  const resetDraft = () => {
    setName(task.name || "");
    setDuration(task.duration || "");
    setColor(task.color || "");
    setText(task.plan || "");
    setError("");
  };

  return (
    <form className="block-editor" onSubmit={handleSubmit}>
      <div className="block-editor-heading">
        <div>
          <span className="editor-kicker">Selected block</span>
          <h2>{task.name}</h2>
        </div>
        <span className="editor-duration">{task.duration} min</span>
      </div>

      <label className="form-field">
        <span>Block name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="form-field">
        <span>Duration</span>
        <input
          type="number"
          min={1}
          step="any"
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
          aria-invalid={Boolean(error && (!duration || Number(duration) <= 0))}
        />
      </label>

      <label className="form-field">
        <span>Coaching notes</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Drills, cues, or progressions..."
          rows={7}
        />
      </label>

      <fieldset className="color-field">
        <legend>Block color</legend>
        <div className="color-options">
          {PALETTE.map((paletteColor) => (
            <button
              key={paletteColor}
              type="button"
              className="color-option"
              style={{ backgroundColor: paletteColor }}
              onClick={() => setColor(paletteColor)}
              aria-label={`Choose ${paletteColor} block color`}
              aria-pressed={color === paletteColor}
            />
          ))}
        </div>
      </fieldset>

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <div className="block-editor-actions">
        <button className="editor-save-button" type="submit">Save block</button>
        <button
          className="editor-cancel-button"
          type="button"
          onClick={resetDraft}
        >
          Cancel changes
        </button>
        <button
          className="editor-delete-button"
          type="button"
          onClick={() => onDeleteTask(task.id)}
        >
          Delete block
        </button>
      </div>
    </form>
  );
}
