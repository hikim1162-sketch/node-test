const USERS = new Set(["kai", "rachel"]);
const FIELDS = ["savedWords", "knownWords", "clearedWordSentences", "masteredSavedWords"];

function redisConfig() {
  return {
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
  };
}

async function redis(command) {
  const { url, token } = redisConfig();
  if (!url || !token) {
    const error = new Error("storage_not_configured");
    error.code = "storage_not_configured";
    throw error;
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`storage_${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error);
  return payload.result;
}

function setCors(request, response) {
  const origin = String(request.headers.origin || "");
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    || origin === "https://vt-1114.vercel.app") {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalizeRecords(records) {
  return Object.fromEntries(FIELDS.map((field) => {
    const entries = Object.entries(records?.[field] || {}).flatMap(([word, entry]) => {
      const safeWord = String(word || "").trim().slice(0, 100);
      const updatedAt = Math.max(1, Math.floor(Number(entry?.updatedAt) || 1));
      if (!safeWord) return [];
      return [[safeWord, { value: Boolean(entry?.value), updatedAt }]];
    }).slice(0, 5000);
    return [field, Object.fromEntries(entries)];
  }));
}

function mergeRecords(current, incoming) {
  const merged = {};
  FIELDS.forEach((field) => {
    merged[field] = { ...(current?.[field] || {}) };
    Object.entries(incoming?.[field] || {}).forEach(([word, next]) => {
      const previous = merged[field][word];
      if (!previous || Number(next.updatedAt) >= Number(previous.updatedAt)) {
        merged[field][word] = next;
      }
    });
  });
  return merged;
}

export default async function handler(request, response) {
  setCors(request, response);
  response.setHeader("Cache-Control", "private, no-store");
  if (request.method === "OPTIONS") return response.status(204).end();

  const user = String(request.query?.user || request.body?.user || "").toLowerCase();
  if (!USERS.has(user)) return response.status(400).json({ error: "invalid_user" });
  const key = `valuetime:general-progress:${user}`;

  try {
    const raw = await redis(["GET", key]);
    const current = raw ? normalizeRecords(JSON.parse(raw)?.records) : normalizeRecords();
    if (request.method === "GET") {
      return response.status(200).json({ user, records: current });
    }
    if (request.method === "PUT") {
      const records = mergeRecords(current, normalizeRecords(request.body?.records));
      const result = { version: 1, user, records, updatedAt: new Date().toISOString() };
      await redis(["SET", key, JSON.stringify(result)]);
      return response.status(200).json(result);
    }
    response.setHeader("Allow", "GET, PUT, OPTIONS");
    return response.status(405).json({ error: "method_not_allowed" });
  } catch (error) {
    console.error("[general-progress]", error);
    return response.status(error.code === "storage_not_configured" ? 503 : 502).json({
      error: error.code || "storage_failed",
    });
  }
}
