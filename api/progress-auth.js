import crypto from "node:crypto";

const COOKIE_NAME = "vt_progress_session";
const SESSION_VALUE = "progress-sync-v1";

function sessionToken(secret) {
  return crypto.createHmac("sha256", secret).update(SESSION_VALUE).digest("hex");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const password = String(request.body?.password || "");
  const expected = process.env.SITE_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!expected || !secret) {
    return response.status(503).json({ error: "auth_not_configured" });
  }
  if (!safeEqual(password, expected)) {
    return response.status(401).json({ error: "invalid_password" });
  }

  response.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${sessionToken(secret)}; Path=/api/progress-; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`,
  );
  return response.status(200).json({ ok: true });
}

