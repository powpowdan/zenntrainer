import { useState } from "react";

export default function AddTaskForm({ onAdd }) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [color, setColor] = useState("#333");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ name, duration: Number(duration), color });
    setName("");
    setDuration(10); 
    setColor("#333");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
      <input
        placeholder="Task Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
 
      <input  
        type="number"
        placeholder="Duration (min)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        min={1}
        required
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <button type="submit" style={{ padding: "5px 10px", marginTop: "5px" }}>
        Add Task
      </button>
    </form>
  );
}