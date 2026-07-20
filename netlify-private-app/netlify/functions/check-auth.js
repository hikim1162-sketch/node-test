import { json, readCookie, verifyToken } from "./_auth.js";

export default async request => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return json(500, { authenticated:false, message:"AUTH_SECRET이 설정되지 않았습니다." });
  const authenticated = verifyToken(readCookie(request), secret);
  return json(authenticated ? 200 : 401, { authenticated });
};
