import crypto from "node:crypto";
import { authCookie, createToken, json } from "./_auth.js";

function safeEqual(left, right) {
  const a = Buffer.from(String(left)); const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async request => {
  if (request.method !== "POST") return json(405, { message:"POST 요청만 허용됩니다." }, { Allow:"POST" });
  const expectedPassword = process.env.SITE_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!expectedPassword || !secret) return json(500, { message:"서버 환경변수가 설정되지 않았습니다." });
  let body; try { body = await request.json(); } catch { return json(400, { message:"잘못된 요청입니다." }); }
  if (!safeEqual(body.password || "", expectedPassword)) return json(401, { message:"비밀번호가 올바르지 않습니다." });
  const secure = new URL(request.url).protocol === "https:";
  return json(200, { authenticated:true }, { "Set-Cookie":authCookie(createToken(secret), secure) });
};
