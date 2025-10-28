import { useState, useEffect } from "react";
import Header from "./components/Header";
import Timeline from "./components/Timeline";
import AddTaskForm from "./components/AddTaskForm";
import Notes from "./components/Notes";

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [selectedTask, setSelectedTask] = useState(null);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("savedClass");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "Warmup",
            duration: 20,
            color: "#4caf50",
            plan: "5-7 min skip ropes. run, pushups",
          },
          {
            id: 2,
            name: "Stretch",
            duration: 10,
            color: "#2196f3",
            plan: "7 point stretch, focus on shoulder more this class",
          },
          {
            id: 3,
            name: "Technical",
            duration: 10,
            color: "#ff9800",
            plan: "Phase 1: teep / jab/ cross, tiger step, jab / cross /knee \nPhase 2: jab/ cross, step aside, jab, body kick",
          },
          {
            id: 4,
            name: "Cardio",
            duration: 10,
            color: "#f44336",
            plan: "run and then sprints on side and pushups",
          },
          {
            id: 5,
            name: "Heavy bag",
            duration: 10,
            color: "#9c27b0",
            plan: "Same as technical, add low kick. ",
          },
          {
            id: 6,
            name: "Warmup2",
            duration: 8,
            color: "#4caf50",
            plan: "Teep teep teep teep asdd",
          },
          {
            id: 7,
            name: "Stretch2",
            duration: 10,
            color: "#2196f3",
            plan: "heavy bag burnout kicks",
          },
         
        ];
  });
  const updateTaskPlan = (id, newPlan) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === id ? { ...t, plan: newPlan } : t))
    );
  };
  // Determine which task is active based on elapsedTime
  let cumulativeTime = 0;
  const activeTask = tasks.find((task) => {
    const startTime = cumulativeTime;
    const endTime = cumulativeTime + task.duration;
    cumulativeTime = endTime;
    return elapsedTime >= startTime && elapsedTime < endTime;
  });

  const addTask = (task) => {
    setTasks([
      ...tasks,
      { ...task, id: Date.now(), color: task.color || "#333" },
    ]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const startClass = () => {
    setIsRunning(true);
  };

  const pauseClass = () => {
    setIsRunning(false);
  };

  const resetClass = () => {
    setIsRunning(false);
    setElapsedTime(0);
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => {
          if (prev + 1 >= tasks.reduce((sum, t) => sum + t.duration, 0)) {
            // reset when class ends
            resetClass();
            return prev + 1;
          }
          return prev + 1;
        });
      }, 100); // 60000 for an hour here
    }
    return () => clearInterval(interval);
  }, [isRunning, tasks]);

  // this is for auto saving on moving an task

  //   useEffect(() => {
  //   localStorage.setItem("savedClass", JSON.stringify(tasks));
  // }, [tasks]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        padding: "0",
        margin: "0",
        boxSizing: "border-box",
      }}
    >
      {/* <button
        onClick={() =>
          localStorage.setItem("savedClass", JSON.stringify(tasks))
        }
      >
        Save Class
      </button>

      <button
        onClick={() => {
          const saved = localStorage.getItem("savedClass");
          if (saved) setTasks(JSON.parse(saved));
        }}
      >
        Load Saved Class
      </button>

      <button onClick={() => localStorage.removeItem("savedClass")}>
        Clear Saved
      </button> */}

      <Header
        onStart={startClass}
        onPause={pauseClass}
        onReset={resetClass}
        onSave={() => localStorage.setItem("savedClass", JSON.stringify(tasks))}
        onLoad={() => {
          const saved = localStorage.getItem("savedClass");
          if (saved) setTasks(JSON.parse(saved));
        }}
        onClear={() => localStorage.removeItem("savedClass")}
      />
      <div
        style={{
          flex: 1,
          width: "100%",
          minHeight: 0,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Timeline
          tasks={tasks}
          setTasks={setTasks}
          onDelete={deleteTask}
          elapsedTime={elapsedTime}
          onSelectTask={setSelectedTask}
          selectedTask={selectedTask}
        />
      </div>
      <div style={{ flex: "0 0 33%", padding: "10px" }}>
        <Notes
          task={isRunning ? activeTask : selectedTask || activeTask || null}
          onUpdatePlan={updateTaskPlan}
        />
      </div>

      <div style={{ flex: "0 0 auto", padding: "5px" }}>
        <AddTaskForm onAdd={addTask} />
      </div>
    </div>
  );
}
