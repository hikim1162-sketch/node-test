export const EXPRESSION_UPGRADE_STORAGE_KEY = "value_time_expression_upgrade_v1";

const rawSets = [
  {
    id: "upgrade-set-01", title: "완전히 지친 하루", description: "VERY 없이 강한 상태를 한 단어로 표현해요.", theme: "VERY 표현", difficulty: 1,
    items: [
      ["very tired", "exhausted", "에너지가 거의 남지 않은 강한 피로예요.", "가벼운 피곤함에는 tired가 더 자연스러워요.", "I was exhausted after the overnight flight.", "밤샘 비행 후 완전히 지쳤어요."],
      ["very hungry", "starving", "매우 배고픈 상태를 구어적으로 강조해요.", "실제로 굶주리는 상황 외에도 일상에서 과장해 말할 수 있어요.", "I'm starving. Let's get something to eat.", "너무 배고파요. 뭔가 먹으러 가요."],
      ["very cold", "freezing", "몸으로 느끼는 강한 추위를 표현해요.", "날씨뿐 아니라 사람이 매우 춥다고 느낄 때도 써요.", "It's freezing outside, so wear a coat.", "밖이 몹시 추우니 외투를 입으세요."],
      ["very hot", "scorching", "견디기 힘들 만큼 뜨거운 상태예요.", "주로 날씨·햇빛·표면의 강한 열기에 사용해요.", "We stayed inside during the scorching afternoon.", "몹시 더운 오후에는 실내에 있었어요."],
      ["very scared", "terrified", "공포를 느낄 만큼 매우 무서운 상태예요.", "단순히 걱정되거나 긴장한 상태보다 강해요.", "She was terrified when she heard the noise.", "그녀는 그 소리를 듣고 몹시 무서워했어요."],
    ],
  },
  {
    id: "upgrade-set-02", title: "감정을 더 생생하게", description: "감정과 평가의 강도를 더 선명하게 전달해요.", theme: "VERY 표현", difficulty: 1,
    items: [
      ["very funny", "hilarious", "크게 웃을 만큼 아주 재미있다는 뜻이에요.", "사람·이야기·상황에 모두 사용할 수 있어요.", "The final scene was hilarious.", "마지막 장면은 정말 웃겼어요."],
      ["very angry", "furious", "통제하기 어려울 만큼 강한 분노예요.", "annoyed보다 훨씬 강하므로 가벼운 불만에는 피하세요.", "She was furious about the repeated mistake.", "그녀는 반복된 실수에 몹시 화가 났어요."],
      ["very dirty", "filthy", "불쾌할 만큼 매우 더러운 상태예요.", "강한 부정적 표현이라 사람에게 직접 쓰면 무례할 수 있어요.", "His shoes were filthy after the hike.", "하이킹 후 그의 신발은 몹시 더러웠어요."],
      ["very beautiful", "stunning", "순간적으로 감탄할 만큼 아름다워요.", "풍경·외모·디자인에 자연스럽게 사용할 수 있어요.", "The view from the hotel was stunning.", "호텔에서 본 경치는 매우 아름다웠어요."],
      ["very surprised", "astonished", "예상하지 못해 크게 놀란 상태예요.", "일상에서는 amazed도 자주 사용해요.", "We were astonished by the result.", "우리는 그 결과에 크게 놀랐어요."],
    ],
  },
  {
    id: "upgrade-set-03", title: "더 정확한 평가", description: "익숙한 형용사를 더 구체적인 평가 표현으로 바꿔요.", theme: "정확한 형용사", difficulty: 2,
    items: [
      ["very important", "essential", "없으면 목적 달성이 어려운 필수 요소예요.", "단순히 중요한 것보다 필요성이 강할 때 사용해요.", "Clear communication is essential for teamwork.", "명확한 소통은 팀워크에 필수적이에요."],
      ["very good", "excellent", "품질이나 성과가 매우 뛰어나다는 뜻이에요.", "사람보다 결과·성과·품질을 평가할 때 특히 자연스러워요.", "You did an excellent job on the presentation.", "발표를 아주 훌륭하게 해냈어요."],
      ["very careful", "meticulous", "작은 세부사항까지 매우 꼼꼼하다는 뜻이에요.", "주의 깊다는 의미에 정확성과 세심함이 더해져요.", "He keeps meticulous records of every expense.", "그는 모든 지출을 꼼꼼하게 기록해요."],
      ["very difficult", "challenging", "어렵지만 도전할 가치가 있다는 뉘앙스예요.", "부정적인 impossible과 달리 성장 가능성을 담을 수 있어요.", "The assignment was challenging but rewarding.", "그 과제는 어려웠지만 보람 있었어요."],
      ["very clear", "explicit", "지시나 설명이 모호하지 않고 명시적이에요.", "사람의 외모가 선명하다는 의미에는 사용하지 않아요.", "The manager gave explicit instructions.", "관리자는 명확한 지시를 내렸어요."],
    ],
  },
  {
    id: "upgrade-set-04", title: "업무 동사를 더 정확하게", description: "포괄적인 기본 동사를 업무 문맥에 맞게 정밀화해요.", theme: "정확한 동사", difficulty: 3,
    items: [
      ["show", "demonstrate", "근거나 결과를 통해 분명히 보여준다는 뜻이에요.", "단순히 물건을 보여주는 상황에는 show가 더 자연스러워요.", "The data demonstrates a clear improvement.", "데이터는 뚜렷한 개선을 보여줘요."],
      ["fix a problem", "resolve an issue", "문제를 처리해 해결 상태로 만든다는 뜻이에요.", "업무·고객 응대 문맥에서 전문적으로 들려요.", "We need to resolve this issue before Friday.", "금요일 전까지 이 문제를 해결해야 해요."],
      ["make better", "enhance", "품질이나 효과를 한 단계 높인다는 뜻이에요.", "이미 존재하는 기능·품질을 개선할 때 자연스러워요.", "The update will enhance system performance.", "업데이트가 시스템 성능을 향상할 거예요."],
      ["get permission", "obtain approval", "공식적인 승인이나 허가를 받는 표현이에요.", "일상적인 허락에는 get permission이 더 편해요.", "We must obtain approval before proceeding.", "진행하기 전에 승인을 받아야 해요."],
      ["look at the report", "review the report", "검토 목적을 가지고 자세히 살펴본다는 뜻이에요.", "잠깐 보는 것이 아니라 내용을 확인할 때 사용해요.", "Please review the report before the meeting.", "회의 전에 보고서를 검토해 주세요."],
    ],
  },
  {
    id: "upgrade-set-05", title: "더 부드럽게 부탁하기", description: "명령처럼 들리는 표현을 자연스러운 요청으로 바꿔요.", theme: "상황별 표현", difficulty: 1,
    items: [
      ["Wait.", "Give me a moment.", "상대에게 잠시 시간을 정중하게 요청해요.", "친한 사이에서도 Wait보다 부드럽게 들려요.", "Give me a moment to review the file.", "파일을 검토할 시간을 잠시 주세요."],
      ["Help me.", "Could you give me a hand?", "일상에서 자연스럽고 부드럽게 도움을 요청해요.", "공식 업무에서는 Could you help me with…도 좋아요.", "Could you give me a hand with these boxes?", "이 상자들을 옮기는 것을 도와주시겠어요?"],
      ["Tell me.", "Please let me know.", "정보나 결과를 정중하게 알려 달라고 요청해요.", "명령하는 느낌을 줄이고 싶을 때 사용해요.", "Please let me know when you are available.", "가능한 시간을 알려 주세요."],
      ["Check this.", "Could you take a look at this?", "상대에게 검토를 부드럽게 부탁하는 표현이에요.", "짧게 확인하는 업무 요청에 자연스러워요.", "Could you take a look at this document?", "이 문서를 한번 봐주시겠어요?"],
      ["Send it today.", "Could you send it today?", "기한 요청을 명령보다 부드럽게 전달해요.", "if possible을 붙이면 부담을 더 줄일 수 있어요.", "Could you send it today if possible?", "가능하다면 오늘 보내주시겠어요?"],
    ],
  },
  {
    id: "upgrade-set-06", title: "업무에서 더 자연스럽게", description: "회의·의견·사과 상황의 표현을 더 매끄럽게 바꿔요.", theme: "상황별 표현", difficulty: 2,
    items: [
      ["I think…", "From my perspective,…", "개인 의견임을 분명하고 부드럽게 밝혀요.", "일상 대화에서는 I think가 더 간단하고 자연스러워요.", "From my perspective, we need more time.", "제 관점에서는 시간이 더 필요해요."],
      ["I don't know.", "I'm not sure.", "모른다는 답을 부드럽게 전달해요.", "확인할 수 있다면 뒤에 but I can check를 붙여보세요.", "I'm not sure, but I can check for you.", "확실하지 않지만 확인해 볼게요."],
      ["Sorry I'm late.", "I apologize for being late.", "공식적인 상황에 맞게 지각을 사과해요.", "친한 사이에는 Sorry가 더 자연스러울 수 있어요.", "I apologize for being late to the meeting.", "회의에 늦어서 죄송합니다."],
      ["We need to talk.", "I'd like to discuss this with you.", "부담을 줄이면서 논의를 제안해요.", "민감한 대화를 시작할 때 특히 유용해요.", "I'd like to discuss this with you tomorrow.", "내일 이 문제를 함께 논의하고 싶어요."],
      ["I understand.", "I see what you mean.", "상대의 요점과 관점을 이해했음을 표현해요.", "사실을 이해했다기보다 상대의 의도를 파악했을 때 써요.", "I see what you mean about the schedule.", "일정에 관해 무슨 뜻인지 알겠어요."],
    ],
  },
];

