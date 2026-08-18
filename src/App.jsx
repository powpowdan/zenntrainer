import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Timeline from "./components/Timeline";
import AddTaskForm from "./components/AddTaskForm";
import Notes from "./components/Notes";
import LiveClass from "./components/LiveClass";
import PlannerOverlay from "./components/PlannerOverlay";
import LibraryModal from "./components/LibraryModal";
import ShareDialog from "./components/ShareDialog";
import ImportDialog from "./components/ImportDialog";
import Login from "./Login";
import { supabase } from "./supabaseClient";
import { unlockAudio, playBell } from "./sound";
import * as guestStore from "./classStorage";
import { publishSharedClass, fetchSharedClass } from "./classSharing";
import { parseSnapshot } from "./classCodec";
import { SAMPLE_CLASS_NAME, SAMPLE_TASKS } from "./samplePlan";

const PENDING_SHARE_KEY = "cadencePendingShare";

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

const mapClassRow = (row) => ({
  id: row.id,
  name: row.name,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const fetchClasses = async () => {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapClassRow);
};

const fetchRunsByClass = async () => {
  const { data, error } = await supabase
    .from("runs")
    .select("class_id, finished_at")
    .order("finished_at", { ascending: false });
  if (error) throw error;
  return guestStore.aggregateRuns(
    (data || []).map((run) => ({
      classId: run.class_id,
      finishedAt: run.finished_at,
    }))
  );
};

const fetchTaskSummaries = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("class_id, duration");
  if (error) throw error;
  const summaries = {};
  for (const row of data || []) {
    const entry = summaries[row.class_id] || { blockCount: 0, totalMinutes: 0 };
    entry.blockCount += 1;
    entry.totalMinutes += getDuration(row);
    summaries[row.class_id] = entry;
  }
  return summaries;
};

const guestTaskSummaries = (data) => {
  const summaries = {};
  for (const [classId, taskList] of Object.entries(data.tasksByClass)) {
    summaries[classId] = {
      blockCount: taskList.length,
      totalMinutes: taskList.reduce((sum, task) => sum + getDuration(task), 0),
    };
  }
  return summaries;
};

