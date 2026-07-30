import { seedLearningContents } from "../src/learning/contentStorage.js";

function dateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function visibleContents(type, now = new Date()) {
  const today = dateKey(now);
  return seedLearningContents
    .filter((item) => item.type === type && item.status === "published" && item.publishDate <= today)
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export function todayOrLatest(type, now = new Date()) {
  const today = dateKey(now);
  const list = visibleContents(type, now);
  return list.find((item) => item.publishDate === today) || list[0] || null;
}

export function success(data, status = 200) {
  return { status, body: { success: true, data, error: null } };
}

export function failure(code, message, status = 400, details = null) {
  return { status, body: { success: false, data: null, error: { code, message, details } } };
}

export function send(res, result) {
  res.status(result.status).json(result.body);
}

