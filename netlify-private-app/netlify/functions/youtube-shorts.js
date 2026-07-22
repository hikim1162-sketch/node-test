import { json } from "./_response.js";

const API_ROOT = "https://www.googleapis.com/youtube/v3";
const TARGET_PHRASE = "매일 미드 한문장";
const DEFAULT_HANDLE = "Englishlamp2024";
const CACHE_TTL_MS = 30 * 60 * 1000;
let memoryCache = { key: "", expiresAt: 0, payload: null };

export function normalizeTitle(text = "") {
  return String(text).normalize("NFKC").replace(/\s+/g, "").trim().toLowerCase();
}

export function isTargetTitle(title = "") {
  return normalizeTitle(title).includes(normalizeTitle(TARGET_PHRASE));
}

export function parseISODuration(duration = "") {
  const match = String(duration).match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return 0;
  return Number(match[1] || 0) * 86400 + Number(match[2] || 0) * 3600 + Number(match[3] || 0) * 60 + Number(match[4] || 0);
}

export function isShortFormVideo(durationInSeconds) {
  return durationInSeconds > 0 && durationInSeconds <= 60;
}

function bestThumbnail(thumbnails = {}) {
  return thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || "";
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function mapYoutubeVideoToCardData(item) {
  const videoId = item.id;
  const seconds = parseISODuration(item.contentDetails?.duration);
  return {
    videoId,
    title: item.snippet?.title || "",
    thumbnailUrl: bestThumbnail(item.snippet?.thumbnails),
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    shortsUrl: `https://www.youtube.com/shorts/${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    publishedAt: item.snippet?.publishedAt || "",
    duration: item.contentDetails?.duration || "",
    durationSeconds: seconds,
    durationLabel: formatDuration(seconds),
    channelTitle: item.snippet?.channelTitle || "",
    liveBroadcastContent: item.snippet?.liveBroadcastContent || "none",
    embeddable: item.status?.embeddable !== false,
    privacyStatus: item.status?.privacyStatus || "public",
    isShortForm: isShortFormVideo(seconds),
  };
}

async function youtube(path, params, apiKey) {
  const url = new URL(`${API_ROOT}/${path}`);
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = payload?.error?.errors?.[0]?.reason || payload?.error?.message || `HTTP ${response.status}`;
    throw new Error(`YouTube API ${path} failed: ${reason}`);
  }
  return payload;
}

async function resolveChannel(apiKey) {
  const configuredId = String(process.env.YOUTUBE_CHANNEL_ID || "").trim();
  const handle = String(process.env.YOUTUBE_CHANNEL_HANDLE || DEFAULT_HANDLE).replace(/^@/, "").trim();
  const params = { part: "id,snippet,contentDetails", maxResults: 1 };
  if (configuredId) params.id = configuredId;
  else params.forHandle = handle;
  const result = await youtube("channels", params, apiKey);
  const channel = result.items?.[0];
  if (!channel) throw new Error(`YouTube channel not found: ${configuredId || `@${handle}`}`);
  return {
    channelId: channel.id,
    channelTitle: channel.snippet?.title || "",
    uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || "",
    handle: `@${handle}`,
  };
}

async function loadFeed(apiKey) {
  const channel = await resolveChannel(apiKey);
  if (!channel.uploadsPlaylistId) throw new Error("Channel uploads playlist was not returned");
  const uploads = await youtube("playlistItems", {
    part: "snippet,contentDetails,status",
    playlistId: channel.uploadsPlaylistId,
    maxResults: 50,
  }, apiKey);
  const ids = [...new Set((uploads.items || []).map(item => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId).filter(Boolean))];
  if (!ids.length) return { channel, videos: [] };
  const details = await youtube("videos", {
    part: "snippet,contentDetails,status",
    id: ids.join(","),
    maxResults: 50,
  }, apiKey);
  const videos = (details.items || [])
    .map(mapYoutubeVideoToCardData)
    .filter(item => isTargetTitle(item.title))
    .filter(item => item.privacyStatus === "public" && item.liveBroadcastContent === "none")
    .filter(item => item.embeddable && item.isShortForm)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return { channel, videos };
}

export default async function handler(request) {
  if (request.method !== "GET") return json(405, { ok: false, message: "GET 요청만 지원합니다." }, { Allow: "GET" });
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return json(503, { ok: false, code: "missing_configuration", message: "오늘의 쇼츠를 불러올 준비가 아직 되지 않았습니다." });

  const cacheKey = `${process.env.YOUTUBE_CHANNEL_ID || ""}:${process.env.YOUTUBE_CHANNEL_HANDLE || DEFAULT_HANDLE}`;
  if (memoryCache.key === cacheKey && memoryCache.expiresAt > Date.now() && memoryCache.payload) {
    return json(200, { ...memoryCache.payload, cached: true }, { "Netlify-CDN-Cache-Control": "public, durable, max-age=900, stale-while-revalidate=1800" });
  }

  try {
    const result = await loadFeed(apiKey);
    const payload = { ok: true, fetchedAt: new Date().toISOString(), targetPhrase: TARGET_PHRASE, ...result };
    memoryCache = { key: cacheKey, expiresAt: Date.now() + CACHE_TTL_MS, payload };
    return json(200, payload, { "Netlify-CDN-Cache-Control": "public, durable, max-age=900, stale-while-revalidate=1800" });
  } catch (error) {
    console.error("[youtube-shorts]", error);
    return json(502, { ok: false, message: "오늘의 쇼츠를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요." });
  }
}
