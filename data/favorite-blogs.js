export const favoriteBlogSources = [
  {
    id: "espresso-english",
    name: "Espresso English",
    url: "https://www.espressoenglish.net/category/vocabulary/",
    description: "유의어·반의어·고급 어휘와 문맥별 단어 차이를 우선 참고해요.",
    recommended: true,
    focus: "수능형 어휘 확장 우선 참고",
  },
  {
    id: "speak-english-with-vanessa",
    name: "Speak English With Vanessa",
    url: "https://speakenglishwithvanessa.com/",
    description: "자연스러운 영어 표현과 실제 사용 맥락을 확인해요.",
    focus: "실전 표현",
  },
  {
    id: "fluentu-english",
    name: "FluentU English Blog",
    url: "https://www.fluentu.com/blog/english/",
    description: "영상과 실제 문맥을 활용한 영어 어휘·표현 자료를 살펴봐요.",
    focus: "문맥 학습",
  },
  {
    id: "ellii",
    name: "Ellii Blog",
    url: "https://ellii.com/blog",
    description: "영어 교육 자료와 어휘·문법 교수 아이디어를 참고해요.",
    focus: "영어 교육",
  },
  {
    id: "oxford-house-barcelona",
    name: "Oxford House Barcelona Blog",
    url: "https://oxfordhousebcn.com/en/blog/",
    description: "학습자용 영어 문법과 어휘 콘텐츠를 확인해요.",
    focus: "학습 자료",
  },
  {
    id: "maries-space",
    name: "마리의 공간",
    url: "https://blog.naver.com/fdbdd",
    description: "네이버 블로그에서 영어 학습 콘텐츠와 표현 자료를 살펴봐요.",
    focus: "영어 학습 블로그",
  },
];

// 유의어/어휘 확장 기능에서 사용하는 고정 참고 순서입니다.
// 외부 자료는 후보 발굴용이며, 최종 학습 내용은 현재 사이트 데이터와 검수를 우선합니다.
export const vocabularyExpansionSourcePriority = [
  {
    priority: 1,
    id: "internal-content",
    name: "ValueTime 기존 단어·표현 콘텐츠",
    usage: "정답·뜻·예문·수능 적합성의 최우선 기준",
  },
  {
    priority: 2,
    id: "espresso-english",
    name: "Espresso English",
    url: "https://www.espressoenglish.net/category/vocabulary/",
    usage: "유의어 후보, 강도 차이, 반의어와 고급 어휘 확장 참고",
  },
];

export const favoriteBlogHeroQuotes = [
  {
    text: "There's always more than one way to solve a problem.",
    source: "Espresso English",
    url: "https://www.espressoenglish.net/the-100-most-common-words-in-english/",
  },
  {
    text: "Could you repeat that please?",
    source: "FluentU English Blog",
    url: "https://www.fluentu.com/blog/english/common-english-phrases/",
  },
  {
    text: "Warm-up questions activate prior knowledge.",
    source: "Ellii Blog",
    url: "https://ellii.com/blog/instructional-scaffolding-how-ellii-supports-student-learning",
  },
  {
    text: "Use simple phrases and sentences to describe where I live and people I know.",
    source: "Oxford House Barcelona",
    url: "https://oxfordhousebcn.com/wp-content/uploads/Starter-English.pdf",
  },
  {
    text: "Speak English With Confidence!",
    source: "Speak English With Vanessa",
    url: "https://speakenglishwithvanessa.com/",
  },
];

