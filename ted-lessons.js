import { julianTreasureTranscriptRaw } from "./ted-transcript-julian.js";

// 오늘의 TED 운영 목록입니다.
// 실제 DB를 연결할 때도 같은 필드 구조로 응답하면 화면 코드는 그대로 사용할 수 있습니다.
export const tedSettings = {
  // 향후 관리자 화면에서 특정 영상의 id를 저장하면 날짜 예약보다 먼저 노출됩니다.
  // 현재는 사용자가 제공한 전체 스크립트를 모두 학습할 때까지 이 강연으로 고정합니다.
  manualOverrideId: "julian-treasure-speaking",
};

export const tedLessons = [
  {
    id: "julian-treasure-speaking",
    active: true,
    scriptAvailable: true,
    scheduledDate: "2026-07-13",
    videoId: "eIho2S0ZahI",
    speaker: "Julian Treasure",
    title: "How to speak so that people want to listen",
    duration: "약 10분",
    level: "중급",
    description: "사람들이 귀 기울이게 만드는 말하기 습관과 목소리의 힘을 배워봅니다.",
    transcriptRaw: julianTreasureTranscriptRaw,
    // 우측 스크롤 패널에 표시되는 확장 학습 스크립트입니다.
    // TED 원문 복제가 아닌, 강연의 흐름을 따라 학습용으로 재구성한 문장입니다.
    transcript: [
      { en: "Many people speak every day, yet they often feel that nobody is truly listening.", ko: "많은 사람이 매일 말하지만, 아무도 진정으로 듣고 있지 않다고 느끼곤 합니다." },
      { en: "The way we use language can either create trust or quietly push listeners away.", ko: "우리가 언어를 사용하는 방식은 신뢰를 만들 수도 있고 청자를 조용히 멀어지게 할 수도 있습니다." },
      { en: "Gossip may seem entertaining, but it makes people wonder what we say about them later.", ko: "험담은 재미있어 보일 수 있지만, 사람들은 우리가 나중에 자신에 관해 무슨 말을 할지 의심하게 됩니다." },
      { en: "Judging every idea too quickly leaves very little room for an honest conversation.", ko: "모든 생각을 너무 빨리 판단하면 솔직한 대화를 나눌 여지가 거의 남지 않습니다." },
      { en: "Constant negativity makes even an important message difficult to accept.", ko: "계속되는 부정적인 태도는 중요한 메시지조차 받아들이기 어렵게 만듭니다." },
      { en: "Complaining without looking for a solution can drain the energy from a conversation.", ko: "해결책을 찾지 않고 불평만 하면 대화의 에너지가 빠져나갈 수 있습니다." },
      { en: "Excuses prevent speakers from taking responsibility for the effect of their words.", ko: "변명은 화자가 자신의 말이 미친 영향에 책임지는 것을 방해합니다." },
      { en: "Exaggeration weakens language because dramatic words eventually lose their meaning.", ko: "과장은 극적인 단어가 결국 의미를 잃게 하므로 언어의 힘을 약하게 만듭니다." },
      { en: "Clear communication begins when facts and personal opinions are not deliberately confused.", ko: "명확한 의사소통은 사실과 개인적인 의견을 의도적으로 혼동하지 않을 때 시작됩니다." },
      { en: "Honesty works best when it is combined with kindness and respect for the listener.", ko: "정직함은 친절함과 청자에 대한 존중이 함께할 때 가장 효과적입니다." },
      { en: "Being authentic means speaking in a way that reflects who you really are.", ko: "진정성은 자신의 실제 모습을 반영하는 방식으로 말하는 것을 뜻합니다." },
      { en: "Integrity connects your words with your actions and makes your promises believable.", ko: "진실성은 말과 행동을 연결하고 약속을 믿을 수 있게 만듭니다." },
      { en: "A speaker can wish the audience well without agreeing with every opinion they hold.", ko: "화자는 청중의 모든 의견에 동의하지 않더라도 그들이 잘되기를 바랄 수 있습니다." },
      { en: "The lower and richer parts of a voice often communicate confidence and authority.", ko: "목소리의 낮고 풍부한 부분은 자신감과 권위를 전달하는 경우가 많습니다." },
      { en: "Changing rhythm and pitch helps important ideas stand out from the rest of a message.", ko: "리듬과 음높이를 바꾸면 중요한 생각이 메시지의 나머지 부분에서 두드러집니다." },
      { en: "Silence can be useful because a short pause gives listeners time to absorb an idea.", ko: "짧은 멈춤은 청자가 생각을 받아들일 시간을 주기 때문에 침묵도 유용할 수 있습니다." },
      { en: "Volume should be adjusted with care rather than used as a substitute for meaning.", ko: "목소리 크기는 의미를 대신하는 수단이 아니라 신중하게 조절해야 하는 요소입니다." },
      { en: "Simple vocal exercises can prepare the lips, tongue and breath before an important talk.", ko: "간단한 발성 연습은 중요한 발표 전에 입술, 혀, 호흡을 준비시킬 수 있습니다." },
      { en: "Speaking powerfully is not about controlling people; it is about communicating with awareness.", ko: "힘 있게 말한다는 것은 사람을 통제하는 일이 아니라 의식적으로 소통하는 일입니다." },
      { en: "When people speak and listen consciously, communication can create deeper understanding.", ko: "사람들이 의식적으로 말하고 들을 때 의사소통은 더 깊은 이해를 만들 수 있습니다." },
    ],
    transcriptUrl: "https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen/transcript",
    script: [
      { start: 47, end: 193, en: "A powerful voice begins with words that build trust rather than damage it.", ko: "힘 있는 목소리는 신뢰를 해치는 말이 아니라 신뢰를 쌓는 말에서 시작됩니다." },
      { start: 193, end: 303, en: "Honesty means being clear and truthful while still treating others with care.", ko: "정직함은 상대를 배려하면서도 분명하고 진실하게 말하는 것을 뜻합니다." },
      { start: 303, end: 474, en: "Your pace, pitch and volume can completely change how a message feels.", ko: "말의 속도, 음높이, 크기는 메시지가 전달되는 느낌을 완전히 바꿀 수 있습니다." },
      { start: 474, end: 600, en: "Before an important conversation, warm up your voice just as you would warm up your body.", ko: "중요한 대화 전에는 몸을 준비하듯 목소리도 충분히 준비해 보세요." },
    ],
    expressions: [
      { term: "build trust", meaning: "신뢰를 쌓다", example: "Clear communication helps build trust." },
      { term: "treat someone with care", meaning: "누군가를 배려하여 대하다", example: "Treat your listener with care." },
      { term: "warm up your voice", meaning: "목소리를 워밍업하다", example: "I warm up my voice before a presentation." },
    ],
  },
  {
    id: "tim-urban-procrastination",
    active: true,
    scriptAvailable: true,
    scheduledDate: "2026-07-14",
    videoId: "arj7oStGLkU",
    speaker: "Tim Urban",
    title: "Inside the mind of a master procrastinator",
    duration: "약 14분",
    level: "중급",
    description: "미루는 습관이 어떻게 작동하는지 유쾌한 비유를 통해 이해해 봅니다.",
    transcriptUrl: "https://www.ted.com/talks/tim_urban_inside_the_mind_of_a_master_procrastinator/transcript",
    script: [
      { start: 35, end: 240, en: "A procrastinator may understand the plan clearly but still choose an easier distraction.", ko: "미루는 사람은 계획을 분명히 이해하면서도 더 쉬운 딴짓을 선택할 수 있습니다." },
      { start: 240, end: 455, en: "A close deadline often creates enough urgency to make us finally take action.", ko: "임박한 마감은 마침내 행동하게 만들 만큼의 긴박감을 주곤 합니다." },
      { start: 455, end: 665, en: "The hardest tasks are often the ones that have no visible deadline at all.", ko: "가장 어려운 일은 오히려 눈에 보이는 마감이 전혀 없는 일인 경우가 많습니다." },
      { start: 665, end: 845, en: "Noticing the pattern is the first step toward using our limited time more wisely.", ko: "그 패턴을 알아차리는 것이 한정된 시간을 더 현명하게 쓰는 첫걸음입니다." },
    ],
    expressions: [
      { term: "take action", meaning: "행동에 옮기다", example: "It is time to take action." },
      { term: "a close deadline", meaning: "임박한 마감", example: "A close deadline keeps me focused." },
      { term: "notice a pattern", meaning: "패턴을 알아차리다", example: "Try to notice the pattern early." },
    ],
  },
  {
    id: "celeste-headlee-conversation",
    active: true,
    scriptAvailable: true,
    scheduledDate: "2026-07-15",
    videoId: "R1vskiVDwl4",
    speaker: "Celeste Headlee",
    title: "10 ways to have a better conversation",
    duration: "약 12분",
    level: "중급",
    description: "더 잘 듣고, 더 간결하게 말하며, 진짜 대화를 이어가는 방법을 익힙니다.",
    transcriptUrl: "https://www.ted.com/talks/celeste_headlee_10_ways_to_have_a_better_conversation/transcript",
    script: [
      { start: 30, end: 190, en: "A meaningful conversation requires attention, curiosity and a willingness to listen.", ko: "의미 있는 대화에는 집중, 호기심, 그리고 기꺼이 들으려는 태도가 필요합니다." },
      { start: 190, end: 365, en: "Ask open questions that allow the other person to describe what they experienced.", ko: "상대가 자신의 경험을 설명할 수 있도록 열린 질문을 해 보세요." },
      { start: 365, end: 540, en: "If you do not know something, it is perfectly fine to say that you do not know.", ko: "무언가를 모른다면 모른다고 말해도 전혀 괜찮습니다." },
      { start: 540, end: 720, en: "Good conversation is not about repeating yourself; it is about staying present.", ko: "좋은 대화는 같은 말을 반복하는 것이 아니라 현재의 대화에 온전히 머무는 것입니다." },
    ],
    expressions: [
      { term: "a willingness to listen", meaning: "기꺼이 들으려는 태도", example: "Show a willingness to listen." },
      { term: "ask open questions", meaning: "열린 질문을 하다", example: "Ask open questions to learn more." },
      { term: "stay present", meaning: "현재에 집중하다", example: "Put your phone away and stay present." },
    ],
  },
  {
    id: "julian-treasure-listening",
    active: true,
    scriptAvailable: true,
    scheduledDate: "2026-07-16",
    videoId: "cSohjlYQI2A",
    speaker: "Julian Treasure",
    title: "5 ways to listen better",
    duration: "약 8분",
    level: "중급",
    description: "일상에서 놓치기 쉬운 소리를 의식하며 듣기 집중력을 훈련합니다.",
    transcriptUrl: "https://www.ted.com/talks/julian_treasure_5_ways_to_listen_better/transcript",
    script: [
      { start: 25, end: 125, en: "Listening is an active skill that helps us understand the world around us.", ko: "듣기는 우리 주변 세계를 이해하게 해 주는 능동적인 기술입니다." },
      { start: 125, end: 245, en: "A few minutes of silence can reset your ears and sharpen your attention.", ko: "몇 분간의 침묵은 귀를 새롭게 하고 집중력을 선명하게 만들 수 있습니다." },
      { start: 245, end: 365, en: "Try separating the individual sounds that make up a noisy environment.", ko: "소란스러운 환경을 이루는 각각의 소리를 분리해서 들어 보세요." },
      { start: 365, end: 490, en: "Conscious listening creates connection and makes communication more effective.", ko: "의식적인 듣기는 유대감을 만들고 의사소통을 더 효과적으로 만듭니다." },
    ],
    expressions: [
      { term: "an active skill", meaning: "능동적인 기술", example: "Listening is an active skill." },
      { term: "sharpen your attention", meaning: "집중력을 예리하게 하다", example: "Silence can sharpen your attention." },
      { term: "make up", meaning: "~을 구성하다", example: "Many small sounds make up the scene." },
    ],
  },
  // 자막이나 학습 스크립트가 준비되지 않은 항목은 자동으로 운영 후보에서 제외됩니다.
  { id: "draft-without-script", active: true, scriptAvailable: false, scheduledDate: "2026-07-17", videoId: "", speaker: "", title: "준비 중인 영상", script: [], expressions: [] },
];
