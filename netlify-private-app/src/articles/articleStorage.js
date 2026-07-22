import { getCurrentUser, getProfileItem, getStoredAudienceMode, modeFromAudience, setProfileItem } from "../profiles/profileStorage.js";

const ARTICLES_KEY = "value_time_personal_articles_v1";
const MIN_ARTICLE_LENGTH = 120;
const COMMON_WORDS = new Set("the a an and or but if then than to of in on at for from with by as is are was were be been being it its this that these those they them their he she we you i not can could will would should may might has have had do does did about into over after before more most some such also very when where who which what how".split(" "));

export function parseTextToSentences(fullText) {
  return String(fullText || "")
    .replace(/\s+/g, " ")
    .match(/[^.!?]+(?:[.!?]+|$)/g)?.map(sentence => sentence.trim()).filter(sentence => sentence.length >= 12) || [];
}

export function extractWordsFromText(fullText) {
  const counts = new Map();
  for (const token of String(fullText || "").toLowerCase().match(/[a-z][a-z'-]{2,}/g) || []) {
    const word = token.replace(/^['-]+|['-]+$/g, "");
    if (!word || COMMON_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 30).map(([word, count]) => ({ word, count }));
}

function activeProfile() {
  const mode = modeFromAudience(getStoredAudienceMode());
  return { mode, user: getCurrentUser(mode) };
}

export function loadArticles() {
  const { mode } = activeProfile();
  try {
    const stored = JSON.parse(getProfileItem(mode, ARTICLES_KEY, false) || "[]");
    return Array.isArray(stored) ? stored.filter(article => article?.id && article?.fullText) : [];
  } catch {
    return [];
  }
}

function persistArticles(articles) {
  const { mode } = activeProfile();
  setProfileItem(mode, ARTICLES_KEY, JSON.stringify(articles));
}

export function createArticleRecord({ sourceUrl = "", sourceTitle = "", fullText, importMethod }) {
  const cleanText = String(fullText || "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (cleanText.length < MIN_ARTICLE_LENGTH) throw new Error(`원문을 ${MIN_ARTICLE_LENGTH}자 이상 입력해 주세요.`);
  const { mode, user } = activeProfile();
  const createdAt = new Date().toISOString();
  return {
    id: `personal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sourceUrl: String(sourceUrl || "").trim(), sourceTitle: String(sourceTitle || "").trim(), fullText: cleanText,
    importMethod: importMethod === "auto" ? "auto" : "manual", createdAt, mode, user,
    sentences: parseTextToSentences(cleanText), extractedWords: extractWordsFromText(cleanText),
    bookmarks: [], notes: {}, lastReadIndex: 0,
  };
}

export function saveArticle(record, { overwrite = false } = {}) {
  const articles = loadArticles();
  const duplicateIndex = record.sourceUrl ? articles.findIndex(article => article.sourceUrl === record.sourceUrl) : -1;
  if (duplicateIndex >= 0 && !overwrite) {
    const error = new Error("이미 저장된 URL입니다.");
    error.code = "DUPLICATE_URL";
    throw error;
  }
  if (duplicateIndex >= 0) articles.splice(duplicateIndex, 1, { ...record, id: articles[duplicateIndex].id });
  else articles.unshift(record);
  persistArticles(articles.slice(0, 100));
  return duplicateIndex >= 0 ? articles[duplicateIndex] : record;
}

export function updateArticleLearning(id, changes) {
  const articles = loadArticles();
  const index = articles.findIndex(article => article.id === id);
  if (index < 0) return null;
  articles[index] = { ...articles[index], ...changes };
  persistArticles(articles);
  return articles[index];
}

export function toNewsArticle(record) {
  const html = value => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const paragraphs = record.fullText.split(/\n\s*\n/).map(text => text.replace(/\s+/g, " ").trim()).filter(Boolean);
  const sentences = (record.sentences.length ? record.sentences : parseTextToSentences(record.fullText)).slice(0, 40);
  const words = record.extractedWords.slice(0, 12);
  const host = (() => { try { return new URL(record.sourceUrl).hostname.replace(/^www\./, ""); } catch { return "Personal Diary"; } })();
  return {
    id: record.id, source: host || "Personal Diary", category: "My Diary",
    date: new Date(record.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    dateOrder: record.createdAt.slice(0, 10), title: html(record.sourceTitle || "My Imported English Article"),
    dek: `${record.importMethod === "auto" ? "URL에서 자동으로 가져온" : "직접 붙여넣어 저장한"} 개인 영어 학습 원문입니다.`,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    caption: "Personal English learning diary",
    originalUrl: record.sourceUrl || "#", contentStatus: "personal_import", importMethod: record.importMethod,
    bodyParagraphs: paragraphs.map(text => ({ text: html(text), translation: "" })), fullText: record.fullText,
    summary: sentences.slice(0, 3).map(html), extractedWords: words, personalNotes: record.notes || {}, personalBookmarks: record.bookmarks || [],
    sentences: sentences.map((en, index) => {
      const selectedWords = words.length ? words.slice(index % words.length, index % words.length + 2) : [];
      return {
        en: html(en), ko: "직접 해석을 메모해 보세요.", note: "개인 다이어리에 가져온 문장입니다. 핵심 동사와 문장 구조를 먼저 찾아보세요.",
        expressions: selectedWords.length ? selectedWords.map(item => ({ term: item.word, meaning: "문맥에서 뜻 확인" })) : [{ term: "key idea", meaning: "문장의 핵심 내용" }],
      };
    }),
  };
}

export { ARTICLES_KEY, MIN_ARTICLE_LENGTH };
