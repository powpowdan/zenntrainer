export default function Notes({ task, onUpdatePlan  }) {
  if (!task) return null; // nothing active yet

    const handlePlanChange = (e) => {
    onUpdatePlan(task.id, e.target.value);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ fontSize: "18px" }}><strong>{task.name} <span className="small">{task.duration} minutes</span></strong></h2>
 
      {/* <p>{task.plan}</p> */}
         <textarea
        value={task.plan || ""}
        onChange={handlePlanChange}
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
    </div>
  );
}