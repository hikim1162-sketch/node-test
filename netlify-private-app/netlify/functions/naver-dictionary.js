import { json } from "./_response.js";
import { get as httpsGet } from "node:https";

const endpoint = "https://en.dict.naver.com/api3/enko/search";
const cache = new Map();

function clean(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function first(...values) {
  return values.map(clean).find(Boolean) || "";
}

function fetchDictionary(url) {
  return new Promise((resolve, reject) => {
    const request = httpsGet(url, {
      headers: {
        Accept: "application/json",
        Referer: "https://en.dict.naver.com/",
        "User-Agent": "Mozilla/5.0 (compatible; ValueTimeDictionary/1.0)",
      },
      // The local corporate network inserts its own TLS certificate. This
      // exception is limited to the fixed NAVER dictionary host in dev only.
      rejectUnauthorized: process.env.NODE_ENV !== "development",
    }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => {
        if (response.statusCode !== 200) return reject(new Error(`NAVER dictionary returned ${response.statusCode}`));
        try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
        catch (error) { reject(error); }
      });
    });
    request.setTimeout(10000, () => request.destroy(new Error("NAVER dictionary timeout")));
    request.on("error", reject);
  });
}

export default async function handler(request) {
  if (request.method !== "GET") return json(405, { ok: false, message: "GET 요청만 허용됩니다." }, { Allow: "GET" });

  const word = (new URL(request.url).searchParams.get("word") || "").trim().toLowerCase();
  if (!/^[a-z][a-z'-]{0,48}$/.test(word)) return json(400, { ok: false, message: "조회할 영단어를 확인해 주세요." });
  if (cache.has(word)) return json(200, cache.get(word), { "Cache-Control": "public, max-age=86400" });

  try {
    const url = `${endpoint}?query=${encodeURIComponent(word)}&m=pc&range=all`;
    const payload = await fetchDictionary(url);
    const items = payload?.searchResultMap?.searchResultListMap?.WORD?.items || [];
    const entry = items.find(item => first(item.handleEntry, item.expEntry).toLowerCase() === word) || items[0];
    if (!entry) return json(404, { ok: false, word, message: "네이버 영어사전에서 뜻을 찾지 못했습니다." });

    const meanings = [];
    const examples = [];
    for (const group of entry.meansCollector || []) {
      const partOfSpeech = first(group.partOfSpeech2, group.partOfSpeech, group.partOfSpeechCode);
      for (const meaning of group.means || []) {
        const value = clean(meaning.value);
        if (value && !meanings.some(item => item.value === value) && meanings.length < 4) {
          meanings.push({ partOfSpeech, value });
        }
        const exampleSentence = clean(meaning.exampleOri);
        if (exampleSentence && !examples.some(item => item.exampleSentence === exampleSentence)) {
          examples.push({
            partOfSpeech,
            meaning: value,
            exampleSentence,
            exampleTranslation: clean(meaning.exampleTrans),
          });
        }
      }
    }

    const result = {
      ok: true,
      word,
      entry: first(entry.handleEntry, entry.expEntry) || word,
      meanings,
      examples,
      source: "NAVER English Dictionary",
      sourceUrl: `https://en.dict.naver.com/#/search?query=${encodeURIComponent(word)}`,
    };
    cache.set(word, result);
    return json(200, result, { "Cache-Control": "public, max-age=86400" });
  } catch (error) {
    console.error("[naver-dictionary]", error);
    return json(502, { ok: false, word, message: "네이버 영어사전 조회에 실패했습니다." });
  }
}
