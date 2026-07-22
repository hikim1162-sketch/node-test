import { json } from "./_response.js";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const MAX_BYTES = 2_000_000;
const MIN_TEXT = 120;

function decodeHtml(value = "") {
  return String(value)
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/[ \t]+/g, " ").replace(/\n[ \t]+/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function safeUrl(value) {
  let url;
  try { url = new URL(value); } catch { return null; }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host === "0.0.0.0" || host === "::1") return null;
  if (isIP(host) && (/^(10|127|169\.254|192\.168)\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host))) return null;
  return url;
}

function privateAddress(address) {
  const normalized = String(address).toLowerCase();
  return /^(10|127|169\.254|192\.168)\./.test(normalized)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(normalized)
    || normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

async function assertPublicHost(url) {
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(item => privateAddress(item.address))) throw new Error("Private network address is not allowed");
}

async function fetchPublicHtml(initialUrl) {
  let current = initialUrl;
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    await assertPublicHost(current);
    const response = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(12000), headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "Mozilla/5.0 (compatible; ValueTimePersonalReader/1.0)" } });
    if (![301, 302, 303, 307, 308].includes(response.status)) return { response, finalUrl: current };
    const location = response.headers.get("location");
    const next = location ? safeUrl(new URL(location, current).href) : null;
    if (!next) throw new Error("Unsafe redirect");
    current = next;
  }
  throw new Error("Too many redirects");
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return decodeHtml(html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1]
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i"))?.[1] || "");
}

function extractArticle(html) {
  const cleanHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
  const title = metaContent(cleanHtml, "og:title") || decodeHtml(cleanHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const candidate = cleanHtml.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]
    || cleanHtml.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]
    || cleanHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || "";
  const paragraphs = [...candidate.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(match => decodeHtml(match[1])).filter(text => text.length >= 35 && /[A-Za-z]{3}/.test(text));
  const unique = paragraphs.filter((text, index) => paragraphs.indexOf(text) === index);
  return { sourceTitle: title.slice(0, 300), fullText: unique.join("\n\n").slice(0, 100_000) };
}

export default async function handler(request) {
  if (request.method !== "GET") return json(405, { ok: false, message: "GET 요청만 허용됩니다." }, { Allow: "GET" });
  const sourceUrl = safeUrl(new URL(request.url).searchParams.get("url") || "");
  if (!sourceUrl) return json(400, { ok: false, message: "공개된 http 또는 https 뉴스 URL을 확인해 주세요." });
  try {
    const { response, finalUrl } = await fetchPublicHtml(sourceUrl);
    if (!response.ok) return json(422, { ok: false, message: `원문 사이트가 요청을 허용하지 않았습니다. (${response.status})` });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) return json(422, { ok: false, message: "HTML 기사 페이지가 아닙니다." });
    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (declaredSize > MAX_BYTES) return json(413, { ok: false, message: "페이지 크기가 너무 커서 자동 추출할 수 없습니다." });
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) return json(413, { ok: false, message: "페이지 크기가 너무 커서 자동 추출할 수 없습니다." });
    const extracted = extractArticle(new TextDecoder().decode(buffer));
    if (extracted.fullText.length < MIN_TEXT) return json(422, { ok: false, message: "자동으로 원문을 가져오지 못했습니다." });
    return json(200, { ok: true, sourceUrl: finalUrl.href, ...extracted });
  } catch (error) {
    console.error("[article-extract]", error);
    return json(502, { ok: false, message: "자동으로 원문을 가져오지 못했습니다." });
  }
}
