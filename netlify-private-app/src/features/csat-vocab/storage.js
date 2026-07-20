const STORAGE_KEY = "valuetime_csat_vocab_v1";

export const EMPTY_PROGRESS = {
  statuses: {},
  wrong: {},
  tests: [],
};

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      statuses: saved?.statuses || {},
      wrong: saved?.wrong || {},
      tests: Array.isArray(saved?.tests) ? saved.tests : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  queueMicrotask(() => window.dispatchEvent(new CustomEvent("valuetime-csat-progress", { detail: progress })));
}

export function todayKey() {
  return new Date().toLocaleDateString("sv-SE");
}
