import { createServer } from "node:http";
import { get as httpsGet } from "node:https";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

const newsSections = [
  { theme: "국내", category: "National", url: "https://www.koreaherald.com/National" },
  { theme: "해외", category: "World", url: "https://www.koreaherald.com/World" },
  // The technology page begins with one site-wide "Latest News" card before
  // its own section, so skip that card and select the first technology item.
  { theme: "IT", category: "Technology", url: "https://www.koreaherald.com/Business/Technology", skipLeading: 1 },
];
let dailyNewsCache = { date: "", articles: [] };
const sentenceSearchCache = new Map();

function decodeHtml(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim();
}

function meta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const first = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i"));
  const reversed = html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, "i"));
  return decodeHtml(first?.[1] || reversed?.[1] || "");
}

async function fetchText(url) {
  const target = new URL(url);
  if (target.hostname !== "www.koreaherald.com") throw new Error("Unsupported news host");
  return new Promise((resolve, reject) => {
    const request = httpsGet(target, {
      headers: { "user-agent": "Mozilla/5.0 ValueTime/1.0" },
      // The corporate network inserts its own TLS certificate. This exception
      // is restricted to the fixed Korea Herald host checked above.
      rejectUnauthorized: false,
    }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        fetchText(new URL(response.headers.location, target).href).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`${response.statusCode} ${url}`));
        return;
      }
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
    request.setTimeout(15000, () => request.destroy(new Error(`Timeout ${url}`)));
    request.on("error", reject);
  });
}

async function fetchWebText(url, allowedHosts) {
  const target = new URL(url);
  if (!allowedHosts.includes(target.hostname)) throw new Error("Unsupported search host");
  return new Promise((resolve, reject) => {
    const request = httpsGet(target, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "accept-language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
      rejectUnauthorized: false,
    }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        fetchWebText(new URL(response.headers.location, target).href, allowedHosts).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Search returned ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
    request.setTimeout(12000, () => request.destroy(new Error("Search timeout")));
    request.on("error", reject);
  });
}

function decodeBingUrl(value = "") {
  const decoded = decodeHtml(value);
  try {
    const url = new URL(decoded);
    const encoded = url.searchParams.get("u") || "";
    if (encoded.startsWith("a1")) return Buffer.from(encoded.slice(2), "base64").toString("utf8");
    return decoded;
  } catch { return decoded; }
}

async function searchSentenceOnWeb(sentence) {
  const normalized = String(sentence || "").replace(/\s+/g, " ").trim().slice(0, 500);
  if (normalized.length < 4) throw new Error("Sentence is too short");
  if (sentenceSearchCache.has(normalized)) return sentenceSearchCache.get(normalized);
  const query = `"${normalized}" English grammar sentence structure`;
  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  const parseResults = html => [...html.matchAll(/<li class="b_algo"[^>]*>([\s\S]*?)<\/li>/gi)].map(match => {
    const block = match[1];
    const link = block.match(/<h2[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    const snippet = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    return link ? { title: decodeHtml(link[2]), url: decodeBingUrl(link[1]), snippet: decodeHtml(snippet?.[1] || "") } : null;
  }).filter(item => item && /^https?:\/\//.test(item.url)).slice(0, 3);
  const html = await fetchWebText(searchUrl, ["www.bing.com"]);
  let results = parseResults(html);
  if (!results.length) {
    const grammarTerms = [
      /\b(has|have)\s+\w+(ed|en)\b/i.test(normalized) && "present perfect English grammar",
      /\bin an effort to\b/i.test(normalized) && '"in an effort to" grammar',
      /\b(am|is|are|was|were)\s+\w+ing\b/i.test(normalized) && "progressive tense English grammar",
      /\b(which|who|that)\b/i.test(normalized) && "relative clause English grammar",
    ].filter(Boolean);
    const fallbackQuery = grammarTerms.join(" ") || `${normalized.split(/\s+/).slice(0, 10).join(" ")} English sentence structure grammar`;
    const fallbackUrl = `https://www.bing.com/search?q=${encodeURIComponent(fallbackQuery)}`;
    results = parseResults(await fetchWebText(fallbackUrl, ["www.bing.com"]));
  }
  const payload = { query, searchUrl, searchedAt: new Date().toISOString(), results };
  sentenceSearchCache.set(normalized, payload);
  return payload;
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 100000) throw new Error("Request body is too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function requestAiSentenceAnalysis(sentence, web = {}) {
  const auth = process.env.POSCO_PGPT_AUTH_BASE64;
  if (!auth) throw new Error("P-GPT authentication is not configured");
  const sourceContext = (web.results || []).slice(0, 3).map((item, index) => `${index + 1}. ${item.title}\n${item.snippet}\n${item.url}`).join("\n\n");
  const prompt = `You are a Korean English grammar tutor. Analyze the English sentence below in detail.\n\nSentence: ${sentence}\n\nWeb search context:\n${sourceContext || "No matching snippet was available. Analyze the sentence itself accurately."}\n\nReturn ONLY valid JSON with a sections array. Each section must have Korean title and Korean body. Use exactly these six sections: 자연스러운 해석, 문장 골격, 구와 절 분해, 시제·태·동사 형태, 핵심 문법, 어휘와 연어. Explain S/V/O/C/M roles, clause boundaries, modifiers, tense/aspect/voice, and important patterns. Do not use markdown.`;
  const upstream = process.env.POSCO_PGPT_ENDPOINT || "http://aigpt.posco.net/gpgpta01-gpt/gptApi/personalApi";
  const response = await fetch(upstream, {
    method: "POST",
    headers: { authorization: `Bearer ${auth}`, "content-type": "application/json;charset=UTF-8", accept: "application/json" },
    body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], temperature: 0.15 }),
  });
  if (!response.ok) throw new Error(`P-GPT returned ${response.status}`);
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content || payload?.content || payload?.message;
  if (!content) throw new Error("P-GPT returned an empty response");
  const parsed = JSON.parse(String(content).replace(/^```json\s*|\s*```$/g, ""));
  if (!Array.isArray(parsed.sections) || !parsed.sections.length) throw new Error("P-GPT response format is invalid");
  return parsed.sections.slice(0, 8).map(section => ({ title: String(section.title || "AI 분석"), body: String(section.body || "") }));
}

