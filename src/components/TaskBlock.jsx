import { useState } from "react";

export default function TaskBlock({ task, onDelete, highlight, onEdit }) {
    const PIXELS_PER_MINUTE = 6;

      const [editingPlan, setEditingPlan] = useState(false);
  const [planText, setPlanText] = useState(task.plan || "");

    const savePlan = () => {
    onEdit(task.id, planText);
    setEditingPlan(false);
  };
    
  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
       height: `${task.duration * PIXELS_PER_MINUTE}px`,
        backgroundColor: highlight ? "#c50a0aff" : task.color, // highlight color
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 8px",
        color: "#fff",
        cursor: "grab",
        fontSize: highlight ? "19px" : "16px",
        userSelect: "none",
        transition: "background-color 0.3s", // smooth color change
      }}
    >
      <span>{task.name} ({task.duration} min)</span>
    
         {/* Plan section */}
      {editingPlan ? (
        <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
          <input
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
            style={{ flex: 1, fontSize: "16px" }}
          />
          <button onClick={savePlan} style={{ fontSize: "12px" }}>Save</button>
        </div>
      ) : (
        <div
          onClick={() => setEditingPlan(true)}
          style={{ fontSize: "12px", marginTop: "4px", opacity: 0.8 }}
        >
          {task.plan || "Add plan..."}
        </div>
      )}

        
    </div>
  );
}
