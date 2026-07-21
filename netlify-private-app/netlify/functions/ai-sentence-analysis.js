import { json, readCookie, verifyToken } from "./_auth.js";

export default async function handler(request) {
  if (request.method !== "POST") return json(405, { ai: false, message: "POST 요청만 허용됩니다." }, { Allow: "POST" });
  if (!verifyToken(readCookie(request), process.env.AUTH_SECRET)) return json(401, { ai: false, message: "로그인이 필요합니다." });

  const auth = process.env.POSCO_PGPT_AUTH_BASE64;
  const endpoint = process.env.POSCO_PGPT_ENDPOINT || "http://aigpt.posco.net/gpgpta01-gpt/gptApi/personalApi";
  if (!auth) return json(503, { ai: false, message: "AI 분석 환경변수가 설정되지 않았습니다." });

  try {
    const payload = await request.json();
    const sentence = String(payload.sentence || "").replace(/\s+/g, " ").trim().slice(0, 1000);
    if (sentence.length < 4) return json(400, { ai: false, message: "분석할 문장이 너무 짧습니다." });

    const prompt = `You are a Korean English learning tutor. Help the user understand and learn this sentence: ${sentence}\nReturn ONLY valid JSON with a sections array. Use exactly four sections in this order and these exact Korean titles: 문장 번역, 문장 문법적 해석, 자주 착각하는 문법, 유사문장. 문장 번역 includes natural Korean translation, useful literal translation, and one-line meaning summary. 문장 문법적 해석 combines S/V/O/C or clause structure, essential grammar points, and practical reading order. 자주 착각하는 문법 explains what learners misread, why, and the correct reading direction. 유사문장 provides 2-3 new English examples, Korean translations, and the shared pattern. Keep it concise and actionable. Do not use markdown.`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${auth}`, "content-type": "application/json;charset=UTF-8", accept: "application/json" },
      body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], temperature: 0.15 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!upstream.ok) throw new Error(`AI service returned ${upstream.status}`);
    const result = await upstream.json();
    const content = result?.choices?.[0]?.message?.content || result?.content || result?.message;
    const parsed = JSON.parse(String(content || "").replace(/^```json\s*|\s*```$/g, ""));
    if (!Array.isArray(parsed.sections) || !parsed.sections.length) throw new Error("AI response format is invalid");
    return json(200, { ai: true, sections: parsed.sections.slice(0, 8).map(section => ({ title: String(section.title || "AI 분석"), body: String(section.body || "") })) });
  } catch (error) {
    return json(200, { ai: false, message: error.name === "AbortError" ? "AI 분석 시간이 초과되었습니다." : error.message });
  }
}
