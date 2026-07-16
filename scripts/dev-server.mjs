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
