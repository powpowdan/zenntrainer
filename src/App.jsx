import { useState, useEffect } from "react";
import Header from "./components/Header";
import Timeline from "./components/Timeline";
import AddTaskForm from "./components/AddTaskForm";
import Notes from "./components/Notes";
import Login from "./Login";
import { supabase } from "./supabaseClient";

const COLOR_PALETTE = ["#22c55e", "#38bdf8", "#f97316", "#f97373", "#a855f7"];

const getRandomColor = () =>
  COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

export default function App() {
  const [session, setSession] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
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
            color: "#22c55e",
            plan: "5-7 min skip ropes. run, pushups",
          },
          {
            id: 2,
            name: "Stretch",
            duration: 10,
            color: "#38bdf8",
            plan: "7 point stretch, focus on shoulder more this class",
          },
          {
            id: 3,
            name: "Technical",
            duration: 10,
            color: "#f97316",
            plan: "Phase 1: teep / jab/ cross, tiger step, jab / cross /knee \nPhase 2: jab/ cross, step aside, jab, body kick",
          },
          {
            id: 4,
            name: "Cardio",
            duration: 10,
            color: "#f97373",
            plan: "run and then sprints on side and pushups",
          },
          {
            id: 5,
            name: "Heavy bag",
            duration: 10,
            color: "#a855f7",
            plan: "Same as technical, add low kick. ",
          },
          {
            id: 6,
            name: "Warmup2",
            duration: 8,
            color: "#22c55e",
            plan: "Teep teep teep teep asdd",
          },
          {
            id: 7,
            name: "Stretch2",
            duration: 10,
            color: "#38bdf8",
            plan: "heavy bag burnout kicks",
          },
         
        ];
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // If we have a session, we are definitely not in guest mode anymore
      if (session) setGuestMode(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setGuestMode(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch tasks from DB when session is available
  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  // Save to LocalStorage if Guest Mode
  // useEffect(() => {
  //   if (!session) {
  //     localStorage.setItem("savedClass", JSON.stringify(tasks));
  //   }
  // }, [tasks, session]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error("Error fetching tasks:", error);
    else setTasks(data);
  };

  const updateTaskPlan = async (id, newPlan) => {
    // Optimistic update
    const oldTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, plan: newPlan } : t))
    );

    if (session) {
      const { error } = await supabase
        .from("tasks")
        .update({ plan: newPlan })
        .eq("id", id);

      if (error) {
        console.error("Error updating task:", error);
        setTasks(oldTasks); // Rollback
      }
    }
  };

  // Determine which task is active based on elapsedTime
  let cumulativeTime = 0;
  const activeTask = tasks.find((task) => {
    const startTime = cumulativeTime;
    const endTime = cumulativeTime + task.duration;
    cumulativeTime = endTime;
    return elapsedTime >= startTime && elapsedTime < endTime;
  });

  const addTask = async (task) => {
    if (session) {
      const newTask = {
        ...task,
        user_id: session.user.id,
        color: task.color || getRandomColor(),
      };

      // Insert into DB
      const { data, error } = await supabase
        .from("tasks")
        .insert([newTask])
        .select();

      if (error) {
        console.error("Error adding task:", error);
      } else {
        setTasks([...tasks, ...data]);
      }
    } else {
      // Guest mode: Local state + LocalStorage (handled by useEffect)
      setTasks([
        ...tasks,
        {
          ...task,
          id: Date.now(),
          color: task.color || getRandomColor(),
        },
      ]);
    }
  };

  const deleteTask = async (id) => {
    // Optimistic delete
    const oldTasks = [...tasks];
    setTasks(tasks.filter((t) => t.id !== id));

    if (session) {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) {
        console.error("Error deleting task", error);
        setTasks(oldTasks);
      }
    }
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
            return 0;
          }
          return prev + 1;
        });
      }, 100); // 60000 for an hour here
    }
    return () => clearInterval(interval);
  }, [isRunning, tasks]);

  if (!session && !guestMode) {
    return <Login onGuest={() => setGuestMode(true)} />;
  }

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
        backgroundColor: "var(--bg-app)",
        color: "var(--text-primary)",
      }}
    >
     

      <Header
        onStart={startClass}
        onPause={pauseClass}
        onReset={resetClass}
        onSave={() => {
          if (!session) localStorage.setItem("savedClass", JSON.stringify(tasks));
          alert(session ? "Auto-saved to cloud!" : "Manual save complete!");
        }}
        onLoad={session ? fetchTasks : () => {
           const saved = localStorage.getItem("savedClass");
           if (saved) setTasks(JSON.parse(saved));
        }}
        onClear={() => {
           if (session) supabase.auth.signOut();
           else setGuestMode(false); // Return to login screen
        }} 
          isRunning={isRunning}
  setIsRunning={setIsRunning}
      />
      <div
        style={{
          flex: 1,
          width: "100%",
          minHeight: 0,
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "8px 10px 10px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
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
        <div
          style={{
            flex: "0 0 auto",
          }}
        >
          <Notes
            task={isRunning ? activeTask : selectedTask || activeTask || null}
            onUpdatePlan={updateTaskPlan}
          />
        </div>
        <div
          style={{
            flex: "0 0 auto",
            paddingTop: 4,
          }}
        >
          <AddTaskForm onAdd={addTask} />
        </div>
      </div>
    </div>
  );
}
