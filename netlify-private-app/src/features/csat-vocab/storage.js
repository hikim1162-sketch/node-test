import { getProfileItem, removeProfileItem, setProfileItem } from "../../profiles/profileStorage.js";
import { getDayWords, getDays, SERIES } from "./vocabData.js";

const STORAGE_KEY = "valuetime_csat_vocab_v1";
const DAILY_DAY_STORAGE_KEY = "valuetime_csat_vocab_daily_day_v1";

export const EMPTY_PROGRESS = {
  statuses: {},
  wrong: {},
  tests: [],
  savedWords: [],
  completedDays: {},
  masteredWords: {},
};

export function dayCompletionKey(seriesKey, day) {
  return `${seriesKey}:${Number(day)}`;
}

function normalizeCompletedDays(value) {
  if (Array.isArray(value)) {
    return Object.fromEntries(value.map((item) => {
      if (typeof item === "string") return [item, { completedAt: null, migrated: true }];
      const key = dayCompletionKey(item?.series || item?.seriesKey, item?.day);
      return [key, { ...item, series: item?.series || item?.seriesKey, day: Number(item?.day), migrated: true }];
    }).filter(([key]) => !key.includes("undefined") && !key.endsWith(":NaN")));
  }
  return value && typeof value === "object" ? value : {};
}

export function deriveCompletedDays(statuses = {}) {
  const completedDays = {};
  Object.values(SERIES).forEach((series) => {
    getDays(series.key).forEach((day) => {
      const targetWords = getDayWords(series.key, day).slice(0, 10);
      if (!targetWords.length || !targetWords.every((word) => statuses[word.id])) return;
      completedDays[dayCompletionKey(series.key, day)] = {
        series: series.key,
        day: Number(day),
        completedAt: targetWords
          .map((word) => statuses[word.id]?.updatedAt || statuses[word.id]?.date)
          .filter(Boolean)
          .sort()
          .at(-1) || null,
        migrated: true,
      };
    });
  });
  return completedDays;
}

export function markDayComplete(progress, seriesKey, day) {
  const key = dayCompletionKey(seriesKey, day);
  if (progress.completedDays?.[key]) return progress;
  return {
    ...progress,
    completedDays: {
      ...(progress.completedDays || {}),
      [key]: {
        series: seriesKey,
        day: Number(day),
        completedAt: new Date().toISOString(),
      },
    },
  };
}

function deriveMasteredWords(statuses = {}, wrong = {}) {
  return Object.fromEntries(Object.entries(statuses).flatMap(([wordId, status]) => {
    const learnedDirectly = status?.status === "known";
    const reviewedAt = wrong[wordId]?.reviewedAt;
    if (!learnedDirectly && !reviewedAt) return [];
    return [[wordId, {
      source: learnedDirectly ? "known" : "review",
      masteredAt: learnedDirectly
        ? status.updatedAt || status.date || null
        : reviewedAt,
      migrated: true,
    }]];
  }));
}

export function loadProgress(mode = "suneung") {
  try {
    const raw = getProfileItem(mode, STORAGE_KEY);
    const saved = JSON.parse(raw);
    const statuses = saved?.statuses || {};
    const wrong = saved?.wrong || {};
    const storedCompletedDays = normalizeCompletedDays(saved?.completedDays);
    const completedDays = { ...deriveCompletedDays(statuses), ...storedCompletedDays };
    const storedMasteredWords = saved?.masteredWords && typeof saved.masteredWords === "object"
      ? saved.masteredWords
      : {};
    const masteredWords = { ...deriveMasteredWords(statuses, wrong), ...storedMasteredWords };
    const progress = {
      statuses,
      wrong,
      tests: Array.isArray(saved?.tests) ? saved.tests : [],
      savedWords: Array.isArray(saved?.savedWords) ? saved.savedWords : [],
      completedDays,
      masteredWords,
    };
    if (
      raw
      && (
        JSON.stringify(storedCompletedDays) !== JSON.stringify(completedDays)
        || JSON.stringify(storedMasteredWords) !== JSON.stringify(masteredWords)
      )
    ) {
      setProfileItem(mode, STORAGE_KEY, JSON.stringify(progress));
    }
    return progress;
  } catch {
    return { ...EMPTY_PROGRESS, statuses: {}, wrong: {}, tests: [], savedWords: [], completedDays: {}, masteredWords: {} };
  }
}

export function saveProgress(progress, mode = "suneung") {
  setProfileItem(mode, STORAGE_KEY, JSON.stringify(progress));
  queueMicrotask(() => window.dispatchEvent(new CustomEvent("valuetime-csat-progress", { detail: progress })));
}

export function resetLearningData(mode = "suneung") {
  removeProfileItem(mode, STORAGE_KEY);
  removeProfileItem(mode, DAILY_DAY_STORAGE_KEY);
  const empty = { statuses: {}, wrong: {}, tests: [], savedWords: [], completedDays: {}, masteredWords: {} };
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