export default function App() {
  const [session, setSession] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [classes, setClasses] = useState([]);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [runsByClass, setRunsByClass] = useState({});
  const [taskSummaries, setTaskSummaries] = useState({});
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isBootDone, setIsBootDone] = useState(false);
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
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem("liveSoundMuted") === "true"
  );
  const [persistenceStatus, setPersistenceStatus] = useState("saved");
  const [persistenceError, setPersistenceError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [shareState, setShareState] = useState(null);
  const [pendingShareToken, setPendingShareToken] = useState(null);
  const [importState, setImportState] = useState(null);
  const [importAttempt, setImportAttempt] = useState(0);
  const transitionTimer = useRef(null);
  const previousActiveTaskId = useRef(null);
  const suppressTransition = useRef(false);
  const completionBellPlayed = useRef(false);
  const persistenceQueue = useRef(Promise.resolve());
  const persistedIdMap = useRef(new Map());
  const planRevision = useRef(0);
  const guestDataRef = useRef(null);
  const runMetaRef = useRef(null);
  const bootedKeyRef = useRef(null);
  const importedShareTokenRef = useRef(null);

  // Capture a share token from ?s= at first load, strip it from the URL so a
  // refresh never re-opens the import, and stash it for the magic-link
  // round trip (which reloads the page without the param).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("s");
    if (fromUrl) {
      window.history.replaceState({}, "", window.location.pathname);
      sessionStorage.setItem(PENDING_SHARE_KEY, fromUrl);
      setPendingShareToken(fromUrl);
      return;
    }
    const stashed = sessionStorage.getItem(PENDING_SHARE_KEY);
    if (stashed) setPendingShareToken(stashed);
  }, []);

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
  const currentClass = classes.find((cls) => cls.id === currentClassId) || null;
  const hasActiveRun = isLiveMode && !isComplete && elapsedTime > 0;

  useEffect(() => {
    if (!tasks.length) {
      if (selectedTaskId !== null) setSelectedTaskId(null);
      return;
    }

    if (!tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [selectedTaskId, tasks]);

  const clearRunState = () => {
    setIsRunning(false);
    setRunStartedAt(null);
    setActiveTaskId(null);
    setIsComplete(false);
    setOffsetWithinBlock(0);
    setBaseOffset(0);
    setTransitionTask(null);
    completionBellPlayed.current = false;
    previousActiveTaskId.current = null;
    runMetaRef.current = null;
  };

  // Reset class-library state when the app falls back to the login screen
  // (sign out, guest exit, or token expiry) so the next session re-boots fresh.
  useEffect(() => {
    if (session || guestMode) return;
    bootedKeyRef.current = null;
    setIsBootDone(false);
    setIsLibraryOpen(false);
    setIsLiveMode(false);
    setIsPlannerOverlayOpen(false);
    setCurrentClassId(null);
    setClasses([]);
    setTasks([]);
    setRunsByClass({});
    setTaskSummaries({});
    setPersistenceStatus("saved");
    setPersistenceError("");
    clearRunState();
  }, [session, guestMode]);

  const refreshRunsByClass = useCallback(async () => {
    if (session) {
      try {
        setRunsByClass(await fetchRunsByClass());
      } catch (error) {
        console.error("Error fetching run history:", error);
      }
      return;
    }
    if (guestDataRef.current) {
      setRunsByClass(guestStore.aggregateRuns(guestStore.getRuns(guestDataRef.current)));
    }
  }, [session]);

  const refreshTaskSummaries = async () => {
    if (session) {
      try {
        setTaskSummaries(await fetchTaskSummaries());
      } catch (error) {
        console.error("Error fetching class summaries:", error);
      }
      return;
    }
    if (guestDataRef.current) {
      setTaskSummaries(guestTaskSummaries(guestDataRef.current));
    }
  };

  const loadClassTasks = async (classId) => {
    if (session) {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("class_id", classId)
        .order("position", { ascending: true })
        .order("id", { ascending: true });
      if (error) throw error;
      return normalizeTasks(data || []);
    }
    return normalizeTasks(
      guestStore.readTasks(guestDataRef.current, classId)
    );
  };

  const rememberLastOpened = (classId) => {
    if (session) {
      guestStore.setUserLastClassId(classId);
    } else if (guestDataRef.current) {
      guestDataRef.current.lastOpenedClassId = classId;
      guestStore.saveData(guestDataRef.current);
    }
  };

  const openClass = async (classId, { skipRunConfirm = false } = {}) => {
    if (classId === currentClassId) {
      setIsLibraryOpen(false);
      return;
    }

    if (!skipRunConfirm && hasActiveRun) {
      const name = currentClass?.name || "current class";
      if (
        !window.confirm(
          `Leave the run of "${name}"? The run will end and won't be recorded.`
        )
      ) {
        return;
      }
    }

    setIsLibraryOpen(false);
    setIsPlannerOverlayOpen(false);
    setIsLiveMode(false);
    clearRunState();

    // Let any in-flight writes for the previous class finish before swapping.
    if (session) {
      await persistenceQueue.current.catch(() => undefined);
    }

    persistedIdMap.current = new Map();
    planRevision.current += 1;
    setCurrentClassId(classId);
    setPersistenceError("");

    try {
      setTasks(await loadClassTasks(classId));
      setPersistenceStatus("saved");
      rememberLastOpened(classId);
    } catch (error) {
      console.error("Error loading class:", error);
      setTasks([]);
      setPersistenceStatus("error");
      setPersistenceError("Could not load the class.");
    }
  };

  const createClassRecord = async (name, seedTasks = []) => {
    if (session) {
      const { data: classRow, error } = await supabase
        .from("classes")
        .insert({ user_id: session.user.id, name })
        .select()
        .single();
      if (error) throw error;

      if (seedTasks.length) {
        const rows = seedTasks.map((task, index) => ({
          ...getTaskFields(task, index),
          class_id: classRow.id,
          user_id: session.user.id,
        }));
        const { error: insertError } = await supabase.from("tasks").insert(rows);
        if (insertError) throw insertError;
      }

      const mapped = mapClassRow(classRow);
      setClasses((previous) => [...previous, mapped]);
      return mapped;
    }

    const data = guestDataRef.current;
    const created = guestStore.createClass(data, name, seedTasks);
    setClasses(guestStore.getClassList(data));
    return created;
  };

  // Boot: after login/guest choice, load the library, seed first-time coaches,
  // and reopen the last-opened class (or a fallback).
  useEffect(() => {
    if (!session && !guestMode) return;

    const bootKey = session ? `user:${session.user.id}` : "guest";
    // Guard against StrictMode's double-invoked effects: only remember the
    // boot once it finished uncancelled, so the second invocation still runs.
    if (bootedKeyRef.current === bootKey) return;

    let cancelled = false;

    (async () => {
      try {
        let classList = [];

        if (session) {
          classList = await fetchClasses();
          if (cancelled) return;
          setClasses(classList);
          try {
            setRunsByClass(await fetchRunsByClass());
          } catch (error) {
            console.error("Error fetching run history:", error);
          }
        } else {
          const data = guestStore.loadData();
          guestStore.migrateLegacyPlan(data);
          guestDataRef.current = data;
          classList = guestStore.getClassList(data);
          setClasses(classList);
          setRunsByClass(guestStore.aggregateRuns(guestStore.getRuns(data)));
        }

        if (classList.length === 0) {
          await createClassRecord(SAMPLE_CLASS_NAME, SAMPLE_TASKS);
          if (cancelled) return;
          classList = session ? await fetchClasses() : guestStore.getClassList(guestDataRef.current);
          setClasses(classList);
        }

        const lastId = session
          ? guestStore.getUserLastClassId()
          : guestDataRef.current.lastOpenedClassId;
        const target =
          classList.find((cls) => cls.id === lastId) || classList[0];

        if (!target) {
          setIsLibraryOpen(true);
          return;
        }

        await openClass(target.id, { skipRunConfirm: true });
      } catch (error) {
        console.error("Error loading classes:", error);
        setPersistenceStatus("error");
        setPersistenceError("Could not load your classes.");
        setIsLibraryOpen(true);
      } finally {
        if (!cancelled) {
          bootedKeyRef.current = bootKey;
          setIsBootDone(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, guestMode]);

  // Records a completed run silently (no UI moment), hooked into the run
  // clock's natural-completion branch. Plan-edit completion never reaches it.
  const recordCompletedRun = useCallback(() => {
    const meta = runMetaRef.current;
    runMetaRef.current = null;
    if (!meta || !currentClassId) return;

    const finishedAt = new Date().toISOString();

    if (session) {
      supabase
        .from("runs")
        .insert({
          class_id: currentClassId,
          user_id: session.user.id,
          started_at: meta.startedAt,
          finished_at: finishedAt,
          planned_minutes: meta.plannedMinutes,
        })
        .then(({ error }) => {
          if (error) {
            console.error("Error recording run:", error);
            return;
          }
          refreshRunsByClass();
        });
      return;
    }

    if (guestDataRef.current) {
      guestStore.addRun(guestDataRef.current, {
        classId: currentClassId,
        startedAt: meta.startedAt,
        finishedAt: finishedAt,
        plannedMinutes: meta.plannedMinutes,
      });
      refreshRunsByClass();
    }
  }, [session, currentClassId, refreshRunsByClass]);

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
          if (!completionBellPlayed.current) {
            completionBellPlayed.current = true;
            playBell(isMuted);
            recordCompletedRun();
          }
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
    isMuted,
    isRunning,
    recordCompletedRun,
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
        playBell(isMuted);
        window.clearTimeout(transitionTimer.current);
        transitionTimer.current = window.setTimeout(() => {
          setTransitionTask(null);
        }, 1800);
      }
    }

    suppressTransition.current = false;
    previousActiveTaskId.current = activeTaskId;

    return () => window.clearTimeout(transitionTimer.current);
  }, [activeTaskId, isRunning, isMuted, tasks]);

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

    // New rows stage in the -2000000 range so they never collide with the
    // -1000000 staging range used for surviving rows below: the partial
    // unique(class_id, position) index rejects transient duplicates.
    for (const task of insertedTasks) {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...getTaskFields(task, -2000000 - task.position),
          class_id: currentClassId,
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
            .eq("class_id", currentClassId)
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
          .eq("class_id", currentClassId)
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
          .eq("class_id", currentClassId)
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

    if (!currentClassId) {
      setPersistenceStatus("unsaved");
      return Promise.resolve(normalizedTasks);
    }

    if (!session) {
      try {
        guestStore.writeTasks(
          guestDataRef.current,
          currentClassId,
          normalizedTasks
        );
        setPersistenceStatus("saved");
        refreshTaskSummaries();
      } catch (error) {
        console.error("Error saving class:", error);
        setPersistenceStatus("error");
        setPersistenceError("Could not save the class on this device.");
      }
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
          refreshTaskSummaries();
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
    if (!currentClassId) {
      setIsLibraryOpen(true);
      return;
    }
    const taskWithId = {
      ...task,
      id: createLocalTaskId(),
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

  const retryPersistence = () => {
    commitPlan(tasks);
  };

  const handleCreateClass = async (name) => {
    try {
      const created = await createClassRecord(name);
      await openClass(created.id);
      refreshTaskSummaries();
    } catch (error) {
      console.error("Error creating class:", error);
      setPersistenceStatus("error");
      setPersistenceError("Could not create the class.");
    }
  };

  const handleRenameClass = async (classId) => {
    const cls = classes.find((item) => item.id === classId);
    if (!cls) return;

    const name = window.prompt("Rename class", cls.name);
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === cls.name) return;

    try {
      if (session) {
        const { error } = await supabase
          .from("classes")
          .update({ name: trimmed })
          .eq("id", classId)
          .eq("user_id", session.user.id);
        if (error) throw error;
      } else {
        guestStore.renameClass(guestDataRef.current, classId, trimmed);
      }
      setClasses((previous) =>
        previous.map((item) =>
          item.id === classId
            ? { ...item, name: trimmed, updatedAt: new Date().toISOString() }
            : item
        )
      );
    } catch (error) {
      console.error("Error renaming class:", error);
      setPersistenceStatus("error");
      setPersistenceError("Could not rename the class.");
    }
  };

  const handleDuplicateClass = async (classId) => {
    const cls = classes.find((item) => item.id === classId);
    if (!cls) return;

    try {
      if (session) {
        const { data: copyRow, error } = await supabase
          .from("classes")
          .insert({ user_id: session.user.id, name: `${cls.name} copy` })
          .select()
          .single();
        if (error) throw error;

        const { data: sourceTasks, error: fetchError } = await supabase
          .from("tasks")
          .select("name, duration, color, plan")
          .eq("class_id", classId)
          .order("position", { ascending: true })
          .order("id", { ascending: true });
        if (fetchError) throw fetchError;

        if (sourceTasks && sourceTasks.length) {
          const rows = sourceTasks.map((task, index) => ({
            ...task,
            position: index,
            class_id: copyRow.id,
            user_id: session.user.id,
          }));
          const { error: insertError } = await supabase.from("tasks").insert(rows);
          if (insertError) throw insertError;
        }

        setClasses((previous) => [...previous, mapClassRow(copyRow)]);
      } else {
        guestStore.duplicateClass(guestDataRef.current, classId);
        setClasses(guestStore.getClassList(guestDataRef.current));
      }
      refreshTaskSummaries();
    } catch (error) {
      console.error("Error duplicating class:", error);
      setPersistenceStatus("error");
      setPersistenceError("Could not duplicate the class.");
    }
  };

  const handleShareClass = async (classId) => {
    const cls = classes.find((item) => item.id === classId);
    if (!cls) return;

    setShareState({ status: "working", className: cls.name });
    try {
      let sourceTasks;
      if (session) {
        const { data, error } = await supabase
          .from("tasks")
          .select("name, duration, color, plan")
          .eq("class_id", classId)
          .order("position", { ascending: true })
          .order("id", { ascending: true });
        if (error) throw error;
        sourceTasks = data || [];
      } else {
        sourceTasks = guestStore.readTasks(guestDataRef.current, classId);
      }

      const { link } = await publishSharedClass(cls.name, sourceTasks);
      setShareState({ status: "ready", className: cls.name, link });
    } catch (error) {
      if (error?.code === "share-oversize") {
        setShareState({
          status: "error",
          className: cls.name,
          classId,
          message:
            "This class is too large to share. Try shortening the notes on some blocks.",
        });
      } else {
        console.error("Error sharing class:", error);
        setShareState({
          status: "error",
          className: cls.name,
          classId,
          message:
            "Could not create the share link. Check your connection and try again.",
        });
      }
    }
  };

  const clearPendingShare = () => {
    sessionStorage.removeItem(PENDING_SHARE_KEY);
    setPendingShareToken(null);
    setImportState(null);
  };

  const retryImport = () => {
    importedShareTokenRef.current = null;
    setImportState(null);
    setImportAttempt((attempt) => attempt + 1);
  };

  const handleImportSharedClass = async () => {
    if (importState?.status !== "ready" || !importState.snapshot) return;
    const { name, blocks } = importState.snapshot;

    setImportState((previous) => ({ ...previous, status: "importing", importFailed: false }));
    try {
      const created = await createClassRecord(name, blocks);
      await openClass(created.id, { skipRunConfirm: true });
      refreshTaskSummaries();
      clearPendingShare();
    } catch (error) {
      console.error("Error importing shared class:", error);
      setImportState((previous) => ({ ...previous, status: "ready", importFailed: true }));
    }
  };

  // Once the library is reachable, resolve a pending share token into either
  // an import preview or the friendly "no longer available" explanation.
  // Invalid and expired tokens look identical here: the select policy hides
  // expired rows, so both come back as no row.
  useEffect(() => {
    if (!isBootDone || !pendingShareToken) return;
    if (importedShareTokenRef.current === pendingShareToken) return;

    let cancelled = false;
    (async () => {
      setImportState({ status: "loading" });
      let payload;
      try {
        payload = await fetchSharedClass(pendingShareToken);
      } catch (error) {
        if (cancelled) return;
        importedShareTokenRef.current = pendingShareToken;
        console.error("Error loading shared class:", error);
        setImportState({ status: "error" });
        return;
      }
      if (cancelled) return;
      importedShareTokenRef.current = pendingShareToken;
      if (!payload) {
        setImportState({ status: "unavailable" });
        return;
      }
      try {
        setImportState({ status: "ready", snapshot: parseSnapshot(payload) });
      } catch {
        setImportState({ status: "unavailable" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isBootDone, pendingShareToken, importAttempt]);

  const handleDeleteClass = async (classId) => {
    const cls = classes.find((item) => item.id === classId);
    if (!cls) return;

    if (
      !window.confirm(
        `Delete “${cls.name}”? Its blocks and run history will be deleted too.`
      )
    ) {
      return;
    }

    try {
      if (session) {
        const { error } = await supabase
          .from("classes")
          .delete()
          .eq("id", classId)
          .eq("user_id", session.user.id);
        if (error) throw error;
      } else {
        guestStore.deleteClass(guestDataRef.current, classId);
      }

      const nextClasses = session
        ? classes.filter((item) => item.id !== classId)
        : guestStore.getClassList(guestDataRef.current);
      setClasses(nextClasses);
      refreshRunsByClass();
      refreshTaskSummaries();

      if (classId === currentClassId) {
        setIsPlannerOverlayOpen(false);
        setIsLiveMode(false);
        clearRunState();

        const fallback = nextClasses[0];
        if (fallback) {
          await openClass(fallback.id, { skipRunConfirm: true });
        } else {
          setCurrentClassId(null);
          setTasks([]);
          setIsLibraryOpen(true);
        }
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      setPersistenceStatus("error");
      setPersistenceError("Could not delete the class.");
    }
  };

  const startClass = () => {
    if (!currentClassId || !tasks.length || totalDuration <= 0) return;

    let startTaskId;
    let startOffset;
    if (isComplete || activeTaskId === null) {
      startTaskId = tasks[0].id;
      startOffset = 0;
      runMetaRef.current = {
        startedAt: new Date().toISOString(),
        plannedMinutes: Math.round(totalDuration / 60),
      };
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
    completionBellPlayed.current = false;
    previousActiveTaskId.current = startTaskId;
    unlockAudio();
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
    unlockAudio();
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
    completionBellPlayed.current = false;
    previousActiveTaskId.current = tasks.length ? tasks[0].id : null;
    runMetaRef.current = null;
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

  const toggleMute = () => {
    setIsMuted((previous) => {
      const next = !previous;
      localStorage.setItem("liveSoundMuted", String(next));
      return next;
    });
  };

  const exitLiveMode = () => {
    setIsRunning(false);
    setRunStartedAt(null);
    setIsLiveMode(false);
    setIsPlannerOverlayOpen(false);
    setTransitionTask(null);
    runMetaRef.current = null;
  };

  const openPlannerOverlay = () => {
    if (activeTaskId !== null) setSelectedTaskId(activeTaskId);
    setIsPlannerOverlayOpen(true);
  };

  const closePlannerOverlay = () => setIsPlannerOverlayOpen(false);

  const exitSession = () => {
    if (session) supabase.auth.signOut();
    else setGuestMode(false);
  };

  if (!session && !guestMode) {
    return <Login onGuest={() => setGuestMode(true)} />;
  }

  const renderLibraryModal = () => (
    <LibraryModal
      open={isLibraryOpen || (isBootDone && !currentClassId)}
      required={isBootDone && !currentClassId}
      onClose={() => setIsLibraryOpen(false)}
      classes={classes}
      currentClassId={currentClassId}
      runsByClass={runsByClass}
      taskSummaries={taskSummaries}
      onOpenClass={(classId) => openClass(classId)}
      onCreateClass={handleCreateClass}
      onRenameClass={handleRenameClass}
      onDuplicateClass={handleDuplicateClass}
      onDeleteClass={handleDeleteClass}
      onShareClass={handleShareClass}
    />
  );

  const renderShareDialogs = () => (
    <>
      <ShareDialog
        state={shareState}
        onClose={() => setShareState(null)}
        onRetry={handleShareClass}
      />
      <ImportDialog
        state={importState}
        onImport={handleImportSharedClass}
        onRetry={retryImport}
        onClose={clearPendingShare}
      />
    </>
  );

  const renderPlanner = () => (
    <>
      <Header
        onStart={startClass}
        onPause={pauseClass}
        onResume={resumeClass}
        onReset={resetClass}
        onExit={exitSession}
        onRetry={retryPersistence}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        className={currentClass?.name}
        isRunning={isRunning}
        isLiveMode={isLiveMode}
        taskCount={tasks.length}
        totalDuration={totalDuration}
        canStart={tasks.length > 0 && totalDuration > 0}
        persistenceStatus={persistenceStatus}
        persistenceError={persistenceError}
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
            showRunPosition={isLiveMode && !isComplete && activeTaskId !== null}
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
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
        {isPlannerOverlayOpen && (
          <PlannerOverlay
            onClose={closePlannerOverlay}
            classRemainingSeconds={Math.max(0, totalDuration - elapsedTime)}
          >
            {renderPlanner()}
          </PlannerOverlay>
        )}
        {renderLibraryModal()}
        {renderShareDialogs()}
      </div>
    );
  }

  return (
    <div className="app-shell">
      {renderPlanner()}
      {renderLibraryModal()}
      {renderShareDialogs()}
    </div>
  );
}
