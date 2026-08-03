import basicRaw from "./data/basic.json";
import csat2000Raw from "./data/csat2000.json";
import hyper1000Raw from "./data/hyper1000.json";
import elementary500Raw from "./data/elementary500.json";
import { normalizeWord } from "./normalizeWord.js";

const QUESTION_TYPES = {
  CSAT: ["word-to-meaning", "meaning-to-word"],
  ELEMENTARY: ["word-to-meaning", "meaning-to-word", "image-to-word", "sentence-blank"],
};

function createCourse(definition, rawWords) {
  const course = { ...definition, words: [] };
  course.words = rawWords.map((word) => normalizeWord(word, course));
  course.totalDays = new Set(course.words.map((word) => word.day)).size;
  return course;
}

const basic = createCourse({ key: "basic", mode: "suneung", label: "Basic", description: "수능 기초", daySize: 40, questionTypes: QUESTION_TYPES.CSAT }, basicRaw);
const csat2000 = createCourse({ key: "csat2000", mode: "suneung", label: "수능2000", description: "수능 핵심", daySize: 40, questionTypes: QUESTION_TYPES.CSAT }, csat2000Raw);
const hyper1000 = createCourse({ key: "hyper1000", mode: "suneung", label: "Hyper1000", description: "고난도", daySize: 34, questionTypes: QUESTION_TYPES.CSAT }, hyper1000Raw);
const elementary500 = createCourse({ key: "elementary500", mode: "kids", label: "기초500", description: "초등 전체", daySize: 10, questionTypes: QUESTION_TYPES.ELEMENTARY }, elementary500Raw);

function buildElementaryLevelCourse(level, definition) {
  const words = elementary500Raw
    .filter((word) => word.level === level)
    .map((word, index) => ({ ...word, series: definition.key, course: definition.key, day: Math.ceil((index + 1) / 10), order: (index % 10) + 1 }));
  return createCourse(definition, words);
}

const elementaryA1 = buildElementaryLevelCourse("A1", { key: "elementaryA1", mode: "kids", label: "A1 기초", description: "먼저 배워요", daySize: 10, questionTypes: QUESTION_TYPES.ELEMENTARY });
const elementaryA2 = buildElementaryLevelCourse("A2", { key: "elementaryA2", mode: "kids", label: "A2 도전", description: "한 단계 높게", daySize: 10, questionTypes: QUESTION_TYPES.ELEMENTARY });

export const SERIES = { basic, csat2000, hyper1000, elementary500, elementaryA1, elementaryA2 };

export function getDays(seriesKey) {
  const series = SERIES[seriesKey];
  if (!series) return [];
  return [...new Set(series.words.map((word) => word.day))].filter(Boolean).sort((a, b) => a - b);
}

export function getDayWords(seriesKey, day) {
  return SERIES[seriesKey]?.words.filter((word) => word.day === Number(day)) || [];
}

export function getWordById(id) {
  for (const series of Object.values(SERIES)) {
    const found = series.words.find((word) => word.id === id);
    if (found) return found;
  }
  return null;
}

const DEFAULT_TEST_LABELS = {
  wordToMeaning: "가장 알맞은 뜻을 고르세요.",
  meaningToWord: "가장 알맞은 단어를 고르세요.",
  imageToWord: "그림을 보고 단어를 고르세요.",
  sentenceBlank: "빈칸에 들어갈 단어를 고르세요.",
  imagePrompt: "그림에 알맞은 영어 단어를 고르세요.",
};

export function buildQuestions(targetWords, sourceWords, options = {}) {
  const labels = { ...DEFAULT_TEST_LABELS, ...(options.labels || {}) };
  return targetWords.map((word, index) => {
    const course = SERIES[word.course || word.series];
    const configuredTypes = options.questionTypes || course?.questionTypes || QUESTION_TYPES.CSAT;
    let direction = configuredTypes[index % configuredTypes.length];
    if (direction === "image-to-word" && !word.imageUrl) direction = word.exampleEn ? "sentence-blank" : "meaning-to-word";
    if (direction === "sentence-blank" && !word.exampleEn) direction = "meaning-to-word";

    const answer = direction === "word-to-meaning" ? word.meaningKo : word.word;
    const candidates = sourceWords
      .filter((candidate) => candidate.id !== word.id)
      .map((candidate) => direction === "word-to-meaning" ? candidate.meaningKo : candidate.word)
      .filter((value, candidateIndex, values) => value && value !== answer && values.indexOf(value) === candidateIndex);
    const offset = (Number(word.index) * 7 || index * 7) % Math.max(1, candidates.length);
    const distractors = Array.from({ length: 3 }, (_, choiceIndex) => candidates[(offset + choiceIndex * 11) % candidates.length]);
    const answerIndex = (Number(word.index) || index) % 4;
    const choices = [...distractors];
    choices.splice(answerIndex, 0, answer);
    const escapedWord = word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return {
      id: `${word.id}-${direction}`,
      word,
      direction,
      prompt: direction === "sentence-blank"
        ? word.exampleEn.replace(new RegExp(`\\b${escapedWord}\\b`, "i"), "____")
        : direction === "image-to-word" ? labels.imagePrompt
          : direction === "word-to-meaning" ? word.word : word.meaningKo,
      label: direction === "sentence-blank" ? labels.sentenceBlank
        : direction === "image-to-word" ? labels.imageToWord
          : direction === "word-to-meaning" ? labels.wordToMeaning : labels.meaningToWord,
      imageUrl: direction === "image-to-word" ? word.imageUrl : null,
      choices,
      answerIndex,
    };
  });
}