function makeExpression(set, tuple, index) {
  const [beforeText, afterText, shortDescription, usageNote, exampleText, meaningText] = tuple;
  return {
    id: `${set.id}-expression-${index + 1}`,
    slug: `${set.id}-${index + 1}`,
    expressionText: afterText,
    beforeText,
    afterText,
    difficultyLevel: set.difficulty,
    shortDescription,
    usageNote,
    status: "active",
    example: { id: `${set.id}-example-${index + 1}`, exampleText, meaningText, sortOrder: 1 },
  };
}

export const expressionUpgradeSets = rawSets.map((set) => {
  const expressions = set.items.map((item, index) => makeExpression(set, item, index));
  const quizItems = expressions.slice(0, 3).map((expression, index) => {
    const choices = [
      expression.afterText,
      expressions[(index + 1) % expressions.length].afterText,
      expressions[(index + 2) % expressions.length].afterText,
    ];
    return {
      id: `${set.id}-quiz-${index + 1}`,
      expressionId: expression.id,
      questionType: "upgrade_choice",
      questionText: `“${expression.beforeText}”를 더 적절하게 업그레이드한 표현은 무엇일까요?`,
      correctAnswer: expression.afterText,
      choices,
      explanation: `${expression.afterText}: ${expression.shortDescription}`,
      sortOrder: index + 1,
    };
  });
  return { ...set, status: "published", estimatedMinutes: 4, expressions, quiz: { id: `${set.id}-quiz`, title: `${set.title} 확인 퀴즈`, items: quizItems } };
});

