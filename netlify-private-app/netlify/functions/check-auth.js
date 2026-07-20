import { json, readCookie, verifyToken } from "./_auth.js";

export default async function handler(request) {
  if (request.method !== "GET") {
    return json(405, { authenticated: false, message: "GET 요청만 허용됩니다." }, { Allow: "GET" });
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return json(500, {
      authenticated: false,
      message: "AUTH_SECRET 환경변수가 설정되지 않았습니다.",
    });
  }

  const authenticated = verifyToken(readCookie(request), secret);
  return json(authenticated ? 200 : 401, { authenticated });
}
