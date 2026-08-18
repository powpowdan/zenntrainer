export const MAX_SHARE_BYTES = 32768;
export const SNAPSHOT_VERSION = 1;
const DEFAULT_NAME = "Shared class";

const normalizeColor = (color) =>
  typeof color === "string" && color.trim() ? color.trim() : null;

export const serializeClass = (className, tasks) => ({
  v: SNAPSHOT_VERSION,
  name:
    typeof className === "string" && className.trim()
      ? className.trim()
      : DEFAULT_NAME,
  blocks: (Array.isArray(tasks) ? tasks : []).map((task) => ({
    name: typeof task.name === "string" ? task.name.trim() : "",
    duration: Number(task.duration) || 0,
    plan: typeof task.plan === "string" ? task.plan : "",
    color: normalizeColor(task.color),
  })),
});

export const sharePayloadBytes = (payload) =>
  new TextEncoder().encode(JSON.stringify(payload)).length;

export const parseSnapshot = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid share payload");
  }
  if (payload.v !== SNAPSHOT_VERSION) {
    throw new Error("Unsupported share version");
  }
  if (!Array.isArray(payload.blocks)) {
    throw new Error("Invalid share blocks");
  }

  const name =
    typeof payload.name === "string" && payload.name.trim()
      ? payload.name.trim()
      : DEFAULT_NAME;

  const blocks = payload.blocks
    .filter((block) => block && typeof block === "object")
    .map((block) => ({
      name: typeof block.name === "string" ? block.name.trim() : "",
      duration: Number(block.duration) || 0,
      plan: typeof block.plan === "string" ? block.plan : "",
      color: normalizeColor(block.color),
    }))
    .filter((block) => block.name && block.duration > 0);

  if (blocks.length === 0) {
    throw new Error("Share has no valid blocks");
  }

  return { name, blocks };
};

export const createShareToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};