export function getExpressionUpgradeInitialState() {
  return {
    version: 1,
    view: "intro",
    activeSetId: null,
    cardIndex: 0,
    completedExpressionIds: [],
    savedExpressionIds: [],
    feedbackExpressionIds: [],
    quizIndex: 0,
    quizAnswers: [],
    reviewQueue: [],
    completedSetIds: [],
    logs: [],
  };
}

export function getTodayExpressionUpgradeSet(date = new Date()) {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return expressionUpgradeSets[dayNumber % expressionUpgradeSets.length];
}

export function normalizeExpressionUpgradeState(value) {
  const initial = getExpressionUpgradeInitialState();
  const state = value && typeof value === "object" ? { ...initial, ...value } : initial;
  ["completedExpressionIds", "savedExpressionIds", "feedbackExpressionIds", "quizAnswers", "reviewQueue", "completedSetIds", "logs"].forEach((key) => {
    if (!Array.isArray(state[key])) state[key] = [];
  });
  return state;
}

export function addExpressionUpgradeReview(state, expressionId, sourceType, sourceRefId = null) {
  const exists = state.reviewQueue.some((item) => item.expressionId === expressionId && item.sourceType === sourceType && item.status === "pending");
  if (exists) return state;
  return {
    ...state,
    reviewQueue: [...state.reviewQueue, {
      id: `review-${expressionId}-${sourceType}`,
      expressionId,
      sourceType,
      sourceRefId,
      status: "pending",
      createdAt: new Date().toISOString(),
      completedAt: null,
    }],
  };
}
