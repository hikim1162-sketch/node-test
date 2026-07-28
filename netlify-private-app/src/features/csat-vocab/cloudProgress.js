import { getCurrentUser } from "../../profiles/profileStorage.js";
import { SERIES } from "./vocabData.js";

let syncTimer = null;

export function createProgressSummary(progress, mode, user = getCurrentUser(mode)) {
  const masteredWords = progress.masteredWords || {};
  const series = Object.fromEntries(Object.values(SERIES).map((item) => {
    const mastered = item.words.filter((word) => masteredWords[word.id]).length;
    return [item.key, {
      mastered,
      total: item.words.length,
      percent: item.words.length ? Math.round((mastered / item.words.length) * 1000) / 10 : 0,
    }];
  }));
  return { user, mode, series };
}

async function request(url, options) {
  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `progress_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function authenticateProgressSync(password) {
  return request("/api/progress-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

export async function loadCloudProgress(mode, user = getCurrentUser(mode)) {
  const query = new URLSearchParams({ mode, user });
  const payload = await request(`/api/progress-summary?${query}`);
  return payload.summary;
}

export async function saveCloudProgress(progress, mode, user = getCurrentUser(mode)) {
  const payload = await request("/api/progress-summary", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createProgressSummary(progress, mode, user)),
  });
  return payload.summary;
}

export function queueCloudProgressSave(progress, mode, onResult) {
  const user = getCurrentUser(mode);
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    saveCloudProgress(progress, mode, user)
      .then((summary) => onResult?.({ status: "ready", summary }))
      .catch((error) => onResult?.({
        status: error.status === 401 ? "auth-required" : error.message === "storage_not_configured" ? "not-configured" : "error",
        error: error.message,
      }));
  }, 1200);
}