export const favoriteBlogArticles = [
  {
    id: "blog-small-talk", color: "sage", category: "CONVERSATION", date: "JUL 13", title: "Small talk that opens a conversation", phrase: "How have you been?", meaning: "그동안 어떻게 지냈어요?", sourceTitle: "렛츠링글리쉬어학원", sourceUrl: "https://blog.naver.com/letsleenglish",
    summary: ["오랜만에 만난 사람과 자연스럽게 대화를 시작하는 표현을 익힙니다.", "How are you?보다 지난 시간의 안부를 묻는 뉘앙스가 강합니다.", "짧은 후속 질문을 함께 쓰면 대화가 자연스럽게 이어집니다."],
    expressions: [
      { id: "been", type: "sentence", text: "How have you been?", meaning: "그동안 어떻게 지냈어요?", example: "How have you been since we last met?" },
      { id: "good-see", type: "sentence", text: "It's good to see you again.", meaning: "다시 만나서 반가워요.", example: "It's good to see you again after such a long time." },
      { id: "catch-up", type: "word", text: "catch up", meaning: "밀린 이야기를 나누다", example: "Let's catch up over coffee." },
    ],
  },
  {
    id: "blog-work-update", color: "sand", category: "WORK", date: "JUL 12", title: "Clear progress updates at work", phrase: "I'm working on it.", meaning: "지금 처리하고 있어요.", sourceTitle: "렛츠링글리쉬어학원", sourceUrl: "https://blog.naver.com/letsleenglish",
    summary: ["업무 진행 상황을 짧고 분명하게 전달하는 표현을 다룹니다.", "완료 예상 시점을 덧붙이면 상대방의 불확실성을 줄일 수 있습니다.", "지연이 예상될 때는 이유보다 다음 행동을 먼저 알려주는 것이 좋습니다."],
    expressions: [
      { id: "working", type: "sentence", text: "I'm working on it.", meaning: "지금 처리하고 있어요.", example: "I'm working on it and will update you by noon." },
      { id: "on-track", type: "word", text: "on track", meaning: "계획대로 진행 중인", example: "The project is still on track." },
      { id: "keep-posted", type: "sentence", text: "I'll keep you posted.", meaning: "진행 상황을 계속 알려드릴게요.", example: "I'll keep you posted if anything changes." },
    ],
  },
  {
    id: "blog-opinion", color: "blue", category: "OPINION", date: "JUL 11", title: "Agreeing without sounding abrupt", phrase: "That makes sense.", meaning: "그 말이 일리가 있네요.", sourceTitle: "렛츠링글리쉬어학원", sourceUrl: "https://blog.naver.com/letsleenglish",
    summary: ["상대방의 의견을 이해했다는 신호를 자연스럽게 전달합니다.", "완전한 동의가 아니어도 논리를 인정할 때 사용할 수 있습니다.", "자신의 관점을 덧붙이기 전에 완충 표현으로 활용하기 좋습니다."],
    expressions: [
      { id: "sense", type: "sentence", text: "That makes sense.", meaning: "그 말이 일리가 있네요.", example: "That makes sense when you explain it that way." },
      { id: "point", type: "sentence", text: "I see your point.", meaning: "무슨 말씀인지 알겠어요.", example: "I see your point, but we may need more time." },
      { id: "perspective", type: "word", text: "perspective", meaning: "관점, 시각", example: "Her perspective helped us rethink the plan." },
    ],
  },
  {
    id: "blog-reassure", color: "rose", category: "MINDSET", date: "JUL 10", title: "A calm response to small mistakes", phrase: "It's not a big deal.", meaning: "큰일 아니에요.", sourceTitle: "렛츠링글리쉬어학원", sourceUrl: "https://blog.naver.com/letsleenglish",
    summary: ["작은 실수나 걱정을 가볍게 받아들이도록 안심시키는 표현입니다.", "상대방의 감정을 먼저 인정한 뒤 사용하면 더 따뜻하게 들립니다.", "업무에서는 해결 방법을 함께 제시하는 문장과 잘 어울립니다."],
    expressions: [
      { id: "big-deal", type: "sentence", text: "It's not a big deal.", meaning: "큰일 아니에요.", example: "Don't worry. It's not a big deal." },
      { id: "sort-out", type: "sentence", text: "We can sort it out.", meaning: "우리가 해결할 수 있어요.", example: "We can sort it out before the meeting." },
      { id: "reassure", type: "word", text: "reassure", meaning: "안심시키다", example: "She reassured the client that the issue was minor." },
    ],
  },
];
