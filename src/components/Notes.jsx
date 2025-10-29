import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
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
   <TextField
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add session notes, drills, or steps..."
        multiline
        minRows={6}
        maxRows={12}
        fullWidth
        variant="outlined"
        sx={{
          borderRadius: 2,
          backgroundColor: "#1e1e1e",
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "15px",
            lineHeight: 1.5,
            padding: "10px",
            color: "#fff",
            "& fieldset": {
              borderColor: task?.color || "#575757",
            },
            "&:hover fieldset": {
              borderColor: task?.color || "#90caf9",
            },
            "&.Mui-focused fieldset": {
              borderColor: task?.color || "#90caf9",
              boxShadow: `0 0 5px ${task?.color || "#90caf9"}55`,
            },
          },
          "& .MuiInputBase-input": {
            color: "#fff",
          },
        }}
      />

   <Button
  size="small"
  variant="outlined"
  onClick={handleSave}
  sx={{
    mt: 1, // margin-top
    borderColor: task.color,
    color: task.color,
    borderRadius: 1, // 6px
    fontWeight: 600,
    "&:hover": {
      borderColor: task.color,
      backgroundColor: `${task.color}22`, // subtle hover
    },
  }}
>
  Save Notes
</Button>
    </div>
  );
}
