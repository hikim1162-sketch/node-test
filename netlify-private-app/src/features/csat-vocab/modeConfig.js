const COMMON_TABS = [
  ["study", "① 빠른 학습"],
  ["saved", "② 저장 단어"],
  ["test", "③ 테스트"],
  ["review", "④ 오답 복습"],
  ["progress", "⑤ 진도/기록"],
];

const commonLabels = {
  tabs: COMMON_TABS,
  savedWordsTitle: "저장한 단어",
  savedWordsEmpty: "저장한 단어가 없습니다.",
  savedWordsEmptyDescription: "이번 Day를 모두 기억한 경우 바로 테스트로 진행할 수 있습니다.",
  reviewTitle: "오답과 헷갈린 단어",
  reviewEmpty: "아직 복습할 단어가 없습니다.",
  progressTitle: "오늘의 훈련 기록",
  testLabels: {
    wordToMeaning: "가장 알맞은 뜻을 고르세요.",
    meaningToWord: "가장 알맞은 단어를 고르세요.",
    imageToWord: "그림을 보고 단어를 고르세요.",
    sentenceBlank: "빈칸에 들어갈 단어를 고르세요.",
    imagePrompt: "그림에 알맞은 영어 단어를 고르세요.",
  },
};

export const VOCAB_MODE_CONFIGS = {
  suneung: {
    key: "suneung",
    label: "수능",
    initialSeries: "csat2000",
    seriesKeys: ["basic", "csat2000", "hyper1000"],
    canonicalProgressSeries: null,
    daySize: 40,
    questionTypes: ["word-to-meaning", "meaning-to-word"],
    labels: {
      ...commonLabels,
      pageTitle: "수능 영어 · 단어장",
      modeBadge: "수능모드",
      todayWords: (count) => `오늘의 ${count}단어`,
      overallProgress: "전체 암기 진도율",
      rating: { known: "암기함", confused: "헷갈림", unknown: "모름" },
      reviewEmptyDescription: "테스트 오답과 ‘헷갈림·모름’ 단어가 여기에 자동으로 모입니다.",
    },
  },
  middle: {
    key: "middle",
    label: "중등",
    initialSeries: "basic",
    seriesKeys: ["basic"],
    canonicalProgressSeries: null,
    daySize: 40,
    questionTypes: ["word-to-meaning", "meaning-to-word"],
    labels: {
      ...commonLabels,
      pageTitle: "중등 영어 · 단어장",
      modeBadge: "중등모드",
      todayWords: (count) => `오늘의 ${count}단어`,
      overallProgress: "전체 암기 진도율",
      rating: { known: "암기함", confused: "헷갈림", unknown: "모름" },
      reviewEmptyDescription: "테스트 오답과 ‘헷갈림·모름’ 단어가 여기에 자동으로 모입니다.",
    },
  },
  kids: {
    key: "kids",
    label: "초등",
    initialSeries: "elementary500",
    seriesKeys: ["elementary500", "elementaryA1", "elementaryA2"],
    canonicalProgressSeries: "elementary500",
    daySize: 10,
    questionTypes: ["word-to-meaning", "meaning-to-word", "image-to-word", "sentence-blank"],
    labels: {
      ...commonLabels,
      pageTitle: "초등 영어 · 단어장",
      modeBadge: "초등모드",
      todayWords: (count) => `오늘의 ${count}단어`,
      overallProgress: "전체 학습 진도율",
      rating: { known: "알아요", confused: "헷갈려요", unknown: "몰라요" },
      reviewEmptyDescription: "테스트 오답과 ‘헷갈려요·몰라요’ 단어가 여기에 자동으로 모입니다.",
    },
  },
};

export function getVocabModeConfig(mode) {
  if (mode === "kids" || mode === "elementary") return VOCAB_MODE_CONFIGS.kids;
  if (mode === "middle") return VOCAB_MODE_CONFIGS.middle;
  return VOCAB_MODE_CONFIGS.suneung;
}
