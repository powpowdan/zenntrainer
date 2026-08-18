import { supabase } from "./supabaseClient";
import {
  MAX_SHARE_BYTES,
  createShareToken,
  serializeClass,
  sharePayloadBytes,
} from "./classCodec";

const SHARE_TTL_DAYS = 30;

export const buildShareLink = (token) =>
  `${window.location.origin}/?s=${encodeURIComponent(token)}`;

export const publishSharedClass = async (className, tasks) => {
  const payload = serializeClass(className, tasks);
  if (sharePayloadBytes(payload) > MAX_SHARE_BYTES) {
    const error = new Error("This class is too large to share.");
    error.code = "share-oversize";
    throw error;
  }

  const token = createShareToken();
  const expiresAt = new Date(
    Date.now() + SHARE_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabase
    .from("shared_classes")
    .insert({ token, payload, expires_at: expiresAt });
  if (error) throw error;

  return { token, link: buildShareLink(token) };
};

export const fetchSharedClass = async (token) => {
  const { data, error } = await supabase
    .from("shared_classes")
    .select("payload")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  return data ? data.payload : null;
};
