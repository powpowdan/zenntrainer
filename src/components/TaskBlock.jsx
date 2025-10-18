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
  backgroundColor: highlight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
  border: `2px solid ${task.color}`,
  borderLeft: `6px solid ${task.color}`, // stronger accent line
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 12px",
  color: task.color,
  cursor: "grab",
  fontSize: highlight ? "18px" : "16px",
  fontWeight: highlight ? "600" : "400",
  letterSpacing: "0.3px",
  userSelect: "none",
  boxShadow: highlight
    ? `0 0 12px ${task.color}55`
    : "0 1px 3px rgba(0,0,0,0.2)",
  transition: "all 0.25s ease",
  backdropFilter: "blur(4px)",  
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
          {"Edit / View plan" || "Add plan..."}
        </div>
      )}

        
    </div>
  );
}
