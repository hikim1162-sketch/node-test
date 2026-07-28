import crypto from "node:crypto";

const USERS = new Set(["kai", "rachel", "hyuk"]);
const MODES = new Set(["normal", "middle", "suneung"]);
const COOKIE_NAME = "vt_progress_session";

function sessionToken(secret) {
  return crypto.createHmac("sha256", secret).update("progress-sync-v1").digest("hex");
}

function authorized(request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  const cookies = Object.fromEntries(String(request.headers.cookie || "").split(";").map((part) => {
    const [key, ...rest] = part.trim().split("=");
    return [key, rest.join("=")];
  }));
  const actual = Buffer.from(String(cookies[COOKIE_NAME] || ""));
  const expected = Buffer.from(sessionToken(secret));
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

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
  const result = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!result.ok) throw new Error(`storage_${result.status}`);
  const payload = await result.json();
  if (payload.error) throw new Error(payload.error);
  return payload.result;
}

function validIdentity(request) {
  const user = String(request.query?.user || request.body?.user || "").toLowerCase();
  const mode = String(request.query?.mode || request.body?.mode || "").toLowerCase();
  return USERS.has(user) && MODES.has(mode) ? { user, mode } : null;
}

function normalizeSummary(body, identity) {
  const series = Object.fromEntries(Object.entries(body?.series || {}).flatMap(([key, value]) => {
    const mastered = Math.max(0, Math.floor(Number(value?.mastered) || 0));
    const total = Math.max(mastered, Math.floor(Number(value?.total) || 0));
    if (!/^[a-z0-9_-]{1,30}$/i.test(key) || !total) return [];
    return [[key, {
      mastered,
      total,
      percent: Math.round((mastered / total) * 1000) / 10,
    }]];
  }));
  const mastered = Object.values(series).reduce((sum, item) => sum + item.mastered, 0);
  const total = Object.values(series).reduce((sum, item) => sum + item.total, 0);
  return {
    version: 1,
    ...identity,
    series,
    overall: {
      mastered,
      total,
      percent: total ? Math.round((mastered / total) * 1000) / 10 : 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");
  if (!authorized(request)) return response.status(401).json({ error: "unauthorized" });
  const identity = validIdentity(request);
  if (!identity) return response.status(400).json({ error: "invalid_identity" });
  const key = `valuetime:progress:${identity.mode}:${identity.user}`;

  try {
    if (request.method === "GET") {
      const raw = await redis(["GET", key]);
      return response.status(200).json({ summary: raw ? JSON.parse(raw) : null });
    }
    if (request.method === "PUT") {
      const summary = normalizeSummary(request.body, identity);
      await redis(["SET", key, JSON.stringify(summary)]);
      return response.status(200).json({ summary });
    }
    response.setHeader("Allow", "GET, PUT");
    return response.status(405).json({ error: "method_not_allowed" });
  } catch (error) {
    console.error("[progress-summary]", error);
    return response.status(error.code === "storage_not_configured" ? 503 : 502).json({
      error: error.code || "storage_failed",
    });
  }
}

