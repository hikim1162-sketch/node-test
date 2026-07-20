import crypto from "node:crypto";

export const COOKIE_NAME = "value_time_auth";
const MAX_AGE = 60 * 60 * 24 * 7;
const encode = value => Buffer.from(value).toString("base64url");
const sign = (payload, secret) => crypto.createHmac("sha256", secret).update(payload).digest("base64url");

export function createToken(secret) {
  const payload = encode(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + MAX_AGE }));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyToken(token, secret) {
  if (!token || !secret) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Math.floor(Date.now() / 1000); }
  catch { return false; }
}

export function readCookie(request, name = COOKIE_NAME) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.split(";").map(item => item.trim()).find(item => item.startsWith(`${name}=`))?.slice(name.length + 1) || "";
}

export function authCookie(token, secure = true) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function clearCookie(secure = true) {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store", ...headers } });
}
