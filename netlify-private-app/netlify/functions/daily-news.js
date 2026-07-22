import { json } from "./_response.js";

const ARTICLE_SOURCES = [
  { id: "business-10438888", url: "https://www.koreaherald.com/article/10438888" },
  { id: "travel-10432202", url: "https://www.koreaherald.com/article/10432202" },
  { id: "retail-10434176", url: "https://www.koreaherald.com/article/10434176" },
];
const CACHE_TTL_MS = 60 * 60 * 1000;
let memoryCache = { expiresAt: 0, payload: null };

function decodeHtml(value = "") {
  const entities = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match);
}

function stripHtml(value = "") {
  return decodeHtml(String(value)
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function meta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i"),
  ];
  return decodeHtml(patterns.map(pattern => html.match(pattern)?.[1]).find(Boolean) || "");
}

export function extractOriginalArticleParagraphs(html = "") {
  const bodyMatch = String(html).match(/<article\b(?=[^>]*\bid=["']articleText["'])(?=[^>]*\bclass=["'][^"']*\barticle-body\b[^"']*["'])[^>]*>([\s\S]*?)<\/article>/i)
    || String(html).match(/<article\b[^>]*\bid=["']articleText["'][^>]*>([\s\S]*?)<\/article>/i);
  if (!bodyMatch) return [];
  const paragraphs = [...bodyMatch[1].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(match => stripHtml(match[1]))
    .filter(text => text.length >= 40)
    .filter(text => {
      const letters = (text.match(/[A-Za-z]/g) || []).length;
      return letters / Math.max(text.length, 1) >= 0.55;
    });
  return [...new Set(paragraphs)];
}

async function fetchArticle(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ValueTimeLearning/1.0; +https://valuetime.netlify.app)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Korea Herald returned ${response.status}`);
    const html = await response.text();
    const originalArticleParagraphs = extractOriginalArticleParagraphs(html);
    if (originalArticleParagraphs.length < 3) throw new Error(`Only ${originalArticleParagraphs.length} article paragraphs were found`);
    const publishedAt = meta(html, "article:published_time") || meta(html, "date");
    return {
      id: source.id,
      source: "The Korea Herald",
      originalUrl: source.url,
      title: meta(html, "og:title") || meta(html, "title"),
      dek: meta(html, "og:description") || meta(html, "description"),
      image: meta(html, "og:image"),
      publishedAt,
      dateOrder: publishedAt ? publishedAt.slice(0, 10) : "",
      originalArticleParagraphs,
      originalArticleText: originalArticleParagraphs.join("\n\n"),
      originalArticleStatus: "available",
      parsedWith: "article#articleText.article-body > p",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function loadArticles() {
  const settled = await Promise.allSettled(ARTICLE_SOURCES.map(fetchArticle));
  return settled.map((result, index) => result.status === "fulfilled" ? result.value : {
    id: ARTICLE_SOURCES[index].id,
    source: "The Korea Herald",
    originalUrl: ARTICLE_SOURCES[index].url,
    originalArticleParagraphs: [],
    originalArticleText: "",
    originalArticleStatus: "unavailable",
    parseError: result.reason?.message || "Article parsing failed",
  });
}

export default async function handler(request) {
  if (request.method !== "GET") return json(405, { ok: false, message: "GET 요청만 지원합니다." }, { Allow: "GET" });
  if (memoryCache.payload && memoryCache.expiresAt > Date.now()) {
    return json(200, { ...memoryCache.payload, cached: true }, { "Netlify-CDN-Cache-Control": "public, durable, max-age=1800, stale-while-revalidate=3600" });
  }
  try {
    const articles = await loadArticles();
    const payload = { ok: true, fetchedAt: new Date().toISOString(), articles };
    memoryCache = { payload, expiresAt: Date.now() + CACHE_TTL_MS };
    return json(200, payload, { "Netlify-CDN-Cache-Control": "public, durable, max-age=1800, stale-while-revalidate=3600" });
  } catch (error) {
    console.error("[daily-news]", error);
    return json(502, { ok: false, message: "기사 원문을 불러오지 못했습니다." });
  }
}
