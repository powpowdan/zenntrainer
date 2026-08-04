import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Timeline from "./components/Timeline";
import AddTaskForm from "./components/AddTaskForm";
import Notes from "./components/Notes";
import LiveClass from "./components/LiveClass";
import PlannerOverlay from "./components/PlannerOverlay";
import Login from "./Login";
import { supabase } from "./supabaseClient";

const getDuration = (task) => Number(task.duration) || 0;

const normalizeTasks = (taskList) =>
  taskList.map((task, index) => ({ ...task, position: index }));

const getTaskFields = (task, position) => ({
  name: task.name,
  duration: Number(task.duration),
  color: task.color,
  plan: task.plan || "",
  position,
});

const createLocalTaskId = () =>
  `local-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;

export default function App() {
  const [session, setSession] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [offsetWithinBlock, setOffsetWithinBlock] = useState(0);
  const [baseOffset, setBaseOffset] = useState(0);
  const [runStartedAt, setRunStartedAt] = useState(null);
  const [transitionTask, setTransitionTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isPlannerOverlayOpen, setIsPlannerOverlayOpen] = useState(false);
  const [persistenceStatus, setPersistenceStatus] = useState("saved");
  const [persistenceError, setPersistenceError] = useState("");
  const transitionTimer = useRef(null);
  const previousActiveTaskId = useRef(null);
  const suppressTransition = useRef(false);
  const persistenceQueue = useRef(Promise.resolve());
  const persistedIdMap = useRef(new Map());
  const planRevision = useRef(0);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("savedClass");
    return saved
      ? normalizeTasks(JSON.parse(saved))
      : normalizeTasks([
          { id: 1, name: "Warmup", duration: 20, plan: "5-7 min skip ropes. run, pushups" },
          { id: 2, name: "Stretch", duration: 10, plan: "7 point stretch, focus on shoulder more this class" },
          { id: 3, name: "Technical", duration: 10, plan: "Phase 1: teep / jab/ cross, tiger step, jab / cross /knee \nPhase 2: jab/ cross, step aside, jab, body kick" },
          { id: 4, name: "Cardio", duration: 10, plan: "run and then sprints on side and pushups" },
          { id: 5, name: "Heavy bag", duration: 10, plan: "Same as technical, add low kick. " },
          { id: 6, name: "Warmup2", duration: 8, plan: "Teep teep teep teep asdd" },
          { id: 7, name: "Stretch2", duration: 10, plan: "heavy bag burnout kicks" },
        ]);
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
    if (session) {
      fetchTasks();
    }
  }, [session]);

  const totalDuration = tasks.reduce(
    (sum, task) => sum + getDuration(task) * 60,
    0
  );

  const activeIndex = activeTaskId
    ? tasks.findIndex((task) => task.id === activeTaskId)
    : -1;

  const elapsedBeforeActive =
    activeIndex >= 0
      ? tasks
          .slice(0, activeIndex)
          .reduce((sum, task) => sum + getDuration(task) * 60, 0)
      : 0;

  const liveOffsetWithinBlock = (() => {
    if (!isRunning || !runStartedAt) return offsetWithinBlock;
    return baseOffset + (Date.now() - runStartedAt) / 1000;
  })();

  const elapsedTime = elapsedBeforeActive + liveOffsetWithinBlock;

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
    if (!isRunning || !runStartedAt || activeTaskId === null) return undefined;

    const updateClock = () => {
      let liveOffset = baseOffset + (Date.now() - runStartedAt) / 1000;
      let currentIdx = tasks.findIndex((task) => task.id === activeTaskId);

      // Advance through any block boundaries the live offset overflows.
      while (currentIdx >= 0 && currentIdx < tasks.length) {
        const blockDuration = getDuration(tasks[currentIdx]) * 60;
        if (liveOffset < blockDuration) break;

        const nextIdx = currentIdx + 1;
        if (nextIdx >= tasks.length) {
          // Final block completed.
          setOffsetWithinBlock(blockDuration);
          setBaseOffset(blockDuration);
          setRunStartedAt(null);
          setIsRunning(false);
          setIsComplete(true);
          return;
        }
        liveOffset -= blockDuration;
        currentIdx = nextIdx;
      }

      if (currentIdx < 0 || currentIdx >= tasks.length) return;

      const advancedId = tasks[currentIdx].id;
      if (advancedId !== activeTaskId) {
        setActiveTaskId(advancedId);
      }
      setOffsetWithinBlock(liveOffset);
    };

    updateClock();
    const interval = window.setInterval(updateClock, 100);
    return () => window.clearInterval(interval);
  }, [
    activeTaskId,
    baseOffset,
    isRunning,
    runStartedAt,
    tasks,
    totalDuration,
  ]);

  useEffect(() => {
    if (activeTaskId === null) {
      previousActiveTaskId.current = null;
      return undefined;
    }

    const previousId = previousActiveTaskId.current;
    if (
      previousId !== null &&
      activeTaskId !== previousId &&
      isRunning &&
      !suppressTransition.current
    ) {
      const task = tasks.find((item) => item.id === activeTaskId);
      if (task) {
        setTransitionTask(task);
        window.clearTimeout(transitionTimer.current);
        transitionTimer.current = window.setTimeout(() => {
          setTransitionTask(null);
        }, 1800);
      }
    }

    suppressTransition.current = false;
    previousActiveTaskId.current = activeTaskId;

    return () => window.clearTimeout(transitionTimer.current);
  }, [activeTaskId, isRunning, tasks]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true })
      .order("id", { ascending: true });
    if (error) {
      console.error("Error fetching tasks:", error);
      setPersistenceStatus("error");
      setPersistenceError("Could not load the saved plan.");
      return;
    }

    setTasks(normalizeTasks(data || []));
    setPersistenceStatus("saved");
    setPersistenceError("");
  };

  const enqueuePersistence = (operation) => {
    const nextOperation = persistenceQueue.current.then(operation, operation);
    persistenceQueue.current = nextOperation.catch(() => undefined);
    return nextOperation;
  };

  const persistAuthenticatedPlan = async (previousTasks, nextTasks) => {
    const resolveIds = (taskList) =>
      taskList.map((task) => {
        const persistedId = persistedIdMap.current.get(task.id);
        return persistedId ? { ...task, id: persistedId } : task;
      });

    previousTasks = resolveIds(previousTasks);
    nextTasks = resolveIds(nextTasks);
    const previousIds = new Set(previousTasks.map((task) => task.id));
    const insertedTasks = nextTasks.filter((task) => !previousIds.has(task.id));
    const insertedById = new Map();

    for (const task of insertedTasks) {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...getTaskFields(task, -1000000 - task.position),
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      insertedById.set(task.id, data);
      persistedIdMap.current.set(task.id, data.id);
    }

    const persistedTasks = nextTasks.map((task) =>
      insertedById.has(task.id)
        ? { ...task, ...insertedById.get(task.id) }
        : task
    );
    const nextIds = new Set(persistedTasks.map((task) => task.id));

    await Promise.all(
      previousTasks
        .filter((task) => !nextIds.has(task.id))
        .map(async (task) => {
          const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", task.id)
            .eq("user_id", session.user.id);
          if (error) throw error;
        })
    );

    const existingTasks = persistedTasks.filter((task) => previousIds.has(task.id));
    await Promise.all(
      existingTasks.map(async (task, index) => {
        const { error } = await supabase
          .from("tasks")
          .update({ position: -1000000 - index })
          .eq("id", task.id)
          .eq("user_id", session.user.id);
        if (error) throw error;
      })
    );

    await Promise.all(
      persistedTasks.map(async (task, index) => {
        const { error } = await supabase
          .from("tasks")
          .update(getTaskFields(task, index))
          .eq("id", task.id)
          .eq("user_id", session.user.id);
        if (error) throw error;
      })
    );

    return normalizeTasks(persistedTasks);
  };

  const classifyRunEdit = (previousTasks, nextTasks) => {
    if (!isRunning || activeTaskId === null) {
      return { requiresConfirm: false };
    }

    const activeIdx = previousTasks.findIndex((t) => t.id === activeTaskId);
    if (activeIdx < 0) return { requiresConfirm: false };

    const nextIds = new Set(nextTasks.map((t) => t.id));

    const deleted = previousTasks.filter((t) => !nextIds.has(t.id));
    if (deleted.some((t) => t.id === activeTaskId)) {
      return {
        requiresConfirm: true,
        kind: "delete-active",
        message:
          "Delete the active block? The run will advance to the next block.",
      };
    }
    if (
      deleted.some((t) => {
        const idx = previousTasks.findIndex((p) => p.id === t.id);
        return idx >= 0 && idx < activeIdx;
      })
    ) {
      return {
        requiresConfirm: true,
        kind: "delete-past",
        message:
          "Delete a block the run has already passed? This cannot be undone.",
      };
    }

    const activePrev = previousTasks[activeIdx];
    const activeNext = nextTasks.find((t) => t.id === activeTaskId);
    if (
      activeNext &&
      Number(activePrev.duration) !== Number(activeNext.duration)
    ) {
      const newDurationSec = Number(activeNext.duration) * 60;
      if (offsetWithinBlock > newDurationSec) {
        return {
          requiresConfirm: true,
          kind: "active-duration-below-offset",
          message:
            "Shorten the active block below the time already elapsed? The run will advance.",
        };
      }
      return {
        requiresConfirm: true,
        kind: "active-duration",
        message:
          "Change the active block's duration? Its remaining countdown will update.",
      };
    }

    const nextPosById = new Map(nextTasks.map((t, i) => [t.id, i]));
    if (
      nextPosById.has(activeTaskId) &&
      nextPosById.get(activeTaskId) !== activeIdx
    ) {
      return {
        requiresConfirm: true,
        kind: "reorder-active",
        message: "Move the active block? The run position will follow it.",
      };
    }
    const pastMoved = previousTasks.some((t, i) => {
      if (i >= activeIdx) return false;
      const newPos = nextPosById.get(t.id);
      return newPos !== undefined && newPos !== i;
    });
    if (pastMoved) {
      return {
        requiresConfirm: true,
        kind: "reorder-past",
        message: "Reorder a block the run has already passed?",
      };
    }

    return { requiresConfirm: false };
  };

  const advanceActiveTo = (nextTasks, fallbackIndex) => {
    const successor =
      nextTasks[Math.min(fallbackIndex, nextTasks.length - 1)] || null;
    if (successor) {
      suppressTransition.current = true;
      setActiveTaskId(successor.id);
      setOffsetWithinBlock(0);
      setBaseOffset(0);
      previousActiveTaskId.current = successor.id;
      if (runStartedAt) setRunStartedAt(Date.now());
    } else {
      setIsRunning(false);
      setRunStartedAt(null);
      setIsComplete(true);
      setActiveTaskId(null);
    }
  };

  const commitPlan = (nextTasks, previousTasks = tasks) => {
    if (isRunning) {
      const classification = classifyRunEdit(previousTasks, nextTasks);
      if (classification.requiresConfirm && !window.confirm(classification.message)) {
        return Promise.resolve(previousTasks);
      }
    }

    const normalizedTasks = normalizeTasks(nextTasks);
    const revision = ++planRevision.current;
    setTasks(normalizedTasks);
    setPersistenceError("");

    if (isRunning && activeTaskId !== null) {
      const stillPresent = normalizedTasks.some((t) => t.id === activeTaskId);
      if (!stillPresent) {
        const previousIdx = previousTasks.findIndex((t) => t.id === activeTaskId);
        advanceActiveTo(normalizedTasks, previousIdx);
      } else {
        const updatedActive = normalizedTasks.find((t) => t.id === activeTaskId);
        const newDurationSec = getDuration(updatedActive) * 60;
        if (newDurationSec > 0 && offsetWithinBlock >= newDurationSec) {
          const currentIdx = normalizedTasks.findIndex(
            (t) => t.id === activeTaskId
          );
          advanceActiveTo(normalizedTasks, currentIdx + 1);
        }
      }
    }

    if (!session) {
      setPersistenceStatus("unsaved");
      return Promise.resolve(normalizedTasks);
    }

    setPersistenceStatus("saving");
    return enqueuePersistence(async () => {
      try {
        const persistedTasks = await persistAuthenticatedPlan(
          previousTasks,
          normalizedTasks
        );
        if (revision === planRevision.current) {
          setTasks(persistedTasks);
          setPersistenceStatus("saved");
        }
        return persistedTasks;
      } catch (error) {
        console.error("Error saving plan:", error);
        if (revision === planRevision.current) {
          setPersistenceStatus("error");
          setPersistenceError("Could not save the plan. Your visible edits were kept.");
        }
        return null;
      }
    });
  };

  const updateTask = (id, updates) => {
    commitPlan(
      tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const addTask = (task) => {
    const taskWithId = {
      ...task,
      id: session ? createLocalTaskId() : Date.now(),
    };
    commitPlan([...tasks, taskWithId]);
  };

  const deleteTask = (id) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    // During a run the run-aware guard in commitPlan supplies the consequence-
    // aware confirmation, so skip the generic by-name prompt to avoid double-
    // prompting. Off-run, the by-name prompt is still the gate.
    if (!isRunning && !window.confirm(`Delete “${task.name}”?`)) return;

    commitPlan(tasks.filter((item) => item.id !== id));
  };

  const savePlan = () => {
    if (session) {
      commitPlan(tasks);
      return;
    }

    localStorage.setItem("savedClass", JSON.stringify(normalizeTasks(tasks)));
    setPersistenceStatus("saved");
    setPersistenceError("");
  };

  const loadPlan = () => {
    if (session) {
      fetchTasks();
      return;
    }

    const saved = localStorage.getItem("savedClass");
    if (!saved) return;
    setTasks(normalizeTasks(JSON.parse(saved)));
    setPersistenceStatus("saved");
    setPersistenceError("");
  };

  const retryPersistence = () => {
    commitPlan(tasks);
  };

  const startClass = () => {
    if (!tasks.length || totalDuration <= 0) return;

    let startTaskId;
    let startOffset;
    if (isComplete || activeTaskId === null) {
      startTaskId = tasks[0].id;
      startOffset = 0;
    } else {
      startTaskId = tasks.some((task) => task.id === activeTaskId)
        ? activeTaskId
        : tasks[0].id;
      startOffset = offsetWithinBlock;
    }

    setActiveTaskId(startTaskId);
    setOffsetWithinBlock(startOffset);
    setBaseOffset(startOffset);
    setIsComplete(false);
    setIsLiveMode(true);
    setIsRunning(true);
    setRunStartedAt(Date.now());
    previousActiveTaskId.current = startTaskId;
  };

  const pauseClass = () => {
    if (!isRunning) return;
    const liveOffset = runStartedAt
      ? baseOffset + (Date.now() - runStartedAt) / 1000
      : offsetWithinBlock;
    const activeBlock = tasks.find((task) => task.id === activeTaskId);
    const blockDuration = activeBlock ? getDuration(activeBlock) * 60 : 0;
    const clampedOffset = Math.max(0, Math.min(liveOffset, blockDuration));
    setOffsetWithinBlock(clampedOffset);
    setBaseOffset(clampedOffset);
    setRunStartedAt(null);
    setIsRunning(false);
  };

  const resumeClass = () => {
    if (isComplete || !tasks.length || totalDuration <= 0) return;
    setBaseOffset(offsetWithinBlock);
    setRunStartedAt(Date.now());
    setIsRunning(true);
  };

  const resetClass = () => {
    setIsRunning(false);
    setRunStartedAt(null);
    setActiveTaskId(tasks.length ? tasks[0].id : null);
    setOffsetWithinBlock(0);
    setBaseOffset(0);
    setIsComplete(false);
    setTransitionTask(null);
    previousActiveTaskId.current = tasks.length ? tasks[0].id : null;
  };

  const moveToBlock = (targetIndex) => {
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    suppressTransition.current = true;
    setTransitionTask(null);
    setActiveTaskId(tasks[targetIndex].id);
    setOffsetWithinBlock(0);
    setBaseOffset(0);
    setIsComplete(false);
    previousActiveTaskId.current = tasks[targetIndex].id;
    if (isRunning) setRunStartedAt(Date.now());
  };

  const moveNext = () => moveToBlock(activeIndex + 1);
  const movePrevious = () => moveToBlock(activeIndex - 1);

  const exitLiveMode = () => {
    setIsRunning(false);
    setRunStartedAt(null);
    setIsLiveMode(false);
    setIsPlannerOverlayOpen(false);
    setTransitionTask(null);
  };

  const openPlannerOverlay = () => {
    if (activeTaskId !== null) setSelectedTaskId(activeTaskId);
    setIsPlannerOverlayOpen(true);
  };

  const closePlannerOverlay = () => setIsPlannerOverlayOpen(false);

  if (!session && !guestMode) {
    return <Login onGuest={() => setGuestMode(true)} />;
  }

  const renderPlanner = () => (
    <>
      <Header
        onStart={startClass}
        onPause={pauseClass}
        onResume={resumeClass}
        onReset={resetClass}
        onSave={savePlan}
        onLoad={loadPlan}
        onRetry={retryPersistence}
        persistenceStatus={persistenceStatus}
        persistenceError={persistenceError}
        onClear={() => {
          if (session) supabase.auth.signOut();
          else setGuestMode(false);
        }}
        isRunning={isRunning}
        isLiveMode={isLiveMode}
        taskCount={tasks.length}
        totalDuration={totalDuration}
        canStart={tasks.length > 0 && totalDuration > 0}
      />
      <div className="builder-content">
        <div className="builder-timeline">
          <Timeline
            tasks={tasks}
            onDelete={deleteTask}
            onReorder={(nextTasks) => commitPlan(nextTasks)}
            onSelectTask={(task) => setSelectedTaskId(task.id)}
            selectedTask={selectedTask}
            isRunning={isRunning}
            activeTaskId={activeTaskId}
            elapsedTime={elapsedTime}
          />
        </div>
        <div className="builder-notes">
          <Notes
            task={selectedTask || activeTask || null}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        </div>
        <div className="builder-add-task">
          <AddTaskForm onAdd={addTask} />
        </div>
      </div>
    </>
  );

  if (isLiveMode) {
    return (
      <div className="live-root">
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
          onEditPlan={openPlannerOverlay}
        />
        {isPlannerOverlayOpen && (
          <PlannerOverlay
            onClose={closePlannerOverlay}
            classRemainingSeconds={Math.max(0, totalDuration - elapsedTime)}
          >
            {renderPlanner()}
          </PlannerOverlay>
        )}
      </div>
    );
  }

  return <div className="app-shell">{renderPlanner()}</div>;
}
