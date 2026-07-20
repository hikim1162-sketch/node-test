import crypto from "node:crypto";
import { authCookie, createToken, json } from "./_auth.js";

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return json(405, { authenticated: false, message: "POST 요청만 허용됩니다." }, { Allow: "POST" });
  }

  const expectedPassword = process.env.SITE_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!expectedPassword || !secret) {
    return json(500, {
      authenticated: false,
      message: "SITE_PASSWORD 또는 AUTH_SECRET 환경변수가 설정되지 않았습니다.",
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { authenticated: false, message: "잘못된 로그인 요청입니다." });
  }

  if (!safeEqual(body.password || "", expectedPassword)) {
    return json(401, { authenticated: false, message: "비밀번호가 올바르지 않습니다." });
  }

  const secure = new URL(request.url).protocol === "https:";
  const token = createToken(secret);

  return json(
    200,
    { authenticated: true },
    { "Set-Cookie": authCookie(token, secure) },
  );
}
