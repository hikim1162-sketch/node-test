import basic from "./data/basic.json";
import csat2000 from "./data/csat2000.json";
import hyper1000 from "./data/hyper1000.json";

export const SERIES = {
  basic: { key: "basic", label: "Basic", description: "수능 기초", words: basic },
  csat2000: { key: "csat2000", label: "수능2000", description: "수능 핵심", words: csat2000 },
  hyper1000: { key: "hyper1000", label: "Hyper1000", description: "고난도", words: hyper1000 },
};

export function getDays(seriesKey) {
  return [...new Set(SERIES[seriesKey].words.map((word) => word.day))].filter(Boolean).sort((a, b) => a - b);
}

export function getDayWords(seriesKey, day) {
  return SERIES[seriesKey].words.filter((word) => word.day === Number(day));
}

export function getWordById(id) {
  for (const series of Object.values(SERIES)) {
    const found = series.words.find((word) => word.id === id);
    if (found) return found;
  }
  return null;
}

export function buildQuestions(targetWords, sourceWords) {
  return targetWords.map((word, index) => {
    const direction = index % 2 === 0 ? "word-to-meaning" : "meaning-to-word";
    const answer = direction === "word-to-meaning" ? word.meaning_display : word.word_display;
    const candidates = sourceWords
      .filter((candidate) => candidate.id !== word.id)
      .map((candidate) => direction === "word-to-meaning" ? candidate.meaning_display : candidate.word_display)
      .filter((value, candidateIndex, values) => value && value !== answer && values.indexOf(value) === candidateIndex);
    const offset = (word.index * 7) % Math.max(1, candidates.length);
    const distractors = Array.from({ length: 3 }, (_, choiceIndex) => candidates[(offset + choiceIndex * 11) % candidates.length]);
    const answerIndex = word.index % 4;
    const choices = [...distractors];
    choices.splice(answerIndex, 0, answer);

    return {
      id: `${word.id}-${direction}`,
      word,
      direction,
      prompt: direction === "word-to-meaning" ? word.word_display : word.meaning_display,
      label: direction === "word-to-meaning" ? "가장 알맞은 뜻을 고르세요." : "가장 알맞은 단어를 고르세요.",
      choices,
      answerIndex,
    };
  });
}
