import { json } from "./_response.js";
import { get as httpsGet } from "node:https";
import { isDictionaryLookupText } from "../../src/selectionAssistant/isDictionaryLookupText.js";

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

export function parseNaverSynonyms(value = "") {
  const seen = new Set();
  return String(value)
    .split("|")
    .map(item => {
      const [rawWord, rawUrl] = item.split("^");
      const word = clean(rawWord).toLowerCase();
      if (!/^[a-z][a-z' -]{0,48}$/.test(word) || seen.has(word)) return null;
      seen.add(word);
      let url = `https://en.dict.naver.com/#/search?query=${encodeURIComponent(word)}`;
      try {
        const candidate = new URL(rawUrl || "");
        if (candidate.protocol === "https:" && candidate.hostname.endsWith("naver.com")) url = candidate.href;
      } catch {}
      return { word, url };
    })
    .filter(Boolean)
    .slice(0, 4);
}

export function selectNaverEntries(items = [], query = "") {
  const target = clean(query).toLowerCase();
  const normalizeEntry = item => first(item?.handleEntry, item?.expEntry)
    .toLowerCase()
    .replace(/\b(?:something|somebody|someone|one's|oneself)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const matches = items.filter(item => normalizeEntry(item) === target);
  return matches.length ? matches.slice(0, 3) : items.slice(0, 1);
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

  const requestUrl = new URL(request.url);
  const word = (requestUrl.searchParams.get("word") || "").trim().toLowerCase();
  const audioOnly = requestUrl.searchParams.get("audio") === "1";
  if (!isDictionaryLookupText(word)) return json(400, { ok: false, message: "조회할 영단어를 확인해 주세요." });
  if (cache.has(word)) {
    const cached = cache.get(word);
    if (audioOnly && cached.pronunciationAudioUrl) return Response.redirect(cached.pronunciationAudioUrl, 302);
    return json(audioOnly ? 404 : 200, audioOnly ? { ok: false, word, message: "Pronunciation audio not found." } : cached, { "Cache-Control": "no-store" });
  }

  try {
    const url = `${endpoint}?query=${encodeURIComponent(word)}&m=pc&range=all`;
    const payload = await fetchDictionary(url);
    const items = payload?.searchResultMap?.searchResultListMap?.WORD?.items || [];
    const entry = items.find(item => first(item.handleEntry, item.expEntry).toLowerCase() === word) || items[0];
    if (!entry) return json(404, { ok: false, word, message: "네이버 영어사전에서 뜻을 찾지 못했습니다." });
    const entries = selectNaverEntries(items, word);

    const meanings = [];
    const examples = [];
    for (const candidate of entries) {
      for (const group of candidate.meansCollector || []) {
        const partOfSpeech = first(group.partOfSpeech2, group.partOfSpeech, group.partOfSpeechCode);
        for (const meaning of group.means || []) {
          const value = clean(meaning.value);
          if (value && !meanings.some(item => item.value === value) && meanings.length < 6) {
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
    }

    const phonetics = entry.searchPhoneticSymbolList || [];
    const pronunciation = phonetics.find(item => /US/.test(item.symbolTypeCode) && item.symbolFile)
      || phonetics.find(item => item.symbolFile);
    const result = {
      ok: true,
      word,
      entry: first(entry.handleEntry, entry.expEntry) || word,
      phonetic: first(
        phonetics.find(item => /US/.test(item.symbolTypeCode))?.symbolValue,
        phonetics[0]?.symbolValue,
        entry.phoneticSymbol,
      ),
      pronunciationAudioUrl: pronunciation?.symbolFile || "",
      meanings,
      examples,
      synonyms: parseNaverSynonyms(entry.expSynonym),
      source: "NAVER English Dictionary",
      sourceUrl: `https://en.dict.naver.com/#/search?query=${encodeURIComponent(word)}`,
    };
    cache.set(word, result);
    if (audioOnly && result.pronunciationAudioUrl) return Response.redirect(result.pronunciationAudioUrl, 302);
    if (audioOnly) return json(404, { ok: false, word, message: "Pronunciation audio not found." });
    return json(200, result, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error("[naver-dictionary]", error);
    return json(502, { ok: false, word, message: "네이버 영어사전 조회에 실패했습니다." });
  }
}
