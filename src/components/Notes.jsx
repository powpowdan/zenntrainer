import { useState, useEffect } from "react";

export default function Notes({ task, onUpdatePlan }) {
  const [text, setText] = useState(task?.plan || "");

  // whenever a new task is selected, update local text
  useEffect(() => {
    setText(task?.plan || "");
  }, [task]);

  if (!task) {
    return (
      <div style={{ textAlign: "center", padding: "10px", opacity: 0.7 }}>
        <p>Select a task to view or edit its plan</p>
      </div>
    );
  }

  const handleSave = () => {
    onUpdatePlan(task.id, text);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: task.color, fontSize: "18px" }}>
        <strong>
          {task.name} <span className="small">{task.duration} minutes</span>
        </strong>
      </h2>

      {/* <p>{task.plan}</p> */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add session notes, drills, or steps..."
        style={{
          width: "100%",
          minHeight: "150px",
          resize: "vertical",
          borderRadius: "8px",
          border: "1px solid #575757ff",
          padding: "10px",
          fontSize: "15px",
          lineHeight: "1.5",
        }}
      />

      <button
        onClick={handleSave}
        style={{
          marginTop: "10px",
          backgroundColor: task.color,
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "6px 12px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Save Plan
      </button>
    </div>
  );
}
