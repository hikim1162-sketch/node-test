export const SYNONYM_STUDY_STORAGE_KEY = "value_time_synonym_study_v1";

export const synonymContentSources = {
  internal: {
    id: "internal",
    label: "ValueTime 기존 어휘",
    priority: 1,
    role: "기존 뜻·예문·수능 적합성의 기준",
  },
  espresso: {
    id: "espresso",
    label: "Espresso English · Vocabulary",
    priority: 2,
    url: "https://www.espressoenglish.net/category/vocabulary/",
    role: "초기 유의어 후보와 강도 차이 참고",
  },
  naver: {
    id: "naver",
    label: "네이버 영어사전",
    priority: 3,
    url: "https://en.dict.naver.com/",
    role: "향후 유의어·용례 보강과 교차 확인",
  },
};

const rawSets = [
  {
    id: "syn-adjective-01",
    category: "형용사",
    title: "강도를 높이는 형용사",
    description: "very에 기대지 않고 상태의 강도를 정확히 구별합니다.",
    words: [
      ["very big", "huge", "거대한, 매우 큰", "The project requires a huge amount of time.", ["enormous", "massive"], "huge는 크기나 양이 보통 수준을 크게 넘어설 때 씁니다."],
      ["very small", "tiny", "아주 작은", "A tiny crack can cause a serious problem.", ["minute", "miniature"], "tiny는 눈에 띄게 작다는 인상을 주며 minute는 격식 있는 문맥에서도 쓰입니다."],
      ["very good", "excellent", "훌륭한, 탁월한", "The researcher presented an excellent analysis.", ["outstanding", "superb"], "excellent는 질이나 성취 수준이 매우 높다는 평가입니다."],
      ["very bad", "terrible", "끔찍한, 매우 나쁜", "The policy had terrible consequences for local workers.", ["awful", "dreadful"], "terrible은 결과·상태가 매우 나쁘다는 강한 평가를 나타냅니다."],
      ["very beautiful", "gorgeous", "매우 아름다운", "The valley offers a gorgeous view in autumn.", ["stunning", "magnificent"], "gorgeous는 시각적으로 화려하고 매력적인 대상에 잘 어울립니다."],
    ],
  },
  {
    id: "syn-state-01",
    category: "상태",
    title: "몸과 환경의 강한 상태",
    description: "피로·배고픔·온도처럼 자주 등장하는 상태 어휘를 확장합니다.",
    words: [
      ["very tired", "exhausted", "완전히 지친", "The hikers were exhausted after climbing all day.", ["drained", "weary"], "exhausted는 에너지가 거의 남지 않은 강한 피로를 뜻합니다."],
      ["very hungry", "starving", "몹시 배고픈", "By lunchtime, the children were starving.", ["famished", "ravenous"], "starving은 매우 배고픈 상태를 강조하며 일상적 과장에도 쓰입니다."],
      ["very cold", "freezing", "몹시 추운", "The explorers faced freezing temperatures at night.", ["icy", "bitter"], "freezing은 얼 것처럼 매우 추운 상태나 온도를 나타냅니다."],
      ["very hot", "boiling", "몹시 더운", "The room was boiling despite the open windows.", ["scorching", "sweltering"], "boiling은 공간이나 날씨가 견디기 어려울 정도로 더울 때 씁니다."],
      ["very clean", "spotless", "티 없이 깨끗한", "The laboratory must remain spotless at all times.", ["immaculate", "pristine"], "spotless는 얼룩이나 먼지가 전혀 보이지 않는 상태를 강조합니다."],
    ],
  },
  {
    id: "syn-emotion-01",
    category: "감정",
    title: "감정의 강도를 정확하게",
    description: "문맥 속 감정의 강도와 태도를 구별하는 연습입니다.",
    words: [
      ["very scared", "terrified", "겁에 질린", "Residents were terrified by the sudden explosion.", ["frightened", "petrified"], "terrified는 frightened보다 훨씬 강한 공포를 나타냅니다."],
      ["very funny", "hilarious", "아주 우스운", "The audience found his unexpected reply hilarious.", ["amusing", "comical"], "hilarious는 크게 웃을 만큼 매우 재미있다는 뜻입니다."],
      ["very angry", "furious", "격노한", "Citizens were furious about the unfair decision.", ["outraged", "enraged"], "furious는 통제하기 어려울 정도의 강한 분노를 나타냅니다."],
      ["very surprised", "astonished", "매우 놀란", "Scientists were astonished by the unexpected result.", ["amazed", "stunned"], "astonished는 예상과 크게 다른 사실에 매우 놀란 상태입니다."],
      ["very sad", "devastated", "엄청난 충격과 슬픔에 빠진", "The community was devastated by the loss.", ["heartbroken", "miserable"], "devastated는 단순한 sad보다 충격과 깊은 슬픔이 함께 담깁니다."],
    ],
  },
  {
    id: "syn-csat-01",
    category: "빈출 수능 어휘",
    title: "독해에서 자주 바뀌는 핵심어",
    description: "쉬운 동사와 형용사를 학술적 문맥의 빈출 어휘로 연결합니다.",
    words: [
      ["very important", "crucial", "결정적으로 중요한", "Public trust is crucial to the success of the program.", ["essential", "vital"], "crucial은 결과를 좌우할 만큼 결정적으로 중요하다는 뜻입니다."],
      ["very interesting", "fascinating", "매혹적인, 매우 흥미로운", "The study offers a fascinating account of human memory.", ["intriguing", "compelling"], "fascinating은 주의를 강하게 끌고 계속 알고 싶게 만드는 대상에 씁니다."],
      ["show clearly", "demonstrate", "입증하다, 분명히 보여주다", "The evidence demonstrates the need for further research.", ["indicate", "reveal"], "demonstrate는 자료나 근거를 통해 사실을 분명하게 보여줄 때 쓰입니다."],
      ["make less", "reduce", "줄이다, 감소시키다", "Regular exercise can reduce the risk of disease.", ["decrease", "diminish"], "reduce는 양·크기·위험을 의도적으로 낮추는 가장 일반적인 학술 동사입니다."],
      ["keep going", "persist", "지속하다, 고집하다", "Some misconceptions persist despite strong evidence.", ["continue", "endure"], "persist는 어려움이나 반대에도 상태·행동이 계속된다는 의미입니다."],
    ],
  },
];