async function collectLatestArticle(section) {
  const listing = await fetchText(section.url);
  const articleIds = [...listing.matchAll(/href=["'](?:https:\/\/www\.koreaherald\.com)?\/article\/(\d+)["']/gi)]
    .map(match => match[1]).filter((id, index, items) => items.indexOf(id) === index);
  const articleId = articleIds[section.skipLeading || 0];
  if (!articleId) throw new Error(`No article found for ${section.theme}`);
  const originalUrl = `https://www.koreaherald.com/article/${articleId}`;
  const detail = await fetchText(originalUrl);
  const title = meta(detail, "og:title") || meta(detail, "title");
  const description = meta(detail, "og:description") || meta(detail, "description");
  const image = meta(detail, "og:image");
  const published = meta(detail, "article:published_time") || meta(detail, "date");
  const date = published ? new Date(published).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" }) : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" });
  const safeDescription = description || "Open the original article to read the latest report.";
  return {
    id: `${section.category.toLowerCase()}-${articleId}`,
    source: "The Korea Herald", theme: section.theme, category: section.theme,
    date, dateOrder: published?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    title, dek: safeDescription, image,
    caption: "Original article thumbnail from The Korea Herald",
    originalUrl,
    summary: [safeDescription],
    sentences: [{
      en: title,
      ko: "제목을 클릭하면 실제 원문 기사에서 전체 맥락을 확인할 수 있습니다.",
      note: "오늘 갱신된 실제 기사 제목을 활용한 영어 학습 문장입니다.",
      expressions: []
    }]
  };
}

async function getDailyNews() {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  if (dailyNewsCache.date === date && dailyNewsCache.articles.length === 3) return dailyNewsCache;
  const results = await Promise.allSettled(newsSections.map(collectLatestArticle));
  const articles = results.filter(result => result.status === "fulfilled").map(result => result.value);
  if (!articles.length) throw new Error(results.map(result => result.reason?.message).filter(Boolean).join("; "));
  if (articles.length) dailyNewsCache = { date, updatedAt: new Date().toISOString(), articles };
  return dailyNewsCache;
}

createServer(async (request, response) => {
  const requested = decodeURIComponent(new URL(request.url || "/", `http://${host}:${port}`).pathname);
  if (requested === "/api/daily-news") {
    try {
      const news = await getDailyNews();
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify(news));
    } catch (error) {
      response.writeHead(503, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ error: "Daily news update failed", detail: error.message }));
    }
    return;
  }
  if (requested === "/api/sentence-web-search") {
    const sentence = new URL(request.url || "/", `http://${host}:${port}`).searchParams.get("sentence") || "";
    try {
      const result = await searchSentenceOnWeb(sentence);
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify(result));
    } catch (error) {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ query: sentence, searchUrl: `https://www.bing.com/search?q=${encodeURIComponent(`"${sentence}" English grammar`)}`, results: [], warning: error.message }));
    }
    return;
  }
  if (requested === "/api/ai-sentence-analysis" && request.method === "POST") {
    try {
      const body = await readJsonBody(request);
      const sentence = String(body.sentence || "").replace(/\s+/g, " ").trim().slice(0, 1000);
      if (sentence.length < 4) throw new Error("Sentence is too short");
      const sections = await requestAiSentenceAnalysis(sentence, body.web || {});
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ ai: true, sections }));
    } catch (error) {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ ai: false, error: error.message }));
    }
    return;
  }
  const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
  const file = path.resolve(root, relative);

  if (!file.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, host, () => {
  console.log(`ValueTime is running at http://${host}:${port}`);
});
