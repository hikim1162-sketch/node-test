import { getProfileItem, removeProfileItem, setProfileItem } from "../../profiles/profileStorage.js";

const STORAGE_KEY = "valuetime_csat_vocab_v1";
const DAILY_DAY_STORAGE_KEY = "valuetime_csat_vocab_daily_day_v1";

export const EMPTY_PROGRESS = {
  statuses: {},
  wrong: {},
  tests: [],
};

export function loadProgress(mode = "suneung") {
  try {
    const saved = JSON.parse(getProfileItem(mode, STORAGE_KEY));
    return {
      statuses: saved?.statuses || {},
      wrong: saved?.wrong || {},
      tests: Array.isArray(saved?.tests) ? saved.tests : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress, mode = "suneung") {
  setProfileItem(mode, STORAGE_KEY, JSON.stringify(progress));
  queueMicrotask(() => window.dispatchEvent(new CustomEvent("valuetime-csat-progress", { detail: progress })));
}

export function resetLearningData(mode = "suneung") {
  removeProfileItem(mode, STORAGE_KEY);
  removeProfileItem(mode, DAILY_DAY_STORAGE_KEY);
  const empty = { statuses: {}, wrong: {}, tests: [] };
  queueMicrotask(() => window.dispatchEvent(new CustomEvent("valuetime-csat-progress", { detail: empty })));
  return empty;
}

export function todayKey() {
  return new Date().toLocaleDateString("sv-SE");
}

function dateNumber(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function loadDailyDays(mode) {
  try {
    return JSON.parse(getProfileItem(mode, DAILY_DAY_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveDailyDays(mode, value) {
  setProfileItem(mode, DAILY_DAY_STORAGE_KEY, JSON.stringify(value));
}

export function setDailyDay(seriesKey, day, mode = "suneung") {
  const saved = loadDailyDays(mode);
  saved[seriesKey] = { date: todayKey(), day: Number(day) };
  saveDailyDays(mode, saved);
}

export function resolveDailyDay(seriesKey, days, mode = "suneung") {
  if (!days.length) return 1;

  const saved = loadDailyDays(mode);
  const today = todayKey();
  const record = saved[seriesKey];
  const savedIndex = record ? days.indexOf(Number(record.day)) : -1;

  if (!record?.date || savedIndex < 0) {
    setDailyDay(seriesKey, days[0], mode);
    return days[0];
  }

  const elapsedDays = Math.max(0, Math.floor((dateNumber(today) - dateNumber(record.date)) / 86400000));
  const nextDay = days[(savedIndex + elapsedDays) % days.length];

  if (record.date !== today || Number(record.day) !== nextDay) {
    saved[seriesKey] = { date: today, day: nextDay };
    saveDailyDays(mode, saved);
  }

  return nextDay;
}
