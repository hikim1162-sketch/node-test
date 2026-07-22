import { vocabularyWords } from "../data/vocabulary.js";
import { vocabularyPartOfSpeech } from "../data/vocabulary-pos.js";
import { vocabularyExamples } from "../data/vocabulary-examples.js";
import { tedLessons, tedSettings } from "../data/ted-lessons.js";
import { toeicSentences } from "../data/toeic-sentences.js";
import { favoriteBlogArticles } from "../data/favorite-blogs.js";
import { normalizeSavedLearningItems, generateCustomTestFromSavedItems } from "./custom-learning.js";
import { REVIEW_STORAGE_KEY, createReviewProgress, selectDueReviewItems, createReviewQuestion, applyReviewAnswer, detectUsedWords, evaluateEmailReply, toNotebookItem } from "./connected-learning.js";
import csatEnglishArchive from "../netlify-private-app/data/imported/csat-english-2021-2026.json";
import { getCurrentUser, modeFromAudience, profileStorage } from "../netlify-private-app/src/profiles/profileStorage.js";
import { getModeConfig } from "../netlify-private-app/src/profiles/learningModes.js";
import { middleEnglishPassages } from "../netlify-private-app/src/data/middleEnglish.js";
import { loadArticles, toNewsArticle, updateArticleLearning } from "../netlify-private-app/src/articles/articleStorage.js";

const CATEGORIES = {
  word: { label: "단어", short: "단", icon: "book-open" },
  sentence: { label: "문장", short: "문", icon: "message" },
  drama: { label: "미드 숏폼", short: "미", icon: "play" },
  news: { label: "뉴스", short: "뉴", icon: "news" },
};

const fallbackWords = [
  { word: "meticulous", phonetic: "/məˈtɪkjələs/", type: "adjective", meaning: "꼼꼼한, 세심한", definition: "showing great attention to every detail", example: "She kept meticulous records of every experiment.", translation: "그녀는 모든 실험을 꼼꼼하게 기록했다.", source: "Cambridge Dictionary", sourceUrl: "https://dictionary.cambridge.org/dictionary/english/meticulous" },
  { word: "resilient", phonetic: "/rɪˈzɪliənt/", type: "adjective", meaning: "회복력이 강한", definition: "able to recover quickly from difficulties", example: "Resilient people often turn setbacks into opportunities.", translation: "회복력이 강한 사람들은 종종 좌절을 기회로 바꾼다.", source: "Cambridge Dictionary", sourceUrl: "https://dictionary.cambridge.org/dictionary/english/resilient" },
  { word: "substantial", phonetic: "/səbˈstænʃəl/", type: "adjective", meaning: "상당한, 실질적인", definition: "large in amount, value, or importance", example: "The project requires a substantial amount of research.", translation: "그 프로젝트에는 상당한 양의 연구가 필요하다.", source: "Cambridge Dictionary", sourceUrl: "https://dictionary.cambridge.org/dictionary/english/substantial" },
  { word: "maintain", phonetic: "/meɪnˈteɪn/", type: "verb", meaning: "유지하다", definition: "to continue to have or do something", example: "We need to maintain a steady study routine.", translation: "우리는 꾸준한 학습 루틴을 유지해야 한다.", source: "Cambridge Dictionary", sourceUrl: "https://dictionary.cambridge.org/dictionary/english/maintain" },
  { word: "improve", phonetic: "/ɪmˈpruːv/", type: "verb", meaning: "향상시키다, 개선하다", definition: "to get better or to make something better", example: "Reading daily can improve your vocabulary.", translation: "매일 읽는 것은 어휘력을 향상시킬 수 있다.", source: "Cambridge Dictionary", sourceUrl: "https://dictionary.cambridge.org/dictionary/english/improve" },
  { word: "confident", phonetic: "/ˈkɒnfɪdənt/", type: "adjective", meaning: "자신감 있는", definition: "feeling sure about your ability to do things", example: "She feels confident when speaking English now.", translation: "그녀는 이제 영어로 말할 때 자신감을 느낀다.", source: "Cambridge Dictionary", sourceUrl: "https://dictionary.cambridge.org/dictionary/english/confident" },
  { word: "review", phonetic: "/rɪˈvjuː/", type: "verb / noun", meaning: "복습하다 / 복습", definition: "to study something again in order to remember it", example: "A quick review helps you remember better.", translation: "짧은 복습은 더 잘 기억하도록 도와준다.", source: "Cambridge Dictionary", sourceUrl: "https://dictionary.cambridge.org/dictionary/english/review" },
];

// 대규모 단어 파일을 우선 사용하고, 로드할 수 없는 경우에만 기본 단어를 사용합니다.
const words = vocabularyWords.length >= 1000 ? vocabularyWords : fallbackWords;

const newsArticles = [
  {
    source: "THE KOREA HERALD", tag: "SCIENCE", title: "Seoul expands quiet green spaces for healthier city life",
    summary: "A new urban project is transforming unused corners of Seoul into small gardens where residents can rest, read and reconnect with nature.",
    time: "3 hours ago", read: "4 min read", color: "mint",
    sentences: [
      ["Seoul is expanding a network of small green spaces across busy neighborhoods.", "서울은 번화한 지역 곳곳에 작은 녹지 공간 네트워크를 확대하고 있습니다."],
      ["The project aims to make moments of rest part of ordinary city life.", "이 프로젝트는 휴식의 순간을 평범한 도시 생활의 일부로 만드는 것을 목표로 합니다."],
      ["Urban planners say even modest gardens can improve mental well-being.", "도시 계획가들은 작은 정원도 정신 건강을 향상할 수 있다고 말합니다."],
      ["Residents have welcomed places where they can read or talk without traffic noise.", "주민들은 교통 소음 없이 책을 읽거나 대화할 수 있는 공간을 반겼습니다."],
      ["More locations will open before the end of the year.", "올해 말까지 더 많은 장소가 문을 열 예정입니다."],
    ]
  },
  {
    source: "NHK WORLD-JAPAN", tag: "TECHNOLOGY", title: "Researchers develop a new way to reduce food waste",
    summary: "Japanese researchers have introduced smart labels that make it easier to understand how fresh packaged food really is.",
    time: "Yesterday", read: "5 min read", color: "blue",
    sentences: [
      ["A research team in Japan has developed a label that changes color over time.", "일본의 한 연구팀이 시간이 지나면 색이 변하는 라벨을 개발했습니다."],
      ["The color reflects changes in temperature during transportation and storage.", "그 색은 운송과 보관 중 온도 변화를 반영합니다."],
      ["Consumers may use the label to judge freshness more accurately.", "소비자는 라벨을 이용해 신선도를 더 정확하게 판단할 수 있습니다."],
      ["The researchers hope the technology will prevent edible food from being discarded.", "연구진은 이 기술이 먹을 수 있는 음식이 버려지는 것을 막길 기대합니다."],
      ["Several retailers plan to test the system later this year.", "여러 소매업체가 올해 말 이 시스템을 시험할 계획입니다."],
    ]
  }
];

// 영어 뉴스 첫 번째 기사에 사용하는 상세 학습 데이터입니다.
// 실제 기사 전문을 복제하지 않은 개인 학습용 재구성 콘텐츠입니다.
const articleData = {
  source: "The Korea Herald",
  category: "Science",
  date: "2026.07.13",
  title: "Seoul expands quiet green spaces for healthier city life",
  dek: "City officials say a growing network of small urban retreats is designed to ease stress, improve neighborhood well-being and bring moments of calm back into everyday life.",
  image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
  caption: "A representative image of an urban green space used for this personal study page.",
  originalUrl: "https://www.koreaherald.com/",
  summary: [
    "Seoul is expanding a series of small, quiet green areas throughout dense neighborhoods as part of a broader effort to improve quality of life in the city.",
    "Officials say the spaces are meant to offer residents brief but meaningful moments of rest, even in districts where heavy traffic and tightly packed buildings leave little room for relaxation.",
    "Urban planners and local residents alike see the project as a practical step toward making the city feel more livable, human-centered and emotionally restorative.",
  ],
  sentences: [
    {
      en: "Seoul is expanding a network of small green spaces across busy neighborhoods in an effort to make daily urban life feel less rushed and more breathable.",
      ko: "서울은 바쁜 도심 지역 곳곳에 작은 녹지 공간 네트워크를 확대해, 일상적인 도시 생활이 덜 분주하고 더 숨 쉴 수 있게 느껴지도록 하려 하고 있다.",
      note: "in an effort to는 ‘~하기 위한 노력으로’라는 뜻이며, make A B는 ‘A를 B하게 만들다’라는 핵심 구조입니다.",
      expressions: [{ term: "expand a network", meaning: "네트워크를 확대하다 / 체계를 넓히다" }, { term: "in an effort to", meaning: "~하기 위한 노력으로" }, { term: "feel less rushed", meaning: "덜 쫓기는 느낌이 들다" }],
    },
    {
      en: "City officials say the project is not only about adding plants or benches, but also about rethinking how public space can support emotional well-being.",
      ko: "시 당국은 이 프로젝트가 단순히 식물이나 벤치를 더하는 데 그치지 않고, 공공 공간이 정서적 안녕을 어떻게 뒷받침할 수 있는지 다시 생각하는 일이라고 말한다.",
      note: "not only A but also B 구조가 보이며, rethinking은 ‘다시 생각하기, 재검토하기’의 의미로 많이 쓰입니다.",
      expressions: [{ term: "not only A but also B", meaning: "A뿐만 아니라 B도" }, { term: "public space", meaning: "공공 공간" }, { term: "emotional well-being", meaning: "정서적 안녕, 정신적 안정감" }],
    },
    {
      en: "Many of the planned sites are intentionally modest in size, allowing them to fit into leftover corners of the city where larger parks would be impossible.",
      ko: "계획된 부지들 중 많은 곳은 의도적으로 규모를 작게 해, 더 큰 공원이 들어서기 어려운 도심의 자투리 공간에도 들어갈 수 있도록 했다.",
      note: "intentionally는 ‘의도적으로’, modest in size는 ‘규모가 크지 않은’이라는 뜻입니다.",
      expressions: [{ term: "intentionally modest", meaning: "의도적으로 소규모인" }, { term: "fit into", meaning: "~에 들어맞다, 맞추어 들어가다" }, { term: "leftover corners", meaning: "남는 구석 공간, 자투리 공간" }],
    },
    {
      en: "Urban planners involved in the program argue that even a short pause in a quieter environment can help residents recover from the mental pressure of crowded streets.",
      ko: "이 프로그램에 참여한 도시계획 전문가들은 보다 조용한 환경에서의 짧은 휴식만으로도 주민들이 붐비는 거리의 정신적 압박에서 회복하는 데 도움이 될 수 있다고 말한다.",
      note: "argue that은 ‘~라고 주장하다’, recover from은 ‘~로부터 회복하다’라는 뜻입니다.",
      expressions: [{ term: "be involved in", meaning: "~에 참여하다, 관여하다" }, { term: "argue that", meaning: "~라고 주장하다" }, { term: "recover from", meaning: "~로부터 회복하다" }],
    },
    {
      en: "The city has emphasized that these pocket-sized green areas are meant to complement existing infrastructure rather than replace major development plans.",
      ko: "시는 이러한 소규모 녹지 공간이 기존 인프라를 대체하기보다는 보완하기 위한 것임을 강조해 왔다.",
      note: "be meant to는 ‘~하도록 의도되다’, rather than은 ‘~라기보다는’이라는 의미입니다.",
      expressions: [{ term: "pocket-sized", meaning: "아주 작은 규모의, 소규모의" }, { term: "be meant to", meaning: "~하도록 의도되다" }, { term: "rather than", meaning: "~라기보다는" }],
    },
    {
      en: "Residents in several districts have welcomed the changes, saying the new spaces offer rare places where they can sit quietly, read a book or talk without constant traffic noise.",
      ko: "여러 지역의 주민들은 새 공간이 조용히 앉아 있거나 책을 읽거나 끊임없는 교통 소음 없이 대화할 수 있는 드문 장소를 제공한다며 이러한 변화를 반기고 있다.",
      note: "have welcomed는 현재완료로 ‘반겨 왔다’, rare places where는 ‘~할 수 있는 드문 장소’라는 표현입니다.",
      expressions: [{ term: "welcome the changes", meaning: "변화를 반기다" }, { term: "offer rare places", meaning: "드문 공간을 제공하다" }, { term: "constant traffic noise", meaning: "끊임없는 교통 소음" }],
    },
    {
      en: "Some neighborhood groups have also suggested that the areas could be used for small cultural events, provided that the atmosphere remains calm and accessible to all age groups.",
      ko: "일부 지역 단체들은 또한 그 공간이 조용하고 모든 연령대가 이용하기 쉬운 분위기를 유지한다는 전제하에, 소규모 문화 행사에도 활용될 수 있다고 제안했다.",
      note: "provided that은 ‘~라는 조건으로’, accessible to는 ‘~가 이용하기 쉬운’이라는 뜻입니다.",
      expressions: [{ term: "neighborhood groups", meaning: "지역 단체, 동네 공동체 그룹" }, { term: "provided that", meaning: "~라는 조건으로" }, { term: "accessible to all age groups", meaning: "모든 연령층이 이용하기 쉬운" }],
    },
    {
      en: "Officials say additional locations are expected to open before the end of the year, with future planning likely to focus on districts that currently lack shared resting areas.",
      ko: "관계자들은 연말 이전에 추가 장소들이 개방될 것으로 예상하며, 향후 계획은 현재 공동 휴식 공간이 부족한 지역에 초점을 맞출 가능성이 크다고 말한다.",
      note: "be expected to는 ‘~할 것으로 예상되다’, focus on은 ‘~에 초점을 맞추다’라는 뜻입니다.",
      expressions: [{ term: "be expected to", meaning: "~할 것으로 예상되다" }, { term: "before the end of the year", meaning: "연말 이전에" }, { term: "focus on", meaning: "~에 초점을 맞추다" }],
    },
  ],
};

const articleLibraryBase = [
  {
    id: "science-001",
    source: "The Korea Herald",
    category: "Science",
    date: "2026.07.13",
    dateOrder: "2026-07-13",
    title: "Seoul expands quiet green spaces for healthier city life",
    dek: "City officials say a growing network of small urban retreats is designed to ease stress, improve neighborhood well-being and restore calm to everyday routines.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
    caption: "Representative image for an urban green space story. Replace with an approved thumbnail or licensed editorial image in production.",
    originalUrl: "https://www.koreaherald.com/",
    summary: [
      "Seoul is expanding a series of small, quiet green areas throughout dense neighborhoods as part of a broader effort to improve quality of life in the city.",
      "Officials say the spaces are meant to offer residents brief but meaningful moments of rest, even in districts where heavy traffic and tightly packed buildings leave little room for relaxation.",
      "Urban planners and local residents alike see the project as a practical step toward making the city feel more livable, human-centered and emotionally restorative."
    ],
    sentences: [
      {
        en: "Seoul is expanding a network of small green spaces across busy neighborhoods in an effort to make daily urban life feel less rushed and more breathable.",
        ko: "서울은 바쁜 도심 지역 곳곳에 작은 녹지 공간 네트워크를 확대해, 일상적인 도시 생활이 덜 분주하고 더 숨 쉴 수 있게 느껴지도록 하려 하고 있다.",
        note: "in an effort to는 '~하기 위한 노력으로'라는 뜻이며, make A B는 'A를 B하게 만들다'라는 핵심 구조입니다.",
        expressions: [
          { term: "expand a network", meaning: "네트워크를 확대하다 / 체계를 넓히다" },
          { term: "in an effort to", meaning: "~하기 위한 노력으로" },
          { term: "feel less rushed", meaning: "덜 쫓기는 느낌이 들다" }
        ]
      },
      {
        en: "City officials say the project is not only about adding plants or benches, but also about rethinking how public space can support emotional well-being.",
        ko: "시 당국은 이 프로젝트가 단순히 식물이나 벤치를 더하는 데 그치지 않고, 공공 공간이 정서적 안녕을 어떻게 뒷받침할 수 있는지 다시 생각하는 일이라고 말한다.",
        note: "not only A but also B 구조가 보이며, rethinking은 '다시 생각하기, 재검토하기'의 의미로 많이 쓰입니다.",
        expressions: [
          { term: "not only A but also B", meaning: "A뿐만 아니라 B도" },
          { term: "public space", meaning: "공공 공간" },
          { term: "emotional well-being", meaning: "정서적 안녕, 정신적 안정감" }
        ]
      },
      {
        en: "Many of the planned sites are intentionally modest in size, allowing them to fit into leftover corners of the city where larger parks would be impossible.",
        ko: "계획된 부지들 중 많은 곳은 의도적으로 규모를 작게 해, 더 큰 공원이 들어서기 어려운 도심의 자투리 공간에도 들어갈 수 있도록 했다.",
        note: "intentionally는 '의도적으로', modest in size는 '규모가 크지 않은'이라는 뜻입니다.",
        expressions: [
          { term: "intentionally modest", meaning: "의도적으로 소규모인" },
          { term: "fit into", meaning: "~에 들어맞다, 맞추어 들어가다" },
          { term: "leftover corners", meaning: "남는 구석 공간, 자투리 공간" }
        ]
      },
      {
        en: "Urban planners involved in the program argue that even a short pause in a quieter environment can help residents recover from the mental pressure of crowded streets.",
        ko: "이 프로그램에 참여한 도시계획 전문가들은 보다 조용한 환경에서의 짧은 휴식만으로도 주민들이 붐비는 거리의 정신적 압박에서 회복하는 데 도움이 될 수 있다고 말한다.",
        note: "argue that은 '…라고 주장하다', recover from은 '~로부터 회복하다'의 뜻입니다.",
        expressions: [
          { term: "be involved in", meaning: "~에 참여하다, 관여하다" },
          { term: "argue that", meaning: "~라고 주장하다" },
          { term: "recover from", meaning: "~로부터 회복하다" }
        ]
      }
    ]
  },
  {
    id: "business-001",
    source: "The Korea Herald",
    category: "Business",
    date: "2026.07.11",
    dateOrder: "2026-07-11",
    title: "Local manufacturers accelerate battery recycling investment",
    dek: "Companies are increasing spending on battery recycling technologies as supply security and sustainability become central to long-term industrial strategy.",
    image: "https://images.unsplash.com/photo-1597404294360-feeeda04612e?auto=format&fit=crop&w=1400&q=80",
    caption: "Representative electric-vehicle and battery image for battery recycling and materials investment coverage.",
    originalUrl: "https://www.koreaherald.com/",
    summary: [
      "A growing number of manufacturers are investing in battery recycling capacity to recover valuable metals and reduce dependence on newly mined raw materials.",
      "Executives say the shift is driven both by supply chain concerns and by pressure to meet stricter sustainability expectations from customers and regulators.",
      "Industry observers believe the trend could reshape the economics of advanced materials over the next several years."
    ],
    sentences: [
      {
        en: "Local manufacturers are accelerating investment in battery recycling facilities as competition for critical minerals grows more intense around the world.",
        ko: "국내 제조업체들은 전 세계적으로 핵심 광물 확보 경쟁이 더 치열해짐에 따라 배터리 재활용 설비 투자를 가속화하고 있다.",
        note: "accelerate investment는 '투자를 가속화하다', critical minerals는 산업적으로 중요한 핵심 광물을 뜻합니다.",
        expressions: [
          { term: "accelerate investment", meaning: "투자를 가속화하다" },
          { term: "battery recycling facilities", meaning: "배터리 재활용 설비" },
          { term: "critical minerals", meaning: "핵심 광물" }
        ]
      },
      {
        en: "Executives say recycling is no longer viewed as a secondary business, but as a strategic pillar that can improve both supply stability and environmental performance.",
        ko: "경영진은 재활용이 더 이상 부차적인 사업으로 여겨지지 않으며, 공급 안정성과 환경 성과를 모두 개선할 수 있는 전략적 축으로 인식된다고 말한다.",
        note: "no longer는 '더 이상 ~아니다', strategic pillar는 '전략적 핵심 축'이라는 표현입니다.",
        expressions: [
          { term: "no longer viewed as", meaning: "더 이상 ~로 여겨지지 않는" },
          { term: "strategic pillar", meaning: "전략적 핵심 축" },
          { term: "supply stability", meaning: "공급 안정성" }
        ]
      },
      {
        en: "Several firms are expanding pilot programs that recover nickel, cobalt and lithium from used batteries and manufacturing scrap.",
        ko: "여러 기업이 사용 후 배터리와 제조 공정 스크랩에서 니켈, 코발트, 리튬을 회수하는 파일럿 프로그램을 확대하고 있다.",
        note: "recover A from B는 'B로부터 A를 회수하다', manufacturing scrap은 제조 공정 부산물 또는 스크랩을 말합니다.",
        expressions: [
          { term: "pilot programs", meaning: "시범 프로그램" },
          { term: "recover from", meaning: "~로부터 회수하다" },
          { term: "manufacturing scrap", meaning: "제조 공정 스크랩" }
        ]
      },
      {
        en: "Analysts note that the commercial success of the sector will depend not only on technology, but also on collection systems, regulation and long-term demand visibility.",
        ko: "분석가들은 이 분야의 상업적 성공이 기술뿐 아니라 수거 체계, 규제, 그리고 장기 수요 가시성에도 달려 있다고 지적한다.",
        note: "depend on은 '~에 달려 있다', demand visibility는 향후 수요를 예측할 수 있는 정도를 말합니다.",
        expressions: [
          { term: "commercial success", meaning: "상업적 성공" },
          { term: "depend on", meaning: "~에 달려 있다" },
          { term: "demand visibility", meaning: "수요 가시성, 향후 수요 예측 가능성" }
        ]
      }
    ]
  },
  {
    id: "society-001",
    source: "The Korea Herald",
    category: "Society",
    date: "2026.07.09",
    dateOrder: "2026-07-09",
    title: "Libraries reinvent themselves as community learning hubs",
    dek: "Public libraries are adding digital programs, shared study zones and neighborhood events to serve broader community needs in a rapidly changing city.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80",
    caption: "Representative image for public library and community learning coverage.",
    originalUrl: "https://www.koreaherald.com/",
    summary: [
      "Libraries are evolving beyond traditional book-lending roles and becoming flexible spaces for study, digital access and local gatherings.",
      "Administrators say the shift reflects changing public expectations as residents seek places that support learning, connection and practical daily needs.",
      "The transformation is especially visible in urban neighborhoods where shared indoor community space is limited."
    ],
    sentences: [
      {
        en: "Public libraries are increasingly redefining themselves as multi-purpose community hubs rather than quiet storage spaces for books alone.",
        ko: "공공도서관은 점점 책만 보관하는 조용한 공간이 아니라 다목적 지역 커뮤니티 허브로 자신을 재정의하고 있다.",
        note: "redefine oneself as는 '~로 자신을 새롭게 규정하다', rather than은 '~라기보다는'이라는 뜻입니다.",
        expressions: [
          { term: "redefine themselves", meaning: "자신의 정체성을 새롭게 규정하다" },
          { term: "multi-purpose", meaning: "다목적의" },
          { term: "rather than", meaning: "~라기보다는" }
        ]
      },
      {
        en: "Many branches have introduced digital literacy classes, shared work tables and neighborhood events to respond to broader public demand.",
        ko: "많은 지점들은 더 넓어진 시민 수요에 대응하기 위해 디지털 문해 교육, 공동 작업 테이블, 지역 행사를 도입했다.",
        note: "introduce는 '도입하다', respond to는 '~에 대응하다'라는 뜻입니다.",
        expressions: [
          { term: "digital literacy classes", meaning: "디지털 문해 교육" },
          { term: "shared work tables", meaning: "공용 작업 테이블" },
          { term: "respond to", meaning: "~에 대응하다" }
        ]
      },
      {
        en: "Library administrators say the new model is designed to make the institution more useful in everyday life, especially for students, seniors and remote workers.",
        ko: "도서관 운영자들은 새로운 모델이 특히 학생, 고령층, 원격 근무자들에게 일상 속에서 더 유용한 기관이 되도록 설계되었다고 말한다.",
        note: "be designed to는 '~하도록 설계되다', especially for는 '특히 ~에게'를 나타냅니다.",
        expressions: [
          { term: "administrators", meaning: "운영자, 관리자" },
          { term: "be designed to", meaning: "~하도록 설계되다" },
          { term: "remote workers", meaning: "원격 근무자" }
        ]
      },
      {
        en: "Observers say the trend reflects a wider effort to build accessible spaces where learning and social connection can happen at the same time.",
        ko: "관측통들은 이 흐름이 학습과 사회적 연결이 동시에 이루어질 수 있는 접근성 높은 공간을 만들려는 더 큰 노력의 반영이라고 말한다.",
        note: "reflect는 '반영하다', at the same time은 '동시에'라는 뜻입니다.",
        expressions: [
          { term: "reflect a wider effort", meaning: "더 큰 노력을 반영하다" },
          { term: "accessible spaces", meaning: "접근성 높은 공간" },
          { term: "at the same time", meaning: "동시에" }
        ]
      }
    ]
  }
];

// Verified Korea Herald articles. The titles, dates and links point to the
// original detail pages; summaries and study sentences are our paraphrases.
// bodyParagraphs is intentionally empty until licensed/original body text is supplied.
let articleLibrary = [
  {
    id: "business-10438888",
    source: "The Korea Herald",
    category: "Business",
    date: "March 11, 2025",
    dateOrder: "2025-03-11",
    title: "Kbank posts record 2024 profit, driven by customer growth",
    dek: "Kbank reported record annual earnings as its customer base and core banking business expanded.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
    caption: "Representative learning image (not the original article photo)",
    originalUrl: "https://www.koreaherald.com/article/10438888",
    summary: [
      "Kbank reported a record net profit for 2024.",
      "Strong customer growth helped deposits and loans increase.",
      "The bank also improved noninterest income and financial stability."
    ],
    sentences: [
      {
        en: "Kbank reported a record net profit in 2024 as its customer base expanded.",
        ko: "케이뱅크는 고객 기반이 확대되면서 2024년에 사상 최대 순이익을 기록했습니다.",
        note: "as는 여기서 두 변화가 함께 일어난 배경을 설명합니다.",
        expressions: [{ term: "record net profit", meaning: "사상 최대 순이익" }, { term: "customer base", meaning: "고객 기반" }]
      },
      {
        en: "Growth in deposits and loans strengthened the bank's core business.",
        ko: "예금과 대출의 성장은 은행의 핵심 사업을 강화했습니다.",
        note: "growth in + 명사는 특정 영역의 성장을 나타냅니다.",
        expressions: [{ term: "deposits and loans", meaning: "예금과 대출" }, { term: "core business", meaning: "핵심 사업" }]
      }
    ]
  },
  {
    id: "travel-10432202",
    source: "The Korea Herald",
    category: "Travel",
    date: "March 3, 2025",
    dateOrder: "2025-03-03",
    title: "Tourism grows strongly in January",
    dek: "South Korea welcomed more international visitors in January as tourism demand continued to recover.",
    image: "https://images.unsplash.com/photo-1538485399081-7c8972cc6c0f?auto=format&fit=crop&w=1200&q=80",
    caption: "Representative learning image (not the original article photo)",
    originalUrl: "https://www.koreaherald.com/article/10432202",
    summary: [
      "International arrivals rose strongly from a year earlier in January.",
      "China represented the largest share of inbound visitors.",
      "Tourism officials planned promotions focused on food, beauty and premium travel."
    ],
    sentences: [
      {
        en: "International arrivals increased sharply in January compared with a year earlier.",
        ko: "1월 외국인 입국자 수는 전년 동기와 비교해 크게 증가했습니다.",
        note: "compared with는 수치나 시점을 비교할 때 자주 쓰입니다.",
        expressions: [{ term: "international arrivals", meaning: "외국인 입국자" }, { term: "compared with", meaning: "~와 비교해" }]
      },
      {
        en: "Tourism campaigns will highlight Korean food, beauty and premium travel experiences.",
        ko: "관광 캠페인은 한국 음식과 뷰티, 고급 여행 경험을 중점적으로 알릴 예정입니다.",
        note: "highlight는 중요한 부분을 강조하거나 부각한다는 뜻입니다.",
        expressions: [{ term: "tourism campaign", meaning: "관광 캠페인" }, { term: "highlight", meaning: "부각하다" }]
      }
    ]
  },
  {
    id: "retail-10434176",
    source: "The Korea Herald",
    category: "Business",
    date: "March 5, 2025",
    dateOrder: "2025-03-05",
    title: "Shinsegae banks on Emart, Starbucks as growth drivers",
    dek: "Shinsegae outlined a strategy centered on strengthening its leading retail brands and stabilizing weaker businesses.",
    image: "https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=1200&q=80",
    caption: "Representative learning image (not the original article photo)",
    originalUrl: "https://www.koreaherald.com/article/10434176",
    summary: [
      "Shinsegae identified Emart and Starbucks as major growth engines.",
      "Its strategy combines market leadership with business normalization.",
      "The group also aims to stabilize its e-commerce and construction operations."
    ],
    sentences: [
      {
        en: "Shinsegae is counting on Emart and Starbucks to drive future growth.",
        ko: "신세계는 향후 성장을 이끌 동력으로 이마트와 스타벅스에 기대를 걸고 있습니다.",
        note: "count on은 사람이나 대상에 의지하거나 기대한다는 표현입니다.",
        expressions: [{ term: "count on", meaning: "~에 기대를 걸다" }, { term: "drive growth", meaning: "성장을 이끌다" }]
      },
      {
        en: "The group plans to reinforce its core brands while stabilizing underperforming businesses.",
        ko: "그룹은 핵심 브랜드를 강화하는 동시에 실적이 부진한 사업을 안정화할 계획입니다.",
        note: "while은 두 활동이 동시에 진행됨을 보여줍니다.",
        expressions: [{ term: "reinforce", meaning: "강화하다" }, { term: "underperforming", meaning: "실적이 부진한" }]
      }
    ]
  }
].map(article => ({
  ...article,
  contentStatus: "metadata_only",
  bodyParagraphs: [],
  studySentences: article.sentences,
}));
articleLibrary = [...loadArticles().map(toNewsArticle), ...articleLibrary];

async function refreshDailyNewsLibrary() {
  try {
    const response = await fetch(`/api/daily-news?date=${localDateKey()}`, { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    if (!Array.isArray(payload.articles) || !payload.articles.length) return;
    const fetchedById = new Map(payload.articles.map(article => [article.id, article]));
    articleLibrary = articleLibrary.map(article => {
      const fetched = fetchedById.get(article.id);
      if (!fetched) return article;
      return {
        ...article,
        ...fetched,
        title: fetched.title || article.title,
        dek: fetched.dek || article.dek,
        image: fetched.image || article.image,
        date: fetched.publishedAt ? new Date(fetched.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : article.date,
      };
    });
    state.newsIndex = 0;
    if (document.body.dataset.page === "news" || location.pathname.endsWith("/news.html")) render();
  } catch (error) {
    console.warn("Daily news update skipped; using the last verified article set.", error);
  }
}

// 등록된 기사 중 하나를 날짜 순서대로 선택합니다.
// 같은 날에는 같은 기사가 유지되고, 다음 날에는 다음 기사가 소개됩니다.
function getDailyNewsArticle(dateKey = localDateKey()) {
  if (!articleLibrary.length) return null;
  const dayNumber = Math.floor(new Date(`${dateKey}T00:00:00`).getTime() / 86400000);
  return articleLibrary[Math.abs(dayNumber) % articleLibrary.length];
}

function formatNewsStudyDate(dateKey = localDateKey()) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(`${dateKey}T00:00:00`));
}


const defaultHistory = {
  "2026-07-01": ["word", "sentence", "drama", "news"], "2026-07-02": ["word", "sentence", "news"],
  "2026-07-03": ["word", "sentence", "drama", "news"], "2026-07-04": ["word", "sentence", "drama", "news"],
  "2026-07-05": ["word", "sentence"], "2026-07-06": ["word", "sentence", "drama", "news"],
  "2026-07-07": ["word", "sentence", "drama", "news"], "2026-07-08": ["word", "sentence", "news"],
  "2026-07-09": ["word", "sentence", "drama", "news"], "2026-07-10": ["word", "sentence", "drama", "news"],
  "2026-07-11": ["word", "sentence", "drama", "news"], "2026-07-12": ["word", "sentence", "drama"],
  "2026-07-13": ["word", "sentence"],
};

const favoriteBlogPosts = [
  { phrase: "I am here to help", meaning: "제가 도와드리려고 왔어요", category: "일상 회화", date: "2026.05.22", note: "누군가를 안심시키거나 고객을 응대할 때 자연스럽게 건네는 표현이에요.", color: "sage" },
  { phrase: "went too far", meaning: "너무 멀리 갔어 / 도가 지나쳤어", category: "오늘의 표현", date: "2026.05.27", note: "물리적인 거리뿐 아니라 말이나 행동이 지나쳤을 때도 활용할 수 있어요.", color: "sand" },
  { phrase: "Pig out", meaning: "폭식하다, 정신없이 먹다", category: "구동사", date: "최근 포스트", note: "맛있는 음식을 배부르게 먹는 일상적인 상황에서 쓰는 친근한 표현이에요.", color: "blue" },
  { phrase: "Window shopping", meaning: "아이 쇼핑", category: "생활 영어", date: "추천 포스트", note: "물건을 사지 않고 구경만 하는 상황을 영어로 익혀보세요.", color: "rose" },
];

const BLOG_URL = "https://blog.naver.com/letsleenglish";

// 미드 학습 영상은 아래 ID만 바꾸면 교체됩니다.
// YouTube 주소의 watch?v= 뒤에 있는 값만 입력하세요.
const videoId = "b_xxR-erIH4";

// 영상 ID 또는 다양한 형식의 YouTube 주소에서 11자리 영상 ID를 추출합니다.
function extractYouTubeId(input) {
  if (!input) return null;

  const value = String(input).trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    let extractedId = null;

    if (url.hostname.includes("youtu.be")) {
      extractedId = url.pathname.split("/").filter(Boolean)[0] || null;
    } else if (url.searchParams.get("v")) {
      extractedId = url.searchParams.get("v");
    } else if (url.pathname.includes("/embed/")) {
      extractedId = url.pathname.split("/embed/")[1]?.split("/")[0] || null;
    } else if (url.pathname.includes("/shorts/")) {
      extractedId = url.pathname.split("/shorts/")[1]?.split("/")[0] || null;
    } else if (url.pathname.includes("/live/")) {
      extractedId = url.pathname.split("/live/")[1]?.split("/")[0] || null;
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(extractedId || "") ? extractedId : null;
  } catch {
    return null;
  }
}

function makeYouTubeEmbedUrl(input) {
  const id = extractYouTubeId(input);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

function makeYouTubeWatchUrl(input) {
  const id = extractYouTubeId(input);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

function makeYouTubeThumbnailUrl(input) {
  const id = extractYouTubeId(input);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// 자막과 학습 스크립트가 모두 준비된 활성 영상만 운영 후보로 사용합니다.
function getEligibleTedLessons() {
  return tedLessons.filter(lesson =>
    lesson.active &&
    lesson.scriptAvailable &&
    extractYouTubeId(lesson.videoId) &&
    Array.isArray(lesson.script) &&
    lesson.script.length > 0
  );
}

// 수동 지정 → 날짜 예약 → 날짜 기반 순환 순서로 오늘의 영상 1개를 결정합니다.
// 향후 DB/API를 연결해도 tedSettings와 tedLessons만 교체하면 같은 우선순위를 유지할 수 있습니다.
function getDailyTedLesson(dateKey = localDateKey()) {
  const eligible = getEligibleTedLessons();
  if (!eligible.length) return null;

  const manual = tedSettings.manualOverrideId
    ? eligible.find(lesson => lesson.id === tedSettings.manualOverrideId)
    : null;
  if (manual) return manual;

  const scheduled = eligible.find(lesson => lesson.scheduledDate === dateKey);
  if (scheduled) return scheduled;

  const dayNumber = Math.floor(new Date(`${dateKey}T00:00:00`).getTime() / 86400000);
  return eligible[Math.abs(dayNumber) % eligible.length];
}

const tedTranscriptCache = new Map();

// 사용자가 제공한 타임스탬프 원문을 시간 단락별로 읽고, 각 단락을 다시 문장 단위로 나눕니다.
function parseTedTranscript(raw = "") {
  if (!raw.trim()) return [];
  if (tedTranscriptCache.has(raw)) return tedTranscriptCache.get(raw);

  const segmenter = typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("en", { granularity: "sentence" })
    : null;
  const parsed = [];

  raw.trim().split(/\r?\n\s*\r?\n/).forEach(block => {
    const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const time = /^\d{2}:\d{2}$/.test(lines[0] || "") ? lines.shift() : "";
    const text = lines.join(" ").trim();
    if (!text) return;
    const sentences = segmenter
      ? [...segmenter.segment(text)].map(item => item.segment.trim()).filter(Boolean)
      : text.split(/(?<=[.!?])\s+(?=[A-Z"(])/).map(item => item.trim()).filter(Boolean);
    sentences.forEach(en => parsed.push({ en, ko: "", time }));
  });

  tedTranscriptCache.set(raw, parsed);
  return parsed;
}

function getTedTranscriptLines(lesson) {
  const suppliedTranscript = parseTedTranscript(lesson?.transcriptRaw || "");
  if (suppliedTranscript.length) return suppliedTranscript;
  if (Array.isArray(lesson?.transcript) && lesson.transcript.length) return lesson.transcript;
  return Array.isArray(lesson?.script) ? lesson.script : [];
}

const TED_MASTERY_STORAGE_KEY = "value_time_ted_mastered_sentences_v1";
const TED_ASSIGNMENT_STORAGE_KEY = "value_time_ted_daily_assignments_v1";

function readTedSentenceStore(key) {
  try { return JSON.parse(profileStorage.getItem(key) || "{}"); }
  catch { return {}; }
}

function getTedMasteredSourceIndexes(lessonId) {
  const stored = readTedSentenceStore(TED_MASTERY_STORAGE_KEY)[lessonId];
  return Array.isArray(stored) ? stored.map(Number).filter(Number.isInteger) : [];
}

function saveTedMasteredSourceIndexes(lessonId, indexes) {
  const stored = readTedSentenceStore(TED_MASTERY_STORAGE_KEY);
  stored[lessonId] = [...new Set(indexes)].sort((a, b) => a - b);
  profileStorage.setItem(TED_MASTERY_STORAGE_KEY, JSON.stringify(stored));
}

function getDailyTedStudySentences(lesson, transcriptLines = getTedTranscriptLines(lesson)) {
  if (!transcriptLines.length) return [];
  const assignmentKey = `${lesson.id}:${localDateKey()}`;
  const assignments = readTedSentenceStore(TED_ASSIGNMENT_STORAGE_KEY);
  let sourceIndexes = Array.isArray(assignments[assignmentKey])
    ? assignments[assignmentKey].map(Number).filter(index => Number.isInteger(index) && index >= 0 && index < transcriptLines.length)
    : [];

  if (!sourceIndexes.length) {
    const mastered = new Set(getTedMasteredSourceIndexes(lesson.id));
    sourceIndexes = transcriptLines.map((_, index) => index).filter(index => !mastered.has(index)).slice(0, 5);
    // 모든 문장을 끝낸 뒤에도 마지막 5문장을 복습 화면으로 유지합니다.
    if (!sourceIndexes.length) sourceIndexes = transcriptLines.map((_, index) => index).slice(-5);
    assignments[assignmentKey] = sourceIndexes;
    profileStorage.setItem(TED_ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignments));
  }

  return sourceIndexes.map(sourceIndex => ({ ...transcriptLines[sourceIndex], sourceIndex }));
}

const TED_EXPRESSION_PATTERNS = [
  { regex: /it's the most\s+[^,.!?]+/i, term: "It's the most + 형용사 + 명사", meaning: "가장 ~한 …이다" },
  { regex: /the only one that/i, term: "the only one that + 동사", meaning: "~하는 유일한 것/사람" },
  { regex: /have the experience that/i, term: "have the experience that + 문장", meaning: "~하는 경험을 하다" },
  { regex: /when\s+[^,.!?]+,\s*[^.!?]+/i, term: "when + 주어 + 동사", meaning: "~할 때" },
  { regex: /how can we\s+/i, term: "How can we + 동사?", meaning: "우리가 어떻게 ~할 수 있을까?" },
  { regex: /would like to/i, term: "would like to + 동사", meaning: "~하고 싶다" },
  { regex: /a number of/i, term: "a number of + 복수명사", meaning: "여러, 많은 ~" },
  { regex: /move away from/i, term: "move away from", meaning: "~에서 벗어나다" },
  { regex: /fall into/i, term: "fall into", meaning: "~에 빠지다" },
  { regex: /speak ill of/i, term: "speak ill of", meaning: "~을 험담하다" },
  { regex: /it's (?:very )?hard to/i, term: "It's hard to + 동사", meaning: "~하기 어렵다" },
  { regex: /at the same time/i, term: "at the same time", meaning: "동시에" },
  { regex: /another form of/i, term: "another form of", meaning: "또 다른 형태의 ~" },
  { regex: /complain about/i, term: "complain about", meaning: "~에 대해 불평하다" },
  { regex: /take responsibility for/i, term: "take responsibility for", meaning: "~에 책임을 지다" },
  { regex: /as if/i, term: "as if + 문장", meaning: "마치 ~인 것처럼" },
  { regex: /if we want/i, term: "if we want + 명사/to부정사", meaning: "우리가 ~을 원한다면" },
  { regex: /be true in/i, term: "be true in what you say", meaning: "말하는 내용에 진실하다" },
  { regex: /first of all/i, term: "first of all", meaning: "우선, 무엇보다 먼저" },
  { regex: /the way that/i, term: "the way that + 문장", meaning: "~하는 방식" },
  { regex: /associate\s+[^,.!?]+\s+with/i, term: "associate A with B", meaning: "A를 B와 연관 짓다" },
  { regex: /that's not the end of the world/i, term: "not the end of the world", meaning: "큰일은 아닌" },
  { regex: /in order to/i, term: "in order to + 동사", meaning: "~하기 위해" },
  { regex: /all on one note/i, term: "all on one note", meaning: "한 가지 음조로만" },
  { regex: /go along with/i, term: "go along with", meaning: "~와 함께 가다, 동반되다" },
  { regex: /pay attention/i, term: "pay attention", meaning: "주의를 기울이다" },
  { regex: /come into play/i, term: "come into play", meaning: "작용하기 시작하다" },
  { regex: /owe it to yourself to/i, term: "owe it to yourself to + 동사", meaning: "자신을 위해 마땅히 ~해야 한다" },
  { regex: /would you (?:all )?like to/i, term: "Would you like to + 동사?", meaning: "~하시겠어요?" },
  { regex: /just like/i, term: "just like", meaning: "꼭 ~처럼" },
  { regex: /in advance/i, term: "in advance", meaning: "미리, 사전에" },
  { regex: /fit for purpose/i, term: "fit for purpose", meaning: "목적에 적합한" },
  { regex: /worth\s+\w+ing/i, term: "be worth + -ing", meaning: "~할 가치가 있다" },
];

function getDailyTedExpressions(sentences) {
  const combined = sentences.map(sentence => sentence.en).join(" ");
  const found = TED_EXPRESSION_PATTERNS.map(pattern => {
    const match = pattern.regex.exec(combined);
    if (!match) return null;
    const example = sentences.find(sentence => pattern.regex.test(sentence.en))?.en || match[0];
    return { ...pattern, example, position: match.index };
  }).filter(Boolean).sort((a, b) => a.position - b.position);

  const unique = [];
  found.forEach(item => {
    if (unique.length < 3 && !unique.some(saved => saved.term === item.term)) unique.push(item);
  });

  // 등록된 패턴이 부족한 날에는 실제 문장의 앞부분을 학습 덩어리로 보충합니다.
  sentences.forEach(sentence => {
    if (unique.length >= 3) return;
    const term = sentence.en.replace(/[“”".,!?;:]/g, "").split(/\s+/).slice(0, 5).join(" ");
    if (term && !unique.some(saved => saved.term === term)) {
      unique.push({ term, meaning: "문맥 속에서 한 덩어리로 익힐 표현", example: sentence.en });
    }
  });
  return unique.slice(0, 3);
}

const QUIZ_APP_STORAGE_KEY = "english_quiz_app_state_v4";
const defaultQuizQuestions = [
  {
    id: "grammar-report-by-friday",
    type: "Grammar",
    category: "Business",
    difficulty: "Basic",
    estimatedTime: "25 sec",
    learningPoint: "Deadline expressions in workplace English",
    question: "Choose the best preposition: The report must be submitted ___ Friday.",
    choices: ["by", "on", "from", "during"],
    answer: 0,
    explanation: "'By Friday' means no later than Friday.",
    detailedExplanation: "Use 'by + time/date' for a deadline. 'On Friday' means the action happens on Friday, but it does not clearly show the deadline.",
    wrongChoiceExplanations: ["'On Friday' indicates the day, not the latest deadline.", "'From Friday' means the starting point.", "'During Friday' is unnatural for this deadline meaning."],
    examples: ["Please send the revised file by Friday.", "The sample review should be completed by 3 p.m."],
    relatedExpressions: ["by Friday", "no later than", "deadline"],
    youtube: "",
  },
  {
    id: "grammar-production-adjustment",
    type: "Grammar",
    category: "Production",
    difficulty: "Intermediate",
    estimatedTime: "35 sec",
    learningPoint: "Part of speech in production reports",
    question: "Choose the most natural sentence for a production update.",
    choices: ["The line was adjusted to reduce defects.", "The line was adjustment to reduce defects.", "The line adjustedly reduced defects.", "The line was adjust to reduce defects."],
    answer: 0,
    explanation: "'Was adjusted' is the correct passive verb form.",
    detailedExplanation: "Production reports often use passive voice when the action matters more than the person who performed it.",
    wrongChoiceExplanations: ["'Adjustment' is a noun, so it cannot follow 'was' this way.", "'Adjustedly' is not a natural adverb here.", "'Was adjust' is not a correct verb form."],
    examples: ["The oven temperature was adjusted after the inspection.", "The process was updated to improve yield."],
    relatedExpressions: ["was adjusted", "reduce defects", "process update"],
    youtube: "",
  },
  {
    id: "reading-email-schedule",
    type: "Reading",
    category: "Email",
    difficulty: "Intermediate",
    estimatedTime: "60 sec",
    learningPoint: "Short email reading and action identification",
    passage: "Hi Mina,\nThe supplier confirmed that the new separator samples will arrive on Thursday morning. Please update the test schedule and share the revised plan with the quality team by Friday.\nThanks,\nDaniel",
    question: "What should Mina do by Friday?",
    choices: ["Share the revised test plan.", "Order new separator samples.", "Cancel the quality inspection.", "Visit the supplier on Thursday."],
    answer: 0,
    explanation: "The email asks Mina to update the test schedule and share the revised plan by Friday.",
    detailedExplanation: "In short workplace emails, identify the requested action and the deadline. Here, the deadline is Friday and the action is sharing the revised plan.",
    wrongChoiceExplanations: ["The samples are already confirmed by the supplier.", "The email does not mention canceling inspection.", "The supplier sends samples; Mina is not asked to visit."],
    examples: ["Please share the revised plan by Friday.", "The supplier confirmed the delivery schedule."],
    relatedExpressions: ["revised plan", "test schedule", "quality team"],
    youtube: "",
  },
  {
    id: "battery-cathode-discharge",
    type: "Technical English",
    category: "Battery",
    difficulty: "Intermediate",
    estimatedTime: "45 sec",
    learningPoint: "Battery component vocabulary in a discharge context",
    question: "In a lithium-ion battery during discharge, which statement best describes the cathode?",
    choices: ["It is the positive electrode that receives lithium ions.", "It is the separator that blocks ion movement.", "It is the negative electrode that releases oxygen.", "It is the pouch film that seals the cell."],
    answer: 0,
    explanation: "During discharge, the cathode works as the positive electrode and receives lithium ions through the electrolyte.",
    detailedExplanation: "The role name can change depending on charge or discharge, so the sentence context matters. In discharge, electrons flow through the external circuit while lithium ions move toward the cathode.",
    wrongChoiceExplanations: ["The separator prevents short circuits but does not receive lithium ions as an electrode.", "The negative electrode is the anode during discharge.", "Pouch film is a packaging material, not an electrode."],
    examples: ["The cathode coating must remain uniform to ensure stable cell performance.", "Lithium ions move from the anode to the cathode during discharge."],
    relatedExpressions: ["positive electrode", "active material", "ion transport"],
    youtube: videoId,
  },
  {
    id: "separator-function",
    type: "Technical English",
    category: "Safety",
    difficulty: "Intermediate",
    estimatedTime: "40 sec",
    learningPoint: "Explaining component functions clearly",
    question: "Which component allows lithium ions to move while helping prevent an internal short circuit?",
    choices: ["Binder", "Separator", "Anode foil", "Tab lead"],
    answer: 1,
    explanation: "The separator is porous enough for ion movement but keeps the electrodes electrically apart.",
    detailedExplanation: "In production or quality discussion, separator damage is a serious safety issue because it can increase the risk of internal short circuits.",
    wrongChoiceExplanations: ["Binder holds active material together but does not separate electrodes.", "Anode foil collects current; it is not the insulating barrier.", "A tab lead connects the cell to the external circuit."],
    examples: ["A damaged separator can cause a serious safety defect.", "Inspectors checked whether the separator was folded or contaminated."],
    relatedExpressions: ["internal short circuit", "porous film", "electrical insulation"],
    youtube: videoId,
  },
  {
    id: "quality-inspection-defect",
    type: "Business English",
    category: "Quality",
    difficulty: "Basic",
    estimatedTime: "35 sec",
    learningPoint: "Choosing the right quality-control verb",
    question: "Choose the most natural sentence for a quality report.",
    choices: ["We inspected the samples for surface defects.", "We inspection the samples for surface defects.", "We defected the samples for surface inspection.", "We quality the samples for surface defects."],
    answer: 0,
    explanation: "Inspect is the correct verb. Defect is usually a noun in this context.",
    detailedExplanation: "In quality reports, use 'inspect/check/test + object + for + defect/problem'. This pattern is common in manufacturing communication.",
    wrongChoiceExplanations: ["'Inspection' is a noun, not the main verb here.", "'Defect' is not used as a verb with this meaning.", "'Quality' is not used as a verb in this sentence."],
    examples: ["The team inspected the lot for contamination.", "Please check the sample for scratches before shipment."],
    relatedExpressions: ["surface defect", "visual inspection", "quality check"],
    youtube: "",
  },
  {
    id: "email-delay-update",
    type: "Business English",
    category: "Email",
    difficulty: "Basic",
    estimatedTime: "30 sec",
    learningPoint: "Professional delay notification",
    question: "Which sentence is the most professional way to explain a delay in an email?",
    choices: ["The shipment is late because we are busy.", "We apologize for the delay and will provide an updated schedule by Friday.", "It is not our problem that the shipment is late.", "You should wait until we are ready."],
    answer: 1,
    explanation: "The sentence is polite, specific, and gives a next action.",
    detailedExplanation: "Business English should reduce uncertainty. A good update includes apology, issue, timeline, and next step.",
    wrongChoiceExplanations: ["This sounds casual and does not provide a solution.", "This sounds defensive and unprofessional.", "This sounds rude and gives no useful information."],
    examples: ["We apologize for the inconvenience and will share the revised timeline shortly.", "Thank you for your patience while we confirm the delivery date."],
    relatedExpressions: ["updated schedule", "revised timeline", "thank you for your patience"],
    youtube: "",
  },
  {
    id: "reading-notice-safety",
    type: "Reading",
    category: "Safety",
    difficulty: "Intermediate",
    estimatedTime: "55 sec",
    learningPoint: "Short notice reading with safety context",
    passage: "Notice: Starting next Monday, all visitors must wear safety glasses inside the coating area. Visitors without proper protection should wait in the lobby until equipment is provided.",
    question: "What is required inside the coating area?",
    choices: ["Safety glasses", "A visitor badge only", "A production report", "A supplier invoice"],
    answer: 0,
    explanation: "The notice says all visitors must wear safety glasses inside the coating area.",
    detailedExplanation: "This is a workplace notice. The key phrase is 'must wear safety glasses', which shows a required action.",
    wrongChoiceExplanations: ["A badge may be useful, but it is not the requirement stated here.", "A production report is unrelated to visitor safety.", "An invoice is a business document, not safety equipment."],
    examples: ["Visitors must wear safety glasses in the coating area.", "Please wait in the lobby until equipment is provided."],
    relatedExpressions: ["safety glasses", "proper protection", "coating area"],
    youtube: "",
  },
];

function normalizeQuizQuestion(question = {}) {
  const choices = Array.isArray(question.choices) ? question.choices : [];
  const answer = Number(question.answer) || 0;
  const cleanList = value => Array.isArray(value)
    ? value.map(item => String(item).trim()).filter(Boolean)
    : String(value || "").split("|").map(item => item.trim()).filter(Boolean);
  return {
    id: question.id || `quiz-${String(question.question || "").slice(0, 24).replace(/\W+/g, "-").toLowerCase()}`,
    type: question.type || question.questionType || "Technical English",
    category: question.category || question.domain || "Battery",
    difficulty: question.difficulty || "Intermediate",
    estimatedTime: question.estimatedTime || question.time || "45 sec",
    learningPoint: question.learningPoint || question.point || "핵심 개념과 표현을 함께 확인하세요.",
    passage: question.passage || question.context || "",
    question: question.question || "",
    choices,
    answer,
    explanation: question.explanation || "",
    detailedExplanation: question.detailedExplanation || question.detail || question.explanation || "",
    wrongChoiceExplanations: cleanList(question.wrongChoiceExplanations || question.wrongExplanations),
    examples: cleanList(question.examples || question.example),
    relatedExpressions: cleanList(question.relatedExpressions || question.expressions || question.keywords),
    youtube: question.youtube || question.youtube_url || question.video || question.videoId || question.youtubeId || "",
  };
}

function mergeDefaultQuizQuestions(savedQuestions = []) {
  const saved = savedQuestions.map(normalizeQuizQuestion);
  const savedIds = new Set(saved.map(question => question.id));
  const missingDefaults = defaultQuizQuestions
    .map(normalizeQuizQuestion)
    .filter(question => !savedIds.has(question.id));
  return [...saved, ...missingDefaults];
}

function loadQuizState() {
  const initial = { questions: mergeDefaultQuizQuestions([]), current: 0, solvedMap: {}, wrongSet: [], bookmarkSet: [], solvedDates: [], dailyPlan: null, recentQuestionHistory: [], activeGroup: "", darkMode: false, examMode: false, search: "", filter: "all", answerVisible: false, selectedChoice: null };
  try {
    const saved = JSON.parse(profileStorage.getItem(QUIZ_APP_STORAGE_KEY) || "null");
    if (!saved) return initial;
    return {
      ...initial,
      ...saved,
      questions: Array.isArray(saved.questions) && saved.questions.length ? mergeDefaultQuizQuestions(saved.questions) : mergeDefaultQuizQuestions([]),
      bookmarkSet: Array.isArray(saved.bookmarkSet) ? saved.bookmarkSet : [],
      solvedDates: Array.isArray(saved.solvedDates) ? saved.solvedDates : Array.isArray(saved.todaySolvedDates) ? saved.todaySolvedDates : [],
      dailyPlan: saved.dailyPlan || null,
      recentQuestionHistory: Array.isArray(saved.recentQuestionHistory) ? saved.recentQuestionHistory : [],
      selectedChoice: null,
    };
  } catch { return initial; }
}

const quizState = loadQuizState();

function saveQuizState() {
  try {
    profileStorage.setItem(QUIZ_APP_STORAGE_KEY, JSON.stringify({ questions: quizState.questions, current: quizState.current, solvedMap: quizState.solvedMap, wrongSet: quizState.wrongSet, bookmarkSet: quizState.bookmarkSet, todaySolvedDates: quizState.solvedDates, dailyPlan: quizState.dailyPlan, recentQuestionHistory: quizState.recentQuestionHistory, activeGroup: quizState.activeGroup, darkMode: quizState.darkMode, examMode: quizState.examMode }));
  } catch {}
}

function quizTodayKey() {
  return localDateKey(new Date());
}

function quizQuestionSignature(question = {}) {
  return JSON.stringify({
    id: String(question.id || "").trim().toLowerCase(),
    question: String(question.question || "").trim().toLowerCase(),
    passage: String(question.passage || "").trim().toLowerCase(),
    choices: (question.choices || []).map(choice => String(choice).trim().toLowerCase()),
    answer: Number(question.answer),
  });
}

function quizDateAge(dateKey, todayKey = quizTodayKey()) {
  return Math.round((new Date(`${todayKey}T00:00:00`) - new Date(`${dateKey}T00:00:00`)) / 86400000);
}

function ensureQuizDailyPlan(dateKey = quizTodayKey()) {
  const validPlan = quizState.dailyPlan?.version === 2
    && quizState.dailyPlan?.date === dateKey
    && Array.isArray(quizState.dailyPlan.newIndexes)
    && quizState.dailyPlan.newIndexes.every(index => quizState.questions[index]);
  if (validPlan) return quizState.dailyPlan;

  const reviewPool = [...new Set([...quizState.wrongSet, ...quizState.bookmarkSet])].filter(index => quizState.questions[index]);
  const recentHistory = (quizState.recentQuestionHistory || []).filter(entry => {
    const age = quizDateAge(entry.date, dateKey);
    return age >= 1 && age <= 7;
  });
  const blockedSignatures = new Set(recentHistory.flatMap(entry => Array.isArray(entry.signatures) ? entry.signatures : []));
  const allIndexes = quizState.questions.map((_, index) => index);
  const nonReviewIndexes = allIndexes.filter(index => !reviewPool.includes(index));
  const freshIndexes = nonReviewIndexes.filter(index => !blockedSignatures.has(quizQuestionSignature(quizState.questions[index])));
  const newPool = freshIndexes.length >= 3 ? freshIndexes : nonReviewIndexes.length >= 3 ? nonReviewIndexes : allIndexes;
  const part56Pool = newPool.filter(index => !isQuizPart7Question(quizState.questions[index]));
  const part7Pool = newPool.filter(index => isQuizPart7Question(quizState.questions[index]));
  const selectedPart56 = seededShuffle(part56Pool, `${dateKey}-quiz-part56`).slice(0, 2);
  const selectedPart7 = seededShuffle(part7Pool, `${dateKey}-quiz-part7`).slice(0, 1);
  const selectedSet = new Set([...selectedPart56, ...selectedPart7]);
  const fillIndexes = seededShuffle(newPool.filter(index => !selectedSet.has(index)), `${dateKey}-quiz-fill`).slice(0, Math.max(0, 3 - selectedSet.size));
  const newIndexes = [...selectedPart56, ...selectedPart7, ...fillIndexes];
  const reviewIndexes = seededShuffle(reviewPool.filter(index => !newIndexes.includes(index)), `${dateKey}-quiz-review`).slice(0, 3);
  const signatures = newIndexes.map(index => quizQuestionSignature(quizState.questions[index]));

  quizState.dailyPlan = { version: 2, date: dateKey, newIndexes, reviewIndexes };
  quizState.recentQuestionHistory = [
    ...(quizState.recentQuestionHistory || []).filter(entry => entry.date !== dateKey && quizDateAge(entry.date, dateKey) <= 7),
    { date: dateKey, signatures, indexes: newIndexes },
  ].slice(-7);
  saveQuizState();
  return quizState.dailyPlan;
}

function getFilteredQuizIndexes() {
  const keyword = quizState.search.trim().toLowerCase();
  const plan = ensureQuizDailyPlan();
  const plannedOrder = [...plan.newIndexes, ...plan.reviewIndexes];
  const remaining = quizState.questions.map((_, index) => index).filter(index => !plannedOrder.includes(index));
  const orderedIndexes = quizState.filter === "all" ? [...plannedOrder, ...remaining] : quizState.questions.map((_, index) => index);
  return orderedIndexes.map(index => ({ question: quizState.questions[index], index })).filter(({ question, index }) => {
    const isPart7 = Boolean(String(question.passage || "").trim()) || /reading/i.test(String(question.type || ""));
    if (quizState.activeGroup === "part56" && isPart7) return false;
    if (quizState.activeGroup === "part7" && !isPart7) return false;
    if (quizState.activeGroup === "review" && !quizState.wrongSet.includes(index) && !quizState.bookmarkSet.includes(index)) return false;
    const solved = Boolean(quizState.solvedMap[index]);
    const wrong = quizState.wrongSet.includes(index);
    if (quizState.filter === "unsolved" && solved) return false;
    if (quizState.filter === "solved" && !solved) return false;
    if (quizState.filter === "wrong" && !wrong) return false;
    return !keyword || [question.question, question.passage, question.explanation, question.type, question.category, question.difficulty, question.learningPoint, ...question.choices, ...question.relatedExpressions].join(" ").toLowerCase().includes(keyword);
  }).map(item => item.index);
}

// 오늘의 표현은 이 배열만 수정하면 카드 UI에 자동 반영됩니다.
const dramaExpressions = [
  { expression: "That makes sense.", meaning: "그 말이 이해돼. / 일리가 있어.", example: "That makes sense. I hadn't thought of it that way." },
  { expression: "I'm working on it.", meaning: "지금 하고 있는 중이야.", example: "Don't worry, I'm working on it right now." },
  { expression: "It's not a big deal.", meaning: "별일 아니야. / 대수롭지 않아.", example: "It was a small mistake. It's not a big deal." },
];

// 체크리스트 역시 아래 배열의 내용만 수정하면 됩니다.
const dramaShadowingPoints = [
  { title: "자막 없이 먼저 듣기", description: "전체 흐름과 등장인물의 감정을 먼저 파악해 보세요." },
  { title: "짧은 구간 반복하기", description: "문장을 10~20초 단위로 나누어 세 번 이상 들어보세요." },
  { title: "강세와 리듬 따라 하기", description: "힘을 주는 단어와 문장 끝의 억양까지 그대로 흉내 내보세요." },
  { title: "연음과 약음 확인하기", description: "단어가 연결되거나 소리가 약해지는 지점을 표시해 보세요." },
  { title: "내 문장으로 활용하기", description: "오늘의 표현 하나를 골라 나만의 문장을 만들어 보세요." },
];

const DRAMA_MEMO_STORAGE_KEY = "daily-drama-study-memo";
const DRAMA_SHORT_STORAGE_KEY = "value_time_drama_short_cards_v1";
const NEWS_ARTICLE_LEARNING_STORAGE_KEY = "value_time_news_article_learning_v1";
const dramaShortCards = [
  { id: "deadline", series: "Office Days", episode: "EP. 04 · The Deadline", situation: "회의 자료 제출 시간이 다가와 동료를 재촉하는 상황", mood: "긴장 · 재촉", dialogue: [{ role: "A", en: "Is the presentation ready?", ko: "발표 자료 준비됐어?" }, { role: "B", en: "Not yet. We're running out of time.", ko: "아직. 시간이 얼마 남지 않았어." }], line: "We're running out of time.", ko: "시간이 얼마 남지 않았어.", expression: "run out of", meaning: "시간이나 필요한 것이 거의 남지 않다", nuance: "마감이 가까워져 지금 서둘러야 한다는 느낌", questions: [{ type: "단어형", text: "이 장면에서 running out of time이 나타내는 상황은?", choices: ["시간이 충분한 상황", "시간이 거의 남지 않은 상황", "회의가 연기된 상황", "시간을 다시 확인한 상황"], answer: 1, explanation: "run out of는 필요한 것이 거의 남지 않은 상황을 나타냅니다." }, { type: "문장형", text: "화자가 이 말을 한 의도로 가장 자연스러운 것은?", choices: ["일을 천천히 하자고 제안한다", "지금 서둘러야 한다고 알린다", "회의를 취소하려고 한다", "시간이 정확한지 질문한다"], answer: 1, explanation: "시간이 부족하므로 상대방에게 서두를 필요가 있음을 알리는 말입니다." }] },
  { id: "surprise", series: "City Friends", episode: "EP. 07 · The Surprise", situation: "친구가 갑작스러운 퇴사 소식을 전한 상황", mood: "놀람 · 불신", dialogue: [{ role: "A", en: "I quit my job this morning.", ko: "나 오늘 아침에 회사를 그만뒀어." }, { role: "B", en: "You've got to be kidding me.", ko: "설마, 농담하는 거지?" }], line: "You've got to be kidding me.", ko: "설마, 농담하는 거지?", expression: "You've got to be kidding me", meaning: "믿기 어려운 말을 들었을 때 놀라움을 나타내는 반응", nuance: "상대의 말이 사실이라고 믿기 어려울 정도로 놀란 어조", questions: [{ type: "단어형", text: "이 표현이 전달하는 어조로 가장 적절한 것은?", choices: ["차분한 동의", "놀람과 불신", "정중한 사과", "확실한 명령"], answer: 1, explanation: "이 표현은 예상하지 못한 말을 듣고 놀라거나 믿기 어렵다는 반응입니다." }, { type: "문장형", text: "화자의 반응을 가장 자연스럽게 설명한 것은?", choices: ["상대방의 말을 믿기 어렵다고 느낀다", "이미 알고 있던 사실을 확인한다", "상대방에게 농담을 부탁한다", "대화를 바로 끝내려고 한다"], answer: 0, explanation: "문자 그대로 농담을 요구하는 것이 아니라 소식에 대한 놀람과 불신을 표현합니다." }] },
  { id: "favor", series: "The New Team", episode: "EP. 02 · First Project", situation: "동료가 급한 업무를 도와달라고 부탁한 상황", mood: "부탁 · 신중함", dialogue: [{ role: "A", en: "Could you help me with this report?", ko: "이 보고서 좀 도와줄 수 있어?" }, { role: "B", en: "I'll see what I can do.", ko: "내가 할 수 있는지 알아볼게." }], line: "I'll see what I can do.", ko: "내가 할 수 있는지 알아볼게.", expression: "see what I can do", meaning: "가능한 범위에서 도울 방법을 알아보다", nuance: "확답하지 않으면서 도와보겠다는 신중한 태도", questions: [{ type: "단어형", text: "이 표현이 주는 뉘앙스로 가장 적절한 것은?", choices: ["반드시 해결하겠다는 확약", "가능한지 확인해보겠다는 태도", "부탁을 즉시 거절하는 태도", "다른 사람에게 책임을 넘기는 태도"], answer: 1, explanation: "확실히 해내겠다는 약속보다 가능한 방법을 찾아보겠다는 신중한 표현입니다." }, { type: "문장형", text: "이 말에서 자연스럽게 추론할 수 있는 것은?", choices: ["화자는 아직 도움을 확정하지 않았다", "화자는 이미 모든 일을 끝냈다", "화자는 부탁 내용을 듣지 못했다", "화자는 상대방에게 도움을 요청했다"], answer: 0, explanation: "화자는 도울 가능성을 열어두었지만 결과까지 확정하지는 않았습니다." }] },
];

// 매일 1문장과 빠른 점검이 함께 사용하는 문장 학습 데이터입니다.
const dailySentenceLessons = [
  { en: "I'm getting used to studying English every day.", ko: "나는 매일 영어를 공부하는 것에 점점 익숙해지고 있어.", pattern: "get used to + 명사 / 동명사", meaning: "~에 익숙해지다", applications: [["She is getting used to her new job.", "그녀는 새 직장에 적응하고 있어."], ["We are getting used to speaking in English.", "우리는 영어로 말하는 것에 익숙해지고 있어."]] },
  { en: "You're supposed to submit the form by Friday.", ko: "너는 금요일까지 그 양식을 제출해야 해.", pattern: "be supposed to + 동사", meaning: "~하기로 되어 있다, ~해야 한다", applications: [["The train is supposed to arrive at nine.", "그 기차는 9시에 도착할 예정이다."], ["We're supposed to meet in the lobby.", "우리는 로비에서 만나기로 되어 있다."]] },
  { en: "I'm looking forward to hearing from you soon.", ko: "곧 당신에게서 소식을 듣기를 기대하고 있습니다.", pattern: "look forward to + 명사 / 동명사", meaning: "~을 기대하다", applications: [["She looks forward to meeting the team.", "그녀는 팀을 만나기를 기대한다."], ["I look forward to your reply.", "답장을 기다리겠습니다."]] },
  { en: "It takes time to build a strong vocabulary.", ko: "탄탄한 어휘력을 쌓는 데에는 시간이 걸린다.", pattern: "It takes + 시간 + to부정사", meaning: "~하는 데 시간이 걸리다", applications: [["It takes an hour to get there.", "그곳에 가는 데 한 시간이 걸린다."], ["It took years to complete the project.", "그 프로젝트를 완성하는 데 수년이 걸렸다."]] },
  { en: "I have trouble remembering new expressions.", ko: "나는 새로운 표현을 기억하는 데 어려움이 있다.", pattern: "have trouble + 동명사", meaning: "~하는 데 어려움을 겪다", applications: [["He has trouble falling asleep.", "그는 잠드는 데 어려움을 겪는다."], ["We had trouble finding the address.", "우리는 주소를 찾는 데 애를 먹었다."]] },
  { en: "I used to avoid speaking English in public.", ko: "나는 예전에 사람들 앞에서 영어로 말하는 것을 피하곤 했다.", pattern: "used to + 동사", meaning: "예전에 ~하곤 했다", applications: [["She used to live in Busan.", "그녀는 예전에 부산에 살았다."], ["We used to study together.", "우리는 예전에 함께 공부하곤 했다."]] },
  { en: "Make sure to review what you learned today.", ko: "오늘 배운 내용을 반드시 복습하세요.", pattern: "make sure to + 동사", meaning: "반드시 ~하다", applications: [["Make sure to lock the door.", "반드시 문을 잠그세요."], ["Please make sure to save the file.", "파일을 반드시 저장해 주세요."]] },
  { en: "The more you practice, the more confident you become.", ko: "연습을 많이 할수록 더 자신감이 생긴다.", pattern: "The 비교급, the 비교급", meaning: "~할수록 더 …하다", applications: [["The sooner we start, the better.", "빨리 시작할수록 더 좋다."], ["The more I read, the more I learn.", "많이 읽을수록 더 많이 배운다."]] },
  { en: "I can't help checking unfamiliar words.", ko: "나는 모르는 단어를 확인하지 않을 수 없다.", pattern: "can't help + 동명사", meaning: "~하지 않을 수 없다", applications: [["I couldn't help laughing.", "나는 웃지 않을 수 없었다."], ["She can't help worrying about it.", "그녀는 그것을 걱정하지 않을 수 없다."]] },
  { en: "I'd rather study steadily than rush at the end.", ko: "나는 마지막에 서두르기보다 꾸준히 공부하고 싶다.", pattern: "would rather A than B", meaning: "B하느니 차라리 A하겠다", applications: [["I'd rather walk than wait.", "기다리느니 차라리 걷겠다."], ["He'd rather stay home than go out.", "그는 외출하느니 집에 있고 싶어 한다."]] },
  { en: "This article is worth reading more than once.", ko: "이 기사는 한 번 이상 읽을 가치가 있다.", pattern: "be worth + 동명사", meaning: "~할 가치가 있다", applications: [["The book is worth buying.", "그 책은 살 가치가 있다."], ["The idea is worth considering.", "그 생각은 고려할 가치가 있다."]] },
  { en: "You're likely to remember words used in context.", ko: "문맥 속에서 사용된 단어를 기억할 가능성이 높다.", pattern: "be likely to + 동사", meaning: "~할 가능성이 높다", applications: [["Prices are likely to rise.", "가격이 오를 가능성이 높다."], ["She is likely to join us.", "그녀가 우리와 함께할 가능성이 높다."]] },
  { en: "Write the expression down in case you forget it.", ko: "잊어버릴 경우에 대비해 그 표현을 적어 두세요.", pattern: "in case + 주어 + 동사", meaning: "~할 경우에 대비하여", applications: [["Take an umbrella in case it rains.", "비가 올 경우에 대비해 우산을 가져가세요."], ["Keep a copy in case you need it.", "필요할 경우에 대비해 사본을 보관하세요."]] },
  { en: "It wasn't until today that I understood the difference.", ko: "나는 오늘이 되어서야 그 차이를 이해했다.", pattern: "It is not until A that B", meaning: "A가 되어서야 비로소 B하다", applications: [["It wasn't until noon that he arrived.", "정오가 되어서야 그가 도착했다."], ["It was not until then that I noticed it.", "그때가 되어서야 나는 그것을 알아차렸다."]] },
];

// 별도 데이터 모듈의 1,000문장을 우선 사용하고, 로드 데이터가 부족할 때만 기본 문장을 사용합니다.
const sentenceLessons = toeicSentences.length >= 1000 ? toeicSentences : dailySentenceLessons;

function dateSeed(dateKey = localDateKey()) {
  return Math.floor(new Date(`${dateKey}T00:00:00`).getTime() / 86400000);
}

function seededShuffle(items, seedText) {
  const copy = [...items];
  let seed = [...String(seedText)].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const randomIndex = seed % (index + 1);
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function getDailySentenceLesson(dateKey = localDateKey()) {
  return sentenceLessons[Math.abs(dateSeed(dateKey)) % sentenceLessons.length];
}

function getDailyVocabPageIndex(pageCount, dateKey = localDateKey()) {
  return Math.abs(dateSeed(dateKey)) % Math.max(1, pageCount);
}

// Daily Test Pro: 배열을 복사해 무작위 순서로 출제합니다.
function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

const rcQuestionsBase = [
      { id: "rc1", type: "RC", question: "빈칸에 들어갈 가장 적절한 것은?", passage: "All visitors must sign in at the front desk before entering the building. Anyone who fails to do so may be ______ entry.", choices: ["denied", "deny", "denies", "denial"], answer: 0, explanation: "be 동사 뒤 수동 의미로 과거분사 denied가 적절합니다." },
      { id: "rc2", type: "RC", question: "공지문을 읽고 답하세요.", passage: "The office printer on the third floor is temporarily unavailable due to maintenance. Employees are advised to use the printer in Room 204.\n\nQ. What should employees do?", choices: ["Buy a new printer", "Use the printer in Room 204", "Wait until next month", "Call the manager"], answer: 1, explanation: "공지문에서 Room 204의 프린터를 사용하라고 안내합니다." },
      { id: "rc3", type: "RC", question: "문법적으로 가장 적절한 문장은?", passage: "", choices: ["She recommended to take the train.", "She recommended taking the train.", "She recommended take the train.", "She recommended took the train."], answer: 1, explanation: "recommend 뒤에는 동명사 taking이 자연스럽습니다." },
      { id: "rc4", type: "RC", question: "빈칸에 들어갈 가장 적절한 것은?", passage: "The marketing team worked ______ to finish the presentation before the client meeting.", choices: ["quick", "quickly", "quicker", "quickness"], answer: 1, explanation: "worked를 수식하는 부사가 필요하므로 quickly가 정답입니다." },
      { id: "rc5", type: "RC", question: "글의 내용과 일치하는 것은?", passage: "The workshop begins at 9 a.m. and will cover time management strategies for office professionals. Participants should bring a notebook and arrive 10 minutes early.", choices: ["The workshop is about office software.", "Participants can arrive after 9 a.m.", "A notebook is recommended.", "The event starts in the afternoon."], answer: 2, explanation: "참가자는 노트북이 아니라 notebook(공책)을 가져오라고 안내되어 있습니다." },
      { id: "rc6", type: "RC", question: "빈칸에 들어갈 가장 적절한 것은?", passage: "If you have any questions regarding your order, please contact customer service ______ email.", choices: ["at", "on", "by", "with"], answer: 2, explanation: "by email이 자연스러운 표현입니다." },
      { id: "rc7", type: "RC", question: "다음 중 어색하지 않은 문장은?", passage: "", choices: ["The report needs to revise.", "The report needs revised.", "The report needs to be revised.", "The report needs revising it."], answer: 2, explanation: "수동 의미이므로 to be revised가 적절합니다." },
      { id: "rc8", type: "RC", question: "문장 완성에 가장 적절한 것은?", passage: "The manager asked the staff to submit the forms ______ the end of the day.", choices: ["in", "by", "for", "until"], answer: 1, explanation: "마감 시한 표현은 by the end of the day가 적절합니다." },
      { id: "rc9", type: "RC", question: "글의 목적은?", passage: "Dear residents,\nThe water supply will be turned off from 1 p.m. to 4 p.m. on Wednesday for emergency repairs. Please store enough water in advance. We apologize for the inconvenience.", choices: ["To advertise a service", "To report a sales increase", "To announce a temporary interruption", "To invite residents to a meeting"], answer: 2, explanation: "단수 예정 안내문이므로 temporary interruption 안내가 목적입니다." },
      { id: "rc10", type: "RC", question: "빈칸에 들어갈 가장 적절한 것은?", passage: "Ms. Lee is one of the most ______ engineers in the department.", choices: ["talent", "talented", "talents", "talenting"], answer: 1, explanation: "engineers를 수식하는 형용사 talented가 적절합니다." },
      { id: "rc11", type: "RC", question: "문법적으로 맞는 문장을 고르세요.", passage: "", choices: ["Neither of the answers are correct.", "Neither of the answers is correct.", "Neither of the answer are correct.", "Neither answers is correct."], answer: 1, explanation: "Neither는 단수 취급하므로 is가 맞습니다." },
      { id: "rc12", type: "RC", question: "다음 문장에 가장 적절한 접속사는?", passage: "The weather was terrible, ______ the event continued as planned.", choices: ["because", "but", "unless", "so"], answer: 1, explanation: "역접 관계이므로 but이 정답입니다." },
      { id: "rc13", type: "RC", question: "글의 세부 내용으로 맞는 것은?", passage: "Starting next month, the gym will open at 6 a.m. on weekdays instead of 7 a.m. Weekend hours will remain unchanged.", choices: ["Weekend hours will start earlier.", "Weekday opening time will be one hour earlier.", "The gym will close on weekends.", "The new schedule starts tomorrow."], answer: 1, explanation: "평일 오픈 시간이 7시에서 6시로 한 시간 빨라집니다." },
      { id: "rc14", type: "RC", question: "빈칸에 들어갈 가장 적절한 것은?", passage: "The proposal was reviewed carefully and found to be highly ______.", choices: ["effect", "effective", "effectively", "effects"], answer: 1, explanation: "be동사 뒤 보어 자리이므로 형용사 effective가 적절합니다." },
      { id: "rc15", type: "RC", question: "문맥상 가장 알맞은 것은?", passage: "Our records show that your payment has not yet been received. If you have already sent it, please disregard this notice.\n\nQ. Why was this message sent?", choices: ["To confirm a refund", "To ask for updated contact information", "To remind the customer about payment", "To announce a discount"], answer: 2, explanation: "지불이 아직 확인되지 않았다는 결제 안내 메시지입니다." },
      { id: "rc16", type: "RC", question: "빈칸에 들어갈 가장 적절한 것은?", passage: "This software is easy to install and can be used ______ any special training.", choices: ["without", "despite", "during", "across"], answer: 0, explanation: "without any special training이 자연스럽습니다." },
      { id: "rc17", type: "RC", question: "문법적으로 가장 적절한 문장을 고르세요.", passage: "", choices: ["He is interested on learning Spanish.", "He is interested in learning Spanish.", "He is interested to learn Spanish.", "He is interested for learning Spanish."], answer: 1, explanation: "interested in ~ing 구조가 맞습니다." },
      { id: "rc18", type: "RC", question: "빈칸에 들어갈 가장 적절한 것은?", passage: "Please review the attached file and let me know ______ you have any concerns.", choices: ["unless", "if", "although", "while"], answer: 1, explanation: "조건 의미로 if가 적절합니다." },
      { id: "rc19", type: "RC", question: "글의 내용과 일치하지 않는 것은?", passage: "The museum will be closed on Monday for a private event. Regular hours will resume on Tuesday. Tickets purchased for Monday may be used on any day this week.", choices: ["The museum is closed on Monday.", "Tuesday is a regular opening day.", "Monday tickets can be used later in the week.", "The museum will be permanently closed after Monday."], answer: 3, explanation: "영구 폐관 내용은 전혀 없습니다." },
      { id: "rc20", type: "RC", question: "빈칸에 들어갈 가장 적절한 것은?", passage: "Applicants are encouraged to apply early, as positions may be filled ______ the deadline.", choices: ["before", "among", "through", "beside"], answer: 0, explanation: "마감 전에 채용이 완료될 수 있으므로 before가 정답입니다." }
    ];

    const vocabWordBank = [
      { word: "allocate", meaning: "할당하다" },
      { word: "improve", meaning: "개선하다" },
      { word: "efficient", meaning: "효율적인" },
      { word: "request", meaning: "요청하다" },
      { word: "purchase", meaning: "구매하다" },
      { word: "supply", meaning: "공급하다" },
      { word: "available", meaning: "이용 가능한" },
      { word: "confirm", meaning: "확인하다" },
      { word: "delay", meaning: "지연시키다" },
      { word: "temporary", meaning: "일시적인" },
      { word: "schedule", meaning: "일정" },
      { word: "submit", meaning: "제출하다" },
      { word: "approve", meaning: "승인하다" },
      { word: "maintain", meaning: "유지하다" },
      { word: "repair", meaning: "수리하다" },
      { word: "reduce", meaning: "줄이다" },
      { word: "increase", meaning: "증가시키다" },
      { word: "replace", meaning: "대체하다" },
      { word: "announce", meaning: "발표하다" },
      { word: "provide", meaning: "제공하다" },
      { word: "customer", meaning: "고객" },
      { word: "employee", meaning: "직원" },
      { word: "department", meaning: "부서" },
      { word: "strategy", meaning: "전략" },
      { word: "policy", meaning: "정책" },
      { word: "deadline", meaning: "마감일" },
      { word: "document", meaning: "문서" },
      { word: "presentation", meaning: "발표" },
      { word: "conference", meaning: "회의" },
      { word: "manager", meaning: "관리자" },
      { word: "budget", meaning: "예산" },
      { word: "expense", meaning: "비용" },
      { word: "receipt", meaning: "영수증" },
      { word: "training", meaning: "교육" },
      { word: "participate", meaning: "참여하다" },
      { word: "recommend", meaning: "추천하다" },
      { word: "solution", meaning: "해결책" },
      { word: "quality", meaning: "품질" },
      { word: "performance", meaning: "성과" },
      { word: "deadline-driven", meaning: "마감 중심의" },
      { word: "organize", meaning: "정리하다" },
      { word: "urgent", meaning: "긴급한" },
      { word: "deliver", meaning: "전달하다" },
      { word: "notify", meaning: "알리다" },
      { word: "review", meaning: "검토하다" },
      { word: "update", meaning: "업데이트하다" },
      { word: "cancel", meaning: "취소하다" },
      { word: "reserve", meaning: "예약하다" },
      { word: "contact", meaning: "연락하다" },
      { word: "issue", meaning: "문제" }
    ];

    const sentenceQuestionsBase = [
      { id: "st1", type: "Sentence", sentence: "I need to ______ the report before noon.", choices: ["submit", "submits", "submitted", "submitting"], answer: 0, explanation: "need to 뒤에는 동사원형 submit이 옵니다." },
      { id: "st2", type: "Sentence", sentence: "We were tired, ______ we finished the project on time.", choices: ["but", "so", "because", "unless"], answer: 0, explanation: "앞뒤가 대비되므로 but이 적절합니다." },
      { id: "st3", type: "Sentence", sentence: "This software is very easy to use and quite ______.", choices: ["convenient", "convenience", "conveniently", "convened"], answer: 0, explanation: "be동사 뒤 보어 자리이므로 형용사 convenient가 맞습니다." },
      { id: "st4", type: "Sentence", sentence: "Please let me know ______ you need further assistance.", choices: ["if", "unless", "during", "while"], answer: 0, explanation: "조건 의미로 if가 자연스럽습니다." },
      { id: "st5", type: "Sentence", sentence: "The meeting was canceled ______ the manager was sick.", choices: ["because", "but", "although", "so"], answer: 0, explanation: "이유를 설명하므로 because가 맞습니다." },
      { id: "st6", type: "Sentence", sentence: "Our team is responsible ______ preparing the final presentation.", choices: ["for", "to", "with", "at"], answer: 0, explanation: "responsible for가 고정 표현입니다." },
      { id: "st7", type: "Sentence", sentence: "She is one of the most ______ employees in the office.", choices: ["rely", "reliable", "reliably", "reliability"], answer: 1, explanation: "employees를 수식하는 형용사 reliable이 적절합니다." },
      { id: "st8", type: "Sentence", sentence: "I couldn’t attend the seminar, ______ I asked for the materials by email.", choices: ["so", "but", "unless", "until"], answer: 0, explanation: "원인-결과 관계이므로 so가 자연스럽습니다." },
      { id: "st9", type: "Sentence", sentence: "The office will remain closed ______ Monday morning.", choices: ["until", "by", "for", "among"], answer: 0, explanation: "시점까지는 until이 적절합니다." },
      { id: "st10", type: "Sentence", sentence: "Please be sure to attach your resume ______ the application form.", choices: ["to", "for", "of", "across"], answer: 0, explanation: "attach A to B 구조입니다." },
      { id: "st11", type: "Sentence", sentence: "The new policy will ______ next month.", choices: ["take effect", "take effects", "takes effect", "taking effect"], answer: 0, explanation: "조동사 will 뒤에는 동사원형 표현 take effect가 옵니다." },
      { id: "st12", type: "Sentence", sentence: "He apologized ______ being late to the meeting.", choices: ["for", "about", "from", "with"], answer: 0, explanation: "apologize for ~ing 구조입니다." },
      { id: "st13", type: "Sentence", sentence: "The package should arrive ______ Friday afternoon.", choices: ["by", "during", "unless", "across"], answer: 0, explanation: "마감 시점은 by Friday afternoon이 적절합니다." },
      { id: "st14", type: "Sentence", sentence: "This problem is more complicated ______ I expected.", choices: ["than", "then", "that", "as"], answer: 0, explanation: "비교급 뒤에는 than이 맞습니다." },
      { id: "st15", type: "Sentence", sentence: "Please keep the door closed ______ the air conditioner is running.", choices: ["while", "unless", "because of", "despite"], answer: 0, explanation: "동시 상황 표현으로 while이 적절합니다." },
      { id: "st16", type: "Sentence", sentence: "She has worked here ______ 2019.", choices: ["since", "for", "during", "until"], answer: 0, explanation: "특정 시점 시작은 since입니다." },
      { id: "st17", type: "Sentence", sentence: "We need a more ______ plan before presenting it to the client.", choices: ["detail", "detailed", "detailing", "details"], answer: 1, explanation: "plan을 수식하는 형용사 detailed가 맞습니다." },
      { id: "st18", type: "Sentence", sentence: "The instructions were clear, so everyone completed the task ______.", choices: ["successful", "success", "successfully", "succeed"], answer: 2, explanation: "completed를 수식하는 부사 successfully가 적절합니다." },
      { id: "st19", type: "Sentence", sentence: "I’m looking forward to ______ from you soon.", choices: ["hear", "hears", "hearing", "heard"], answer: 2, explanation: "look forward to 뒤에는 동명사 hearing이 옵니다." },
      { id: "st20", type: "Sentence", sentence: "The staff meeting has been moved ______ 3 p.m.", choices: ["to", "for", "with", "from"], answer: 0, explanation: "시간 변경은 moved to 3 p.m.가 자연스럽습니다." },
      { id: "st21", type: "Sentence", sentence: "Please review the file carefully ______ sending it.", choices: ["before", "after", "since", "through"], answer: 0, explanation: "보내기 전에 검토하라는 의미이므로 before가 정답입니다." },
      { id: "st22", type: "Sentence", sentence: "The conference room is ______ on the second floor.", choices: ["locate", "located", "locating", "location"], answer: 1, explanation: "be located on은 위치 표현입니다." },
      { id: "st23", type: "Sentence", sentence: "We had to leave early ______ the heavy rain.", choices: ["because of", "because", "although", "unless"], answer: 0, explanation: "명사구 heavy rain 앞에는 because of가 맞습니다." },
      { id: "st24", type: "Sentence", sentence: "Her explanation was simple and easy to ______.", choices: ["understand", "understood", "understanding", "understands"], answer: 0, explanation: "easy to 뒤에는 동사원형 understand가 옵니다." },
      { id: "st25", type: "Sentence", sentence: "The report must be completed ______ the deadline.", choices: ["before", "under", "inside", "between"], answer: 0, explanation: "마감 전은 before the deadline입니다." },
      { id: "st26", type: "Sentence", sentence: "He was absent yesterday, ______ no one could contact him.", choices: ["and", "but", "or", "because"], answer: 0, explanation: "두 사실의 연결이므로 and가 가장 자연스럽습니다." },
      { id: "st27", type: "Sentence", sentence: "This product is much more ______ than the previous version.", choices: ["reliability", "reliable", "rely", "reliably"], answer: 1, explanation: "비교급 보어 자리이므로 형용사 reliable이 필요합니다." },
      { id: "st28", type: "Sentence", sentence: "Please send me the revised draft as soon as it is ______.", choices: ["ready", "readily", "readiness", "read"], answer: 0, explanation: "상태 보어는 형용사 ready가 자연스럽습니다." },
      { id: "st29", type: "Sentence", sentence: "The company plans to ______ its customer service this year.", choices: ["improvement", "improve", "improved", "improving"], answer: 1, explanation: "plans to 뒤에는 동사원형 improve가 옵니다." },
      { id: "st30", type: "Sentence", sentence: "Could you tell me where the nearest bank ______?", choices: ["is", "are", "be", "being"], answer: 0, explanation: "간접의문문에서 어순은 where + 주어 + 동사, 은행이 단수이므로 is입니다." }
    ];

    /* =========================
       단어 문제 자동 생성 구조
       - word bank만 수정하면 확장 가능
       - 향후 CSV 변환 쉬움
    ========================= */
    function pickDistractors(wordBank, currentIndex, useMeaning, count = 3) {
      const pool = wordBank.filter((_, i) => i !== currentIndex);
      const shuffled = shuffleArray(pool);
      return shuffled.slice(0, count).map(item => useMeaning ? item.meaning : item.word);
    }

    function buildVocabQuestions(wordBank) {
      return wordBank.map((item, index) => {
        const mode = index % 2 === 0 ? "ENG-KOR" : "KOR-ENG";
        let prompt, question, answerText, distractors, choices;

        if (mode === "ENG-KOR") {
          prompt = item.word;
          question = "다음 영어 단어의 뜻으로 가장 적절한 것은?";
          answerText = item.meaning;
          distractors = pickDistractors(wordBank, index, true, 3);
        } else {
          prompt = item.meaning;
          question = "다음 한국어 뜻에 해당하는 영어 단어는?";
          answerText = item.word;
          distractors = pickDistractors(wordBank, index, false, 3);
        }

        choices = shuffleArray([answerText, ...distractors]);
        const answer = choices.indexOf(answerText);

        return {
          id: `vb${index + 1}`,
          type: "Vocab",
          mode,
          prompt,
          question,
          choices,
          answer,
          explanation: mode === "ENG-KOR"
            ? `${item.word}는 '${item.meaning}'라는 뜻입니다.`
            : `'${item.meaning}'에 해당하는 영어 단어는 ${item.word}입니다.`
        };
      });
    }

    function buildDailySentenceQuestions(dateKey = localDateKey()) {
      const lesson = getDailySentenceLesson(dateKey);
      const otherLessons = sentenceLessons.filter(item => item.en !== lesson.en);
      const otherMeanings = [...new Set(otherLessons.map(item => item.meaning).filter(meaning => meaning !== lesson.meaning))];
      const otherPatterns = [...new Set(otherLessons.map(item => item.pattern).filter(pattern => pattern !== lesson.pattern))];
      const meaningChoices = seededShuffle([lesson.meaning, ...seededShuffle(otherMeanings, `${dateKey}-meaning-pool`).slice(0, 3)], `${dateKey}-meaning-choices`);
      const sentenceChoices = seededShuffle([lesson.en, ...seededShuffle(otherLessons.map(item => item.en), `${dateKey}-sentence-text-pool`).slice(0, 3)], `${dateKey}-sentence-text-choices`);
      const patternChoices = seededShuffle([lesson.pattern, ...seededShuffle(otherPatterns, `${dateKey}-pattern-pool`).slice(0, 3)], `${dateKey}-pattern-choices`);
      return [
        { id: `daily-sentence-meaning-${dateKey}`, type: "Sentence", question: "오늘의 핵심 표현과 의미가 올바르게 연결된 것은?", passage: lesson.pattern, choices: meaningChoices, answer: meaningChoices.indexOf(lesson.meaning), explanation: `${lesson.pattern}은 '${lesson.meaning}'라는 의미입니다.` },
        { id: `daily-sentence-text-${dateKey}`, type: "Sentence", question: "다음 해석에 해당하는 오늘의 문장을 고르세요.", passage: lesson.ko, choices: sentenceChoices, answer: sentenceChoices.indexOf(lesson.en), explanation: `오늘의 문장은 '${lesson.en}'입니다.` },
        { id: `daily-sentence-pattern-${dateKey}`, type: "Sentence", question: "오늘의 문장에서 학습한 핵심 패턴은 무엇인가요?", passage: lesson.en, choices: patternChoices, answer: patternChoices.indexOf(lesson.pattern), explanation: `핵심 패턴은 ${lesson.pattern}입니다.` },
      ];
    }

function buildDailyTestQuestionOrder(dateKey = localDateKey()) {
  return {
    // 같은 날짜에는 순서가 유지되고, 날짜가 바뀌면 새로운 순서로 출제됩니다.
    rc: seededShuffle(rcQuestionsBase, `${dateKey}-rc`),
    vocab: seededShuffle(buildVocabQuestions(getTodayVocabWords(dateKey)), `${dateKey}-vocab`),
    sentence: seededShuffle(buildDailySentenceQuestions(dateKey), `${dateKey}-sentence`),
  };
}

let dailyTestQuestions = buildDailyTestQuestionOrder();

const DAILY_TEST_HISTORY_KEY = "daily-english-lab-pro-history";
const LEGACY_DAILY_TEST_HISTORY_KEY = "worthy-life-daily-test-history";
const DAILY_TEST_WRONG_KEY = "daily-english-lab-pro-wrong-notes";
const LEGACY_DAILY_TEST_WRONG_KEY = "worthy-life-daily-test-wrong-notes";

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readStoredJSON(key, fallback) {
  try { return JSON.parse(profileStorage.getItem(key) || "null") || fallback; }
  catch { return fallback; }
}

function emptyTestScores() {
  return { rcCorrect: 0, rcTotal: 0, vocabCorrect: 0, vocabTotal: 0, sentenceCorrect: 0, sentenceTotal: 0 };
}

function emptyHistoryEntry() {
  return {
    rc: { correct: 0, total: 0 },
    vocab: { correct: 0, total: 0 },
    sentence: { correct: 0, total: 0 },
    logs: [],
  };
}

function normalizeHistoryEntry(entry = {}) {
  // 이전 버전의 평면 scores 형식도 새 카테고리별 형식으로 변환합니다.
  if (entry.scores) {
    return {
      rc: { correct: entry.scores.rcCorrect || 0, total: entry.scores.rcTotal || 0 },
      vocab: { correct: entry.scores.vocabCorrect || 0, total: entry.scores.vocabTotal || 0 },
      sentence: { correct: entry.scores.sentenceCorrect || 0, total: entry.scores.sentenceTotal || 0 },
      logs: Array.isArray(entry.logs) ? entry.logs : [],
    };
  }

  const empty = emptyHistoryEntry();
  return {
    rc: { ...empty.rc, ...(entry.rc || {}) },
    vocab: { ...empty.vocab, ...(entry.vocab || {}) },
    sentence: { ...empty.sentence, ...(entry.sentence || {}) },
    logs: Array.isArray(entry.logs) ? entry.logs : [],
  };
}

function getTestHistory() {
  let storedHistory = readStoredJSON(DAILY_TEST_HISTORY_KEY, null);

  if (!storedHistory) {
    storedHistory = readStoredJSON(LEGACY_DAILY_TEST_HISTORY_KEY, {});
  }

  const normalizedHistory = Object.fromEntries(
    Object.entries(storedHistory).map(([date, entry]) => [date, normalizeHistoryEntry(entry)])
  );

  // 새 키와 형식으로 저장하고 이전 키는 정리합니다.
  try {
    profileStorage.setItem(DAILY_TEST_HISTORY_KEY, JSON.stringify(normalizedHistory));
    profileStorage.removeItem(LEGACY_DAILY_TEST_HISTORY_KEY);
  } catch {}

  return normalizedHistory;
}

function getTodayTestScores() {
  const history = getTestHistory();
  const today = normalizeHistoryEntry(history[localDateKey()]);
  return {
    rcCorrect: today.rc.correct,
    rcTotal: today.rc.total,
    vocabCorrect: today.vocab.correct,
    vocabTotal: today.vocab.total,
    sentenceCorrect: today.sentence.correct,
    sentenceTotal: today.sentence.total,
  };
}

function getWrongNotes() {
  const emptyNotes = { rc: [], vocab: [], sentence: [] };
  const currentNotes = readStoredJSON(DAILY_TEST_WRONG_KEY, null);
  if (currentNotes) return { ...emptyNotes, ...currentNotes };

  // 이전 버전의 저장 키에 데이터가 있다면 새 키로 한 번만 이전합니다.
  const legacyNotes = readStoredJSON(LEGACY_DAILY_TEST_WRONG_KEY, null);
  if (legacyNotes) {
    try {
      profileStorage.setItem(DAILY_TEST_WRONG_KEY, JSON.stringify(legacyNotes));
      profileStorage.removeItem(LEGACY_DAILY_TEST_WRONG_KEY);
    } catch {}
    return { ...emptyNotes, ...legacyNotes };
  }

  return emptyNotes;
}

const dailyTestState = {
  date: localDateKey(),
  active: "rc",
  indices: { rc: 0, vocab: 0, sentence: 0 },
  scores: getTodayTestScores(),
  wrongFilter: "rc",
  historyFilter: "today",
};
const dailyQuickTestState = { date: localDateKey(), graded: false, score: null };

function getDailyQuickTestQuestions(dateKey = localDateKey()) {
  const todayWords = getTodayVocabWords(dateKey);
  const word = todayWords[Math.abs(dateSeed(dateKey)) % todayWords.length];
  const meaningPool = [...new Set(words.filter(item => item.word !== word.word && item.meaning !== word.meaning).map(item => item.meaning))];
  const wordChoices = seededShuffle([word.meaning, ...seededShuffle(meaningPool, `${dateKey}-word-pool`).slice(0, 2)], `${dateKey}-word-choices`);

  const sentence = getDailySentenceLesson(dateKey);
  const patternMeaningPool = [...new Set(sentenceLessons.filter(item => item.pattern !== sentence.pattern).map(item => item.meaning))];
  const sentenceChoices = seededShuffle([sentence.meaning, ...seededShuffle(patternMeaningPool, `${dateKey}-sentence-pool`).slice(0, 2)], `${dateKey}-sentence-choices`);
  const grammarAnswer = "동명사 또는 명사";
  const grammarChoices = seededShuffle([grammarAnswer, "동사원형만", "과거분사만"], `${dateKey}-grammar-choices`);

  return [
    { category: "오늘의 단어", prompt: word.word, question: "뜻으로 가장 알맞은 것은?", choices: wordChoices, answer: wordChoices.indexOf(word.meaning), explanation: `${word.word}는 '${word.meaning}'라는 뜻입니다.` },
    { category: "매일 1문장", prompt: sentence.pattern, question: "표현의 의미로 가장 알맞은 것은?", choices: sentenceChoices, answer: sentenceChoices.indexOf(sentence.meaning), explanation: `${sentence.pattern}은 '${sentence.meaning}'라는 의미입니다.` },
    { category: "문법 포인트", prompt: "get used to + ?", question: "뒤에 가장 자연스럽게 오는 형태는?", choices: grammarChoices, answer: grammarChoices.indexOf(grammarAnswer), explanation: "get used to 뒤에는 명사나 동명사를 씁니다. 예: get used to speaking English." },
  ];
}

// 오늘의 학습 대시보드: 아래 배열만 수정하면 메인 카드가 함께 바뀝니다.
const HOME_STUDY_STORAGE_KEY = "today_learning_dashboard_v2";
const LEGACY_HOME_STUDY_STORAGE_KEY = "today_learning_dashboard_v1";
const HOME_APP_STORAGE_KEY = "today_learning_app_v3";
const homeStudyItems = [
  { id: "words", number: "01", title: "단어장", description: "오늘 학습할 단어를 빠르게 확인하고 뜻과 표현을 익혀보세요.", page: "words", link: "vocab.html", icon: "book", color: "sage", tag: "기초 어휘", cta: "단어 복습하기" },
  { id: "sentence", number: "02", title: "매일 1문장", description: "짧고 유용한 문장을 따라 읽으며 매일 한 문장씩 쌓아가세요.", page: "sentence", link: "sentence.html", icon: "message", color: "gold", tag: "핵심 문장", cta: "문장 확인하기" },
  { id: "news", number: "03", title: "영어 뉴스", description: "오늘의 뉴스 표현을 통해 실제 영어 표현 감각을 키워보세요.", page: "news", link: "news.html", icon: "news", color: "blue", tag: "실전 읽기", cta: "뉴스 읽기" },
  { id: "ted", number: "04", title: "TED 학습", description: "오늘의 TED 문장 5개를 듣고 따라 말하며 핵심 표현을 익혀보세요.", page: "ted", link: "ted.html", icon: "mic", color: "rose", tag: "강연 표현", cta: "TED 보기" },
  { id: "test", number: "05", title: "Daily Test", description: "짧은 테스트로 오늘 학습한 내용을 가볍게 점검해보세요.", page: "test", link: "dailytest.html", icon: "clipboard", color: "mint", tag: "빠른 점검", cta: "테스트 풀기" },
  { id: "quiz", number: "06", title: "매일 토익 풀기", description: "문제를 풀고 오답을 확인하면서 실력을 정리해보세요.", page: "quiz", link: "quiz.html", icon: "pencil", color: "navy", tag: "오답 복습", cta: "문제 풀기" },
];
function homeAppItemId(id) {
  return id === "words" ? "vocab" : id === "test" ? "dailytest" : id;
}

function getHomeAppState() {
  const items = Object.fromEntries(homeStudyItems.map(item => [homeAppItemId(item.id), { done: false, lastStudiedAt: "", score: null }]));
  const saved = readStoredJSON(HOME_APP_STORAGE_KEY, {});
  return { items: { ...items, ...(saved.items || {}) } };
}

function syncHomeAppState(changedId = null, score = undefined) {
  const appState = getHomeAppState();
  homeStudyItems.forEach(item => {
    const appId = homeAppItemId(item.id);
    const previous = appState.items[appId] || { done: false, lastStudiedAt: "", score: null };
    const done = Boolean(homeStudyState.checked[item.id]);
    appState.items[appId] = {
      ...previous,
      done,
      lastStudiedAt: changedId === item.id && done ? new Date().toLocaleString("ko-KR") : previous.lastStudiedAt,
      score: changedId === item.id && score !== undefined ? score : previous.score,
    };
  });
  try { profileStorage.setItem(HOME_APP_STORAGE_KEY, JSON.stringify(appState)); }
  catch {}
  return appState;
}

function getHomeStudyState() {
  const today = localDateKey();
  const saved = readStoredJSON(HOME_STUDY_STORAGE_KEY, null)
    || readStoredJSON(LEGACY_HOME_STUDY_STORAGE_KEY, {});
  const normalizeChecked = checked => ({
    ...checked,
    words: Boolean(checked.words ?? checked.vocab),
    test: Boolean(checked.test ?? checked.dailytest),
  });

  // 이전의 단순 객체 형식도 읽되, 날짜가 바뀌면 새 체크리스트로 시작합니다.
  if (saved.date === today && saved.checked && typeof saved.checked === "object") {
    return { date: today, checked: normalizeChecked(saved.checked) };
  }
  if (!saved.date && Object.keys(saved).some(key => typeof saved[key] === "boolean")) {
    return { date: today, checked: normalizeChecked(saved) };
  }
  // 날짜가 지난 완료 상태는 새 날짜로 넘기지 않습니다.
  if (saved.date && saved.date !== today) return { date: today, checked: {} };
  const appItems = readStoredJSON(HOME_APP_STORAGE_KEY, {})?.items;
  if (appItems && typeof appItems === "object") {
    return { date: today, checked: normalizeChecked({
      words: appItems.vocab?.done,
      sentence: appItems.sentence?.done,
      news: appItems.news?.done,
      ted: appItems.ted?.done,
      drama: appItems.drama?.done,
      test: appItems.dailytest?.done,
      quiz: appItems.quiz?.done,
    }) };
  }
  return { date: today, checked: {} };
}

let homeStudyState = getHomeStudyState();

function saveHomeStudyState(changedId = null, score = undefined) {
  try {
    profileStorage.setItem(HOME_STUDY_STORAGE_KEY, JSON.stringify(homeStudyState));
    profileStorage.removeItem(LEGACY_HOME_STUDY_STORAGE_KEY);
  }
  catch {}
  syncHomeAppState(changedId, score);
}
saveHomeStudyState();

// Speaking Mode is an optional layer; default mode keeps the existing UX.
const LEARNING_MODE_STORAGE_KEY = "value_time_learning_mode_v1";
const SPEAKING_SPEED_STORAGE_KEY = "value_time_speaking_speed_v1";
const SPEAKING_EXPRESSION_STORAGE_KEY = "value_time_speaking_expressions_v1";
const AUDIENCE_MODE_STORAGE_KEY = "value_time_audience_mode_v1";
const SUNEUNG_STORAGE_KEY = "value_time_suneung_progress_v1";
const CHILD_NAME_STORAGE_KEY = "value_time_child_name_v1";
const KIDS_PROGRESS_STORAGE_KEY = "value_time_kids_progress_v1";
const KIDS_HISTORY_STORAGE_KEY = "value_time_kids_history_v1";
const KIDS_INTRO_STORAGE_KEY = "value_time_kids_intro_seen_v1";
const KIDS_WORD_DAY_OFFSET_STORAGE_KEY = "value_time_kids_word_day_offset_v1";
const KIDS_WORD_DAY_OFFSET_DATE_STORAGE_KEY = "value_time_kids_word_day_offset_date_v1";
const KIDS_SENTENCE_PAGE_STORAGE_KEY = "value_time_kids_sentence_page_v1";
const KIDS_SENTENCE_PAGE_DATE_STORAGE_KEY = "value_time_kids_sentence_page_date_v1";
let learningMode = (() => {
  try { return profileStorage.getItem(LEARNING_MODE_STORAGE_KEY) === "speaking" ? "speaking" : "default"; }
  catch { return "default"; }
})();
let speakingSpeed = (() => {
  try { return Number(profileStorage.getItem(SPEAKING_SPEED_STORAGE_KEY)) === 0.8 ? 0.8 : 1; }
  catch { return 1; }
})();
let speakingExpressionDone = (() => {
  try { return JSON.parse(profileStorage.getItem(SPEAKING_EXPRESSION_STORAGE_KEY) || "[]"); }
  catch { return []; }
})();
let audienceMode = (() => {
  try { const stored = profileStorage.getItem(AUDIENCE_MODE_STORAGE_KEY) || profileStorage.getItem("mode"); return stored === "kids" || stored === "elementary" ? "kids" : stored === "suneung" ? "suneung" : stored === "middle" ? "middle" : "general"; }
  catch { return "general"; }
})();
let childName = (() => {
  try { return profileStorage.getItem("studentName") || profileStorage.getItem(CHILD_NAME_STORAGE_KEY) || "김나혜"; }
  catch { return "김나혜"; }
})();
let showKidsIntro = (() => {
  try { return profileStorage.getItem(KIDS_INTRO_STORAGE_KEY) !== "true"; }
  catch { return true; }
})();
let kidsHistory = (() => {
  try { return JSON.parse(profileStorage.getItem(KIDS_HISTORY_STORAGE_KEY) || "{}") || {}; }
  catch { return {}; }
})();
let kidsProgress = (() => {
  try {
    const stored = JSON.parse(profileStorage.getItem(KIDS_PROGRESS_STORAGE_KEY) || "null");
    if (stored?.date && stored.date !== localDateKey()) {
      kidsHistory[stored.date] = kidsEntryFromProgress(stored);
      saveKidsHistory();
    }
    return stored?.date === localDateKey() ? stored : { date: localDateKey(), completed: {}, words: [], parent: {} };
  } catch { return { date: localDateKey(), completed: {}, words: [], parent: {} }; }
})();
let kidsFlippedWords = [];
let kidsWordQuizStep = 0;
let kidsTestAnswers = {};
let kidsWordDayOffset = (() => {
  try {
    return profileStorage.getItem(KIDS_WORD_DAY_OFFSET_DATE_STORAGE_KEY) === localDateKey()
      ? Math.max(0, Number(profileStorage.getItem(KIDS_WORD_DAY_OFFSET_STORAGE_KEY) || 0))
      : 0;
  }
  catch { return 0; }
})();
let kidsSentencePageIndex = (() => {
  try {
    return profileStorage.getItem(KIDS_SENTENCE_PAGE_DATE_STORAGE_KEY) === localDateKey()
      ? Math.max(0, Number(profileStorage.getItem(KIDS_SENTENCE_PAGE_STORAGE_KEY) || 0))
      : 0;
  }
  catch { return 0; }
})();

function applyLearningMode(mode) {
  learningMode = mode === "speaking" ? "speaking" : "default";
  document.documentElement.dataset.mode = learningMode;
  if (document.body) document.body.dataset.mode = learningMode;
  try { profileStorage.setItem(LEARNING_MODE_STORAGE_KEY, learningMode); } catch {}
}

function applyAudienceMode(mode) {
  audienceMode = ["kids", "middle", "suneung"].includes(mode) ? mode : "general";
  document.documentElement.dataset.audience = audienceMode;
  if (document.body) document.body.dataset.audience = audienceMode;
  try {
    profileStorage.setItem(AUDIENCE_MODE_STORAGE_KEY, audienceMode);
    profileStorage.setItem(CHILD_NAME_STORAGE_KEY, childName);
    profileStorage.setItem("mode", audienceMode === "kids" ? "elementary" : audienceMode === "suneung" ? "suneung" : audienceMode === "middle" ? "middle" : "default");
    profileStorage.setItem("studentName", childName);
  } catch {}
}

function childCallName() {
  const trimmed = String(childName || "").trim();
  return trimmed ? trimmed.slice(-2) : "친구";
}

function saveChildName(name) {
  const nextName = String(name || "").trim();
  if (!nextName) return;
  childName = nextName.slice(0, 12);
  try {
    profileStorage.setItem(CHILD_NAME_STORAGE_KEY, childName);
    profileStorage.setItem("studentName", childName);
  } catch {}
}

function kidsEntryFromProgress(progress = kidsProgress) {
  return {
    completed: { ...(progress.completed || {}) },
    words: [...(progress.words || [])],
    wordSessions: { ...(progress.wordSessions || {}) },
    sentenceSessions: { ...(progress.sentenceSessions || {}) },
    readingSessions: { ...(progress.readingSessions || {}) },
    storySessions: { ...(progress.storySessions || {}) },
    songSessions: { ...(progress.songSessions || {}) },
    testSessions: { ...(progress.testSessions || {}) },
    parent: { ...(progress.parent || {}) },
  };
}

function saveKidsHistory() {
  try { profileStorage.setItem(KIDS_HISTORY_STORAGE_KEY, JSON.stringify(kidsHistory)); } catch {}
}

function saveKidsProgress() {
  kidsProgress.date = kidsProgress.date || localDateKey();
  kidsHistory[kidsProgress.date] = kidsEntryFromProgress(kidsProgress);
  try { profileStorage.setItem(KIDS_PROGRESS_STORAGE_KEY, JSON.stringify(kidsProgress)); } catch {}
  saveKidsHistory();
}

function setKidsComplete(id, complete = true) {
  if (id === "words") {
    const wordDateKey = getKidsWordDateKey();
    const progress = getKidsWordProgress(wordDateKey);
    progress.completed = complete;
    if (!complete) progress.quizStep = 0;
    progress.lastCompletedAt = complete ? Date.now() : null;
    saveKidsWordProgress(wordDateKey, progress);
    return;
  }
  if (id === "sentence") {
    const sentenceKey = getKidsSentencePageKey();
    const progress = getKidsSentenceProgress(sentenceKey);
    progress.completed = complete;
    progress.lastCompletedAt = complete ? Date.now() : null;
    saveKidsSentenceProgress(sentenceKey, progress);
    return;
  }
  kidsProgress.completed[id] = complete;
  const session = getKidsDailySession(id);
  session.completed = complete;
  session.lastCompletedAt = complete ? Date.now() : null;
  saveKidsProgress();
}

function resetKidsSession(id) {
  if (id === "words") {
    const wordDateKey = getKidsWordDateKey();
    saveKidsWordProgress(wordDateKey, { words: [], quizStep: 0, completed: false, lastCompletedAt: null });
    kidsFlippedWords = [];
    return;
  }
  if (id === "sentence") {
    const sentenceKey = getKidsSentencePageKey();
    saveKidsSentenceProgress(sentenceKey, { listened: false, meaningShown: false, repeated: false, completed: false, lastCompletedAt: null });
    return;
  }
  if (id === "test") kidsTestAnswers = {};
  const collectionName = `${id}Sessions`;
  kidsProgress[collectionName] = kidsProgress[collectionName] || {};
  kidsProgress[collectionName][localDateKey()] = {};
  kidsProgress.completed[id] = false;
  saveKidsProgress();
}

function offsetDateKey(offset = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getKidsWordDateKey() {
  return `kids-word-page-${kidsWordDayOffset}`;
}

function saveKidsWordDayOffset() {
  try {
    profileStorage.setItem(KIDS_WORD_DAY_OFFSET_STORAGE_KEY, String(kidsWordDayOffset));
    profileStorage.setItem(KIDS_WORD_DAY_OFFSET_DATE_STORAGE_KEY, localDateKey());
  } catch {}
}

function getKidsSentencePageKey() {
  return `kids-sentence-page-${kidsSentencePageIndex}`;
}

function saveKidsSentencePageIndex() {
  try {
    profileStorage.setItem(KIDS_SENTENCE_PAGE_STORAGE_KEY, String(kidsSentencePageIndex));
    profileStorage.setItem(KIDS_SENTENCE_PAGE_DATE_STORAGE_KEY, localDateKey());
  } catch {}
}

function getKidsWordProgress(dateKey = getKidsWordDateKey()) {
  kidsProgress.wordSessions = kidsProgress.wordSessions || {};

  if (!kidsProgress.wordSessions[dateKey]) {
    kidsProgress.wordSessions[dateKey] = {
      words: [],
      quizStep: 0,
      completed: false,
      lastCompletedAt: null,
    };
  }

  return kidsProgress.wordSessions[dateKey];
}

function saveKidsWordProgress(dateKey, progress) {
  kidsProgress.wordSessions = kidsProgress.wordSessions || {};
  kidsProgress.wordSessions[dateKey] = progress;

  if (dateKey === getKidsWordDateKey()) {
    kidsProgress.words = [...progress.words];
    kidsWordQuizStep = progress.quizStep;
    kidsProgress.completed.words = Boolean(progress.completed);
  }

  saveKidsProgress();
}

function getKidsSentenceProgress(sentenceKey = getKidsSentencePageKey()) {
  kidsProgress.sentenceSessions = kidsProgress.sentenceSessions || {};

  if (!kidsProgress.sentenceSessions[sentenceKey]) {
    kidsProgress.sentenceSessions[sentenceKey] = {
      listened: false,
      meaningShown: false,
      repeated: false,
      completed: false,
      lastCompletedAt: null,
    };
  }

  return kidsProgress.sentenceSessions[sentenceKey];
}

function saveKidsSentenceProgress(sentenceKey, progress) {
  kidsProgress.sentenceSessions = kidsProgress.sentenceSessions || {};
  kidsProgress.sentenceSessions[sentenceKey] = progress;

  if (sentenceKey === getKidsSentencePageKey()) {
    kidsProgress.completed.sentence = Boolean(progress.completed);
  }

  saveKidsProgress();
}

function getKidsDailySession(id, initial = {}) {
  const collectionName = `${id}Sessions`;
  kidsProgress[collectionName] = kidsProgress[collectionName] || {};
  const dateKey = localDateKey();
  if (!kidsProgress[collectionName][dateKey]) {
    kidsProgress[collectionName][dateKey] = { ...initial, completed: Boolean(kidsProgress.completed[id]), lastCompletedAt: null };
  }
  return kidsProgress[collectionName][dateKey];
}

function saveSpeakingSpeed(speed) {
  speakingSpeed = speed === 0.8 ? 0.8 : 1;
  try { profileStorage.setItem(SPEAKING_SPEED_STORAGE_KEY, String(speakingSpeed)); } catch {}
}

function speakText(text, repeat = 1) {
  if (!text || !("speechSynthesis" in window)) return;
  // Preserve the original Silent-mode playback behavior exactly.
  if (learningMode !== "speaking") {
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    return;
  }
  speechSynthesis.cancel();
  for (let index = 0; index < repeat; index++) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = speakingSpeed;
    speechSynthesis.speak(utterance);
  }
}

applyLearningMode(learningMode);
applyAudienceMode(audienceMode);

// 사용자가 고른 화면 모드를 새로고침 후에도 유지합니다.
const THEME_STORAGE_KEY = "today_learning_theme_v3";
const LEGACY_THEME_STORAGE_KEYS = ["today_learning_theme_v2", "worthy_life_theme"];
let currentTheme = (() => {
  try { return (profileStorage.getItem(THEME_STORAGE_KEY) || LEGACY_THEME_STORAGE_KEYS.map(key => profileStorage.getItem(key)).find(Boolean)) === "dark" ? "dark" : "light"; }
  catch { return "light"; }
})();
document.documentElement.dataset.theme = currentTheme;

function saveTheme(theme) {
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  try {
    profileStorage.setItem(THEME_STORAGE_KEY, theme);
    LEGACY_THEME_STORAGE_KEYS.forEach(key => profileStorage.removeItem(key));
  }
  catch {}
}
saveTheme(currentTheme);

let state = {
  page: "home", selectedDate: localDateKey(), calendarMonth: new Date().getMonth(), calendarYear: new Date().getFullYear(),
  history: JSON.parse(profileStorage.getItem("worthy_life_history") || "null") || defaultHistory,
  savedWords: JSON.parse(profileStorage.getItem("worthy_life_words") || "[]"),
  knownWords: JSON.parse(profileStorage.getItem("value_time_known_words_v1") || "[]"),
  clearedWordSentences: JSON.parse(profileStorage.getItem("value_time_cleared_word_sentences_v1") || "[]"),
  savedSentences: JSON.parse(profileStorage.getItem("value_time_saved_sentences_v1") || "[]"),
  savedBlogItems: JSON.parse(profileStorage.getItem("value_time_saved_blog_items_v1") || "[]"),
  understoodSentences: JSON.parse(profileStorage.getItem("value_time_understood_sentences_v1") || "[]"),
  clearedSentences: JSON.parse(profileStorage.getItem("value_time_cleared_sentences_v1") || "[]"),
  wordIndex: 0, vocabPage: Number(profileStorage.getItem("value_time_vocab_page") || 0), sentencePage: Number(profileStorage.getItem("value_time_sentence_page") || 0), newsIndex: null, translatedSentence: null,
  newsSearch: "", newsCategory: "all", newsSort: "latest", tedLessonId: null, tedSentenceIndex: 0, tedMeaningOpen: false,
};

let activeBlogPostId = null;
let blogSaveToast = "";
let journalTestState = { view: "closed", scope: "all", count: 5, difficulty: "normal", test: null, answers: {}, submitted: false, wrongOnly: false, wrongQuestionIds: [] };
let reviewProgressMap = JSON.parse(profileStorage.getItem(REVIEW_STORAGE_KEY) || "{}");
let reviewChatState = { open: false, selected: null, answered: null, completed: false, wrongNotes: [] };
let selectionAssistantState = { open: false, text: "", range: null, busy: false, saved: false, origin: "selection", web: null };
let selectionAssistantDocumentBound = false;
let emailRoleplayState = { active: false, replyText: "", submitted: false, evaluation: null, sending: false, error: "" };
let newsSaveToast = "";
let newsReviewState = { articleId: null, sentenceIndex: null, questionIndex: 0, answers: {} };
let newsArticleLearningState = (() => {
  try {
    const stored = JSON.parse(profileStorage.getItem(NEWS_ARTICLE_LEARNING_STORAGE_KEY) || "null");
    return stored?.date === localDateKey() ? stored : { date: localDateKey(), articleId: null, readParagraphs: [], translations: [], expressions: [], quizAnswers: {}, quizSubmitted: false };
  } catch { return { date: localDateKey(), articleId: null, readParagraphs: [], translations: [], expressions: [], quizAnswers: {}, quizSubmitted: false }; }
})();
newsArticleLearningState.difficult ||= [];
newsArticleLearningState.savedArticles ||= [];
newsArticleLearningState.notes ||= {};
let dramaShortState = (() => {
  try {
    const stored = JSON.parse(profileStorage.getItem(DRAMA_SHORT_STORAGE_KEY) || "null");
    return stored?.date === localDateKey() ? { ...stored, translations: {}, expressions: {}, quizCard: null, questionIndex: 0 } : { date: localDateKey(), answers: {}, translations: {}, expressions: {}, quizCard: null, questionIndex: 0 };
  } catch { return { date: localDateKey(), answers: {}, translations: {}, expressions: {}, quizCard: null, questionIndex: 0 }; }
})();
let suneungPassage = {
  id: "2026-07-20-inference-01", number: "DAY 01", topic: "Why Productive Struggle Improves Learning", type: "빈칸 추론", difficulty: "상", minutes: 8, limit: "07:00",
  source: "ValueTime 수능형 학습 자료", sourceDetail: "학습용 자체 구성 · 공식 기출 아님", tags: ["빈칸 추론", "교육", "논리 전개"],
  paragraphs: [
    "Students often assume that effective learning should feel smooth and effortless. When an explanation is easy to follow, they may believe that they have fully mastered the material.",
    "Research on learning, however, suggests that temporary difficulty can strengthen long-term understanding. The effort required to retrieve an idea forces learners to organize and reconstruct what they know.",
    "This does not mean that all confusion is useful. Difficulty becomes productive only when learners possess enough prior knowledge to make progress and receive feedback before frustration takes over.",
    "In other words, the most effective learning environment does not remove every obstacle. It provides challenges that are demanding enough to require thought, but structured enough to remain ______.",
  ],
  translations: ["학생들은 효과적인 학습이 매끄럽고 힘들지 않아야 한다고 생각하는 경우가 많다. 설명을 쉽게 따라갈 수 있으면 내용을 완전히 익혔다고 믿을 수 있다.", "그러나 학습 연구는 일시적인 어려움이 장기적인 이해를 강화할 수 있음을 보여준다. 생각을 인출하는 노력은 학습자가 알고 있는 내용을 조직하고 재구성하게 한다.", "그렇다고 모든 혼란이 유용한 것은 아니다. 학습자가 진전할 만큼의 사전 지식을 갖고 좌절하기 전에 피드백을 받을 때만 어려움은 생산적이 된다.", "즉, 가장 효과적인 학습 환경은 모든 장애물을 제거하지 않는다. 사고를 요구할 만큼 어렵지만 계속할 수 있도록 구조화된 도전을 제공한다."],
  question: "빈칸에 들어갈 말로 가장 적절한 것은?", choices: ["emotionally invisible", "intellectually manageable", "entirely unpredictable", "socially competitive", "permanently confusing"], answer: 1,
  explanation: "글은 학습에 도움이 되는 어려움이 사고를 요구하면서도 학습자가 계속 진전할 수 있는 수준이어야 한다고 설명합니다. 따라서 ‘지적으로 감당 가능한’이 가장 적절합니다.",
  traps: ["① 감정에 관한 논의가 아닙니다.", "③ 예측 불가능성이 아니라 적절히 구조화된 도전을 강조합니다.", "④ 경쟁은 핵심 내용이 아닙니다.", "⑤ 지속적인 혼란은 productive difficulty와 반대입니다."], evidence: "demanding enough to require thought, but structured enough to remain ...",
  vocab: [{ word: "effortless", meaning: "힘이 들지 않는", usage: "smooth and effortless" }, { word: "retrieve", meaning: "인출하다", usage: "retrieve an idea" }, { word: "reconstruct", meaning: "재구성하다", usage: "reconstruct what they know" }, { word: "prior knowledge", meaning: "사전 지식", usage: "possess enough prior knowledge" }, { word: "frustration", meaning: "좌절감", usage: "before frustration takes over" }, { word: "manageable", meaning: "감당할 수 있는", usage: "intellectually manageable" }],
  notes: [
    "assume 뒤의 that절이 목적어이며, should feel은 학습에 대한 일반적인 기대를 나타냅니다.",
    "however가 앞 문단의 통념을 반전합니다. required to retrieve an idea는 effort를 뒤에서 수식합니다.",
    "only when은 생산적인 어려움이 성립하는 조건을 제한하며, before는 피드백의 시점을 보여줍니다.",
    "not A but B에 가까운 대조 구조입니다. demanding과 structured의 균형이 빈칸 추론의 근거입니다.",
  ],
  expressions: [
    { id: "effortless", text: "smooth and effortless", meaning: "매끄럽고 힘이 들지 않는", example: "Learning should feel smooth and effortless.", note: "겉으로 쉽게 느껴지는 학습에 대한 통념을 나타냅니다." },
    { id: "retrieve", text: "retrieve an idea", meaning: "생각을 인출하다", example: "The effort required to retrieve an idea...", note: "기억 속 정보를 의식적으로 떠올리는 학습 맥락의 표현입니다." },
    { id: "reconstruct", text: "reconstruct what they know", meaning: "알고 있는 것을 재구성하다", example: "Learners organize and reconstruct what they know.", note: "what절 전체가 reconstruct의 목적어입니다." },
    { id: "prior-knowledge", text: "prior knowledge", meaning: "사전 지식", example: "Learners possess enough prior knowledge.", note: "새로운 내용을 이해하기 전에 이미 알고 있는 지식을 뜻합니다." },
    { id: "take-over", text: "take over", meaning: "장악하다, 지배하기 시작하다", example: "before frustration takes over", note: "여기서는 좌절감이 학습 상태를 지배하게 되는 상황을 뜻합니다." },
    { id: "manageable", text: "remain manageable", meaning: "감당할 수 있는 상태로 남다", example: "structured enough to remain manageable", note: "어려움이 지나치지 않고 학습자가 계속 다룰 수 있음을 나타냅니다." },
  ],
  questions: [
    { id: "main-idea", type: "주제", question: "다음 글의 주제로 가장 적절한 것은?", choices: ["학습에서 적절한 어려움이 장기적 이해를 강화하는 방식", "모든 학습 장애물을 제거해야 하는 이유", "경쟁적인 학습 환경이 성취를 높이는 과정", "쉬운 설명만으로 완전한 숙달에 이르는 방법"], answer: 0, explanation: "글은 무조건 쉬운 학습보다, 피드백과 사전 지식이 뒷받침된 적절한 어려움이 이해를 강화한다고 설명합니다.", evidence: "temporary difficulty can strengthen long-term understanding" },
    { id: "detail", type: "내용 불일치", question: "윗글의 내용과 일치하지 않는 것은?", choices: ["쉬운 설명은 완전한 숙달이라는 착각을 줄 수 있다.", "일시적인 어려움은 장기적 이해를 강화할 수 있다.", "모든 형태의 혼란은 학습에 유용하다.", "생산적인 어려움에는 충분한 사전 지식과 피드백이 필요하다."], answer: 2, explanation: "글은 모든 혼란이 유용한 것은 아니라고 명시합니다. 어려움이 생산적이려면 조건이 필요합니다.", evidence: "This does not mean that all confusion is useful." },
    { id: "blank", type: "빈칸 추론", question: "마지막 문장의 빈칸에 들어갈 말로 가장 적절한 것은?", choices: ["intellectually manageable", "entirely unpredictable", "socially competitive", "permanently confusing"], answer: 0, explanation: "도전은 사고를 요구할 만큼 어렵지만 계속 학습할 수 있도록 감당 가능한 수준이어야 합니다.", evidence: "demanding enough to require thought, but structured enough" },
    { id: "vocabulary", type: "어휘 추론", question: "문맥상 ‘frustration takes over’의 의미로 가장 적절한 것은?", choices: ["좌절감이 학습을 지배하기 시작한다", "좌절감이 완전히 사라진다", "학습자가 사전 지식을 전달한다", "피드백이 불필요해진다"], answer: 0, explanation: "take over는 어떤 상태가 주도권을 잡거나 지배하기 시작한다는 뜻입니다.", evidence: "receive feedback before frustration takes over" },
  ],
};
const importedCsatQuestionNumbers = new Set([20, 21, 22, 23, 24, 26, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);
const displaySafeCsatQuestionNumbers = new Set([20, 22, 23, 24, 26, 31, 32, 33, 34, 36, 37, 40]);
const importedCsatQuestionMeta = {
  20: ["필자의 주장", "다음 글에서 필자가 주장하는 바로 가장 적절한 것은?"],
  21: ["함축 의미", "밑줄 친 부분이 다음 글에서 의미하는 바로 가장 적절한 것은?"],
  22: ["요지", "다음 글의 요지로 가장 적절한 것은?"],
  23: ["주제", "다음 글의 주제로 가장 적절한 것은?"],
  24: ["제목", "다음 글의 제목으로 가장 적절한 것은?"],
  26: ["내용 불일치", "다음 글의 내용과 일치하지 않는 것은?"],
  29: ["어법", "다음 글의 밑줄 친 부분 중 어법상 틀린 것은?"],
  30: ["어휘", "다음 글의 밑줄 친 낱말 중 문맥상 적절하지 않은 것은?"],
  31: ["빈칸 추론", "다음 빈칸에 들어갈 말로 가장 적절한 것은?"],
  32: ["빈칸 추론", "다음 빈칸에 들어갈 말로 가장 적절한 것은?"],
  33: ["빈칸 추론", "다음 빈칸에 들어갈 말로 가장 적절한 것은?"],
  34: ["빈칸 추론", "다음 빈칸에 들어갈 말로 가장 적절한 것은?"],
  35: ["무관한 문장", "다음 글에서 전체 흐름과 관계없는 문장은?"],
  36: ["글의 순서", "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?"],
  37: ["글의 순서", "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?"],
  38: ["문장 삽입", "주어진 문장이 들어가기에 가장 적절한 곳은?"],
  39: ["문장 삽입", "주어진 문장이 들어가기에 가장 적절한 곳은?"],
  40: ["요약문 완성", "다음 글의 내용을 한 문장으로 요약할 때 빈칸에 들어갈 말로 가장 적절한 것은?"],
};

function repairImportedCsatOcr(value) {
  const repairs = {
    "var y": "vary", "c an": "can", "abou t": "about", "inst ance": "instance", "pro gram": "program",
    "imag ine": "imagine", "m uch": "much", "in crement": "increment", "n o more": "no more", "h ave": "have",
    "di fferent": "different", "decision s": "decisions", "l ikely": "likely", "sh ared": "shared", "strong er": "stronger",
    "ot her": "other", "plant s": "plants", "d ecisions": "decisions", "destro ying": "destroying",
  };
  let text = String(value || "");
  Object.entries(repairs).forEach(([broken, fixed]) => { text = text.replaceAll(broken, fixed); });
  return text;
}

function currentLearningUser() {
  return getCurrentUser(modeFromAudience(audienceMode));
}

function isAcademicMode(mode = audienceMode) {
  return mode === "suneung" || mode === "middle";
}

function currentModeConfig() {
  return getModeConfig(modeFromAudience(audienceMode));
}

function requestLearningUser(mode = modeFromAudience(audienceMode)) {
  window.dispatchEvent(new CustomEvent("valuetime:request-user", { detail: { mode } }));
}

window.addEventListener("valuetime:user-selected", event => {
  const nextAudience = event.detail?.mode === "suneung" ? "suneung" : event.detail?.mode === "middle" ? "middle" : "general";
  applyAudienceMode(nextAudience);
  window.location.reload();
});

window.addEventListener("valuetime:article-imported", event => {
  const article = event.detail?.article;
  if (!article?.id || !getArticleBodyParagraphs(article).length) return;
  articleLibrary = [article, ...articleLibrary.filter(item => item.id !== article.id && (!article.originalUrl || item.originalUrl !== article.originalUrl))];
  navigateTo("news", { newsIndex: 0 });
});

function getArticleBodyParagraphs(article) {
  const source = article?.originalArticleParagraphs ?? article?.originalArticleText ?? article?.bodyParagraphs ?? article?.paragraphs ?? article?.body ?? article?.content ?? article?.articleText;
  if (Array.isArray(source)) {
    return source.map((paragraph, index) => {
      if (typeof paragraph === "string") return { id: index, text: paragraph.trim(), translation: "" };
      return {
        id: paragraph?.id ?? index,
        text: String(paragraph?.text ?? paragraph?.en ?? "").trim(),
        translation: String(paragraph?.translation ?? paragraph?.ko ?? "").trim(),
      };
    }).filter(paragraph => paragraph.text);
  }
  if (typeof source === "string" && source.trim()) {
    return source.trim().split(/\n\s*\n/).map((text, index) => ({ id: index, text: text.trim(), translation: "" })).filter(paragraph => paragraph.text);
  }
  return [];
}

function importedCsatPassageText(item) {
  const raw = String(item.rawText || "");
  const markers = [...raw.matchAll(/[①②③④⑤]/g)];
  const choiceStart = markers.length >= 5 ? markers[markers.length - 5].index : raw.length;
  let passage = raw.slice(0, choiceStart)
    .split(/\r?\n/)
    .filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (/^[*＊]{1,3}\s*[A-Za-z].*[:：].*[가-힣]/.test(trimmed)) return false;
      if (/^(?:짝수형|홀수형|\d+\s*\/\s*\d+|\d+\s+\d+\s+\d+)$/.test(trimmed)) return false;
      if (/이제 듣기 문제가 끝났습니다|문제지의 지시에 따라|저작권은 한국교육과정평가원/.test(trimmed)) return false;
      if (/[ÇÈÉÀÅÐÕ¬üÓÆµ²ä]{3,}/.test(trimmed)) return false;
      return true;
    })
    .join(" ")
    .trim();
  const firstEnglish = passage.search(/[A-Za-z]/);
  if (firstEnglish >= 0) passage = passage.slice(firstEnglish);
  return repairImportedCsatOcr(passage
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[ÇÈÉÀÅÐÕ¬üÓÆµ²ä]{2,}.*$/g, "")
    .replace(/\s+(?:짝수형|홀수형)\s+\d+(?:\s+\d+)*\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim());
}

function sanitizeImportedCsatChoice(value) {
  let choice = String(value || "");
  ["이제 듣기 문제가 끝났습니다.", "이 문제지에 관한 저작권은 한국교육과정평가원에 있습니다.", "짝수형", "홀수형"].forEach(marker => {
    if (choice.includes(marker)) choice = choice.split(marker, 1)[0];
  });
  choice = choice.split(/[ÇÈÉÀÅÐÕ¬üÓÆµ²ä]{2,}|\*\s*확인 사항|\r?\n\s*\*{1,3}\s*[A-Za-z]/)[0];
  return repairImportedCsatOcr(choice
    .replace(/[\x00-\x1f\x7f]/g, " ")
    .replace(/\s+(?:짝수형|홀수형)\s+\d+(?:\s+\d+)*\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim());
}

function isUsableImportedCsatPassage(passage) {
  const words = passage.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g) || [];
  const singleLetterRatio = words.length ? words.filter(word => word.length === 1 && !/^[AIa]$/.test(word)).length / words.length : 1;
  return (passage.match(/[A-Za-z]/g) || []).length >= 250
    && !/[ÇÈÉÀÅÐÕ¬üÓÆµ²ä]{2,}|\uFFFD/.test(passage)
    && !/이제 듣기 문제가 끝났습니다|짝수형|홀수형|확인 사항/.test(passage)
    && singleLetterRatio < 0.12;
}

function isUsableImportedCsatChoice(choice) {
  if (!choice || choice.length < 1 || choice.length > 220) return false;
  if (/[ÇÈÉÀÅÐÕ¬üÓÆµ²ä]{2,}|\uFFFD/.test(choice)) return false;
  if (/이제 듣기 문제가 끝났습니다|문제지의 지시에|짝수형|홀수형|확인 사항|저작권/.test(choice)) return false;
  const words = choice.match(/[A-Za-z]+/g) || [];
  const singleLetterRatio = words.length ? words.filter(word => word.length === 1 && !/^[AIa]$/.test(word)).length / words.length : 0;
  return singleLetterRatio < 0.18;
}

const importedSuneungPassages = (csatEnglishArchive?.questions || [])
  .filter(item => importedCsatQuestionNumbers.has(Number(item.questionNo)))
  .filter(item => displaySafeCsatQuestionNumbers.has(Number(item.questionNo)))
  .filter(item => Number.isInteger(Number(item.answer)) && Array.isArray(item.choices) && item.choices.length === 5)
  .map(item => ({ item, passage: importedCsatPassageText(item), choices: item.choices.map(sanitizeImportedCsatChoice) }))
  .filter(({ passage, choices }) => isUsableImportedCsatPassage(passage) && choices.length === 5 && choices.every(isUsableImportedCsatChoice))
  .map(({ item, passage, choices }) => {
    const [type, question] = importedCsatQuestionMeta[item.questionNo] || ["독해", "다음 글을 읽고 물음에 답하세요."];
    return {
      id: item.id,
      number: `${item.year} CSAT · ${item.questionNo}번`,
      topic: `${item.year}학년도 수능 영어 ${item.questionNo}번`,
      type,
      difficulty: Number(item.points) === 3 ? "상" : "중",
      minutes: Number(item.points) === 3 ? 3 : 2,
      limit: Number(item.points) === 3 ? "03:00" : "02:00",
      source: "한국교육과정평가원",
      sourceDetail: `${item.examName} 공식 공개문항 · 홀수형`,
      tags: ["공식 기출", `${item.year}학년도`, type],
      paragraphs: [passage],
      translations: [""],
      notes: [""],
      expressions: [],
      vocab: [],
      questions: [{
        id: `${item.id}-question`,
        type,
        question,
        choices,
        answer: Number(item.answer) - 1,
        explanation: `공식 정답표 기준 정답은 ${item.answer}번입니다.`,
        evidence: `${item.examName} 영어 영역 공식 정답표`,
      }],
    };
  });

const csatPassages = [
  suneungPassage,
  {
    ...suneungPassage,
    id: "2026-07-21-main-idea-02", number: "PASSAGE 02", topic: "Why Predictions Improve Reading", type: "주제", difficulty: "중", minutes: 7, limit: "06:30",
    tags: ["주제", "학습 전략", "독해"],
    paragraphs: [
      "Before reading a difficult text, learners often wait for the writer to provide every answer. This passive approach can make each new sentence feel disconnected from the last.",
      "Making a prediction changes the task. Even an imperfect guess gives the reader a temporary structure against which new information can be compared.",
      "When the prediction is wrong, the difference between expectation and evidence attracts attention. Readers then revise their understanding instead of merely collecting isolated facts.",
      "Prediction is therefore valuable not because it guarantees accuracy, but because it turns reading into an active process of testing and revision.",
    ],
    translations: ["어려운 글을 읽기 전에 학습자는 글쓴이가 모든 답을 제공하기를 기다리는 경우가 많다. 이런 수동적 접근은 새로운 문장들이 서로 단절된 것처럼 느껴지게 할 수 있다.", "예측을 하면 과제가 달라진다. 불완전한 추측이라도 새로운 정보를 비교할 임시 구조를 독자에게 제공한다.", "예측이 틀리면 기대와 근거의 차이가 주의를 끈다. 그러면 독자는 고립된 사실만 모으는 대신 이해를 수정한다.", "따라서 예측은 정확성을 보장해서가 아니라 읽기를 검증과 수정의 능동적 과정으로 바꾸기 때문에 가치가 있다."],
    notes: ["wait for A to B 구조와 make+목적어+목적격보어 구조를 확인합니다.", "against which는 전치사+관계대명사이며 compared의 비교 기준을 나타냅니다.", "When절 뒤 주절에서 instead of가 대조 행동을 제시합니다.", "not because A, but because B가 글의 핵심 이유를 강조합니다."],
    expressions: [
      { id: "passive-approach", text: "a passive approach", meaning: "수동적인 접근", example: "This passive approach can make each sentence feel disconnected.", note: "정보를 능동적으로 처리하지 않는 읽기 태도입니다." },
      { id: "against-which", text: "against which", meaning: "그것을 기준으로", example: "a structure against which information can be compared", note: "비교의 기준을 나타내는 관계사 표현입니다." },
      { id: "revise-understanding", text: "revise their understanding", meaning: "이해를 수정하다", example: "Readers revise their understanding.", note: "새 근거에 맞춰 기존 해석을 조정한다는 뜻입니다." },
    ],
    vocab: [{ word: "passive", meaning: "수동적인", usage: "a passive approach" }, { word: "prediction", meaning: "예측", usage: "make a prediction" }, { word: "temporary", meaning: "일시적인", usage: "a temporary structure" }, { word: "revise", meaning: "수정하다", usage: "revise their understanding" }],
    questions: [
      { id: "main-idea", type: "주제", question: "다음 글의 주제로 가장 적절한 것은?", choices: ["예측이 독해를 능동적인 검증 과정으로 만드는 방식", "어려운 글에서 모든 예측을 피해야 하는 이유", "문장을 암기해 읽기 속도를 높이는 방법", "글쓴이의 답을 수동적으로 기다리는 장점"], answer: 0, explanation: "글은 예측이 새로운 정보를 비교하고 이해를 수정하게 하여 능동적 독해를 만든다고 설명합니다.", evidence: "it turns reading into an active process of testing and revision" },
      { id: "detail", type: "내용 일치", question: "윗글의 내용과 일치하는 것은?", choices: ["예측은 반드시 정확해야 유용하다.", "틀린 예측도 기대와 근거의 차이에 주목하게 한다.", "수동적 읽기는 문장 간 연결을 강화한다.", "예측은 이해의 수정을 방해한다."], answer: 1, explanation: "글은 틀린 예측도 차이에 주의를 끌어 이해를 수정하게 한다고 말합니다.", evidence: "When the prediction is wrong, the difference ... attracts attention." },
    ],
  },
  {
    ...suneungPassage,
    id: "2026-07-22-title-03", number: "PASSAGE 03", topic: "The Hidden Cost of Constant Choice", type: "제목", difficulty: "중", minutes: 7, limit: "06:30",
    tags: ["제목", "의사결정", "심리"],
    paragraphs: [
      "Having many options is usually associated with freedom. Yet every additional choice also requires attention, comparison, and the possibility of regret.",
      "When decisions accumulate throughout the day, people may begin to rely on the easiest option rather than the one that best serves their goals.",
      "This is why effective systems often reduce trivial choices. A prepared routine does not remove meaningful freedom; it protects mental energy for decisions that deserve careful thought.",
    ],
    translations: ["많은 선택지는 보통 자유와 연관된다. 그러나 선택이 하나 늘어날 때마다 주의, 비교, 후회의 가능성도 필요해진다.", "결정이 하루 동안 누적되면 사람들은 목표에 가장 잘 맞는 선택보다 가장 쉬운 선택에 의존하기 시작할 수 있다.", "이것이 효과적인 시스템이 사소한 선택을 줄이는 이유다. 준비된 루틴은 의미 있는 자유를 없애는 것이 아니라 신중한 사고가 필요한 결정을 위해 정신적 에너지를 보호한다."],
    notes: ["be associated with는 ‘~와 관련되다’라는 수동 표현입니다.", "rather than이 가장 쉬운 선택과 목표에 맞는 선택을 대조합니다.", "not A; it B 구조로 루틴의 역할을 재정의합니다."],
    expressions: [{ id: "accumulate", text: "decisions accumulate", meaning: "결정이 누적되다", example: "When decisions accumulate throughout the day...", note: "작은 결정들이 계속 쌓이는 상황입니다." }, { id: "rely-on", text: "rely on", meaning: "~에 의존하다", example: "rely on the easiest option", note: "선택 피로 뒤의 행동을 나타냅니다." }, { id: "mental-energy", text: "mental energy", meaning: "정신적 에너지", example: "protects mental energy", note: "집중하고 판단하는 데 쓰이는 인지 자원을 뜻합니다." }],
    vocab: [{ word: "accumulate", meaning: "누적되다", usage: "decisions accumulate" }, { word: "trivial", meaning: "사소한", usage: "trivial choices" }, { word: "meaningful", meaning: "의미 있는", usage: "meaningful freedom" }, { word: "deserve", meaning: "~할 가치가 있다", usage: "deserve careful thought" }],
    questions: [
      { id: "title", type: "제목", question: "다음 글의 제목으로 가장 적절한 것은?", choices: ["More Choices, Less Mental Energy", "Why Every Routine Removes Freedom", "The Simple Path to Unlimited Attention", "Regret as the Best Decision Strategy"], answer: 0, explanation: "선택이 많을수록 정신적 자원이 소모되며, 루틴이 중요한 결정에 에너지를 남긴다는 내용입니다.", evidence: "it protects mental energy for decisions that deserve careful thought" },
      { id: "inference", type: "추론", question: "윗글로부터 추론할 수 있는 것은?", choices: ["모든 선택을 제거해야 한다.", "사소한 결정을 줄이면 중요한 판단에 집중할 수 있다.", "가장 쉬운 선택은 언제나 목표에 가장 적합하다.", "선택지가 많을수록 후회 가능성은 줄어든다."], answer: 1, explanation: "루틴으로 사소한 선택을 줄이면 중요한 결정에 정신적 에너지를 사용할 수 있습니다.", evidence: "reduce trivial choices ... protects mental energy" },
    ],
  },
  ...importedSuneungPassages,
];
const suneungPassages = audienceMode === "middle" ? middleEnglishPassages : csatPassages;

function nextAvailablePassageIndex(currentIndex, masteredIds = []) {
  for (let offset = 1; offset < suneungPassages.length; offset += 1) {
    const index = (currentIndex + offset) % suneungPassages.length;
    if (!masteredIds.includes(suneungPassages[index].id)) return index;
  }
  return -1;
}

let suneungState = (() => { try { const stored = JSON.parse(profileStorage.getItem(SUNEUNG_STORAGE_KEY) || "null"); return stored?.date === localDateKey() ? stored : { date: localDateKey(), view: "home", mode: "exam", translations: [], selected: null, submitted: false, completed: false, reviewSaved: false, masteredPassages: stored?.masteredPassages || [], completedPassages: stored?.completedPassages || [], typeTrainingHistory: stored?.typeTrainingHistory || [] }; } catch { return { date: localDateKey(), view: "home", mode: "exam", translations: [], selected: null, submitted: false, completed: false, reviewSaved: false, masteredPassages: [], completedPassages: [], typeTrainingHistory: [] }; } })();
suneungState.officialOnly ??= true;
suneungState.sourceTab ||= "official";
suneungState.dailyChecks ||= {};
suneungState.passageTab = !suneungState.passageTab || suneungState.passageTab === "reading" ? "questions" : suneungState.passageTab;
suneungState.passageTranslations ||= [];
suneungState.passageNotes ||= [];
suneungState.difficultSentences ||= [];
suneungState.bookmarkedSentences ||= [];
suneungState.expressionStatus ||= {};
suneungState.passageQuestionIndex ??= 0;
suneungState.passageAnswers ||= {};
suneungState.passageChecked ||= {};
suneungState.wrongPassageQuestions ||= [];
suneungState.typeTrainingHistory ||= [];
suneungState.passageIndex ??= 0;
suneungState.completedPassages ||= [];
suneungState.masteredPassages ||= [];
suneungState.batchAnswers ||= {};
suneungState.batchChecked ||= {};
suneungState.batchQuestionIndexes ||= {};
suneungState.batchAnalysisOpen ||= {};
suneungState.batchDay = Math.max(1, Number(suneungState.batchDay) || 1);
suneungState.batchPosition = Math.max(0, Number(suneungState.batchPosition) || 0);
suneungState.masteredPassages = suneungState.masteredPassages.filter(id => suneungPassages.some(passage => passage.id === id));
if (suneungState.masteredPassages.includes(suneungPassages[suneungState.passageIndex % suneungPassages.length].id)) {
  const nextIndex = nextAvailablePassageIndex(suneungState.passageIndex % suneungPassages.length, suneungState.masteredPassages);
  if (nextIndex >= 0) suneungState.passageIndex = nextIndex;
}
suneungPassage = suneungPassages[suneungState.passageIndex % suneungPassages.length];

const suneungHomeStudyItems = [
  { id: "wordmaster", number: "01", title: `${currentModeConfig().shortLabel} 단어장`, page: "suneung-wordmaster", icon: "book", color: "sage", tag: "Word Master", unit: "오늘의 단어 학습", cta: "단어 학습하기" },
  { id: "passage", number: "02", title: `${currentModeConfig().shortLabel} 지문 훈련`, page: "suneung-passage", icon: "book-open", color: "blue", tag: audienceMode === "middle" ? "기본 독해" : "실전 독해", unit: "완료 후 다음 지문 계속", cta: "지문 풀기" },
  { id: "types", number: "03", title: "유형별 훈련", page: "suneung-types", icon: "clipboard", color: "gold", tag: "유형 전략", unit: "취약 유형 집중 훈련", cta: "유형 훈련하기" },
  { id: "vocab", number: "05", title: "어휘 / 구문", page: "suneung-vocab", icon: "book", color: "mint", tag: "구문 분석", unit: "핵심 어휘와 문장 구조", cta: "어휘·구문 보기" },
  { id: "parent", number: "06", title: "부모 점검", page: "suneung-parent", icon: "calendar", color: "navy", tag: "학습 기록", unit: "오늘의 진도와 약점 확인", cta: "학습 현황 보기" },
];

function icon(name, size = 20) {
  const paths = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5M9 21v-7h6v7"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M8 7h8M8 11h6"/>',
    spark: '<path d="m12 3-1.7 4.3L6 9l4.3 1.7L12 15l1.7-4.3L18 9l-4.3-1.7L12 3Z"/><path d="m5 14-.9 2.1L2 17l2.1.9L5 20l.9-2.1L8 17l-2.1-.9L5 14Z"/>',
    news: '<path d="M4 5h14v14H4z"/><path d="M8 9h6M8 13h6M8 17h3M18 8h2v10a1 1 0 0 1-1 1"/>',
    play: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3Z"/>',
    mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    check: '<path d="m5 12 4 4L19 6"/>', chevron: '<path d="m9 18 6-6-6-6"/>',
    volume: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4V3Z"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-3-1.7-5.6-4-8-1 3-2.7 4-4 4-1-2-.6-5 0-8-4 3-6 7-6 11 0 4.4 3 8 7 8Z"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "book-open": '<path d="M3 4h6a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3V4ZM21 4h-6a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h6V4Z"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/>',
    pencil: '<path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m13.5 8 3 3M4 20h6"/>',
    moon: '<path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5a8.5 8.5 0 1 0 12 12Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
}

function navItem(id, label, ico) {
  const isActive = state.page === id || (isAcademicMode() && id === "suneung-home" && state.page === "home");
  return `<button class="nav-item ${isActive ? "active" : ""}" data-page="${id}">${icon(ico)}<span>${label}</span></button>`;
}
function sidebar() {
  const todayDone = (state.history["2026-07-13"] || []).length;
  const kidsNavigation = `${navItem("home", "오늘의 학습", "home")}${navItem("words", "단어장", "book")}${navItem("sentence", "매일 1문장", "spark")}${navItem("news", "초등용 읽기", "news")}${navItem("ted", "영어동화", "book")}${navItem("drama", "영어 동요", "play")}${navItem("test", "Daily Test", "check")}<p class="nav-label space">MY SPACE</p>${navItem("calendar", "학습 캘린더", "calendar")}`;
  const generalNavigation = `${navItem("home", "오늘의 학습", "home")}${navItem("words", "단어장", "book")}${navItem("sentence", "매일 1문장", "spark")}${navItem("news", "영어 뉴스", "news")}${navItem("ted", "TED 학습", "mic")}${navItem("test", "Daily Test", "check")}${navItem("quiz", "매일 토익 풀기", "message")}<p class="nav-label space">MY SPACE</p>${navItem("journal", "나만의 학습장", "check")}${navItem("calendar", "학습 캘린더", "calendar")}${navItem("blog", "최애 블로그", "heart")}`;
  const suneungNavigation = `${navItem("suneung-home", "오늘의 학습", "home")}${navItem("suneung-wordmaster", `${currentModeConfig().shortLabel} 단어장`, "book")}${navItem("suneung-passage", `오늘의 ${currentModeConfig().shortLabel} 지문`, "book-open")}${navItem("suneung-types", "유형별 훈련", "clipboard")}${navItem("suneung-vocab", "어휘 / 구문", "book")}<p class="nav-label space">TRUST</p>${navItem("suneung-policy", "출처 정책", "clipboard")}<p class="nav-label space">FAMILY</p>${navItem("suneung-parent", "부모 점검", "calendar")}`;
  return `<aside class="sidebar">
    <button class="brand" type="button" data-page="${isAcademicMode() ? "suneung-home" : "home"}" aria-label="ValueTime 메인 화면으로 이동"><span class="brand-mark">V</span><span class="brand-copy"><b>ValueTime</b><small>Small Steps Change the Future</small></span></button>
    <nav><p class="nav-label">${isAcademicMode() ? (audienceMode === "middle" ? "MIDDLE ENGLISH" : "CSAT ENGLISH") : "LEARN"}</p>${audienceMode === "kids" ? kidsNavigation : isAcademicMode() ? suneungNavigation : generalNavigation}</nav>
    <div class="sidebar-bottom"><div class="streak-card"><div class="streak-icon">${icon("flame")}</div><div><b>${audienceMode === "kids" ? `${childName}의 영어 탐험!` : isAcademicMode() ? `5일 연속 ${currentModeConfig().shortLabel} 루틴` : "12일 연속 학습 중!"}</b><span>${audienceMode === "kids" ? "오늘도 별을 모아봐요" : isAcademicMode() ? "이번 주 목표 5 / 7" : "이번 주도 멋져요"}</span></div></div><div class="profile"><span class="avatar">${audienceMode === "kids" ? childCallName() : audienceMode === "middle" ? "M" : currentLearningUser().slice(0, 1).toUpperCase()}</span><div><b>${audienceMode === "kids" ? childName : audienceMode === "middle" ? "중등 공용" : currentLearningUser()}</b><span>${audienceMode === "kids" ? "초등학교 4학년" : `${currentModeConfig().label} 학습자`}</span></div>${audienceMode === "kids" ? '<button type="button" data-kids-edit-name aria-label="학생 이름 변경">이름</button>' : audienceMode === "middle" ? "" : '<button type="button" data-user-change aria-label="학습자 변경">변경</button>'}</div></div>
  </aside>`;
}

function header(title = "오늘의 학습") {
  return `<header><button class="mobile-menu" aria-label="메뉴">${icon("menu")}</button><div class="header-title-block"><p class="eyebrow">${audienceMode === "kids" ? `${childName}의 오늘 영어` : isAcademicMode() ? currentModeConfig().eyebrow : "MONDAY, JULY 13"}</p><div class="header-title-row"><h1>${title}</h1></div></div><div class="header-actions"><div class="audience-mode-switch" role="group" aria-label="학습 트랙 선택"><span class="audience-mode-group primary"><button class="${audienceMode === "general" ? "active" : ""}" type="button" data-audience-mode="general">일반</button><button class="${audienceMode === "suneung" ? "active" : ""}" type="button" data-audience-mode="suneung">수능</button></span><span class="audience-mode-group school"><button class="${audienceMode === "kids" ? "active" : ""}" type="button" data-audience-mode="kids">초등</button><button class="${audienceMode === "middle" ? "active" : ""}" type="button" data-audience-mode="middle">중등</button></span></div>${isAcademicMode() ? "" : `<div class="learning-mode-switch" role="group" aria-label="학습 모드 선택"><button class="${learningMode === "default" ? "active" : ""}" type="button" data-learning-mode="default">Silent</button><button class="${learningMode === "speaking" ? "active" : ""}" type="button" data-learning-mode="speaking">${icon("mic",14)} Speaking</button></div>`}${["general", "suneung"].includes(audienceMode) ? `<button class="current-learner-button" type="button" data-user-change>${currentModeConfig().label} · ${currentLearningUser()}</button>` : ""}<div class="mini-streak">${icon("flame",18)} <b>${audienceMode === "kids" ? "★" : isAcademicMode() ? "5" : "12"}</b> ${audienceMode === "kids" ? "오늘의 별" : "day streak"}</div><button class="theme-toggle" type="button" data-theme-toggle aria-label="화면 모드 변경">${icon(currentTheme === "dark" ? "sun" : "moon",18)}</button><button class="avatar" type="button" ${["general", "suneung"].includes(audienceMode) ? 'data-user-change aria-label="학습자 변경"' : 'aria-label="현재 학습 모드"'}>${audienceMode === "kids" ? childCallName() : audienceMode === "middle" ? "M" : currentLearningUser().slice(0, 1).toUpperCase()}</button></div></header>`;
}

function homeQuickLinks() {
  if (audienceMode !== "general") return "";
  const links = [
    { className: "quick-drama", label: "매일미드한문장", badge: "SHORTS", href: "https://www.youtube.com/@Englishlamp2024/shorts", page: "shorts", aria: "매일미드한문장 YouTube 쇼츠 채널 새 창에서 열기" },
    { className: "quick-rc", label: "매일 토익 RC 풀기", badge: "RC", href: "https://www.hackers.co.kr/?c=s_toeic/toeic_study/drc", page: "quiz", aria: "해커스 매일 토익 RC 풀기 새 창에서 열기" },
    { className: "quick-ted", label: "TED 바로가기", badge: "TED", page: "ted", aria: "TED 학습 바로가기" },
    { className: "quick-bbc", label: "BBC Learning", badge: "BBC", href: "https://www.bbc.co.uk/learningenglish/english/course/towards-advanced", page: "news", aria: "BBC Learning English Towards Advanced 새 창에서 열기" },
  ];
  return `<section class="home-quick-links" aria-label="학습 보조 링크"><span>${icon("spark", 14)} 추천 학습 링크</span><div>${links.map(link => link.href ? `<a class="${link.className}" href="${link.href}" target="_blank" rel="noopener noreferrer" aria-label="${link.aria}" data-related-page="${link.page}"><em>${link.badge}</em><b>${link.label}</b>${icon("arrow", 13)}</a>` : `<button class="${link.className}" type="button" data-page="${link.page}" aria-label="${link.aria}" data-related-page="${link.page}"><em>${link.badge}</em><b>${link.label}</b>${icon("arrow", 13)}</button>`).join("")}</div></section>`;
}

function checklist(date = state.selectedDate) {
  const completed = state.history[date] || [];
  const label = date === "2026-07-13" ? "오늘" : `${Number(date.slice(5,7))}월 ${Number(date.slice(8))}일`;
  const doneSummary = completed.length
    ? completed.map(key => key === "word" ? "단어 10개" : key === "sentence" ? "문장 1개" : key === "drama" ? "미드 대사 3개" : "기사 1편").join(" · ")
    : "아직 완료한 학습 단위가 없습니다.";
  return `<section class="panel checklist-panel"><div class="panel-head"><div><p class="eyebrow">COMPLETION LOG</p><h2>${label}에 완료한 학습</h2></div><span class="count-pill">${completed.length}개 단위 완료</span></div>
  <p class="calendar-completion-summary">${doneSummary}</p>
  <div class="check-items">${Object.entries(CATEGORIES).map(([key, c]) => `<button class="check-row ${completed.includes(key) ? "done" : ""}" data-check="${key}" data-date="${date}"><span class="custom-check">${completed.includes(key) ? icon("check",15) : ""}</span><span class="check-copy"><b>${c.label}</b><small>${key === "word" ? "단어 10개 완료" : key === "sentence" ? "문장 1개 학습" : key === "drama" ? "미드 대사 카드 3개" : "기사 1편 읽기"}</small></span><span class="go">${completed.includes(key) ? "완료" : "기록"} ${icon("chevron",15)}</span></button>`).join("")}</div>
  <div class="progress-meta"><span>완료한 학습 단위</span><b>${completed.length} / 4</b></div><div class="progress"><i style="width:${completed.length * 25}%"></i></div></section>`;
}

function wordCard(wordIndex = null, navigable = false) {
  const index = wordIndex === null ? new Date().getDate() % words.length : wordIndex;
  const word = words[index];
  const saved = state.savedWords.includes(word.word);
  const example = vocabNaturalExample(word, index);
  const exampleSourceUrl = example.exampleSourceUrl || word.sourceUrl;
  const exampleSourceLabel = example.exampleSource || word.source;
  return `<section class="word-card ${navigable ? "vocabulary-card" : ""}"><div class="word-top"><span class="soft-badge">${navigable ? `WORD ${index + 1} OF ${words.length}` : "WORD OF THE DAY"}</span><button class="save ${saved ? "saved" : ""}" data-save="${word.word}" aria-pressed="${saved}" aria-label="${word.word} 단어 ${saved ? "저장 취소" : "저장"}">${icon("bookmark")}</button></div><div class="word-title"><h2>${word.word}</h2><button class="sound" data-speak="${word.word}">${icon("volume",19)}</button></div><p class="phonetic">${vocabPhonetic(word)} <span>${word.type}</span></p><button class="vocab-meaning-cover word-meaning-cover" type="button" data-vocab-meaning-toggle aria-expanded="false"><span>뜻 보기</span><strong>${example.meaningHtml}</strong></button><p class="definition">${word.definition}</p><div class="example"><b>“${example.en}”</b><span>${example.ko}</span></div><a class="word-source" href="${exampleSourceUrl}" target="_blank" rel="noopener noreferrer" aria-label="${word.word} 예문 출처 새 창에서 열기"><span>예문 출처</span><b>${exampleSourceLabel}</b>${icon("arrow",14)}</a>${navigable ? `<div class="word-navigation"><button data-word-nav="-1" aria-label="이전 단어">${icon("arrow",19)} <span>이전 단어</span></button><div>${words.map((_,i)=>`<i class="${i===index?"active":""}"></i>`).join("")}</div><button data-word-nav="1" aria-label="다음 단어"><span>다음 단어</span> ${icon("arrow",19)}</button></div>` : `<button class="text-link" data-page="words">단어 더 학습하기 ${icon("arrow",16)}</button>`}</section>`;
}

// 한 페이지 안에서 같은 첫 글자가 몰리지 않도록 알파벳별 묶음을 균형 있게 섞습니다.
// 고정 시드를 사용하므로 새로고침해도 페이지별 단어 구성은 그대로 유지됩니다.
function getMixedVocabularyWords() {
  const bucketMap = new Map();
  words.forEach(word => {
    const initial = (word.word.match(/[a-z]/i)?.[0] || "#").toUpperCase();
    if (!bucketMap.has(initial)) bucketMap.set(initial, []);
    bucketMap.get(initial).push(word);
  });

  const initialOrder = seededShuffle([...bucketMap.keys()], "value-time-vocab-initials-v1");
  const orderRank = new Map(initialOrder.map((initial, index) => [initial, index]));
  const buckets = initialOrder.map(initial => ({
    initial,
    items: seededShuffle(bucketMap.get(initial), `value-time-vocab-${initial}-v1`),
  }));
  const mixed = [];

  while (mixed.length < words.length) {
    const pageInitials = new Set();
    const page = [];
    while (page.length < 10 && mixed.length + page.length < words.length) {
      const candidates = buckets
        .filter(bucket => bucket.items.length && !pageInitials.has(bucket.initial))
        .sort((a, b) => b.items.length - a.items.length || orderRank.get(a.initial) - orderRank.get(b.initial));
      const fallback = buckets
        .filter(bucket => bucket.items.length)
        .sort((a, b) => b.items.length - a.items.length || orderRank.get(a.initial) - orderRank.get(b.initial));
      const selected = candidates[0] || fallback[0];
      if (!selected) break;
      page.push(selected.items.shift());
      pageInitials.add(selected.initial);
    }
    mixed.push(...page);
  }
  return mixed;
}

// Daily-test state is initialized before this section and calls
// getTodayVocabWords(). Use a lazily initialized binding so that call does not
// hit the temporal dead zone while the module is still being evaluated.
var mixedVocabularyWords = getMixedVocabularyWords();

function getDailyOrderedVocabularyWords(dateKey = localDateKey()) {
  mixedVocabularyWords ||= getMixedVocabularyWords();
  const pageSize = 10;
  const baseWords = mixedVocabularyWords.filter(word => word?.word);
  const pageCount = Math.ceil(baseWords.length / pageSize);
  const dailyStart = getDailyVocabPageIndex(pageCount, dateKey) * pageSize;
  return [...baseWords.slice(dailyStart), ...baseWords.slice(0, dailyStart)];
}

function getTodayVocabWords(dateKey = localDateKey()) {
  const pageSize = 10;
  return getDailyOrderedVocabularyWords(dateKey).slice(0, pageSize);
}

function vocabPhonetic(word) {
  const raw = String(word.phonetic || "").trim();
  if (raw) return raw.startsWith("/") || raw.startsWith("[") ? raw : `/${raw}/`;
  return `/${String(word.word || "").toLowerCase()}/`;
}

function vocabPartHint(word) {
  const term = String(word.word || "").toLowerCase();
  const meaning = String(word.meaning || "");
  const primaryMeaning = meaning.split(/[;,/]/)[0].trim();
  const dictionaryParts = vocabularyPartOfSpeech[term] || [];
  if (dictionaryParts.length === 1 && ["noun", "verb", "adjective", "adverb"].includes(dictionaryParts[0])) return dictionaryParts[0];
  const explicitPart = String(word.partOfSpeech || word.pos || "").toLowerCase();
  if (/adverb|부사/.test(explicitPart) || /ly$/.test(term)) return "adverb";
  if (/adjective|형용사/.test(explicitPart) || /(able|ible|ive|al|ous|ful|less|ent|ant|ic|ary|ory|ior)$/.test(term) || /(한|적인|있는|없는|로운|스러운|같은)$/.test(primaryMeaning)) return "adjective";
  if (/verb|동사/.test(explicitPart) || meaning.includes("하다") || meaning.includes("시키다") || meaning.includes("되다") || (dictionaryParts.includes("verb") && /다$/.test(primaryMeaning))) return "verb";
  if (/noun|명사/.test(explicitPart)) return "noun";
  if (dictionaryParts.includes("noun")) return "noun";
  if (/(tion|sion|ment|ity|ness|ance|ence|cy|ship|ism|er|or)$/.test(term)) return "noun";
  return "noun";
}

function vocabStableIndex(value, length) {
  if (!length) return 0;
  const hash = [...String(value || "")].reduce((result, char) => ((result * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
  return hash % length;
}

function firstNonEmptyVocabValue(...values) {
  return values.find(value => typeof value === "string" && value.trim())?.trim() || "";
}

function vocabKoreanModifier(value) {
  const meaning = String(value || "").trim();
  if (/스럽다$/.test(meaning)) return meaning.replace(/스럽다$/, "스러운");
  if (/롭다$/.test(meaning)) return meaning.replace(/롭다$/, "로운");
  if (/하다$/.test(meaning)) return meaning.replace(/하다$/, "한");
  if (/있다$/.test(meaning)) return meaning.replace(/있다$/, "있는");
  if (/없다$/.test(meaning)) return meaning.replace(/없다$/, "없는");
  return meaning;
}

function typeLabel(value = "") {
  if (Array.isArray(value)) return value.map(typeLabel).filter(Boolean).join(" / ");
  const raw = String(value).trim();
  if (raw.includes("/")) return raw.split("/").map(typeLabel).filter(Boolean).join(" / ");
  const part = raw.toLowerCase();
  if (part === "noun" || part === "명사") return "noun";
  if (part === "verb" || part === "동사") return "verb";
  if (part === "adjective" || part === "형용사") return "adjective";
  if (part === "adverb" || part === "부사") return "adverb";
  if (part === "conjunction" || part === "접속사") return "conjunction";
  return value || "품사 미분류";
}

function vocabNaturalExampleLegacy(word, seed = 0) {
  const term = String(word?.word || "").trim().toLowerCase();
  const meaning = String(word?.meaning || "핵심 뜻").split(/[;,/]/)[0].trim();
  const part = vocabPartHint(word);
  const safeTerm = term || "word";
  const verbMeaning = meaning.endsWith("다") ? `${meaning.slice(0, -1)}기` : meaning;
  const verbDirective = meaning.endsWith("다") ? `${meaning.slice(0, -1)}도록` : `${meaning}하도록`;
  const adjectiveMeaning = vocabKoreanModifier(meaning);
  const mark = sentence => String(sentence || "This vocabulary item is commonly used in English.").replace(new RegExp(`\\b${safeTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), match => `<mark>${match}</mark>`);
  const generic = !word.example || /^The meaning of "/.test(word.example);
  if (!generic) {
    return { en: mark(word.example), ko: word.translation || `이 문장은 ${meaning}에 관한 내용을 설명합니다.` };
  }
  const verbTemplates = [
    { en: `Researchers try to ${term} the results before they publish the report.`, ko: `연구자들은 보고서를 발표하기 전에 결과를 ${verbMeaning} 위해 노력한다.` },
    { en: `Students learn to ${term} key ideas when they read a difficult passage.`, ko: `학생들은 어려운 지문을 읽을 때 핵심 아이디어를 ${verbMeaning} 위한 방법을 배운다.` },
    { en: `The manager asked the team to ${term} the plan before Friday.`, ko: `관리자는 팀에 금요일 전까지 계획을 ${verbDirective} 요청했다.` },
    { en: `Writers often ${term} complex ideas with clear examples.`, ko: `작가들은 명확한 예시를 통해 복잡한 생각을 ${verbMeaning}도 한다.` },
  ];
  const adjectiveTemplates = [
    { en: `The teacher gave a ${term} explanation that everyone could understand.`, ko: `선생님은 모두가 이해할 수 있는 ${adjectiveMeaning} 설명을 해 주었다.` },
    { en: `A ${term} decision can change the direction of the whole project.`, ko: `${adjectiveMeaning} 결정은 전체 프로젝트의 방향을 바꿀 수 있다.` },
    { en: `Her ${term} answer helped the group solve the problem.`, ko: `그녀의 ${adjectiveMeaning} 답변은 그 모임이 문제를 해결하는 데 도움이 되었다.` },
    { en: `The article describes a ${term} change in modern society.`, ko: `그 기사는 현대 사회의 ${adjectiveMeaning} 변화를 설명한다.` },
  ];
  const adverbTemplates = [
    { en: `The team responded ${term} when the situation changed.`, ko: `상황이 바뀌자 팀은 ${meaning} 방식으로 대응했다.` },
    { en: `She explained the main idea ${term} during the presentation.`, ko: `그녀는 발표 중에 핵심 아이디어를 ${meaning} 방식으로 설명했다.` },
    { en: `The process moved ${term} after the new system was introduced.`, ko: `새 시스템이 도입된 후 과정은 ${meaning} 방식으로 진행되었다.` },
    { en: `Students used the expression ${term} in their discussion.`, ko: `학생들은 토론에서 그 표현을 ${meaning} 방식으로 사용했다.` },
  ];
  const nounTemplates = [
    { en: `The ${term} became the main topic of the class discussion.`, ko: `그 ${meaning}은 수업 토론의 주요 주제가 되었다.` },
    { en: `The article explains why the ${term} is important in daily life.`, ko: `그 기사는 왜 ${meaning}이 일상생활에서 중요한지 설명한다.` },
    { en: `A clear understanding of the ${term} helped students answer the question.`, ko: `${meaning}에 대한 명확한 이해는 학생들이 질문에 답하는 데 도움이 되었다.` },
    { en: `Many people noticed the ${term} after reading the report.`, ko: `많은 사람들이 보고서를 읽은 후 그 ${meaning}을 알아차렸다.` },
  ];
  const pool = part === "verb" ? verbTemplates : part === "adjective" ? adjectiveTemplates : part === "adverb" ? adverbTemplates : nounTemplates;
  const selected = pool[vocabStableIndex(`${safeTerm}-${seed}`, pool.length)] || { en: `The word ${safeTerm} is useful in this context.`, ko: `이 문맥에서는 ${meaning}이라는 표현이 유용하다.` };
  return {
    en: mark(selected.en),
    ko: selected.ko,
  };
}

const VOCAB_CURATED_EXAMPLES = {
  cognitive: {
    partOfSpeech: "adjective",
    meaning: "인지의, 인지적인",
    exampleSentence: "Reading puzzles can improve children's cognitive skills.",
    exampleTranslation: "독서 퍼즐은 아이들의 인지 능력을 향상시킬 수 있다.",
    exampleSource: "curated",
  },
  alloy: {
    partOfSpeech: "noun",
    meaning: "합금",
    exampleSentence: "This bike frame is made from a light aluminum alloy.",
    exampleTranslation: "이 자전거 프레임은 가벼운 알루미늄 합금으로 만들어졌다.",
    exampleSource: "curated",
  },
  shift: {
    partOfSpeech: "noun",
    meaning: "변화, 전환",
    exampleSentence: "There was a sudden shift in the weather this afternoon.",
    exampleTranslation: "오늘 오후 날씨에 갑작스러운 변화가 있었다.",
    exampleSource: "curated",
  },
  parallel: {
    partOfSpeech: "adjective",
    meaning: "평행한",
    exampleSentence: "The two roads run parallel to each other.",
    exampleTranslation: "그 두 도로는 서로 평행하게 이어진다.",
    exampleSource: "curated",
  },
  eventual: {
    partOfSpeech: "adjective",
    meaning: "결국의, 최종적인",
    exampleSentence: "Her eventual success came after years of steady practice.",
    exampleTranslation: "그녀의 최종적인 성공은 수년간의 꾸준한 연습 끝에 찾아왔다.",
    exampleSource: "curated",
  },
  diagnosis: {
    partOfSpeech: "noun",
    meaning: "진단",
    exampleSentence: "The doctor made a diagnosis after reviewing the test results.",
    exampleTranslation: "의사는 검사 결과를 검토한 뒤 진단을 내렸다.",
    exampleSource: "curated",
  },
};

function isGenericVocabExample(example = "") {
  const value = String(example || "").trim();
  return !value
    || /^The meaning of "/i.test(value)
    || /\bis useful in this sentence\b/i.test(value)
    || /\bis a word\b/i.test(value)
    || /^I like\s+\w+\.?$/i.test(value)
    || /^Example unavailable\.?$/i.test(value);
}

function vocabMeaningGroups(word, fallbackMeaning = "") {
  const term = String(word?.word || "").trim().toLowerCase();
  const storedGroups = vocabularyExamples[term]?.meanings || {};
  const dictionaryParts = vocabularyPartOfSpeech[term] || [];
  const labels = { noun: "명사", verb: "동사", adjective: "형용사", adverb: "부사", conjunction: "접속사" };
  const preferredOrder = ["noun", "verb", "adjective", "adverb", "conjunction"];
  const fallbackMeanings = [...new Set(String(word?.meaning || fallbackMeaning || "").split(/[;,/]/).map(value => value.trim()).filter(Boolean))].slice(0, 3);
  const availableParts = new Set([...dictionaryParts, ...Object.keys(storedGroups)]);
  const groups = preferredOrder.filter(partOfSpeech => availableParts.has(partOfSpeech)).map(partOfSpeech => {
    const storedMeanings = [...new Set((storedGroups[partOfSpeech] || []).map(value => String(value || "").trim()).filter(Boolean))].slice(0, 3);
    return {
      partOfSpeech,
      label: labels[partOfSpeech],
      meanings: storedMeanings.length ? storedMeanings : fallbackMeanings.length ? fallbackMeanings : [fallbackMeaning].filter(Boolean),
      supplemented: !storedMeanings.length,
    };
  }).filter(group => group.meanings.length);
  if (groups.length) return groups;
  return [{ partOfSpeech: vocabPartHint(word), label: labels[vocabPartHint(word)] || "뜻", meanings: [fallbackMeaning || word?.meaning || "뜻 정보 없음"] }];
}

function renderVocabMeaningGroups(groups = []) {
  return `<dl class="vocab-meaning-groups" aria-label="품사별 단어 뜻">${groups.filter(group => group.meanings.length).map(group => `<div class="vocab-meaning-row"><dt>${group.label}</dt><dd>${group.meanings.join(" · ")}</dd></div>`).join("")}</dl>`;
}

function vocabNaturalExample(word, seed = 0) {
  const term = String(word?.word || "").trim().toLowerCase();
  const dictionaryPartOfSpeech = vocabularyPartOfSpeech[term] || [];
  const naverEntry = vocabularyExamples[term];
  const naverExamples = Array.isArray(naverEntry?.examples) ? naverEntry.examples : [];
  const preferredPartOfSpeech = vocabPartHint(word);
  const matchingNaverExamples = naverExamples.filter(example => example?.partOfSpeech === preferredPartOfSpeech);
  const selectableNaverExamples = matchingNaverExamples.length ? matchingNaverExamples : naverExamples;
  const naverExample = selectableNaverExamples[vocabStableIndex(`${term}-${seed}`, selectableNaverExamples.length)];
  const curated = VOCAB_CURATED_EXAMPLES[term];
  const storedCandidates = [word?.exampleSentence, word?.usageExample, word?.sentence, word?.sampleSentence, word?.example];
  const storedSentence = firstNonEmptyVocabValue(...storedCandidates.filter(value => !isGenericVocabExample(value)));
  const generated = !naverExample?.exampleSentence && !curated?.exampleSentence && !storedSentence ? vocabNaturalExampleLegacy(word, seed) : null;
  const sentence = firstNonEmptyVocabValue(naverExample?.exampleSentence, curated?.exampleSentence, storedSentence, generated?.en);
  const storedTranslation = firstNonEmptyVocabValue(word?.exampleTranslation, word?.sentenceTranslation, word?.usageTranslation);
  const translation = firstNonEmptyVocabValue(naverExample?.exampleTranslation, curated?.exampleTranslation, storedTranslation, storedSentence ? word?.translation : "", generated?.ko);
  const safeTerm = term || String(word?.word || "").trim();
  const storedPartOfSpeech = firstNonEmptyVocabValue(word?.partOfSpeech, word?.pos, /^(noun|verb|adjective|adverb|명사|동사|형용사|부사)$/i.test(String(word?.type || "").trim()) ? word.type : "");
  const mark = value => {
    const raw = String(value || "").trim();
    if (!raw || !safeTerm) return raw;
    const escaped = safeTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return raw.replace(new RegExp(`\\b${escaped}\\b`, "i"), match => `<mark>${match}</mark>`);
  };
  const resolvedMeaning = naverExample?.meaning || curated?.meaning || word?.meaning || "";
  const meaningGroups = vocabMeaningGroups(word, resolvedMeaning);

  return {
    ready: Boolean(sentence.trim()),
    partOfSpeech: typeLabel(dictionaryPartOfSpeech.length ? dictionaryPartOfSpeech : naverExample?.partOfSpeech || curated?.partOfSpeech || storedPartOfSpeech || vocabPartHint(word)),
    meaning: resolvedMeaning,
    meaningGroups,
    meaningHtml: renderVocabMeaningGroups(meaningGroups),
    en: generated ? generated.en : mark(sentence || `This vocabulary item appears in a short reading passage.`),
    ko: translation || "예문 해석을 불러오지 못했습니다.",
    exampleSource: naverExample ? naverEntry.source : curated?.exampleSource || "local fallback",
    exampleSourceUrl: naverExample ? naverEntry.sourceUrl : word?.sourceUrl || "",
  };
}

function vocabularyPage() {
  const vocabPageSize = 10;
  const todayKey = localDateKey();
  const dailyOrderVersion = "v2";
  const orderedWords = getDailyOrderedVocabularyWords(todayKey);
  const vocabPageCount = Math.ceil(orderedWords.length / vocabPageSize);
  if (
    profileStorage.getItem("value_time_vocab_daily_order_version") !== dailyOrderVersion
    || profileStorage.getItem("value_time_vocab_page_date") !== todayKey
  ) {
    state.vocabPage = 0;
    profileStorage.setItem("value_time_vocab_daily_order_version", dailyOrderVersion);
    profileStorage.setItem("value_time_vocab_page_date", todayKey);
    profileStorage.setItem("value_time_vocab_page", String(state.vocabPage));
  }
  state.vocabPage = Math.min(Math.max(state.vocabPage, 0), vocabPageCount - 1);
  const todayWords = orderedWords.slice(state.vocabPage * vocabPageSize, (state.vocabPage + 1) * vocabPageSize);
  const todayAllClearCount = todayWords.filter(word => state.knownWords.includes(word.word) && state.clearedWordSentences.includes(word.word)).length;
  const isDone = Boolean(homeStudyState.checked.words);
  const vocabMeta = syncHomeAppState().items.vocab || {};
  const typeLabel = type => ({ verb: "동사", adjective: "형용사", "verb / noun": "동사 / 명사" }[type] || type);
  const vocabPageGroupSize = 10;
  const vocabPageGroupStart = Math.floor(state.vocabPage / vocabPageGroupSize) * vocabPageGroupSize;
  const visibleVocabPages = Array.from(
    { length: Math.min(vocabPageGroupSize, vocabPageCount - vocabPageGroupStart) },
    (_, index) => vocabPageGroupStart + index
  );

  return `${header("단어장")}<main class="vocab-dashboard-page">
    <div class="vocab-dashboard-layout">
      <section class="vocab-today-panel"><div class="vocab-panel-head"><div><h3>오늘의 단어</h3><p>단어와 예문을 각각 Clear하고 ALL CLEAR를 완성해보세요.</p></div><b>${todayWords.length} WORDS · <span data-vocab-clear-count>${todayAllClearCount}</span> ALL CLEAR</b></div>
        <div class="vocab-today-list">${todayWords.map(word => {
          const saved = state.savedWords.includes(word.word);
          const known = state.knownWords.includes(word.word);
          const sentenceClear = state.clearedWordSentences.includes(word.word);
          const allClear = known && sentenceClear;
          const example = vocabNaturalExample(word, state.vocabPage);
          const exampleSourceUrl = example.exampleSourceUrl || word.sourceUrl;
          const exampleSourceLabel = example.exampleSource || word.source;
          word.type = example.partOfSpeech;
          return `<article class="vocab-today-item ${known ? "known" : ""} ${sentenceClear ? "sentence-cleared" : ""} ${allClear ? "all-clear" : ""}"><div class="vocab-today-top"><div><h4>${word.word}</h4><button type="button" data-speak="${word.word}" aria-label="${word.word} 발음 듣기">${icon("volume",17)}</button><span class="vocab-phonetic">${vocabPhonetic(word)}</span></div><div class="vocab-card-actions"><em>${typeLabel(word.type)}</em><button class="vocab-known-toggle ${known ? "active" : ""}" type="button" data-known-word="${word.word}" aria-pressed="${known}" aria-label="${word.word} Word Clear ${known ? "해제" : "완료"}">${icon("check",14)} <span>Word Clear</span></button><button class="save ${saved ? "saved" : ""}" type="button" data-save="${word.word}" aria-pressed="${saved}" aria-label="${word.word} 단어 ${saved ? "저장 취소" : "저장"}">${icon("bookmark",18)}</button></div></div><span class="vocab-known-chip">${icon("check",12)} <span data-vocab-clear-label>${allClear ? "ALL CLEAR" : known ? "WORD CLEAR" : "SENTENCE CLEAR"}</span></span><button class="vocab-meaning-cover" type="button" data-vocab-meaning-toggle aria-expanded="false"><span>뜻 보기</span><strong>${example.meaningHtml}</strong></button><p>${word.definition}</p><blockquote class="${example.ready ? "" : "vocab-example-empty"}"><b>${example.en}</b><span>${example.ko}</span><button class="vocab-sentence-clear ${sentenceClear ? "active" : ""}" type="button" data-clear-word-sentence="${word.word}" aria-pressed="${sentenceClear}" aria-label="${word.word} 예문 Sentence Clear ${sentenceClear ? "해제" : "완료"}">${icon("check",13)} Sentence Clear</button></blockquote><a href="${exampleSourceUrl}" target="_blank" rel="noopener noreferrer">예문 출처 · ${exampleSourceLabel} ${icon("arrow",12)}</a></article>`;
        }).join("")}</div>
        <nav class="vocab-page-navigation" aria-label="단어 목록 페이지 이동">
          <button class="vocab-page-edge" type="button" data-vocab-target="0" ${state.vocabPage === 0 ? "disabled" : ""} aria-label="첫 페이지로 이동">&laquo;</button>
          <button class="vocab-page-edge" type="button" data-vocab-target="${Math.max(0, state.vocabPage - 1)}" ${state.vocabPage === 0 ? "disabled" : ""} aria-label="이전 페이지로 이동">&lsaquo;</button>
          <span class="vocab-page-numbers">${visibleVocabPages.map(pageIndex => `<button class="${pageIndex === state.vocabPage ? "active" : ""}" type="button" data-vocab-target="${pageIndex}" ${pageIndex === state.vocabPage ? 'aria-current="page"' : ""}>${pageIndex + 1}</button>`).join("")}</span>
          <button class="vocab-page-edge" type="button" data-vocab-target="${Math.min(vocabPageCount - 1, state.vocabPage + 1)}" ${state.vocabPage === vocabPageCount - 1 ? "disabled" : ""} aria-label="다음 페이지로 이동">&rsaquo;</button>
          <button class="vocab-page-edge" type="button" data-vocab-target="${vocabPageCount - 1}" ${state.vocabPage === vocabPageCount - 1 ? "disabled" : ""} aria-label="마지막 페이지로 이동">&raquo;</button>
          <small>${state.vocabPage + 1} / ${vocabPageCount} 페이지</small>
        </nav>
      </section>
      <aside class="vocab-dashboard-side">
        <section class="vocab-status-card"><span class="vocab-side-icon">${icon("calendar",18)}</span><div><h3>학습 상태</h3><b class="vocab-status-badge ${isDone ? "done" : "todo"}">${isDone ? icon("check",12) : ""}${isDone ? "완료됨" : "진행 전"}</b><p>${vocabMeta.lastStudiedAt ? `최근 학습 · ${vocabMeta.lastStudiedAt}` : "최근 학습 기록 없음"}</p></div></section>
        <section><span class="vocab-side-icon">${icon("spark",18)}</span><div><h3>학습 팁</h3><p>뜻만 외우기보다 예문까지 함께 읽으면 실제 사용 감각을 더 빠르게 익힐 수 있어요.</p></div></section>
        <section><span class="vocab-side-icon">${icon("check",18)}</span><div><h3>오늘의 루틴</h3><ol><li>단어 ${todayWords.length}개 소리 내어 읽기</li><li>뜻과 품사 확인하기</li><li>예문 한 번 따라 읽기</li></ol></div></section>
        <section class="vocab-saved-summary"><div><p class="eyebrow">MY WORDS</p><h3>저장한 단어</h3><strong>${state.savedWords.length}</strong><span>개를 모았어요</span></div><div>${state.savedWords.length ? state.savedWords.slice(-5).map(word => `<button type="button" data-speak="${word}" title="${word} 발음 듣기">${word} ${icon("volume",11)}</button>`).join("") : `<p>카드의 북마크를 눌러<br>단어를 저장해보세요.</p>`}</div></section>
        <section class="vocab-complete-box"><button class="primary ${isDone ? "done" : ""}" type="button" disabled>${icon("check",17)} ${isDone ? "오늘 학습 완료됨" : "10개 완료 시 자동 완료"}</button><button class="secondary" type="button" data-vocab-undo ${!isDone ? "disabled" : ""}>완료 해제</button><p aria-live="polite">${isDone ? "단어 10개 학습이 완료되어 자동으로 저장되었습니다." : "10개 단어를 ALL CLEAR하면 오늘 학습이 자동 완료됩니다."}</p></section>
      </aside>
    </div>
  </main>`;
}

function miniNews() { const n = newsArticles[0]; return `<section class="news-card"><div class="news-visual"><span>${n.source}</span><div class="city-art">✦</div></div><div class="news-content"><div><span class="category">${n.tag}</span><span class="dot">•</span><span>${n.read}</span></div><h2>${n.title}</h2><p>${n.summary}</p><button class="text-link" data-open-news="0">기사 읽고 학습하기 ${icon("arrow",16)}</button></div></section>`; }

function homeTedCard() {
  const lesson = getDailyTedLesson();
  if (!lesson) return "";
  const thumbnail = makeYouTubeThumbnailUrl(lesson.videoId);
  return `<section class="home-ted-section" aria-labelledby="home-ted-title">
    <div class="home-ted-heading"><div><p class="eyebrow">CURRENT TED COURSE</p><h3 id="home-ted-title">진행 중인 TED 학습</h3></div><span>전체 문장 완료까지 한 강연 집중</span></div>
    <button class="home-ted-card" type="button" data-open-ted="${lesson.id}" aria-label="${lesson.title} TED 학습 상세 페이지로 이동">
      <span class="home-ted-thumbnail"><img src="${thumbnail}" alt="${lesson.title} 영상 썸네일" loading="lazy"><i>${icon("play", 23)}</i><em>TODAY</em></span>
      <span class="home-ted-copy"><small>TED · ${lesson.speaker}</small><strong>${lesson.title}</strong><span>${lesson.description}</span><b>${lesson.duration} · ${lesson.level} <i>학습 시작 ${icon("arrow", 15)}</i></b></span>
    </button>
  </section>`;
}

function quizSummaryStats() {
  const solvedCount = Object.keys(quizState.solvedMap || {}).length;
  const correctCount = Object.values(quizState.solvedMap || {}).filter(result => result.correct).length;
  const accuracy = solvedCount ? Math.round((correctCount / solvedCount) * 100) : null;
  return {
    solvedCount,
    correctCount,
    accuracy,
    reviewNeeded: (quizState.wrongSet?.length || 0) + (quizState.bookmarkSet?.length || 0),
    weakType: quizState.wrongSet?.length ? (quizState.questions[quizState.wrongSet[0]]?.type || "오답 유형") : "문맥 추론",
  };
}

function dailyTestSummaryStats() {
  const scores = dailyTestState.scores || emptyTestScores();
  const solved = scores.rcTotal + scores.vocabTotal + scores.sentenceTotal;
  const correct = scores.rcCorrect + scores.vocabCorrect + scores.sentenceCorrect;
  return { solved, correct, accuracy: solved ? Math.round((correct / solved) * 100) : null };
}

function silentHomeCardDetails(item, isDone, itemMeta) {
  const quiz = quizSummaryStats();
  const test = dailyTestSummaryStats();
  const wrongNotes = getWrongNotes();
  const dailyReviewCount = Object.values(wrongNotes).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
  const status = isDone
    ? "오늘 완료됨"
    : itemMeta.lastStudiedAt
      ? `최근 학습 ${itemMeta.lastStudiedAt}`
      : "아직 시작하지 않았어요";
  const emptyScore = item.id === "quiz" || item.id === "test" ? "최근 풀이 기록 없음" : "완료 기록 대기";
  const score = itemMeta.score !== null && itemMeta.score !== undefined ? `최근 결과 ${itemMeta.score}` : emptyScore;
  const map = {
    words: {
      unit: `오늘 단어 ${getTodayVocabWords().length}개`,
      review: state.savedWords.length ? `저장 단어 ${state.savedWords.length}개 복습 가능` : "저장 단어를 만들어보세요",
      reason: "매일 1페이지가 새로 갱신돼요",
    },
    sentence: {
      unit: "오늘의 핵심 문장 1개",
      review: state.savedSentences.length ? `저장 문장 ${state.savedSentences.length}개` : "복습 문장 저장 가능",
      reason: "한 문장만 Clear해도 완료",
    },
    news: {
      unit: "오늘 확인할 기사 1개",
      review: "핵심 표현 3개 확인",
      reason: "실제 문장 감각 유지",
    },
    ted: {
      unit: "강연 핵심 문장 5개",
      review: "표현 카드 3개",
      reason: "긴 문장 구조 익히기",
    },
    test: {
      unit: "오늘 학습 기반 3문항",
      review: test.accuracy === null ? "단어 / 문장 / 문법 복습 포함" : `오늘 정답률 ${test.accuracy}%`,
      reason: dailyReviewCount ? `복습할 오답 ${dailyReviewCount}개 있음` : "빠르게 오늘 내용 확인",
    },
    quiz: {
      unit: "오늘 추천 문제 3개",
      review: "문법 + 짧은 독해 포함",
      reason: quiz.reviewNeeded ? `오답/북마크 ${quiz.reviewNeeded}개 복습 필요` : `최근 약한 유형: ${quiz.weakType}`,
    },
  };
  return { ...(map[item.id] || {}), status, score };
}

function silentHomeCoach(homeAppState, completed) {
  const pending = homeStudyItems.filter(item => !homeStudyState.checked[item.id]).slice(0, 2);
  const quiz = quizSummaryStats();
  const test = dailyTestSummaryStats();
  const reviewText = quiz.reviewNeeded
    ? `매일 토익 풀기 오답/북마크 ${quiz.reviewNeeded}개`
    : state.savedWords.length
      ? `저장 단어 ${state.savedWords.length}개`
      : "오늘 단어 10개";
  const weakText = quiz.reviewNeeded
    ? `최근 약한 유형: ${quiz.weakType}`
    : test.accuracy !== null
      ? `Daily Test 정답률 ${test.accuracy}%`
      : "아직 약점 데이터가 부족해요";
  const doneText = completed >= 3 ? "오늘 흐름이 좋습니다. 남은 항목은 복습 중심으로 가볍게 마무리하세요." : "짧게 하나만 더 끝내면 오늘 학습 흐름이 이어집니다.";
  return {
    pending,
    reviewText,
    weakText,
    doneText,
    totalSaved: state.savedWords.length + state.savedSentences.length,
  };
}

function dailyDramaSentenceCard() {
  const item = familyShortSamples[Math.abs(dateSeed(localDateKey())) % familyShortSamples.length];
  const sentence = item.sentence.trim();
  const shortsUrl = "https://www.youtube.com/@Englishlamp2024/shorts";
  const links = [[shortsUrl, "play", "쇼츠 바로가기"]];
  return `<section class="home-drama-sentence" aria-label="오늘의 영어 한 문장"><div class="home-drama-copy"><span>DAILY SCENE ENGLISH</span><blockquote>“${escapeMarkup(sentence)}”</blockquote><strong>${escapeMarkup(item.meaningKo)}</strong><p>${escapeMarkup(item.situation)}</p><div><button type="button" data-speak="${escapeMarkup(sentence)}">${icon("mic", 15)} 문장 듣고 따라 말하기</button></div></div><nav aria-label="오늘의 미드 문장 관련 학습 링크">${links.map(([href, linkIcon, label]) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${icon(linkIcon, 14)} <span>${label}</span>${icon("arrow", 12)}</a>`).join("")}</nav></section>`;
}

function homePage() {
  // 자정이 지난 뒤 열린 탭에서도 오늘 날짜의 체크리스트가 보이도록 갱신합니다.
  if (homeStudyState.date !== localDateKey()) {
    homeStudyState = { date: localDateKey(), checked: {} };
    saveHomeStudyState();
  }
  const homeAppState = syncHomeAppState();
  const completed = homeStudyItems.filter(item => homeStudyState.checked[item.id]).length;
  const progress = Math.round((completed / homeStudyItems.length) * 100);
  const isSilentMode = learningMode !== "speaking";
  const silentCoach = silentHomeCoach(homeAppState, completed);
  const todayLabel = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(new Date());
  const encouragement = completed === homeStudyItems.length
    ? "오늘의 학습을 모두 마쳤어요. 정말 멋진 하루예요!"
    : completed >= 3
      ? "절반 이상 완료했어요. 조금만 더 힘내볼까요?"
      : completed > 0
        ? "좋은 시작이에요. 한 걸음씩 이어가 보세요."
        : "가볍게 하나부터 시작해 보세요. 오늘도 충분히 잘할 수 있어요.";
  const speakingMission = learningMode === "speaking" ? `<section class="speaking-home-mission" aria-labelledby="speaking-mission-title"><div><span>${icon("mic",18)} SPEAKING MODE</span><h2 id="speaking-mission-title">오늘의 영어를 소리 내어 말해보세요</h2><p>한 문장씩 듣고 따라 말한 뒤, 다시 듣거나 다음 문장으로 넘어가세요.</p></div><div><button type="button" data-page="ted">${icon("play",16)} 쉐도잉 시작</button><button type="button" data-page="sentence">핵심 문장 말하기 ${icon("arrow",14)}</button></div></section>` : "";

  return `${header()}<main class="home-dashboard-page">
  ${speakingMission}
  ${homeQuickLinks()}
  <div class="home-dashboard-layout">
    <section class="home-study-section" aria-labelledby="home-study-title"><div class="home-study-heading"><div><p class="eyebrow">DAILY ROUTINE</p><h3 id="home-study-title">오늘 무엇을 공부할까요?</h3></div><span>${completed} / ${homeStudyItems.length} 완료</span></div>
      <div class="home-study-grid">${homeStudyItems.map(item => {
        const isDone = Boolean(homeStudyState.checked[item.id]);
        const itemMeta = homeAppState.items[homeAppItemId(item.id)] || {};
        const details = silentHomeCardDetails(item, isDone, itemMeta);
        const timeText = itemMeta.lastStudiedAt ? `최근 학습 · ${itemMeta.lastStudiedAt}` : "최근 학습 기록 없음";
        const scoreText = itemMeta.score !== null && itemMeta.score !== undefined ? `점수 · ${itemMeta.score}` : "점수 기록 없음";
        return `<article class="home-study-card ${isDone ? "completed" : ""}" data-home-study-page="${item.page}" data-home-study-link="${item.link}" tabindex="0" role="link" aria-label="${item.title} 학습 화면으로 이동">
          <div class="home-study-card-top"><div><span class="home-study-number">${item.number}</span><span class="home-study-icon ${item.color}">${icon(item.icon, 22)}</span></div><button class="home-study-toggle" type="button" data-home-study-toggle="${item.id}" aria-pressed="${isDone}" aria-label="${item.title} ${isDone ? "완료 취소" : "완료 표시"}">${icon("check", 15)}</button></div>
          <span class="home-study-done-chip">${icon("check", 11)} 완료된 학습</span><h4>${item.title}</h4>
          ${isSilentMode ? `<div class="home-card-microplan"><span>${details.unit}</span><span>${details.review}</span><span>${details.reason}</span></div>` : ""}
          <div class="home-study-card-bottom"><span>${isDone ? "복습 이어하기" : item.cta || "학습하러 가기"} ${icon("arrow", 15)}</span><em>${item.tag}</em></div>
          <div class="home-study-meta"><span>${icon("calendar",11)} ${isSilentMode ? details.status : timeText}</span><span>${icon("check",11)} ${isSilentMode ? details.score : scoreText}</span></div>
        </article>`;
      }).join("")}</div>
    </section>
    <aside class="home-dashboard-side"><section class="home-progress-card" aria-labelledby="home-progress-title">
      <p class="eyebrow">${isSilentMode ? "TODAY'S COACH" : "TODAY'S PROGRESS"}</p><div class="home-progress-title"><h3 id="home-progress-title">${isSilentMode ? "오늘의 학습 코치" : "오늘의 학습 체크"}</h3><strong>${completed}<small> / ${homeStudyItems.length}</small></strong></div><p class="home-progress-desc">${isSilentMode ? "완료한 항목과 바로 이어갈 복습을 기준으로 다음 행동을 제안합니다." : "완료 여부와 오늘의 전체 달성률을 한눈에 확인해보세요."}</p>
      <div class="home-progress-track" role="progressbar" aria-label="오늘의 학습 진도" aria-valuemin="0" aria-valuemax="${homeStudyItems.length}" aria-valuenow="${completed}"><i style="width:${progress}%"></i></div><span class="home-progress-percent">${progress}% 완료</span>
      ${isSilentMode ? `<div class="home-coach-box"><b>다음 추천</b>${silentCoach.pending.length ? silentCoach.pending.map(item => `<button type="button" data-page="${item.page}">${item.title} · ${item.cta || "시작"} ${icon("arrow", 12)}</button>`).join("") : `<span>오늘 주요 학습을 모두 끝냈어요.</span>`}<b>복습 필요</b><p>${silentCoach.reviewText}</p><b>약점 신호</b><p>${silentCoach.weakText}</p></div>` : ""}
      <ul>${homeStudyItems.map(item => `<li class="${homeStudyState.checked[item.id] ? "done" : ""}"><i>${homeStudyState.checked[item.id] ? icon("check", 12) : ""}</i><span>${item.number}. ${item.title}</span><em>${homeStudyState.checked[item.id] ? "완료" : "진행 전"}</em></li>`).join("")}</ul>
      <p class="home-progress-message">${isSilentMode ? silentCoach.doneText : encouragement}</p><button class="home-progress-reset" type="button" data-home-study-reset>오늘의 체크 초기화</button>
    </section></aside>
  </div>${homeTedCard()}</main>`;
}

function tedStudyPage() {
  const eligible = getEligibleTedLessons();
  const lesson = eligible.find(item => item.id === state.tedLessonId) || getDailyTedLesson();
  if (!lesson) return `${header("오늘의 TED 학습")}<main class="ted-study-page"><section class="ted-empty"><h2>오늘 준비된 TED 영상이 없습니다.</h2><p>자막과 학습 스크립트가 준비된 영상을 운영 목록에 등록해 주세요.</p><button type="button" data-page="home">메인으로 돌아가기</button></section></main>`;
  const suppliedTranscript = parseTedTranscript(lesson.transcriptRaw || "");
  const transcriptLines = getTedTranscriptLines(lesson);
  const dailySentences = getDailyTedStudySentences(lesson, transcriptLines);
  const dailyExpressions = getDailyTedExpressions(dailySentences);
  const masteredSourceIndexes = getTedMasteredSourceIndexes(lesson.id);
  const courseComplete = masteredSourceIndexes.length >= transcriptLines.length;
  const embedUrl = makeYouTubeEmbedUrl(lesson.videoId);
  state.tedSentenceIndex = Math.max(0, Math.min(state.tedSentenceIndex, dailySentences.length - 1));
  const sentenceIndex = state.tedSentenceIndex;
  const sentence = dailySentences[sentenceIndex];
  const completedSentences = dailySentences.map((item, index) => masteredSourceIndexes.includes(item.sourceIndex) ? index : null).filter(Number.isInteger);
  const isSentenceComplete = completedSentences.includes(sentenceIndex);
  const completedCount = completedSentences.filter(index => index < dailySentences.length).length;
  const sentenceProgress = Math.round((completedCount / dailySentences.length) * 100);
  const speakingModeBadge = learningMode === "speaking" ? `<div class="ted-speaking-goal"><span>${icon("mic",15)} SPEAKING MODE</span><b>오늘의 목표: 핵심 5문장을 듣고 직접 말하기</b><small>듣기 → 따라 말하기 → 다시 듣기 → 완료</small></div>` : "";

  return `${header("오늘의 TED 학습")}<main class="ted-study-page">
    <div class="ted-study-toolbar"><button type="button" data-ted-back>${icon("chevron", 15)} 오늘의 학습으로</button><span>${lesson.scheduledDate} 등록 · 전체 문장 완료까지 고정</span></div>
    ${speakingModeBadge}
    <section class="ted-hero-card">
      <div class="ted-video-wrap"><iframe src="${embedUrl}?rel=0" title="TED: ${lesson.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
      <aside class="ted-live-transcript" aria-labelledby="ted-live-title"><div class="ted-live-head"><div><p>TED DAILY LESSON</p><h2 id="ted-live-title">전체 학습 문장</h2></div><span>등록 문장 ${transcriptLines.length.toLocaleString()}개</span></div><div class="ted-talk-title"><strong>${lesson.title}</strong><small>${lesson.speaker} · ${lesson.duration} · ${lesson.level} · 영상과 별도로 자유롭게 스크롤하세요.</small></div>
        <ol>${transcriptLines.map((line, index) => {
          const isClear = masteredSourceIndexes.includes(index);
          return `<li><article class="ted-transcript-line ${isClear ? "clear" : ""}" data-ted-transcript-card="${index}"><span>${String(index + 1).padStart(2, "0")}</span><div><b>${line.en}</b><small>${line.ko || (line.time ? `원문 구간 ${line.time}` : "")}</small><div class="ted-transcript-actions"><button class="ted-transcript-play" type="button" data-speak="${line.en.replaceAll('"', '&quot;')}" aria-label="${index + 1}번 문장 듣기">${icon("volume", 12)} 듣기</button><button class="ted-transcript-clear ${isClear ? "active" : ""}" type="button" data-ted-transcript-clear="${index}" aria-pressed="${isClear}">${icon("check", 12)} ${isClear ? "Clear 완료" : "Clear"}</button></div></div></article></li>`;
        }).join("")}</ol>
        <footer><span>${suppliedTranscript.length ? "사용자가 제공한 전체 스크립트를 문장 단위로 표시합니다." : "강연 내용을 바탕으로 재구성한 개인 학습용 문장입니다."}</span><a href="${lesson.transcriptUrl}" target="_blank" rel="noopener noreferrer">TED 공식 전체 스크립트 ${icon("arrow", 13)}</a></footer>
      </aside>
    </section>
    <div class="ted-learning-layout">
      <section class="ted-script-panel ted-step-panel" data-ted-step-panel><div class="ted-section-heading"><div><p class="eyebrow">DAILY 5 SENTENCES</p><h3>오늘의 문장 5개</h3></div><span data-ted-position>${sentenceIndex + 1} / ${dailySentences.length} · 원문 ${sentence.sourceIndex + 1}번</span></div>
        <p class="ted-content-note">${courseComplete ? "전체 스크립트를 모두 클리어했습니다. 새로운 TED 영상과 스크립트를 등록할 준비가 되었어요." : "우측 전체 스크립트에서 완료하지 않은 문장을 순서대로 매일 5개 가져옵니다."} 전체 진도 <b>${masteredSourceIndexes.length} / ${transcriptLines.length}</b></p>
        <div class="ted-step-progress"><div><span>오늘의 5문장 진행률</span><b data-ted-progress-count>${completedCount} / ${dailySentences.length} 완료</b></div><div data-ted-progressbar role="progressbar" aria-label="TED 문장 학습 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${sentenceProgress}"><i data-ted-progress-fill style="width:${sentenceProgress}%"></i></div><ol data-ted-step-dots aria-label="문장별 완료 상태">${dailySentences.map((_, index) => `<li class="${completedSentences.includes(index) ? "done" : ""} ${index === sentenceIndex ? "current" : ""}">${completedSentences.includes(index) ? icon("check", 11) : index + 1}</li>`).join("")}</ol></div>
        <article class="ted-focus-sentence ${isSentenceComplete ? "complete" : ""}" data-ted-focus>
          <div class="ted-focus-label"><span data-ted-sentence-label>오늘 ${sentenceIndex + 1}번 · 원문 ${sentence.sourceIndex + 1}번${sentence.time ? ` · ${sentence.time}` : ""}</span><b data-ted-clear-status>${isSentenceComplete ? `${icon("check", 13)} 클리어 완료` : "학습 중"}</b></div>
          <p data-ted-focus-en>${sentence.en}</p>
          <button class="ted-listen-button" type="button" data-ted-focus-listen data-speak="${sentence.en.replaceAll('"', '&quot;')}" aria-label="현재 영어 문장 듣기">${icon("volume", 17)} 문장 듣기</button>
          ${learningMode === "speaking" ? `<div class="ted-speaking-controls" aria-label="말하기 재생 설정"><span>재생 속도</span><button class="${speakingSpeed === 0.8 ? "active" : ""}" type="button" data-speaking-speed="0.8">0.8×</button><button class="${speakingSpeed === 1 ? "active" : ""}" type="button" data-speaking-speed="1">1.0×</button><button type="button" data-speaking-replay="${sentence.en.replaceAll('"', '&quot;')}">${icon("volume",14)} Repeat aloud</button></div>` : ""}
          <button class="ted-meaning-toggle ${state.tedMeaningOpen ? "active" : ""}" type="button" data-ted-meaning-toggle aria-expanded="${state.tedMeaningOpen}">${state.tedMeaningOpen ? "뜻 숨기기" : "뜻 보기"} ${icon("chevron", 13)}</button>
          <div class="ted-focus-translation" data-ted-meaning-panel ${state.tedMeaningOpen ? "" : "hidden"}><span>문장 뜻</span><strong data-ted-focus-ko>${sentence.ko || "제공된 영어 원문을 의미 단위로 끊어 직접 해석해 보세요."}</strong></div>
          <div class="ted-shadowing-guide"><span>1. 문장을 듣고 의미를 확인하세요.</span><span>2. 화면을 보며 천천히 따라 말하세요.</span><span>3. 화면을 덜 보고 자연스럽게 말해보세요.</span></div>
        </article>
        <div class="ted-step-actions">
          <button type="button" data-ted-sentence-prev ${sentenceIndex === 0 ? "disabled" : ""}>${icon("arrow", 15)} 이전 문장</button>
          <button class="ted-clear-button ${isSentenceComplete ? "completed" : ""}" type="button" data-ted-sentence-clear>${icon("check", 16)} ${isSentenceComplete ? (learningMode === "speaking" ? "말하기 완료" : "클리어 완료") : (learningMode === "speaking" ? "I said it" : "이 문장 클리어")}</button>
          <button type="button" data-ted-sentence-next ${sentenceIndex >= dailySentences.length - 1 || !isSentenceComplete ? "disabled" : ""}>다음 문장 ${icon("arrow", 15)}</button>
        </div>
        <p class="ted-step-message" data-ted-step-message aria-live="polite">${courseComplete ? `전체 ${transcriptLines.length}문장을 모두 클리어했어요! 새로운 TED 영상을 등록할 수 있습니다.` : completedCount === dailySentences.length ? "오늘의 5문장을 모두 클리어했어요! 다음 학습일에는 미완료 문장부터 이어집니다." : isSentenceComplete ? "잘했어요. 이제 다음 문장으로 넘어갈 수 있어요." : "충분히 듣고 따라 말한 뒤 클리어 버튼을 눌러주세요."}</p>
      </section>
      <aside class="ted-expression-panel"><div class="ted-section-heading"><div><p class="eyebrow">KEY EXPRESSIONS</p><h3>오늘의 5문장 핵심 표현</h3></div><span>자동 선택 3개</span></div>
        <div>${dailyExpressions.map((item, index) => {
          const expressionKey = `${lesson.id}:${index}:${item.term}`;
          const expressionDone = speakingExpressionDone.includes(expressionKey);
          return `<article class="${expressionDone ? "expression-clear-done" : ""}"><span>${index + 1}</span><h4>${item.term}</h4><p>${item.meaning}</p><small>${item.example}</small><button type="button" data-speak="${item.term.replaceAll('"', '&quot;')}" aria-label="${item.term} 발음 듣기">${icon("volume", 14)}</button>${learningMode === "speaking" ? `<div class="expression-speaking-actions"><button type="button" data-speaking-replay="${item.example.replaceAll('"', '&quot;')}">${icon("volume",12)} 예문 듣기</button><button type="button" data-speaking-repeat="${item.example.replaceAll('"', '&quot;')}">3회 반복</button></div>` : ""}<div class="ted-expression-clear-actions"><button class="${expressionDone ? "active" : ""}" type="button" data-ted-expression-clear="${expressionKey.replaceAll('"', '&quot;')}" aria-pressed="${expressionDone}">${icon("check",12)} ${expressionDone ? "Clear 완료" : "Clear"}</button></div></article>`;
        }).join("")}</div>
        <section class="ted-routine"><b>${icon("check", 16)} 추천 학습 루틴</b><p>영상 1회 시청 → 스크립트 확인 → 문장별 쉐도잉 3회 → 핵심 표현 복습</p></section>
      </aside>
    </div>
  </main>`;
}

// iframe은 그대로 둔 채 문장 학습 영역만 갱신합니다.
// 이전·다음 이동 중에도 YouTube 재생 위치와 플레이어 상태가 유지됩니다.
function updateTedSentenceStepView(lesson) {
  const panel = document.querySelector("[data-ted-step-panel]");
  const dailySentences = getDailyTedStudySentences(lesson);
  if (!panel || !dailySentences.length) return;

  state.tedSentenceIndex = Math.max(0, Math.min(state.tedSentenceIndex, dailySentences.length - 1));
  const index = state.tedSentenceIndex;
  const sentence = dailySentences[index];
  const masteredSourceIndexes = getTedMasteredSourceIndexes(lesson.id);
  const transcriptLength = getTedTranscriptLines(lesson).length;
  const courseComplete = masteredSourceIndexes.length >= transcriptLength;
  const completed = dailySentences.map((item, sentenceIndex) => masteredSourceIndexes.includes(item.sourceIndex) ? sentenceIndex : null).filter(Number.isInteger);
  const isComplete = completed.includes(index);
  const completedCount = completed.filter(sentenceIndex => sentenceIndex < dailySentences.length).length;
  const progress = Math.round((completedCount / dailySentences.length) * 100);

  panel.querySelector("[data-ted-position]").textContent = `${index + 1} / ${dailySentences.length} · 원문 ${sentence.sourceIndex + 1}번`;
  panel.querySelector("[data-ted-progress-count]").textContent = `${completedCount} / ${dailySentences.length} 완료`;
  panel.querySelector("[data-ted-progressbar]").setAttribute("aria-valuenow", String(progress));
  panel.querySelector("[data-ted-progress-fill]").style.width = `${progress}%`;
  panel.querySelector("[data-ted-step-dots]").innerHTML = dailySentences.map((_, sentenceIndex) =>
    `<li class="${completed.includes(sentenceIndex) ? "done" : ""} ${sentenceIndex === index ? "current" : ""}">${completed.includes(sentenceIndex) ? icon("check", 11) : sentenceIndex + 1}</li>`
  ).join("");

  const focusCard = panel.querySelector("[data-ted-focus]");
  focusCard.classList.toggle("complete", isComplete);
  panel.querySelector("[data-ted-sentence-label]").textContent = `오늘 ${index + 1}번 · 원문 ${sentence.sourceIndex + 1}번${sentence.time ? ` · ${sentence.time}` : ""}`;
  panel.querySelector("[data-ted-clear-status]").innerHTML = isComplete ? `${icon("check", 13)} 클리어 완료` : "학습 중";
  panel.querySelector("[data-ted-focus-en]").textContent = sentence.en;
  panel.querySelector("[data-ted-focus-ko]").textContent = sentence.ko || "제공된 영어 원문을 의미 단위로 끊어 직접 해석해 보세요.";
  state.tedMeaningOpen = false;
  const meaningToggle = panel.querySelector("[data-ted-meaning-toggle]");
  const meaningPanel = panel.querySelector("[data-ted-meaning-panel]");
  if (meaningToggle) {
    meaningToggle.classList.remove("active");
    meaningToggle.setAttribute("aria-expanded", "false");
    meaningToggle.innerHTML = `뜻 보기 ${icon("chevron", 13)}`;
  }
  if (meaningPanel) meaningPanel.hidden = true;
  const listenButton = panel.querySelector("[data-ted-focus-listen]");
  listenButton.dataset.speak = sentence.en;
  listenButton.setAttribute("aria-label", `${index + 1}번 영어 문장 듣기`);
  const replayButton = panel.querySelector("[data-speaking-replay]");
  if (replayButton) replayButton.dataset.speakingReplay = sentence.en;

  const previousButton = panel.querySelector("[data-ted-sentence-prev]");
  const nextButton = panel.querySelector("[data-ted-sentence-next]");
  const clearButton = panel.querySelector("[data-ted-sentence-clear]");
  previousButton.disabled = index === 0;
  nextButton.disabled = index >= dailySentences.length - 1 || !isComplete;
  clearButton.classList.toggle("completed", isComplete);
  clearButton.innerHTML = `${icon("check", 16)} ${isComplete ? (learningMode === "speaking" ? "말하기 완료" : "클리어 완료") : (learningMode === "speaking" ? "I said it" : "이 문장 클리어")}`;
  panel.querySelector("[data-ted-step-message]").textContent = courseComplete
    ? `전체 ${transcriptLength}문장을 모두 클리어했어요! 새로운 TED 영상을 등록할 수 있습니다.`
    : completedCount === dailySentences.length
      ? "오늘의 5문장을 모두 클리어했어요! 다음 학습일에는 미완료 문장부터 이어집니다."
    : isComplete
      ? "잘했어요. 이제 다음 문장으로 넘어갈 수 있어요."
      : "충분히 듣고 따라 말한 뒤 클리어 버튼을 눌러주세요.";
}

function calendarPage() {
  const y = state.calendarYear, m = state.calendarMonth;
  const first = new Date(y,m,1).getDay(), days = new Date(y,m+1,0).getDate();
  const cells = Array(first).fill("").concat(Array.from({length:days},(_,i)=>i+1));
  const monthKeys = Array.from({ length: days }, (_, index) => `${y}-${String(m + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`);
  const monthDoneDays = monthKeys.filter(key => (state.history[key] || []).length).length;
  const monthDoneUnits = monthKeys.reduce((sum, key) => sum + (state.history[key] || []).length, 0);
  return `${header("학습 캘린더")}<main class="calendar-page"><div class="calendar-compact-legend"><span>완료 단위 기록</span><div class="legend">${Object.entries(CATEGORIES).map(([k,c])=>`<span><i class="${k}">${c.short}</i>${c.label}</span>`).join("")}</div></div><section class="calendar-month-summary"><article><b>${monthDoneDays}</b><span>이번 달 학습한 날</span></article><article><b>${monthDoneUnits}</b><span>누적 완료 단위</span></article><article><b>${state.savedWords.length + state.savedSentences.length}</b><span>복습 저장 항목</span></article></section><div class="calendar-layout"><section class="calendar-panel panel"><div class="calendar-head"><button data-month="-1">‹</button><h2>${y}년 ${m+1}월</h2><button data-month="1">›</button></div><div class="weekdays">${["일","월","화","수","목","금","토"].map(x=>`<span>${x}</span>`).join("")}</div><div class="calendar-grid">${cells.map(d=>{if(!d)return `<div class="day empty"></div>`; const key=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, done=state.history[key]||[]; return `<button class="day ${key===state.selectedDate?"selected":""} ${key===localDateKey()?"today":""}" data-date="${key}"><b>${d}</b><small>${done.length ? `${done.length}개 완료` : ""}</small><div class="day-checks">${Object.entries(CATEGORIES).map(([k,c])=>`<i class="${k} ${done.includes(k)?"done":""}">${done.includes(k)?icon("check",10):c.short}</i>`).join("")}</div></button>`}).join("")}</div></section>${checklist(state.selectedDate)}</div></main>`;
}

function newsPage() {
  if (state.newsIndex !== null) return articleView();
  const isDone = Boolean(homeStudyState.checked.news);
  const newsMeta = syncHomeAppState().items.news || {};
  const todayKey = localDateKey();
  const dailyArticle = getDailyNewsArticle(todayKey) || articleLibrary[0];
  const dailyArticleIndex = articleLibrary.findIndex(article => article.id === dailyArticle.id);
  const dailySentence = dailyArticle.sentences[0];
  const dailyBodyParagraphs = getArticleBodyParagraphs(dailyArticle);
  const dailyStudyDate = formatNewsStudyDate(todayKey);
  const categories = [...new Set(articleLibrary.map(article => article.category))];
  const keyword = state.newsSearch.trim().toLowerCase();
  const articles = articleLibrary
    .filter(article => (state.newsCategory === "all" || article.category === state.newsCategory) && (!keyword || [article.title, article.dek, article.category, ...article.summary].join(" ").toLowerCase().includes(keyword)))
    .sort((a, b) => state.newsSort === "title" ? a.title.localeCompare(b.title) : state.newsSort === "category" ? a.category.localeCompare(b.category) || b.dateOrder.localeCompare(a.dateOrder) : b.dateOrder.localeCompare(a.dateOrder));

  return `${header("영어 뉴스")}<main class="news-library-page">
    <section class="news-library-shell">
      <section class="news-daily-study" aria-labelledby="daily-news-title">
        <article class="news-daily-article">
          <figure class="news-daily-visual"><img src="${dailyArticle.image}" alt="${dailyArticle.title} 기사 주제를 나타내는 대표 이미지"><figcaption><span>DAILY NEWS</span><time datetime="${todayKey}">${dailyStudyDate}</time></figcaption></figure>
          <div class="news-daily-label"><span>${dailyArticle.source} · ${dailyArticle.category}</span><button type="button" data-speak="${dailySentence.en.replaceAll('"', '&quot;')}" aria-label="오늘의 뉴스 핵심 문장 듣기">${icon("volume",16)} 문장 듣기</button></div>
          <h3 id="daily-news-title">${dailyArticle.title}</h3><p class="news-daily-dek">${dailyArticle.dek}</p>
          ${dailyBodyParagraphs.length ? `<section class="news-daily-body" aria-labelledby="daily-news-body-title"><header><div><span>FULL ARTICLE</span><h4 id="daily-news-body-title">기사 본문 · 영문 기사 읽기</h4></div><b>전체 ${dailyBodyParagraphs.length}문단</b></header><div>${dailyBodyParagraphs.map((paragraph, index) => `<article><span>PARAGRAPH ${String(index + 1).padStart(2, "0")}</span><p>${paragraph.text}</p>${paragraph.translation ? `<div class="news-daily-sentence-tools"><details><summary>이 문단 해석 보기</summary><p>${paragraph.translation}</p></details></div>` : ""}</article>`).join("")}</div></section>` : `<section class="news-daily-body news-daily-body-missing" aria-labelledby="daily-news-body-title"><header><div><span>SOURCE DATA REQUIRED</span><h4 id="daily-news-body-title">기사 원문 본문이 등록되지 않았습니다</h4></div><b>원문 0문단</b></header><div><p>현재 보유한 데이터는 기사 제목·요약과 학습용 재구성 문장뿐입니다. 이 문장들을 실제 기사 본문으로 표시하지 않습니다.</p><a href="${dailyArticle.originalUrl}" target="_blank" rel="noopener noreferrer">출처에서 원문 확인 ${icon("arrow", 13)}</a></div></section>`}
          <section class="news-daily-focus" aria-labelledby="daily-news-support-title"><span>LEARNING SUPPORT · 본문을 읽은 뒤 확인하세요</span><h4 id="daily-news-support-title">대표 문장과 학습 포인트</h4><blockquote>${dailySentence.en}</blockquote><div class="news-daily-focus-grid"><article><b>대표 문장 해석</b><p>${dailySentence.ko}</p></article><article><b>핵심 표현</b><div>${dailySentence.expressions.slice(0, 3).map(expression => `<span><strong>${expression.term}</strong> ${expression.meaning}</span>`).join("")}</div></article><article><b>학습 포인트</b><p>${dailySentence.note}</p></article></div></section>
          <div class="news-daily-actions"><span>기사 등록일 · ${dailyArticle.date}</span><button type="button" data-open-news="${dailyArticleIndex}">전체 기사 학습하기 ${icon("arrow",15)}</button></div>
        </article>
        <aside class="news-daily-guide"><section class="news-status-card"><span>${icon("calendar",18)}</span><div><h3>학습 상태</h3><b class="news-status-badge ${isDone ? "done" : "todo"}">${isDone ? icon("check",12) : ""}${isDone ? "완료됨" : "진행 전"}</b><p>${newsMeta.lastStudiedAt ? `최근 학습 · ${newsMeta.lastStudiedAt}` : "최근 학습 기록 없음"}</p></div></section><section><span>${icon("news",18)}</span><div><h3>읽기 팁</h3><p>모든 문장을 완벽히 이해하기보다 핵심 동사와 주제를 먼저 잡아보세요.</p></div></section><section><span>${icon("check",18)}</span><div><h3>추천 루틴</h3><p>기사 읽기 → 필요한 단락 해석 → 표현 확인 → 1분 퀴즈</p></div></section><section class="news-complete-box"><button class="primary ${isDone ? "done" : ""}" type="button" disabled>${icon("check",17)} ${isDone ? "오늘의 기사 완료됨" : "읽기 + 퀴즈로 자동 완료"}</button><button class="secondary" type="button" data-news-undo ${!isDone ? "disabled" : ""}>완료 해제</button><p aria-live="polite">${isDone ? "읽기와 퀴즈 기록이 저장되었습니다." : "본문을 읽고 퀴즈 3문제 이상 맞히면 완료됩니다."}</p></section></aside>
      </section>
      <div class="news-library-section-title"><div><p class="eyebrow">MORE ARTICLES</p><h3>더 많은 기사 학습하기</h3></div><div class="news-library-title-actions"><span>검색과 필터로 원하는 기사를 찾아보세요.</span><button type="button" data-news-import>${icon("news",14)} 개인 원문 가져오기</button></div></div>
      <div class="news-library-controls">
        <label><span class="sr-only">기사 검색</span><input type="search" data-news-search value="${state.newsSearch}" placeholder="제목, 요약, 카테고리 검색"></label>
        <label><span class="sr-only">카테고리 선택</span><select data-news-category><option value="all">전체 카테고리</option>${categories.map(category => `<option value="${category}" ${state.newsCategory === category ? "selected" : ""}>${category}</option>`).join("")}</select></label>
        <label><span class="sr-only">정렬 기준</span><select data-news-sort><option value="latest" ${state.newsSort === "latest" ? "selected" : ""}>최신순</option><option value="title" ${state.newsSort === "title" ? "selected" : ""}>제목순</option><option value="category" ${state.newsSort === "category" ? "selected" : ""}>카테고리순</option></select></label>
      </div>
      ${articles.length ? `<div class="news-library-grid">${articles.map(article => { const originalIndex = articleLibrary.findIndex(item => item.id === article.id); return `<article class="news-library-card" data-open-news="${originalIndex}"><img src="${article.image}" alt="${article.title}" loading="lazy"><div><p><span>${article.source}</span><b>${article.category}</b><time>${article.date}</time></p><h3>${article.title}</h3><em>${article.dek}</em><footer><span>학습 문장 ${article.sentences.length}개</span><button type="button">기사 열기 ${icon("arrow",15)}</button></footer></div></article>`; }).join("")}</div><div class="news-library-empty" data-news-live-empty hidden><b>조건에 맞는 기사가 없습니다.</b><span>검색어 또는 카테고리를 다시 조정해 주세요.</span></div>` : `<div class="news-library-empty"><b>조건에 맞는 기사가 없습니다.</b><span>검색어 또는 카테고리를 다시 조정해 주세요.</span></div>`}
    </section>
    <p class="source-note">※ 실제 원문의 제목·날짜·상세 링크를 확인했으며, 요약과 학습 문장은 기사 내용을 바탕으로 재구성했습니다.</p>
  </main>`;
}

function articleView() {
  return featuredArticleView();
}

function buildLocalNewsReviewQuestions(article, sentence, sentenceIndex) {
  const sentenceId = `${article.id}_s${String(sentenceIndex + 1).padStart(2, "0")}`;
  const seed = `${sentenceId}-${localDateKey()}`;
  const expression = sentence.expressions[0] || { term: "핵심 표현", meaning: sentence.note };
  const expressionMeanings = [...new Set(articleLibrary.flatMap(item => item.sentences.flatMap(line => line.expressions.map(entry => entry.meaning))).filter(Boolean))];
  const wordChoices = seededShuffle([expression.meaning, ...seededShuffle(expressionMeanings.filter(value => value !== expression.meaning), `${seed}-word-pool`).slice(0, 3)], `${seed}-word-choices`).slice(0, 4);
  const sentenceMeanings = [...new Set(articleLibrary.flatMap(item => item.sentences.map(line => line.ko)).filter(Boolean))];
  const sentenceChoices = seededShuffle([sentence.ko, ...seededShuffle(sentenceMeanings.filter(value => value !== sentence.ko), `${seed}-sentence-pool`).slice(0, 3)], `${seed}-sentence-choices`).slice(0, 4);
  const wordTypes = ["context_meaning", "nuance", "role_in_sentence", "relation_effect", "paraphrase"];
  const sentenceTypes = ["main_idea", "detail_check", "tone_attitude", "structure", "inference", "paraphrase_sentence"];
  const wordType = wordTypes[Math.abs(dateSeed(`${seed}-word`)) % wordTypes.length];
  const sentenceType = sentenceTypes[Math.abs(dateSeed(`${seed}-sentence`)) % sentenceTypes.length];
  return [{ id: `${sentenceId}:word`, type: "단어형", questionType: wordType, targetExpression: expression.term, question: `이 문장에서 ‘${expression.term}’이 전달하는 의미로 가장 적절한 것은?`, choices: wordChoices, answer: wordChoices.indexOf(expression.meaning), explanation: `‘${expression.term}’은 이 문맥에서 ‘${expression.meaning}’라는 의미로 쓰였습니다.`, hint: "표현 앞뒤의 대상과 의미의 방향이 긍정적인지 부정적인지 살펴보세요." }, { id: `${sentenceId}:sentence`, type: "문장형", questionType: sentenceType, question: "이 문장이 실제로 전달하는 핵심 내용으로 가장 적절한 것은?", choices: sentenceChoices, answer: sentenceChoices.indexOf(sentence.ko), explanation: `${sentence.note} 따라서 문장의 핵심은 ‘${sentence.ko}’입니다.`, hint: "주어가 무엇을 했는지와 조동사·부정 표현이 나타내는 강도를 함께 보세요." }];
}

function localNewsReviewPanel(article, sentence, sentenceIndex) {
  const questions = buildLocalNewsReviewQuestions(article, sentence, sentenceIndex);
  const questionIndex = Math.min(newsReviewState.questionIndex, questions.length - 1);
  const question = questions[questionIndex];
  const selectedAnswer = newsReviewState.answers[question.id];
  const answered = Number.isInteger(selectedAnswer);
  const correct = answered && selectedAnswer === question.answer;
  return `<section class="local-news-review"><header><div><span>LOCAL REVIEW · ${questionIndex + 1} / ${questions.length}</span><h3>${question.type} 문맥 이해</h3></div><em>${question.questionType}</em></header><p class="local-news-review-sentence">${sentence.en}</p>${question.targetExpression ? `<b class="local-news-review-target">TARGET · ${question.targetExpression}</b>` : ""}<h4>${question.question}</h4><div class="local-news-review-choices">${question.choices.map((choice, index) => `<button class="${answered && index === question.answer ? "correct" : ""} ${answered && index === selectedAnswer && index !== question.answer ? "wrong" : ""}" type="button" data-local-news-answer="${index}" ${answered ? "disabled" : ""}><i>${String.fromCharCode(65 + index)}</i><span>${choice}</span></button>`).join("")}</div><p class="local-news-review-hint">힌트 · ${question.hint}</p>${answered ? `<div class="local-news-review-result ${correct ? "success" : "error"}"><b>${correct ? "정답입니다." : "정답을 확인해보세요."}</b><p>${question.explanation}</p></div><button class="local-news-review-next" type="button" data-local-news-next>${questionIndex < questions.length - 1 ? "다음 문장형 문제" : "단어형부터 다시 보기"}</button>` : ""}</section>`;
}

function saveNewsArticleLearningState() {
  try { profileStorage.setItem(NEWS_ARTICLE_LEARNING_STORAGE_KEY, JSON.stringify(newsArticleLearningState)); } catch {}
}

function completeNewsArticleIfEligible(article) {
  const questions = buildArticleReviewQuestions(article);
  const score = questions.filter(question => newsArticleLearningState.quizAnswers[question.id] === question.answer).length;
  const bodyParagraphs = getArticleBodyParagraphs(article);
  const eligible = bodyParagraphs.length > 0 && newsArticleLearningState.readParagraphs.length >= bodyParagraphs.length && newsArticleLearningState.quizSubmitted && score >= 3;
  if (!eligible || homeStudyState.checked.news) return;
  homeStudyState.checked.news = true;
  saveHomeStudyState("news");
}

function buildArticleReviewQuestions(article) {
  const seed = `${article.id}-${localDateKey()}`;
  const firstSentence = article.sentences[0];
  const firstExpression = firstSentence.expressions[0];
  const meaningPool = [...new Set(articleLibrary.flatMap(item => item.sentences.flatMap(sentence => sentence.expressions.map(expression => expression.meaning))))].filter(value => value !== firstExpression.meaning);
  const translationPool = [...new Set(articleLibrary.flatMap(item => item.sentences.map(sentence => sentence.ko)))].filter(value => value !== firstSentence.ko);
  const summaryPool = [...new Set(articleLibrary.flatMap(item => item.summary))];
  const makeChoices = (answer, pool, key) => seededShuffle([answer, ...seededShuffle(pool.filter(value => value !== answer), `${seed}-${key}-pool`).slice(0, 3)], `${seed}-${key}-choices`).slice(0, 4);
  const definitions = [
    { type: "핵심 표현", question: `첫 단락에서 ‘${firstExpression.term}’이 나타내는 의미는?`, answerText: firstExpression.meaning, pool: meaningPool, explanation: `이 문맥에서 ‘${firstExpression.term}’은 ‘${firstExpression.meaning}’라는 의미입니다.` },
    { type: "단락 이해", question: "첫 번째 단락의 핵심 내용으로 가장 적절한 것은?", answerText: firstSentence.ko, pool: translationPool, explanation: firstSentence.note },
    { type: "기사 이해", question: "이 기사가 가장 중요하게 전달하는 내용은?", answerText: article.summary[0], pool: summaryPool, explanation: article.summary[0] },
    { type: "세부 내용", question: "기사의 세부 내용과 일치하는 것은?", answerText: article.summary[1] || article.summary[0], pool: summaryPool, explanation: article.summary[1] || article.summary[0] },
  ];
  return definitions.map((item, index) => { const choices = makeChoices(item.answerText, item.pool, index); return { ...item, id: `${article.id}:q${index}`, choices, answer: choices.indexOf(item.answerText) }; });
}

function featuredArticleView() {
  const article = articleLibrary[state.newsIndex] || articleLibrary[0];
  if (newsArticleLearningState.articleId !== article.id) newsArticleLearningState = { date: localDateKey(), articleId: article.id, readParagraphs: [], translations: [], expressions: [], difficult: article.personalBookmarks || [], notes: article.personalNotes || {}, savedArticles: newsArticleLearningState.savedArticles || [], quizAnswers: {}, quizSubmitted: false };
  const questions = buildArticleReviewQuestions(article);
  const bodyParagraphs = getArticleBodyParagraphs(article);
  const readCount = newsArticleLearningState.readParagraphs.length;
  const readingComplete = bodyParagraphs.length > 0 && readCount >= bodyParagraphs.length;
  const readProgress = bodyParagraphs.length ? Math.round(readCount / bodyParagraphs.length * 100) : 0;
  const score = questions.filter(question => newsArticleLearningState.quizAnswers[question.id] === question.answer).length;
  const quizPassed = newsArticleLearningState.quizSubmitted && score >= 3;
  const learningComplete = readingComplete && quizPassed;
  const keywords = [...new Set(article.sentences.flatMap(sentence => sentence.expressions.map(expression => expression.term)))].slice(0, 3);
  const paragraphs = bodyParagraphs.map((paragraph, index) => {
    const translationOpen = newsArticleLearningState.translations.includes(index);
    const difficult = newsArticleLearningState.difficult.includes(index);
    const personalNote = newsArticleLearningState.notes?.[index] || "";
    return `<section class="news-reader-paragraph ${difficult ? "difficult" : ""}" data-news-reader-paragraph="${index}"><span>PARAGRAPH ${String(index + 1).padStart(2, "0")}</span><p>${paragraph.text}</p><div class="news-reader-tools">${paragraph.translation ? `<button type="button" data-news-translation="${index}">${translationOpen ? "Hide Meaning" : "Show Meaning"}</button>` : ""}<button class="${difficult ? "active" : ""}" type="button" data-news-difficult="${index}">${icon(difficult ? "check" : "bookmark",11)} ${difficult ? "Difficult saved" : "Mark difficult"}</button></div>${translationOpen && paragraph.translation ? `<div class="news-reader-translation"><b>KOREAN MEANING</b><p>${paragraph.translation}</p></div>` : ""}${article.contentStatus === "personal_import" ? `<label class="news-personal-note"><span>MY NOTE</span><textarea data-news-note="${index}" placeholder="이 문단의 해석이나 표현을 메모하세요.">${escapeMarkup(personalNote)}</textarea></label>` : ""}</section>`;
  }).join("");
  const quiz = `<section class="news-reader-quiz"><header><div><span>QUICK REVIEW</span><h2>1분 뉴스 이해 퀴즈</h2><p>표현·단락·기사 전체 내용을 4문제로 확인합니다.</p></div><b>${questions.length} QUESTIONS</b></header><div>${questions.map((question, questionIndex) => { const selected = newsArticleLearningState.quizAnswers[question.id]; return `<fieldset><legend><small>${question.type}</small>${questionIndex + 1}. ${question.question}</legend>${question.choices.map((choice, choiceIndex) => `<button class="${selected === choiceIndex ? "selected" : ""} ${newsArticleLearningState.quizSubmitted && choiceIndex === question.answer ? "correct" : ""} ${newsArticleLearningState.quizSubmitted && selected === choiceIndex && choiceIndex !== question.answer ? "wrong" : ""}" type="button" data-news-quiz-answer="${question.id}:${choiceIndex}" ${newsArticleLearningState.quizSubmitted ? "disabled" : ""}><i>${String.fromCharCode(65 + choiceIndex)}</i>${choice}</button>`).join("")}${newsArticleLearningState.quizSubmitted ? `<p>${question.explanation}</p>` : ""}</fieldset>`; }).join("")}</div>${newsArticleLearningState.quizSubmitted ? `<section class="news-reader-result ${quizPassed ? "passed" : "retry"}"><strong>${score} / ${questions.length}</strong><div><b>${quizPassed ? "퀴즈 기준을 통과했어요!" : "한 번 더 확인해볼까요?"}</b><p>${learningComplete ? "오늘의 기사 학습이 자동 완료되었습니다." : quizPassed ? "본문을 끝까지 읽으면 학습이 완료됩니다." : "3문제 이상 맞히면 학습 완료 기준을 충족합니다."}</p></div>${!quizPassed ? `<button type="button" data-news-quiz-retry>다시 풀기</button>` : ""}</section>` : `<button class="news-reader-submit" type="button" data-news-quiz-submit>퀴즈 제출하기</button>`}</section>`;
  return `${header("영어 뉴스")}<main class="news-reader-page"><nav class="news-reader-toolbar"><button type="button" data-back-news>← 기사 목록</button><button type="button" data-copy-article-title>${icon("bookmark",14)} 제목 복사</button></nav><article class="news-reader"><figure><img src="${article.image}" alt="${article.title} 기사 대표 이미지"><figcaption>${article.caption}</figcaption></figure><header><span>TODAY'S ARTICLE</span><h1>${article.title}</h1><p>${article.dek}</p><div><b>${article.source}</b><time>${article.date}</time><em>중급</em><em>${bodyParagraphs.length ? `약 ${Math.max(4, bodyParagraphs.length * 2)}분` : "원문 미등록"}</em></div><ul>${keywords.map(keyword => `<li>#${keyword}</li>`).join("")}</ul></header>${bodyParagraphs.length ? `<section class="news-reader-progress"><div><span>${readingComplete ? "본문 읽기 완료" : `읽는 중 · ${readProgress}%`}</span><b>${readCount} / ${bodyParagraphs.length} 단락</b></div><div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${readProgress}"><i style="width:${readProgress}%"></i></div></section><div class="news-reader-body"><p class="news-reader-kicker">FULL ARTICLE</p>${paragraphs}</div>` : `<section class="news-reader-body news-reader-body-missing"><p class="news-reader-kicker">SOURCE DATA REQUIRED</p><h2>기사 원문 본문이 현재 데이터에 없습니다</h2><p>등록된 2개 문장은 원문이 아니라 학습용 재구성 문장이므로 본문으로 표시하지 않았습니다.</p><a href="${article.originalUrl}" target="_blank" rel="noopener noreferrer">출처에서 원문 확인 ${icon("arrow", 12)}</a></section>`}<section class="news-reader-summary"><span>LEARNING SUMMARY</span><h2>학습용 핵심 정리</h2>${article.summary.map(item => `<p>${item}</p>`).join("")}</section>${quiz}<section class="news-reader-completion ${learningComplete ? "complete" : "pending"}"><span>${learningComplete ? icon("check",19) : icon("spark",19)}</span><div><b>${learningComplete ? "오늘의 기사 완료!" : bodyParagraphs.length ? readingComplete ? "읽기 완료 · 퀴즈가 남았어요" : "기사를 읽고 학습을 마쳐보세요" : "원문 데이터 등록이 필요합니다"}</b><p>${learningComplete ? `퀴즈 ${score}/${questions.length} · 완료 기록 저장됨` : bodyParagraphs.length ? "본문 읽기와 퀴즈 3문제 이상 정답이 완료 기준입니다." : "원문 본문이 등록된 기사만 읽기 완료 처리할 수 있습니다."}</p></div></section><footer><p>제목·날짜·출처 링크는 실제 기사 정보이며, 요약과 학습 문장은 기사 내용을 바탕으로 재구성했습니다.</p><a href="${article.originalUrl}" target="_blank" rel="noopener noreferrer">원문 사이트에서 더 읽기 ${icon("arrow",12)}</a></footer></article></main>`;
}

function blogPage() {
  const featured = favoriteBlogArticles[new Date().getDate() % favoriteBlogArticles.length];
  const activePost = favoriteBlogArticles.find(post => post.id === activeBlogPostId);
  const modal = activePost ? `<div class="learning-modal-backdrop" data-close-blog-reader><article class="blog-reader-modal" role="dialog" aria-modal="true" aria-labelledby="blog-reader-title" data-modal-stop><button class="modal-close" type="button" data-close-blog-reader aria-label="닫기">${icon("x",18)}</button><header><span>${activePost.category} · ${activePost.date}</span><h2 id="blog-reader-title">${activePost.title}</h2><p>${activePost.sourceTitle}</p></header><section class="blog-reader-summary"><strong>3줄 핵심 요약</strong>${activePost.summary.map(line=>`<p>${line}</p>`).join("")}</section><section class="blog-reader-expressions"><div><strong>저장해서 다시 볼 표현</strong><span>저장한 항목은 나만의 학습장에서 테스트로 만들 수 있어요.</span></div>${activePost.expressions.map(item=>{const itemId=`blog:${activePost.id}:${item.id}`;const saved=state.savedBlogItems.some(savedItem=>savedItem.id===itemId);return `<article><div><em>${item.type==="word"?"WORD":"EXPRESSION"}</em><h3>${item.text}</h3><b>${item.meaning}</b><p>${item.example}</p></div><button class="${saved?"saved":""}" type="button" data-save-blog-item="${activePost.id}:${item.id}" ${saved?"disabled":""}>${icon(saved?"check":"bookmark",15)} ${saved?"저장됨":"학습장에 담기"}</button></article>`}).join("")}</section><footer><a href="${activePost.sourceUrl}" target="_blank" rel="noopener noreferrer">원문 보기 ${icon("arrow",14)}</a><button type="button" data-page="journal">나만의 학습장 보기</button></footer>${blogSaveToast?`<div class="blog-save-toast" role="status">${icon("check",14)} ${blogSaveToast}</div>`:""}</article></div>` : "";
  return `${header("최애 블로그")}<main class="blog-page"><section class="blog-hero"><div><p class="eyebrow">MY FAVORITE BLOG</p><span class="blog-kicker">READ · SAVE · TEST</span><h2>읽다가 마음에 든 표현을<br>나의 학습으로 이어보세요.</h2><p>핵심 요약을 서비스 안에서 읽고<br>필요한 표현만 학습장에 담을 수 있습니다.</p><button type="button" data-open-blog-reader="${featured.id}">오늘의 글 인앱으로 읽기 ${icon("arrow",16)}</button></div><div class="hero-note"><span>TODAY'S PICK</span><b>${featured.phrase}</b><em>${featured.meaning}</em><p>${featured.summary[0]}</p></div></section><section class="blog-section"><div class="blog-section-head"><div><p class="eyebrow">DAILY ARCHIVE</p><h2>매일 꺼내 보는 영어 표현</h2></div><p>카드를 누르면 요약과 저장 표현이 인앱으로 열려요.</p></div><div class="blog-grid">${favoriteBlogArticles.map((post,i)=>`<button class="blog-card ${post.color}" type="button" data-open-blog-reader="${post.id}"><div class="blog-card-top"><span>${post.category}</span>${icon("arrow",17)}</div><div class="blog-number">0${i+1}</div><h3>${post.phrase}</h3><strong>${post.meaning}</strong><p>${post.summary[0]}</p><time>${post.date}</time></button>`).join("")}</div></section><section class="blog-source"><span class="blog-source-mark">L</span><div><b>렛츠링글리쉬어학원</b><p>인앱 요약으로 먼저 읽고 필요한 경우에만 원문을 확인하세요.</p></div><button type="button" data-open-blog-reader="${featured.id}">오늘의 요약 보기 ${icon("chevron",15)}</button></section></main>${modal}`;
}

const dramaVideoClips = [
  { id:"surprise", series:"Friends", season:"S02E08", duration:"00:22", videoUrl:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", quote:"You've got to be kidding.", translation:"설마, 농담이지?", tags:["놀람","disbelief"], description:"갑작스러운 소식을 듣고 믿기 어려워하는 장면", expression:"you've got to be kidding", meaning:"믿기 어려운 말을 들었을 때 ‘농담이지?’라는 반응", similar:["No way.","Seriously?","Are you serious?"], subtitlesEn:["I quit my job this morning.","You've got to be kidding."], subtitlesKo:["나 오늘 아침에 회사를 그만뒀어.","설마, 농담이지?"] },
  { id:"buying", series:"Modern Family", season:"S04E11", duration:"00:18", videoUrl:"https://www.w3schools.com/html/mov_bbb.mp4", quote:"I'm not buying it.", translation:"난 그 말을 믿지 않아.", tags:["의심","reaction"], description:"상대의 변명을 듣고 단호하게 의심하는 장면", expression:"I'm not buying it", meaning:"설명이나 변명을 사실로 받아들이지 않는다는 구어 표현", similar:["I don't believe you.","That doesn't add up.","Nice try."], subtitlesEn:["That's what really happened.","I'm not buying it."], subtitlesKo:["정말 그렇게 된 거야.","난 그 말을 믿지 않아."] },
  { id:"ahead", series:"Suits", season:"S03E05", duration:"00:26", videoUrl:"https://www.w3schools.com/html/movie.mp4", quote:"Let's not get ahead of ourselves.", translation:"너무 앞서가지는 말자.", tags:["조절","business"], description:"성과를 확신하기 전에 차분하게 다음 단계를 정리하는 장면", expression:"get ahead of ourselves", meaning:"상황이 확정되기 전에 너무 앞서 판단하거나 행동하다", similar:["One step at a time.","Let's wait and see.","Not so fast."], subtitlesEn:["We could close the deal today.","Let's not get ahead of ourselves."], subtitlesKo:["오늘 계약을 마무리할 수도 있어.","너무 앞서가지는 말자."] }
];

function dramaPage() {
  const active = dramaVideoClips.find(item => item.id === dramaShortState.activeClip);
  if (active) {
    const saved = state.savedBlogItems.some(item => item.id === `drama:${active.id}`);
    const subtitleMode = dramaShortState.subtitleMode || "both";
    const currentIndex = dramaVideoClips.findIndex(item => item.id === active.id);
    const next = dramaVideoClips[(currentIndex + 1) % dramaVideoClips.length];
    const subtitles = active.subtitlesEn.map((line,index)=>`<article><i>${index+1}</i><div>${subtitleMode !== "ko" ? `<b>${line}</b>` : ""}${subtitleMode !== "en" ? `<p>${active.subtitlesKo[index]}</p>` : ""}</div><button type="button" data-speak="${line.replaceAll('"','&quot;')}">${icon("volume",14)}</button></article>`).join("");
    return `${header("오늘의 미드 클립")}<main class="drama-video-page"><button class="drama-video-back" type="button" data-drama-back>← 오늘의 클립 3선</button><section class="drama-video-detail"><div class="drama-player-shell"><video controls autoplay playsinline preload="metadata" src="${active.videoUrl}"></video><span class="drama-duration">${active.duration}</span></div><header><div><span>${active.series} · ${active.season}</span><h2>${active.description}</h2></div><button class="${saved?"saved":""}" type="button" data-drama-save="${active.id}">${icon(saved?"check":"bookmark",16)} ${saved?"저장됨":"표현 저장"}</button></header><nav class="drama-subtitle-tabs" aria-label="자막 표시 방식">${[["en","영어만"],["ko","한국어만"],["both","영어 + 한국어"]].map(item=>`<button class="${subtitleMode===item[0]?"active":""}" type="button" data-drama-subtitle="${item[0]}">${item[1]}</button>`).join("")}</nav><section class="drama-transcript">${subtitles}</section><section class="drama-key-learning"><span>KEY EXPRESSION</span><blockquote>“${active.quote}”</blockquote><strong>${active.translation}</strong><p>${active.meaning}</p><div>${active.similar.map(item=>`<em>${item}</em>`).join("")}</div></section><footer><button type="button" data-speak="${active.quote.replaceAll('"','&quot;')}">${icon("mic",15)} 따라 말하기</button><button class="primary" type="button" data-drama-next-clip="${next.id}">다음 클립 ${icon("arrow",14)}</button></footer></section></main>`;
  }
  const cards = dramaVideoClips.map((clip,index)=>`<article class="drama-reel-card"><button class="drama-reel-preview" type="button" data-drama-open="${clip.id}" aria-label="${clip.series} 클립 재생"><video muted loop autoplay playsinline preload="metadata" src="${clip.videoUrl}"></video><span class="drama-play">${icon("play",24)}</span><span class="drama-duration">${clip.duration}</span><small>CLIP ${String(index+1).padStart(2,"0")}</small></button><div class="drama-reel-copy"><span>${clip.series} · ${clip.season}</span><h3>“${clip.quote}”</h3><p>${clip.translation}</p><div>${clip.tags.map(tag=>`<em>#${tag}</em>`).join("")}</div><button type="button" data-drama-open="${clip.id}">학습하기 ${icon("arrow",13)}</button></div></article>`).join("");
  return `${header("오늘의 미드 숏폼")}<main class="drama-video-page"><section class="drama-video-hero"><div><p class="eyebrow">WATCH · CATCH · SPEAK</p><h2>오늘의 미드 클립 3선</h2><p>짧게 보고, 바로 따라 익히는 오늘의 표현</p></div><span>${icon("play",18)} TODAY'S SHORTS</span></section><section class="drama-reel-grid">${cards}</section><section class="drama-video-tip"><span>${icon("spark",16)}</span><div><b>오늘은 이 장면들로 말하기 감각을 익혀보세요.</b><p>클립을 누르면 영상과 자막, 표현 설명을 한 화면에서 볼 수 있습니다.</p></div></section></main>`;
}

function saveDramaShortState() {
  const persisted = { date: localDateKey(), answers: dramaShortState.answers, activeClip: dramaShortState.activeClip || null, subtitleMode: dramaShortState.subtitleMode || "both" };
  try { profileStorage.setItem(DRAMA_SHORT_STORAGE_KEY, JSON.stringify(persisted)); } catch {}
}

const FAMILY_SHORTS_STORAGE_KEY = "valuetime_family_youtube_shorts_v2";
const familyShortSamples = [
  { id:"scene-1",youtubeUrl:"https://www.youtube.com/shorts/M7lc1UVf-VE",videoId:"M7lc1UVf-VE",series:"매일 미드 한문장",title:"망설이다가 용기를 내는 순간",channelName:"가족 등록 클립",sentence:"Here goes nothing.",meaningKo:"에라 모르겠다. 한번 해보자.",situation:"망설이다가 결국 시작하기로 마음먹을 때",duration:"00:18",expressionNote:"결과를 확신할 수 없지만 일단 해보겠다는 순간에 쓰는 반응",difficulty:"medium",tags:["미드 표현","도전"],tip:"Here goes를 한 덩어리처럼 자연스럽게 이어 말해보세요.",example:"Here goes nothing. I'm going to ask her.",createdAt:"2026-07-21"},
  { id:"scene-2",youtubeUrl:"https://www.youtube.com/shorts/aqz-KE-bpKQ",videoId:"aqz-KE-bpKQ",series:"매일 미드 한문장",title:"상대를 안심시키는 장면",channelName:"가족 등록 클립",sentence:"Take your time.",meaningKo:"천천히 해도 돼.",situation:"상대가 긴장하거나 서두를 때 여유를 주는 말",duration:"00:16",expressionNote:"상대에게 서두르지 않아도 된다고 부드럽게 말하는 표현",difficulty:"easy",tags:["일상 회화","배려"],tip:"명령처럼 들리지 않도록 부드럽게 내려 말하세요.",example:"Take your time. There's no rush.",createdAt:"2026-07-21"},
  { id:"scene-3",youtubeUrl:"https://www.youtube.com/shorts/ysz5S6PUM-U",videoId:"ysz5S6PUM-U",series:"매일 미드 한문장",title:"너무 앞서가지 말자는 장면",channelName:"가족 등록 클립",sentence:"Let's not get ahead of ourselves.",meaningKo:"너무 앞서가지는 말자.",situation:"아직 확정되지 않은 일을 미리 기대할 때",duration:"00:21",expressionNote:"상황이 확정되기 전에 성급하게 판단하지 말자는 표현",difficulty:"hard",tags:["미드 표현","조절"],tip:"get ahead of ourselves를 한 호흡으로 따라 해보세요.",example:"We may win, but let's not get ahead of ourselves.",createdAt:"2026-07-21"}
];
let familyShortState = (()=>{try{const stored=JSON.parse(profileStorage.getItem(FAMILY_SHORTS_STORAGE_KEY)||"null");return {items:stored?.items?.length?stored.items:familyShortSamples,saved:stored?.saved||[],view:"home",activeId:null,tag:"전체",unlocked:sessionStorage.getItem("family_shorts_unlocked")==="yes",error:""};}catch{return {items:familyShortSamples,saved:[],view:"home",activeId:null,tag:"전체",unlocked:false,error:""};}})();
familyShortState.unlocked = true;
const youtubeShortsFeed = { status: "idle", items: [], channel: null, message: "" };

function youtubeTitleToSentence(title = "") {
  const remainder = String(title)
    .replace(/[\[【(]?\s*매일\s*미드\s*한문장\s*[\]】)]?/gi, "")
    .replace(/^[\s|:·#\-–—]+/, "")
    .trim();
  return remainder || "영상에서 오늘의 핵심 문장을 확인해 보세요.";
}

function mapYoutubeShortToLearningItem(video) {
  return {
    id: `youtube-${video.videoId}`,
    youtubeUrl: video.shortsUrl || video.videoUrl,
    videoId: video.videoId,
    thumbnailUrl: video.thumbnailUrl,
    embedUrl: video.embedUrl,
    series: "매일 미드 한문장",
    title: video.title,
    channelName: video.channelTitle,
    sentence: youtubeTitleToSentence(video.title),
    meaningKo: "영상에서 문장의 뜻과 쓰임을 확인하세요.",
    situation: "짧은 장면 속 실제 회화 표현",
    duration: video.durationLabel || "SHORT",
    expressionNote: "영상 재생 후 핵심 표현을 한 번 더 따라 말해보세요.",
    difficulty: "medium",
    tags: ["미드 표현", "YouTube Shorts"],
    tip: "장면을 본 뒤 자막 없이 같은 억양으로 따라 말해보세요.",
    example: youtubeTitleToSentence(video.title),
    publishedAt: video.publishedAt,
    embeddable: video.embeddable !== false,
    remote: true,
  };
}

function currentFamilyShortItems() {
  return youtubeShortsFeed.status === "success" ? youtubeShortsFeed.items : familyShortState.items;
}

async function refreshYoutubeShortsFeed() {
  youtubeShortsFeed.status = "loading";
  youtubeShortsFeed.message = "";
  if (state.page === "drama") render();
  try {
    const response = await fetch("/api/youtube-shorts", { credentials: "include", cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.message || `YouTube feed returned ${response.status}`);
    youtubeShortsFeed.items = (payload.videos || []).map(mapYoutubeShortToLearningItem);
    youtubeShortsFeed.channel = payload.channel || null;
    youtubeShortsFeed.status = "success";
  } catch (error) {
    console.error("[today-shorts]", error);
    youtubeShortsFeed.status = "error";
    youtubeShortsFeed.message = error.message || "오늘의 쇼츠를 불러오지 못했습니다.";
  }
  if (state.page === "drama") render();
}

function saveFamilyShorts(){profileStorage.setItem(FAMILY_SHORTS_STORAGE_KEY,JSON.stringify({items:familyShortState.items,saved:familyShortState.saved}));}
function youtubeIdFrom(value){const text=String(value||"").trim();if(/^[\w-]{11}$/.test(text))return text;const match=text.match(/(?:shorts\/|youtu\.be\/|v=|embed\/)([\w-]{11})/);return match?.[1]||"";}
function familyShortCard(item,compact=false,featured=false){const saved=familyShortState.saved.includes(item.id);return `<article class="family-short-card ${compact?"compact":""} ${featured?"featured":""}"><button class="family-short-thumb" data-family-open="${item.id}" aria-label="${item.sentence} 학습 쇼츠 보기"><img src="${item.thumbnailUrl||`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`}" alt="${item.title} 장면 썸네일"><span class="family-short-play">${icon("play",featured?26:21)}</span><div class="family-short-overlay"><small>${item.series||"매일 미드 한문장"}</small><blockquote>${item.sentence}</blockquote><strong>${item.meaningKo}</strong><p>${item.situation||item.expressionNote}</p></div><em>${item.duration||"SHORT"}</em><b class="difficulty ${item.difficulty}">${item.difficulty}</b></button><div class="family-short-meta"><p>${item.title}</p>${item.publishedAt?`<time datetime="${item.publishedAt}">${new Date(item.publishedAt).toLocaleDateString("ko-KR")}</time>`:""}${compact?"":`<nav>${(item.tags||[]).map(tag=>`<i>#${tag}</i>`).join("")}</nav>`}<footer><button class="${saved?"saved":""}" data-family-save="${item.id}">${icon(saved?"check":"bookmark",14)} ${saved?"저장됨":"저장"}</button><button type="button" data-speak="${item.sentence.replaceAll('"','&quot;')}">${icon("mic",14)} 따라 말하기</button><button class="primary" data-family-open="${item.id}">보기 ${icon("arrow",12)}</button></footer></div></article>`;}
function familyShortsPage(){
  if(!familyShortState.unlocked)return `${header("가족 영어")}<main class="family-private-page"><section class="family-lock"><span>${icon("heart",25)}</span><p>PRIVATE FAMILY SPACE</p><h2>우리 가족 영어 한 문장</h2><strong>매일 짧은 쇼츠로 영어 한 문장씩 익혀요</strong><form data-family-login><label>가족 비밀번호<input name="password" type="password" autocomplete="current-password" placeholder="비밀번호를 입력하세요" required></label>${familyShortState.error?`<p class="error">${familyShortState.error}</p>`:""}<button>가족 학습방 들어가기</button></form><small>가족 구성원만 사용하는 비공개 학습 공간입니다.</small></section></main>`;
  const feedItems=currentFamilyShortItems();
  const active=feedItems.find(item=>item.id===familyShortState.activeId);
  const nav=`<nav class="family-short-nav"><button class="${familyShortState.view==="home"?"active":""}" data-family-view="home">오늘의 쇼츠</button><button class="${familyShortState.view==="saved"?"active":""}" data-family-view="saved">저장한 문장</button><button class="${familyShortState.view==="admin"?"active":""}" data-family-view="admin">관리</button></nav>`;
  if(active){const saved=familyShortState.saved.includes(active.id);const next=feedItems.filter(item=>item.id!==active.id).slice(0,3);return `${header("매일 미드 한문장")}<main class="family-shorts-page">${nav}<button class="family-detail-back" data-family-back>← 오늘의 쇼츠</button><article class="family-short-detail"><div class="family-youtube-frame"><iframe src="https://www.youtube-nocookie.com/embed/${active.videoId}?rel=0&playsinline=1" title="${active.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><section class="family-video-source"><div><span>${active.series||"매일 미드 한문장"}</span><h2>${active.title}</h2><p>${active.channelName} · ${active.duration||"SHORT"}</p><p>${active.situation||active.expressionNote}</p></div><button class="${saved?"saved":""}" data-family-save="${active.id}">${icon(saved?"check":"bookmark",15)} ${saved?"저장됨":"문장 저장"}</button><a href="${active.youtubeUrl}" target="_blank" rel="noopener noreferrer">YouTube 원본 보기 ${icon("arrow",12)}</a><small>이 영상은 YouTube 원본 임베드로 제공됩니다. 재생할 수 없으면 원본 보기 버튼을 이용해 주세요.</small></section><section class="family-learning-note"><span>TODAY'S SENTENCE</span><blockquote>${active.sentence}</blockquote><strong>${active.meaningKo}</strong><div><b>표현 포인트</b><p>${active.expressionNote}</p></div><div><b>따라 말하기 팁</b><p>${active.tip}</p></div><div><b>이렇게도 말해보세요</b><p>${active.example}</p></div><button data-speak="${active.sentence.replaceAll('"','&quot;')}">${icon("mic",15)} 문장 따라 말하기</button></section></article><section class="family-next"><h3>다음 학습 쇼츠</h3><div>${next.map(item=>familyShortCard(item,true)).join("")}</div></section></main>`;}
  if(familyShortState.view==="saved"){const items=feedItems.filter(item=>familyShortState.saved.includes(item.id));return `${header("저장한 문장")}<main class="family-shorts-page">${nav}<section class="family-section-head"><p>SAVED SENTENCES</p><h2>다시 보고 싶은 문장</h2><span>${items.length}개 저장됨</span></section><div class="family-saved-list">${items.length?items.map(item=>familyShortCard(item,true)).join(""):`<div class="family-empty">아직 저장한 문장이 없어요.<br><button data-family-view="home">오늘의 문장 둘러보기</button></div>`}</div></main>`;}
  if(familyShortState.view==="admin")return `${header("쇼츠 관리")}<main class="family-shorts-page">${nav}<section class="family-section-head"><p>FAMILY ADMIN</p><h2>새로운 학습 쇼츠 추가</h2><span>한 영상에 핵심 표현 하나만 등록해 주세요.</span></section><form class="family-admin-form" data-family-add><label class="wide">YouTube Shorts URL 또는 video ID<input name="youtube" placeholder="https://youtube.com/shorts/..." required></label><label>시리즈명<input name="series" value="매일 미드 한문장" required></label><label>영상 제목<input name="title" required></label><label>채널명<input name="channel" required></label><label>영상 길이<input name="duration" placeholder="00:20"></label><label class="wide">핵심 문장<input name="sentence" required></label><label class="wide">한국어 해석<input name="meaning" required></label><label class="wide">상황 설명<input name="situation" placeholder="망설이다가 시작하기로 마음먹을 때" required></label><label class="wide">표현 포인트<textarea name="note" required></textarea></label><label>난이도<select name="difficulty"><option value="easy">easy</option><option value="medium">medium</option><option value="hard">hard</option></select></label><label>태그<input name="tags" placeholder="미드 표현, 일상 회화"></label><label class="wide">따라 말하기 팁<input name="tip"></label><label class="wide">짧은 예문<input name="example"></label><button class="wide">표현 학습 쇼츠 만들기</button></form><section class="family-admin-list"><h3>등록된 쇼츠 ${familyShortState.items.length}개</h3>${familyShortState.items.map(item=>`<article><img src="https://i.ytimg.com/vi/${item.videoId}/default.jpg" alt=""><div><b>${item.sentence}</b><span>${item.series||"매일 미드 한문장"} · ${item.channelName}</span></div><button data-family-delete="${item.id}">삭제</button></article>`).join("")}</section></main>`;
  const tags=["전체",...new Set(feedItems.flatMap(item=>item.tags||[]))];const filtered=familyShortState.tag==="전체"?feedItems:feedItems.filter(item=>(item.tags||[]).includes(familyShortState.tag));const daily=filtered.slice(0,9);const featured=daily[0];const similar=daily.slice(1);const feedBody=["idle","loading"].includes(youtubeShortsFeed.status)?`<div class="family-shorts-loading" role="status"><i></i><b>최신 학습 쇼츠를 불러오는 중입니다.</b><span>잠시만 기다려 주세요.</span></div>`:youtubeShortsFeed.status==="error"?`<div class="family-shorts-feed-state error" role="alert"><b>오늘의 쇼츠를 불러오지 못했습니다.</b><span>${youtubeShortsFeed.message||"잠시 후 다시 확인해 주세요."}</span><button type="button" data-family-feed-retry>다시 불러오기</button></div>`:!featured?`<div class="family-shorts-feed-state"><b>매일 미드 한문장 영상이 없습니다.</b><span>채널에 조건에 맞는 새 영상이 등록되면 자동으로 표시됩니다.</span></div>`:`<div class="family-short-showcase"><div>${familyShortCard(featured,false,true)}</div><section><p>MORE EXPRESSIONS</p><h3>최신 학습 쇼츠</h3><div class="family-short-grid">${similar.map(item=>familyShortCard(item)).join("")}</div></section></div>`;return `${header("우리 가족 영어 한 문장")}<main class="family-shorts-page">${nav}<section class="family-shorts-hero"><div><p>ONE SCENE · ONE EXPRESSION</p><h2>오늘의 쇼츠</h2><strong>짧은 장면 하나로, 오늘 쓸 표현 하나를 익혀요.</strong></div><span>${icon("play",17)} ${youtubeShortsFeed.channel?.channelTitle||"매일 미드 한문장"}</span></section><section class="family-summary"><article><span>오늘 저장한 문장</span><b>${familyShortState.saved.length}개</b></article><article><span>불러온 학습 쇼츠</span><b>${youtubeShortsFeed.status==="success"?`${feedItems.length}개`:"확인 중"}</b></article></section>${youtubeShortsFeed.status==="success"&&feedItems.length?`<nav class="family-tags">${tags.map(tag=>`<button class="${familyShortState.tag===tag?"active":""}" data-family-tag="${tag}">${tag}</button>`).join("")}</nav>`:""}<section class="family-today"><header><div><p>TODAY'S SCENE</p><h2>매일 미드 한문장</h2></div><span>보고 · 뜻 확인 · 따라 말하기</span></header>${feedBody}</section><p class="family-youtube-notice">${icon("play",14)} 영상은 저장하지 않으며 YouTube 공식 임베드로 재생됩니다.</p></main>`;
}

function completeDramaStudyIfAllCardsDone() {
  const allDone = dramaShortCards.every(card => Object.keys(dramaShortState.answers[card.id] || {}).length >= card.questions.length);
  if (!allDone || homeStudyState.checked.drama) return;
  homeStudyState.checked.drama = true;
  saveHomeStudyState("drama");
}

function dailyTestPage() {
  const todayKey = localDateKey();
  if (dailyTestState.date !== todayKey) {
    dailyTestState.date = todayKey;
    dailyTestState.indices = { rc: 0, vocab: 0, sentence: 0 };
    dailyTestState.scores = getTodayTestScores();
    dailyTestQuestions = buildDailyTestQuestionOrder(todayKey);
  }
  if (dailyQuickTestState.date !== todayKey) {
    Object.assign(dailyQuickTestState, { date: todayKey, graded: false, score: null });
  }
  const quickQuestions = getDailyQuickTestQuestions(todayKey);
  const quickTotal = quickQuestions.length;
  const type = dailyTestState.active;
  const scores = dailyTestState.scores;
  const isDashboardDone = Boolean(homeStudyState.checked.test);
  const testMeta = syncHomeAppState().items.dailytest || {};
  const wrongNotes = getWrongNotes();
  const reviewCount = Object.values(wrongNotes).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
  const tabs = [
    ["rc", "RC 문제"],
    ["vocab", "단어장 테스트"],
    ["sentence", "오늘의 한 문장"],
    ["wrong", "오답노트"],
    ["history", "날짜별 이력"],
  ];

  let pageContent = "";

  if (["rc", "vocab", "sentence"].includes(type)) {
    const questions = dailyTestQuestions[type];
    const index = dailyTestState.indices[type];
    const current = questions[index];
    pageContent = `<div class="test-layout">
      <section class="test-question-card panel" aria-labelledby="test-question-title">
        <div class="test-card-head"><div><p class="eyebrow">${current.type}</p><h2 id="test-question-title">${tabs.find(([key]) => key === type)[1]}</h2></div><span>문제 ${index + 1} / ${questions.length}</span></div>
        <div class="test-question-body">
          <h3>${current.question}</h3>
          ${current.passage ? `<div class="test-passage">${current.passage}</div>` : ""}
          <fieldset class="test-choices"><legend class="sr-only">답안 선택</legend>${current.choices.map((choice, choiceIndex) => `<label data-choice-index="${choiceIndex}"><input type="radio" name="daily-test-choice" value="${choiceIndex}"><span><i>${choiceIndex + 1}</i>${choice}</span></label>`).join("")}</fieldset>
          <div class="test-actions"><button type="button" data-test-check>정답 확인</button><button class="secondary" type="button" data-test-next>다음 문제</button></div>
          <div id="test-result" class="test-result" role="status" aria-live="polite"></div>
        </div>
      </section>

      <aside class="test-side-stack">${dailyTestScoreCard(scores)}
        <section class="panel test-guide-card"><p class="eyebrow">STUDY GUIDE</p><h3>Daily Test 안내</h3><ul><li><b>RC 문제</b><span>20문제 은행을 날짜별 새 순서로 점검</span></li><li><b>단어 테스트</b><span>오늘의 단어 10개에서 출제</span></li><li><b>문장 학습</b><span>오늘의 한 문장으로 의미·패턴·활용 점검</span></li></ul><small>같은 날에는 문제와 순서가 유지되고, 날짜가 바뀌면 새로운 세트가 준비됩니다.</small></section>
      </aside>
    </div>`;
  } else if (type === "wrong") {
    const notes = getWrongNotes();
    const category = dailyTestState.wrongFilter;
    const labels = { rc: "RC", vocab: "단어", sentence: "문장" };
    const items = notes[category] || [];
    pageContent = `<section class="panel test-library-card"><div class="test-card-head"><div><p class="eyebrow">REVIEW AGAIN</p><h2>오답노트</h2></div><span>${items.length}문제 저장됨</span></div><div class="test-library-body">
      <div class="test-sub-toolbar">${Object.entries(labels).map(([key, label]) => `<button class="${category === key ? "active" : ""}" type="button" data-wrong-filter="${key}">${label} 오답</button>`).join("")}<button class="danger" type="button" data-wrong-clear>전체 삭제</button></div>
      <div class="test-record-list">${items.length ? items.map((item, index) => `<article><strong>${index + 1}. ${item.question}</strong>${item.passage ? `<span><b>문장/지문</b>${item.passage}</span>` : ""}<span><b>정답</b>${item.choices[item.answer]}</span><span><b>해설</b>${item.explanation}</span></article>`).join("") : `<div class="test-empty"><b>저장된 ${labels[category]} 오답이 없습니다.</b><span>문제를 틀리면 이곳에 자동으로 모아드려요.</span></div>`}</div>
    </div></section>`;
  } else {
    const history = getTestHistory();
    const today = localDateKey();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = localDateKey(yesterdayDate);
    const filter = dailyTestState.historyFilter;
    const allEntries = Object.entries(history).sort(([a], [b]) => b.localeCompare(a));
    const entries = filter === "today" ? allEntries.filter(([date]) => date === today) : filter === "yesterday" ? allEntries.filter(([date]) => date === yesterday) : allEntries;
    pageContent = `<section class="panel test-library-card"><div class="test-card-head"><div><p class="eyebrow">LEARNING HISTORY</p><h2>날짜별 학습 이력</h2></div><span>${entries.length}일 기록</span></div><div class="test-library-body">
      <div class="test-sub-toolbar"><button class="${filter === "today" ? "active" : ""}" type="button" data-history-filter="today">오늘</button><button class="${filter === "yesterday" ? "active" : ""}" type="button" data-history-filter="yesterday">어제</button><button class="${filter === "all" ? "active" : ""}" type="button" data-history-filter="all">전체</button><button class="danger" type="button" data-history-clear>이력 삭제</button></div>
      <div class="test-record-list">${entries.length ? entries.map(([date, info]) => `<article><strong>${date}</strong><div class="test-history-scores"><span>RC <b>${info.rc.correct} / ${info.rc.total}</b></span><span>단어 <b>${info.vocab.correct} / ${info.vocab.total}</b></span><span>문장 <b>${info.sentence.correct} / ${info.sentence.total}</b></span></div><small>풀이 기록 ${info.logs?.length || 0}개</small></article>`).join("") : `<div class="test-empty"><b>표시할 학습 이력이 없습니다.</b><span>문제를 풀면 날짜별 점수가 자동으로 기록됩니다.</span></div>`}</div>
    </div></section>`;
  }

  return `${header("Daily Test")}<main class="daily-test-page">
    <section class="daily-quick-test" aria-labelledby="quick-test-title"><div class="daily-quick-head"><div><p class="eyebrow">TODAY REVIEW CHECK · ${todayKey}</p><h2 id="quick-test-title">오늘 학습 확인용 퀵 테스트</h2><span>오늘 학습한 단어, 문장 표현, 문법 포인트를 가볍게 확인합니다.</span></div><b>${quickTotal} QUESTIONS</b></div><div class="daily-quick-scope"><span>오늘 학습 기반 ${quickTotal}문항</span><span>단어 / 문장 / 문법 복습 포함</span><span>${reviewCount ? `복습 대기 ${reviewCount}개 있음` : "복습 대기 없음"}</span></div><div class="daily-quick-status"><b class="${isDashboardDone ? "done" : "todo"}">${isDashboardDone ? icon("check",12) : ""}${isDashboardDone ? "완료됨" : "진행 전"}</b><span>${testMeta.lastStudiedAt ? `최근 학습 · ${testMeta.lastStudiedAt}` : "아직 테스트를 시작하지 않았어요"}</span><span data-daily-score-meta>${testMeta.score !== null && testMeta.score !== undefined ? `최근 점수 · ${testMeta.score}` : "최근 풀이 기록이 없어요"}</span><button type="button" data-daily-undo ${!isDashboardDone ? "disabled" : ""}>완료 해제</button></div><div class="daily-quick-grid">${quickQuestions.map((question, questionIndex) => `<fieldset><legend><small>${question.category}</small>${questionIndex + 1}. <strong>${question.prompt}</strong> ${question.question}</legend>${question.choices.map((choice, choiceIndex) => `<label><input type="radio" name="quick-q${questionIndex + 1}" value="${choiceIndex}"><span>${choice}</span></label>`).join("")}</fieldset>`).join("")}</div><div class="daily-quick-actions"><button type="button" data-quick-grade>오늘 테스트 채점하기</button><p class="${dailyQuickTestState.score === quickTotal ? "perfect" : ""}" data-quick-result role="status" aria-live="polite">${dailyQuickTestState.graded ? `점수: ${dailyQuickTestState.score} / ${quickTotal}` : ""}</p><button class="complete ${isDashboardDone ? "done" : ""}" type="button" data-daily-complete ${!dailyQuickTestState.graded && !isDashboardDone ? "hidden" : ""} ${isDashboardDone ? "disabled" : ""}>${icon("check",16)} ${isDashboardDone ? "Daily Test 완료됨" : "학습 완료 처리"}</button></div></section>

    <nav class="test-tabs" aria-label="Daily Test 유형">${tabs.map(([key, label]) => `<button class="${type === key ? "active" : ""}" type="button" data-test-tab="${key}">${label}</button>`).join("")}</nav>
    ${pageContent}
  </main>`;
}

function dailyTestScoreCard(scores) {
  const solved = scores.rcTotal + scores.vocabTotal + scores.sentenceTotal;
  const correct = scores.rcCorrect + scores.vocabCorrect + scores.sentenceCorrect;
  const accuracy = solved ? Math.round((correct / solved) * 100) : null;
  return `<section class="panel test-score-card"><div class="test-card-head"><div><p class="eyebrow">TODAY REVIEW</p><h2>오늘 확인 현황</h2></div><span>${accuracy === null ? "기록 대기" : `${accuracy}%`}</span></div><div class="test-score-list"><div><span>RC 확인</span><b id="test-score-rc">${scores.rcCorrect} / ${scores.rcTotal}</b></div><div><span>단어 복습</span><b id="test-score-vocab">${scores.vocabCorrect} / ${scores.vocabTotal}</b></div><div><span>문장 표현</span><b id="test-score-sentence">${scores.sentenceCorrect} / ${scores.sentenceTotal}</b></div></div><button class="test-reset" type="button" data-test-reset>오늘 기록 초기화</button><p id="test-score-status" class="test-score-status" role="status" aria-live="polite">${solved ? "오늘 푼 항목을 기준으로 복습 필요 여부를 확인합니다." : "아직 오늘 풀이 기록이 없습니다."}</p></section>`;
}

function saveDailyTestResult(type, current, selectedIndex, isCorrect) {
  dailyTestState.scores[`${type}Total`] += 1;
  if (isCorrect) dailyTestState.scores[`${type}Correct`] += 1;

  const history = getTestHistory();
  const today = localDateKey();
  if (!history[today]) history[today] = emptyHistoryEntry();
  history[today].rc = { correct: dailyTestState.scores.rcCorrect, total: dailyTestState.scores.rcTotal };
  history[today].vocab = { correct: dailyTestState.scores.vocabCorrect, total: dailyTestState.scores.vocabTotal };
  history[today].sentence = { correct: dailyTestState.scores.sentenceCorrect, total: dailyTestState.scores.sentenceTotal };
  history[today].logs.push({ time: new Date().toLocaleTimeString("ko-KR"), type, id: current.id, selected: current.choices[selectedIndex], correct: current.choices[current.answer], isCorrect });
  try { profileStorage.setItem(DAILY_TEST_HISTORY_KEY, JSON.stringify(history)); } catch {}

  if (!isCorrect) {
    const notes = getWrongNotes();
    if (!notes[type].some(item => item.id === current.id)) notes[type].push(current);
    try { profileStorage.setItem(DAILY_TEST_WRONG_KEY, JSON.stringify(notes)); } catch {}
  }
  const totalCorrect = dailyTestState.scores.rcCorrect + dailyTestState.scores.vocabCorrect + dailyTestState.scores.sentenceCorrect;
  const totalSolved = dailyTestState.scores.rcTotal + dailyTestState.scores.vocabTotal + dailyTestState.scores.sentenceTotal;
  syncHomeAppState("test", `${totalCorrect} / ${totalSolved}`);
  const scoreMeta = document.querySelector("[data-daily-score-meta]");
  if (scoreMeta) scoreMeta.textContent = `최근 점수 · ${totalCorrect} / ${totalSolved}`;
}

function escapeMarkup(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function quizVideoMarkup(question) {
  if (!question?.youtube) return `<div class="quiz-video-empty">연결된 영상이 없습니다.</div>`;
  const embedUrl = makeYouTubeEmbedUrl(question.youtube);
  const watchUrl = makeYouTubeWatchUrl(question.youtube);
  const thumbnailUrl = makeYouTubeThumbnailUrl(question.youtube);
  if (!embedUrl) return `<div class="quiz-video-fallback">${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="유튜브 영상 썸네일">` : ""}<p>유튜브 주소를 임베드 형식으로 변환하지 못했습니다.</p>${watchUrl ? `<a href="${watchUrl}" target="_blank" rel="noopener noreferrer">유튜브에서 열기</a>` : ""}</div>`;
  return `<iframe src="${embedUrl}?rel=0" title="${escapeMarkup(question.question || "관련 학습 영상")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><a class="quiz-video-link" href="${watchUrl}" target="_blank" rel="noopener noreferrer">영상이 보이지 않으면 YouTube에서 열기 →</a>`;
}

function quizLevelFromAccuracy(accuracy) {
  if (accuracy >= 85) return "Advanced";
  if (accuracy >= 65) return "Intermediate";
  return "Foundation";
}

function quizTypeTone(type = "") {
  const normalized = String(type).toLowerCase();
  if (normalized.includes("technical")) return "technical";
  if (normalized.includes("business")) return "business";
  if (normalized.includes("grammar")) return "grammar";
  if (normalized.includes("reading")) return "reading";
  return "vocab";
}

function quizPerformanceRows() {
  const solvedEntries = Object.entries(quizState.solvedMap).map(([index, result]) => ({ question: quizState.questions[Number(index)], result })).filter(item => item.question);
  const categoryMap = new Map();
  solvedEntries.forEach(({ question, result }) => {
    const key = question.category || "General";
    const saved = categoryMap.get(key) || { solved: 0, correct: 0 };
    saved.solved += 1;
    if (result.correct) saved.correct += 1;
    categoryMap.set(key, saved);
  });
  return [...categoryMap.entries()].slice(0, 4).map(([category, item]) => {
    const percent = item.solved ? Math.round((item.correct / item.solved) * 100) : 0;
    return `<li><span>${escapeMarkup(category)}</span><b>${percent}%</b><i><em style="width:${percent}%"></em></i></li>`;
  }).join("") || `<li><span>Battery</span><b>Ready</b><i><em style="width:12%"></em></i></li>`;
}

function quizRelatedLearningPanel(question) {
  if (!question) return "";
  const terms = question.relatedExpressions.length ? question.relatedExpressions : ["quality check", "inspection", "defect"];
  const examples = question.examples.length ? question.examples : ["Please review the inspection result before shipment."];
  return `<aside class="quiz-side quiz-learning-panel">
    <section class="quiz-side-card">
      <p class="eyebrow">RELATED LEARNING</p>
      <h3>핵심 표현</h3>
      <div class="quiz-expression-list">${terms.map(term => `<button type="button" data-speak="${escapeMarkup(term)}">${escapeMarkup(term)} ${icon("volume", 12)}</button>`).join("")}</div>
    </section>
    <section class="quiz-side-card">
      <h3>관련 예문</h3>
      <div class="quiz-example-stack">${examples.slice(0, 2).map(example => `<blockquote>${escapeMarkup(example)}</blockquote>`).join("")}</div>
    </section>
    <section class="quiz-side-card">
      <h3>도메인 노트</h3>
      <p>${escapeMarkup(question.category)} 영역에서는 용어의 기능, 공정 맥락, 보고서 표현을 함께 익히는 것이 중요합니다.</p>
    </section>
    <section class="quiz-side-card">
      <h3>오답노트</h3>
      <div class="quiz-wrong-list">${quizState.wrongSet.length ? quizState.wrongSet.slice(0, 4).map(index => { const item = quizState.questions[index]; return item ? `<article><b>${escapeMarkup(item.question)}</b><div><button type="button" data-quiz-go="${index}">보기</button><button type="button" data-quiz-retry-one="${index}">다시 풀기</button><button type="button" data-quiz-remove-wrong="${index}">제외</button></div></article>` : ""; }).join("") : `<p>아직 저장된 오답이 없습니다.</p>`}</div>
    </section>
  </aside>`;
}

function isQuizPart7Question(question = {}) {
  return Boolean(String(question.passage || "").trim()) || /reading/i.test(String(question.type || ""));
}

function quizLandingPage(plan) {
  const newPart56 = plan.newIndexes.filter(index => !isQuizPart7Question(quizState.questions[index]));
  const newPart7 = plan.newIndexes.filter(index => isQuizPart7Question(quizState.questions[index]));
  const part56Indexes = quizState.questions.map((question, index) => !isQuizPart7Question(question) ? index : -1).filter(index => index >= 0);
  const part7Indexes = quizState.questions.map((question, index) => isQuizPart7Question(question) ? index : -1).filter(index => index >= 0);
  const part56Solved = part56Indexes.filter(index => quizState.solvedMap[index]).length;
  const part7Solved = part7Indexes.filter(index => quizState.solvedMap[index]).length;
  const reviewIndexes = [...new Set([...quizState.wrongSet, ...quizState.bookmarkSet])];
  const typeCard = ({ group, eyebrow, title, description, count, total, solved, points, tone }) => `<article class="quiz-entry-card ${tone}">
    <div class="quiz-entry-card-head"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div><span>${icon(tone === "reading" ? "news" : "pencil", 22)}</span></div>
    <p class="quiz-entry-description">${description}</p>
    <ul>${points.map(point => `<li>${icon("check", 13)}<span>${point}</span></li>`).join("")}</ul>
    <div class="quiz-entry-count"><span>오늘의 새 ${tone === "reading" ? "독해" : "문제"}</span><b>${count}</b><small>${tone === "reading" ? "지문·문항" : "문항"}</small></div>
    <div class="quiz-entry-progress"><span>전체 풀이 ${solved}/${total}</span><i><em style="width:${total ? Math.round((solved / total) * 100) : 0}%"></em></i></div>
    <button type="button" data-quiz-group="${group}">${solved ? "이어풀기" : "시작하기"}${icon("arrow", 15)}</button>
  </article>`;
  return `${header("영어 문제풀이")}<main class="quiz-page quiz-entry-page ${quizState.darkMode ? "dark" : ""}">
    <section class="quiz-entry-hero"><div><p class="eyebrow">TOEIC RC PRACTICE</p><h1>영어 문제풀이</h1><p>Part 5·6과 Part 7 중 오늘 풀 유형을 선택하세요.</p></div><button type="button" data-quiz-dark>${quizState.darkMode ? "라이트모드" : "다크모드"}</button></section>
    <section class="quiz-entry-grid" aria-label="토익 문제 유형 선택">
      ${typeCard({ group: "part56", eyebrow: "QUICK PRACTICE", title: "Part 5·6", description: "문법·어휘·문장 흐름을 빠르게 점검하는 객관식 문제", count: newPart56.length, total: part56Indexes.length, solved: part56Solved, tone: "grammar", points: ["문법·어휘·문장 완성", "Part 5와 Part 6 통합 학습", "최근 7일 풀이와 겹치지 않음"] })}
      ${typeCard({ group: "part7", eyebrow: "READING PRACTICE", title: "Part 7", description: "이메일·공지문·안내문·기사형 지문을 읽는 독해 문제", count: newPart7.length, total: part7Indexes.length, solved: part7Solved, tone: "reading", points: ["지문 기반 4지선다", "핵심 정보와 목적 파악", "최근 풀이 지문 제외"] })}
    </section>
    <section class="quiz-review-entry"><div><p class="eyebrow">REVIEW NOTE</p><h2>오답·북마크 복습</h2><p>신규 문제와 섞지 않고, 다시 확인할 문제만 모아서 풀어보세요.</p></div><strong>${reviewIndexes.length}<small>문항</small></strong><button type="button" data-quiz-group="review" ${reviewIndexes.length ? "" : "disabled"}>복습 시작${icon("arrow", 14)}</button></section>
  </main>`;
}

function quizPage() {
  const plan = ensureQuizDailyPlan();
  if (!quizState.activeGroup) return quizLandingPage(plan);
  const filtered = getFilteredQuizIndexes();
  quizState.current = Math.min(Math.max(0, quizState.current), Math.max(0, filtered.length - 1));
  const realIndex = filtered[quizState.current] ?? -1;
  const question = realIndex >= 0 ? quizState.questions[realIndex] : null;
  const solved = question ? quizState.solvedMap[realIndex] : null;
  const total = quizState.questions.length;
  const solvedCount = Object.keys(quizState.solvedMap).length;
  const correctCount = Object.values(quizState.solvedMap).filter(result => result.correct).length;
  const todayCount = quizState.solvedDates.filter(date => date === quizTodayKey()).length;
  const progress = total ? Math.round((solvedCount / total) * 100) : 0;
  const accuracy = solvedCount ? Math.round((correctCount / solvedCount) * 100) : 0;
  const isDashboardDone = Boolean(homeStudyState.checked.quiz);
  const selectedChoice = Number.isInteger(quizState.selectedChoice) ? quizState.selectedChoice : null;
  const showResult = Boolean(solved) || quizState.answerVisible;
  const currentAnswer = solved ? solved.selected : selectedChoice;
  const currentCorrect = solved ? solved.correct : selectedChoice === question?.answer;
  const reviewNeeded = quizState.wrongSet.length + quizState.bookmarkSet.length;
  const level = quizLevelFromAccuracy(accuracy);
  const bookmarked = realIndex >= 0 && quizState.bookmarkSet.includes(realIndex);
  const weeklySolved = quizState.solvedDates.slice(-7).length;
  const quizMeta = syncHomeAppState().items.quiz || {};

  const choiceMarkup = question ? question.choices.map((choice, choiceIndex) => {
    const className = [
      choiceIndex === selectedChoice && !solved ? "selected" : "",
      showResult && choiceIndex === question.answer ? "correct" : "",
      showResult && choiceIndex === currentAnswer && choiceIndex !== question.answer ? "wrong" : "",
    ].filter(Boolean).join(" ");
    return `<button class="quiz-choice ${className}" type="button" data-quiz-choice="${choiceIndex}" ${solved ? "disabled" : ""}><span>${String.fromCharCode(65 + choiceIndex)}</span><b>${escapeMarkup(choice)}</b></button>`;
  }).join("") : "";

  const wrongDetails = question && showResult ? question.choices.map((choice, index) => {
    if (index === question.answer) return "";
    const detailIndex = question.choices.slice(0, index).filter((_, choiceIndex) => choiceIndex !== question.answer).length;
    return `<li><b>${String.fromCharCode(65 + index)}. ${escapeMarkup(choice)}</b><span>${escapeMarkup(question.wrongChoiceExplanations[detailIndex] || "정답 문맥과 맞지 않는 보기입니다.")}</span></li>`;
  }).join("") : "";
  const explanationMarkup = question && showResult && !quizState.examMode ? `<section class="quiz-explanation-card ${currentCorrect ? "good" : "bad"}">
    <div class="quiz-explanation-head"><span>${currentCorrect ? icon("check", 15) : "!"}</span><div><p>${currentCorrect ? "Correct Answer" : "Review Needed"}</p><h3>${currentCorrect ? "정답입니다." : "오답입니다. 해설을 확인하세요."}</h3></div><b>정답 ${String.fromCharCode(65 + question.answer)}</b></div>
    <div class="quiz-explanation-grid">
      <section><h4>Summary</h4><p>${escapeMarkup(question.explanation || "핵심 해설을 확인하세요.")}</p></section>
      <section><h4>Explanation</h4><p>${escapeMarkup(question.detailedExplanation || question.explanation || "문항의 문맥과 선택지의 기능을 비교해보세요.")}</p></section>
      <section><h4>Why Others Are Wrong</h4><ul>${wrongDetails}</ul></section>
      <section><h4>Example</h4>${(question.examples.length ? question.examples : ["Use the expression in a short workplace sentence."]).slice(0, 2).map(example => `<blockquote>${escapeMarkup(example)}</blockquote>`).join("")}</section>
    </div>
  </section>` : "";

  return `${header("매일 토익 풀기")}<main class="quiz-page ${quizState.darkMode ? "dark" : ""}">
    <button class="quiz-practice-back" type="button" data-quiz-home>${icon("arrow", 14)} 유형 선택으로 돌아가기</button>
    <section class="quiz-topbar compact"><div class="quiz-actions"><label>CSV 업로드<input type="file" data-quiz-csv accept=".csv"></label><button type="button" data-quiz-mode>${quizState.examMode ? "시험 모드" : "학습 모드"}</button><button type="button" data-quiz-retry>오답 다시풀기</button><button type="button" data-quiz-dark>${quizState.darkMode ? "라이트모드" : "다크모드"}</button><button class="warn" type="button" data-quiz-reset>기록 초기화</button></div></section>
    <section class="quiz-hero-dashboard">
      <div><p class="eyebrow">PRACTICAL RC TRAINING</p><h2>실전형 객관식 트레이닝</h2><span>토익 RC 형식은 참고하되, 문제와 지문은 업무·기술 맥락에 맞춘 자체 제작 4지선다 문제입니다.</span><div class="quiz-mix-line"><b>오늘의 새 문제 · 문법 2문항 + 독해 1문항</b><span>최근 풀이와 겹치지 않는 문제로 구성하고, 복습 필요 문제는 별도로 제공합니다.</span></div></div>
      <div class="quiz-kpi-grid"><article><span>Today Goal</span><b>${todayCount}/10</b><small>오늘 푼 문제</small></article><article><span>Accuracy</span><b>${accuracy}%</b><small>${correctCount}/${solvedCount || 0} correct</small></article><article><span>Level</span><b>${level}</b><small>현재 실력 추정</small></article><article><span>Review Needed</span><b>${reviewNeeded}</b><small>오답+북마크</small></article><article><span>Streak</span><b>${weeklySolved}</b><small>최근 7일 풀이</small></article></div>
    </section>
    <section class="quiz-objective-strip" aria-label="오늘의 객관식 문제 구성"><article><b>오늘의 새 문제</b><span>${plan.newIndexes.length}문항 · 최근 7일 중복 제외</span></article><article><b>구성</b><span>문법 2문항 + 짧은 독해 1문항</span></article><article><b>복습 문제</b><span>${plan.reviewIndexes.length ? `${plan.reviewIndexes.length}문항 별도 제공` : "복습 대기 없음"}</span></article></section>
    <section class="quiz-learning-status" aria-label="매일 토익 풀기 학습 상태"><div><b class="${isDashboardDone ? "done" : "todo"}">${isDashboardDone ? icon("check", 12) : ""}${isDashboardDone ? "완료됨" : "진행 전"}</b><span>${quizMeta.lastStudiedAt ? `최근 학습 · ${quizMeta.lastStudiedAt}` : "아직 오늘 문제를 풀지 않았어요"}</span><span data-quiz-score-meta>${quizMeta.score !== null && quizMeta.score !== undefined ? `최근 점수 · ${quizMeta.score}` : "최근 풀이 기록이 없어요"}</span></div><button type="button" data-quiz-dashboard-complete ${!solvedCount && !isDashboardDone ? "disabled" : ""}>${isDashboardDone ? "완료됨" : "학습 완료 처리"}</button><button type="button" data-quiz-dashboard-undo ${!isDashboardDone ? "disabled" : ""}>완료 해제</button></section>
    <section class="quiz-toolbar"><input type="search" data-quiz-search value="${escapeMarkup(quizState.search)}" placeholder="문제, 해설, 카테고리, 표현 검색"><select data-quiz-filter><option value="all">전체 보기</option><option value="unsolved" ${quizState.filter === "unsolved" ? "selected" : ""}>안 푼 문제</option><option value="solved" ${quizState.filter === "solved" ? "selected" : ""}>푼 문제</option><option value="wrong" ${quizState.filter === "wrong" ? "selected" : ""}>오답 문제</option></select></section>
    <div class="quiz-layout">
      <section class="quiz-main-stack">${question ? `<article class="quiz-question-card advanced"><div class="quiz-meta"><span class="${quizTypeTone(question.type)}">${escapeMarkup(question.type)}</span><span>${escapeMarkup(question.difficulty)}</span><span>${escapeMarkup(question.category)}</span><span>${escapeMarkup(question.estimatedTime)}</span>${solved ? `<span class="done">풀이 완료</span>` : ""}</div><div class="quiz-question-head"><div><p>${escapeMarkup(question.learningPoint)}</p><h3>${escapeMarkup(question.question)}</h3></div><button class="quiz-bookmark ${bookmarked ? "active" : ""}" type="button" data-quiz-bookmark="${realIndex}" aria-pressed="${bookmarked}" aria-label="헷갈린 문제 북마크">${icon("bookmark", 18)}</button></div>${question.passage ? `<div class="quiz-passage"><b>Short passage</b><p>${escapeMarkup(question.passage)}</p></div>` : ""}<div class="quiz-choices">${choiceMarkup}</div><div class="quiz-navigation"><button type="button" data-quiz-prev>이전</button><button type="button" data-quiz-next>다음</button><button class="secondary" type="button" data-quiz-retry-one="${realIndex}">다시 풀기</button><button class="primary" type="button" data-quiz-answer ${solved ? "disabled" : ""}>정답 확인</button></div><div class="quiz-review-actions"><button type="button" data-quiz-bookmark="${realIndex}">${bookmarked ? "북마크 해제" : "헷갈린 문제 저장"}</button><button type="button" data-quiz-retry>약점 유형 복습</button><button type="button" data-quiz-next>다음 문제</button></div></article>${explanationMarkup}` : `<section class="quiz-no-question"><b>조건에 맞는 문제가 없습니다.</b><span>검색어 또는 필터를 변경해 주세요.</span></section>`}</section>
      ${quizRelatedLearningPanel(question)}
    </div>
    <section class="quiz-performance-summary"><div><p class="eyebrow">PERFORMANCE SUMMARY</p><h3>학습 분석</h3><span>진행률 ${progress}% · 전체 ${solvedCount}/${total}문제 풀이</span></div><ul>${quizPerformanceRows()}</ul></section>
  </main>`;
}

function sentencePage() {
  const isDone = Boolean(homeStudyState.checked.sentence);
  const sentenceMeta = syncHomeAppState().items.sentence || {};
  const pageSize = 5;
  const pageCount = Math.ceil(sentenceLessons.length / pageSize);
  const todayKey = localDateKey();
  if (profileStorage.getItem("value_time_sentence_page_date") !== todayKey) {
    const todaySentenceIndex = Math.abs(dateSeed(todayKey)) % sentenceLessons.length;
    state.sentencePage = Math.floor(todaySentenceIndex / pageSize);
    profileStorage.setItem("value_time_sentence_page_date", todayKey);
    profileStorage.setItem("value_time_sentence_page", String(state.sentencePage));
  }
  state.sentencePage = Math.min(Math.max(state.sentencePage, 0), pageCount - 1);
  const pageSentences = sentenceLessons.slice(state.sentencePage * pageSize, (state.sentencePage + 1) * pageSize);
  const meaningClearCount = pageSentences.filter(item => state.understoodSentences.includes(item.id)).length;
  const pageGroupStart = Math.floor(state.sentencePage / 10) * 10;
  const visiblePages = Array.from({ length: Math.min(10, pageCount - pageGroupStart) }, (_, index) => pageGroupStart + index);
  const savedSentenceItems = state.savedSentences.map(id => sentenceLessons.find(item => item.id === id)).filter(Boolean).slice(-5);
  const representativeSentence = pageSentences[0];
  const additionalSentences = pageSentences.slice(1);
  const sentenceCard = (lesson, index, featured = false) => {
    const understood = state.understoodSentences.includes(lesson.id);
    const saved = state.savedSentences.includes(lesson.id);
    return `<article class="sentence-today-item ${featured ? "sentence-featured-item" : ""} ${understood ? "understood all-clear" : ""}" data-sentence-card="${lesson.id}">
      <div class="sentence-today-top"><span>${featured ? "TODAY" : String(state.sentencePage * pageSize + index + 1).padStart(4, "0")}</span><em>${lesson.category}</em><div><button class="sentence-understand-toggle ${understood ? "active" : ""}" type="button" data-understand-sentence="${lesson.id}" aria-pressed="${understood}">${icon("check",13)} Meaning Clear</button><button class="sentence-save-toggle ${saved ? "active" : ""}" type="button" data-save-sentence="${lesson.id}" aria-pressed="${saved}" aria-label="문장 ${saved ? "저장 취소" : "저장"}">${icon("bookmark",17)}</button></div></div>
      <div class="sentence-today-title"><h4>${lesson.en}</h4><button type="button" data-speak="${lesson.en}" aria-label="영어 문장 듣기">${icon("volume",19)}</button></div><button class="vocab-meaning-cover sentence-meaning-cover" type="button" data-vocab-meaning-toggle aria-expanded="false"><span>뜻 보기</span><strong>${lesson.ko}</strong></button>
      <div class="sentence-pattern-box"><span>${icon("spark",15)}</span><div><b>${lesson.pattern}</b><p>${lesson.meaning}</p></div></div>
      <a href="${lesson.sourceUrl}" target="_blank" rel="noopener noreferrer">출처 안내 · ${lesson.source} ${icon("arrow",12)}</a>
    </article>`;
  };

  return `${header("매일 1문장")}<main class="sentence-dashboard-page">
    <div class="sentence-dashboard-layout">
      <section class="sentence-learning-panel">
        <div class="sentence-list-head"><div><h3>오늘 외울 대표 문장</h3><p>상단 문장 하나를 먼저 듣고 뜻을 이해한 뒤 Meaning Clear를 눌러주세요.</p></div><b>${pageSentences.length} SENTENCES · <span data-sentence-clear-count>${meaningClearCount}</span> MEANING CLEAR</b></div>
        <div class="sentence-featured-list">${representativeSentence ? sentenceCard(representativeSentence, 0, true) : ""}</div>
        <div class="sentence-library-head"><h3>문장 목록</h3><p>대표 문장 학습 후 다양한 패턴의 문장을 이어서 익혀보세요.</p></div>
        <div class="sentence-today-list sentence-library-list">${additionalSentences.map((lesson, index) => sentenceCard(lesson, index + 1)).join("")}</div>
        <nav class="sentence-page-navigation" aria-label="TOEIC 문장 목록 페이지 이동"><button class="sentence-page-edge" type="button" data-sentence-target="0" ${state.sentencePage === 0 ? "disabled" : ""} aria-label="첫 페이지로 이동">&laquo;</button><button class="sentence-page-edge" type="button" data-sentence-target="${Math.max(0, state.sentencePage - 1)}" ${state.sentencePage === 0 ? "disabled" : ""} aria-label="이전 페이지로 이동">&lsaquo;</button><span class="sentence-page-numbers">${visiblePages.map(pageIndex => `<button class="${pageIndex === state.sentencePage ? "active" : ""}" type="button" data-sentence-target="${pageIndex}" ${pageIndex === state.sentencePage ? 'aria-current="page"' : ""}>${pageIndex + 1}</button>`).join("")}</span><button class="sentence-page-edge" type="button" data-sentence-target="${Math.min(pageCount - 1, state.sentencePage + 1)}" ${state.sentencePage === pageCount - 1 ? "disabled" : ""} aria-label="다음 페이지로 이동">&rsaquo;</button><button class="sentence-page-edge" type="button" data-sentence-target="${pageCount - 1}" ${state.sentencePage === pageCount - 1 ? "disabled" : ""} aria-label="마지막 페이지로 이동">&raquo;</button><small>${state.sentencePage + 1} / ${pageCount} 페이지</small></nav>
      </section>
      <aside class="sentence-dashboard-side">
        <section class="sentence-status-card"><span class="sentence-side-icon">${icon("calendar",18)}</span><div><h3>학습 상태</h3><b class="sentence-status-badge ${isDone ? "done" : "todo"}">${isDone ? icon("check",12) : ""}${isDone ? "완료됨" : "진행 전"}</b><p>${sentenceMeta.lastStudiedAt ? `최근 학습 · ${sentenceMeta.lastStudiedAt}` : "최근 학습 기록 없음"}</p></div></section>
        <section class="sentence-saved-summary"><span class="sentence-side-icon">${icon("bookmark",18)}</span><div><h3>저장한 문장</h3><strong>${state.savedSentences.length}</strong><p>${savedSentenceItems.length ? savedSentenceItems.map(item => `<button type="button" data-speak="${item.en}" title="문장 듣기">#${item.rank} ${icon("volume",11)}</button>`).join("") : "북마크 버튼으로 중요한 문장을 저장해보세요."}</p></div></section>
        <section><span class="sentence-side-icon">${icon("message",18)}</span><div><h3>오늘의 학습 가이드</h3><p>현재 페이지의 문장을 모두 Meaning Clear하면 오늘의 학습 완료로 자동 반영됩니다.</p></div></section>
        <section><span class="sentence-side-icon">${icon("check",18)}</span><div><h3>데이터 안내</h3><p>업무·일정·회의·고객 응대 중심의 TOEIC형 자체 제작 문장 1,000개가 200페이지에 저장되어 있습니다.</p></div></section>
        <section class="sentence-complete-box"><button class="primary ${isDone ? "done" : ""}" type="button" disabled>${icon("check",17)} ${isDone ? "오늘 학습 완료됨" : `${pageSentences.length}개 완료 시 자동 완료`}</button><button class="secondary" type="button" data-sentence-undo ${!isDone ? "disabled" : ""}>완료 해제</button><p aria-live="polite">${isDone ? "모든 문장의 Meaning Clear 학습이 완료되어 자동으로 저장되었습니다." : `현재 페이지의 Meaning Clear ${pageSentences.length}개를 모두 완료해주세요.`}</p></section>
      </aside>
    </div>
  </main>`;
}

function completeSentenceStudyIfAllMeaningClear() {
  const pageSize = 5;
  const pageSentences = sentenceLessons.slice(state.sentencePage * pageSize, (state.sentencePage + 1) * pageSize);
  if (!pageSentences.length || !pageSentences.every(item => state.understoodSentences.includes(item.id)) || homeStudyState.checked.sentence) return;
  homeStudyState.checked.sentence = true;
  saveHomeStudyState("sentence");
}

function getSavedWordEntries() {
  return state.savedWords
    .map(savedWord => words.find(item => item.word === savedWord))
    .filter(Boolean);
}

function getSavedSentenceEntries() {
  return state.savedSentences
    .map(id => {
      const index = sentenceLessons.findIndex(item => item.id === id);
      if (index < 0) return null;
      return { ...sentenceLessons[index], index };
    })
    .filter(Boolean);
}

function getUnifiedSavedLearningItems() {
  const generalItems = normalizeSavedLearningItems({
    words: getSavedWordEntries().map(word => ({ ...word, example: vocabNaturalExample(word, 0).en })),
    sentences: getSavedSentenceEntries(),
    blogItems: state.savedBlogItems,
  });
  const csatProgress = readStoredJSON("valuetime_csat_vocab_v1", { wrong: {} });
  const csatItems = Object.entries(csatProgress.wrong || {})
    .filter(([, history]) => !history.resolvedAt && history.word && history.meaning)
    .map(([id, history]) => ({
      id: `csat-vocab:${id}`,
      type: "word",
      text: history.word,
      meaning: history.meaning,
      example: `Word Master ${history.series || "수능"} · Day ${history.day || "-"}`,
      savedAt: history.lastWrongAt || new Date().toISOString(),
      sourceType: "csat-vocab",
      sourceId: id,
      sourceTitle: "수능 단어 오답",
      wrongCount: history.count || 1,
    }));
  return [...generalItems, ...csatItems];
}

function syncCsatReviewAnswer(item, correct) {
  if (item?.sourceType !== "csat-vocab" || !item.sourceId) return;
  const csatProgress = readStoredJSON("valuetime_csat_vocab_v1", { statuses: {}, wrong: {}, tests: [] });
  const previous = csatProgress.wrong?.[item.sourceId];
  if (!previous) return;
  const now = new Date().toISOString();
  csatProgress.wrong = {
    ...csatProgress.wrong,
    [item.sourceId]: correct
      ? { ...previous, resolvedAt: now, lastChatbotCorrectAt: now, chatbotCorrectCount: (previous.chatbotCorrectCount || 0) + 1 }
      : { ...previous, resolvedAt: null, lastWrongAt: now, count: (previous.count || 0) + 1 },
  };
  profileStorage.setItem("valuetime_csat_vocab_v1", JSON.stringify(csatProgress));
  window.dispatchEvent(new CustomEvent("valuetime-csat-progress", { detail: csatProgress }));
}

function getReviewChatbotItems() {
  const items = getUnifiedSavedLearningItems();
  return isAcademicMode()
    ? items.filter(item => item.sourceType === "csat-vocab" || item.sourceType === "suneung")
    : items.filter(item => item.sourceType !== "csat-vocab" && item.sourceType !== "suneung");
}

function reviewChatbotUi() {
  const items = getReviewChatbotItems();
  items.forEach(item => {
    reviewProgressMap[item.id] ||= createReviewProgress(item);
    if (item.sourceType === "csat-vocab") {
      const savedAt = new Date(item.savedAt).getTime();
      const reviewedAt = new Date(reviewProgressMap[item.id].lastReviewedAt || 0).getTime();
      if (savedAt > reviewedAt) {
        reviewProgressMap[item.id] = {
          ...reviewProgressMap[item.id],
          nextReviewAt: item.savedAt,
          wrongCount: Math.max(reviewProgressMap[item.id].wrongCount || 0, item.wrongCount || 1),
          status: "wrong",
        };
      }
    }
  });
  const dueEntries = selectDueReviewItems(items, reviewProgressMap);
  const retainedItem = items.find(item => item.id === reviewChatState.selected);
  const selected = reviewChatState.answered !== null && retainedItem
    ? { item: retainedItem, progress: reviewProgressMap[retainedItem.id], overdueDays: 0 }
    : dueEntries.find(entry => entry.item.id === reviewChatState.selected) || dueEntries[0];
  const question = selected ? createReviewQuestion(selected, items) : null;
  const result = reviewChatState.answered !== null && question ? reviewChatState.answered === question.answer : null;
  const scopeLabel = isAcademicMode() ? `${currentModeConfig().shortLabel} 학습 복습` : audienceMode === "kids" ? "초등 학습 복습" : "일반 학습 복습";
  const panel = reviewChatState.open ? `<aside class="review-chat-panel"><header><div><span>AI REVIEW · ${scopeLabel}</span><h2>Review Chatbot</h2></div><button type="button" data-review-close>${icon("x",18)}</button></header><div class="review-chat-progress"><span>${scopeLabel}</span><b>${Math.max(0,dueEntries.length)}개 남음</b></div><div class="review-chat-body">${question?`<div class="chat-bubble">${selected.overdueDays?`${selected.overdueDays}일 밀린 복습이에요. `:""}${scopeLabel}에서 10초만 집중해볼까요?</div><article class="review-quiz-card"><em>${selected.item.sourceType === "csat-vocab" ? "WORD MASTER" : selected.item.sourceType?.toUpperCase() || "SAVED ITEM"}</em><h3>${question.prompt}</h3><div>${question.choices.map((choice,index)=>`<button class="${reviewChatState.answered===index?"selected":""} ${result!==null&&index===question.answer?"correct":""} ${result===false&&reviewChatState.answered===index?"wrong":""}" type="button" data-review-answer="${index}" ${reviewChatState.answered!==null?"disabled":""}>${choice}</button>`).join("")}</div>${result!==null?`<section class="review-result ${result?"success":"error"}"><b>${result?"Excellent! 기억 수명이 연장됐어요.":"괜찮아요. 오답 노트에 담아둘게요."}</b><p>${selected.item.example || selected.item.meaning}</p></section>`:""}</article>${result!==null?`<div class="review-chat-actions"><button type="button" data-review-more>하나 더</button><button type="button" data-review-done>오늘은 완료</button><button type="button" data-review-wrong>오답 노트 ${reviewChatState.wrongNotes.length}</button></div>`:""}`:`<div class="review-empty">${icon("check",28)}<h3>지금 복습할 항목이 없어요.</h3><p>${scopeLabel} 항목이 쌓이면 적절한 시점에 다시 알려드릴게요.</p></div>`}</div></aside>`:"";
  return `<div class="review-chatbot"><div class="review-tooltip ${dueEntries.length?"":"hidden"}">Pop quiz! 저장한 표현을 복습할 시간이에요.<small>10초면 충분해요.</small></div><button class="review-fab" type="button" data-review-open aria-label="복습 챗봇 열기">${icon("message",23)}${dueEntries.length?`<b>${dueEntries.length}</b>`:""}</button>${panel}</div>`;
}

function selectionAssistantUi() {
  const selected = escapeMarkup(selectionAssistantState.text || "");
  const panel = selectionAssistantState.open ? `<aside class="selection-ai-panel" aria-label="선택 문장 AI 분석">
    <header><div><span>${icon("spark",18)}</span><section><b>AI 문장 비서</b><small>한글 번역부터 단어별 뜻과 유사문장까지 확인해요</small></section></div><button type="button" data-selection-ai-close aria-label="닫기">${icon("x",18)}</button></header>
    <div class="selection-ai-context"><small>현재 분석 문장</small><p>${selected}</p></div>
    <div class="selection-ai-chat" data-selection-ai-chat><div class="selection-ai-user"><small>${selectionAssistantState.origin === "icon" ? "문장 옆 AI 비서 요청" : "드래그 분석 요청"}</small><p>${selected}</p></div><div class="selection-ai-loading" data-selection-ai-loading><i></i><i></i><i></i><span>한글 번역과 단어별 뜻을 정리하고 있어요</span></div></div>
  </aside>` : "";
  return `<button class="selection-ai-trigger" type="button" data-selection-ai-trigger aria-label="선택한 영어 분석">${icon("spark",14)} <span>문장 분석</span></button>${panel}<div class="selection-ai-toast" data-selection-ai-toast role="status">${icon("check",14)} 학습장에 문장과 분석 결과가 저장되었습니다.</div>`;
}

function findSentenceVerb(text) {
  const auxiliary = text.match(/\b(has|have|had|will|would|can|could|may|might|must|should|is|are|am|was|were|do|does|did)\s+(?:not\s+)?(?:been\s+|being\s+)?[A-Za-z]+(?:ed|en|ing)?\b/i);
  if (auxiliary) return { phrase: auxiliary[0], index: auxiliary.index };
  const common = text.match(/\b(?:believe|believes|believed|invest|invests|invested|help|helps|helped|make|makes|made|take|takes|took|need|needs|needed|use|uses|used|show|shows|showed|provide|provides|provided|respond|responds|responded|stabilize|stabilizes|stabilized|become|becomes|became|remain|remains|remained|continue|continues|continued)\b/i);
  return common ? { phrase: common[0], index: common.index } : { phrase: "핵심 동사를 문맥에서 확인", index: -1 };
}

function sentenceTenseAnalysis(text) {
  if (/\b(has|have)\s+(?:been\s+)?\w+(?:ed|en)\b/i.test(text)) return "현재완료: 과거에 시작된 행위나 결과가 현재까지 이어지는 관점입니다. have/has + 과거분사 형태를 사용합니다.";
  if (/\bhad\s+(?:been\s+)?\w+(?:ed|en)\b/i.test(text)) return "과거완료: 과거의 특정 시점보다 더 먼저 일어난 사건을 나타냅니다. had + 과거분사 구조입니다.";
  if (/\b(am|is|are)\s+\w+ing\b/i.test(text)) return "현재진행: 말하는 시점에 진행 중이거나 일시적으로 계속되는 상황을 나타냅니다.";
  if (/\b(was|were)\s+\w+ing\b/i.test(text)) return "과거진행: 과거의 특정 시점에 진행 중이던 상황을 배경처럼 제시합니다.";
  if (/\b(am|is|are|was|were|been)\s+\w+(?:ed|en)\b/i.test(text)) return "수동태: be동사 + 과거분사로, 행위자보다 행위의 대상이나 결과에 초점을 둡니다.";
  if (/\bwill\s+(?:be\s+)?\w+/i.test(text)) return "미래 표현: will + 동사원형으로 예측·의지·향후 결과를 나타냅니다.";
  if (/\b(can|could|may|might|must|should|would)\s+\w+/i.test(text)) return "조동사 구조: 조동사 + 동사원형으로 가능성·의무·추측·조언 등의 태도를 더합니다.";
  if (/\b\w+ed\b/i.test(text)) return "단순과거 가능성이 높습니다. 과거의 완료된 사건이나 상태를 시간축 위에 배치합니다.";
  return "단순현재 중심 문장입니다. 일반적 사실, 반복되는 행동 또는 현재의 상태를 전달합니다.";
}

function sentencePatternAnalysis(text) {
  const patterns = [];
  if (/\bin an effort to\b/i.test(text)) patterns.push("in an effort to + 동사원형: ‘~하려는 노력으로’라는 목적 표현");
  if (/\bin order to\b/i.test(text)) patterns.push("in order to + 동사원형: 목적을 분명하게 나타내는 부사적 표현");
  if (/\bso that\b/i.test(text)) patterns.push("so that + 주어 + 동사: 목적 또는 결과를 나타내는 절");
  if (/\b(?:because|since|as)\b/i.test(text)) patterns.push("because/since/as 절: 이유나 원인을 제시하는 부사절");
  if (/\b(?:although|though|even though)\b/i.test(text)) patterns.push("although/though 절: 주절과 반대되는 양보 정보를 제시");
  if (/\b(?:which|who|that)\b/i.test(text)) patterns.push("관계사절 가능성: 앞의 명사를 뒤에서 구체적으로 수식");
  if (/\bto\s+[a-z]+\b/i.test(text)) patterns.push("to부정사: 문맥에 따라 목적·결과 또는 명사 수식 역할");
  if (/\b(?:in|on|at|for|with|by|from|of)\s+(?:the\s+|a\s+|an\s+)?[a-z]/i.test(text)) patterns.push("전치사구: 장소·대상·수단·범위 등의 부가 정보를 제공");
  return patterns.length ? patterns.join("<br>• ") : "핵심 어순은 주어 + 동사(구)를 중심으로 하고, 뒤의 수식어가 의미를 확장합니다.";
}

function knownSentenceTranslation(text) {
  const cleaned = text.replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "").toLowerCase();
  const titleTranslations = {
    "why productive struggle improves learning": "생산적인 어려움이 학습을 향상시키는 이유",
    "why predictions improve reading": "예측이 독해를 향상시키는 이유",
    "the hidden cost of constant choice": "끊임없는 선택에 숨겨진 비용",
  };
  if (titleTranslations[cleaned]) return titleTranslations[cleaned];
  for (const passage of suneungPassages) {
    const index = passage.paragraphs.findIndex(paragraph => paragraph.replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "").toLowerCase() === cleaned);
    if (index >= 0) return passage.translations[index] || "";
    const containingIndex = passage.paragraphs.findIndex(paragraph => paragraph.replace(/\s+/g, " ").trim().toLowerCase().includes(cleaned));
    if (containingIndex >= 0) return passage.translations[containingIndex] || "";
  }
  for (const article of articleLibrary || []) {
    const sentence = article.sentences?.find(item => String(item.en || "").replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "").toLowerCase() === cleaned);
    if (sentence?.ko) return sentence.ko;
  }
  return "AI 번역 연결을 통해 문맥에 맞는 자연스러운 한국어 해석을 제공합니다.";
}

function normalizeSentenceAssistantSections(sections, fallbackSections) {
  const expected = [
    { title: "문장 번역", aliases: ["문장 번역", "자연스러운 해석", "번역"] },
    { title: "단어별 뜻", aliases: ["단어별 뜻", "단어 뜻", "어휘 뜻"] },
    { title: "자주 착각하는 문법", aliases: ["자주 착각하는 문법", "자주 하는 실수", "문법 함정"] },
    { title: "유사문장", aliases: ["유사문장", "유사 예문", "비슷한 문장"] },
  ];
  return expected.map((item, index) => {
    const matched = Array.isArray(sections) ? sections.find(section => item.aliases.some(alias => String(section?.title || "").includes(alias))) : null;
    const body = typeof matched?.body === "string" ? matched.body.trim() : "";
    return body ? { title: item.title, body: escapeMarkup(body).replace(/\n/g, "<br>") } : fallbackSections[index];
  });
}

function sentenceWordMeanings(text) {
  const commonMeanings = {
    a: "하나의, 어떤", an: "하나의, 어떤", the: "그, 해당", and: "그리고", or: "또는", but: "하지만",
    that: "~라는 것, 그", this: "이것, 이", these: "이것들", those: "저것들", of: "~의", to: "~로, ~하기",
    in: "~안에, ~에서", on: "~위에, ~에", at: "~에서", for: "~을 위해", with: "~와 함께, ~을 가지고",
    by: "~에 의해, ~로", from: "~로부터", as: "~로서, ~처럼", is: "~이다", are: "~이다", was: "~였다", were: "~였다",
    be: "~이다, 존재하다", been: "be의 과거분사", being: "존재함, ~되고 있는", have: "가지다", has: "가지고 있다", had: "가지고 있었다",
    do: "하다", does: "한다", did: "했다", can: "~할 수 있다", could: "~할 수 있었다", may: "~일 수 있다",
    might: "~일지도 모른다", must: "~해야 한다", should: "~해야 한다, ~일 것으로 보다", will: "~할 것이다", would: "~할 것이다",
    often: "자주", usually: "보통", always: "항상", never: "결코 ~않다", more: "더 많은, 더", most: "가장 많은, 가장",
    students: "학생들", student: "학생", learning: "학습", effective: "효과적인", smooth: "매끄러운", effortless: "힘이 들지 않는",
    assume: "가정하다, 생각하다", feel: "느끼다", improves: "향상시킨다", improve: "향상시키다", reading: "읽기, 독해",
    why: "왜, ~하는 이유", productive: "생산적인", struggle: "어려움, 분투", predictions: "예측들", prediction: "예측",
  };
  const tokens = text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
  const uniqueTokens = tokens.filter((token, index) => tokens.findIndex(item => item.toLowerCase() === token.toLowerCase()) === index);
  const lookupMeaning = token => {
    const lower = token.toLowerCase();
    if (commonMeanings[lower]) return commonMeanings[lower];
    const candidates = [lower, lower.replace(/ies$/, "y"), lower.replace(/es$/, ""), lower.replace(/s$/, ""), lower.replace(/ied$/, "y"), lower.replace(/ed$/, ""), lower.replace(/ing$/, "")];
    const found = words.find(item => candidates.includes(String(item.word || "").toLowerCase()));
    return found?.meaning || "문맥에 따라 뜻 확인";
  };
  return `<div class="selection-ai-word-list">${uniqueTokens.map(token => `<p><b>${escapeMarkup(token)}</b><span>${escapeMarkup(lookupMeaning(token))}</span></p>`).join("")}</div>`;
}

function similarSentenceExamples(text) {
  if (/^why\b/i.test(text)) return [
    ["Why Regular Review Improves Memory", "정기적인 복습이 기억력을 향상시키는 이유"],
    ["Why Active Reading Deepens Understanding", "능동적인 읽기가 이해를 깊게 하는 이유"],
  ];
  if (/\b(has|have)\b/i.test(text)) return [
    ["Researchers have developed a more effective method.", "연구자들은 더 효과적인 방법을 개발해 왔다."],
    ["The program has helped students build confidence.", "그 프로그램은 학생들이 자신감을 기르는 데 도움을 주었다."],
  ];
  if (/\b(which|who|that)\b/i.test(text)) return [
    ["The strategy that worked yesterday may not work today.", "어제 효과가 있었던 전략이 오늘은 효과가 없을 수도 있다."],
    ["Students who ask questions often understand the topic better.", "질문하는 학생들은 주제를 더 잘 이해하는 경우가 많다."],
  ];
  return [
    ["Careful practice improves performance over time.", "신중한 연습은 시간이 지나면서 수행 능력을 향상시킨다."],
    ["A clear purpose helps learners stay focused.", "분명한 목적은 학습자가 집중을 유지하도록 돕는다."],
  ];
}

function commonMistakeAnalysis(text) {
  if (/\bshould\b/i.test(text)) return "<b>should를 항상 ‘~해야 한다’로 번역하지 마세요.</b><br>왜 헷갈리나요? 의무 표현으로 먼저 외우기 쉽기 때문입니다.<br>어떻게 읽나요? 생각·기대 문맥에서는 ‘원래 ~할 것으로 기대하다’라는 통념으로 읽습니다.";
  if (/\b(which|who|that)\b/i.test(text)) return "<b>관계사절이나 that절의 수식 범위를 확인하세요.</b><br>왜 헷갈리나요? that을 앞 명사의 수식어로만 보기 쉽기 때문입니다.<br>어떻게 읽나요? 앞의 동사가 목적어절을 요구하는지, 바로 앞 명사를 꾸미는지 먼저 판단합니다.";
  if (/\bto\s+[a-z]+\b/i.test(text)) return "<b>to부정사를 무조건 ‘~하기 위해’로 읽지 마세요.</b><br>왜 헷갈리나요? 목적 용법이 가장 익숙하기 때문입니다.<br>어떻게 읽나요? 앞 명사를 꾸미는지, 동사의 목적어인지, 행동의 목적을 나타내는지 문장 속 위치로 판단합니다.";
  if (/\b(am|is|are|was|were|feel|become|remain)\b/i.test(text)) return "<b>동사 뒤 형용사를 목적어로 착각하지 마세요.</b><br>왜 헷갈리나요? 동사 뒤의 요소를 모두 목적어로 보기 쉽기 때문입니다.<br>어떻게 읽나요? 연결동사 뒤의 형용사는 주어의 상태를 설명하는 보어로 연결합니다.";
  return "<b>수식어보다 주어와 중심 동사를 먼저 찾으세요.</b><br>왜 헷갈리나요? 긴 전치사구와 부사구를 핵심 문장 성분으로 오해하기 쉽기 때문입니다.<br>어떻게 읽나요? 주어·동사를 먼저 연결하고 나머지 정보를 뒤에서 덧붙입니다.";
}

function detailedSelectionAnalysis(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const target = /has invested/i.test(cleaned) && /in an effort to/i.test(cleaned);
  const singleWord = /^[-A-Za-z']+$/.test(cleaned);
  if (singleWord) return [
    { title: "문장 번역", body: `선택한 단어 <b>${cleaned}</b>의 자연스러운 뜻은 현재 문맥과 함께 확인해야 합니다.<br><b>핵심 의미</b> 단독 의미보다 앞뒤 문장 속 쓰임을 우선하세요.` },
    { title: "단어별 뜻", body: sentenceWordMeanings(cleaned) },
    { title: "자주 착각하는 문법", body: "같은 철자라도 품사와 문맥에 따라 뜻이 달라질 수 있습니다. 단어 하나보다 포함된 문장 전체를 선택해 분석하는 것이 정확합니다." },
    { title: "유사문장", body: "전체 문장을 선택하면 같은 단어와 패턴을 활용한 유사문장 2~3개를 제공합니다." },
  ];
  const verb = findSentenceVerb(cleaned);
  const subject = verb.index > 0 ? cleaned.slice(0, verb.index).replace(/[,;:]$/, "").trim() : "문맥상 주어 확인 필요";
  const predicate = verb.index >= 0 ? cleaned.slice(verb.index).trim() : cleaned;
  const prepPhrases = [...cleaned.matchAll(/\b(in|on|at|for|with|by|from|of|about|through|during|into|across|between)\b\s+[^,.;]+/gi)].map(match => match[0]).slice(0, 4);
  const clauseWords = [...cleaned.matchAll(/\b(because|although|though|if|when|while|that|which|who|where|so that)\b/gi)].map(match => match[0]);
  const similarExamples = similarSentenceExamples(cleaned);
  const naturalTranslation = target ? "회사는 글로벌 시장 점유율을 안정시키기 위한 노력의 일환으로 최신 기술에 투자해 왔습니다." : knownSentenceTranslation(cleaned);
  return [
    { title: "문장 번역", body: `<b>자연스러운 해석</b><br>${naturalTranslation}<br><br><b>직역</b><br>${naturalTranslation}<br><br><b>핵심 의미</b><br>${naturalTranslation}` },
    { title: "단어별 뜻", body: sentenceWordMeanings(cleaned) },
    { title: "자주 착각하는 문법", body: commonMistakeAnalysis(cleaned) },
    { title: "유사문장", body: `<b>공통 패턴</b><br>현재 문장의 중심 동사와 문법 구조를 같은 순서로 적용합니다.<br><br>${similarExamples.map(([english, korean]) => `<b>${english}</b><br>${korean}`).join("<br><br>")}` },
  ];
}

function positionSelectionTrigger(rect) {
  const trigger = document.querySelector("[data-selection-ai-trigger]");
  if (!trigger) return;
  const width = 112, height = 38, gap = 9;
  const left = Math.min(Math.max(rect.right - width, 12), window.innerWidth - width - 12);
  let top = rect.top - height - gap;
  if (top < 12) top = Math.min(rect.bottom + gap, window.innerHeight - height - 12);
  trigger.style.left = `${left}px`;
  trigger.style.top = `${top}px`;
  trigger.classList.add("visible");
}

function hideSelectionTrigger() {
  document.querySelector("[data-selection-ai-trigger]")?.classList.remove("visible");
}

function captureLearningSelection() {
  const selection = window.getSelection();
  const text = selection?.toString().replace(/\s+/g, " ").trim() || "";
  if (!selection || !selection.rangeCount || text.length <= 3 || !/[A-Za-z]/.test(text)) return hideSelectionTrigger();
  const range = selection.getRangeAt(0);
  const node = range.commonAncestorContainer.nodeType === Node.TEXT_NODE ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer;
  const content = document.querySelector(".content");
  if (!content?.contains(node) || node.closest("input,textarea,select,a,.selection-ai-panel,.nav-item")) return hideSelectionTrigger();
  selectionAssistantState.text = text;
  selectionAssistantState.range = range.cloneRange();
  selectionAssistantState.saved = state.savedBlogItems.some(item => item.id === `selection:${text.toLowerCase()}`);
  positionSelectionTrigger(range.getBoundingClientRect());
}

async function appendSelectionAnalysis() {
  const chat = document.querySelector("[data-selection-ai-chat]");
  if (!chat) return;
  const fallbackCards = detailedSelectionAnalysis(selectionAssistantState.text);
  document.querySelector("[data-selection-ai-loading]")?.remove();
  fallbackCards.forEach((item, index) => chat.insertAdjacentHTML("beforeend", `<details class="selection-ai-card selection-ai-learning-card" data-selection-ai-section="${index}" ${index === 0 ? "open" : ""}><summary><i>${String(index + 1).padStart(2, "0")}</i><span>${escapeMarkup(item.title)}</span><em>${index === 0 ? "한글 뜻을 먼저 확인하세요" : index === 1 ? "문장 속 단어 뜻을 확인하세요" : index === 2 ? "실수 포인트를 확인하세요" : "같은 패턴을 연습하세요"}</em></summary><div>${item.body}</div></details>`));
  chat.scrollTo({ top: 0, behavior: "smooth" });

  let web = { results: [], searchUrl: `https://www.bing.com/search?q=${encodeURIComponent(`"${selectionAssistantState.text}" English grammar`)}` };
  try {
    const response = await fetch(`/api/sentence-web-search?sentence=${encodeURIComponent(selectionAssistantState.text)}`, { cache: "no-store" });
    if (response.ok) web = await response.json();
  } catch {}
  selectionAssistantState.web = web;
  try {
    const aiResponse = await fetch("/api/ai-sentence-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence: selectionAssistantState.text, web }),
    });
    const aiResult = await aiResponse.json();
    if (aiResult.ai && Array.isArray(aiResult.sections)) {
      const cards = normalizeSentenceAssistantSections(aiResult.sections, fallbackCards);
      cards.forEach((item, index) => {
        const card = document.querySelector(`[data-selection-ai-section="${index}"]`);
        if (!card || !selectionAssistantState.open) return;
        const title = card.querySelector("summary span");
        const body = card.querySelector(":scope > div");
        if (title) title.textContent = item.title;
        if (body) body.innerHTML = item.body;
      });
    }
  } catch {}
  const activeChat = document.querySelector("[data-selection-ai-chat]");
  if (!activeChat || !selectionAssistantState.open) return;
  const sources = (web.results || []).map(result => `<a href="${escapeMarkup(result.url)}" target="_blank" rel="noopener noreferrer"><b>${escapeMarkup(result.title)}</b><span>${escapeMarkup(result.snippet || new URL(result.url).hostname)}</span>${icon("arrow",12)}</a>`).join("");
  activeChat.insertAdjacentHTML("beforeend", `<details class="selection-ai-card selection-ai-web"><summary>참고 자료</summary><p>필요할 때만 웹 검색 자료를 확인하세요.</p>${sources || "<p class=\"selection-ai-web-empty\">일치하는 공개 자료가 없습니다.</p>"}<a class="selection-ai-search-all" href="${escapeMarkup(web.searchUrl)}" target="_blank" rel="noopener noreferrer">웹에서 검색 결과 전체 보기 ${icon("arrow",12)}</a></details><button class="selection-ai-save ${selectionAssistantState.saved ? "saved" : ""}" type="button" data-selection-ai-save ${selectionAssistantState.saved ? "disabled" : ""}>${icon(selectionAssistantState.saved ? "check" : "bookmark",14)} ${selectionAssistantState.saved ? "학습장에 저장됨" : "학습장 저장"}</button>`);
}

function openSentenceAssistant(text, origin = "icon") {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (cleaned.length <= 3 || !/[A-Za-z]/.test(cleaned)) return;
  selectionAssistantState.text = cleaned;
  selectionAssistantState.origin = origin;
  selectionAssistantState.open = true;
  selectionAssistantState.busy = true;
  selectionAssistantState.web = null;
  selectionAssistantState.saved = state.savedBlogItems.some(item => item.id === `selection:${cleaned.toLowerCase()}`);
  reviewChatState.open = false;
  hideSelectionTrigger();
  window.getSelection()?.removeAllRanges();
  render();
  setTimeout(() => { selectionAssistantState.busy = false; appendSelectionAnalysis(); }, 650);
}

function isAnalyzableEnglishSentence(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
  return cleaned.length >= 18 && words.length >= 4 && /[.!?]$/.test(cleaned) && !/^https?:/i.test(cleaned);
}

function decorateEnglishSentences() {
  const root = document.querySelector(".content main");
  if (!root) return;
  const addSentenceIcon = (element, sentence) => {
    if (!element || element.querySelector(":scope > .sentence-ai-icon")) return;
    element.dataset.noAiSentence = "";
    element.classList.add("sentence-ai-container");
    const nestedInteractive = Boolean(element.closest("button,a"));
    const button = document.createElement(nestedInteractive ? "span" : "button");
    if (!nestedInteractive) button.type = "button";
    else { button.setAttribute("role", "button"); button.tabIndex = 0; }
    button.className = "sentence-ai-icon";
    button.dataset.aiSentence = sentence;
    button.title = "AI 비서로 문장 분석";
    button.setAttribute("aria-label", `AI 문장 분석: ${sentence.slice(0, 60)}`);
    button.innerHTML = `${icon("spark",12)}<span>AI 분석</span>`;
    button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openSentenceAssistant(sentence, "icon"); });
    button.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); openSentenceAssistant(sentence, "icon"); } });
    element.append(button);
  };
  root.querySelectorAll(".vocab-today-item blockquote>b,.word-card .example>b,.sentence-main-title h3,.sentence-example-list b,.sentence-line,.ted-transcript-line b,.article-study-sentence>b,.reader-sentence>b").forEach(element => {
    const sentence = element.textContent.replace(/\s+/g, " ").trim();
    if (isAnalyzableEnglishSentence(sentence)) addSentenceIcon(element, sentence);
  });
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("button,a,input,textarea,select,option,script,style,code,.selection-ai-panel,.sentence-ai-inline,[data-no-ai-sentence]")) return NodeFilter.FILTER_REJECT;
      return /[A-Za-z]/.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    const parts = (node.nodeValue || "").match(/[^.!?]+[.!?]+|[^.!?]+$/g);
    if (!parts?.some(isAnalyzableEnglishSentence)) return;
    const fragment = document.createDocumentFragment();
    parts.forEach(part => {
      if (!isAnalyzableEnglishSentence(part)) { fragment.append(document.createTextNode(part)); return; }
      const sentence = part.replace(/\s+/g, " ").trim();
      const leading = part.match(/^\s*/)?.[0] || "";
      const trailing = part.match(/\s*$/)?.[0] || "";
      if (leading) fragment.append(document.createTextNode(leading));
      const wrapper = document.createElement("span");
      wrapper.className = "sentence-ai-inline";
      wrapper.append(document.createTextNode(sentence));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sentence-ai-icon";
      button.dataset.aiSentence = sentence;
      button.title = "AI 비서로 문장 분석";
      button.setAttribute("aria-label", `AI 문장 분석: ${sentence.slice(0, 60)}`);
      button.innerHTML = `${icon("spark",12)}<span>AI 분석</span>`;
      button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openSentenceAssistant(sentence, "icon"); });
      wrapper.append(button);
      fragment.append(wrapper);
      if (trailing) fragment.append(document.createTextNode(trailing));
    });
    node.replaceWith(fragment);
  });
}

function emailRoleplayPanel() {
  if (!emailRoleplayState.active) return "";
  const savedItems = getUnifiedSavedLearningItems();
  const recommendations = (savedItems.length ? savedItems : getCustomTestFallbackItems()).slice(0,3);
  const used = detectUsedWords(emailRoleplayState.replyText, recommendations);
  const evaluation = emailRoleplayState.evaluation;
  return `<section class="email-roleplay"><div class="roleplay-head"><div><p class="eyebrow">EMAIL PING-PONG ROLEPLAY</p><h2>해외 고객 메일에 답장해보세요</h2></div><button type="button" data-close-email-roleplay>${icon("x",17)}</button></div><div class="roleplay-grid"><aside class="persona-card"><span>SCENARIO</span><h3>Emma Collins</h3><b>Procurement Manager · Delivery Schedule</b><p>납기 일정 변경 가능 여부를 확인하고 대안을 요청하는 상황입니다.</p></aside><article class="incoming-mail"><small>FROM · Emma Collins &lt;emma@northstar.example&gt;</small><h3>Request for updated delivery schedule</h3><p>Hello Kai,<br><br>Could you confirm whether the revised materials can be delivered by next Friday? If the current schedule is difficult, please suggest a practical alternative.<br><br>Best regards,<br>Emma</p></article></div><section class="recommended-words"><div><b>추천 저장 표현</b><span>${recommendations.length-used.length}개 아직 사용하지 않음</span></div>${recommendations.length?recommendations.map(item=>`<i class="${used.some(entry=>entry.id===item.id)?"completed":emailRoleplayState.replyText?"active":""}">${used.some(entry=>entry.id===item.id)?icon("check",12):""}${item.text}${used.some(entry=>entry.id===item.id)?" · Used":""}</i>`).join(""):"<p>추천할 저장 표현이 없습니다.</p>"}</section><label class="reply-editor"><span>YOUR REPLY</span><textarea data-email-reply placeholder="Dear Emma,\n\nThank you for your email...">${emailRoleplayState.replyText}</textarea><small>${emailRoleplayState.replyText.length}자 · 최소 50자</small></label><button class="send-roleplay" type="button" data-submit-email-roleplay ${emailRoleplayState.replyText.trim().length<50||emailRoleplayState.sending?"disabled":""}>${emailRoleplayState.sending?"평가 중...":"답장 보내고 평가받기"}</button>${emailRoleplayState.error?`<p class="roleplay-error">${emailRoleplayState.error}</p>`:""}${evaluation?`<section class="roleplay-evaluation"><div>${[["Tone",evaluation.toneScore],["Clarity",evaluation.clarityScore],["Vocabulary",evaluation.vocabScore],["Overall",evaluation.overallScore]].map(([label,score])=>`<article><span>${label}</span><b>${score}</b></article>`).join("")}</div><section><h3>코치 피드백</h3>${evaluation.feedback.map(text=>`<p>${text}</p>`).join("")}</section><article class="next-mail-preview"><span>NEXT EMAIL PREVIEW</span><h3>Emma가 대체 일정을 검토하고 있습니다.</h3><p>다음 메일에서는 가격 조건과 확정 일정을 조율하게 됩니다.</p><button type="button" data-next-email>다음 메일 보기</button></article></section>`:""}</section>`;
}

function getCustomTestFallbackItems() {
  const wordFallbacks = words.slice(0, 10).map(word => ({ id: `sample-word:${word.word}`, type: "word", text: word.word, meaning: word.meaning, sourceType: "sample", sourceTitle: "보충 문제" }));
  const sentenceFallbacks = sentenceLessons.slice(0, 10).map(sentence => ({ id: `sample-sentence:${sentence.id}`, type: "sentence", text: sentence.en, meaning: sentence.ko, sourceType: "sample", sourceTitle: "보충 문제" }));
  return [...wordFallbacks, ...sentenceFallbacks];
}

function journalTestPanel() {
  if (journalTestState.view === "closed") return "";
  if (journalTestState.view === "setup") return `<div class="learning-modal-backdrop" data-close-journal-test><section class="custom-test-modal" role="dialog" aria-modal="true" aria-labelledby="custom-test-title" data-modal-stop><button class="modal-close" type="button" data-close-journal-test aria-label="닫기">${icon("x",18)}</button><p class="eyebrow">PERSONAL TEST MAKER</p><h2 id="custom-test-title">보관한 표현으로 시험지 만들기</h2><p>저장한 항목을 바탕으로 바로 풀 수 있는 4지선다 문제를 만듭니다.</p><div class="custom-test-options"><fieldset><legend>출제 범위</legend>${[["word","저장한 단어만"],["sentence","저장한 문장만"],["all","단어 + 문장"]].map(([value,label])=>`<label><input type="radio" name="custom-scope" value="${value}" ${journalTestState.scope===value?"checked":""}><span>${label}</span></label>`).join("")}</fieldset><fieldset><legend>문제 수</legend>${[5,10].map(value=>`<label><input type="radio" name="custom-count" value="${value}" ${journalTestState.count===value?"checked":""}><span>${value}문제</span></label>`).join("")}</fieldset><fieldset><legend>난이도</legend>${[["easy","쉬움"],["normal","보통"],["challenge","도전"]].map(([value,label])=>`<label><input type="radio" name="custom-difficulty" value="${value}" ${journalTestState.difficulty===value?"checked":""}><span>${label}</span></label>`).join("")}</fieldset></div><div class="custom-test-note">1차 버전은 모든 문제를 객관식 4지선다로 생성합니다. 저장 항목이 부족하면 보충 문제가 포함됩니다.</div><button class="custom-test-primary" type="button" data-generate-journal-test>${icon("spark",16)} 테스트 생성하기</button></section></div>`;
  const test = journalTestState.test;
  const questions = (test?.generatedQuestions || []).filter(question => !journalTestState.wrongOnly || journalTestState.wrongQuestionIds.includes(question.id));
  const correctCount = (test?.generatedQuestions || []).filter(question => journalTestState.answers[question.id] === question.answer).length;
  const result = journalTestState.submitted ? `<section class="custom-test-result"><div><strong>${Math.round(correctCount / Math.max(1,test.generatedQuestions.length) * 100)}%</strong><span>${test.generatedQuestions.length}문제 중 ${correctCount}문제 정답</span></div><button type="button" data-retry-journal-test>다시 풀기</button><button type="button" data-wrong-journal-test>오답만 다시 보기</button><button type="button" data-close-journal-test>학습장으로 돌아가기</button></section>` : "";
  return `<section class="custom-test-drawer" aria-label="개인 맞춤 테스트"><div class="custom-test-drawer-head"><div><p class="eyebrow">AI-READY CUSTOM TEST</p><h2>나의 저장 항목 테스트</h2><span>${test.generatedQuestions.length}문제 · ${journalTestState.difficulty === "challenge" ? "도전" : journalTestState.difficulty === "easy" ? "쉬움" : "보통"}</span></div><button type="button" data-close-journal-test>${icon("x",18)}</button></div>${result}<div class="custom-question-list">${questions.map((question,index)=>{const selected=journalTestState.answers[question.id];return `<article class="custom-question-card"><div><span>Q${index+1}</span><em>${question.type}</em>${question.isFallback?"<small>보충 문제</small>":""}</div><h3>${question.prompt.replace("\n","<br>")}</h3><div>${question.choices.map((choice,choiceIndex)=>`<button class="${selected===choiceIndex?"selected":""} ${journalTestState.submitted&&choiceIndex===question.answer?"correct":""} ${journalTestState.submitted&&selected===choiceIndex&&selected!==question.answer?"wrong":""}" type="button" data-custom-answer="${question.id}:${choiceIndex}" ${journalTestState.submitted?"disabled":""}><i>${String.fromCharCode(65+choiceIndex)}</i><b>${choice}</b></button>`).join("")}</div>${journalTestState.submitted?`<section><strong>${selected===question.answer?"정답입니다.":"정답을 확인해보세요."}</strong><p>${question.explanation}</p><small>출처: 나만의 학습장 &gt; ${question.sourceTitle} &gt; ${question.sourceText}</small></section>`:""}</article>`}).join("")}</div>${!journalTestState.submitted?`<button class="custom-test-submit" type="button" data-submit-journal-test>답안 제출하기</button>`:""}</section>`;
}

function journalPage() {
  const savedWordEntries = getSavedWordEntries();
  const savedSentenceEntries = getSavedSentenceEntries();
  const renderSavedWord = word => {
    const example = vocabNaturalExample(word, 0);
    return `<article class="journal-review-card word-review"><div><h3>${word.word}</h3><button type="button" data-speak="${word.word}" aria-label="${word.word} 발음 듣기">${icon("volume",15)}</button><button class="save saved" type="button" data-save="${word.word}" aria-pressed="true" title="저장 해제" aria-label="${word.word} 저장 해제">${icon("bookmark",16)}</button></div><span>${vocabPhonetic(word)}</span><strong>${example.meaning}</strong><p>${word.definition || "저장한 단어를 다시 확인하세요."}</p><blockquote><b>${example.en}</b><small>${example.ko}</small></blockquote></article>`;
  };
  const renderSavedSentence = lesson => `<article class="journal-review-card sentence-review"><div><h3>문장 ${lesson.index + 1}</h3><button type="button" data-speak="${lesson.en.replaceAll('"', '&quot;')}" aria-label="저장 문장 듣기">${icon("volume",15)}</button><button class="sentence-save-toggle active" type="button" data-save-sentence="${lesson.id}" aria-pressed="true" title="문장 저장 해제" aria-label="문장 저장 취소">${icon("bookmark",16)}</button></div><b>${lesson.en}</b><p>${lesson.ko}</p><small>${lesson.pattern || lesson.meaning || "저장한 문장을 다시 소리 내어 읽어보세요."}</small></article>`;

  const blogItems = state.savedBlogItems;
  const wrongItems = getUnifiedSavedLearningItems().filter(item => reviewProgressMap[item.id]?.status === "wrong");
  return `${header("나만의 학습장")}<main class="journal-page"><section class="journal-hero"><div><p class="eyebrow">MY REVIEW SPACE</p><h2>저장하고, 복습하고, 실제로 사용해보세요.</h2><p>단어·문장·스크랩 표현을 테스트와 비즈니스 이메일 쓰기로 연결합니다.</p><div class="journal-hero-actions"><button class="journal-test-launch" type="button" data-open-journal-test>${icon("spark",16)} 시험지 만들기</button><button type="button" data-open-email-roleplay>${icon("message",16)} 이메일 핑퐁</button></div></div><div><b>${savedWordEntries.length}</b><span>저장 단어</span><b>${savedSentenceEntries.length + blogItems.length}</b><span>저장 표현</span></div></section>${emailRoleplayPanel()}${wrongItems.length?`<section class="journal-blog-strip"><div><p class="eyebrow">WRONG NOTES</p><h2>복습 챗봇 오답 노트</h2></div><div>${wrongItems.map(item=>`<article><em>REVIEW AGAIN</em><b>${item.text}</b><span>${item.meaning}</span><small>${item.example||"다음 복습에서 다시 출제됩니다."}</small></article>`).join("")}</div></section>`:""}${blogItems.length?`<section class="journal-blog-strip"><div><p class="eyebrow">FROM CURATOR & BLOG</p><h2>콘텐츠에서 담은 표현</h2></div><div>${blogItems.map(item=>`<article><em>${item.sourceType?.toUpperCase()||"EXPRESSION"}</em><b>${item.text}</b><span>${item.meaning}</span><small>${item.sourceTitle}</small></article>`).join("")}</div></section>`:""}<section class="journal-review-layout"><section class="journal-review-panel"><div class="journal-panel-head"><div><p class="eyebrow">SAVED WORDS</p><h2>저장한 단어</h2></div><button type="button" data-page="words">단어장으로</button></div>${savedWordEntries.length ? `<div class="journal-review-list">${savedWordEntries.map(renderSavedWord).join("")}</div>` : `<div class="journal-empty"><h3>아직 저장한 단어가 없어요.</h3><p>단어장 우측 상단 북마크를 눌러 복습할 단어를 모아보세요.</p><button type="button" data-page="words">단어 저장하러 가기</button></div>`}</section><section class="journal-review-panel"><div class="journal-panel-head"><div><p class="eyebrow">SAVED SENTENCES</p><h2>저장한 문장</h2></div><button type="button" data-page="sentence">문장으로</button></div>${savedSentenceEntries.length ? `<div class="journal-review-list">${savedSentenceEntries.map(renderSavedSentence).join("")}</div>` : `<div class="journal-empty"><h3>아직 저장한 문장이 없어요.</h3><p>매일 1문장에서 북마크를 눌러 다시 읽을 문장을 모아보세요.</p><button type="button" data-page="sentence">문장 저장하러 가기</button></div>`}</section></section></main>${journalTestPanel()}`;
}

function placeholderPage() {
  const map={words:["나의 단어장","저장한 단어와 오늘의 핵심 어휘를 복습해요."],sentence:["매일 1문장","한 문장을 깊이 이해하고 내 표현으로 만들어요."],journal:["나만의 학습장","오늘 배운 것을 기록하고 체크해요."]};
  const [title]=map[state.page]; return `${header(title)}<main class="journal-page"><div class="placeholder-grid">${wordCard()}${checklist("2026-07-13")}</div></main>`;
}

const KIDS_BASE_WORDS = [
  { word:"apple", meaning:"사과", example:"I like apples.", emoji:"🍎", category:"fruit" },
  { word:"happy", meaning:"행복한", example:"I am happy today.", emoji:"😊", imageType:"illustration", imageReviewed:false },
  { word:"school", meaning:"학교", example:"I go to school.", emoji:"🏫", category:"school" },
  { word:"rabbit", meaning:"토끼", example:"The rabbit can jump.", emoji:"🐰", category:"animal" },
  { word:"blue", meaning:"파란색", example:"The sky is blue.", emoji:"💙", imageType:"illustration", imageReviewed:false },
  { word:"family", meaning:"가족", example:"I love my family.", emoji:"👨‍👩‍👧", category:"people" },
  { word:"book", meaning:"책", example:"This is my book.", emoji:"📘", category:"school" },
  { word:"friend", meaning:"친구", example:"You are my friend.", emoji:"🤝", category:"people" },
  { word:"water", meaning:"물", example:"I drink water.", emoji:"💧", category:"food" },
  { word:"star", meaning:"별", example:"I see a star.", emoji:"⭐", category:"nature" },
  { word:"run", meaning:"달리다", example:"I can run fast.", emoji:"🏃", imageType:"illustration", imageReviewed:false },
  { word:"music", meaning:"음악", example:"I like music.", emoji:"🎵", imageType:"illustration", imageReviewed:false },
];

const kidsIllustrationAsset = (codepoint, category = "object") => ({
  imageUrl: `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoint}.svg`,
  imageType: "illustration",
  imageReviewed: true,
  category,
});

const KIDS_CORE_PHOTO_IMAGES = {
  // Fixed web illustration mapping: no random photos, one recognizable symbol per word.
  apple: kidsIllustrationAsset("1f34e", "fruit"),
  happy: kidsIllustrationAsset("1f60a", "feeling"),
  school: kidsIllustrationAsset("1f3eb", "school"),
  rabbit: kidsIllustrationAsset("1f407", "animal"),
  blue: kidsIllustrationAsset("1f535", "color"),
  family: kidsIllustrationAsset("1f46a", "people"),
  book: kidsIllustrationAsset("1f4d8", "school"),
  friend: kidsIllustrationAsset("1f91d", "people"),
  water: kidsIllustrationAsset("1f4a7", "food"),
  star: kidsIllustrationAsset("2b50", "nature"),
  run: kidsIllustrationAsset("1f3c3", "action"),
  music: kidsIllustrationAsset("1f3b5", "art"),
  dog: kidsIllustrationAsset("1f415", "animal"),
  cat: kidsIllustrationAsset("1f408", "animal"),
  bird: kidsIllustrationAsset("1f426", "animal"),
  fish: kidsIllustrationAsset("1f41f", "animal"),
  horse: kidsIllustrationAsset("1f40e", "animal"),
  cow: kidsIllustrationAsset("1f404", "animal"),
  lion: kidsIllustrationAsset("1f981", "animal"),
  tiger: kidsIllustrationAsset("1f405", "animal"),
  bear: kidsIllustrationAsset("1f43b", "animal"),
  elephant: kidsIllustrationAsset("1f418", "animal"),
  monkey: kidsIllustrationAsset("1f412", "animal"),
  duck: kidsIllustrationAsset("1f986", "animal"),
  chicken: kidsIllustrationAsset("1f414", "animal"),
  tree: kidsIllustrationAsset("1f333", "nature"),
  flower: kidsIllustrationAsset("1f33c", "nature"),
  sun: kidsIllustrationAsset("2600", "nature"),
  moon: kidsIllustrationAsset("1f319", "nature"),
  car: kidsIllustrationAsset("1f697", "vehicle"),
  bus: kidsIllustrationAsset("1f68c", "vehicle"),
  train: kidsIllustrationAsset("1f686", "vehicle"),
  bicycle: kidsIllustrationAsset("1f6b2", "vehicle"),
  ball: kidsIllustrationAsset("26bd", "toy"),
  chair: kidsIllustrationAsset("1fa91", "furniture"),
  table: kidsIllustrationAsset("1fa91", "furniture"),
  bed: kidsIllustrationAsset("1f6cf", "furniture"),
  bag: kidsIllustrationAsset("1f392", "school"),
  pencil: kidsIllustrationAsset("270f", "school"),
  pen: kidsIllustrationAsset("1f58a", "school"),
  ruler: kidsIllustrationAsset("1f4cf", "school"),
  eraser: kidsIllustrationAsset("1f9fd", "school"),
  cup: kidsIllustrationAsset("2615", "object"),
  plate: kidsIllustrationAsset("1f37d", "food"),
  spoon: kidsIllustrationAsset("1f944", "food"),
  fork: kidsIllustrationAsset("1f374", "food"),
  banana: kidsIllustrationAsset("1f34c", "fruit"),
  orange: kidsIllustrationAsset("1f34a", "fruit"),
  bread: kidsIllustrationAsset("1f35e", "food"),
  milk: kidsIllustrationAsset("1f95b", "food"),
  egg: kidsIllustrationAsset("1f95a", "food"),
  rice: kidsIllustrationAsset("1f35a", "food"),
  house: kidsIllustrationAsset("1f3e0", "place"),
  door: kidsIllustrationAsset("1f6aa", "object"),
  window: kidsIllustrationAsset("1fa9f", "object"),
  shoe: kidsIllustrationAsset("1f45f", "clothing"),
  hat: kidsIllustrationAsset("1f9e2", "clothing"),
  shirt: kidsIllustrationAsset("1f455", "clothing"),
  pants: kidsIllustrationAsset("1f456", "clothing"),
  computer: kidsIllustrationAsset("1f4bb", "object"),
  phone: kidsIllustrationAsset("1f4f1", "object"),
  clock: kidsIllustrationAsset("1f550", "object"),
};
const KIDS_IMAGE_CATEGORY_FALLBACKS = {
  animal: kidsIllustrationAsset("1f43e", "animal"),
  food: kidsIllustrationAsset("1f34e", "food"),
  fruit: kidsIllustrationAsset("1f34e", "fruit"),
  vehicle: kidsIllustrationAsset("1f697", "vehicle"),
  school: kidsIllustrationAsset("1f4d8", "school"),
  furniture: kidsIllustrationAsset("1fa91", "furniture"),
  people: kidsIllustrationAsset("1f9d2", "people"),
  nature: kidsIllustrationAsset("1f333", "nature"),
  action: kidsIllustrationAsset("1f3c3", "action"),
  feeling: kidsIllustrationAsset("1f60a", "feeling"),
  color: kidsIllustrationAsset("1f535", "color"),
  art: kidsIllustrationAsset("1f3a8", "art"),
  object: kidsIllustrationAsset("1f4e6", "object"),
};
const KIDS_WORD_PAGE_SIZE = 5;
const KIDS_WORDS = buildKidsWordBank();
const KIDS_SENTENCE_PAGE_SIZE = 1;
const KIDS_SENTENCES = [
  { en:"I like apples.", ko:"나는 사과를 좋아해요.", variation:"I like bananas." },
  { en:"This is my book.", ko:"이것은 내 책이에요.", variation:"This is my bag." },
  { en:"I can run fast.", ko:"나는 빨리 달릴 수 있어요.", variation:"I can jump high." },
  { en:"How are you?", ko:"오늘 기분이 어때요?", variation:"I am happy." },
  { en:"I go to school.", ko:"나는 학교에 가요.", variation:"I go home." },
  { en:"The sky is blue.", ko:"하늘은 파란색이에요.", variation:"The sun is yellow." },
  { en:"I love my family.", ko:"나는 가족을 사랑해요.", variation:"I love my friends." },
];
const KIDS_SENTENCE_BANK = buildKidsSentenceBank();

function buildKidsWordBank() {
  const seen = new Set();
  const addWord = item => {
    const word = String(item.word || "").trim().toLowerCase();
    if (!word || seen.has(word) || !/^[a-z][a-z-]*$/.test(word)) return null;
    seen.add(word);
    const photoAsset = KIDS_CORE_PHOTO_IMAGES[word] || {};
    return {
      word,
      meaning: item.meaning || "뜻 확인",
      example: item.example || `I can use ${word}.`,
      emoji: item.emoji || "📗",
      category: item.category || photoAsset.category || "object",
      imageUrl: item.imageUrl || photoAsset.imageUrl || "",
      imageType: item.imageType || photoAsset.imageType || "illustration",
      imageReviewed: Boolean(item.imageReviewed || photoAsset.imageReviewed),
    };
  };
  const base = KIDS_BASE_WORDS.map(addWord).filter(Boolean);
  const extra = vocabularyWords
    .filter(item => String(item.word || "").length <= 12)
    .map(item => addWord({
      ...item,
      example: item.example && !item.example.includes('"') ? item.example : `Let's learn ${item.word}.`,
      emoji: "📘",
    }))
    .filter(Boolean);
  return base.concat(extra).slice(0, 500);
}

function getKidsWordPageCount() {
  return Math.max(1, Math.ceil(KIDS_WORDS.length / KIDS_WORD_PAGE_SIZE));
}

function getKidsWords(pageIndex = kidsWordDayOffset) {
  const page = Math.min(Math.max(Number(pageIndex) || 0, 0), getKidsWordPageCount() - 1);
  const start = page * KIDS_WORD_PAGE_SIZE;
  return KIDS_WORDS.slice(start, start + KIDS_WORD_PAGE_SIZE);
}

function buildKidsSentenceBank() {
  const seen = new Set();
  const addSentence = (item, index, source = "bank") => {
    const en = String(item.en || "").trim();
    if (!en || seen.has(en.toLowerCase())) return null;
    seen.add(en.toLowerCase());
    return {
      id: item.id || `${source}-${index + 1}`,
      en,
      ko: item.ko || "",
      variation: item.variation || item.applications?.[0]?.[0] || item.en || "",
      variationKo: item.variationKo || item.applications?.[0]?.[1] || "",
      pattern: item.pattern || "기초 문장",
      meaning: item.meaning || item.note || "소리 내어 읽고 뜻을 확인해 보세요.",
    };
  };
  const base = KIDS_SENTENCES.map((item, index) => addSentence(item, index, "kids-base")).filter(Boolean);
  const simpleSentenceForWord = (item, index) => {
    const word = String(item.word || "").trim().toLowerCase();
    const meaning = item.meaning || word;
    const article = /^[aeiou]/.test(word) ? "an" : "a";
    const example = String(item.example || "").trim();
    const en = example && example.toLowerCase().includes(word) && example.length <= 90
      ? example
      : index % 4 === 0
        ? `I can see ${article} ${word}.`
        : index % 4 === 1
          ? `This is my ${word}.`
          : index % 4 === 2
            ? `I like ${word}.`
            : `The ${word} is here.`;
    return {
      en,
      ko: `${meaning} 단어가 들어간 문장이에요.`,
      variation: index % 2 === 0 ? `Can you see ${article} ${word}?` : `I can say ${word}.`,
      variationKo: `${word}를 넣어 한 번 더 말해보세요.`,
      pattern: en.replace(new RegExp(`\\b${word}\\b`, "i"), "+ 단어"),
      meaning: `${word} = ${meaning}`,
    };
  };
  const extra = KIDS_WORDS
    .map(simpleSentenceForWord)
    .map((item, index) => addSentence(item, index, "kids-word-sentence"))
    .filter(Boolean);
  return base.concat(extra).slice(0, 500);
}

function getKidsSentencePageCount() {
  return Math.max(1, Math.ceil(KIDS_SENTENCE_BANK.length / KIDS_SENTENCE_PAGE_SIZE));
}

function getKidsSentence(pageIndex = kidsSentencePageIndex) {
  const page = Math.min(Math.max(Number(pageIndex) || 0, 0), getKidsSentencePageCount() - 1);
  return KIDS_SENTENCE_BANK[page * KIDS_SENTENCE_PAGE_SIZE] || KIDS_SENTENCE_BANK[0];
}

function kidsParentMission(question, answer, id) {
  const done = Boolean(kidsProgress.parent[id]);
  return `<section class="kids-parent-mission ${done ? "done" : ""}"><span>${icon("heart",18)} 오늘의 부모 미션</span><h3>부모님께 영어로 말해보세요</h3><p><b>Q: ${question}</b><strong>A: ${answer}</strong></p><button type="button" data-kids-parent="${id}" ${done ? "disabled" : ""}>${icon("check",14)} ${done ? "말하기 완료!" : "부모님께 말했어요"}</button></section>`;
}

function kidsReward(title, message) {
  return `<section class="kids-reward"><span>★ ★ ★</span><h2>${title}</h2><p>${message}</p><button type="button" data-page="home">오늘의 학습으로</button></section>`;
}

function kidsStatusActions(id, done, completeText = "오늘 학습 완료", reviewText = "복습 중") {
  return `<div class="kids-status-actions ${done ? "done" : ""}"><span>${done ? icon("check",14) : icon("spark",14)} ${done ? "완료됨" : reviewText}</span>${done ? `<button class="secondary" type="button" data-kids-reset="${id}">처음부터 다시 하기</button>` : ""}<button class="primary" type="button" data-kids-complete="${id}" ${done ? "disabled" : ""}>${icon("check",14)} ${done ? "완료했어요" : completeText}</button><button class="secondary" type="button" data-kids-undo="${id}" ${done ? "" : "disabled"}>완료 취소</button></div>`;
}

function getVocabCardImage(card) {
  const fallback = KIDS_IMAGE_CATEGORY_FALLBACKS[card.category] || KIDS_IMAGE_CATEGORY_FALLBACKS.object;
  return {
    src: card.imageUrl || fallback.imageUrl || "",
    type: card.imageUrl ? card.imageType || "illustration" : fallback.imageType || "illustration",
    reviewed: Boolean(card.imageUrl ? card.imageReviewed : fallback.imageReviewed),
    alt: `${card.meaning || card.word} 그림`,
  };
}

function kidsWordPhoto(word) {
  const cardImage = getVocabCardImage(word);
  const image = cardImage.src
    ? `<img src="${cardImage.src}" alt="${cardImage.alt}" loading="lazy" onerror="this.closest('figure').classList.add('image-failed');this.remove();">`
    : "";
  return `<figure class="kids-word-photo ${cardImage.type === "photo" ? "photo" : "illustration"}" data-image-reviewed="${cardImage.reviewed ? "true" : "false"}">${image}<figcaption>${word.emoji || "📗"}</figcaption></figure>`;
}

function kidsWordCards(todayWords, wordProgress) {
  return `<section class="kids-word-grid">${todayWords.map((word, index) => { const flipped = kidsFlippedWords.includes(word.word) || wordProgress.words.includes(word.word) || wordProgress.completed; const done = wordProgress.words.includes(word.word); const photo = kidsWordPhoto(word); return `<article class="kids-word-card ${flipped ? "flipped" : ""} ${done ? "done" : ""}"><div class="kids-card-front">${photo}<b>${index + 1}번 카드</b><p>그림을 보고 단어를 맞혀보세요.</p><button type="button" data-kids-flip="${word.word}">카드 열기</button></div><div class="kids-card-back">${photo}<h3>${word.word}</h3><strong>${word.meaning}</strong><button type="button" data-speak="${word.word}">${icon("volume",15)} 듣기</button><p>${word.example}</p><button class="primary" type="button" data-kids-word-done="${word.word}" ${done ? "disabled" : ""}>${icon("check",14)} ${done ? "찾았어요!" : "알겠어요"}</button></div></article>`; }).join("")}</section>`;
}

function kidsHomePage() {
  const requiredMissions = [
    { id: "words", page: "words", icon: "book", title: "단어 카드 5장", desc: "그림 보고 단어 맞히기", time: "5분" },
    { id: "sentence", page: "sentence", icon: "message", title: "오늘의 문장 1개", desc: "듣고 따라 말하기", time: "2분" },
    { id: "test", page: "test", icon: "check", title: "확인 놀이 3문제", desc: "별 3개 모으기", time: "3분" },
  ];
  const optionalMissions = [
    { id: "reading", page: "news", icon: "news", title: "짧은 글 읽기", time: "3분" },
    { id: "story", page: "ted", icon: "book", title: "영어동화", time: "4분" },
    { id: "song", page: "drama", icon: "play", title: "영어 동요", time: "2분" },
    { id: "calendar", page: "calendar", icon: "news", title: "학습 캘린더", time: "보기" },
  ];
  const completed = requiredMissions.filter(item => kidsProgress.completed[item.id]).length;
  const intro = showKidsIntro ? `<section class="kids-first-intro"><span>초등 모드에 온 걸 환영해요!</span><h2>${childCallName()}야, 오늘 영어 3개만 해볼까요?</h2><p>짧게 끝내고 별을 모아봐요.</p><label>학생 이름<input type="text" data-kids-name-input value="${childName}" maxlength="12"></label><button type="button" data-kids-intro-complete>이름 저장하고 시작</button></section>` : "";
  const completeMessage = completed === requiredMissions.length ? `<section class="kids-done-banner"><span>★ 오늘 영어 다 했어요</span><h3>${childName}님, 오늘 영어 다 했어요! 정말 잘했어요!</h3><p>더 하고 싶으면 아래 더 해보기에서 골라도 돼요.</p></section>` : "";
  const missionCard = (item, index, optional = false) => {
    const done = Boolean(kidsProgress.completed[item.id]);
    return `<button class="kids-mission-card ${done ? "done" : ""} ${optional ? "optional" : ""}" type="button" data-page="${item.page}"><span>${done ? icon("check",20) : icon(item.icon,20)}</span><div><small>${optional ? "더 해보기" : `오늘 미션 ${index + 1}`} · ${item.time}</small><b>${item.title}</b>${item.desc ? `<p>${item.desc}</p>` : ""}<em>${done ? "복습하기" : "시작하기"}</em></div>${icon("chevron",18)}</button>`;
  };
  return `${header("오늘의 학습")}<main class="kids-page">${intro}<section class="kids-welcome"><span>오늘의 미션 허브</span><h2>${childName}님, 오늘 영어 3개만 해볼까요?</h2><p>오늘 ${completed}개 했어요! ${requiredMissions.length - completed}개 남았어요.</p><div class="kids-stars">${requiredMissions.map((_, index) => `<i class="${index < completed ? "done" : ""}">★</i>`).join("")}</div></section>${completeMessage}<section class="kids-mission-list kids-mission-primary">${requiredMissions.map((item, index) => missionCard(item, index)).join("")}</section><section class="kids-more-missions"><span>더 하고 싶을 때</span><div>${optionalMissions.map((item, index) => missionCard(item, index, true)).join("")}</div></section>${kidsParentMission("What did you learn today?", "I learned English.", "home")}</main>`;
}

function kidsVocabularyPage() {
  const pageCount = getKidsWordPageCount();
  kidsWordDayOffset = Math.min(Math.max(kidsWordDayOffset, 0), pageCount - 1);
  const wordDateKey = getKidsWordDateKey();
  const wordProgress = getKidsWordProgress(wordDateKey);
  const todayWords = getKidsWords(kidsWordDayOffset);
  const allDone = todayWords.every(word => wordProgress.words.includes(word.word));
  const sessionComplete = Boolean(wordProgress.completed);
  const dayLabel = `${kidsWordDayOffset + 1}페이지`;
  const pageGroupSize = 10;
  const pageGroupStart = Math.floor(kidsWordDayOffset / pageGroupSize) * pageGroupSize;
  const visiblePages = Array.from(
    { length: Math.min(pageGroupSize, pageCount - pageGroupStart) },
    (_, index) => pageGroupStart + index
  );

  const quizStep = wordProgress.quizStep || 0;
  const quizWord = todayWords[quizStep % todayWords.length];
  const wrongWords = KIDS_WORDS.filter(word => !todayWords.some(item => item.word === word.word)).slice(0, 2);
  const choices = seededShuffle([quizWord, ...wrongWords], `${wordDateKey}-kids-${quizStep}`).slice(0, 3);
  const quizPrompt = quizStep === 0 ? `${quizWord.emoji} 그림에 맞는 영어 단어는?` : `‘${quizWord.word}’의 뜻은?`;
  const choiceLabel = choice => quizStep === 0 ? choice.word : choice.meaning;
  const learnedSummary = `<section class="kids-word-summary"><span>오늘 배운 단어</span><div>${todayWords.map(word => `<b>${word.word}<small>${word.meaning}</small></b>`).join("")}</div></section>`;
  const reviewPanel = sessionComplete ? `<section class="kids-done-banner"><span>★ ${dayLabel} 단어 완료</span><h3>단어 5개 성공! 오늘 머리에 쏙 들어왔어.</h3><p>아래 카드에서 발음을 다시 듣고 예문을 다시 읽어보세요.</p></section>` : "";
  const wordBody = sessionComplete
    ? `${learnedSummary}${kidsWordCards(todayWords, wordProgress)}<section class="kids-next-words"><span>아이가 더 하고 싶다면</span><h3>다음 페이지 단어 5개로 넘어갈까요?</h3><p>현재 페이지 기록은 남겨두고, 다음 단어 세트로 이어서 볼 수 있어요.</p><button type="button" data-kids-next-words ${kidsWordDayOffset >= pageCount - 1 ? "disabled" : ""}>다음 5개로 가기 ${icon("arrow",14)}</button></section>`
    : allDone
      ? `<section class="kids-mini-quiz"><span>문제 ${quizStep + 1} / 2</span><h3>${quizPrompt}</h3><div>${choices.map(choice => `<button type="button" data-kids-word-answer="${choice.word === quizWord.word}">${choiceLabel(choice)}</button>`).join("")}</div><p data-kids-feedback>천천히 골라도 괜찮아요!</p></section>`
      : kidsWordCards(todayWords, wordProgress);
  const pageNavigation = `<nav class="kids-word-page-navigation" aria-label="초등 단어장 페이지 이동"><button type="button" data-kids-word-target="0" ${kidsWordDayOffset === 0 ? "disabled" : ""} aria-label="첫 페이지로 이동">&laquo;</button><button type="button" data-kids-word-target="${Math.max(0, kidsWordDayOffset - 1)}" ${kidsWordDayOffset === 0 ? "disabled" : ""} aria-label="이전 페이지로 이동">&lsaquo;</button><span>${visiblePages.map(pageIndex => `<button class="${pageIndex === kidsWordDayOffset ? "active" : ""}" type="button" data-kids-word-target="${pageIndex}" ${pageIndex === kidsWordDayOffset ? 'aria-current="page"' : ""}>${pageIndex + 1}</button>`).join("")}</span><button type="button" data-kids-word-target="${Math.min(pageCount - 1, kidsWordDayOffset + 1)}" ${kidsWordDayOffset === pageCount - 1 ? "disabled" : ""} aria-label="다음 페이지로 이동">&rsaquo;</button><button type="button" data-kids-word-target="${pageCount - 1}" ${kidsWordDayOffset === pageCount - 1 ? "disabled" : ""} aria-label="마지막 페이지로 이동">&raquo;</button><small>${kidsWordDayOffset + 1} / ${pageCount} 페이지 · 총 ${KIDS_WORDS.length}단어</small></nav>`;

  return `${header("단어장")}<main class="kids-page">${reviewPanel}<section class="kids-page-head"><span>${dayLabel} · ${KIDS_WORDS.length}개 단어장</span><h2>${sessionComplete ? "단어 복습하기" : allDone ? "단어 5개 확인 완료!" : "그림 속 단어 5개를 찾아보자!"}</h2><p>${sessionComplete ? "처음부터 다시 하거나 완료를 취소할 수 있어요." : allDone ? "퀴즈 해볼까? 딱 2문제만 풀어요." : "카드를 열고 듣기 버튼으로 발음을 확인해요."}</p><div class="kids-mini-progress">${todayWords.map(word => `<i class="${wordProgress.words.includes(word.word) ? "done" : ""}">★</i>`).join("")}</div>${kidsStatusActions("words", sessionComplete, "단어 학습 완료", "단어 학습 중")}</section>${wordBody}${pageNavigation}${kidsParentMission("What word did you learn?", `I learned ${todayWords[0].word}.`, "words")}</main>`;
}

function kidsSentencePage() {
  const pageCount = getKidsSentencePageCount();
  kidsSentencePageIndex = Math.min(Math.max(kidsSentencePageIndex, 0), pageCount - 1);
  const sentenceKey = getKidsSentencePageKey();
  const progress = getKidsSentenceProgress(sentenceKey);
  const sentence = getKidsSentence(kidsSentencePageIndex);
  const done = Boolean(progress.completed);
  kidsProgress.completed.sentence = done;
  const words = sentence.en.match(/[A-Za-z]+/g) || [];
  const coreWord = words.find(word => word.length > 3) || words[0] || "";
  const highlightedSentence = coreWord ? sentence.en.replace(new RegExp(`\\b${coreWord}\\b`, "i"), `<mark>${coreWord}</mark>`) : sentence.en;
  const readyToComplete = done || (progress.listened && progress.meaningShown && progress.repeated);
  const pageGroupSize = 10;
  const pageGroupStart = Math.floor(kidsSentencePageIndex / pageGroupSize) * pageGroupSize;
  const visiblePages = Array.from(
    { length: Math.min(pageGroupSize, pageCount - pageGroupStart) },
    (_, index) => pageGroupStart + index
  );
  const pageNavigation = `<nav class="kids-sentence-page-navigation" aria-label="초등 매일 1문장 페이지 이동"><button type="button" data-kids-sentence-target="0" ${kidsSentencePageIndex === 0 ? "disabled" : ""} aria-label="첫 문장으로 이동">&laquo;</button><button type="button" data-kids-sentence-target="${Math.max(0, kidsSentencePageIndex - 1)}" ${kidsSentencePageIndex === 0 ? "disabled" : ""} aria-label="이전 문장으로 이동">&lsaquo;</button><span>${visiblePages.map(pageIndex => `<button class="${pageIndex === kidsSentencePageIndex ? "active" : ""}" type="button" data-kids-sentence-target="${pageIndex}" ${pageIndex === kidsSentencePageIndex ? 'aria-current="page"' : ""}>${pageIndex + 1}</button>`).join("")}</span><button type="button" data-kids-sentence-target="${Math.min(pageCount - 1, kidsSentencePageIndex + 1)}" ${kidsSentencePageIndex === pageCount - 1 ? "disabled" : ""} aria-label="다음 문장으로 이동">&rsaquo;</button><button type="button" data-kids-sentence-target="${pageCount - 1}" ${kidsSentencePageIndex === pageCount - 1 ? "disabled" : ""} aria-label="마지막 문장으로 이동">&raquo;</button><small>${kidsSentencePageIndex + 1} / ${pageCount} 문장 · 총 ${KIDS_SENTENCE_BANK.length}개</small></nav>`;
  const sentenceActions = `<div class="kids-step-actions"><button type="button" data-kids-sentence-listen>${icon("volume",16)} ${progress.listened ? "다시 듣기" : "듣기"}</button><button type="button" data-kids-sentence-meaning>${progress.meaningShown ? "뜻 숨기기" : "뜻 보기"}</button><button type="button" data-kids-sentence-repeat>${progress.repeated ? "따라 읽었어요" : "따라 읽기 완료"}</button></div>`;
  const sentenceStatus = `<div class="kids-status-actions ${done ? "done" : ""}"><span>${done ? icon("check",14) : icon("spark",14)} ${done ? "문장 완료" : "듣고, 뜻 보고, 따라 읽으면 완료"}</span>${done ? `<button class="secondary" type="button" data-kids-reset="sentence">처음부터 다시 하기</button>` : ""}<button class="primary" type="button" data-kids-complete="sentence" ${readyToComplete && !done ? "" : "disabled"}>${icon("check",14)} ${done ? "완료했어요" : "문장 완료"}</button><button class="secondary" type="button" data-kids-undo="sentence" ${done ? "" : "disabled"}>완료 취소</button></div>`;
  return `${header("매일 1문장")}<main class="kids-page"><section class="kids-sentence-card"><span>${done ? "완료한 문장 복습" : "매일 1문장"} · ${kidsSentencePageIndex + 1}번</span><h2>${highlightedSentence}</h2><p class="${progress.meaningShown ? "" : "kids-hidden-meaning"}">${progress.meaningShown ? sentence.ko : "뜻 보기 버튼을 누르면 한글 뜻이 보여요."}</p>${sentenceActions}<div><small>핵심 단어</small><b>${coreWord || "sentence"}</b><p>${sentence.meaning}</p></div><div><small>이렇게도 말해보세요</small><b>${sentence.variation}</b>${sentence.variationKo ? `<p>${sentence.variationKo}</p>` : ""}</div>${sentenceStatus}</section>${pageNavigation}${kidsParentMission("What sentence did you practice?", sentence.en, "sentence")}</main>`;
}

function kidsReadingPage() {
  const session = getKidsDailySession("reading", { selectedAnswer: null, correct: false });
  const lines = [
    { en:"Mina has a small garden.", ko:"미나는 작은 정원이 있어요." },
    { en:"She plants three yellow flowers.", ko:"미나는 노란 꽃 세 송이를 심어요." },
    { en:"A little bird visits the garden.", ko:"작은 새 한 마리가 정원에 찾아와요." },
    { en:"Mina is happy to see the bird.", ko:"미나는 새를 보고 기뻐해요." },
  ];
  const done = Boolean(kidsProgress.completed.reading);
  const readingStatus = `<div class="kids-status-actions ${done ? "done" : ""}"><span>${done ? icon("check",14) : icon("spark",14)} ${done ? "읽기 완료" : "정답을 맞히면 완료"}</span>${done ? `<button class="secondary" type="button" data-kids-reset="reading">처음부터 다시 하기</button>` : ""}<button class="primary" type="button" data-kids-complete="reading" ${session.correct && !done ? "" : "disabled"}>${icon("check",14)} 읽기 완료</button><button class="secondary" type="button" data-kids-undo="reading" ${done ? "" : "disabled"}>완료 취소</button></div>`;
  return `${header("초등용 읽기")}<main class="kids-page"><section class="kids-reading-card"><span>${done ? "읽기 복습" : "4문장 읽기"}</span><h2>Mina's Small Garden</h2><p class="kids-reading-lead">한 줄씩 읽고, 마지막에 딱 1문제만 풀어요.</p><div>${lines.map((line,index)=>`<p><i>${index+1}</i><b>${line.en}</b><small>${line.ko || ""}</small><button type="button" data-speak="${line.en.replaceAll('"','&quot;')}">${icon("volume",12)} 듣기</button></p>`).join("")}</div><section class="kids-keywords"><span>핵심 단어 2개</span><b>garden<small>정원</small></b><b>bird<small>새</small></b></section><h3>누가 미나의 정원에 찾아왔나요?</h3><div class="kids-reading-choices"><button type="button" data-kids-reading-answer="true">작은 새</button><button type="button" data-kids-reading-answer="false">큰 강아지</button></div><p data-kids-feedback>${done ? "짧은 글도 끝까지 읽었어! 아주 좋아." : session.selectedAnswer === false ? "괜찮아! 글에서 다시 찾아보자." : "글에서 답을 찾아보세요."}</p>${readingStatus}</section>${kidsParentMission("Who visits the garden?", "A little bird.", "reading")}</main>`;
}

function kidsStoryPage() {
  const session = getKidsDailySession("story", { reaction: null });
  const lines = [
    { en:"A little star lives in the sky.", ko:"작은 별이 하늘에 살아요." },
    { en:"The star shines for a lost rabbit.", ko:"별은 길을 잃은 토끼를 비춰줘요." },
    { en:"The rabbit finds the way home.", ko:"토끼는 집으로 가는 길을 찾아요." },
  ];
  const done = Boolean(kidsProgress.completed.story);
  const storyStatus = `<div class="kids-status-actions ${done ? "done" : ""}"><span>${done ? icon("check",14) : icon("spark",14)} ${done ? "동화 완료" : "감상을 고르면 완료"}</span>${done ? `<button class="secondary" type="button" data-kids-reset="story">처음부터 다시 하기</button>` : ""}<button class="primary" type="button" data-kids-complete="story" ${session.reaction && !done ? "" : "disabled"}>${icon("check",14)} 이야기 끝!</button><button class="secondary" type="button" data-kids-undo="story" ${done ? "" : "disabled"}>완료 취소</button></div>`;
  return `${header("영어동화")}<main class="kids-page"><section class="kids-story-card"><span>${done ? "동화 다시 읽기" : "오늘의 추천 1편"}</span><h2>The Little Star and the Rabbit</h2><p>읽기 전 질문: 길을 잃은 토끼는 누가 도와줄까요?</p><div>${lines.map((line,index)=>`<article><i>${index+1}</i><b>${line.en}</b><small>${line.ko || ""}</small><button type="button" data-speak="${line.en.replaceAll('"','&quot;')}">${icon("volume",13)} 듣기</button></article>`).join("")}</div><section class="kids-reaction"><span>읽고 나서 골라봐요</span><button type="button" data-kids-story-reaction="fun">재미있었어요</button><button type="button" data-kids-story-reaction="warm">따뜻했어요</button><button type="button" data-kids-story-reaction="again">또 읽고 싶어요</button></section><p class="kids-story-feedback">${done ? "오늘 동화 한 편 끝! 영어 이야기도 읽을 수 있어." : session.reaction ? "좋아요. 이제 이야기 완료를 눌러요." : "마음에 드는 느낌을 하나 골라요."}</p>${storyStatus}</section>${kidsParentMission("Which scene did you like?", "I liked the little star.", "story")}</main>`;
}

function kidsSongPage() {
  const session = getKidsDailySession("song", { listened: false, repeated: false, replayCount: 0 });
  const done = Boolean(kidsProgress.completed.song);
  const line = "Twinkle, twinkle, little star.";
  const readyToComplete = done || (session.listened && session.repeated);
  const songStatus = `<div class="kids-status-actions ${done ? "done" : ""}"><span>${done ? icon("check",14) : icon("spark",14)} ${done ? "동요 완료" : "듣고 후렴을 따라 하면 완료"}</span>${done ? `<button class="secondary" type="button" data-kids-reset="song">처음부터 다시 하기</button>` : ""}<button class="primary" type="button" data-kids-complete="song" ${readyToComplete && !done ? "" : "disabled"}>${icon("check",14)} 따라 불렀어요</button><button class="secondary" type="button" data-kids-undo="song" ${done ? "" : "disabled"}>완료 취소</button></div>`;
  return `${header("영어 동요")}<main class="kids-page"><section class="kids-song-card"><span>${done ? "동요 복습" : "♪ 오늘의 영어 동요"}</span><h2>Twinkle, Twinkle, Little Star</h2><p><mark>${line}</mark></p><small class="kids-song-hint">힌트: 반짝반짝 작은 별처럼 손을 반짝이며 따라 불러요.</small><div><button type="button" data-kids-song-listen="${line}">${icon("play",16)} 노래 구절 듣기</button><button type="button" data-kids-song-repeat>후렴 따라했어요</button><button type="button" data-speaking-repeat="${line}">한 번 더 듣기</button></div>${songStatus}</section>${kidsParentMission("What did you sing?", "I sang Twinkle Twinkle.", "song")}</main>`;
}

function kidsDailyTestPage() {
  const word = getKidsWords()[0];
  const questions = [
    { q:`${word.word}의 뜻은?`, choices:[word.meaning,"자동차"], answer:0 },
    { q:"I like apples.의 뜻은?", choices:["나는 사과를 좋아해요.","나는 학교에 가요."], answer:0 },
    { q:"미나의 정원에 찾아온 것은?", choices:["작은 새","우주선"], answer:0 },
  ];
  const correct = Object.values(kidsTestAnswers).filter(Boolean).length;
  const done = Boolean(kidsProgress.completed.test);
  return `${header("Daily Test")}<main class="kids-page"><section class="kids-test-card"><span>${done ? "확인 놀이 복습" : "딱 3문제 확인 놀이"}</span><h2>${done ? "오늘의 확인 놀이 완료!" : "별 3개를 모아볼까?"}</h2><div class="kids-test-stars">${questions.map((_,index)=>`<i class="${done || kidsTestAnswers[index] ? "done" : ""}">★</i>`).join("")}</div>${questions.map((item,index)=>`<fieldset class="${done || kidsTestAnswers[index] ? "done" : ""}"><legend>놀이 ${index+1}. ${item.q}</legend>${item.choices.map((choice,choiceIndex)=>`<button type="button" data-kids-test-answer="${index}:${choiceIndex===item.answer}">${choice}</button>`).join("")}</fieldset>`).join("")}<p>${done ? "오늘 테스트 성공! 별 3개 모았어." : `${correct} / 3 완료 · 틀려도 다시 고르면 돼요!`}</p>${kidsStatusActions("test", done, "확인 놀이 완료", "확인 놀이 중")}</section>${kidsParentMission("Did you finish English?", "Yes, I did!", "test")}</main>`;
}

const KIDS_CALENDAR_MISSIONS = [
  { id: "words", label: "단어", icon: "book" },
  { id: "sentence", label: "문장", icon: "spark" },
  { id: "reading", label: "읽기", icon: "news" },
  { id: "story", label: "동화", icon: "book" },
  { id: "song", label: "동요", icon: "play" },
  { id: "test", label: "테스트", icon: "check" },
];

function getKidsHistoryEntry(dateKey) {
  if (dateKey === kidsProgress.date) return kidsEntryFromProgress(kidsProgress);
  return kidsHistory[dateKey] || { completed: {}, words: [], parent: {} };
}

function kidsCalendarPage() {
  const y = state.calendarYear;
  const m = state.calendarMonth;
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = Array(first).fill(null).concat(Array.from({ length: days }, (_, i) => i + 1));
  const selectedEntry = getKidsHistoryEntry(state.selectedDate);
  const selectedDone = KIDS_CALENDAR_MISSIONS.filter(item => selectedEntry.completed[item.id]);
  const selectedStars = selectedDone.length;
  const selectedParent = Object.keys(selectedEntry.parent || {}).filter(key => selectedEntry.parent[key]).length;
  const monthDoneDays = Array.from({ length: days }, (_, index) => {
    const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
    return KIDS_CALENDAR_MISSIONS.some(item => getKidsHistoryEntry(key).completed[item.id]);
  }).filter(Boolean).length;

  return `${header("학습 캘린더")}<main class="kids-page kids-calendar-page"><section class="kids-page-head"><span>나의 영어 별 스티커</span><h2>${childCallName()}가 해낸 날들이 쌓이고 있어요</h2><p>매일 한 미션이라도 끝내면 캘린더에 별이 남아요.</p></section><div class="kids-calendar-layout"><section class="kids-calendar-panel"><div class="calendar-head"><button type="button" data-month="-1" aria-label="이전 달">‹</button><h2>${y}년 ${m + 1}월</h2><button type="button" data-month="1" aria-label="다음 달">›</button></div><div class="weekdays">${["일","월","화","수","목","금","토"].map(day => `<span>${day}</span>`).join("")}</div><div class="kids-calendar-grid">${cells.map(day => { if (!day) return `<div class="kids-day empty"></div>`; const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; const entry = getKidsHistoryEntry(key); const doneCount = KIDS_CALENDAR_MISSIONS.filter(item => entry.completed[item.id]).length; return `<button class="kids-day ${key === state.selectedDate ? "selected" : ""} ${key === localDateKey() ? "today" : ""}" type="button" data-date="${key}"><b>${day}</b><span>${doneCount ? "★".repeat(doneCount) : ""}</span><small>${doneCount ? `${doneCount}/${KIDS_CALENDAR_MISSIONS.length}` : ""}</small></button>`; }).join("")}</div></section><aside class="kids-calendar-summary"><span>${state.selectedDate}</span><h3>${selectedStars ? `별 ${selectedStars}개를 모았어요!` : "아직 기록이 없어요"}</h3><p>${selectedStars ? "이날 완료한 미션을 다시 확인해보세요." : "학습을 완료하면 이 날짜에 별이 생겨요."}</p><div>${KIDS_CALENDAR_MISSIONS.map(item => `<article class="${selectedEntry.completed[item.id] ? "done" : ""}"><i>${selectedEntry.completed[item.id] ? icon("check",13) : icon(item.icon,13)}</i><b>${item.label}</b><em>${selectedEntry.completed[item.id] ? "완료" : "아직"}</em></article>`).join("")}</div><section class="kids-calendar-total"><strong>${monthDoneDays}</strong><p>이번 달 학습한 날</p><small>부모 미션 ${selectedParent}개 기록</small></section></aside></div></main>`;
}
function kidsPage(page) {
  return page === "home" ? kidsHomePage()
    : page === "words" ? kidsVocabularyPage()
    : page === "sentence" ? kidsSentencePage()
    : page === "news" ? kidsReadingPage()
    : page === "ted" ? kidsStoryPage()
    : page === "drama" ? kidsSongPage()
    : page === "test" ? kidsDailyTestPage()
    : page === "calendar" ? kidsCalendarPage()
    : kidsHomePage();
}

function saveSuneungState() { try { profileStorage.setItem(SUNEUNG_STORAGE_KEY, JSON.stringify(suneungState)); } catch {} }

function openSuneungPassage(index) {
  if (index < 0 || index >= suneungPassages.length) return false;
  suneungState.passageIndex = index;
  suneungPassage = suneungPassages[index];
  suneungState.passageTab = "questions";
  suneungState.passageTranslations = [];
  suneungState.passageNotes = [];
  suneungState.difficultSentences = [];
  suneungState.bookmarkedSentences = [];
  suneungState.expressionStatus = {};
  suneungState.passageQuestionIndex = 0;
  suneungState.passageAnswers = {};
  suneungState.passageChecked = {};
  suneungState.wrongPassageQuestions = [];
  suneungState.selected = null;
  suneungState.submitted = false;
  suneungState.completed = false;
  suneungState.reviewSaved = false;
  saveSuneungState();
  return true;
}

function compactSuneungPassagePage() {
  let availableIndexes = suneungPassages.map((_, index) => index)
    .filter(index => !suneungState.masteredPassages.includes(suneungPassages[index].id));
  const activeTypeTraining = suneungState.activeTypeTraining;
  if (activeTypeTraining?.typeId) {
    availableIndexes = availableIndexes.filter(index => passageMatchesCsatType(suneungPassages[index], activeTypeTraining.typeId));
    if (activeTypeTraining.size === "wrong") {
      const wrongPassageIds = new Set((suneungState.typeTrainingHistory || []).filter(entry => entry.typeId === activeTypeTraining.typeId && !entry.correct).map(entry => entry.passageId));
      if (wrongPassageIds.size) availableIndexes = availableIndexes.filter(index => wrongPassageIds.has(suneungPassages[index].id));
    } else {
      const limit = Number(activeTypeTraining.size);
      if (Number.isFinite(limit) && limit > 0) availableIndexes = availableIndexes.slice(0, limit);
    }
  }
  if (!availableIndexes.length && activeTypeTraining?.typeId) {
    suneungState.activeTypeTraining = null;
    saveSuneungState();
    return `${header("유형 훈련 완료")}<main class="suneung-page"><section class="suneung-verified-empty"><span>${icon("check",24)}</span><h2>선택한 유형 훈련을 완료했습니다.</h2><p>유형별 훈련 화면에서 새 정답률과 개선폭을 확인해보세요.</p><button type="button" data-page="suneung-types">개선 결과 확인</button></section></main>`;
  }
  if (!availableIndexes.length && suneungPassages.length) {
    suneungState.masteredPassages = [];
    suneungState.batchDay = 1;
    suneungState.batchPosition = 0;
    availableIndexes = suneungPassages.map((_, index) => index);
    saveSuneungState();
  }
  const perDay = 5;
  const totalDays = Math.max(1, Math.ceil(availableIndexes.length / perDay));
  suneungState.batchDay = Math.min(Math.max(1, suneungState.batchDay), totalDays);
  const dayStart = (suneungState.batchDay - 1) * perDay;
  const dayIndexes = availableIndexes.slice(dayStart, dayStart + perDay);
  suneungState.batchPosition = Math.min(suneungState.batchPosition, Math.max(0, dayIndexes.length - 1));
  const visibleIndexes = dayIndexes.length ? [dayIndexes[suneungState.batchPosition]] : [];
  const cards = visibleIndexes.map(index => {
    const passage = suneungPassages[index];
    const questionIndex = Math.min(suneungState.batchQuestionIndexes[passage.id] || 0, Math.max(0, passage.questions.length - 1));
    const question = passage.questions[questionIndex];
    const answerKey = `${passage.id}:${question?.id || "none"}`;
    const selected = suneungState.batchAnswers[answerKey];
    const checked = Boolean(suneungState.batchChecked[answerKey]);
    const correct = checked && selected === question?.answer;
    const analysisOpen = Boolean(suneungState.batchAnalysisOpen[passage.id]);
    return `<article class="csat-batch-card" data-csat-batch-card="${passage.id}"><header><div><span>${passage.number} · ${passage.type}</span><h2>${passage.topic}</h2><small>난이도 ${passage.difficulty} · 예상 ${passage.minutes}분</small></div><button type="button" data-csat-batch-skip="${passage.id}">건너뛰기 ${icon("arrow",12)}</button></header><section class="csat-batch-passage" data-no-ai-sentence>${passage.paragraphs.map((paragraph, paragraphIndex) => `<p><i>${paragraphIndex + 1}</i>${paragraph}</p>`).join("")}</section><button class="csat-batch-analysis-toggle ${analysisOpen ? "active" : ""}" type="button" data-csat-batch-analysis="${passage.id}" aria-expanded="${analysisOpen}">${analysisOpen ? "지문 분석 닫기" : "지문 분석 보기"}</button>${analysisOpen ? `<section class="csat-batch-analysis">${passage.paragraphs.map((paragraph, paragraphIndex) => `<article><b>${String(paragraphIndex + 1).padStart(2,"0")} · 번역</b><p>${passage.translations[paragraphIndex] || "등록된 번역이 없습니다."}</p><b>문법·구조</b><p>${passage.notes?.[paragraphIndex] || "등록된 분석이 없습니다."}</p></article>`).join("")}</section>` : ""}${question ? `<section class="csat-batch-question"><div><span>QUESTION ${questionIndex + 1} / ${passage.questions.length}</span><b>${question.type}</b></div><h3>${question.question}</h3><div class="csat-batch-choices">${question.choices.map((choice, choiceIndex) => `<button class="${selected === choiceIndex ? "selected" : ""} ${checked && choiceIndex === question.answer ? "correct" : ""} ${checked && selected === choiceIndex && choiceIndex !== question.answer ? "wrong" : ""}" type="button" data-csat-batch-choice="${answerKey}:${choiceIndex}" ${checked ? "disabled" : ""}><i>${choiceIndex + 1}</i><span>${choice}</span></button>`).join("")}</div>${checked ? `<div class="csat-batch-feedback ${correct ? "success" : "error"}"><b>${correct ? "정답입니다." : "오답입니다."}</b><p>${question.explanation}</p><small>근거: ${question.evidence}</small></div>` : ""}<footer>${checked ? questionIndex < passage.questions.length - 1 ? `<button type="button" data-csat-batch-next-question="${passage.id}">다음 문제 ${icon("arrow",12)}</button>` : `<button type="button" data-csat-batch-master="${passage.id}">${icon("check",12)} 암기 완료 · 다음 지문</button>` : `<button type="button" data-csat-batch-check="${answerKey}" ${selected === undefined ? "disabled" : ""}>정답 확인</button>`}</footer></section>` : ""}</article>`;
  }).join("");
  const currentNumber = dayIndexes.length ? suneungState.batchPosition + 1 : 0;
  const canGoPrevious = suneungState.batchDay > 1 || suneungState.batchPosition > 0;
  const canGoNext = availableIndexes.length > 1;
  const dayButtons = Array.from({ length: totalDays }, (_, index) => index + 1).map(day => `<button class="${day === suneungState.batchDay ? "active" : ""}" type="button" data-csat-batch-day="${day}" aria-current="${day === suneungState.batchDay ? "page" : "false"}">${day}</button>`).join("");
  return `${header(`${currentModeConfig().shortLabel} 지문 훈련`)}<main class="suneung-page csat-batch-page csat-batch-single"><section class="csat-batch-head"><div><span>DAY ${String(suneungState.batchDay).padStart(2, "0")} · ${dayIndexes.length} QUESTIONS</span><h2>오늘의 ${currentModeConfig().shortLabel} 지문</h2><p>하루 지문을 한 문제씩 풀고 다음 DAY로 이어갑니다.</p></div><div><b>${currentNumber} / ${dayIndexes.length} 문제 · 전체 ${availableIndexes.length}개 남음</b></div></section><section class="csat-batch-grid">${cards}</section><nav class="csat-batch-question-nav" aria-label="오늘의 문제 이동"><button type="button" data-csat-batch-move="-1" ${canGoPrevious ? "" : "disabled"}>이전 문제</button><span><b>DAY ${suneungState.batchDay}</b>${currentNumber} / ${dayIndexes.length}</span><button class="primary" type="button" data-csat-batch-move="1" ${canGoNext ? "" : "disabled"}>다음 문제 ${icon("arrow", 13)}</button></nav><nav class="csat-batch-day-nav" aria-label="${currentModeConfig().shortLabel} 지문 DAY 선택">${dayButtons}</nav></main>`;
}

function resetCurrentCsatBatchAttempt() {
  const availableIndexes = suneungPassages.map((_, index) => index)
    .filter(index => !suneungState.masteredPassages.includes(suneungPassages[index].id));
  if (!availableIndexes.length) return;
  const day = Math.min(Math.max(1, Number(suneungState.batchDay) || 1), Math.max(1, Math.ceil(availableIndexes.length / 5)));
  const dayIndexes = availableIndexes.slice((day - 1) * 5, (day - 1) * 5 + 5);
  const position = Math.min(Math.max(0, Number(suneungState.batchPosition) || 0), Math.max(0, dayIndexes.length - 1));
  const passage = suneungPassages[dayIndexes[position]];
  if (!passage) return;
  const questionIndex = Math.min(suneungState.batchQuestionIndexes[passage.id] || 0, Math.max(0, passage.questions.length - 1));
  const question = passage.questions[questionIndex];
  if (!question) return;
  const answerKey = `${passage.id}:${question.id}`;
  delete suneungState.batchAnswers[answerKey];
  delete suneungState.batchChecked[answerKey];
}

function legacySuneungHomePage() {
  const status = suneungState.completed ? "완료" : suneungState.submitted ? "진행 중" : "오늘 학습 전";
  const quick = [["suneung-passage","오늘의 지문","book-open"],["suneung-wordmaster","수능 단어장","book"],["suneung-types","유형별 훈련","clipboard"],["suneung-vocab","어휘 / 구문","book"],["suneung-parent","부모 점검","calendar"]];
  return `${header("수능 영어")}<main class="suneung-page"><section class="suneung-home-hero"><div><span>TOP-TIER CSAT ENGLISH</span><h2>오늘도 1지문,<br>꾸준히 고득점 루틴</h2><p>실전 독해부터 정답 근거, 오답 원인까지 한 흐름으로 정리합니다.</p></div><div><article><b>${status}</b><span>오늘 상태</span></article><article><b>5일</b><span>연속 학습</span></article><article><b>5 / 7</b><span>주간 목표</span></article></div></section><section class="suneung-daily-card"><div><span>${suneungPassage.number} · TODAY'S PASSAGE</span><em>${suneungState.completed ? "완료" : "학습 대기"}</em></div><h2>${suneungPassage.topic}</h2><p>생산적인 어려움이 학습 효과를 높이는 이유</p><ul><li>${suneungPassage.type}</li><li>난이도 ${suneungPassage.difficulty}</li><li>약 ${suneungPassage.minutes}분</li><li>권장 ${suneungPassage.limit}</li></ul><button type="button" data-page="suneung-passage">${suneungState.completed ? "복습하기" : suneungState.selected !== null ? "이어서 학습" : "오늘 지문 시작하기"} ${icon("arrow",14)}</button></section><div class="suneung-home-grid"><section><header><div><span>WEAK POINTS</span><h3>최근 취약 유형 TOP 3</h3></div><button data-page="suneung-types">전체 유형</button></header>${[["빈칸 추론","58%","취약"],["문장 삽입","64%","복습 필요"],["순서 배열","71%","점검"]].map((item,index)=>`<article><i>${index+1}</i><b>${item[0]}</b><span>${item[1]}</span><em>${item[2]}</em></article>`).join("")}</section><section><header><div><span>TODAY'S VOCAB</span><h3>오늘의 핵심 단어</h3></div><button data-page="suneung-vocab">학습하기</button></header><div class="suneung-word-preview">${suneungPassage.vocab.slice(0,6).map(item=>`<b>${item.word}<small>${item.meaning}</small></b>`).join("")}</div></section></div><section class="suneung-performance"><article><span>최근 7일 학습</span><b>5일</b></article><article><span>평균 정답률</span><b>74%</b></article><article><span>복습 필요</span><b>6문제</b></article><article><span>가장 약한 유형</span><b>빈칸</b></article></section><nav class="suneung-quick-menu">${quick.map(item=>`<button data-page="${item[0]}">${icon(item[2],17)}<span>${item[1]}</span>${icon("chevron",13)}</button>`).join("")}</nav></main>`;
}

function suneungSourceHomePage() {
  const tabs = [["official","공식 기출"],["office","교육청 실전"],["ebs","EBS 연계"],["review","약점 복습"]];
  const sources = {
    official: [
      { agency:"한국교육과정평가원", exam:"대학수학능력시험 영어 영역", period:"2025학년도 11월", number:"전체 문항", type:"수능 기출", grade:"공식 기출", original:"원문 PDF 기준", url:"https://www.suneung.re.kr/" },
      { agency:"한국교육과정평가원", exam:"6월 모의평가 영어 영역", period:"2026학년도 6월", number:"전체 문항", type:"모의평가", grade:"공식 기출", original:"원문 PDF 기준", url:"https://www.suneung.re.kr/" },
      { agency:"한국교육과정평가원", exam:"9월 모의평가 영어 영역", period:"2025학년도 9월", number:"전체 문항", type:"모의평가", grade:"공식 기출", original:"원문 PDF 기준", url:"https://www.suneung.re.kr/" }
    ],
    office: [{ agency:"시도교육청", exam:"전국연합학력평가 영어 영역", period:"연도·시행월 선택", number:"전체 문항", type:"학력평가", grade:"교육청", original:"주관 교육청 원문 기준", url:"https://www.ebsi.co.kr/ebs/xip/xipc/previousPaperList.ebs?mainYn=Y" }],
    ebs: [{ agency:"한국교육방송공사(EBS)", exam:"EBS 수능 연계교재", period:"현행 연계 자료", number:"교재 문항", type:"EBS 연계", grade:"EBS 연계", original:"EBS 공식 자료 기준", url:"https://www.ebsi.co.kr/" }],
    review: []
  };
  const items = sources[suneungState.sourceTab] || sources.official;
  const cards = items.length ? items.map(item=>`<article class="suneung-source-card"><div><span class="suneung-official-badge">${icon("check",12)} ${item.grade}</span><em>${item.original}</em></div><h3>${item.exam}</h3><dl><div><dt>출처 기관</dt><dd>${item.agency}</dd></div><div><dt>시행연도/시기</dt><dd>${item.period}</dd></div><div><dt>문항 번호</dt><dd>${item.number}</dd></div><div><dt>유형</dt><dd>${item.type}</dd></div></dl><a href="${item.url}" target="_blank" rel="noopener noreferrer">원출처에서 확인 ${icon("arrow",13)}</a></article>`).join("") : `<section class="suneung-source-empty"><span>${icon("check",20)}</span><h3>저장된 공식 문항의 약점 복습이 아직 없습니다.</h3><p>공식 문항을 푼 뒤 틀린 문제만 이곳에 모입니다.</p></section>`;
  return `${header("수능 영어")}<main class="suneung-page"><section class="suneung-trust-hero"><div><span>VERIFIED CSAT ENGLISH</span><h2>출처가 분명한 문제만 학습하세요</h2><p>평가원·시도교육청·EBS 공식 공개 자료를 기준으로 제공합니다.</p></div><label class="suneung-official-toggle"><input type="checkbox" data-suneung-official ${suneungState.officialOnly?"checked":""}><i></i><span><b>공식 기출만 보기</b><small>기본값 ON</small></span></label></section><nav class="suneung-source-tabs">${tabs.map(tab=>`<button class="${suneungState.sourceTab===tab[0]?"active":""}" data-suneung-source-tab="${tab[0]}">${tab[1]}</button>`).join("")}</nav>${suneungState.officialOnly?`<section class="suneung-source-notice">${icon("check",16)}<div><b>검증된 공식 출처만 표시 중</b><p>출처 불명 자료와 AI 생성 문항은 기본 학습 목록에서 제외됩니다.</p></div><button data-page="suneung-policy">출처 정책</button></section>`:`<section class="suneung-unofficial-warning">공식 필터가 꺼져 있습니다. 자체 제작 예시는 공식 기출이 아니며 UI 체험용으로만 제공됩니다. <button data-page="suneung-passage">비공식 예시 보기</button></section>`}<section class="suneung-source-grid">${cards}</section></main>`;
}

function suneungHomePage() {
  if (suneungState.completed) suneungState.dailyChecks.passage = true;
  const completed = suneungHomeStudyItems.filter(item => suneungState.dailyChecks[item.id]).length;
  const progress = Math.round((completed / suneungHomeStudyItems.length) * 100);
  const pending = suneungHomeStudyItems.filter(item => !suneungState.dailyChecks[item.id]).slice(0, 2);
  return `${header("오늘의 학습")}<main class="home-dashboard-page suneung-today-home">
    <div class="home-dashboard-layout">
      <section class="home-study-section" aria-labelledby="suneung-home-study-title">
        <div class="home-study-heading"><div><p class="eyebrow">${currentModeConfig().eyebrow}</p><h3 id="suneung-home-study-title">오늘 무엇을 공부할까요?</h3></div><span>${completed} / ${suneungHomeStudyItems.length} 완료</span></div>
        <div class="home-study-grid">${suneungHomeStudyItems.map(item => {
          const isDone = Boolean(suneungState.dailyChecks[item.id]);
          return `<article class="home-study-card ${isDone ? "completed" : ""}" data-suneung-home-page="${item.page}" tabindex="0" role="link" aria-label="${item.title} 학습 화면으로 이동">
            <div class="home-study-card-top"><div><span class="home-study-number">${item.number}</span><span class="home-study-icon ${item.color}">${icon(item.icon, 22)}</span></div><button class="home-study-toggle" type="button" data-suneung-home-toggle="${item.id}" aria-pressed="${isDone}" aria-label="${item.title} ${isDone ? "완료 취소" : "완료 표시"}">${icon("check", 15)}</button></div>
            <span class="home-study-done-chip">${icon("check", 11)} 완료된 학습</span><h4>${item.title}</h4>
            <div class="home-card-microplan"><span>${item.unit}</span><span>${isDone ? "오늘 학습 완료" : "진행 전"}</span><span>${item.tag}</span></div>
            <div class="home-study-card-bottom"><span>${isDone ? "복습 이어하기" : item.cta} ${icon("arrow", 15)}</span><em>${item.tag}</em></div>
          </article>`;
        }).join("")}</div>
      </section>
      <aside class="home-dashboard-side"><section class="home-progress-card" aria-labelledby="suneung-home-progress-title">
        <p class="eyebrow">TODAY'S PROGRESS</p><div class="home-progress-title"><h3 id="suneung-home-progress-title">오늘의 ${currentModeConfig().shortLabel} 학습</h3><strong>${completed}<small> / ${suneungHomeStudyItems.length}</small></strong></div>
        <p class="home-progress-desc">완료한 학습과 남은 항목을 한눈에 확인하세요.</p>
        <div class="home-progress-track" role="progressbar" aria-label="오늘의 수능 학습 진도" aria-valuemin="0" aria-valuemax="${suneungHomeStudyItems.length}" aria-valuenow="${completed}"><i style="width:${progress}%"></i></div><span class="home-progress-percent">${progress}% 완료</span>
        <div class="home-coach-box"><b>다음 학습</b>${pending.length ? pending.map(item => `<button type="button" data-page="${item.page}">${item.title} ${icon("arrow", 12)}</button>`).join("") : `<span>오늘의 ${currentModeConfig().shortLabel} 학습을 모두 완료했습니다.</span>`}<b>학습 기준</b><p>단어 학습, 지문 풀이, 오답 복습을 순서대로 점검합니다.</p></div>
        <ul>${suneungHomeStudyItems.map(item => `<li class="${suneungState.dailyChecks[item.id] ? "done" : ""}"><i>${suneungState.dailyChecks[item.id] ? icon("check", 12) : ""}</i><span>${item.number}. ${item.title}</span><em>${suneungState.dailyChecks[item.id] ? "완료" : "진행 전"}</em></li>`).join("")}</ul>
        <button class="home-progress-reset" type="button" data-suneung-home-reset>오늘의 체크 초기화</button>
      </section></aside>
    </div>
  </main>`;
}

function suneungWordmasterPage() {
  return `${header(`${currentModeConfig().shortLabel} 단어장`)}<main class="suneung-page suneung-wordmaster-page"><csat-wordmaster-mode mode="${modeFromAudience(audienceMode)}"></csat-wordmaster-mode></main>`;
}

function legacySuneungPassagePage() {
  if (suneungState.officialOnly) return `${header("오늘의 수능 지문")}<main class="suneung-page"><section class="suneung-verified-empty"><span>${icon("check",24)}</span><h2>공식 원문 확인이 필요한 문항입니다.</h2><p>공식 공개문항의 지문·선택지를 임의로 재현하지 않습니다. 원출처에서 확인된 문항만 학습 화면에 등록됩니다.</p><div><b>출처 기준</b><span>한국교육과정평가원 공식 공개문항</span><b>현재 상태</b><span>원문 미등록</span><b>AI 생성 여부</b><span>기본 학습 모드 제외</span></div><a href="https://www.suneung.re.kr/" target="_blank" rel="noopener noreferrer">평가원 원출처 확인 ${icon("arrow",13)}</a><button data-page="suneung-home">공식 기출 목록으로</button></section></main>`;
  const answered = suneungState.submitted;
  const correct = suneungState.selected === suneungPassage.answer;
  return `${header("오늘의 수능 지문")}<main class="suneung-page"><section class="suneung-passage-head"><button data-page="suneung-home">← 수능 홈</button><div><span>${suneungPassage.number}</span><h2>${suneungPassage.topic}</h2><p>${suneungPassage.type} · 난이도 ${suneungPassage.difficulty} · 예상 ${suneungPassage.minutes}분 · 권장 ${suneungPassage.limit}</p></div><nav><button class="${suneungState.mode === "exam" ? "active" : ""}" data-suneung-mode="exam">실전 모드</button><button class="${suneungState.mode === "study" ? "active" : ""}" data-suneung-mode="study">학습 모드</button></nav></section><div class="suneung-study-layout"><article class="suneung-passage-card"><header><span>${suneungState.mode === "exam" ? "EXAM MODE · 해석과 힌트 비공개" : "STUDY MODE · 단락별 해석 가능"}</span><b>권장 제한 시간 ${suneungPassage.limit}</b></header><div class="suneung-passage-text">${suneungPassage.paragraphs.map((paragraph,index)=>`<section><i>${index+1}</i><p>${paragraph}</p>${suneungState.mode === "study" ? `<button data-suneung-translation="${index}">${suneungState.translations.includes(index) ? "해석 접기" : "문단 해석 보기"}</button>${suneungState.translations.includes(index) ? `<div>${suneungPassage.translations[index]}</div>` : ""}` : ""}</section>`).join("")}</div><fieldset class="suneung-question"><legend><small>${suneungPassage.type}</small>${suneungPassage.question}</legend>${suneungPassage.choices.map((choice,index)=>`<button class="${suneungState.selected===index?"selected":""} ${answered&&index===suneungPassage.answer?"correct":""} ${answered&&suneungState.selected===index&&index!==suneungPassage.answer?"wrong":""}" data-suneung-answer="${index}" ${answered?"disabled":""}><i>${index+1}</i>${choice}</button>`).join("")}<button class="submit" data-suneung-submit ${suneungState.selected===null||answered?"disabled":""}>정답 제출</button></fieldset>${answered?`<section class="suneung-explanation ${correct?"success":"error"}"><header><span>${correct?icon("check",17):icon("x",17)}</span><div><b>${correct?"정답입니다.":"오답입니다."}</b><p>정답 ${suneungPassage.answer+1}번 · ${suneungPassage.choices[suneungPassage.answer]}</p></div><button data-suneung-review-save>${suneungState.reviewSaved?"복습 예약됨":"오답 복습 예약"}</button></header><div><h3>정답 해설</h3><p>${suneungPassage.explanation}</p><blockquote><b>정답 근거</b>${suneungPassage.evidence}</blockquote><h3>오답 선택지 분석</h3>${suneungPassage.traps.map(item=>`<p>${item}</p>`).join("")}</div></section>`:""}</article><aside class="suneung-study-side"><section><span>오늘의 핵심 어휘</span>${suneungPassage.vocab.map(item=>`<article><b>${item.word}</b><p>${item.meaning}</p><small>${item.usage}</small></article>`).join("")}</section><section><span>핵심 구문</span><b>forces learners / to organize and reconstruct / what they know</b><p>동사 force + 목적어 + to부정사 구조입니다. what they know는 reconstruct의 목적어 역할을 합니다.</p></section></aside></div>${answered?`<section class="suneung-complete-bar"><div><b>${suneungState.completed?"오늘 지문 완료":"해설까지 확인했어요"}</b><p>${suneungState.completed?"오늘의 수능 루틴이 저장되었습니다.":"완료 처리 후 부모 점검 화면에도 반영됩니다."}</p></div><button data-suneung-complete ${suneungState.completed?"disabled":""}>${suneungState.completed?"학습 완료됨":"오늘 지문 완료"}</button><button data-page="suneung-types">취약 유형 훈련</button></section>`:""}</main>`;
}

function renderPassageDictionaryText(paragraph) {
  return escapeMarkup(paragraph).replace(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g, token => {
    const word = token.toLowerCase().replace(/’/g, "'");
    return `<button type="button" class="suneung-dictionary-word" data-dictionary-word="${word}" aria-label="${token} 뜻 보기">${token}</button>`;
  });
}

const naverDictionaryCache = new Map();
let dictionaryCloseTimer = null;

function positionDictionaryTooltip(tooltip, target) {
  const rect = target.getBoundingClientRect();
  const width = Math.min(300, window.innerWidth - 20);
  tooltip.style.width = `${width}px`;
  tooltip.style.left = `${Math.max(10, Math.min(window.innerWidth - width - 10, rect.left + rect.width / 2 - width / 2))}px`;
  const height = tooltip.offsetHeight || 130;
  const above = rect.top - height - 12;
  tooltip.style.top = `${above >= 10 ? above : Math.min(window.innerHeight - height - 10, rect.bottom + 12)}px`;
  tooltip.classList.toggle("below", above < 10);
}

async function showDictionaryTooltip(target) {
  window.clearTimeout(dictionaryCloseTimer);
  const word = target.dataset.dictionaryWord;
  let tooltip = document.querySelector(".suneung-word-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("aside");
    tooltip.className = "suneung-word-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.addEventListener("mouseenter", () => window.clearTimeout(dictionaryCloseTimer));
    tooltip.addEventListener("mouseleave", hideDictionaryTooltip);
    document.body.append(tooltip);
  }
  tooltip.dataset.word = word;
  tooltip.classList.add("visible", "loading");
  tooltip.innerHTML = `<b>${escapeMarkup(target.textContent)}</b><span>네이버 영어사전에서 뜻을 찾고 있어요…</span>`;
  positionDictionaryTooltip(tooltip, target);

  let result = naverDictionaryCache.get(word);
  if (!result) {
    try {
      const response = await fetch(`/api/naver-dictionary?word=${encodeURIComponent(word)}`, { cache: "force-cache" });
      result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "뜻을 찾지 못했습니다.");
      naverDictionaryCache.set(word, result);
    } catch (error) {
      result = { ok: false, message: error.message || "뜻을 불러오지 못했습니다." };
    }
  }
  if (tooltip.dataset.word !== word) return;
  tooltip.classList.remove("loading");
  if (!result.ok || !result.meanings?.length) {
    tooltip.innerHTML = `<b>${escapeMarkup(target.textContent)}</b><span>${escapeMarkup(result.message || "등록된 뜻을 찾지 못했습니다.")}</span><a href="https://en.dict.naver.com/#/search?query=${encodeURIComponent(word)}" target="_blank" rel="noopener noreferrer">네이버에서 직접 보기</a>`;
  } else {
    tooltip.innerHTML = `<header><b>${escapeMarkup(result.entry || word)}</b><small>NAVER 영어사전</small></header><ul>${result.meanings.map(item => `<li>${item.partOfSpeech ? `<em>${escapeMarkup(item.partOfSpeech)}</em>` : ""}<span>${escapeMarkup(item.value)}</span></li>`).join("")}</ul><a href="${escapeMarkup(result.sourceUrl)}" target="_blank" rel="noopener noreferrer">네이버에서 더 보기</a>`;
  }
  positionDictionaryTooltip(tooltip, target);
}

function hideDictionaryTooltip() {
  window.clearTimeout(dictionaryCloseTimer);
  dictionaryCloseTimer = window.setTimeout(() => document.querySelector(".suneung-word-tooltip")?.classList.remove("visible"), 160);
}

function bindSuneungDictionaryTooltips() {
  document.querySelector(".suneung-word-tooltip")?.remove();
  document.querySelectorAll(".suneung-passage-text section > p").forEach(paragraph => {
    paragraph.innerHTML = renderPassageDictionaryText(paragraph.textContent || "");
  });
  document.querySelectorAll(".suneung-dictionary-word").forEach(word => {
    word.addEventListener("mouseenter", () => showDictionaryTooltip(word));
    word.addEventListener("mouseleave", hideDictionaryTooltip);
    word.addEventListener("focus", () => showDictionaryTooltip(word));
    word.addEventListener("blur", hideDictionaryTooltip);
    word.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      showDictionaryTooltip(word);
    });
  });
}

function suneungPassagePage() {
  if (suneungState.masteredPassages.length >= suneungPassages.length) return `${header(`${currentModeConfig().shortLabel} 지문 훈련`)}<main class="suneung-page"><section class="suneung-verified-empty"><span>${icon("check",24)}</span><h2>등록된 지문을 모두 암기했습니다.</h2><p>암기 완료한 지문은 다시 출제하지 않습니다. 새 지문이 추가되면 자동으로 다음 학습 대상에 포함됩니다.</p><button type="button" data-csat-reset-mastered>암기 완료 기록 초기화</button></section></main>`;
  return compactSuneungPassagePage();
  const tabs = [["questions", "문제 풀이"], ["expressions", "핵심 표현"], ["review", "복습 / 기록"]];
  const activeTab = suneungState.passageTab === "explanation" ? "explanation" : tabs.some(([id]) => id === suneungState.passageTab) ? suneungState.passageTab : "questions";
  const questions = Array.isArray(suneungPassage.questions) ? suneungPassage.questions : [];
  const checkedIds = Object.keys(suneungState.passageChecked).filter(id => suneungState.passageChecked[id]);
  const correctCount = questions.filter(question => suneungState.passageChecked[question.id] && suneungState.passageAnswers[question.id] === question.answer).length;
  const wrongQuestions = questions.filter(question => suneungState.passageChecked[question.id] && suneungState.passageAnswers[question.id] !== question.answer);
  const allQuestionsChecked = questions.length > 0 && checkedIds.length === questions.length;
  const currentPassageMastered = suneungState.masteredPassages.includes(suneungPassage.id);
  const nextPassageIndex = nextAvailablePassageIndex(suneungState.passageIndex, suneungState.masteredPassages);
  const expressionStatusLabel = { known: "암기함", unsure: "헷갈림", unknown: "모름" };

  const readingPanel = `<section class="csat-reading-panel" aria-label="수능 지문 읽기">
    <div class="csat-reading-toolbar"><div><b>영어 원문을 먼저 읽어보세요</b><span>${suneungState.passageTranslations.length} / ${suneungPassage.paragraphs.length}개 해석 확인</span></div><button type="button" data-csat-show-all-meanings>${suneungState.passageTranslations.length === suneungPassage.paragraphs.length ? "해석 모두 숨기기" : "해석 모두 보기"}</button></div>
    <article class="csat-reading-article">${suneungPassage.paragraphs.map((paragraph, index) => {
      const translationOpen = suneungState.passageTranslations.includes(index);
      const noteOpen = suneungState.passageNotes.includes(index);
      const difficult = suneungState.difficultSentences.includes(index);
      const bookmarked = suneungState.bookmarkedSentences.includes(index);
      return `<section class="csat-reading-block ${bookmarked ? "bookmarked" : ""} ${difficult ? "difficult" : ""}"><div class="csat-sentence-number">${String(index + 1).padStart(2, "0")}</div><p>${paragraph}</p><div class="csat-sentence-actions"><button class="${translationOpen ? "active" : ""}" type="button" data-csat-translation="${index}">${translationOpen ? "해석 숨기기" : "해석 보기"}</button><button class="${noteOpen ? "active" : ""}" type="button" data-csat-note="${index}">${noteOpen ? "분석 닫기" : "문장 분석"}</button><button class="${difficult ? "active warning" : ""}" type="button" data-csat-difficult="${index}">${icon("bookmark", 12)} 모르는 문장</button><button class="${bookmarked ? "active" : ""}" type="button" data-csat-bookmark="${index}">${icon("bookmark", 12)} 중요 문장</button></div>${translationOpen ? `<div class="csat-translation"><b>해석</b><p>${suneungPassage.translations[index] || "등록된 해석이 없습니다."}</p></div>` : ""}${noteOpen ? `<div class="csat-analysis"><b>문장 분석</b><p>${suneungPassage.notes?.[index] || "등록된 문장 분석이 없습니다."}</p></div>` : ""}</section>`;
    }).join("")}</article>
    <button class="csat-panel-next" type="button" data-csat-passage-tab="expressions">핵심 표현 학습하기 ${icon("arrow", 14)}</button>
  </section>`;

  const expressionsPanel = `<section class="csat-expression-panel" aria-label="핵심 표현 학습"><header><div><span>KEY EXPRESSIONS</span><h3>지문을 이해하는 핵심 표현</h3></div><b>${Object.keys(suneungState.expressionStatus).length} / ${suneungPassage.expressions.length}개 분류</b></header><div class="csat-expression-grid">${suneungPassage.expressions.map(item => {
    const status = suneungState.expressionStatus[item.id] || "";
    return `<article><div><span>${status ? expressionStatusLabel[status] : "학습 전"}</span><h4>${item.text}</h4><strong>${item.meaning}</strong></div><details><summary>예문과 해설 보기</summary><p>${item.example}</p><small>${item.note}</small></details><div class="csat-expression-status" role="group" aria-label="${item.text} 학습 상태">${[["known", "암기함"], ["unsure", "헷갈림"], ["unknown", "모름"]].map(([value, label]) => `<button class="${status === value ? "active" : ""}" type="button" data-csat-expression="${item.id}" data-csat-expression-status="${value}">${label}</button>`).join("")}</div></article>`;
  }).join("")}</div><button class="csat-panel-next" type="button" data-csat-passage-tab="review">복습 기록 확인 ${icon("arrow", 14)}</button></section>`;

  const currentQuestion = questions[Math.min(suneungState.passageQuestionIndex, Math.max(0, questions.length - 1))];
  const questionPanel = currentQuestion ? (() => {
    const selected = suneungState.passageAnswers[currentQuestion.id];
    const checked = Boolean(suneungState.passageChecked[currentQuestion.id]);
    const correct = checked && selected === currentQuestion.answer;
    const referencePassage = suneungPassage.paragraphs.map((paragraph, index) => `<section><i>${index + 1}</i><p>${paragraph}</p></section>`).join("");
    return `<section class="csat-question-panel" aria-label="수능 지문 문제 풀이"><header><div><span>QUESTION ${suneungState.passageQuestionIndex + 1} / ${questions.length}</span><h3>${currentQuestion.type}</h3></div><div class="csat-question-progress"><i style="width:${((suneungState.passageQuestionIndex + 1) / questions.length) * 100}%"></i></div></header><div class="csat-question-workspace"><aside class="csat-question-passage"><div><b>PASSAGE</b><span>실전처럼 영어 지문만 읽고 풀어보세요</span></div>${referencePassage}${allQuestionsChecked ? `<button class="csat-passage-explanation-button" type="button" data-csat-passage-tab="explanation">해설 화면 ${icon("arrow", 13)}</button>` : ""}</aside><article><h4>${currentQuestion.question}</h4><div class="csat-question-choices">${currentQuestion.choices.map((choice, index) => `<button class="${selected === index ? "selected" : ""} ${checked && index === currentQuestion.answer ? "correct" : ""} ${checked && selected === index && index !== currentQuestion.answer ? "wrong" : ""}" type="button" data-csat-question-choice="${index}" ${checked ? "disabled" : ""}><i>${index + 1}</i><span>${choice}</span></button>`).join("")}</div>${checked ? `<section class="csat-question-feedback ${correct ? "success" : "error"}"><b>${correct ? "정답입니다." : "오답입니다."}</b><p>${currentQuestion.explanation}</p><blockquote><strong>근거</strong>${currentQuestion.evidence}</blockquote></section>` : ""}<div class="csat-question-actions"><button type="button" data-csat-question-prev ${suneungState.passageQuestionIndex === 0 ? "disabled" : ""}>이전 문제</button>${checked ? suneungState.passageQuestionIndex === questions.length - 1 ? `<span class="csat-questions-complete">전체 문제 풀이 완료</span>` : `<button class="primary" type="button" data-csat-question-next>다음 문제 ${icon("arrow", 13)}</button>` : `<button class="primary" type="button" data-csat-question-check ${selected === undefined ? "disabled" : ""}>정답 확인</button>`}</div></article></div></section>`;
  })() : `<section class="csat-empty-panel"><h3>등록된 문제가 없습니다.</h3><p>지문 데이터에 문제가 추가되면 이곳에서 바로 풀 수 있습니다.</p></section>`;

  const explanationPanel = `<section class="csat-passage-explanation" aria-label="수능 지문 전체 해설"><header><div><span>FULL EXPLANATION</span><h3>전체 번역과 문장 분석</h3><p>모든 문제를 푼 뒤 지문의 흐름과 문법 구조를 확인하세요.</p></div><button type="button" data-csat-passage-tab="questions">문제로 돌아가기</button></header><article>${suneungPassage.paragraphs.map((paragraph, index) => `<section><i>${String(index + 1).padStart(2, "0")}</i><div><h4>${paragraph}</h4><div class="csat-explanation-translation"><b>전체 번역</b><p>${suneungPassage.translations[index] || "등록된 번역이 없습니다."}</p></div><div class="csat-explanation-grammar"><b>문법·구조 분석</b><p>${suneungPassage.notes?.[index] || "등록된 문장 분석이 없습니다."}</p></div></div></section>`).join("")}</article><footer><button type="button" data-csat-passage-tab="expressions">핵심 표현 확인 ${icon("arrow", 13)}</button><button type="button" data-csat-passage-tab="review">풀이 결과·복습 기록 ${icon("arrow", 13)}</button></footer></section>`;

  const reviewPanel = `<section class="csat-review-panel" aria-label="수능 지문 복습 기록"><div class="csat-result-summary"><article><span>풀이 문항</span><b>${checkedIds.length}<small> / ${questions.length}</small></b></article><article><span>정답</span><b>${correctCount}</b></article><article><span>오답</span><b>${wrongQuestions.length}</b></article><article><span>모르는 문장</span><b>${suneungState.difficultSentences.length}</b></article></div><div class="csat-review-grid"><section><header><h3>오답 문항</h3><span>${wrongQuestions.length}개</span></header>${wrongQuestions.length ? wrongQuestions.map(question => `<button type="button" data-csat-retry-question="${question.id}"><span>${question.type}</span><b>${question.question}</b>${icon("arrow", 13)}</button>`).join("") : `<p class="csat-review-empty">현재 저장된 오답이 없습니다.</p>`}</section><section><header><h3>저장한 학습 항목</h3></header><dl><div><dt>중요 문장</dt><dd>${suneungState.bookmarkedSentences.length}개</dd></div><div><dt>모르는 문장</dt><dd>${suneungState.difficultSentences.length}개</dd></div><div><dt>헷갈리는 표현</dt><dd>${Object.values(suneungState.expressionStatus).filter(value => value === "unsure" || value === "unknown").length}개</dd></div><div><dt>오늘 지문</dt><dd>${suneungState.completed ? "학습 완료" : "진행 중"}</dd></div></dl></section></div></section>`;

  const panels = { expressions: expressionsPanel, questions: questionPanel, explanation: explanationPanel, review: reviewPanel };
  return `${header("수능 지문 훈련")}<main class="suneung-page csat-passage-learning"><section class="csat-passage-hero"><div><button type="button" data-page="suneung-home">← 오늘의 학습</button><span>${suneungPassage.number} · ${suneungState.passageIndex + 1} / ${suneungPassages.length}</span><h2>${suneungPassage.topic}</h2><p>한 지문을 완료하면 다음 지문으로 계속 학습할 수 있습니다.</p></div><aside><span>${suneungPassage.source}</span><b>${suneungPassage.sourceDetail}</b><div>${suneungPassage.tags.map(tag => `<em>${tag}</em>`).join("")}</div><small>난이도 ${suneungPassage.difficulty} · 예상 ${suneungPassage.minutes}분 · 권장 ${suneungPassage.limit}</small><nav class="csat-passage-queue-actions"><button class="${currentPassageMastered ? "mastered" : ""}" type="button" data-csat-master-passage ${currentPassageMastered ? "disabled" : ""}>${currentPassageMastered ? `${icon("check", 13)} 암기 완료됨` : "암기 완료"}</button><button type="button" data-csat-skip-passage ${nextPassageIndex < 0 ? "disabled" : ""}>다음 지문 ${icon("arrow", 13)}</button></nav></aside></section><nav class="csat-passage-tabs" aria-label="수능 지문 학습 단계">${tabs.map(([id, label], index) => `<button class="${activeTab === id ? "active" : ""}" type="button" data-csat-passage-tab="${id}"><i>${index + 1}</i><span>${label}</span></button>`).join("")}</nav>${panels[activeTab]}<section class="csat-learning-footer"><div><b>${suneungState.completed ? "현재 지문 학습 완료" : allQuestionsChecked ? "문제 풀이를 완료했습니다" : "먼저 모든 문제를 풀어보세요"}</b><p>${suneungState.completed ? "다음 지문으로 바로 이어서 학습할 수 있습니다." : allQuestionsChecked ? "지문 아래의 해설 화면에서 전체 번역과 문법 분석을 확인할 수 있습니다." : `${checkedIds.length} / ${questions.length}문항 풀이 완료`}</p></div><button class="${suneungState.completed ? "done" : ""}" type="button" data-suneung-complete ${suneungState.completed || !allQuestionsChecked ? "disabled" : ""}>${suneungState.completed ? `${icon("check", 14)} 완료됨` : "이 지문 완료"}</button>${suneungState.completed ? `<button type="button" data-csat-next-passage>다음 지문 ${icon("arrow", 14)}</button>` : `<button type="button" data-page="suneung-types">취약 유형 훈련으로</button>`}</section></main>`;
}

const csatTypeTrainingData = [
  { id: "title", name: "제목 찾기", accuracy: 82, delta: 4, attempts: 12, wrong: 2, status: "strong", badge: "안정권", description: "글 전체를 아우르는 핵심 제목을 고르는 유형", reason: "핵심어 대응이 안정적으로 유지되고 있어요.", focus: "핵심어 대응", weakPoint: "매력적인 부분 제목을 전체 제목으로 고르는 실수" },
  { id: "topic", name: "주제 파악", accuracy: 78, delta: 6, attempts: 14, wrong: 3, status: "rising", badge: "최근 상승", description: "반복되는 핵심 개념으로 글의 중심 소재를 찾는 유형", reason: "최근 3회 훈련에서 6%p 상승했어요.", focus: "주제문 파악", weakPoint: "첫 문장만 보고 주제를 성급하게 결정하는 실수" },
  { id: "main-point", name: "요지", accuracy: 76, delta: 3, attempts: 11, wrong: 3, status: "maintain", badge: "유지 필요", description: "필자가 전달하려는 핵심 메시지를 파악하는 유형", reason: "결론 문장과 근거의 연결을 한 번 더 점검하세요.", focus: "주장과 근거", weakPoint: "소재와 필자의 메시지를 혼동하는 실수" },
  { id: "blank", name: "빈칸 추론", accuracy: 58, delta: 8, attempts: 16, wrong: 7, status: "recommended", badge: "최우선 추천", description: "전후 문맥과 논리 흐름으로 핵심 의미를 추론하는 유형", reason: "가장 낮은 정답률이지만 최근 8%p 개선됐어요.", focus: "대조 구조 파악", weakPoint: "빈칸 주변 문장만 읽고 전체 논리를 놓치는 실수" },
  { id: "implicit", name: "함축 의미 추론", accuracy: 67, delta: -2, attempts: 8, wrong: 4, status: "weak", badge: "취약", description: "비유와 문맥 속 표현이 실제로 의미하는 바를 찾는 유형", reason: "추상어 해석에서 최근 오답이 반복됐어요.", focus: "추상어 해석", weakPoint: "표현의 사전적 의미를 그대로 선택하는 실수" },
  { id: "vocabulary", name: "어휘 추론", accuracy: 73, delta: 5, attempts: 10, wrong: 3, status: "rising", badge: "최근 상승", description: "문맥에 맞는 어휘 의미와 쓰임을 판단하는 유형", reason: "문맥 단서 활용이 좋아지고 있어요.", focus: "문맥 단서", weakPoint: "익숙한 뜻만 보고 문맥상 의미를 놓치는 실수" },
  { id: "grammar", name: "어법", accuracy: 80, delta: 1, attempts: 13, wrong: 2, status: "strong", badge: "안정권", description: "문장 구조와 문법 관계가 올바른지 판단하는 유형", reason: "현재 안정권이며 주 1회 유지 훈련을 권장해요.", focus: "수식 관계", weakPoint: "긴 수식어 때문에 주어와 동사의 수 일치를 놓치는 실수" },
  { id: "insertion", name: "문장 삽입", accuracy: 64, delta: 4, attempts: 12, wrong: 5, status: "weak", badge: "취약", description: "지시어와 연결 관계로 문장이 들어갈 위치를 찾는 유형", reason: "지시어 추적 오답이 최근 3회 반복됐어요.", focus: "지시어 추적", weakPoint: "앞 문장만 보고 뒤 문장과의 연결을 확인하지 않는 실수" },
  { id: "ordering", name: "글의 순서 배열", accuracy: 71, delta: 7, attempts: 10, wrong: 3, status: "rising", badge: "최근 상승", description: "연결사와 정보 흐름으로 문단의 순서를 배열하는 유형", reason: "논리 흐름 파악이 최근 7%p 개선됐어요.", focus: "연결사 판단", weakPoint: "대명사가 가리키는 대상을 확인하지 않는 실수" },
  { id: "summary", name: "요약문 완성", accuracy: 77, delta: 2, attempts: 7, wrong: 2, status: "maintain", badge: "유지 필요", description: "핵심 내용을 압축한 요약문의 빈칸을 완성하는 유형", reason: "핵심어 대응은 좋지만 반대 방향 선택지를 주의하세요.", focus: "핵심어 대응", weakPoint: "원문의 방향과 반대인 어휘 조합을 고르는 실수" },
  { id: "long", name: "장문 독해", accuracy: 75, delta: 5, attempts: 6, wrong: 2, status: "maintain", badge: "유지 필요", description: "긴 글의 흐름을 유지하며 여러 문항을 해결하는 유형", reason: "정확도는 양호하며 시간 관리 훈련이 필요해요.", focus: "정보 위치 추적", weakPoint: "앞 문항을 풀며 뒤 문항의 근거를 놓치는 실수" },
];

function csatTypeIdFromLabel(label = "") {
  const value = String(label);
  if (value.includes("제목")) return "title";
  if (value.includes("주제")) return "topic";
  if (value.includes("요지") || value.includes("주장") || value.includes("내용 이해")) return "main-point";
  if (value.includes("빈칸")) return "blank";
  if (value.includes("함축")) return "implicit";
  if (value.includes("어휘")) return "vocabulary";
  if (value.includes("어법")) return "grammar";
  if (value.includes("삽입")) return "insertion";
  if (value.includes("순서")) return "ordering";
  if (value.includes("요약")) return "summary";
  if (value.includes("장문")) return "long";
  return "";
}

function currentCsatTypeTrainingData() {
  const history = Array.isArray(suneungState.typeTrainingHistory) ? suneungState.typeTrainingHistory : [];
  const seeds = audienceMode === "middle" ? csatTypeTrainingData.filter(seed => ["topic", "main-point"].includes(seed.id)) : csatTypeTrainingData;
  return seeds.map(seed => {
    const entries = history.filter(entry => entry.typeId === seed.id).slice(-20);
    if (!entries.length) return { ...seed, previousAccuracy: Math.max(0, seed.accuracy - seed.delta), isPersonal: false };
    const recent = entries.slice(-5);
    const previous = entries.slice(-10, -5);
    const accuracy = Math.round((recent.filter(entry => entry.correct).length / recent.length) * 100);
    const previousAccuracy = previous.length ? Math.round((previous.filter(entry => entry.correct).length / previous.length) * 100) : seed.accuracy;
    const delta = accuracy - previousAccuracy;
    const wrong = entries.filter(entry => !entry.correct).length;
    const status = accuracy < 60 ? "recommended" : accuracy < 70 ? "weak" : delta >= 5 ? "rising" : accuracy >= 80 ? "strong" : "maintain";
    const badge = status === "recommended" ? "최우선 추천" : status === "weak" ? "취약" : status === "rising" ? "최근 상승" : status === "strong" ? "안정권" : "유지 필요";
    const reason = status === "recommended" ? `최근 ${recent.length}문제 정답률이 가장 낮아 우선 훈련이 필요해요.` : status === "weak" ? `최근 오답 ${wrong}개가 누적되어 다시 확인이 필요해요.` : delta > 0 ? `이전 훈련보다 ${delta}%p 향상됐어요.` : delta < 0 ? `이전 훈련보다 ${Math.abs(delta)}%p 낮아져 점검이 필요해요.` : "최근 정답률이 유지되고 있어요.";
    return { ...seed, accuracy, previousAccuracy, delta, attempts: entries.length, wrong, status, badge, reason, isPersonal: true };
  });
}

function recordCsatTypeTrainingResult(passage, question, selected) {
  const typeId = csatTypeIdFromLabel(question?.type || passage?.type);
  if (!typeId || !question) return;
  const attemptId = `${passage.id}:${question.id}:${Date.now()}`;
  suneungState.typeTrainingHistory.push({
    id: attemptId,
    passageId: passage.id,
    questionId: question.id,
    typeId,
    correct: Number(selected) === Number(question.answer),
    answeredAt: new Date().toISOString(),
  });
  suneungState.typeTrainingHistory = suneungState.typeTrainingHistory.slice(-300);
}

function csatTypeTrainingPage() {
  const trainingData = currentCsatTypeTrainingData();
  const filter = suneungState.typeFilter || "all";
  const sort = suneungState.typeSort || "priority";
  const selected = trainingData.find(item => item.id === suneungState.selectedTypeId);
  const filters = [["all", "전체"], ["recommended", "추천"], ["weak", "취약"], ["strong", "강점"]];
  let items = trainingData.filter(item => filter === "all"
    || (filter === "recommended" && ["recommended", "weak"].includes(item.status))
    || (filter === "weak" && item.accuracy < 70)
    || (filter === "strong" && item.accuracy >= 80));
  items = [...items].sort((a, b) => sort === "accuracy" ? a.accuracy - b.accuracy : sort === "improvement" ? b.delta - a.delta : sort === "recent" ? b.attempts - a.attempts : (a.status === "recommended" ? -1 : b.status === "recommended" ? 1 : a.accuracy - b.accuracy));
  const weakest = [...trainingData].sort((a, b) => a.accuracy - b.accuracy)[0];
  const improved = [...trainingData].sort((a, b) => b.delta - a.delta)[0];
  const detail = selected ? `<section class="csat-type-detail"><header><div><span>${selected.badge} · ${selected.focus}</span><h2>${selected.name}</h2><p>${selected.description}</p></div><button type="button" data-csat-type-close aria-label="유형 상세 닫기">×</button></header><div class="csat-type-achievement ${selected.delta >= 0 ? "up" : "down"}"><b>${selected.delta > 0 ? `이전 ${selected.previousAccuracy}%에서 현재 ${selected.accuracy}%로 향상됐어요.` : selected.delta < 0 ? `이전보다 ${Math.abs(selected.delta)}%p 낮아져 집중 점검이 필요해요.` : "최근 정답률을 안정적으로 유지하고 있어요."}</b><span>${selected.isPersonal ? "실제 풀이 이력을 기준으로 계산했습니다." : "풀이 이력이 쌓이면 개인 기록으로 자동 전환됩니다."}</span></div><div class="csat-type-detail-grid"><section><span>현재 정답률</span><strong>${selected.accuracy}%</strong><em class="${selected.delta >= 0 ? "up" : "down"}">${selected.delta >= 0 ? "↑" : "↓"} ${Math.abs(selected.delta)}%p</em><div class="csat-type-detail-chart">${[-10,-6,-3,0].map((offset,index)=>`<i style="height:${Math.max(18,selected.accuracy+offset)}%"><small>${index+1}회</small></i>`).join("")}<i class="current" style="height:${selected.accuracy}%"><small>현재</small></i></div></section><section><h3>자주 틀리는 포인트</h3><p>${selected.weakPoint}</p><h3>이번 훈련 전략</h3><p>${selected.reason}</p><div class="csat-type-skill"><b>${selected.focus}</b><span>이 세부 기술을 우선 확인합니다.</span></div></section></div><footer><button type="button" data-csat-type-train="${selected.id}" data-csat-type-size="wrong">오답 다시 풀기</button><button type="button" data-csat-type-train="${selected.id}" data-csat-type-size="5">5문제 빠르게</button><button class="primary" type="button" data-csat-type-train="${selected.id}" data-csat-type-size="10">실전 10문제 ${icon("arrow",13)}</button></footer></section>` : "";
  const cards = items.length ? items.map(item => `<article class="csat-type-card ${item.status}"><header><span>${item.badge}</span><em>${item.focus}</em></header><h3>${item.name}</h3><p>${item.description}</p><section class="csat-type-kpi"><div><small>현재 정답률</small><strong>${item.accuracy}<i>%</i></strong></div><em class="${item.delta >= 0 ? "up" : "down"}">${item.delta >= 0 ? "+" : ""}${item.delta}%p</em></section><div class="csat-type-meter"><i style="width:${item.accuracy}%"></i></div><p class="csat-type-reason">${icon(item.delta >= 0 ? "arrow" : "x",12)} ${item.reason}</p><dl><div><dt>최근 풀이</dt><dd>${item.attempts}문제</dd></div><div><dt>최근 오답</dt><dd>${item.wrong}문제</dd></div></dl><footer><button type="button" data-csat-type-detail="${item.id}">유형 상세</button><button type="button" data-csat-type-train="${item.id}" data-csat-type-size="5">5문제 훈련</button><button type="button" data-csat-type-train="${item.id}" data-csat-type-size="wrong">오답 복습</button></footer></article>`).join("") : `<section class="csat-type-no-result"><b>해당 상태의 유형이 없습니다.</b><p>다른 필터를 선택해 확인해보세요.</p></section>`;
  return `${header("유형별 훈련")}<main class="suneung-page csat-type-page"><section class="csat-type-hero"><div><span>PERSONALIZED TYPE TRAINING</span><h1>취약한 유형부터 훈련하고<br>정답률 개선을 확인하세요</h1><p>문제은행이 아니라, 내 오답을 다음 훈련으로 연결하는 맞춤형 학습 허브입니다.</p></div><div><button type="button" data-csat-type-detail="${weakest.id}"><span>가장 취약 · 먼저 훈련</span><b>${weakest.name}</b><strong>${weakest.accuracy}%</strong></button><button type="button" data-csat-type-train="${weakest.id}" data-csat-type-size="5"><span>이번 주 추천</span><b>${weakest.name}</b><strong>5문제 시작</strong></button><button type="button" data-csat-type-detail="${improved.id}"><span>가장 많이 개선</span><b>${improved.name}</b><strong>${improved.delta >= 0 ? "+" : ""}${improved.delta}%p</strong></button></div></section>${detail}<section class="csat-type-controls"><nav>${filters.map(([id,label])=>`<button class="${filter===id?"active":""}" type="button" data-csat-type-filter="${id}">${label}</button>`).join("")}</nav><label>정렬<select data-csat-type-sort><option value="priority" ${sort==="priority"?"selected":""}>취약도순</option><option value="accuracy" ${sort==="accuracy"?"selected":""}>정답률 낮은순</option><option value="improvement" ${sort==="improvement"?"selected":""}>최근 개선순</option><option value="recent" ${sort==="recent"?"selected":""}>최근 풀이순</option></select></label></section><section class="csat-type-grid-new">${cards}</section></main>`;
}

function openCsatTypeTraining(typeId, size = "5") {
  const availableIndexes = suneungPassages.map((passage, index) => ({ passage, index }))
    .filter(({ passage }) => !suneungState.masteredPassages.includes(passage.id))
    .filter(({ passage }) => passageMatchesCsatType(passage, typeId));
  let candidates = availableIndexes;
  if (size === "wrong") {
    const wrongPassageIds = new Set((suneungState.typeTrainingHistory || []).filter(entry => entry.typeId === typeId && !entry.correct).map(entry => entry.passageId));
    if (wrongPassageIds.size) candidates = candidates.filter(({ passage }) => wrongPassageIds.has(passage.id));
  } else {
    const limit = Number(size);
    if (Number.isFinite(limit) && limit > 0) candidates = candidates.slice(0, limit);
  }
  const target = candidates[0];
  if (!target) return false;
  suneungState.batchDay = 1;
  suneungState.batchPosition = 0;
  suneungState.typeTrainingSize = size;
  suneungState.activeTypeTraining = { typeId, size };
  suneungState.passageIndex = target.index;
  resetCurrentCsatBatchAttempt();
  saveSuneungState();
  navigateTo("suneung-passage", { preserveTypeTraining: true });
  return true;
}

function passageMatchesCsatType(passage, typeId) {
  const typePatterns = {
    title: ["제목"],
    topic: ["주제"],
    "main-point": ["요지", "주장", "내용 이해"],
    blank: ["빈칸"],
    implicit: ["함축"],
    vocabulary: ["어휘"],
    grammar: ["어법"],
    insertion: ["삽입"],
    ordering: ["순서"],
    summary: ["요약"],
    long: ["장문"],
  };
  const patterns = typePatterns[typeId] || [];
  const searchable = [passage.type, ...(passage.questions || []).map(question => question.type)].join(" ");
  return patterns.some(pattern => searchable.includes(pattern));
}

function suneungSupportPage(view) {
  if (view === "suneung-parent") return `${header("부모 점검")}<main class="suneung-page"><section class="suneung-parent-head"><div><span>WEEKLY CHECK</span><h2>학습 루틴 점검</h2><p>압박보다 꾸준한 학습 방향을 확인하는 요약입니다.</p></div><b>${suneungState.completed?"오늘 완료":"오늘 진행 전"}</b></section><section class="suneung-parent-stats">${[["최근 7일","5일 학습"],["평균 정답률","74%"],["해설 확인","82%"],["복습 대기","6문제"]].map(item=>`<article><span>${item[0]}</span><b>${item[1]}</b></article>`).join("")}</section><div class="suneung-parent-grid"><section><h3>오늘 확인</h3>${[["오늘 지문 풀이",suneungState.submitted],["해설 확인",suneungState.submitted],["학습 완료",suneungState.completed],["오답 복습 예약",suneungState.reviewSaved]].map(item=>`<p class="${item[1]?"done":""}">${item[1]?icon("check",13):"○"}<b>${item[0]}</b><span>${item[1]?"확인":"대기"}</span></p>`).join("")}</section><section><h3>취약 유형 TOP 3</h3><p><b>빈칸 추론</b><span>58%</span></p><p><b>문장 삽입</b><span>64%</span></p><p><b>순서 배열</b><span>71%</span></p></section></div><section class="suneung-parent-comment"><span>${icon("message",17)}</span><div><b>이번 주 학습 코멘트</b><p>최근 7일 중 5일 학습해 루틴이 잘 유지되고 있습니다. 빈칸 추론은 정답 근거 문장을 먼저 찾는 연습을 권장합니다.</p></div></section></main>`;
  if (view === "suneung-vocab") return `${header("어휘 / 구문")}<main class="suneung-page"><section class="suneung-section-head"><span>VOCABULARY & STRUCTURE</span><h2>오늘 지문으로 익히는 어휘와 구문</h2></section><div class="suneung-vocab-grid">${suneungPassage.vocab.map(item=>`<article><span>필수 어휘</span><h3>${item.word}</h3><b>${item.meaning}</b><p>${item.usage}</p><button>복습 단어로 저장</button></article>`).join("")}</div><section class="suneung-syntax"><span>문장 끊어읽기</span><h3>The effort required to retrieve an idea / forces learners / to organize and reconstruct / what they know.</h3><p><b>주어</b> The effort required to retrieve an idea</p><p><b>동사</b> forces</p><p><b>목적격 보어</b> to organize and reconstruct what they know</p></section></main>`;
  if (view === "suneung-types") return csatTypeTrainingPage();
  return `${header("약점 복습")}<main class="suneung-page"><section class="suneung-section-head"><span>WEAKNESS REVIEW</span><h2>틀린 이유까지 확인하는 복습</h2><p>정답만 다시 보는 대신 오답 원인을 분류해 다음 풀이에 반영합니다.</p></section><nav class="suneung-review-filter"><button class="active">전체</button><button>어휘 부족</button><button>구조 해석 실패</button><button>선택지 비교 실패</button><button>시간 부족</button></nav><section class="suneung-review-list"><article><span>복습 필요 · 빈칸 추론</span><h3>${suneungPassage.topic}</h3><p>오답 원인: <b>${suneungState.selected!==suneungPassage.answer&&suneungState.submitted?"선택지 비교 실패":"취약 유형 정기 복습"}</b></p><button data-page="suneung-passage">다시 풀기</button></article><article><span>헷갈린 문제 · 문장 삽입</span><h3>How Context Shapes Memory</h3><p>오답 원인: <b>문장 구조 해석 실패</b></p><button>복습 시작</button></article></section></main>`;
}

function suneungPolicyPage() {
  if (audienceMode === "middle") return `${header("출처 정책")}<main class="suneung-page"><section class="suneung-policy-hero"><span>MIDDLE CONTENT POLICY</span><h2>중학교 수준에 맞춘 쉬운 영어 학습 자료</h2><p>짧은 문장, 기본 어휘, 직관적인 해석을 기준으로 학습 콘텐츠를 구성합니다.</p></section><section class="suneung-policy-grid"><article><span>01</span><h3>난이도 기준</h3><p>중학교 교육과정에서 자주 다루는 기본 어휘와 문장 구조를 중심으로 제공합니다.</p></article><article><span>02</span><h3>문장 길이</h3><p>한 문장에 담긴 정보를 줄이고 주어와 동사를 쉽게 찾을 수 있도록 구성합니다.</p></article><article><span>03</span><h3>해석과 설명</h3><p>직역보다 문맥을 이해하기 쉬운 자연스러운 해석과 짧은 문법 설명을 제공합니다.</p></article><article><span>04</span><h3>학습 흐름</h3><p>단어, 지문 읽기, 문제 풀이, 오답 복습을 수능 모드와 동일한 흐름으로 연습합니다.</p></article></section><p class="suneung-policy-note">중등 모드 자료는 ValueTime이 중학교 수준 학습을 위해 자체 구성한 콘텐츠입니다.</p></main>`;
  return `${header("출처 정책")}<main class="suneung-page"><section class="suneung-policy-hero"><span>SOURCE POLICY</span><h2>공식 공개문항 중심 운영 원칙</h2><p>학생과 부모가 모든 문항의 출처와 변형 여부를 즉시 확인할 수 있도록 관리합니다.</p></section><section class="suneung-policy-grid"><article><span>01</span><h3>허용하는 기본 출처</h3><p>한국교육과정평가원 수능·6월·9월 모의평가, 시도교육청 전국연합학력평가, EBS 공식 연계 자료만 기본 학습 목록에 포함합니다.</p></article><article><span>02</span><h3>기본 모드 제외 기준</h3><p>출처가 불명확한 사설 문항, 출처를 검증하지 못한 전재 자료, AI 생성 문항은 공식 기출 기본 모드에서 제외합니다.</p></article><article><span>03</span><h3>문항별 신뢰 정보</h3><p>출처 기관, 시험명, 시행 시기, 문항 번호, 공식성 등급, 원문 여부와 원출처 기준을 함께 표시합니다.</p></article><article><span>04</span><h3>해설과 변형 표기</h3><p>공식 정답과 학습용 자체 해설을 구분하고, 원문 그대로인지 일부 재구성인지 눈에 띄게 표시합니다.</p></article></section><section class="suneung-policy-sources"><h3>공식 확인 경로</h3><a href="https://www.suneung.re.kr/" target="_blank" rel="noopener noreferrer"><b>한국교육과정평가원 수능 홈페이지</b><span>수능 및 모의평가 공식 공개자료 확인</span>${icon("arrow",14)}</a><a href="https://www.ebsi.co.kr/ebs/xip/xipc/previousPaperList.ebs?mainYn=Y" target="_blank" rel="noopener noreferrer"><b>EBSi 기출문제</b><span>수능·모평·학평 기출 및 EBS 자료 확인</span>${icon("arrow",14)}</a></section><p class="suneung-policy-note">운영 원칙: 원출처 확인이 끝나지 않은 문항은 내용 대신 ‘원문 미등록’ 상태로 표시합니다.</p></main>`;
}

function suneungPage(page) {
  if (page === "suneung-review") {
    suneungState.typeFilter = "weak";
    return csatTypeTrainingPage();
  }
  return page === "suneung-wordmaster" ? suneungWordmasterPage() : page === "suneung-passage" ? suneungPassagePage() : page === "suneung-policy" ? suneungPolicyPage() : ["suneung-types","suneung-vocab","suneung-parent"].includes(page) ? suneungSupportPage(page) : suneungHomePage();
}

function enhanceNewsGuidedReader() {
  const reader = document.querySelector(".news-reader");
  if (!reader || state.newsIndex === null) return;
  const article = articleLibrary[state.newsIndex] || articleLibrary[0];
  const total = getArticleBodyParagraphs(article).length;
  const checked = newsArticleLearningState.translations.length;
  const saved = newsArticleLearningState.savedArticles.includes(article.id);
  const progressLabel = reader.querySelector(".news-reader-progress b");
  if (progressLabel) progressLabel.textContent = `${checked} of ${total} sentences checked`;
  const controls = document.createElement("section");
  controls.className = "news-guided-controls";
  controls.innerHTML = `<div><b>Read English first</b><span>뜻은 필요한 문장만 확인해보세요.</span></div><button type="button" data-news-show-all>Show all meanings</button><button type="button" data-news-hide-all>Hide all meanings</button>`;
  reader.querySelector(".news-reader-progress")?.after(controls);
  const utility = document.createElement("nav");
  utility.className = "news-guided-utility";
  utility.innerHTML = `<button class="${saved ? "active" : ""}" type="button" data-news-save-article>${icon(saved ? "check" : "bookmark",15)} ${saved ? "Saved" : "Save"}</button><button type="button" data-news-jump-difficult>${icon("bookmark",15)} Difficult <span>${newsArticleLearningState.difficult.length}</span></button><button type="button" data-news-show-all>Show All</button><button class="primary" type="button" data-news-next-article>Next Article ${icon("arrow",14)}</button>`;
  reader.appendChild(utility);
}

function render() {
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (state.page === "drama") {
    if (!robotsMeta) { robotsMeta = document.createElement("meta"); robotsMeta.name = "robots"; document.head.appendChild(robotsMeta); }
    robotsMeta.content = "noindex, nofollow, noarchive";
  }
  const content=audienceMode==="kids"?kidsPage(state.page):isAcademicMode()?suneungPage(state.page):state.page==="home"?homePage():state.page==="words"?vocabularyPage():state.page==="sentence"?sentencePage():state.page==="calendar"?calendarPage():state.page==="news"?newsPage():state.page==="blog"?blogPage():state.page==="drama"?homePage():state.page==="test"?dailyTestPage():state.page==="quiz"?quizPage():state.page==="ted"?tedStudyPage():state.page==="journal"?journalPage():placeholderPage();
  document.querySelector("#app").innerHTML=`<div class="app-shell">${sidebar()}<div class="content">${content}</div>${reviewChatbotUi()}${selectionAssistantUi()}</div>`;
  enhanceNewsGuidedReader();
  bindEvents();
}

function saveHistory(){profileStorage.setItem("worthy_life_history",JSON.stringify(state.history));}

function navigationUrl(page, newsIndex = null) {
  const entryFiles = {
    home: "index.html",
    words: "vocab.html",
    sentence: "sentence.html",
    news: "news.html",
    drama: "drama.html",
    test: "dailytest.html",
    quiz: "quiz.html",
    ted: "ted.html",
  };
  if (page.startsWith("suneung-")) return `suneung.html#${page}`;
  if (page === "news" && newsIndex !== null) return `news.html#article-${newsIndex}`;
  return entryFiles[page] || `index.html#${page}`;
}

function navigateTo(page, options = {}) {
  if (page === "suneung-review") {
    page = "suneung-types";
    suneungState.typeFilter = "weak";
    saveSuneungState();
  }
  if (page === "suneung-passage" && !options.preserveTypeTraining) suneungState.activeTypeTraining = null;
  const newsIndex = page === "news" ? (options.newsIndex ?? null) : null;
  const tedLessonId = page === "ted" ? (options.tedLessonId ?? state.tedLessonId ?? null) : null;
  const isSameScreen = state.page === page && state.newsIndex === newsIndex && state.tedLessonId === tedLessonId;

  if (page === "ted" && tedLessonId !== state.tedLessonId) {
    state.tedSentenceIndex = 0;
    state.tedMeaningOpen = false;
  }

  state.page = page;
  state.newsIndex = newsIndex;
  state.tedLessonId = tedLessonId;
  state.translatedSentence = null;

  if (page === "suneung-passage") {
    resetCurrentCsatBatchAttempt();
    saveSuneungState();
  }

  if (!isSameScreen) {
    window.history.pushState(
      { worthyLife: true, page, newsIndex, tedLessonId },
      "",
      options.url || navigationUrl(page, newsIndex)
    );
  }

  render();
  window.scrollTo(0, 0);
}

async function copyArticleText(text, successMessage) {
  const status = document.querySelector("#article-copy-status");
  try {
    await navigator.clipboard.writeText(text);
    if (status) status.textContent = successMessage;
  } catch {
    if (status) status.textContent = "복사하지 못했습니다.";
  }
  window.setTimeout(() => { if (status) status.textContent = ""; }, 1800);
}

function parseQuizCSVLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') { current += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { values.push(current); current = ""; }
    else current += character;
  }
  values.push(current);
  return values;
}

function parseQuizCSV(text) {
  const lines = String(text).replace(/^\uFEFF/, "").replace(/\r/g, "").split("\n").filter(line => line.trim());
  if (lines.length < 2) return [];
  const headers = parseQuizCSVLine(lines[0]).map(header => header.trim());
  return lines.slice(1).map(line => {
    const columns = parseQuizCSVLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, (columns[index] || "").trim()]));
    const choices = row.choices ? row.choices.split("|").map(value => value.trim()).filter(Boolean) : [1, 2, 3, 4, 5, 6].map(index => row[`choice${index}`]).filter(Boolean);
    return normalizeQuizQuestion({ ...row, choices, youtube: row.youtube || row.youtube_url || row.video || row.videoId || row.youtubeId });
  }).filter(question => question.question && question.choices.length === 4);
}

function jumpToQuizQuestion(realIndex, retry = false) {
  quizState.search = "";
  quizState.filter = "all";
  if (retry) {
    delete quizState.solvedMap[realIndex];
    quizState.wrongSet = quizState.wrongSet.filter(index => index !== realIndex);
  }
  quizState.current = getFilteredQuizIndexes().indexOf(realIndex);
  quizState.answerVisible = false;
  quizState.selectedChoice = null;
  saveQuizState();
  render();
}

function updateVocabClearCard(card) {
  if (!card) return;
  const wordClear = card.querySelector("[data-known-word]")?.getAttribute("aria-pressed") === "true";
  const sentenceClear = card.querySelector("[data-clear-word-sentence]")?.getAttribute("aria-pressed") === "true";
  const allClear = wordClear && sentenceClear;
  card.classList.toggle("all-clear", allClear);
  const label = card.querySelector("[data-vocab-clear-label]");
  if (label) label.textContent = allClear ? "ALL CLEAR" : wordClear ? "WORD CLEAR" : sentenceClear ? "SENTENCE CLEAR" : "";
  const count = document.querySelectorAll(".vocab-today-item.all-clear").length;
  const countLabel = document.querySelector("[data-vocab-clear-count]");
  if (countLabel) countLabel.textContent = String(count);
  if (count >= 10 && !homeStudyState.checked.words) {
    homeStudyState.checked.words = true;
    saveHomeStudyState("words");
    render();
  }
}

function bindEvents(){
  bindSuneungDictionaryTooltips();
  decorateEnglishSentences();
  document.querySelector(".content")?.addEventListener("mouseup", () => setTimeout(captureLearningSelection, 0));
  document.querySelector(".content")?.addEventListener("click", event => {
    const selected = window.getSelection()?.toString().trim() || "";
    if (selected.length > 3 && /[A-Za-z]/.test(selected)) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  document.querySelector(".content")?.addEventListener("keyup", event => { if (event.shiftKey) captureLearningSelection(); });
  document.querySelector("[data-selection-ai-trigger]")?.addEventListener("mousedown", event => event.preventDefault());
  document.querySelector("[data-selection-ai-trigger]")?.addEventListener("click", () => {
    if (!selectionAssistantState.text) return;
    openSentenceAssistant(selectionAssistantState.text, "selection");
  });
  document.querySelector("[data-selection-ai-close]")?.addEventListener("click", () => { selectionAssistantState.open = false; render(); });
  document.querySelector("[data-selection-ai-chat]")?.addEventListener("click", event => {
    const button = event.target.closest("[data-selection-ai-save]");
    if (!button || selectionAssistantState.saved) return;
    button.disabled = true;
    button.textContent = "저장하는 중…";
    setTimeout(() => {
      const text = selectionAssistantState.text;
      const analysis = detailedSelectionAnalysis(text);
      const item = { id: `selection:${text.toLowerCase()}`, type: text.trim().includes(" ") ? "sentence" : "word", text, meaning: analysis[0]?.body || "AI 문장 분석", example: text, savedAt: new Date().toISOString(), sourceType: "selection", sourceTitle: "AI 문장 분석", sourceUrl: location.href, sourceSnippet: analysis[2]?.body || "" };
      if (!state.savedBlogItems.some(saved => saved.id === item.id)) state.savedBlogItems.push(item);
      profileStorage.setItem("value_time_saved_blog_items_v1", JSON.stringify(state.savedBlogItems));
      selectionAssistantState.saved = true;
      button.classList.add("saved");
      button.innerHTML = `${icon("check",14)} 학습장에 저장됨`;
      const toast = document.querySelector("[data-selection-ai-toast]");
      toast?.classList.add("visible");
      setTimeout(() => toast?.classList.remove("visible"), 2800);
    }, 600);
  });
  if (!selectionAssistantDocumentBound) {
    selectionAssistantDocumentBound = true;
    document.addEventListener("mousedown", event => {
      if (!event.target.closest("[data-selection-ai-trigger],.content")) hideSelectionTrigger();
    });
    window.addEventListener("scroll", hideSelectionTrigger, true);
    window.addEventListener("resize", hideSelectionTrigger);
  }
  const video = document.querySelector("#youtubePlayer");
  if (video) {
    const item = { youtube: videoId };
    video.src = makeYouTubeEmbedUrl(item.youtube);
  }
  document.querySelectorAll("[data-learning-mode]").forEach(button => button.addEventListener("click", event => {
    const selectedMode = event.currentTarget.dataset.learningMode;
    if (selectedMode === learningMode) return;
    applyLearningMode(selectedMode);
    render();
  }));
  document.querySelectorAll("[data-audience-mode]").forEach(button => button.addEventListener("click", event => {
    const selectedMode = event.currentTarget.dataset.audienceMode;
    if (selectedMode === "general" || selectedMode === "suneung") {
      requestLearningUser(selectedMode === "suneung" ? "suneung" : "normal");
      return;
    }
    if (selectedMode === audienceMode) return;
    reviewChatState.open = false;
    reviewChatState.selected = null;
    reviewChatState.answered = null;
    applyAudienceMode(selectedMode);
    if (isAcademicMode()) state.page = "suneung-home";
    else if (state.page.startsWith("suneung-") || (audienceMode === "kids" && !["home","words","sentence","news","ted","drama","test","calendar"].includes(state.page))) state.page = "home";
    render();
  }));
  document.querySelectorAll("[data-user-change]").forEach(button => button.addEventListener("click", () => requestLearningUser()));
  document.querySelectorAll("[data-suneung-mode]").forEach(button => button.addEventListener("click", event => { suneungState.mode = event.currentTarget.dataset.suneungMode; saveSuneungState(); render(); }));
  document.querySelector("[data-suneung-official]")?.addEventListener("change", event => { suneungState.officialOnly = event.currentTarget.checked; saveSuneungState(); render(); });
  document.querySelectorAll("[data-suneung-source-tab]").forEach(button => button.addEventListener("click", event => { suneungState.sourceTab = event.currentTarget.dataset.suneungSourceTab; saveSuneungState(); render(); }));
  document.querySelectorAll("[data-csat-type-filter]").forEach(button => button.addEventListener("click", event => {
    suneungState.typeFilter = event.currentTarget.dataset.csatTypeFilter;
    saveSuneungState();
    render();
  }));
  document.querySelector("[data-csat-type-sort]")?.addEventListener("change", event => {
    suneungState.typeSort = event.currentTarget.value;
    saveSuneungState();
    render();
  });
  document.querySelectorAll("[data-csat-type-detail]").forEach(button => button.addEventListener("click", event => {
    suneungState.selectedTypeId = event.currentTarget.dataset.csatTypeDetail;
    saveSuneungState();
    render();
    requestAnimationFrame(() => document.querySelector(".csat-type-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }));
  document.querySelector("[data-csat-type-close]")?.addEventListener("click", () => {
    suneungState.selectedTypeId = "";
    saveSuneungState();
    render();
  });
  document.querySelectorAll("[data-csat-type-train]").forEach(button => button.addEventListener("click", event => {
    const typeId = event.currentTarget.dataset.csatTypeTrain;
    const size = event.currentTarget.dataset.csatTypeSize || "5";
    openCsatTypeTraining(typeId, size);
  }));
  document.querySelectorAll("[data-csat-passage-tab]").forEach(button => button.addEventListener("click", event => {
    suneungState.passageTab = event.currentTarget.dataset.csatPassageTab;
    saveSuneungState();
    render();
  }));
  document.querySelector("[data-csat-show-all-meanings]")?.addEventListener("click", () => {
    const allOpen = suneungState.passageTranslations.length === suneungPassage.paragraphs.length;
    suneungState.passageTranslations = allOpen ? [] : suneungPassage.paragraphs.map((_, index) => index);
    saveSuneungState();
    render();
  });
  document.querySelectorAll("[data-csat-translation]").forEach(button => button.addEventListener("click", event => {
    const index = Number(event.currentTarget.dataset.csatTranslation);
    suneungState.passageTranslations = suneungState.passageTranslations.includes(index) ? suneungState.passageTranslations.filter(item => item !== index) : [...suneungState.passageTranslations, index];
    saveSuneungState();
    render();
  }));
  document.querySelectorAll("[data-csat-note]").forEach(button => button.addEventListener("click", event => {
    const index = Number(event.currentTarget.dataset.csatNote);
    suneungState.passageNotes = suneungState.passageNotes.includes(index) ? suneungState.passageNotes.filter(item => item !== index) : [...suneungState.passageNotes, index];
    saveSuneungState();
    render();
  }));
  document.querySelectorAll("[data-csat-difficult]").forEach(button => button.addEventListener("click", event => {
    const index = Number(event.currentTarget.dataset.csatDifficult);
    suneungState.difficultSentences = suneungState.difficultSentences.includes(index) ? suneungState.difficultSentences.filter(item => item !== index) : [...suneungState.difficultSentences, index];
    saveSuneungState();
    render();
  }));
  document.querySelectorAll("[data-csat-bookmark]").forEach(button => button.addEventListener("click", event => {
    const index = Number(event.currentTarget.dataset.csatBookmark);
    suneungState.bookmarkedSentences = suneungState.bookmarkedSentences.includes(index) ? suneungState.bookmarkedSentences.filter(item => item !== index) : [...suneungState.bookmarkedSentences, index];
    saveSuneungState();
    render();
  }));
  document.querySelectorAll("[data-csat-expression]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.csatExpression;
    const status = event.currentTarget.dataset.csatExpressionStatus;
    if (suneungState.expressionStatus[id] === status) delete suneungState.expressionStatus[id];
    else suneungState.expressionStatus[id] = status;
    saveSuneungState();
    render();
  }));
  document.querySelectorAll("[data-csat-question-choice]").forEach(button => button.addEventListener("click", event => {
    const question = suneungPassage.questions[suneungState.passageQuestionIndex];
    if (!question || suneungState.passageChecked[question.id]) return;
    suneungState.passageAnswers[question.id] = Number(event.currentTarget.dataset.csatQuestionChoice);
    saveSuneungState();
    render();
  }));
  document.querySelector("[data-csat-question-check]")?.addEventListener("click", () => {
    const question = suneungPassage.questions[suneungState.passageQuestionIndex];
    if (!question || suneungState.passageAnswers[question.id] === undefined) return;
    suneungState.passageChecked[question.id] = true;
    recordCsatTypeTrainingResult(suneungPassage, question, suneungState.passageAnswers[question.id]);
    suneungState.submitted = true;
    if (suneungState.passageAnswers[question.id] !== question.answer && !suneungState.wrongPassageQuestions.includes(question.id)) suneungState.wrongPassageQuestions.push(question.id);
    if (suneungState.passageAnswers[question.id] === question.answer) suneungState.wrongPassageQuestions = suneungState.wrongPassageQuestions.filter(id => id !== question.id);
    saveSuneungState();
    render();
  });
  document.querySelector("[data-csat-question-prev]")?.addEventListener("click", () => {
    suneungState.passageQuestionIndex = Math.max(0, suneungState.passageQuestionIndex - 1);
    saveSuneungState();
    render();
  });
  document.querySelector("[data-csat-question-next]")?.addEventListener("click", () => {
    if (suneungState.passageQuestionIndex >= suneungPassage.questions.length - 1) suneungState.passageTab = "explanation";
    else suneungState.passageQuestionIndex += 1;
    saveSuneungState();
    render();
  });
  document.querySelectorAll("[data-csat-retry-question]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.csatRetryQuestion;
    const index = suneungPassage.questions.findIndex(question => question.id === id);
    if (index < 0) return;
    delete suneungState.passageAnswers[id];
    delete suneungState.passageChecked[id];
    suneungState.passageQuestionIndex = index;
    suneungState.passageTab = "questions";
    saveSuneungState();
    render();
  }));
  document.querySelectorAll("[data-suneung-translation]").forEach(button => button.addEventListener("click", event => { const index = Number(event.currentTarget.dataset.suneungTranslation); suneungState.translations = suneungState.translations.includes(index) ? suneungState.translations.filter(item => item !== index) : [...suneungState.translations, index]; saveSuneungState(); render(); }));
  document.querySelectorAll("[data-suneung-answer]").forEach(button => button.addEventListener("click", event => { suneungState.selected = Number(event.currentTarget.dataset.suneungAnswer); saveSuneungState(); render(); }));
  document.querySelector("[data-suneung-submit]")?.addEventListener("click", () => { if (suneungState.selected === null) return; suneungState.submitted = true; saveSuneungState(); render(); });
  document.querySelector("[data-suneung-review-save]")?.addEventListener("click", () => { suneungState.reviewSaved = true; saveSuneungState(); render(); });
  document.querySelector("[data-suneung-complete]")?.addEventListener("click", () => {
    suneungState.completed = true;
    if (!suneungState.completedPassages.includes(suneungPassage.id)) suneungState.completedPassages.push(suneungPassage.id);
    suneungState.dailyChecks.passage = true;
    saveSuneungState();
    render();
  });
  document.querySelector("[data-csat-next-passage]")?.addEventListener("click", () => {
    const nextIndex = nextAvailablePassageIndex(suneungState.passageIndex, suneungState.masteredPassages);
    if (openSuneungPassage(nextIndex)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      render();
    }
  });
  document.querySelector("[data-csat-skip-passage]")?.addEventListener("click", () => {
    const nextIndex = nextAvailablePassageIndex(suneungState.passageIndex, suneungState.masteredPassages);
    if (openSuneungPassage(nextIndex)) render();
  });
  document.querySelector("[data-csat-master-passage]")?.addEventListener("click", () => {
    if (!suneungState.masteredPassages.includes(suneungPassage.id)) suneungState.masteredPassages.push(suneungPassage.id);
    const nextIndex = nextAvailablePassageIndex(suneungState.passageIndex, suneungState.masteredPassages);
    if (nextIndex >= 0) openSuneungPassage(nextIndex);
    else saveSuneungState();
    render();
  });
  document.querySelector("[data-csat-reset-mastered]")?.addEventListener("click", () => {
    suneungState.masteredPassages = [];
    suneungState.batchDay = 1;
    suneungState.batchPosition = 0;
    openSuneungPassage(0);
    render();
  });
  document.querySelectorAll("[data-csat-batch-analysis]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.csatBatchAnalysis;
    suneungState.batchAnalysisOpen[id] = !suneungState.batchAnalysisOpen[id];
    saveSuneungState();
    render();
  }));
  document.querySelectorAll("[data-csat-batch-choice]").forEach(button => button.addEventListener("click", event => {
    const value = event.currentTarget.dataset.csatBatchChoice;
    const splitAt = value.lastIndexOf(":");
    const key = value.slice(0, splitAt);
    if (suneungState.batchChecked[key]) return;
    suneungState.batchAnswers[key] = Number(value.slice(splitAt + 1));
    saveSuneungState();
    render();
  }));
  document.querySelectorAll("[data-csat-batch-check]").forEach(button => button.addEventListener("click", event => {
    const key = event.currentTarget.dataset.csatBatchCheck;
    if (suneungState.batchAnswers[key] === undefined) return;
    suneungState.batchChecked[key] = true;
    const passage = suneungPassages.find(item => key.startsWith(`${item.id}:`));
    const questionId = passage ? key.slice(passage.id.length + 1) : "";
    const question = passage?.questions.find(item => item.id === questionId);
    if (passage && question) recordCsatTypeTrainingResult(passage, question, suneungState.batchAnswers[key]);
    saveSuneungState();
    render();
  }));
  document.querySelectorAll("[data-csat-batch-next-question]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.csatBatchNextQuestion;
    suneungState.batchQuestionIndexes[id] = (suneungState.batchQuestionIndexes[id] || 0) + 1;
    resetCurrentCsatBatchAttempt();
    saveSuneungState();
    render();
  }));
  document.querySelectorAll("[data-csat-batch-master]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.csatBatchMaster;
    if (!suneungState.masteredPassages.includes(id)) suneungState.masteredPassages.push(id);
    if (!suneungState.completedPassages.includes(id)) suneungState.completedPassages.push(id);
    const masteredIndex = suneungPassages.findIndex(passage => passage.id === id);
    if (masteredIndex === suneungState.passageIndex) {
      const nextIndex = nextAvailablePassageIndex(masteredIndex, suneungState.masteredPassages);
      if (nextIndex >= 0) suneungState.passageIndex = nextIndex;
    }
    suneungState.dailyChecks.passage = true;
    resetCurrentCsatBatchAttempt();
    saveSuneungState();
    render();
  }));
  const moveCsatBatchQuestion = direction => {
    const availableCount = suneungPassages.filter(passage => !suneungState.masteredPassages.includes(passage.id)).length;
    const totalDays = Math.max(1, Math.ceil(availableCount / 5));
    if (direction > 0) {
      const currentDayCount = Math.min(5, Math.max(0, availableCount - ((suneungState.batchDay - 1) * 5)));
      if (suneungState.batchPosition < currentDayCount - 1) suneungState.batchPosition += 1;
      else if (suneungState.batchDay < totalDays) { suneungState.batchDay += 1; suneungState.batchPosition = 0; }
      else { suneungState.batchDay = 1; suneungState.batchPosition = 0; }
    } else if (suneungState.batchPosition > 0) suneungState.batchPosition -= 1;
    else if (suneungState.batchDay > 1) {
      suneungState.batchDay -= 1;
      suneungState.batchPosition = Math.min(4, Math.max(0, availableCount - ((suneungState.batchDay - 1) * 5) - 1));
    }
    resetCurrentCsatBatchAttempt();
    saveSuneungState();
    render();
  };
  document.querySelectorAll("[data-csat-batch-skip]").forEach(button => button.addEventListener("click", event => {
    moveCsatBatchQuestion(1);
  }));
  document.querySelectorAll("[data-csat-batch-move]").forEach(button => button.addEventListener("click", event => {
    moveCsatBatchQuestion(Number(event.currentTarget.dataset.csatBatchMove));
  }));
  document.querySelectorAll("[data-csat-batch-day]").forEach(button => button.addEventListener("click", event => {
    suneungState.batchDay = Number(event.currentTarget.dataset.csatBatchDay) || 1;
    suneungState.batchPosition = 0;
    resetCurrentCsatBatchAttempt();
    saveSuneungState();
    render();
  }));
  document.querySelector("[data-kids-intro-complete]")?.addEventListener("click", () => {
    saveChildName(document.querySelector("[data-kids-name-input]")?.value);
    showKidsIntro = false;
    try { profileStorage.setItem(KIDS_INTRO_STORAGE_KEY, "true"); } catch {}
    render();
  });
  document.querySelector("[data-kids-edit-name]")?.addEventListener("click", () => {
    const nextName = window.prompt("학생 이름을 입력해주세요.", childName);
    if (nextName === null || !String(nextName).trim()) return;
    saveChildName(nextName);
    render();
  });
  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    saveTheme(currentTheme === "dark" ? "light" : "dark");
    const toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      toggle.innerHTML = icon(currentTheme === "dark" ? "sun" : "moon", 18);
      toggle.setAttribute("aria-label", currentTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환");
    }
  });
  document.querySelectorAll("[data-suneung-home-page]").forEach(card => {
    const openStudyPage = () => navigateTo(card.dataset.suneungHomePage);
    card.addEventListener("click", openStudyPage);
    card.addEventListener("keydown", event => {
      if (event.target === card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openStudyPage();
      }
    });
  });
  document.querySelectorAll("[data-suneung-home-toggle]").forEach(button => button.addEventListener("click", event => {
    event.stopPropagation();
    const id = event.currentTarget.dataset.suneungHomeToggle;
    suneungState.dailyChecks[id] = !suneungState.dailyChecks[id];
    saveSuneungState();
    render();
  }));
  document.querySelector("[data-suneung-home-reset]")?.addEventListener("click", () => {
    if (!window.confirm("오늘의 수능 학습 체크를 모두 초기화할까요?")) return;
    suneungState.dailyChecks = {};
    saveSuneungState();
    render();
  });
  document.querySelectorAll("[data-page]").forEach(el=>el.addEventListener("click",()=>navigateTo(el.dataset.page)));
  document.querySelector("[data-review-open]")?.addEventListener("click", () => { reviewChatState.open = true; render(); });
  document.querySelector("[data-review-close]")?.addEventListener("click", () => { reviewChatState.open = false; render(); });
  document.querySelectorAll("[data-review-answer]").forEach(button => button.addEventListener("click", event => {
    const items = getReviewChatbotItems();
    const dueEntries = selectDueReviewItems(items, reviewProgressMap);
    const selected = dueEntries.find(entry => entry.item.id === reviewChatState.selected) || dueEntries[0];
    if (!selected) return;
    const question = createReviewQuestion(selected, items);
    const answer = Number(event.currentTarget.dataset.reviewAnswer);
    const correct = answer === question.answer;
    reviewChatState.selected = selected.item.id;
    reviewChatState.answered = answer;
    reviewProgressMap[selected.item.id] = applyReviewAnswer(selected.progress, correct);
    syncCsatReviewAnswer(selected.item, correct);
    if (!correct && !reviewChatState.wrongNotes.includes(selected.item.id)) reviewChatState.wrongNotes.push(selected.item.id);
    profileStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviewProgressMap));
    render();
  }));
  document.querySelector("[data-review-more]")?.addEventListener("click", () => { reviewChatState.selected = null; reviewChatState.answered = null; render(); });
  document.querySelector("[data-review-done]")?.addEventListener("click", () => { reviewChatState.open = false; reviewChatState.completed = true; reviewChatState.answered = null; render(); });
  document.querySelector("[data-review-wrong]")?.addEventListener("click", () => { navigateTo("journal"); });
  document.querySelector("[data-open-email-roleplay]")?.addEventListener("click", () => { emailRoleplayState.active = true; render(); });
  document.querySelector("[data-close-email-roleplay]")?.addEventListener("click", () => { emailRoleplayState.active = false; render(); });
  document.querySelector("[data-email-reply]")?.addEventListener("input", event => {
    emailRoleplayState.replyText = event.currentTarget.value;
    const recommendations = (getUnifiedSavedLearningItems().length ? getUnifiedSavedLearningItems() : getCustomTestFallbackItems()).slice(0,3);
    const used = detectUsedWords(emailRoleplayState.replyText, recommendations);
    document.querySelectorAll(".recommended-words i").forEach((chip,index) => chip.classList.toggle("completed", used.some(item => item.id === recommendations[index]?.id)));
    const remaining = document.querySelector(".recommended-words>div span");
    if (remaining) remaining.textContent = `${recommendations.length-used.length}개 아직 사용하지 않음`;
    const submit = document.querySelector("[data-submit-email-roleplay]");
    if (submit) submit.disabled = emailRoleplayState.replyText.trim().length < 50;
  });
  document.querySelector("[data-submit-email-roleplay]")?.addEventListener("click", () => {
    const recommendations = (getUnifiedSavedLearningItems().length ? getUnifiedSavedLearningItems() : getCustomTestFallbackItems()).slice(0,3);
    try { emailRoleplayState.evaluation = evaluateEmailReply(emailRoleplayState.replyText, recommendations); emailRoleplayState.submitted = true; emailRoleplayState.error = ""; }
    catch { emailRoleplayState.error = "평가하지 못했습니다. 잠시 후 다시 시도해주세요."; }
    render();
  });
  document.querySelector("[data-next-email]")?.addEventListener("click", () => { emailRoleplayState.replyText = ""; emailRoleplayState.evaluation = null; emailRoleplayState.submitted = false; render(); });
  document.querySelectorAll("[data-save-news-expression]").forEach(button => button.addEventListener("click", event => {
    const article = articleLibrary[state.newsIndex] || articleLibrary[0];
    const expressions = article.sentences.flatMap(sentence => sentence.expressions.map((expression,index) => ({ id: `${article.sentences.indexOf(sentence)}-${index}`, text: expression.term, meaning: expression.meaning, example: sentence.en, type: expression.term.includes(" ") ? "sentence" : "word" })));
    const expression = expressions.find(item => item.id === event.currentTarget.dataset.saveNewsExpression);
    if (!expression) return;
    const item = toNotebookItem(expression, article);
    if (!state.savedBlogItems.some(saved => saved.id === item.id)) state.savedBlogItems.push(item);
    profileStorage.setItem("value_time_saved_blog_items_v1", JSON.stringify(state.savedBlogItems));
    newsSaveToast = "Saved to your notebook";
    render();
  }));
  document.querySelector("[data-open-journal-test]")?.addEventListener("click", () => {
    journalTestState = { ...journalTestState, view: "setup", test: null, answers: {}, submitted: false, wrongOnly: false, wrongQuestionIds: [] };
    render();
  });
  document.querySelectorAll("[data-close-journal-test]").forEach(button => button.addEventListener("click", event => {
    if (event.currentTarget !== event.target && event.currentTarget.classList.contains("learning-modal-backdrop")) return;
    journalTestState.view = "closed";
    render();
  }));
  document.querySelectorAll("[data-modal-stop]").forEach(modal => modal.addEventListener("click", event => event.stopPropagation()));
  document.querySelector("[data-generate-journal-test]")?.addEventListener("click", () => {
    journalTestState.scope = document.querySelector('input[name="custom-scope"]:checked')?.value || "all";
    journalTestState.count = Number(document.querySelector('input[name="custom-count"]:checked')?.value || 5);
    journalTestState.difficulty = document.querySelector('input[name="custom-difficulty"]:checked')?.value || "normal";
    journalTestState.test = generateCustomTestFromSavedItems(getUnifiedSavedLearningItems(), journalTestState, getCustomTestFallbackItems());
    journalTestState.view = "test";
    journalTestState.answers = {};
    journalTestState.submitted = false;
    journalTestState.wrongOnly = false;
    render();
  });
  document.querySelectorAll("[data-custom-answer]").forEach(button => button.addEventListener("click", event => {
    const value = event.currentTarget.dataset.customAnswer;
    const splitAt = value.lastIndexOf(":");
    journalTestState.answers[value.slice(0, splitAt)] = Number(value.slice(splitAt + 1));
    render();
  }));
  document.querySelector("[data-submit-journal-test]")?.addEventListener("click", () => {
    journalTestState.submitted = true;
    render();
  });
  document.querySelector("[data-retry-journal-test]")?.addEventListener("click", () => {
    journalTestState.answers = {};
    journalTestState.submitted = false;
    journalTestState.wrongOnly = false;
    journalTestState.wrongQuestionIds = [];
    render();
  });
  document.querySelector("[data-wrong-journal-test]")?.addEventListener("click", () => {
    journalTestState.wrongQuestionIds = journalTestState.test.generatedQuestions.filter(question => journalTestState.answers[question.id] !== question.answer).map(question => question.id);
    journalTestState.answers = {};
    journalTestState.submitted = false;
    journalTestState.wrongOnly = true;
    render();
  });
  document.querySelectorAll("[data-open-blog-reader]").forEach(button => button.addEventListener("click", event => {
    activeBlogPostId = event.currentTarget.dataset.openBlogReader;
    blogSaveToast = "";
    render();
  }));
  document.querySelectorAll("[data-close-blog-reader]").forEach(button => button.addEventListener("click", event => {
    if (event.currentTarget !== event.target && event.currentTarget.classList.contains("learning-modal-backdrop")) return;
    activeBlogPostId = null;
    blogSaveToast = "";
    render();
  }));
  document.querySelectorAll("[data-save-blog-item]").forEach(button => button.addEventListener("click", event => {
    const [postId, itemId] = event.currentTarget.dataset.saveBlogItem.split(":");
    const post = favoriteBlogArticles.find(item => item.id === postId);
    const expression = post?.expressions.find(item => item.id === itemId);
    if (!post || !expression) return;
    const id = `blog:${post.id}:${expression.id}`;
    if (!state.savedBlogItems.some(item => item.id === id)) {
      state.savedBlogItems.push({ id, type: expression.type, text: expression.text, meaning: expression.meaning, example: expression.example, savedAt: new Date().toISOString(), sourceType: "blog", sourceTitle: post.sourceTitle, sourceUrl: post.sourceUrl, sourceSnippet: post.summary[0] });
      profileStorage.setItem("value_time_saved_blog_items_v1", JSON.stringify(state.savedBlogItems));
    }
    blogSaveToast = "나만의 학습장에 저장했어요";
    render();
  }));
  document.querySelector("[data-open-ted]")?.addEventListener("click", event => {
    navigateTo("ted", { tedLessonId: event.currentTarget.dataset.openTed });
  });
  document.querySelector("[data-ted-back]")?.addEventListener("click", () => navigateTo("home"));
  document.querySelector("[data-ted-meaning-toggle]")?.addEventListener("click", event => {
    state.tedMeaningOpen = !state.tedMeaningOpen;
    const button = event.currentTarget;
    const panel = document.querySelector("[data-ted-meaning-panel]");
    button.classList.toggle("active", state.tedMeaningOpen);
    button.setAttribute("aria-expanded", String(state.tedMeaningOpen));
    button.innerHTML = `${state.tedMeaningOpen ? "뜻 숨기기" : "뜻 보기"} ${icon("chevron", 13)}`;
    if (panel) panel.hidden = !state.tedMeaningOpen;
  });
  document.querySelector("[data-ted-sentence-prev]")?.addEventListener("click", () => {
    if (state.tedSentenceIndex <= 0) return;
    state.tedSentenceIndex -= 1;
    const lesson = getEligibleTedLessons().find(item => item.id === state.tedLessonId) || getDailyTedLesson();
    updateTedSentenceStepView(lesson);
  });
  document.querySelector("[data-ted-sentence-next]")?.addEventListener("click", () => {
    const lesson = getEligibleTedLessons().find(item => item.id === state.tedLessonId) || getDailyTedLesson();
    const dailySentences = lesson ? getDailyTedStudySentences(lesson) : [];
    const currentSentence = dailySentences[state.tedSentenceIndex];
    const mastered = lesson ? getTedMasteredSourceIndexes(lesson.id) : [];
    if (!lesson || !currentSentence || !mastered.includes(currentSentence.sourceIndex) || state.tedSentenceIndex >= dailySentences.length - 1) return;
    state.tedSentenceIndex += 1;
    updateTedSentenceStepView(lesson);
  });
  document.querySelector("[data-ted-sentence-clear]")?.addEventListener("click", () => {
    const lesson = getEligibleTedLessons().find(item => item.id === state.tedLessonId) || getDailyTedLesson();
    if (!lesson) return;
    const dailySentences = getDailyTedStudySentences(lesson);
    const currentSentence = dailySentences[state.tedSentenceIndex];
    if (!currentSentence) return;
    const mastered = getTedMasteredSourceIndexes(lesson.id);
    if (!mastered.includes(currentSentence.sourceIndex)) {
      saveTedMasteredSourceIndexes(lesson.id, [...mastered, currentSentence.sourceIndex]);
    }
    const updatedMastered = getTedMasteredSourceIndexes(lesson.id);
    if (dailySentences.every(item => updatedMastered.includes(item.sourceIndex))) {
      homeStudyState.checked.ted = true;
      saveHomeStudyState("ted");
    }
    updateTedSentenceStepView(lesson);
  });
  document.querySelectorAll("[data-ted-transcript-clear]").forEach(button => button.addEventListener("click", event => {
    const lesson = getEligibleTedLessons().find(item => item.id === state.tedLessonId) || getDailyTedLesson();
    if (!lesson) return;
    const sourceIndex = Number(event.currentTarget.dataset.tedTranscriptClear);
    const mastered = getTedMasteredSourceIndexes(lesson.id);
    const isClear = mastered.includes(sourceIndex);
    const updatedMastered = isClear
      ? mastered.filter(index => index !== sourceIndex)
      : [...mastered, sourceIndex];
    saveTedMasteredSourceIndexes(lesson.id, updatedMastered);

    const card = event.currentTarget.closest("[data-ted-transcript-card]");
    card?.classList.toggle("clear", !isClear);
    event.currentTarget.classList.toggle("active", !isClear);
    event.currentTarget.setAttribute("aria-pressed", String(!isClear));
    event.currentTarget.innerHTML = `${icon("check", 12)} ${!isClear ? "Clear 완료" : "Clear"}`;

    const dailySentences = getDailyTedStudySentences(lesson);
    if (dailySentences.every(item => updatedMastered.includes(item.sourceIndex))) {
      homeStudyState.checked.ted = true;
      saveHomeStudyState("ted");
    }
    updateTedSentenceStepView(lesson);
  }));
  document.querySelectorAll("[data-home-study-page]").forEach(card => {
    const openStudyPage = () => navigateTo(card.dataset.homeStudyPage, { url: card.dataset.homeStudyLink });
    card.addEventListener("click", openStudyPage);
    card.addEventListener("keydown", event => {
      if (event.target === card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openStudyPage();
      }
    });
  });
  document.querySelectorAll("[data-home-study-toggle]").forEach(button => button.addEventListener("click", event => {
    // 카드 이동 이벤트와 완료 체크 이벤트가 동시에 실행되지 않게 분리합니다.
    event.stopPropagation();
    const id = button.dataset.homeStudyToggle;
    homeStudyState.checked[id] = !homeStudyState.checked[id];
    saveHomeStudyState(id);
    render();
  }));
  document.querySelector("[data-home-study-reset]")?.addEventListener("click", () => {
    if (!window.confirm("오늘의 학습 체크를 모두 초기화할까요?")) return;
    homeStudyState = { date: localDateKey(), checked: {} };
    saveHomeStudyState();
    render();
  });
  document.querySelectorAll("[data-check]").forEach(el=>el.addEventListener("click",()=>{const {check,date}=el.dataset;const arr=state.history[date]||[];state.history[date]=arr.includes(check)?arr.filter(x=>x!==check):[...arr,check];saveHistory();render();}));
  document.querySelectorAll("[data-date]").forEach(el=>el.addEventListener("click",()=>{state.selectedDate=el.dataset.date;render();}));
  document.querySelectorAll("[data-month]").forEach(el=>el.addEventListener("click",()=>{state.calendarMonth+=Number(el.dataset.month);if(state.calendarMonth<0){state.calendarMonth=11;state.calendarYear--}if(state.calendarMonth>11){state.calendarMonth=0;state.calendarYear++}render();}));
  document.querySelectorAll("[data-open-news]").forEach(el=>el.addEventListener("click",()=>navigateTo("news", { newsIndex: Number(el.dataset.openNews) })));
  document.querySelector("[data-news-import]")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("valuetime:request-article-import")));
  document.querySelector("[data-news-search]")?.addEventListener("input", event => {
    state.newsSearch = event.currentTarget.value;
    const search = state.newsSearch.trim().toLowerCase();
    let visibleCards = 0;
    document.querySelectorAll(".news-library-card").forEach(card => {
      card.hidden = Boolean(search) && !card.textContent.toLowerCase().includes(search);
      if (!card.hidden) visibleCards += 1;
    });
    const emptyState = document.querySelector("[data-news-live-empty]");
    if (emptyState) emptyState.hidden = visibleCards > 0;
  });
  document.querySelector("[data-news-category]")?.addEventListener("change", event => { state.newsCategory = event.currentTarget.value; render(); });
  document.querySelector("[data-news-sort]")?.addEventListener("change", event => { state.newsSort = event.currentTarget.value; render(); });
  document.querySelector("[data-back-news]")?.addEventListener("click",()=>navigateTo("news"));
  document.querySelectorAll("[data-sentence]").forEach(el=>el.addEventListener("click",()=>{state.translatedSentence=Number(el.dataset.sentence);render();}));
  document.querySelectorAll("[data-news-translation]").forEach(button => button.addEventListener("click", event => {
    const index = Number(event.currentTarget.dataset.newsTranslation);
    newsArticleLearningState.translations = newsArticleLearningState.translations.includes(index) ? newsArticleLearningState.translations.filter(item => item !== index) : [...newsArticleLearningState.translations, index];
    saveNewsArticleLearningState();
    render();
  }));
  document.querySelectorAll("[data-news-show-all]").forEach(button => button.addEventListener("click", () => {
    const article = articleLibrary[state.newsIndex] || articleLibrary[0];
    newsArticleLearningState.translations = article.sentences.map((_, index) => index);
    saveNewsArticleLearningState();
    render();
  }));
  document.querySelectorAll("[data-news-hide-all]").forEach(button => button.addEventListener("click", () => {
    newsArticleLearningState.translations = [];
    saveNewsArticleLearningState();
    render();
  }));
  document.querySelectorAll("[data-news-difficult]").forEach(button => button.addEventListener("click", event => {
    const index = Number(event.currentTarget.dataset.newsDifficult);
    newsArticleLearningState.difficult = newsArticleLearningState.difficult.includes(index) ? newsArticleLearningState.difficult.filter(item => item !== index) : [...newsArticleLearningState.difficult, index];
    saveNewsArticleLearningState();
    const article = articleLibrary[state.newsIndex] || articleLibrary[0];
    if (article.contentStatus === "personal_import") updateArticleLearning(article.id, { bookmarks: newsArticleLearningState.difficult, notes: newsArticleLearningState.notes || {} });
    render();
  }));
  document.querySelectorAll("[data-news-note]").forEach(textarea => textarea.addEventListener("change", event => {
    const article = articleLibrary[state.newsIndex] || articleLibrary[0];
    if (article.contentStatus !== "personal_import") return;
    const index = Number(event.currentTarget.dataset.newsNote);
    newsArticleLearningState.notes ||= {};
    newsArticleLearningState.notes[index] = event.currentTarget.value.trim();
    saveNewsArticleLearningState();
    updateArticleLearning(article.id, { notes: newsArticleLearningState.notes, bookmarks: newsArticleLearningState.difficult || [] });
  }));
  document.querySelector("[data-news-save-article]")?.addEventListener("click", () => {
    const article = articleLibrary[state.newsIndex] || articleLibrary[0];
    newsArticleLearningState.savedArticles = newsArticleLearningState.savedArticles.includes(article.id) ? newsArticleLearningState.savedArticles.filter(item => item !== article.id) : [...newsArticleLearningState.savedArticles, article.id];
    saveNewsArticleLearningState();
    render();
  });
  document.querySelector("[data-news-jump-difficult]")?.addEventListener("click", () => {
    const index = newsArticleLearningState.difficult[0];
    if (Number.isInteger(index)) document.querySelector(`[data-news-reader-paragraph="${index}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  document.querySelector("[data-news-next-article]")?.addEventListener("click", () => {
    const nextIndex = ((state.newsIndex ?? 0) + 1) % articleLibrary.length;
    navigateTo("news", nextIndex);
  });
  document.querySelectorAll("[data-news-expressions]").forEach(button => button.addEventListener("click", event => {
    const index = Number(event.currentTarget.dataset.newsExpressions);
    newsArticleLearningState.expressions = newsArticleLearningState.expressions.includes(index) ? newsArticleLearningState.expressions.filter(item => item !== index) : [...newsArticleLearningState.expressions, index];
    saveNewsArticleLearningState();
    render();
  }));
  document.querySelectorAll("[data-news-quiz-answer]").forEach(button => button.addEventListener("click", event => {
    const value = event.currentTarget.dataset.newsQuizAnswer;
    const separator = value.lastIndexOf(":");
    newsArticleLearningState.quizAnswers[value.slice(0, separator)] = Number(value.slice(separator + 1));
    saveNewsArticleLearningState();
    render();
  }));
  document.querySelector("[data-news-quiz-submit]")?.addEventListener("click", () => {
    const article = articleLibrary[state.newsIndex] || articleLibrary[0];
    const questions = buildArticleReviewQuestions(article);
    if (!questions.every(question => Number.isInteger(newsArticleLearningState.quizAnswers[question.id]))) { window.alert("4문항에 모두 답해주세요."); return; }
    newsArticleLearningState.quizSubmitted = true;
    saveNewsArticleLearningState();
    completeNewsArticleIfEligible(article);
    render();
  });
  document.querySelector("[data-news-quiz-retry]")?.addEventListener("click", () => {
    newsArticleLearningState.quizAnswers = {};
    newsArticleLearningState.quizSubmitted = false;
    saveNewsArticleLearningState();
    render();
  });
  if (document.querySelector("[data-news-reader-paragraph]") && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      const newlyRead = entries.filter(entry => entry.isIntersecting).map(entry => Number(entry.target.dataset.newsReaderParagraph)).filter(index => !newsArticleLearningState.readParagraphs.includes(index));
      if (!newlyRead.length) return;
      observer.disconnect();
      newsArticleLearningState.readParagraphs = [...new Set([...newsArticleLearningState.readParagraphs, ...newlyRead])];
      saveNewsArticleLearningState();
      const activeArticle = articleLibrary[state.newsIndex] || articleLibrary[0];
      if (activeArticle.contentStatus === "personal_import") updateArticleLearning(activeArticle.id, { lastReadIndex: Math.max(...newsArticleLearningState.readParagraphs), notes: newsArticleLearningState.notes || {}, bookmarks: newsArticleLearningState.difficult || [] });
      completeNewsArticleIfEligible(activeArticle);
      render();
    }, { threshold: .6 });
    document.querySelectorAll("[data-news-reader-paragraph]").forEach(paragraph => observer.observe(paragraph));
  }
  document.querySelector("[data-copy-article-title]")?.addEventListener("click",()=>{
    const article = articleLibrary[state.newsIndex] || articleLibrary[0];
    copyArticleText(article.title,"제목이 복사되었습니다.");
  });
  document.querySelectorAll("[data-save]").forEach(el=>el.addEventListener("click",e=>{const w=e.currentTarget.dataset.save;state.savedWords=state.savedWords.includes(w)?state.savedWords.filter(x=>x!==w):[...state.savedWords,w];profileStorage.setItem("worthy_life_words",JSON.stringify(state.savedWords));render();}));
  document.querySelectorAll("[data-known-word]").forEach(button => button.addEventListener("click", event => {
    const word = event.currentTarget.dataset.knownWord;
    const known = state.knownWords.includes(word);
    state.knownWords = known ? state.knownWords.filter(item => item !== word) : [...state.knownWords, word];
    profileStorage.setItem("value_time_known_words_v1", JSON.stringify(state.knownWords));

    const card = event.currentTarget.closest(".vocab-today-item");
    card?.classList.toggle("known", !known);
    event.currentTarget.classList.toggle("active", !known);
    event.currentTarget.setAttribute("aria-pressed", String(!known));
    event.currentTarget.setAttribute("aria-label", `${word} Word Clear ${!known ? "해제" : "완료"}`);
    updateVocabClearCard(card);
  }));
  document.querySelectorAll("[data-clear-word-sentence]").forEach(button => button.addEventListener("click", event => {
    const word = event.currentTarget.dataset.clearWordSentence;
    const cleared = state.clearedWordSentences.includes(word);
    state.clearedWordSentences = cleared
      ? state.clearedWordSentences.filter(item => item !== word)
      : [...state.clearedWordSentences, word];
    profileStorage.setItem("value_time_cleared_word_sentences_v1", JSON.stringify(state.clearedWordSentences));

    const card = event.currentTarget.closest(".vocab-today-item");
    card?.classList.toggle("sentence-cleared", !cleared);
    event.currentTarget.classList.toggle("active", !cleared);
    event.currentTarget.setAttribute("aria-pressed", String(!cleared));
    event.currentTarget.setAttribute("aria-label", `${word} 예문 Sentence Clear ${!cleared ? "해제" : "완료"}`);
    updateVocabClearCard(card);
  }));
  document.querySelectorAll("[data-speak]").forEach(el=>el.addEventListener("click",e=>{
    document.querySelectorAll(".speaking-active").forEach(item => item.classList.remove("speaking-active"));
    e.currentTarget.closest(".ted-transcript-line,.ted-focus-sentence,.ted-expression-panel article")?.classList.add("speaking-active");
    speakText(e.currentTarget.dataset.speak);
  }));
  document.querySelectorAll("[data-speaking-replay]").forEach(button => button.addEventListener("click", event => {
    speakText(event.currentTarget.dataset.speakingReplay);
  }));
  document.querySelectorAll("[data-speaking-repeat]").forEach(button => button.addEventListener("click", event => {
    speakText(event.currentTarget.dataset.speakingRepeat, 3);
  }));
  document.querySelectorAll("[data-speaking-speed]").forEach(button => button.addEventListener("click", event => {
    saveSpeakingSpeed(Number(event.currentTarget.dataset.speakingSpeed));
    document.querySelectorAll("[data-speaking-speed]").forEach(item => item.classList.toggle("active", Number(item.dataset.speakingSpeed) === speakingSpeed));
  }));
  document.querySelectorAll("[data-ted-expression-clear]").forEach(button => button.addEventListener("click", event => {
    const key = event.currentTarget.dataset.tedExpressionClear;
    const isDone = speakingExpressionDone.includes(key);
    speakingExpressionDone = isDone ? speakingExpressionDone.filter(item => item !== key) : [...speakingExpressionDone, key];
    try { profileStorage.setItem(SPEAKING_EXPRESSION_STORAGE_KEY, JSON.stringify(speakingExpressionDone)); } catch {}
    event.currentTarget.classList.toggle("active", !isDone);
    event.currentTarget.setAttribute("aria-pressed", String(!isDone));
    event.currentTarget.innerHTML = `${icon("check",12)} ${!isDone ? "Clear 완료" : "Clear"}`;
    event.currentTarget.closest(".ted-expression-panel article")?.classList.toggle("expression-clear-done", !isDone);
  }));
  document.querySelectorAll("[data-kids-parent]").forEach(button => button.addEventListener("click", event => {
    kidsProgress.parent[event.currentTarget.dataset.kidsParent] = true;
    saveKidsProgress();
    render();
  }));
  document.querySelectorAll("[data-kids-flip]").forEach(button => button.addEventListener("click", event => {
    const word = event.currentTarget.dataset.kidsFlip;
    if (!kidsFlippedWords.includes(word)) kidsFlippedWords.push(word);
    render();
  }));
  document.querySelectorAll("[data-kids-word-done]").forEach(button => button.addEventListener("click", event => {
    const word = event.currentTarget.dataset.kidsWordDone;
    const wordDateKey = getKidsWordDateKey();
    const progress = getKidsWordProgress(wordDateKey);
    if (!progress.words.includes(word)) progress.words.push(word);
    saveKidsWordProgress(wordDateKey, progress);
    render();
  }));
  document.querySelectorAll("[data-kids-word-answer]").forEach(button => button.addEventListener("click", event => {
    const correct = event.currentTarget.dataset.kidsWordAnswer === "true";
    const feedback = document.querySelector("[data-kids-feedback]");
    if (!correct) { if (feedback) feedback.textContent = "괜찮아. 한 번 더 골라보자."; return; }
    const wordDateKey = getKidsWordDateKey();
    const progress = getKidsWordProgress(wordDateKey);
    progress.quizStep = (progress.quizStep || 0) + 1;
    if (progress.quizStep >= 2) progress.completed = true;
    saveKidsWordProgress(wordDateKey, progress);
    render();
  }));
  document.querySelector("[data-kids-next-words]")?.addEventListener("click", () => {
    kidsWordDayOffset = Math.min(getKidsWordPageCount() - 1, kidsWordDayOffset + 1);
    kidsFlippedWords = [];
    saveKidsWordDayOffset();
    getKidsWordProgress(getKidsWordDateKey());
    saveKidsProgress();
    render();
  });
  document.querySelectorAll("[data-kids-word-target]").forEach(button => button.addEventListener("click", event => {
    kidsWordDayOffset = Math.min(Math.max(Number(event.currentTarget.dataset.kidsWordTarget) || 0, 0), getKidsWordPageCount() - 1);
    kidsFlippedWords = [];
    saveKidsWordDayOffset();
    getKidsWordProgress(getKidsWordDateKey());
    saveKidsProgress();
    render();
  }));
  document.querySelectorAll("[data-kids-sentence-target]").forEach(button => button.addEventListener("click", event => {
    kidsSentencePageIndex = Math.min(Math.max(Number(event.currentTarget.dataset.kidsSentenceTarget) || 0, 0), getKidsSentencePageCount() - 1);
    saveKidsSentencePageIndex();
    const progress = getKidsSentenceProgress(getKidsSentencePageKey());
    kidsProgress.completed.sentence = Boolean(progress.completed);
    saveKidsProgress();
    render();
  }));
  document.querySelector("[data-kids-sentence-listen]")?.addEventListener("click", () => {
    const sentence = getKidsSentence(kidsSentencePageIndex);
    speakText(sentence.en);
    const progress = getKidsSentenceProgress(getKidsSentencePageKey());
    progress.listened = true;
    saveKidsSentenceProgress(getKidsSentencePageKey(), progress);
    render();
  });
  document.querySelector("[data-kids-sentence-meaning]")?.addEventListener("click", () => {
    const progress = getKidsSentenceProgress(getKidsSentencePageKey());
    progress.meaningShown = !progress.meaningShown;
    saveKidsSentenceProgress(getKidsSentencePageKey(), progress);
    render();
  });
  document.querySelector("[data-kids-sentence-repeat]")?.addEventListener("click", () => {
    const progress = getKidsSentenceProgress(getKidsSentencePageKey());
    progress.repeated = true;
    saveKidsSentenceProgress(getKidsSentencePageKey(), progress);
    render();
  });
  document.querySelectorAll("[data-kids-reset]").forEach(button => button.addEventListener("click", event => {
    resetKidsSession(event.currentTarget.dataset.kidsReset);
    render();
  }));
  document.querySelectorAll("[data-kids-complete]").forEach(button => button.addEventListener("click", event => {
    setKidsComplete(event.currentTarget.dataset.kidsComplete);
    render();
  }));
  document.querySelectorAll("[data-kids-undo]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.kidsUndo;
    if (!confirm("완료를 취소할까요? 오늘 진행률에서 별이 하나 빠져요.")) return;
    setKidsComplete(id, false);
    if (id === "test") kidsTestAnswers = {};
    render();
  }));
  document.querySelectorAll("[data-kids-reading-answer]").forEach(button => button.addEventListener("click", event => {
    const correct = event.currentTarget.dataset.kidsReadingAnswer === "true";
    const session = getKidsDailySession("reading", { selectedAnswer: null, correct: false });
    session.selectedAnswer = correct;
    session.correct = correct;
    if (correct) { setKidsComplete("reading"); render(); return; }
    saveKidsProgress();
    const feedback = document.querySelector("[data-kids-feedback]");
    if (feedback) feedback.textContent = "괜찮아! 글에서 다시 찾아보자.";
  }));
  document.querySelectorAll("[data-kids-story-reaction]").forEach(button => button.addEventListener("click", event => {
    const session = getKidsDailySession("story", { reaction: null });
    session.reaction = event.currentTarget.dataset.kidsStoryReaction;
    setKidsComplete("story");
    render();
  }));
  document.querySelector("[data-kids-song-listen]")?.addEventListener("click", event => {
    const line = event.currentTarget.dataset.kidsSongListen;
    speakText(line);
    const session = getKidsDailySession("song", { listened: false, repeated: false, replayCount: 0 });
    session.listened = true;
    session.replayCount = (session.replayCount || 0) + 1;
    saveKidsProgress();
    render();
  });
  document.querySelector("[data-kids-song-repeat]")?.addEventListener("click", () => {
    const session = getKidsDailySession("song", { listened: false, repeated: false, replayCount: 0 });
    session.repeated = true;
    saveKidsProgress();
    render();
  });
  document.querySelectorAll("[data-kids-test-answer]").forEach(button => button.addEventListener("click", event => {
    const [indexText, correctText] = event.currentTarget.dataset.kidsTestAnswer.split(":");
    const index = Number(indexText);
    if (correctText !== "true") { event.currentTarget.classList.add("wrong"); return; }
    kidsTestAnswers[index] = true;
    const session = getKidsDailySession("test", { answers: {}, correctCount: 0 });
    session.answers = { ...(session.answers || {}), [index]: true };
    session.correctCount = Object.values(session.answers).filter(Boolean).length;
    if ([0,1,2].every(questionIndex => kidsTestAnswers[questionIndex])) setKidsComplete("test");
    else saveKidsProgress();
    render();
  }));
  document.querySelectorAll("[data-vocab-target]").forEach(el=>el.addEventListener("click", e => {
    const scrollPosition = window.scrollY;
    state.vocabPage = Number(e.currentTarget.dataset.vocabTarget);
    profileStorage.setItem("value_time_vocab_page", String(state.vocabPage));
    profileStorage.setItem("value_time_vocab_page_date", localDateKey());
    render();
    window.scrollTo(0, scrollPosition);
  }));
  document.querySelectorAll("[data-vocab-meaning-toggle]").forEach(button => button.addEventListener("click", event => {
    const target = event.currentTarget;
    const revealed = target.classList.toggle("revealed");
    target.setAttribute("aria-expanded", String(revealed));
    const label = target.querySelector("span");
    if (label) label.textContent = revealed ? "뜻 숨기기" : "뜻 보기";
  }));
  document.querySelectorAll(".vocab-card-actions > em").forEach(badge => {
    badge.textContent = typeLabel(badge.textContent.trim());
  });
  document.querySelectorAll(".vocab-today-top h4, .word-card .word-title h2").forEach(wordTitle => {
    const word = wordTitle.textContent.trim();
    if (!word) return;
    wordTitle.classList.add("vocab-dictionary-link");
    wordTitle.setAttribute("role", "link");
    wordTitle.setAttribute("tabindex", "0");
    wordTitle.setAttribute("title", `네이버 영어사전에서 ${word} 검색`);
    wordTitle.setAttribute("aria-label", `네이버 영어사전에서 ${word} 검색`);
    const openDictionary = () => {
      const dictionaryUrl = `https://en.dict.naver.com/#/search?query=${encodeURIComponent(word)}`;
      const dictionaryWindow = window.open(dictionaryUrl, "_blank", "noopener,noreferrer");
      if (dictionaryWindow) dictionaryWindow.opener = null;
    };
    wordTitle.addEventListener("click", openDictionary);
    wordTitle.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openDictionary();
    });
  });
  document.querySelectorAll(".vocab-today-item blockquote > span, .word-card .example > span").forEach(translation => {
    const translatedText = translation.textContent.trim();
    translation.classList.add("vocab-example-translation");
    translation.setAttribute("role", "button");
    translation.setAttribute("tabindex", "0");
    translation.setAttribute("aria-expanded", "false");
    translation.setAttribute("aria-label", "예문 해석 보기");
    translation.textContent = "해석 보기";
    const toggleTranslation = () => {
      const revealed = translation.classList.toggle("revealed");
      translation.textContent = revealed ? translatedText : "해석 보기";
      translation.setAttribute("aria-expanded", String(revealed));
      translation.setAttribute("aria-label", revealed ? "예문 해석 숨기기" : "예문 해석 보기");
    };
    translation.addEventListener("click", toggleTranslation);
    translation.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleTranslation();
    });
  });
  document.querySelector("[data-vocab-undo]")?.addEventListener("click", () => {
    homeStudyState.checked.words = false;
    saveHomeStudyState("words");
    render();
  });
  document.querySelectorAll("[data-save-sentence]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.saveSentence;
    state.savedSentences = state.savedSentences.includes(id)
      ? state.savedSentences.filter(item => item !== id)
      : [...state.savedSentences, id];
    profileStorage.setItem("value_time_saved_sentences_v1", JSON.stringify(state.savedSentences));
    render();
  }));
  document.querySelectorAll("[data-understand-sentence]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.understandSentence;
    state.understoodSentences = state.understoodSentences.includes(id)
      ? state.understoodSentences.filter(item => item !== id)
      : [...state.understoodSentences, id];
    profileStorage.setItem("value_time_understood_sentences_v1", JSON.stringify(state.understoodSentences));
    completeSentenceStudyIfAllMeaningClear();
    render();
  }));
  document.querySelectorAll("[data-sentence-target]").forEach(button => button.addEventListener("click", event => {
    const scrollPosition = window.scrollY;
    state.sentencePage = Number(event.currentTarget.dataset.sentenceTarget);
    profileStorage.setItem("value_time_sentence_page", String(state.sentencePage));
    profileStorage.setItem("value_time_sentence_page_date", localDateKey());
    render();
    window.scrollTo(0, scrollPosition);
  }));
  document.querySelector("[data-sentence-undo]")?.addEventListener("click", () => {
    homeStudyState.checked.sentence = false;
    saveHomeStudyState("sentence");
    render();
  });
  document.querySelector("[data-news-complete]")?.addEventListener("click", () => {
    homeStudyState.checked.news = true;
    saveHomeStudyState("news");
    render();
  });
  document.querySelector("[data-news-undo]")?.addEventListener("click", () => {
    homeStudyState.checked.news = false;
    saveHomeStudyState("news");
    render();
  });
  document.querySelectorAll("[data-drama-translation]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.dramaTranslation;
    dramaShortState.translations[id] = !dramaShortState.translations[id];
    render();
  }));
  document.querySelector("[data-family-login]")?.addEventListener("submit", event=>{event.preventDefault();const password=new FormData(event.currentTarget).get("password");if(password!=="family"){familyShortState.error="비밀번호를 다시 확인해주세요.";render();return;}familyShortState.unlocked=true;familyShortState.error="";sessionStorage.setItem("family_shorts_unlocked","yes");render();});
  document.querySelectorAll("[data-family-view]").forEach(button=>button.addEventListener("click",event=>{familyShortState.view=event.currentTarget.dataset.familyView;familyShortState.activeId=null;render();}));
  document.querySelectorAll("[data-family-open]").forEach(button=>button.addEventListener("click",event=>{familyShortState.activeId=event.currentTarget.dataset.familyOpen;render();window.scrollTo({top:0,behavior:"smooth"});}));
  document.querySelector("[data-family-back]")?.addEventListener("click",()=>{familyShortState.activeId=null;familyShortState.view="home";render();});
  document.querySelectorAll("[data-family-save]").forEach(button=>button.addEventListener("click",event=>{const id=event.currentTarget.dataset.familySave;familyShortState.saved=familyShortState.saved.includes(id)?familyShortState.saved.filter(item=>item!==id):[...familyShortState.saved,id];saveFamilyShorts();render();}));
  document.querySelectorAll("[data-family-tag]").forEach(button=>button.addEventListener("click",event=>{familyShortState.tag=event.currentTarget.dataset.familyTag;render();}));
  document.querySelector("[data-family-lock]")?.addEventListener("click",()=>{familyShortState.unlocked=false;familyShortState.activeId=null;sessionStorage.removeItem("family_shorts_unlocked");render();});
  document.querySelector("[data-family-add]")?.addEventListener("submit",event=>{event.preventDefault();const form=new FormData(event.currentTarget);const videoId=youtubeIdFrom(form.get("youtube"));if(!videoId){alert("올바른 YouTube URL 또는 video ID를 입력해주세요.");return;}const item={id:`family-${Date.now()}`,youtubeUrl:`https://www.youtube.com/shorts/${videoId}`,videoId,series:String(form.get("series")||"매일 미드 한문장"),title:String(form.get("title")),channelName:String(form.get("channel")),duration:String(form.get("duration")||"SHORT"),sentence:String(form.get("sentence")),meaningKo:String(form.get("meaning")),situation:String(form.get("situation")),expressionNote:String(form.get("note")),difficulty:String(form.get("difficulty")),tags:String(form.get("tags")).split(",").map(tag=>tag.trim()).filter(Boolean),tip:String(form.get("tip")||"문장을 짧게 나누어 두 번 따라 말해보세요."),example:String(form.get("example")||form.get("sentence")),createdAt:localDateKey()};familyShortState.items=[item,...familyShortState.items];saveFamilyShorts();familyShortState.view="home";render();});
  document.querySelectorAll("[data-family-delete]").forEach(button=>button.addEventListener("click",event=>{const id=event.currentTarget.dataset.familyDelete;familyShortState.items=familyShortState.items.filter(item=>item.id!==id);familyShortState.saved=familyShortState.saved.filter(item=>item!==id);saveFamilyShorts();render();}));
  document.querySelectorAll("[data-drama-open]").forEach(button => button.addEventListener("click", event => {
    dramaShortState.activeClip = event.currentTarget.dataset.dramaOpen;
    dramaShortState.subtitleMode ||= "both";
    saveDramaShortState();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  document.querySelector("[data-drama-back]")?.addEventListener("click", () => {
    dramaShortState.activeClip = null;
    saveDramaShortState();
    render();
  });
  document.querySelectorAll("[data-drama-subtitle]").forEach(button => button.addEventListener("click", event => {
    dramaShortState.subtitleMode = event.currentTarget.dataset.dramaSubtitle;
    saveDramaShortState();
    render();
  }));
  document.querySelector("[data-drama-next-clip]")?.addEventListener("click", event => {
    dramaShortState.activeClip = event.currentTarget.dataset.dramaNextClip;
    saveDramaShortState();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.querySelectorAll("[data-drama-expression]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.dramaExpression;
    dramaShortState.expressions[id] = !dramaShortState.expressions[id];
    render();
  }));
  document.querySelectorAll("[data-drama-quiz]").forEach(button => button.addEventListener("click", event => {
    dramaShortState.quizCard = event.currentTarget.dataset.dramaQuiz;
    dramaShortState.questionIndex = 0;
    render();
  }));
  document.querySelector("[data-drama-quiz-close]")?.addEventListener("click", () => {
    dramaShortState.quizCard = null;
    render();
  });
  document.querySelectorAll("[data-drama-answer]").forEach(button => button.addEventListener("click", event => {
    const [cardId, questionIndexText, choiceIndexText] = event.currentTarget.dataset.dramaAnswer.split(":");
    dramaShortState.answers[cardId] ||= {};
    dramaShortState.answers[cardId][Number(questionIndexText)] = Number(choiceIndexText);
    saveDramaShortState();
    completeDramaStudyIfAllCardsDone();
    render();
  }));
  document.querySelector("[data-drama-next]")?.addEventListener("click", event => {
    const card = dramaShortCards.find(item => item.id === event.currentTarget.dataset.dramaNext);
    if (!card) return;
    if (dramaShortState.questionIndex < card.questions.length - 1) dramaShortState.questionIndex += 1;
    else dramaShortState.quizCard = null;
    render();
  });
  document.querySelectorAll("[data-drama-save]").forEach(button => button.addEventListener("click", event => {
    const card = dramaVideoClips.find(item => item.id === event.currentTarget.dataset.dramaSave) || dramaShortCards.find(item => item.id === event.currentTarget.dataset.dramaSave);
    if (!card) return;
    const id = `drama:${card.id}`;
    const saved = state.savedBlogItems.some(item => item.id === id);
    state.savedBlogItems = saved ? state.savedBlogItems.filter(item => item.id !== id) : [...state.savedBlogItems, { id, type: "expression", text: card.expression, meaning: card.meaning, example: card.quote || card.line, sourceType: "drama", sourceTitle: `${card.series} · ${card.season || card.episode}`, sourceUrl: location.href }];
    profileStorage.setItem("value_time_saved_blog_items_v1", JSON.stringify(state.savedBlogItems));
    render();
  }));
  document.querySelector("[data-drama-undo]")?.addEventListener("click", () => {
    homeStudyState.checked.drama = false;
    saveHomeStudyState("drama");
    render();
  });
  document.querySelectorAll("[data-word-nav]").forEach(el=>el.addEventListener("click",()=>{state.wordIndex=(state.wordIndex+Number(el.dataset.wordNav)+words.length)%words.length;render();}));
  document.querySelectorAll("[data-jump-word]").forEach(el=>el.addEventListener("click",()=>{const index=words.findIndex(word=>word.word===el.dataset.jumpWord);if(index>=0){state.wordIndex=index;render();}}));
  document.querySelector(".mobile-menu")?.addEventListener("click",()=>document.querySelector(".sidebar").classList.toggle("open"));
  document.querySelector("[data-quick-grade]")?.addEventListener("click", () => {
    const result = document.querySelector("[data-quick-result]");
    const questions = getDailyQuickTestQuestions();
    const selectedAnswers = questions.map((_, index) => document.querySelector(`input[name="quick-q${index + 1}"]:checked`));
    if (selectedAnswers.some(input => !input)) {
      result.className = "error";
      result.textContent = "모든 문항에 답해주세요.";
      return;
    }
    const answerIndexes = selectedAnswers.map(input => Number(input.value));
    const total = questions.length;
    dailyQuickTestState.score = answerIndexes.reduce((score, selected, index) => score + Number(selected === questions[index].answer), 0);
    dailyQuickTestState.graded = true;
    syncHomeAppState("test", `${dailyQuickTestState.score} / ${total}`);
    result.className = dailyQuickTestState.score === total ? "perfect" : "";
    const wrongExplanations = questions.filter((question, index) => answerIndexes[index] !== question.answer).map(question => question.explanation);
    result.textContent = `점수: ${dailyQuickTestState.score} / ${total}${wrongExplanations.length ? `\n${wrongExplanations.join("\n")}` : "\n오늘 배운 내용을 정확히 기억했어요!"}`;
    const scoreMeta = document.querySelector("[data-daily-score-meta]");
    if (scoreMeta) scoreMeta.textContent = `최근 점수 · ${dailyQuickTestState.score} / ${total}`;
    document.querySelectorAll(".daily-quick-grid fieldset").forEach((fieldset, questionIndex) => {
      fieldset.querySelectorAll("label").forEach(label => {
        const input = label.querySelector("input");
        const choiceIndex = Number(input.value);
        if (choiceIndex === questions[questionIndex].answer) label.classList.add("correct");
        if (input.checked && choiceIndex !== questions[questionIndex].answer) label.classList.add("wrong");
        input.disabled = true;
      });
    });
    document.querySelector("[data-daily-complete]")?.removeAttribute("hidden");
  });
  document.querySelector("[data-daily-complete]")?.addEventListener("click", () => {
    if (!dailyQuickTestState.graded && !homeStudyState.checked.test) return;
    homeStudyState.checked.test = true;
    saveHomeStudyState("test", dailyQuickTestState.graded ? `${dailyQuickTestState.score} / ${getDailyQuickTestQuestions().length}` : undefined);
    render();
  });
  document.querySelector("[data-daily-undo]")?.addEventListener("click", () => {
    homeStudyState.checked.test = false;
    saveHomeStudyState("test");
    render();
  });
  document.querySelectorAll("[data-test-tab]").forEach(el => el.addEventListener("click", () => {
    dailyTestState.active = el.dataset.testTab;
    render();
  }));
  document.querySelector("[data-test-check]")?.addEventListener("click", event => {
    if (event.currentTarget.dataset.answered === "true") return;
    const selected = document.querySelector('input[name="daily-test-choice"]:checked');
    const result = document.querySelector("#test-result");
    if (!selected) {
      result.className = "test-result show incorrect";
      result.textContent = "보기를 하나 선택해 주세요.";
      return;
    }
    const type = dailyTestState.active;
    const current = dailyTestQuestions[type][dailyTestState.indices[type]];
    const isCorrect = Number(selected.value) === current.answer;
    event.currentTarget.dataset.answered = "true";
    document.querySelectorAll('input[name="daily-test-choice"]').forEach(input => { input.disabled = true; });
    document.querySelectorAll("[data-choice-index]").forEach(label => {
      const choiceIndex = Number(label.dataset.choiceIndex);
      if (choiceIndex === current.answer) label.classList.add("correct");
      if (choiceIndex === Number(selected.value) && !isCorrect) label.classList.add("wrong");
    });
    saveDailyTestResult(type, current, Number(selected.value), isCorrect);
    const scoreValue = document.querySelector(`#test-score-${type}`);
    if (scoreValue) scoreValue.textContent = `${dailyTestState.scores[`${type}Correct`]} / ${dailyTestState.scores[`${type}Total`]}`;
    result.className = `test-result show ${isCorrect ? "correct" : "incorrect"}`;
    result.textContent = `${isCorrect ? "정답입니다." : "오답입니다."}\n정답: ${current.choices[current.answer]}\n해설: ${current.explanation}`;
  });
  document.querySelector("[data-test-next]")?.addEventListener("click", () => {
    const type = dailyTestState.active;
    dailyTestState.indices[type] = (dailyTestState.indices[type] + 1) % dailyTestQuestions[type].length;
    render();
  });
  document.querySelector("[data-test-reset]")?.addEventListener("click", () => {
    Object.assign(dailyTestState.scores, emptyTestScores());
    const history = getTestHistory();
    history[localDateKey()] = emptyHistoryEntry();
    try { profileStorage.setItem(DAILY_TEST_HISTORY_KEY, JSON.stringify(history)); } catch {}
    render();
    const status = document.querySelector("#test-score-status");
    if (status) status.textContent = "점수가 초기화되었습니다.";
  });
  document.querySelectorAll("[data-wrong-filter]").forEach(el => el.addEventListener("click", () => {
    dailyTestState.wrongFilter = el.dataset.wrongFilter;
    render();
  }));
  document.querySelector("[data-wrong-clear]")?.addEventListener("click", () => {
    try { profileStorage.removeItem(DAILY_TEST_WRONG_KEY); } catch {}
    render();
  });
  document.querySelectorAll("[data-history-filter]").forEach(el => el.addEventListener("click", () => {
    dailyTestState.historyFilter = el.dataset.historyFilter;
    render();
  }));
  document.querySelector("[data-history-clear]")?.addEventListener("click", () => {
    try { profileStorage.removeItem(DAILY_TEST_HISTORY_KEY); } catch {}
    Object.assign(dailyTestState.scores, emptyTestScores());
    render();
  });
  document.querySelector("[data-quiz-dashboard-complete]")?.addEventListener("click", () => {
    const quizSolvedCount = Object.keys(quizState.solvedMap).length;
    if (!quizSolvedCount && !homeStudyState.checked.quiz) return;
    const quizCorrectCount = Object.values(quizState.solvedMap).filter(result => result.correct).length;
    homeStudyState.checked.quiz = true;
    saveHomeStudyState("quiz", quizSolvedCount ? `${quizCorrectCount} / ${quizSolvedCount}` : undefined);
    render();
  });
  document.querySelector("[data-quiz-dashboard-undo]")?.addEventListener("click", () => {
    homeStudyState.checked.quiz = false;
    saveHomeStudyState("quiz");
    render();
  });
  document.querySelectorAll("[data-quiz-group]").forEach(button => button.addEventListener("click", () => {
    if (button.disabled) return;
    quizState.activeGroup = button.dataset.quizGroup;
    quizState.search = "";
    quizState.filter = quizState.activeGroup === "review" ? "all" : "unsolved";
    quizState.current = 0;
    quizState.answerVisible = false;
    quizState.selectedChoice = null;
    saveQuizState();
    render();
  }));
  document.querySelector("[data-quiz-home]")?.addEventListener("click", () => {
    quizState.activeGroup = "";
    quizState.search = "";
    quizState.filter = "all";
    quizState.current = 0;
    quizState.answerVisible = false;
    quizState.selectedChoice = null;
    saveQuizState();
    render();
  });
  document.querySelectorAll("[data-quiz-choice]").forEach(button => button.addEventListener("click", () => {
    const filtered = getFilteredQuizIndexes();
    const realIndex = filtered[quizState.current];
    if (realIndex === undefined || quizState.solvedMap[realIndex]) return;
    quizState.selectedChoice = Number(button.dataset.quizChoice);
    render();
  }));
  document.querySelectorAll("[data-quiz-prev]").forEach(button => button.addEventListener("click", () => { if (quizState.current > 0) { quizState.current -= 1; quizState.answerVisible = false; quizState.selectedChoice = null; render(); } }));
  document.querySelectorAll("[data-quiz-next]").forEach(button => button.addEventListener("click", () => { const length = getFilteredQuizIndexes().length; if (quizState.current < length - 1) { quizState.current += 1; quizState.answerVisible = false; quizState.selectedChoice = null; render(); } }));
  document.querySelector("[data-quiz-answer]")?.addEventListener("click", () => {
    const filtered = getFilteredQuizIndexes();
    const realIndex = filtered[quizState.current];
    if (realIndex === undefined || quizState.solvedMap[realIndex]) return;
    if (!Number.isInteger(quizState.selectedChoice)) {
      quizState.answerVisible = true;
      render();
      return;
    }
    const selected = quizState.selectedChoice;
    const correct = selected === Number(quizState.questions[realIndex].answer);
    quizState.solvedMap[realIndex] = { selected, correct, timestamp: Date.now() };
    quizState.solvedDates.push(quizTodayKey());
    quizState.wrongSet = correct ? quizState.wrongSet.filter(index => index !== realIndex) : [...new Set([...quizState.wrongSet, realIndex])];
    quizState.answerVisible = true;
    quizState.selectedChoice = null;
    saveQuizState();
    const quizSolvedCount = Object.keys(quizState.solvedMap).length;
    const quizCorrectCount = Object.values(quizState.solvedMap).filter(result => result.correct).length;
    syncHomeAppState("quiz", `${quizCorrectCount} / ${quizSolvedCount}`);
    render();
    if (window.matchMedia("(max-width: 700px)").matches) requestAnimationFrame(() => document.querySelector(".quiz-explanation-card")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  });
  document.querySelector("[data-quiz-mode]")?.addEventListener("click", () => { quizState.examMode = !quizState.examMode; saveQuizState(); render(); });
  document.querySelector("[data-quiz-dark]")?.addEventListener("click", () => { quizState.darkMode = !quizState.darkMode; saveQuizState(); render(); });
  document.querySelectorAll("[data-quiz-retry]").forEach(button => button.addEventListener("click", () => { if (!quizState.wrongSet.length) { window.alert("오답 문제가 없습니다."); return; } quizState.activeGroup = "review"; quizState.search = ""; quizState.filter = "wrong"; quizState.current = 0; quizState.selectedChoice = null; saveQuizState(); render(); }));
  document.querySelector("[data-quiz-reset]")?.addEventListener("click", () => { if (!window.confirm("학습 기록을 초기화할까요?")) return; quizState.solvedMap = {}; quizState.wrongSet = []; quizState.bookmarkSet = []; quizState.solvedDates = []; quizState.dailyPlan = null; quizState.recentQuestionHistory = []; quizState.current = 0; quizState.answerVisible = false; quizState.selectedChoice = null; saveQuizState(); render(); });
  document.querySelector("[data-quiz-filter]")?.addEventListener("change", event => { quizState.filter = event.currentTarget.value; quizState.current = 0; quizState.answerVisible = false; quizState.selectedChoice = null; render(); });
  document.querySelector("[data-quiz-search]")?.addEventListener("input", event => {
    quizState.search = event.currentTarget.value;
    quizState.current = 0;
    quizState.answerVisible = false;
    quizState.selectedChoice = null;
    render();
    window.requestAnimationFrame(() => { const input = document.querySelector("[data-quiz-search]"); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } });
  });
  document.querySelectorAll("[data-quiz-bookmark]").forEach(button => button.addEventListener("click", () => {
    const realIndex = Number(button.dataset.quizBookmark);
    if (!Number.isInteger(realIndex) || realIndex < 0) return;
    quizState.bookmarkSet = quizState.bookmarkSet.includes(realIndex)
      ? quizState.bookmarkSet.filter(index => index !== realIndex)
      : [...quizState.bookmarkSet, realIndex];
    saveQuizState();
    render();
  }));
  document.querySelectorAll("[data-quiz-go]").forEach(button => button.addEventListener("click", () => jumpToQuizQuestion(Number(button.dataset.quizGo))));
  document.querySelectorAll("[data-quiz-retry-one]").forEach(button => button.addEventListener("click", () => jumpToQuizQuestion(Number(button.dataset.quizRetryOne), true)));
  document.querySelectorAll("[data-quiz-remove-wrong]").forEach(button => button.addEventListener("click", () => { quizState.wrongSet = quizState.wrongSet.filter(index => index !== Number(button.dataset.quizRemoveWrong)); saveQuizState(); render(); }));
  document.querySelector("[data-quiz-csv]")?.addEventListener("change", event => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const questions = parseQuizCSV(reader.result || "");
      if (!questions.length) { window.alert("CSV에서 유효한 문제를 찾지 못했습니다."); return; }
      quizState.questions = questions;
      quizState.solvedMap = {};
      quizState.wrongSet = [];
      quizState.bookmarkSet = [];
      quizState.solvedDates = [];
      quizState.dailyPlan = null;
      quizState.recentQuestionHistory = [];
      quizState.current = 0;
      quizState.search = "";
      quizState.filter = "all";
      quizState.selectedChoice = null;
      saveQuizState();
      render();
      window.alert(`${questions.length}개 문제를 불러왔습니다.`);
    };
    reader.readAsText(file, "utf-8");
  });
}

window.addEventListener("popstate", event => {
  const navigation = event.state;
  if (!navigation?.worthyLife) return;

  state.page = navigation.page || "home";
  state.newsIndex = navigation.newsIndex ?? null;
  state.tedLessonId = navigation.tedLessonId ?? null;
  state.translatedSentence = null;
  render();
  window.scrollTo(0, 0);
});

const initialNavigation = window.history.state;
if (initialNavigation?.worthyLife) {
  state.page = initialNavigation.page || "home";
  state.newsIndex = initialNavigation.newsIndex ?? null;
  state.tedLessonId = initialNavigation.tedLessonId ?? null;
} else {
  // 개별 HTML 파일을 주소창에서 직접 열어도 해당 학습 화면으로 시작합니다.
  const entryPageMap = {
    "vocab.html": "words",
    "sentence.html": "sentence",
    "news.html": "news",
    "drama.html": "drama",
    "dailytest.html": "test",
    "quiz.html": "quiz",
    "ted.html": "ted",
    "suneung.html": "suneung-home",
  };
  const entryFile = window.location.pathname.split("/").pop().toLowerCase();
  const hashPage = window.location.hash.replace(/^#/, "").split("/")[0];
  if (entryFile === "suneung.html" && audienceMode !== "middle") applyAudienceMode("suneung");
  state.page = entryPageMap[entryFile] || (["calendar", "blog", "journal"].includes(hashPage) ? hashPage : "home");
  if (entryFile === "suneung.html" && hashPage.startsWith("suneung-")) state.page = hashPage;
  const articleMatch = state.page === "news" ? window.location.hash.match(/^#article-(\d+)$/) : null;
  state.newsIndex = articleMatch ? Number(articleMatch[1]) : null;
  window.history.replaceState(
    { worthyLife: true, page: state.page, newsIndex: state.newsIndex, tedLessonId: state.tedLessonId },
    ""
  );
}

render();
refreshDailyNewsLibrary();

