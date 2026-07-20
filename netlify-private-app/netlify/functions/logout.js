import { clearCookie, json } from "./_auth.js";

export default async request => {
  if (request.method !== "POST") return json(405, { message:"POST 요청만 허용됩니다." }, { Allow:"POST" });
  const secure = new URL(request.url).protocol === "https:";
  return json(200, { authenticated:false }, { "Set-Cookie":clearCookie(secure) });
};
