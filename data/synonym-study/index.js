import { adjectiveDegreeData } from "./adjectives.degree.js";
import { adjectiveEmotionData } from "./adjectives.emotion.js";
import { adjectiveQualitySizeData } from "./adjectives.quality-size.js";
import { examHighFrequencyData } from "./exam-vocab.high-frequency.js";
import { expandedCoreData } from "./expanded-core.js";
import { buildSetQuiz } from "./quiz-templates.js";

export { synonymContentSources } from "./sources.js";
export { synonymStudyCategories, synonymExpansionPlan, synonymExpansionTotal } from "./categories.js";
export { dailySynonymThemes30, getTodaySynonymTheme } from "./daily-themes-30.js";

export const SYNONYM_STUDY_STORAGE_KEY = "value_time_synonym_study_v1";

export const synonymStudyData = [
  ...adjectiveDegreeData,
  ...adjectiveQualitySizeData,
  ...adjectiveEmotionData,
  ...examHighFrequencyData,
  ...expandedCoreData,
];

const setDefinitions = [
  ["syn-adjective-01", "형용사", "강도를 높이는 형용사", "very에 기대지 않고 상태의 강도를 정확히 구별합니다.", adjectiveQualitySizeData],
  ["syn-state-01", "상태", "몸과 환경의 강한 상태", "피로·배고픔·온도처럼 자주 등장하는 상태 어휘를 확장합니다.", adjectiveDegreeData],
  ["syn-emotion-01", "감정", "감정의 강도를 정확하게", "문맥 속 감정의 강도와 태도를 구별하는 연습입니다.", adjectiveEmotionData],
  ["syn-csat-01", "빈출 수능 어휘", "독해에서 자주 바뀌는 핵심어", "쉬운 동사와 형용사를 학술적 문맥의 빈출 어휘로 연결합니다.", examHighFrequencyData],
];

const expandedSetDefinitions = Array.from({ length: 8 }, (_, index) => {
  const start = index * 10;
  return [
    `syn-core-${String(index + 1).padStart(2, "0")}`,
    "핵심 확장",
    `필수 유의어 ${start + 1}–${start + 10}`,
    "기본 표현을 수능·말하기·글쓰기에 유용한 표현으로 확장합니다.",
    expandedCoreData.slice(start, start + 10),
  ];
});

export const synonymStudySets = [...setDefinitions, ...expandedSetDefinitions].map(([id, category, title, description, words]) => ({
  id, category, title, description, words, quiz: buildSetQuiz(words), status: "published",
}));

export function getSynonymStudyInitialState() {
  return { view: "sets", activeSetId: synonymStudySets[0].id, cardIndex: 0, vocabularyDay: 1, learnedWordIds: [], clearedRelatedExpressionIds: [], quizIndex: 0, quizSelections: {}, answers: [], wrongWordIds: [], completedSetIds: [], dailyThemeAnswers: {} };
}

export function normalizeSynonymStudyState(value) {
  const initial = getSynonymStudyInitialState();
  const state = value && typeof value === "object" ? { ...initial, ...value } : initial;
  ["learnedWordIds", "clearedRelatedExpressionIds", "answers", "wrongWordIds", "completedSetIds"].forEach((key) => {
    if (!Array.isArray(state[key])) state[key] = [];
  });
  if (!state.dailyThemeAnswers || typeof state.dailyThemeAnswers !== "object" || Array.isArray(state.dailyThemeAnswers)) state.dailyThemeAnswers = {};
  if (!state.quizSelections || typeof state.quizSelections !== "object" || Array.isArray(state.quizSelections)) state.quizSelections = {};
  state.vocabularyDay = Math.max(1, Math.min(30, Number(state.vocabularyDay) || 1));
  return state;
}
