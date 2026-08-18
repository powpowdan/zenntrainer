// Guest-mode class library, stored in localStorage under "cadenceData".
// Shape (design D3):
// {
//   v: 1,
//   classes: { <id>: { id, name, createdAt, updatedAt } },
//   tasksByClass: { <id>: [{ name, duration, plan, color, position }] },
//   runs: [{ id, classId, startedAt, finishedAt, plannedMinutes }],
//   lastOpenedClassId: <id> | null
// }
//
// "cadenceLastClass:user" holds the authenticated coach's last-opened class
// per device (design D4); guest last-opened lives inside cadenceData.

const DATA_KEY = "cadenceData";
const LEGACY_SAVED_CLASS_KEY = "savedClass";
const USER_LAST_CLASS_KEY = "cadenceLastClass:user";
const MAX_RUNS = 20;

const createId = () =>
  `local-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;

export const emptyData = () => ({
  v: 1,
  classes: {},
  tasksByClass: {},
  runs: [],
  lastOpenedClassId: null,
});

export const getUserLastClassId = () =>
  localStorage.getItem(USER_LAST_CLASS_KEY);

export const setUserLastClassId = (classId) => {
  if (classId) localStorage.setItem(USER_LAST_CLASS_KEY, classId);
  else localStorage.removeItem(USER_LAST_CLASS_KEY);
};

const taskFields = (task, position) => ({
  name: task.name,
  duration: Number(task.duration),
  color: task.color,
  plan: task.plan || "",
  position,
});

export const loadData = () => {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw);
    return {
      ...emptyData(),
      ...parsed,
      classes: parsed.classes || {},
      tasksByClass: parsed.tasksByClass || {},
      runs: Array.isArray(parsed.runs) ? parsed.runs : [],
      lastOpenedClassId: parsed.lastOpenedClassId ?? null,
    };
  } catch (error) {
    console.error("Could not read guest data:", error);
    return emptyData();
  }
};

export const saveData = (data) => {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
};

export const getClassList = (data) =>
  Object.values(data.classes).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

export const readTasks = (data, classId) => {
  const stored = data.tasksByClass[classId] || [];
  return stored.map((task) => ({ ...task, id: createId() }));
};

export const writeTasks = (data, classId, tasks) => {
  data.tasksByClass[classId] = tasks.map((task, index) =>
    taskFields(task, index)
  );
  saveData(data);
};

// Migrate the legacy single-slot "savedClass" plan into a default class.
// Returns true when a migration happened.
export const migrateLegacyPlan = (data) => {
  if (Object.keys(data.classes).length > 0) return false;

  const raw = localStorage.getItem(LEGACY_SAVED_CLASS_KEY);
  if (!raw) return false;

  let legacyTasks = [];
  try {
    legacyTasks = JSON.parse(raw);
  } catch (error) {
    console.error("Could not read legacy plan:", error);
    return false;
  }

  const now = new Date().toISOString();
  const id = createId();
  data.classes[id] = { id, name: "My class", createdAt: now, updatedAt: now };
  data.tasksByClass[id] = (Array.isArray(legacyTasks) ? legacyTasks : []).map(
    (task, index) => taskFields(task, index)
  );
  data.lastOpenedClassId = id;
  saveData(data);
  return true;
};

export const createClass = (data, name, tasks = []) => {
  const now = new Date().toISOString();
  const id = createId();
  data.classes[id] = {
    id,
    name: name && name.trim() ? name.trim() : "New class",
    createdAt: now,
    updatedAt: now,
  };
  data.tasksByClass[id] = tasks.map((task, index) => taskFields(task, index));
  saveData(data);
  return data.classes[id];
};

export const renameClass = (data, classId, name) => {
  const existing = data.classes[classId];
  if (!existing) return;
  const trimmed = name && name.trim();
  if (!trimmed) return;
  existing.name = trimmed;
  existing.updatedAt = new Date().toISOString();
  saveData(data);
};

export const duplicateClass = (data, classId) => {
  const source = data.classes[classId];
  if (!source) return null;
  const copy = createClass(data, `${source.name} copy`, readTasks(data, classId));
  return copy;
};

export const deleteClass = (data, classId) => {
  delete data.classes[classId];
  delete data.tasksByClass[classId];
  data.runs = data.runs.filter((run) => run.classId !== classId);
  if (data.lastOpenedClassId === classId) {
    data.lastOpenedClassId = getClassList(data)[0]?.id || null;
  }
  saveData(data);
};

export const addRun = (data, { classId, startedAt, finishedAt, plannedMinutes }) => {
  data.runs.unshift({
    id: createId(),
    classId,
    startedAt,
    finishedAt,
    plannedMinutes,
  });
  data.runs = data.runs.slice(0, MAX_RUNS);
  saveData(data);
};

export const getRuns = (data) => data.runs;

// Aggregate runs into { classId: { lastFinishedAt, count } }.
export const aggregateRuns = (runs) => {
  const byClass = {};
  for (const run of runs) {
    const entry = byClass[run.classId] || { lastFinishedAt: null, count: 0 };
    entry.count += 1;
    if (!entry.lastFinishedAt || run.finishedAt > entry.lastFinishedAt) {
      entry.lastFinishedAt = run.finishedAt;
    }
    byClass[run.classId] = entry;
  }
  return byClass;
};
