const STORAGE_KEY = "valuetime_learning_contents_v1";

export const CONTENT_TYPES = {
  daily_sentence: "매일 1문장",
  ted_learning: "TED 학습",
};

export const CONTENT_STATUSES = {
  draft: "초안",
  scheduled: "예약",
  published: "공개",
  hidden: "숨김",
};

export const seedLearningContents = [
  {
    id: "daily-will-001",
    type: "daily_sentence",
    title: "앞으로 할 일을 말하는 표현",
    publishDate: "2026-07-29",
    status: "published",
    estimatedTime: 1,
    expressionEn: "will + verb",
    expressionKo: "앞으로 ~할 것이다",
    mainSentenceEn: "I will check the schedule this afternoon.",
    mainSentenceKo: "오늘 오후에 일정을 확인하겠습니다.",
    descriptionText: "앞으로 할 행동이나 결정을 간단히 말할 때 사용합니다.",
    nuanceText: "말하는 순간의 결정이나 미래에 대한 예측에 자연스럽습니다.",
    usageText: "업무 계획, 약속, 즉석 결정에 사용할 수 있습니다.",
    examples: [
      { sentenceEn: "We will share the results tomorrow.", sentenceKo: "내일 결과를 공유하겠습니다." },
    ],
    quizzes: [
      {
        questionText: "앞으로 할 일을 자연스럽게 말한 문장을 고르세요.",
        choices: ["I will call you later.", "I called you later.", "I calling you later."],
        correctAnswer: 0,
        explanation: "will 뒤에는 동사원형이 옵니다.",
      },
    ],
  },
  {
    id: "ted-listening-001",
    type: "ted_learning",
    title: "말하기보다 먼저 들어야 하는 이유",
    publishDate: "2026-07-29",
    status: "published",
    estimatedTime: 3,
    tedTitle: "The Power of Listening",
    tedSummary: "좋은 대화가 상대의 말을 온전히 듣는 데서 시작된다는 메시지를 살펴봅니다.",
    speakerName: "Julian Treasure",
    speakerDesc: "소리와 의사소통을 연구하는 연사",
    contextText: "화자는 더 잘 말하는 방법에 앞서, 서로를 이해하기 위해 듣는 습관이 필요하다고 설명합니다.",
    keySentenceEn: "Conscious listening creates understanding.",
    keySentenceKo: "의식적으로 듣는 태도는 이해를 만듭니다.",
    expressionNote: "conscious listening은 주의를 기울여 의도적으로 듣는 태도를 뜻합니다.",
    messageNote: "소통의 출발점을 말하기 기술이 아니라 이해하려는 듣기 태도로 봅니다.",
    previousFlow: "현대인이 점점 듣는 능력을 잃고 있다는 문제를 제기합니다.",
    nextFlow: "일상에서 듣기 능력을 회복하는 실천법을 소개합니다.",
    takeawayText: "이해하려는 마음으로 듣는 것이 좋은 대화의 시작입니다.",
    videoUrl: "https://www.ted.com/",
    quizzes: [
      {
        questionText: "화자가 강조하는 좋은 소통의 출발점은 무엇인가요?",
        choices: ["빠르게 대답하기", "의식적으로 듣기", "어려운 단어 사용하기"],
        correctAnswer: 1,
        explanation: "화자는 의식적인 듣기가 상대를 이해하게 만든다고 강조합니다.",
      },
    ],
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeContent(content) {
  return {
    ...content,
    id: String(content.id || `content-${Date.now()}`),
    type: CONTENT_TYPES[content.type] ? content.type : "daily_sentence",
    status: CONTENT_STATUSES[content.status] ? content.status : "draft",
    estimatedTime: Math.max(1, Number(content.estimatedTime) || 1),
    examples: Array.isArray(content.examples) ? content.examples : [],
    quizzes: Array.isArray(content.quizzes) ? content.quizzes : [],
  };
}

export function loadLearningContents() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (Array.isArray(parsed)) return parsed.map(normalizeContent);
  } catch {
    // Damaged local data falls back to the reviewed seed content.
  }
  return clone(seedLearningContents);
}

export function saveLearningContents(contents) {
  const normalized = contents.map(normalizeContent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent("valuetime:learning-contents-changed"));
  return normalized;
}

export function upsertLearningContent(content) {
  const contents = loadLearningContents();
  const normalized = normalizeContent(content);
  const index = contents.findIndex((item) => item.id === normalized.id);
  if (index >= 0) contents[index] = normalized;
  else contents.unshift(normalized);
  saveLearningContents(contents);
  return normalized;
}

export function deleteLearningContent(id) {
  saveLearningContents(loadLearningContents().filter((item) => item.id !== id));
}

export function getVisibleLearningContent(type, date = new Date()) {
  const today = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  const published = loadLearningContents()
    .filter((item) => item.type === type && item.status === "published" && item.publishDate <= today)
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return published.find((item) => item.publishDate === today) || published[0] || null;
}

export function validateLearningContent(content) {
  const errors = {};
  ["title", "publishDate", "status"].forEach((field) => {
    if (!String(content[field] || "").trim()) errors[field] = "필수 입력 항목입니다.";
  });
  if (content.type === "daily_sentence") {
    ["expressionEn", "expressionKo", "mainSentenceEn", "mainSentenceKo"].forEach((field) => {
      if (!String(content[field] || "").trim()) errors[field] = "매일 1문장 필수 항목입니다.";
    });
  } else {
    ["tedTitle", "tedSummary", "speakerName", "contextText", "keySentenceEn", "keySentenceKo", "takeawayText"].forEach((field) => {
      if (!String(content[field] || "").trim()) errors[field] = "TED 학습 필수 항목입니다.";
    });
  }
  return errors;
}

