import { useState } from "react";

export default function AddTaskForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [color, setColor] = useState("#333");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ name, duration: Number(duration), color });
    setName("");
    setDuration("");
    setColor("#333");
    setIsOpen(false); // hide form after adding
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "10px 14px",
          fontSize: "16px",
          background: "#444",
          color: "white",
          border: "none",
          borderRadius: "5px",
          width: "100%",
        }}
      >
        ➕ Add Task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        background: "#222",
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      <input
        placeholder="Task Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #555" }}
      />

      <input
        type="number"
        placeholder="Duration (min)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        min={1}
        required
        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #555" }}
      />

      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        style={{ width: "100%", height: "35px", borderRadius: "4px" }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
        <button
          type="submit"
          style={{
            flex: 1,
            background: "#4caf50",
            color: "white",
            border: "none",
            padding: "8px",
            borderRadius: "4px",
            marginRight: "5px",
          }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{
            background: "#888",
            color: "white",
            border: "none",
            padding: "8px",
            borderRadius: "4px",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
