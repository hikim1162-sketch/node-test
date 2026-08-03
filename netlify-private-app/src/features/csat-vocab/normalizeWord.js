/** @typedef {import('./types').LearningMode} LearningMode */
/** @typedef {import('./types').VocabWord} VocabWord */

/**
 * Keeps legacy CSAT fields available while exposing one shared word contract.
 * @param {Record<string, any>} raw
 * @param {{ key: string, mode: LearningMode }} course
 * @returns {Record<string, any> & VocabWord}
 */
export function normalizeWord(raw, course) {
  const word = String(raw.word ?? raw.word_display ?? raw.word_raw ?? "").trim();
  const meaningKo = String(raw.meaningKo ?? raw.meaning_display ?? raw.meaning_raw ?? "").trim();
  return {
    ...raw,
    id: String(raw.id),
    mode: raw.mode || course.mode,
    course: raw.course || raw.series || course.key,
    series: raw.series || raw.course || course.key,
    day: Number(raw.day),
    order: Number(raw.order ?? raw.day_index ?? 0),
    word,
    word_display: raw.word_display || word,
    meaningKo,
    meaning_display: raw.meaning_display || meaningKo,
    pronunciation: String(raw.pronunciation || ""),
    exampleEn: String(raw.exampleEn ?? raw.example ?? ""),
    example: String(raw.example ?? raw.exampleEn ?? ""),
    exampleKo: String(raw.exampleKo ?? raw.exampleMeaning ?? ""),
    exampleMeaning: String(raw.exampleMeaning ?? raw.exampleKo ?? ""),
    audioUrl: raw.audioUrl ?? raw.audio_url ?? null,
    imageUrl: raw.imageUrl ?? raw.image_url ?? null,
    image_url: raw.image_url ?? raw.imageUrl ?? null,
  };
}