function makeWord(set, tuple, index) {
  const [base, target, meaning, example, synonyms, nuance] = tuple;
  return {
    id: `${set.id}-${index + 1}`,
    base,
    target,
    meaning,
    example,
    synonyms,
    nuance,
    sourceIds: ["internal", "espresso"],
    status: "active",
  };
}

function makeQuiz(set, words) {
  return words.slice(0, 3).map((word, index) => {
    const distractors = [words[(index + 1) % words.length].target, words[(index + 2) % words.length].target];
    const types = ["context_synonym", "underlined_synonym", "advanced_match"];
    const prompts = [
      `다음 문맥의 “${word.base}”를 가장 정확하게 바꿀 수 있는 어휘는?`,
      `밑줄 친 쉬운 표현 “${word.base}”와 의미가 가장 가까운 고급 어휘는?`,
      `“${word.meaning}”의 의미를 가지며 ${word.base}를 대체할 수 있는 어휘는?`,
    ];
    return {
      id: `${set.id}-quiz-${index + 1}`,
      wordId: word.id,
      type: types[index],
      prompt: prompts[index],
      context: word.example,
      choices: [word.target, ...distractors],
      answer: word.target,
      explanation: word.nuance,
    };
  });
}

export const synonymStudySets = rawSets.map((set) => {
  const words = set.words.map((tuple, index) => makeWord(set, tuple, index));
  return { ...set, words, quiz: makeQuiz(set, words), status: "published" };
});

export function getSynonymStudyInitialState() {
  return {
    view: "sets",
    activeSetId: synonymStudySets[0].id,
    cardIndex: 0,
    learnedWordIds: [],
    quizIndex: 0,
    answers: [],
    wrongWordIds: [],
    completedSetIds: [],
  };
}

export function normalizeSynonymStudyState(value) {
  const initial = getSynonymStudyInitialState();
  const state = value && typeof value === "object" ? { ...initial, ...value } : initial;
  ["learnedWordIds", "answers", "wrongWordIds", "completedSetIds"].forEach((key) => {
    if (!Array.isArray(state[key])) state[key] = [];
  });
  return state;
}
