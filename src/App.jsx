import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Timeline from "./components/Timeline";
import AddTaskForm from "./components/AddTaskForm";
import Notes from "./components/Notes";
import LiveClass from "./components/LiveClass";
import Login from "./Login";
import { supabase } from "./supabaseClient";

const COLOR_PALETTE = ["#22c55e", "#38bdf8", "#f97316", "#f97373", "#a855f7"];

const getRandomColor = () =>
  COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

const getDuration = (task) => Number(task.duration) || 0;

export default function App() {
  const [session, setSession] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [baseElapsed, setBaseElapsed] = useState(0);
  const [runStartedAt, setRunStartedAt] = useState(null);
  const [transitionTask, setTransitionTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const transitionTimer = useRef(null);
  const previousActiveIndex = useRef(null);
  const suppressTransition = useRef(false);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("savedClass");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, name: "Warmup", duration: 20, color: "#22c55e", plan: "5-7 min skip ropes. run, pushups" },
          { id: 2, name: "Stretch", duration: 10, color: "#38bdf8", plan: "7 point stretch, focus on shoulder more this class" },
          { id: 3, name: "Technical", duration: 10, color: "#f97316", plan: "Phase 1: teep / jab/ cross, tiger step, jab / cross /knee \nPhase 2: jab/ cross, step aside, jab, body kick" },
          { id: 4, name: "Cardio", duration: 10, color: "#f97373", plan: "run and then sprints on side and pushups" },
          { id: 5, name: "Heavy bag", duration: 10, color: "#a855f7", plan: "Same as technical, add low kick. " },
          { id: 6, name: "Warmup2", duration: 8, color: "#22c55e", plan: "Teep teep teep teep asdd" },
          { id: 7, name: "Stretch2", duration: 10, color: "#38bdf8", plan: "heavy bag burnout kicks" },
        ];
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) setGuestMode(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) setGuestMode(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchTasks();
  }, [session]);

  const totalDuration = tasks.reduce(
    (sum, task) => sum + getDuration(task) * 60,
    0
  );

  const getCurrentElapsed = () => {
    if (!isRunning || !runStartedAt) return elapsedTime;
    return Math.min(
      totalDuration,
      baseElapsed + (Date.now() - runStartedAt) / 1000
    );
  };

  useEffect(() => {
    if (!isRunning || !runStartedAt) return undefined;

    const updateClock = () => {
      const nextElapsed = Math.min(
        totalDuration,
        baseElapsed + (Date.now() - runStartedAt) / 1000
      );
      setElapsedTime(nextElapsed);

      if (nextElapsed >= totalDuration) {
        setElapsedTime(totalDuration);
        setBaseElapsed(totalDuration);
        setRunStartedAt(null);
        setIsRunning(false);
        setIsComplete(true);
      }
    };

    updateClock();
    const interval = window.setInterval(updateClock, 100);
    return () => window.clearInterval(interval);
  }, [baseElapsed, isRunning, runStartedAt, totalDuration]);

  const activeIndex = (() => {
    let elapsed = 0;
    return tasks.findIndex((task) => {
      const end = elapsed + getDuration(task) * 60;
      const matches = elapsedTime >= elapsed && elapsedTime < end;
      elapsed = end;
      return matches;
    });
  })();

  const activeTask = activeIndex >= 0 ? tasks[activeIndex] : null;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || null;

  useEffect(() => {
    if (!tasks.length) {
      if (selectedTaskId !== null) setSelectedTaskId(null);
      return;
    }

    if (!tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [selectedTaskId, tasks]);

  useEffect(() => {
    if (activeIndex < 0) {
      previousActiveIndex.current = activeIndex;
      return undefined;
    }

    const previousIndex = previousActiveIndex.current;
    if (
      previousIndex !== null &&
      activeIndex > previousIndex &&
      isRunning &&
      !suppressTransition.current
    ) {
      setTransitionTask(tasks[activeIndex]);
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = window.setTimeout(() => {
        setTransitionTask(null);
      }, 1800);
    }

    suppressTransition.current = false;
    previousActiveIndex.current = activeIndex;

    return () => window.clearTimeout(transitionTimer.current);
  }, [activeIndex, isRunning, tasks]);

  useEffect(() => {
    if (elapsedTime > totalDuration) {
      setElapsedTime(totalDuration);
      setBaseElapsed(totalDuration);
    }
  }, [elapsedTime, totalDuration]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error("Error fetching tasks:", error);
    else setTasks(data);
  };

  const updateTask = (id, updates) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const addTask = async (task) => {
    const taskWithColor = { ...task, color: task.color || getRandomColor() };
    if (session) {
      const newTask = { ...taskWithColor, user_id: session.user.id };
      const { data, error } = await supabase
        .from("tasks")
        .insert([newTask])
        .select();

      if (error) console.error("Error adding task:", error);
      else setTasks((prev) => [...prev, ...data]);
    } else {
      setTasks((prev) => [...prev, { ...taskWithColor, id: Date.now() }]);
    }
  };

  const deleteTask = async (id) => {
    const task = tasks.find((item) => item.id === id);
    if (task && !window.confirm(`Delete “${task.name}”?`)) return;

    const oldTasks = [...tasks];
    setTasks(tasks.filter((task) => task.id !== id));

    if (session) {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) {
        console.error("Error deleting task", error);
        setTasks(oldTasks);
      }
    }
  };

  const startClass = () => {
    if (!tasks.length || totalDuration <= 0) return;
    const startAt = isComplete || elapsedTime >= totalDuration ? 0 : elapsedTime;
    setElapsedTime(startAt);
    setBaseElapsed(startAt);
    setIsComplete(false);
    setIsLiveMode(true);
    setIsRunning(true);
    setRunStartedAt(Date.now());
    previousActiveIndex.current = startAt === 0 ? 0 : activeIndex;
  };

  const pauseClass = () => {
    if (!isRunning) return;
    const currentElapsed = getCurrentElapsed();
    setElapsedTime(currentElapsed);
    setBaseElapsed(currentElapsed);
    setRunStartedAt(null);
    setIsRunning(false);
  };

  const resumeClass = () => {
    if (isComplete || !tasks.length || totalDuration <= 0) return;
    setBaseElapsed(elapsedTime);
    setRunStartedAt(Date.now());
    setIsRunning(true);
  };

  const resetClass = () => {
    setIsRunning(false);
    setRunStartedAt(null);
    setElapsedTime(0);
    setBaseElapsed(0);
    setIsComplete(false);
    setTransitionTask(null);
    previousActiveIndex.current = 0;
  };

  const moveToBlock = (targetIndex) => {
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const targetElapsed = tasks
      .slice(0, targetIndex)
      .reduce((sum, task) => sum + getDuration(task) * 60, 0);
    suppressTransition.current = true;
    setTransitionTask(null);
    setElapsedTime(targetElapsed);
    setBaseElapsed(targetElapsed);
    setIsComplete(false);
    previousActiveIndex.current = targetIndex;
    if (isRunning) setRunStartedAt(Date.now());
  };

  const moveNext = () => moveToBlock(activeIndex + 1);
  const movePrevious = () => moveToBlock(activeIndex - 1);

  const exitLiveMode = () => {
    setIsRunning(false);
    setRunStartedAt(null);
    setIsLiveMode(false);
    setTransitionTask(null);
  };

  if (!session && !guestMode) {
    return <Login onGuest={() => setGuestMode(true)} />;
  }

  if (isLiveMode) {
    return (
      <LiveClass
        tasks={tasks}
        activeTask={activeTask}
        activeIndex={activeIndex}
        elapsedTime={elapsedTime}
        totalDuration={totalDuration}
        isRunning={isRunning}
        isComplete={isComplete}
        transitionTask={transitionTask}
        onPause={pauseClass}
        onResume={resumeClass}
        onReset={resetClass}
        onPrevious={movePrevious}
        onNext={moveNext}
        onExit={exitLiveMode}
      />
    );
  }

  return (
    <div className="app-shell">
      <Header
        onStart={startClass}
        onPause={pauseClass}
        onReset={resetClass}
        onSave={() => {
          if (!session) localStorage.setItem("savedClass", JSON.stringify(tasks));
          alert(session ? "Auto-saved to cloud!" : "Manual save complete!");
        }}
        onLoad={session
          ? fetchTasks
          : () => {
              const saved = localStorage.getItem("savedClass");
              if (saved) setTasks(JSON.parse(saved));
            }}
        onClear={() => {
          if (session) supabase.auth.signOut();
          else setGuestMode(false);
        }}
        isRunning={isRunning}
        taskCount={tasks.length}
        totalDuration={totalDuration}
        canStart={tasks.length > 0 && totalDuration > 0}
      />
      <div className="builder-content">
        <div className="builder-timeline">
          <Timeline
            tasks={tasks}
            setTasks={setTasks}
            onDelete={deleteTask}
            elapsedTime={elapsedTime / 60}
            onSelectTask={(task) => setSelectedTaskId(task.id)}
            selectedTask={selectedTask}
          />
        </div>
        <div className="builder-notes">
          <Notes
            task={isRunning ? activeTask : selectedTask || activeTask || null}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        </div>
        <div className="builder-add-task">
          <AddTaskForm onAdd={addTask} />
        </div>
      </div>
    </div>
  );
}
