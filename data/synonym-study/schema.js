import { defaultSourcePriority } from "./sources.js";

const LEVELS = new Set(["basic", "intermediate", "advanced"]);
const FREQUENCIES = new Set(["high", "medium", "low"]);
const QUIZ_TYPES = new Set(["synonym_select", "blank", "context_match", "meaning_match"]);

export function defineSynonymEntry(entry) {
  const normalized = {
    ...entry,
    sourcePriority: entry.sourcePriority || defaultSourcePriority,
    additionalSynonyms: entry.additionalSynonyms || [],
    distractors: entry.distractors || [],
    collocations: entry.collocations || [],
    quizTypes: entry.quizTypes || ["synonym_select", "blank", "context_match"],
    tags: entry.tags || [],
    status: entry.status || "active",
  };
  if (!normalized.id || !normalized.baseExpression || !normalized.targetWord) throw new Error("INVALID_SYNONYM_IDENTITY");
  if (!LEVELS.has(normalized.level)) throw new Error(`INVALID_SYNONYM_LEVEL:${normalized.id}`);
  if (!FREQUENCIES.has(normalized.examFrequency)) throw new Error(`INVALID_EXAM_FREQUENCY:${normalized.id}`);
  if (normalized.additionalSynonyms.length < 1 || normalized.additionalSynonyms.length > 3) throw new Error(`INVALID_SYNONYM_COUNT:${normalized.id}`);
  if (normalized.distractors.length < 3) throw new Error(`INSUFFICIENT_DISTRACTORS:${normalized.id}`);
  if (normalized.quizTypes.length < 2 || normalized.quizTypes.some((type) => !QUIZ_TYPES.has(type))) throw new Error(`INVALID_QUIZ_TYPES:${normalized.id}`);
  return Object.freeze(normalized);
}
