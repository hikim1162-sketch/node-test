import { vocabularyWords } from "../data/vocabulary.js";
import { tedLessons, tedSettings } from "../data/ted-lessons.js";
import { toeicSentences } from "../data/toeic-sentences.js";

const CATEGORIES = {
  word: { label: "단어", short: "단", icon: "book-open" },
  sentence: { label: "문장", short: "문", icon: "message" },
  drama: { label: "미드", short: "미", icon: "play" },
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

const articleLibrary = [
  { ...articleData, id: "science-001", dateOrder: "2026-07-13" },
  ...articleLibraryBase.slice(1),
];

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
  try { return JSON.parse(localStorage.getItem(key) || "{}"); }
  catch { return {}; }
}

function getTedMasteredSourceIndexes(lessonId) {
  const stored = readTedSentenceStore(TED_MASTERY_STORAGE_KEY)[lessonId];
  return Array.isArray(stored) ? stored.map(Number).filter(Number.isInteger) : [];
}

function saveTedMasteredSourceIndexes(lessonId, indexes) {
  const stored = readTedSentenceStore(TED_MASTERY_STORAGE_KEY);
  stored[lessonId] = [...new Set(indexes)].sort((a, b) => a - b);
  localStorage.setItem(TED_MASTERY_STORAGE_KEY, JSON.stringify(stored));
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
    localStorage.setItem(TED_ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignments));
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

const QUIZ_APP_STORAGE_KEY = "english_quiz_app_state_v3";
const defaultQuizQuestions = [
  { question: "What is a cathode in a battery during discharge?", choices: ["Positive electrode", "Negative electrode", "Separator", "Current collector"], answer: 0, explanation: "In a discharging battery, the cathode is the positive electrode.", youtube: videoId },
  { question: "Which component allows lithium ions to move but prevents electrical short circuits?", choices: ["Binder", "Separator", "Anode foil", "Tab lead"], answer: 1, explanation: "The separator allows ion transport while electrically isolating the electrodes.", youtube: videoId },
  { question: "What is the role of electrolyte in a lithium-ion battery?", choices: ["To store electrons directly", "To transport ions between electrodes", "To prevent any chemical reaction", "To replace the separator"], answer: 1, explanation: "The electrolyte carries lithium ions between anode and cathode.", youtube: videoId },
];

function normalizeQuizQuestion(question = {}) {
  return {
    question: question.question || "",
    choices: Array.isArray(question.choices) ? question.choices : [],
    answer: Number(question.answer) || 0,
    explanation: question.explanation || "",
    youtube: question.youtube || question.youtube_url || question.video || question.videoId || question.youtubeId || "",
  };
}

function loadQuizState() {
  const initial = { questions: defaultQuizQuestions, current: 0, solvedMap: {}, wrongSet: [], solvedDates: [], darkMode: false, examMode: false, search: "", filter: "all", answerVisible: false };
  try {
    const saved = JSON.parse(localStorage.getItem(QUIZ_APP_STORAGE_KEY) || "null");
    if (!saved) return initial;
    return {
      ...initial,
      ...saved,
      questions: Array.isArray(saved.questions) && saved.questions.length ? saved.questions.map(normalizeQuizQuestion) : defaultQuizQuestions,
      solvedDates: Array.isArray(saved.solvedDates) ? saved.solvedDates : Array.isArray(saved.todaySolvedDates) ? saved.todaySolvedDates : [],
    };
  } catch { return initial; }
}

const quizState = loadQuizState();
const quizQuickState = { graded: false, score: null, feedback: [] };

function saveQuizState() {
  try {
    localStorage.setItem(QUIZ_APP_STORAGE_KEY, JSON.stringify({ questions: quizState.questions, current: quizState.current, solvedMap: quizState.solvedMap, wrongSet: quizState.wrongSet, todaySolvedDates: quizState.solvedDates, darkMode: quizState.darkMode, examMode: quizState.examMode }));
  } catch {}
}

function quizTodayKey() {
  return localDateKey(new Date());
}

function getFilteredQuizIndexes() {
  const keyword = quizState.search.trim().toLowerCase();
  return quizState.questions.map((question, index) => ({ question, index })).filter(({ question, index }) => {
    const solved = Boolean(quizState.solvedMap[index]);
    const wrong = quizState.wrongSet.includes(index);
    if (quizState.filter === "unsolved" && solved) return false;
    if (quizState.filter === "solved" && !solved) return false;
    if (quizState.filter === "wrong" && !wrong) return false;
    return !keyword || [question.question, question.explanation, ...question.choices].join(" ").toLowerCase().includes(keyword);
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
  try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
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
    localStorage.setItem(DAILY_TEST_HISTORY_KEY, JSON.stringify(normalizedHistory));
    localStorage.removeItem(LEGACY_DAILY_TEST_HISTORY_KEY);
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
      localStorage.setItem(DAILY_TEST_WRONG_KEY, JSON.stringify(legacyNotes));
      localStorage.removeItem(LEGACY_DAILY_TEST_WRONG_KEY);
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

  return [
    { category: "오늘의 단어", prompt: word.word, question: "뜻으로 가장 알맞은 것은?", choices: wordChoices, answer: wordChoices.indexOf(word.meaning), explanation: `${word.word}는 '${word.meaning}'라는 뜻입니다.` },
    { category: "매일 1문장", prompt: sentence.pattern, question: "표현의 의미로 가장 알맞은 것은?", choices: sentenceChoices, answer: sentenceChoices.indexOf(sentence.meaning), explanation: `${sentence.pattern}은 '${sentence.meaning}'라는 의미입니다.` },
  ];
}

// 오늘의 학습 대시보드: 아래 배열만 수정하면 메인 카드가 함께 바뀝니다.
const HOME_STUDY_STORAGE_KEY = "today_learning_dashboard_v2";
const LEGACY_HOME_STUDY_STORAGE_KEY = "today_learning_dashboard_v1";
const HOME_APP_STORAGE_KEY = "today_learning_app_v3";
const homeStudyItems = [
  { id: "words", number: "01", title: "단어장", description: "오늘 학습할 단어를 빠르게 확인하고 뜻과 표현을 익혀보세요.", page: "words", link: "vocab.html", icon: "book", color: "sage", tag: "기초 워밍업" },
  { id: "sentence", number: "02", title: "매일 1문장", description: "짧고 유용한 문장을 따라 읽으며 매일 한 문장씩 쌓아가세요.", page: "sentence", link: "sentence.html", icon: "message", color: "gold", tag: "짧은 루틴" },
  { id: "news", number: "03", title: "영어 뉴스", description: "오늘의 뉴스 표현을 통해 실제 영어 표현 감각을 키워보세요.", page: "news", link: "news.html", icon: "news", color: "blue", tag: "실전 표현" },
  { id: "ted", number: "04", title: "TED 학습", description: "오늘의 TED 문장 5개를 듣고 따라 말하며 핵심 표현을 익혀보세요.", page: "ted", link: "ted.html", icon: "mic", color: "rose", tag: "듣기·말하기" },
  { id: "test", number: "05", title: "Daily Test", description: "짧은 테스트로 오늘 학습한 내용을 가볍게 점검해보세요.", page: "test", link: "dailytest.html", icon: "clipboard", color: "mint", tag: "점검" },
  { id: "quiz", number: "06", title: "영어 문제 풀이", description: "문제를 풀고 오답을 확인하면서 실력을 정리해보세요.", page: "quiz", link: "quiz.html", icon: "pencil", color: "navy", tag: "마무리 정리" },
];
const weeklyHomeRoutines = {
  0: { day: "일요일", title: "일요일 정리 루틴", description: "주간 학습을 가볍게 정리하고 다음 주를 준비하는 흐름이에요.", items: ["sentence", "quiz"] },
  1: { day: "월요일", title: "월요일 가벼운 시작 루틴", description: "주 초반에는 부담 없는 루틴으로 학습 리듬을 만들어보세요.", items: ["words", "sentence", "test"] },
  2: { day: "화요일", title: "화요일 입력 강화 루틴", description: "읽기와 표현 입력 중심으로 영어 감각을 충분히 채워보세요.", items: ["words", "news", "sentence"] },
  3: { day: "수요일", title: "수요일 유지 루틴", description: "짧지만 흐름이 끊기지 않도록 핵심 학습만 이어가세요.", items: ["sentence", "test"] },
  4: { day: "목요일", title: "목요일 이해 확장 루틴", description: "실전 표현과 문맥 이해에 조금 더 집중해보세요.", items: ["news", "quiz"] },
  5: { day: "금요일", title: "금요일 점검 루틴", description: "한 주 동안 익힌 내용을 가볍게 점검하기 좋은 날이에요.", items: ["words", "test", "quiz"] },
  6: { day: "토요일", title: "토요일 몰입 루틴", description: "여유가 있다면 복습과 문제풀이까지 연결해보세요.", items: ["words", "quiz"] },
};

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
  try { localStorage.setItem(HOME_APP_STORAGE_KEY, JSON.stringify(appState)); }
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
    localStorage.setItem(HOME_STUDY_STORAGE_KEY, JSON.stringify(homeStudyState));
    localStorage.removeItem(LEGACY_HOME_STUDY_STORAGE_KEY);
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
const CHILD_NAME_STORAGE_KEY = "value_time_child_name_v1";
const KIDS_PROGRESS_STORAGE_KEY = "value_time_kids_progress_v1";
const KIDS_HISTORY_STORAGE_KEY = "value_time_kids_history_v1";
const KIDS_INTRO_STORAGE_KEY = "value_time_kids_intro_seen_v1";
const KIDS_WORD_DAY_OFFSET_STORAGE_KEY = "value_time_kids_word_day_offset_v1";
const KIDS_WORD_DAY_OFFSET_DATE_STORAGE_KEY = "value_time_kids_word_day_offset_date_v1";
const KIDS_SENTENCE_PAGE_STORAGE_KEY = "value_time_kids_sentence_page_v1";
const KIDS_SENTENCE_PAGE_DATE_STORAGE_KEY = "value_time_kids_sentence_page_date_v1";
let learningMode = (() => {
  try { return localStorage.getItem(LEARNING_MODE_STORAGE_KEY) === "speaking" ? "speaking" : "default"; }
  catch { return "default"; }
})();
let speakingSpeed = (() => {
  try { return Number(localStorage.getItem(SPEAKING_SPEED_STORAGE_KEY)) === 0.8 ? 0.8 : 1; }
  catch { return 1; }
})();
let speakingExpressionDone = (() => {
  try { return JSON.parse(localStorage.getItem(SPEAKING_EXPRESSION_STORAGE_KEY) || "[]"); }
  catch { return []; }
})();
let audienceMode = (() => {
  try { return localStorage.getItem("mode") === "elementary" || localStorage.getItem(AUDIENCE_MODE_STORAGE_KEY) === "kids" ? "kids" : "general"; }
  catch { return "general"; }
})();
let childName = (() => {
  try { return localStorage.getItem("studentName") || localStorage.getItem(CHILD_NAME_STORAGE_KEY) || "김나혜"; }
  catch { return "김나혜"; }
})();
let showKidsIntro = (() => {
  try { return localStorage.getItem(KIDS_INTRO_STORAGE_KEY) !== "true"; }
  catch { return true; }
})();
let kidsHistory = (() => {
  try { return JSON.parse(localStorage.getItem(KIDS_HISTORY_STORAGE_KEY) || "{}") || {}; }
  catch { return {}; }
})();
let kidsProgress = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem(KIDS_PROGRESS_STORAGE_KEY) || "null");
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
    return localStorage.getItem(KIDS_WORD_DAY_OFFSET_DATE_STORAGE_KEY) === localDateKey()
      ? Math.max(0, Number(localStorage.getItem(KIDS_WORD_DAY_OFFSET_STORAGE_KEY) || 0))
      : 0;
  }
  catch { return 0; }
})();
let kidsSentencePageIndex = (() => {
  try {
    return localStorage.getItem(KIDS_SENTENCE_PAGE_DATE_STORAGE_KEY) === localDateKey()
      ? Math.max(0, Number(localStorage.getItem(KIDS_SENTENCE_PAGE_STORAGE_KEY) || 0))
      : 0;
  }
  catch { return 0; }
})();

function applyLearningMode(mode) {
  learningMode = mode === "speaking" ? "speaking" : "default";
  document.documentElement.dataset.mode = learningMode;
  if (document.body) document.body.dataset.mode = learningMode;
  try { localStorage.setItem(LEARNING_MODE_STORAGE_KEY, learningMode); } catch {}
}

function applyAudienceMode(mode) {
  audienceMode = mode === "kids" ? "kids" : "general";
  document.documentElement.dataset.audience = audienceMode;
  if (document.body) document.body.dataset.audience = audienceMode;
  try {
    localStorage.setItem(AUDIENCE_MODE_STORAGE_KEY, audienceMode);
    localStorage.setItem(CHILD_NAME_STORAGE_KEY, childName);
    localStorage.setItem("mode", audienceMode === "kids" ? "elementary" : "default");
    localStorage.setItem("studentName", childName);
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
    localStorage.setItem(CHILD_NAME_STORAGE_KEY, childName);
    localStorage.setItem("studentName", childName);
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
  try { localStorage.setItem(KIDS_HISTORY_STORAGE_KEY, JSON.stringify(kidsHistory)); } catch {}
}

function saveKidsProgress() {
  kidsProgress.date = kidsProgress.date || localDateKey();
  kidsHistory[kidsProgress.date] = kidsEntryFromProgress(kidsProgress);
  try { localStorage.setItem(KIDS_PROGRESS_STORAGE_KEY, JSON.stringify(kidsProgress)); } catch {}
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
    localStorage.setItem(KIDS_WORD_DAY_OFFSET_STORAGE_KEY, String(kidsWordDayOffset));
    localStorage.setItem(KIDS_WORD_DAY_OFFSET_DATE_STORAGE_KEY, localDateKey());
  } catch {}
}

function getKidsSentencePageKey() {
  return `kids-sentence-page-${kidsSentencePageIndex}`;
}

function saveKidsSentencePageIndex() {
  try {
    localStorage.setItem(KIDS_SENTENCE_PAGE_STORAGE_KEY, String(kidsSentencePageIndex));
    localStorage.setItem(KIDS_SENTENCE_PAGE_DATE_STORAGE_KEY, localDateKey());
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
  try { localStorage.setItem(SPEAKING_SPEED_STORAGE_KEY, String(speakingSpeed)); } catch {}
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
  try { return (localStorage.getItem(THEME_STORAGE_KEY) || LEGACY_THEME_STORAGE_KEYS.map(key => localStorage.getItem(key)).find(Boolean)) === "dark" ? "dark" : "light"; }
  catch { return "light"; }
})();
document.documentElement.dataset.theme = currentTheme;

function saveTheme(theme) {
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    LEGACY_THEME_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  }
  catch {}
}
saveTheme(currentTheme);

let state = {
  page: "home", selectedDate: localDateKey(), calendarMonth: new Date().getMonth(), calendarYear: new Date().getFullYear(),
  history: JSON.parse(localStorage.getItem("worthy_life_history") || "null") || defaultHistory,
  savedWords: JSON.parse(localStorage.getItem("worthy_life_words") || "[]"),
  knownWords: JSON.parse(localStorage.getItem("value_time_known_words_v1") || "[]"),
  clearedWordSentences: JSON.parse(localStorage.getItem("value_time_cleared_word_sentences_v1") || "[]"),
  savedSentences: JSON.parse(localStorage.getItem("value_time_saved_sentences_v1") || "[]"),
  understoodSentences: JSON.parse(localStorage.getItem("value_time_understood_sentences_v1") || "[]"),
  clearedSentences: JSON.parse(localStorage.getItem("value_time_cleared_sentences_v1") || "[]"),
  wordIndex: 0, vocabPage: Number(localStorage.getItem("value_time_vocab_page") || 0), sentencePage: Number(localStorage.getItem("value_time_sentence_page") || 0), newsIndex: null, translatedSentence: null,
  newsSearch: "", newsCategory: "all", newsSort: "latest", tedLessonId: null, tedSentenceIndex: 0,
};

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

function navItem(id, label, ico) { return `<button class="nav-item ${state.page === id ? "active" : ""}" data-page="${id}">${icon(ico)}<span>${label}</span></button>`; }
function sidebar() {
  const todayDone = (state.history["2026-07-13"] || []).length;
  const kidsNavigation = `${navItem("home", "오늘의 학습", "home")}${navItem("words", "단어장", "book")}${navItem("sentence", "매일 1문장", "spark")}${navItem("news", "초등용 읽기", "news")}${navItem("ted", "영어동화", "book")}${navItem("drama", "영어 동요", "play")}${navItem("test", "Daily Test", "check")}<p class="nav-label space">MY SPACE</p>${navItem("calendar", "학습 캘린더", "calendar")}`;
  const generalNavigation = `${navItem("home", "오늘의 학습", "home")}${navItem("words", "단어장", "book")}${navItem("sentence", "매일 1문장", "spark")}${navItem("news", "영어 뉴스", "news")}${navItem("ted", "TED 학습", "mic")}${navItem("drama", "미드 학습", "play")}${navItem("test", "Daily Test", "check")}${navItem("quiz", "영어 문제 풀이", "message")}<p class="nav-label space">MY SPACE</p>${navItem("journal", "나만의 학습장", "check")}${navItem("calendar", "학습 캘린더", "calendar")}${navItem("blog", "최애 블로그", "heart")}`;
  return `<aside class="sidebar">
    <button class="brand" type="button" data-page="home" aria-label="ValueTime 메인 화면으로 이동"><span class="brand-mark">V</span><span class="brand-copy"><b>ValueTime</b><small>Make your time more valuable.</small></span></button>
    <nav><p class="nav-label">LEARN</p>${audienceMode === "kids" ? kidsNavigation : generalNavigation}</nav>
    <div class="sidebar-bottom"><div class="streak-card"><div class="streak-icon">${icon("flame")}</div><div><b>${audienceMode === "kids" ? `${childName}의 영어 탐험!` : "12일 연속 학습 중!"}</b><span>${audienceMode === "kids" ? "오늘도 별을 모아봐요" : "이번 주도 멋져요"}</span></div></div><div class="profile"><span class="avatar">${audienceMode === "kids" ? childCallName() : "Kai"}</span><div><b>${audienceMode === "kids" ? childName : "Kai"}</b><span>${audienceMode === "kids" ? "초등학교 4학년" : "꾸준한 학습자"}</span></div><button type="button" ${audienceMode === "kids" ? 'data-kids-edit-name aria-label="학생 이름 변경"' : ""}>${audienceMode === "kids" ? "이름" : "···"}</button></div></div>
  </aside>`;
}

function header(title = "오늘의 학습") {
  const toeicQuickLink = state.page === "home" && audienceMode === "general"
    ? `<a class="header-toeic-link" href="https://www.hackers.co.kr/?c=s_toeic/toeic_study/drc" target="_blank" rel="noopener noreferrer" aria-label="해커스 매일 토익 RC 풀기 새 창에서 열기"><span>RC</span><b>매일 토익 RC 풀기</b>${icon("arrow",14)}</a><button class="header-ted-link" type="button" data-page="ted" aria-label="TED 학습 바로가기"><span>TED</span><b>TED 바로가기</b>${icon("arrow",14)}</button><a class="header-bbc-link" href="https://www.bbc.co.uk/learningenglish/english/course/towards-advanced" target="_blank" rel="noopener noreferrer" aria-label="BBC Learning English Towards Advanced 새 창에서 열기"><span>BBC</span><b>BBC Learning</b>${icon("arrow",14)}</a>`
    : "";

  return `<header><button class="mobile-menu" aria-label="메뉴">${icon("menu")}</button><div class="header-title-block"><p class="eyebrow">${audienceMode === "kids" ? `${childName}의 오늘 영어` : "MONDAY, JULY 13"}</p><div class="header-title-row"><h1>${title}</h1>${toeicQuickLink}</div></div><div class="header-actions"><div class="audience-mode-switch" role="group" aria-label="화면 모드 선택"><button class="${audienceMode === "general" ? "active" : ""}" type="button" data-audience-mode="general" aria-pressed="${audienceMode === "general"}">일반</button><button class="${audienceMode === "kids" ? "active" : ""}" type="button" data-audience-mode="kids" aria-pressed="${audienceMode === "kids"}">초등</button></div><div class="learning-mode-switch" role="group" aria-label="학습 모드 선택"><button class="${learningMode === "default" ? "active" : ""}" type="button" data-learning-mode="default" aria-pressed="${learningMode === "default"}">Silent</button><button class="${learningMode === "speaking" ? "active" : ""}" type="button" data-learning-mode="speaking" aria-pressed="${learningMode === "speaking"}">${icon("mic",14)} Speaking</button></div><div class="mini-streak">${icon("flame",18)} <b>${audienceMode === "kids" ? "★" : "12"}</b> ${audienceMode === "kids" ? "오늘의 별" : "day streak"}</div><button class="theme-toggle" type="button" data-theme-toggle aria-label="${currentTheme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}" title="화면 모드 변경">${icon(currentTheme === "dark" ? "sun" : "moon",18)}</button><button class="avatar" aria-label="${audienceMode === "kids" ? childName : "Kai"} 사용자 프로필">${audienceMode === "kids" ? childCallName() : "Kai"}</button></div></header>`;
}

function checklist(date = state.selectedDate) {
  const completed = state.history[date] || [];
  const label = date === "2026-07-13" ? "오늘" : `${Number(date.slice(5,7))}월 ${Number(date.slice(8))}일`;
  return `<section class="panel checklist-panel"><div class="panel-head"><div><p class="eyebrow">MY DAILY PLAN</p><h2>${label}의 학습 체크</h2></div><span class="count-pill">${completed.length} / 4 완료</span></div>
  <div class="check-items">${Object.entries(CATEGORIES).map(([key, c]) => `<button class="check-row ${completed.includes(key) ? "done" : ""}" data-check="${key}" data-date="${date}"><span class="custom-check">${completed.includes(key) ? icon("check",15) : ""}</span><span class="check-copy"><b>${c.label} 학습</b><small>${key === "word" ? "오늘의 단어 10개" : key === "sentence" ? "핵심 문장 1개" : key === "drama" ? "표현 클립 1개" : "영문 기사 1편"}</small></span><span class="go">${completed.includes(key) ? "완료" : "시작"} ${icon("chevron",15)}</span></button>`).join("")}</div>
  <div class="progress-meta"><span>오늘의 진행률</span><b>${completed.length * 25}%</b></div><div class="progress"><i style="width:${completed.length * 25}%"></i></div></section>`;
}

function wordCard(wordIndex = null, navigable = false) {
  const index = wordIndex === null ? new Date().getDate() % words.length : wordIndex;
  const word = words[index];
  const saved = state.savedWords.includes(word.word);
  const example = vocabNaturalExample(word, index);
  return `<section class="word-card ${navigable ? "vocabulary-card" : ""}"><div class="word-top"><span class="soft-badge">${navigable ? `WORD ${index + 1} OF ${words.length}` : "WORD OF THE DAY"}</span><button class="save ${saved ? "saved" : ""}" data-save="${word.word}" aria-label="단어 저장">${icon("bookmark")}</button></div><div class="word-title"><h2>${word.word}</h2><button class="sound" data-speak="${word.word}">${icon("volume",19)}</button></div><p class="phonetic">${vocabPhonetic(word)} <span>${word.type}</span></p><button class="vocab-meaning-cover word-meaning-cover" type="button" data-vocab-meaning-toggle aria-expanded="false"><span>뜻 보기</span><strong>${word.meaning}</strong></button><p class="definition">${word.definition}</p><div class="example"><b>“${example.en}”</b><span>${example.ko}</span></div><a class="word-source" href="${word.sourceUrl}" target="_blank" rel="noopener noreferrer" aria-label="${word.word} 단어 출처 사전 새 창에서 열기"><span>사전 출처</span><b>${word.source}</b>${icon("arrow",14)}</a>${navigable ? `<div class="word-navigation"><button data-word-nav="-1" aria-label="이전 단어">${icon("arrow",19)} <span>이전 단어</span></button><div>${words.map((_,i)=>`<i class="${i===index?"active":""}"></i>`).join("")}</div><button data-word-nav="1" aria-label="다음 단어"><span>다음 단어</span> ${icon("arrow",19)}</button></div>` : `<button class="text-link" data-page="words">단어 더 학습하기 ${icon("arrow",16)}</button>`}</section>`;
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

function getTodayVocabWords(dateKey = localDateKey()) {
  mixedVocabularyWords ||= getMixedVocabularyWords();
  const pageSize = 10;
  const pageCount = Math.ceil(mixedVocabularyWords.length / pageSize);
  const pageIndex = getDailyVocabPageIndex(pageCount, dateKey);
  return mixedVocabularyWords.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
}

function vocabPhonetic(word) {
  const raw = String(word.phonetic || "").trim();
  if (raw) return raw.startsWith("/") || raw.startsWith("[") ? raw : `/${raw}/`;
  return `/${String(word.word || "").toLowerCase()}/`;
}

function vocabPartHint(word) {
  const term = String(word.word || "").toLowerCase();
  const meaning = String(word.meaning || "");
  if (meaning.includes("하다") || meaning.includes("시키다") || meaning.includes("되다")) return "verb";
  if (/(able|ible|ive|al|ous|ful|less|ent|ant|ic|ary|ory)$/.test(term)) return "adjective";
  if (/(tion|sion|ment|ity|ness|ance|ence|cy|ship|ism|er|or)$/.test(term)) return "noun";
  return "noun";
}

function vocabNaturalExampleLegacy(word, seed = 0) {
  const term = String(word?.word || "").trim().toLowerCase();
  const meaning = String(word?.meaning || "핵심 뜻");
  const part = vocabPartHint(word);
  const safeTerm = term || "word";
  const mark = sentence => String(sentence || "Example unavailable.").replace(new RegExp(`\\b${safeTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), match => `<mark>${match}</mark>`);
  const generic = !word.example || /^The meaning of "/.test(word.example);
  if (!generic) {
    return { en: mark(word.example), ko: word.translation || `예문에서 '${term}'는 '${meaning}'의 의미로 쓰였습니다.` };
  }
  const verbTemplates = [
    `Researchers try to ${term} the results before they publish the report.`,
    `Students learn to ${term} key ideas when they read a difficult passage.`,
    `The manager asked the team to ${term} the plan before Friday.`,
    `Writers often ${term} complex ideas with clear examples.`,
  ];
  const adjectiveTemplates = [
    `The teacher gave a ${term} explanation that everyone could understand.`,
    `A ${term} decision can change the direction of the whole project.`,
    `Her ${term} answer helped the group solve the problem.`,
    `The article describes a ${term} change in modern society.`,
  ];
  const nounTemplates = [
    `The ${term} became the main topic of the class discussion.`,
    `The article explains why the ${term} is important in daily life.`,
    `A clear understanding of the ${term} helped students answer the question.`,
    `Many people noticed the ${term} after reading the report.`,
  ];
  const pool = part === "verb" ? verbTemplates : part === "adjective" ? adjectiveTemplates : nounTemplates;
  const sentence = pool[Math.abs(dateSeed(`${safeTerm}-${seed}`)) % pool.length] || "Example unavailable.";
  return {
    en: mark(sentence),
    ko: `예문에서 '${safeTerm}'는 '${meaning}'의 의미로 쓰였습니다.`,
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
    || /^I like\s+\w+\.?$/i.test(value);
}

function vocabNaturalExample(word, seed = 0) {
  const term = String(word?.word || "").trim().toLowerCase();
  const curated = VOCAB_CURATED_EXAMPLES[term];
  const storedSentence = word?.exampleSentence || (!isGenericVocabExample(word?.example) ? word.example : "");
  const sentence = curated?.exampleSentence || storedSentence;
  const translation = curated?.exampleTranslation || word?.exampleTranslation || word?.translation || "";
  const safeTerm = term || String(word?.word || "").trim();
  const mark = value => {
    const raw = String(value || "").trim();
    if (!raw || !safeTerm) return raw;
    const escaped = safeTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return raw.replace(new RegExp(`\\b${escaped}\\b`, "i"), match => `<mark>${match}</mark>`);
  };

  if (!sentence) {
    return {
      ready: false,
      en: "예문 준비 중입니다.",
      ko: "뜻과 품사에 맞는 자연스러운 예문을 검수하고 있어요.",
    };
  }

  return {
    ready: true,
    partOfSpeech: curated?.partOfSpeech || word?.partOfSpeech || word?.type || vocabPartHint(word),
    meaning: curated?.meaning || word?.meaning || "",
    en: mark(sentence),
    ko: translation || "예문 속 문맥으로 단어의 뜻을 확인해 보세요.",
  };
}

function vocabularyPage() {
  const vocabPageSize = 10;
  const orderedWords = (mixedVocabularyWords || getMixedVocabularyWords()).filter(word => word?.word);
  const vocabPageCount = Math.ceil(orderedWords.length / vocabPageSize);
  const todayKey = localDateKey();
  if (localStorage.getItem("value_time_vocab_page_date") !== todayKey) {
    state.vocabPage = getDailyVocabPageIndex(vocabPageCount, todayKey);
    localStorage.setItem("value_time_vocab_page_date", todayKey);
    localStorage.setItem("value_time_vocab_page", String(state.vocabPage));
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
          return `<article class="vocab-today-item ${known ? "known" : ""} ${sentenceClear ? "sentence-cleared" : ""} ${allClear ? "all-clear" : ""}"><div class="vocab-today-top"><div><h4>${word.word}</h4><button type="button" data-speak="${word.word}" aria-label="${word.word} 발음 듣기">${icon("volume",17)}</button><span class="vocab-phonetic">${vocabPhonetic(word)}</span></div><div class="vocab-card-actions"><em>${typeLabel(word.type)}</em><button class="vocab-known-toggle ${known ? "active" : ""}" type="button" data-known-word="${word.word}" aria-pressed="${known}" aria-label="${word.word} Word Clear ${known ? "해제" : "완료"}">${icon("check",14)} <span>Word Clear</span></button><button class="save ${saved ? "saved" : ""}" type="button" data-save="${word.word}" aria-label="${word.word} 단어 ${saved ? "저장 취소" : "저장"}">${icon("bookmark",18)}</button></div></div><span class="vocab-known-chip">${icon("check",12)} <span data-vocab-clear-label>${allClear ? "ALL CLEAR" : known ? "WORD CLEAR" : "SENTENCE CLEAR"}</span></span><button class="vocab-meaning-cover" type="button" data-vocab-meaning-toggle aria-expanded="false"><span>뜻 보기</span><strong>${word.meaning}</strong></button><p>${word.definition}</p><blockquote class="${example.ready ? "" : "vocab-example-empty"}"><b>${example.en}</b><span>${example.ko}</span><button class="vocab-sentence-clear ${sentenceClear ? "active" : ""}" type="button" data-clear-word-sentence="${word.word}" aria-pressed="${sentenceClear}" aria-label="${word.word} 예문 Sentence Clear ${sentenceClear ? "해제" : "완료"}">${icon("check",13)} Sentence Clear</button></blockquote><a href="${word.sourceUrl}" target="_blank" rel="noopener noreferrer">사전 출처 · ${word.source} ${icon("arrow",12)}</a></article>`;
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
        <section class="vocab-complete-box"><button class="primary ${isDone ? "done" : ""}" type="button" data-vocab-complete ${isDone ? "disabled" : ""}>${icon("check",17)} ${isDone ? "오늘 학습 완료됨" : "오늘 학습 완료"}</button><button class="secondary" type="button" data-vocab-undo ${!isDone ? "disabled" : ""}>완료 해제</button><p aria-live="polite">${isDone ? "완료 상태와 최근 학습 시간이 저장되었습니다." : "학습을 마치면 완료 버튼을 눌러주세요."}</p></section>
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

function homePage() {
  // 자정이 지난 뒤 열린 탭에서도 오늘 날짜의 체크리스트가 보이도록 갱신합니다.
  if (homeStudyState.date !== localDateKey()) {
    homeStudyState = { date: localDateKey(), checked: {} };
    saveHomeStudyState();
  }
  const homeAppState = syncHomeAppState();
  const todayRoutine = weeklyHomeRoutines[new Date().getDay()];
  const completed = homeStudyItems.filter(item => homeStudyState.checked[item.id]).length;
  const progress = Math.round((completed / homeStudyItems.length) * 100);
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
  <section class="home-routine-guide" aria-label="오늘의 추천 학습 순서"><div class="home-routine-copy"><span class="home-routine-label">${icon("spark", 16)} 오늘의 추천 루틴</span><strong>${todayRoutine.title}</strong></div><div class="home-routine-flow">${todayRoutine.items.map((id,index) => { const item=homeStudyItems.find(entry=>entry.id===id); return `${index ? `<i>${icon("chevron",13)}</i>` : ""}<b>${Number(item.number)}. ${item.title}</b>`; }).join("")}</div></section>
  <div class="home-dashboard-layout">
    <section class="home-study-section" aria-labelledby="home-study-title"><div class="home-study-heading"><div><p class="eyebrow">DAILY ROUTINE</p><h3 id="home-study-title">오늘 무엇을 공부할까요?</h3></div><span>${completed} / ${homeStudyItems.length} 완료</span></div>
      <div class="home-study-grid">${homeStudyItems.map(item => {
        const isDone = Boolean(homeStudyState.checked[item.id]);
        const itemMeta = homeAppState.items[homeAppItemId(item.id)] || {};
        const timeText = itemMeta.lastStudiedAt ? `최근 학습 · ${itemMeta.lastStudiedAt}` : "최근 학습 기록 없음";
        const scoreText = itemMeta.score !== null && itemMeta.score !== undefined ? `점수 · ${itemMeta.score}` : "점수 기록 없음";
        return `<article class="home-study-card ${isDone ? "completed" : ""}" data-home-study-page="${item.page}" data-home-study-link="${item.link}" tabindex="0" role="link" aria-label="${item.title} 학습 화면으로 이동">
          <div class="home-study-card-top"><div><span class="home-study-number">${item.number}</span><span class="home-study-icon ${item.color}">${icon(item.icon, 22)}</span></div><button class="home-study-toggle" type="button" data-home-study-toggle="${item.id}" aria-pressed="${isDone}" aria-label="${item.title} ${isDone ? "완료 취소" : "완료 표시"}">${icon("check", 15)}</button></div>
          <span class="home-study-done-chip">${icon("check", 11)} 완료된 학습</span><h4>${item.title}</h4><p>${item.description}</p>
          <div class="home-study-card-bottom"><span>${isDone ? "한 번 더 복습하기" : "학습하러 가기"} ${icon("arrow", 15)}</span><em>${item.tag}</em></div>
          <div class="home-study-meta"><span>${icon("calendar",11)} ${timeText}</span><span>${icon("check",11)} ${scoreText}</span></div>
        </article>`;
      }).join("")}</div>
    </section>
    <aside class="home-dashboard-side"><section class="home-progress-card" aria-labelledby="home-progress-title">
      <p class="eyebrow">TODAY'S PROGRESS</p><div class="home-progress-title"><h3 id="home-progress-title">오늘의 학습 체크</h3><strong>${completed}<small> / ${homeStudyItems.length}</small></strong></div><p class="home-progress-desc">완료 여부와 오늘의 전체 달성률을 한눈에 확인해보세요.</p>
      <div class="home-progress-track" role="progressbar" aria-label="오늘의 학습 진도" aria-valuemin="0" aria-valuemax="${homeStudyItems.length}" aria-valuenow="${completed}"><i style="width:${progress}%"></i></div><span class="home-progress-percent">${progress}% 완료</span>
      <ul>${homeStudyItems.map(item => `<li class="${homeStudyState.checked[item.id] ? "done" : ""}"><i>${homeStudyState.checked[item.id] ? icon("check", 12) : ""}</i><span>${item.number}. ${item.title}</span><em>${homeStudyState.checked[item.id] ? "완료" : "진행 전"}</em></li>`).join("")}</ul>
      <p class="home-progress-message">${encouragement}</p><button class="home-progress-reset" type="button" data-home-study-reset>오늘의 체크 초기화</button>
    </section><section class="home-tip-card weekly"><span>${icon("spark", 17)}</span><div><h3>요일별 루틴 운영 팁</h3><p>매일 6개를 모두 하기보다 요일마다 2~3개 루틴을 고정하면 지속하기 쉬워요.</p><ul><li>월·수·금: 짧고 가벼운 루틴</li><li>화·목: 입력과 이해 중심</li><li>주말: 테스트와 문제풀이로 정리</li></ul></div></section></aside>
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
          <div class="ted-focus-translation"><span>학습 메모</span><strong data-ted-focus-ko>${sentence.ko || "제공된 영어 원문을 의미 단위로 끊어 직접 해석해 보세요."}</strong></div>
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
          return `<article class="${learningMode === "speaking" && expressionDone ? "speaking-done" : ""}"><span>${index + 1}</span><h4>${item.term}</h4><p>${item.meaning}</p><small>${item.example}</small><button type="button" data-speak="${item.term.replaceAll('"', '&quot;')}" aria-label="${item.term} 발음 듣기">${icon("volume", 14)}</button>${learningMode === "speaking" ? `<div class="expression-speaking-actions"><button type="button" data-speaking-replay="${item.example.replaceAll('"', '&quot;')}">${icon("volume",12)} 예문 듣기</button><button type="button" data-speaking-repeat="${item.example.replaceAll('"', '&quot;')}">3회 반복</button><button class="${expressionDone ? "active" : ""}" type="button" data-speaking-expression-done="${expressionKey.replaceAll('"', '&quot;')}" aria-pressed="${expressionDone}">${icon("check",12)} ${expressionDone ? "완료" : "말했어요"}</button></div>` : ""}</article>`;
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
  return `${header("학습 캘린더")}<main class="calendar-page"><div class="calendar-compact-legend"><span>학습 구분</span><div class="legend">${Object.entries(CATEGORIES).map(([k,c])=>`<span><i class="${k}">${c.short}</i>${c.label}</span>`).join("")}</div></div><div class="calendar-layout"><section class="calendar-panel panel"><div class="calendar-head"><button data-month="-1">‹</button><h2>${y}년 ${m+1}월</h2><button data-month="1">›</button></div><div class="weekdays">${["일","월","화","수","목","금","토"].map(x=>`<span>${x}</span>`).join("")}</div><div class="calendar-grid">${cells.map(d=>{if(!d)return `<div class="day empty"></div>`; const key=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, done=state.history[key]||[]; return `<button class="day ${key===state.selectedDate?"selected":""} ${key==="2026-07-13"?"today":""}" data-date="${key}"><b>${d}</b><div class="day-checks">${Object.entries(CATEGORIES).map(([k,c])=>`<i class="${k} ${done.includes(k)?"done":""}">${done.includes(k)?icon("check",10):c.short}</i>`).join("")}</div></button>`}).join("")}</div></section>${checklist(state.selectedDate)}</div></main>`;
}

function newsPage() {
  if (state.newsIndex !== null) return articleView();
  const isDone = Boolean(homeStudyState.checked.news);
  const newsMeta = syncHomeAppState().items.news || {};
  const todayKey = localDateKey();
  const dailyArticle = getDailyNewsArticle(todayKey) || articleData;
  const dailyArticleIndex = articleLibrary.findIndex(article => article.id === dailyArticle.id);
  const dailySentence = dailyArticle.sentences[0];
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
          <h3 id="daily-news-title">${dailyArticle.title}</h3><p class="news-daily-summary">${dailySentence.en}</p>
          <div class="news-daily-block"><b>해석</b><p>${dailySentence.ko}</p></div>
          <div class="news-daily-block"><b>핵심 표현</b><div>${dailySentence.expressions.slice(0, 3).map(expression => `<span><strong>${expression.term}</strong> ${expression.meaning}</span>`).join("")}</div></div>
          <div class="news-daily-block"><b>학습 포인트</b><p>${dailySentence.note}</p></div>
          <div class="news-daily-actions"><span>기사 등록일 · ${dailyArticle.date}</span><button type="button" data-open-news="${dailyArticleIndex}">전체 기사 학습하기 ${icon("arrow",15)}</button></div>
        </article>
        <aside class="news-daily-guide"><section class="news-status-card"><span>${icon("calendar",18)}</span><div><h3>학습 상태</h3><b class="news-status-badge ${isDone ? "done" : "todo"}">${isDone ? icon("check",12) : ""}${isDone ? "완료됨" : "진행 전"}</b><p>${newsMeta.lastStudiedAt ? `최근 학습 · ${newsMeta.lastStudiedAt}` : "최근 학습 기록 없음"}</p></div></section><section><span>${icon("news",18)}</span><div><h3>읽기 팁</h3><p>모든 문장을 완벽히 이해하기보다 핵심 동사와 주제를 먼저 잡아보세요.</p></div></section><section><span>${icon("check",18)}</span><div><h3>추천 루틴</h3><p>제목 읽기 → 핵심 문장 읽기 → 해석 확인 → 표현 3개 체크</p></div></section><section class="news-complete-box"><button class="primary ${isDone ? "done" : ""}" type="button" data-news-complete ${isDone ? "disabled" : ""}>${icon("check",17)} ${isDone ? "오늘 학습 완료됨" : "오늘 학습 완료"}</button><button class="secondary" type="button" data-news-undo ${!isDone ? "disabled" : ""}>완료 해제</button><p aria-live="polite">${isDone ? "완료 상태와 최근 학습 시간이 저장되었습니다." : "짧은 뉴스를 학습한 뒤 완료해주세요."}</p></section></aside>
      </section>
      <div class="news-library-section-title"><div><p class="eyebrow">MORE ARTICLES</p><h3>더 많은 기사 학습하기</h3></div><span>검색과 필터로 원하는 기사를 찾아보세요.</span></div>
      <div class="news-library-controls">
        <label><span class="sr-only">기사 검색</span><input type="search" data-news-search value="${state.newsSearch}" placeholder="제목, 요약, 카테고리 검색"></label>
        <label><span class="sr-only">카테고리 선택</span><select data-news-category><option value="all">전체 카테고리</option>${categories.map(category => `<option value="${category}" ${state.newsCategory === category ? "selected" : ""}>${category}</option>`).join("")}</select></label>
        <label><span class="sr-only">정렬 기준</span><select data-news-sort><option value="latest" ${state.newsSort === "latest" ? "selected" : ""}>최신순</option><option value="title" ${state.newsSort === "title" ? "selected" : ""}>제목순</option><option value="category" ${state.newsSort === "category" ? "selected" : ""}>카테고리순</option></select></label>
      </div>
      ${articles.length ? `<div class="news-library-grid">${articles.map(article => { const originalIndex = articleLibrary.findIndex(item => item.id === article.id); return `<article class="news-library-card" data-open-news="${originalIndex}"><img src="${article.image}" alt="${article.title}" loading="lazy"><div><p><span>${article.source}</span><b>${article.category}</b><time>${article.date}</time></p><h3>${article.title}</h3><em>${article.dek}</em><footer><span>학습 문장 ${article.sentences.length}개</span><button type="button">기사 열기 ${icon("arrow",15)}</button></footer></div></article>`; }).join("")}</div><div class="news-library-empty" data-news-live-empty hidden><b>조건에 맞는 기사가 없습니다.</b><span>검색어 또는 카테고리를 다시 조정해 주세요.</span></div>` : `<div class="news-library-empty"><b>조건에 맞는 기사가 없습니다.</b><span>검색어 또는 카테고리를 다시 조정해 주세요.</span></div>`}
    </section>
    <p class="source-note">※ 기사 전문을 복제하지 않고 개인 영어 학습용으로 재구성한 콘텐츠입니다.</p>
  </main>`;
}

function articleView() {
  return featuredArticleView();
}

function featuredArticleView() {
  const article = articleLibrary[state.newsIndex] || articleData;
  const selectedIndex = state.translatedSentence;
  const selected = selectedIndex === null ? null : article.sentences[selectedIndex];

  return `${header("영어 뉴스")}<main class="article-study-page">
    <div class="article-study-toolbar">
      <button id="goLibraryButton" class="button ghost" type="button" data-back-news>← 기사 목록으로</button>
      <div><a href="${article.originalUrl}" target="_blank" rel="noopener noreferrer">원문 사이트 보기</a><button type="button" data-copy-article-title>제목 복사</button></div>
    </div>
    <div class="article-study-layout">
      <article class="article-study-shell">
        <header class="article-study-header"><div class="article-study-meta"><span>${article.source}</span><i>·</i><b>${article.category}</b><i>·</i><time>${article.date}</time></div><h1>${article.title}</h1><p>${article.dek}</p></header>
        <div class="article-study-body">
          <figure><img id="articleImage" class="hero-image" src="${article.image}" alt="기사 대표 이미지: ${article.title}" loading="lazy"><figcaption>${article.caption}</figcaption></figure>
          <section class="article-study-summary" aria-labelledby="article-summary-title"><span id="article-summary-title">SUMMARY</span>${article.summary.map(paragraph => `<p>${paragraph}</p>`).join("")}</section>
          <div class="article-study-guide">아래 문장을 클릭하면 오른쪽 패널에 <b>자연스러운 한국어 번역</b>, <b>핵심 표현</b>, <b>학습 포인트</b>가 표시됩니다.</div>
          <section aria-labelledby="article-sentences-title"><h2 id="article-sentences-title">ARTICLE SENTENCES</h2><div class="article-study-sentences">${article.sentences.map((item, index) => `<button class="${selectedIndex === index ? "active" : ""}" type="button" data-article-sentence="${index}"><i>${index + 1}</i><span><b>${item.en}</b><small>클릭하여 번역 · 표현 · 학습 포인트 보기</small></span></button>`).join("")}</div></section>
          <div class="article-study-actions"><a href="${article.originalUrl}" target="_blank" rel="noopener noreferrer">원문 사이트 열기</a><button type="button" data-copy-selected-sentence>선택 문장 복사</button><span id="article-copy-status" role="status" aria-live="polite"></span></div>
          <p class="article-study-disclaimer">학습용으로 재구성한 영문 콘텐츠입니다. 매체명은 학습 출처 참고를 위한 표기이며 기사 전문을 복제하지 않습니다.</p>
        </div>
      </article>

      <aside class="article-study-side">
        <div class="article-study-side-head"><h2>문장 학습 패널</h2><p>본문 문장을 선택하면 번역과 주요 표현, 해설을 확인할 수 있습니다.</p></div>
        <div class="article-study-side-body">${selected ? `<div class="article-translation-card"><section><strong>SELECTED SENTENCE</strong><p>${selected.en}</p></section><section><strong>KOREAN TRANSLATION</strong><p>${selected.ko}</p></section><section><strong>LEARNING NOTE</strong><p>${selected.note}</p></section><section><strong>KEY EXPRESSIONS</strong><div>${selected.expressions.map(expression => `<article><b>${expression.term}</b><span>${expression.meaning}</span></article>`).join("")}</div></section></div>` : `<div class="article-study-empty">${icon("message",32)}<b>문장을 선택해 주세요</b><span>선택한 문장의 번역과 표현 설명이<br>이곳에 표시됩니다.</span></div>`}</div>
      </aside>
    </div>
  </main>`;
}

function blogPage() {
  const featured = favoriteBlogPosts[new Date().getDate() % favoriteBlogPosts.length];
  return `${header("최애 블로그")}<main class="blog-page"><section class="blog-hero"><div><p class="eyebrow">MY FAVORITE BLOG</p><span class="blog-kicker">LET'S LE ENGLISH</span><h2>렛츠링글리쉬에서<br>오늘의 표현을 만나요.</h2><p>영어가 필요한 일상에 도움을 주는 표현을<br>하루에 하나씩 가볍게 꺼내 읽어보세요.</p><a href="${BLOG_URL}" target="_blank" rel="noopener noreferrer">네이버 블로그 바로가기 ${icon("arrow",16)}</a></div><div class="hero-note"><span>TODAY'S PICK</span><b>${featured.phrase}</b><em>${featured.meaning}</em><p>${featured.note}</p></div></section>
  <section class="blog-section"><div class="blog-section-head"><div><p class="eyebrow">DAILY ARCHIVE</p><h2>매일 꺼내 보는 영어 표현</h2></div><p>카드를 누르면 렛츠링글리쉬 블로그 원문으로 이동해요.</p></div><div class="blog-grid">${favoriteBlogPosts.map((post,i)=>`<a class="blog-card ${post.color}" href="${BLOG_URL}" target="_blank" rel="noopener noreferrer"><div class="blog-card-top"><span>${post.category}</span>${icon("arrow",17)}</div><div class="blog-number">0${i+1}</div><h3>${post.phrase}</h3><strong>${post.meaning}</strong><p>${post.note}</p><time>${post.date}</time></a>`).join("")}</div></section>
  <section class="blog-source"><span class="blog-source-mark">L</span><div><b>렛츠링글리쉬어학원</b><p>제주 영어 회화 · 오픽 · 토익스피킹</p></div><a href="${BLOG_URL}" target="_blank" rel="noopener noreferrer">@letsleenglish ${icon("chevron",15)}</a></section></main>`;
}

function dramaPage() {
  const youtubeEmbedUrl = makeYouTubeEmbedUrl(videoId);
  const isDone = Boolean(homeStudyState.checked.drama);
  const dramaMeta = syncHomeAppState().items.drama || {};
  const expressionCards = dramaExpressions.map((item, index) => `
    <article class="drama-expression-card">
      <span>EXPRESSION ${String(index + 1).padStart(2, "0")}</span>
      <h3>${item.expression}</h3>
      <strong>${item.meaning}</strong>
      <p>${item.example}</p>
    </article>`).join("");

  const shadowingItems = dramaShadowingPoints.map((item, index) => `
    <label class="drama-check" for="drama-check-${index}">
      <input id="drama-check-${index}" type="checkbox">
      <span><b>${item.title}</b><small>${item.description}</small></span>
    </label>`).join("");

  return `${header("미드학습")}<main class="drama-page">
    <section class="drama-section" aria-labelledby="drama-video-title">
      <div class="drama-section-head"><div><p class="eyebrow">TODAY'S VIDEO</p><h2 id="drama-video-title">오늘의 추천 영상</h2></div><p>원본 영상은 YouTube 공식 플레이어로 재생됩니다.</p></div>
      <div class="drama-video-card">
        <div class="drama-video-frame">${youtubeEmbedUrl ? `<iframe id="youtubePlayer" title="오늘의 영어 쉐도잉 추천 YouTube 영상" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : `<div class="drama-video-error" role="alert">올바른 YouTube 영상 ID 또는 주소를 입력해 주세요.</div>`}</div>
        <div class="drama-video-tips">
          <div><i>01</i><p><b>학습 팁</b><span>10~20초 단위로 끊어 듣고 따라 말해보세요.</span></p></div>
          <div><i>02</i><p><b>권장 루틴</b><span>듣기 1회 → 자막 보기 → 쉐도잉 3회 → 표현 복습</span></p></div>
        </div>
      </div>
    </section>

    <section class="drama-section drama-scene-section" aria-labelledby="drama-scene-title">
      <div class="drama-section-head"><div><p class="eyebrow">TODAY'S SCENE</p><h2 id="drama-scene-title">오늘의 한 장면</h2></div><p>상황과 감정을 떠올리며 자연스럽게 말해보세요.</p></div>
      <div class="drama-scene-study"><article class="drama-scene-card"><div class="drama-scene-quote"><div><span>KEY LINE</span><h3>“You’ve got to be kidding me.”</h3><p>설마, 농담하는 거지.</p></div><button type="button" data-speak="You've got to be kidding me." aria-label="오늘의 미드 대사 발음 듣기">${icon("volume",20)}</button></div><div class="drama-scene-block"><b>표현 설명</b><p><strong>You’ve got to be kidding me</strong>는 놀람, 당황 또는 믿기 어려운 상황에서 자주 사용하는 표현입니다.</p></div><div class="drama-scene-block"><b>비슷한 표현</b><div><button type="button" data-speak="No way.">No way.</button><button type="button" data-speak="Are you serious?">Are you serious?</button><button type="button" data-speak="You can't be serious.">You can’t be serious.</button></div></div><div class="drama-scene-block"><b>연습 팁</b><p>단어만 또박또박 읽기보다 놀란 감정을 살려 말하면 실제 대사처럼 훨씬 자연스럽게 들립니다.</p></div></article>
        <aside class="drama-scene-guide"><section class="drama-status-card"><span>${icon("calendar",18)}</span><div><h3>학습 상태</h3><b class="drama-status-badge ${isDone ? "done" : "todo"}">${isDone ? icon("check",12) : ""}${isDone ? "완료됨" : "진행 전"}</b><p>${dramaMeta.lastStudiedAt ? `최근 학습 · ${dramaMeta.lastStudiedAt}` : "최근 학습 기록 없음"}</p></div></section><section><span>${icon("play",18)}</span><div><h3>추천 루틴</h3><p>대사 듣기 → 의미 이해 → 감정을 넣어 3번 말하기</p></div></section><section><span>${icon("spark",18)}</span><div><h3>오늘의 포인트</h3><p>미드 표현은 직역보다 상황에서 어떤 느낌으로 쓰이는지 익히는 것이 중요해요.</p></div></section><section class="drama-complete-box"><button class="primary ${isDone ? "done" : ""}" type="button" data-drama-complete ${isDone ? "disabled" : ""}>${icon("check",17)} ${isDone ? "오늘 학습 완료됨" : "오늘 학습 완료"}</button><button class="secondary" type="button" data-drama-undo ${!isDone ? "disabled" : ""}>완료 해제</button><p aria-live="polite">${isDone ? "완료 상태와 최근 학습 시간이 저장되었습니다." : "영상과 대사를 연습한 뒤 완료해주세요."}</p></section></aside>
      </div>
    </section>

    <section class="drama-section" aria-labelledby="drama-expression-title">
      <div class="drama-section-head"><div><p class="eyebrow">KEY EXPRESSIONS</p><h2 id="drama-expression-title">오늘의 표현</h2></div><p>소리 내어 읽고 내 문장으로 바꿔보세요.</p></div>
      <div class="drama-expression-grid">${expressionCards}</div>
    </section>

    <section class="drama-section" aria-labelledby="drama-review-title">
      <div class="drama-section-head"><div><p class="eyebrow">PRACTICE &amp; REVIEW</p><h2 id="drama-review-title">쉐도잉 포인트 &amp; 복습</h2></div><p>오늘의 학습을 차근차근 마무리하세요.</p></div>
      <div class="drama-practice-grid">
        <article class="drama-practice-card"><h3>쉐도잉 포인트</h3><p>완료한 항목을 하나씩 체크해보세요.</p><div class="drama-check-list">${shadowingItems}</div></article>
        <article class="drama-practice-card"><h3>복습 메모</h3><p>헷갈린 발음이나 기억할 표현을 기록하세요.</p><label class="drama-memo-label" for="drama-memo">오늘의 학습 메모</label><textarea id="drama-memo" placeholder="예: 'kind of'가 빠르게 발음될 때 소리 변화에 주의하기"></textarea><div class="drama-memo-actions"><span id="drama-save-status" role="status" aria-live="polite"></span><button id="drama-save-memo" type="button">메모 저장</button></div></article>
      </div>
    </section>

    <footer class="drama-footer"><p>This page is for personal study use.</p><p>Embedded videos are played via YouTube official embed.</p></footer>
  </main>`;
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
  const type = dailyTestState.active;
  const scores = dailyTestState.scores;
  const isDashboardDone = Boolean(homeStudyState.checked.test);
  const testMeta = syncHomeAppState().items.dailytest || {};
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
    <section class="daily-quick-test" aria-labelledby="quick-test-title"><div class="daily-quick-head"><div><p class="eyebrow">2-MINUTE QUICK CHECK · ${todayKey}</p><h2 id="quick-test-title">오늘의 빠른 점검</h2><span>오늘의 단어와 매일 1문장에서 자동 출제된 새로운 문제예요.</span></div><b>2 QUESTIONS</b></div><div class="daily-quick-status"><b class="${isDashboardDone ? "done" : "todo"}">${isDashboardDone ? icon("check",12) : ""}${isDashboardDone ? "완료됨" : "진행 전"}</b><span>${testMeta.lastStudiedAt ? `최근 학습 · ${testMeta.lastStudiedAt}` : "최근 학습 기록 없음"}</span><span data-daily-score-meta>${testMeta.score !== null && testMeta.score !== undefined ? `최근 점수 · ${testMeta.score}` : "점수 기록 없음"}</span><button type="button" data-daily-undo ${!isDashboardDone ? "disabled" : ""}>완료 해제</button></div><div class="daily-quick-grid">${quickQuestions.map((question, questionIndex) => `<fieldset><legend><small>${question.category}</small>${questionIndex + 1}. <strong>${question.prompt}</strong> ${question.question}</legend>${question.choices.map((choice, choiceIndex) => `<label><input type="radio" name="quick-q${questionIndex + 1}" value="${choiceIndex}"><span>${choice}</span></label>`).join("")}</fieldset>`).join("")}</div><div class="daily-quick-actions"><button type="button" data-quick-grade>빠른 점검 채점하기</button><p class="${dailyQuickTestState.score === 2 ? "perfect" : ""}" data-quick-result role="status" aria-live="polite">${dailyQuickTestState.graded ? `점수: ${dailyQuickTestState.score} / 2` : ""}</p><button class="complete ${isDashboardDone ? "done" : ""}" type="button" data-daily-complete ${!dailyQuickTestState.graded && !isDashboardDone ? "hidden" : ""} ${isDashboardDone ? "disabled" : ""}>${icon("check",16)} ${isDashboardDone ? "Daily Test 완료됨" : "학습 완료 처리"}</button></div></section>

    <nav class="test-tabs" aria-label="Daily Test 유형">${tabs.map(([key, label]) => `<button class="${type === key ? "active" : ""}" type="button" data-test-tab="${key}">${label}</button>`).join("")}</nav>
    ${pageContent}
  </main>`;
}

function dailyTestScoreCard(scores) {
  return `<section class="panel test-score-card"><div class="test-card-head"><div><p class="eyebrow">MY SCORE</p><h2>오늘의 점수</h2></div></div><div class="test-score-list"><div><span>RC 정답 수</span><b id="test-score-rc">${scores.rcCorrect} / ${scores.rcTotal}</b></div><div><span>단어 정답 수</span><b id="test-score-vocab">${scores.vocabCorrect} / ${scores.vocabTotal}</b></div><div><span>문장 정답 수</span><b id="test-score-sentence">${scores.sentenceCorrect} / ${scores.sentenceTotal}</b></div></div><button class="test-reset" type="button" data-test-reset>오늘 점수 초기화</button><p id="test-score-status" class="test-score-status" role="status" aria-live="polite"></p></section>`;
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
  try { localStorage.setItem(DAILY_TEST_HISTORY_KEY, JSON.stringify(history)); } catch {}

  if (!isCorrect) {
    const notes = getWrongNotes();
    if (!notes[type].some(item => item.id === current.id)) notes[type].push(current);
    try { localStorage.setItem(DAILY_TEST_WRONG_KEY, JSON.stringify(notes)); } catch {}
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

function quizPage() {
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
  const isDashboardDone = Boolean(homeStudyState.checked.quiz);

  const choiceMarkup = question ? question.choices.map((choice, choiceIndex) => {
    const showResult = Boolean(solved) || quizState.answerVisible;
    const className = showResult && choiceIndex === question.answer ? "correct" : solved && choiceIndex === solved.selected && !solved.correct ? "wrong" : "";
    return `<button class="quiz-choice ${className}" type="button" data-quiz-choice="${choiceIndex}" ${solved ? "disabled" : ""}>${choiceIndex + 1}. ${escapeMarkup(choice)}</button>`;
  }).join("") : "";

  const resultMarkup = solved ? `<div class="quiz-result ${solved.correct ? "good" : "bad"}"><b>${solved.correct ? "정답입니다." : "오답입니다."}</b>${quizState.examMode ? "" : `<span>정답: ${question.answer + 1}번<br>해설: ${escapeMarkup(question.explanation || "-")}</span>`}</div>` : quizState.answerVisible && question ? `<div class="quiz-result good"><b>정답: ${question.answer + 1}번</b>${quizState.examMode ? "" : `<span>해설: ${escapeMarkup(question.explanation || "-")}</span>`}</div>` : "";

  return `${header("영어 문제 풀이")}<main class="quiz-page ${quizState.darkMode ? "dark" : ""}">
    <section class="quiz-topbar compact"><div class="quiz-actions"><label>CSV 업로드<input type="file" data-quiz-csv accept=".csv"></label><button type="button" data-quiz-mode>${quizState.examMode ? "시험 모드" : "학습 모드"}</button><button type="button" data-quiz-retry>오답 다시풀기</button><button type="button" data-quiz-dark>${quizState.darkMode ? "라이트모드" : "다크모드"}</button><button class="warn" type="button" data-quiz-reset>기록 초기화</button></div></section>
    <section class="quiz-written-check" aria-labelledby="quiz-written-title"><div class="quiz-written-head"><div><p class="eyebrow">TODAY'S WRITTEN CHECK</p><h3 id="quiz-written-title">오늘의 주관식 마무리</h3><span>답을 직접 입력하며 오늘 배운 문장과 단어를 정리해보세요.</span></div><b>2 QUESTIONS</b></div><div class="quiz-written-grid"><label><span>1. 빈칸에 알맞은 표현을 입력하세요.</span><strong>I’m getting used to ______ English every day.</strong><input type="text" data-written-answer="1" placeholder="정답 입력" autocomplete="off"></label><label><span>2. <b>maintain</b>의 뜻을 한글로 입력하세요.</span><strong>maintain = ?</strong><input type="text" data-written-answer="2" placeholder="정답 입력" autocomplete="off"></label></div><div class="quiz-written-actions"><button type="button" data-written-grade>주관식 정답 확인</button><div data-written-result role="status" aria-live="polite">${quizQuickState.graded ? `<b>점수: ${quizQuickState.score} / 2</b>${quizQuickState.feedback.map(item => `<span>${item}</span>`).join("")}` : ""}</div><button class="complete ${isDashboardDone ? "done" : ""}" type="button" data-quiz-dashboard-complete ${!quizQuickState.graded && !isDashboardDone ? "hidden" : ""}>${icon("check",16)} ${isDashboardDone ? "영어 문제 풀이 완료됨" : "학습 완료 처리"}</button></div></section>
    <section class="quiz-dashboard"><article><span>전체 문제 수</span><b>${total}</b></article><article><span>푼 문제 수</span><b>${solvedCount}</b></article><article><span>정답 수</span><b>${correctCount}</b></article><article><span>오늘 푼 문제 수</span><b>${todayCount}</b></article></section>
    <section class="quiz-progress-card"><div><b>진행률</b><span>${solvedCount} / ${total} (${progress}%)</span></div><i><b style="width:${progress}%"></b></i></section>
    <section class="quiz-toolbar"><input type="search" data-quiz-search value="${escapeMarkup(quizState.search)}" placeholder="문제 검색 (질문 / 해설 / 선택지)"><select data-quiz-filter><option value="all">전체 보기</option><option value="unsolved" ${quizState.filter === "unsolved" ? "selected" : ""}>안 푼 문제</option><option value="solved" ${quizState.filter === "solved" ? "selected" : ""}>푼 문제</option><option value="wrong" ${quizState.filter === "wrong" ? "selected" : ""}>오답 문제</option></select></section>
    <div class="quiz-layout">
      <section class="quiz-question-card">${question ? `<div class="quiz-meta"><span>${quizState.examMode ? "시험 모드" : "학습 모드"}</span><span>문제 ${quizState.current + 1} / ${filtered.length}</span>${solved ? `<span class="done">✓ 이미 풂</span>` : ""}</div><h3>${escapeMarkup(question.question)}</h3><div class="quiz-choices">${choiceMarkup}</div>${resultMarkup}<div class="quiz-navigation"><button type="button" data-quiz-prev>이전</button><button type="button" data-quiz-next>다음</button><button class="primary" type="button" data-quiz-answer>정답 확인</button></div>` : `<div class="quiz-no-question"><b>조건에 맞는 문제가 없습니다.</b><span>검색어 또는 필터를 변경해 주세요.</span></div>`}</section>
      <aside class="quiz-side"><section><h3>관련 영상</h3><div class="quiz-video-box">${quizVideoMarkup(question)}</div></section><section><h3>오답노트</h3><div class="quiz-wrong-list">${quizState.wrongSet.length ? quizState.wrongSet.map(index => { const item = quizState.questions[index]; return item ? `<article><b>${escapeMarkup(item.question)}</b><div><button type="button" data-quiz-go="${index}">이 문제 보기</button><button type="button" data-quiz-retry-one="${index}">다시 풀기</button><button type="button" data-quiz-remove-wrong="${index}">제외</button></div></article>` : ""; }).join("") : `<p>오답 문제가 없습니다.</p>`}</div></section></aside>
    </div>
  </main>`;
}

function sentencePage() {
  const isDone = Boolean(homeStudyState.checked.sentence);
  const sentenceMeta = syncHomeAppState().items.sentence || {};
  const pageSize = 5;
  const pageCount = Math.ceil(sentenceLessons.length / pageSize);
  const todayKey = localDateKey();
  if (localStorage.getItem("value_time_sentence_page_date") !== todayKey) {
    const todaySentenceIndex = Math.abs(dateSeed(todayKey)) % sentenceLessons.length;
    state.sentencePage = Math.floor(todaySentenceIndex / pageSize);
    localStorage.setItem("value_time_sentence_page_date", todayKey);
    localStorage.setItem("value_time_sentence_page", String(state.sentencePage));
  }
  state.sentencePage = Math.min(Math.max(state.sentencePage, 0), pageCount - 1);
  const pageSentences = sentenceLessons.slice(state.sentencePage * pageSize, (state.sentencePage + 1) * pageSize);
  const allClearCount = pageSentences.filter(item => state.understoodSentences.includes(item.id) && state.clearedSentences.includes(item.id)).length;
  const pageGroupStart = Math.floor(state.sentencePage / 10) * 10;
  const visiblePages = Array.from({ length: Math.min(10, pageCount - pageGroupStart) }, (_, index) => pageGroupStart + index);
  const savedSentenceItems = state.savedSentences.map(id => sentenceLessons.find(item => item.id === id)).filter(Boolean).slice(-5);
  const representativeSentence = pageSentences[0];
  const additionalSentences = pageSentences.slice(1);
  const sentenceCard = (lesson, index, featured = false) => {
    const understood = state.understoodSentences.includes(lesson.id);
    const spoken = state.clearedSentences.includes(lesson.id);
    const saved = state.savedSentences.includes(lesson.id);
    const allClear = understood && spoken;
    return `<article class="sentence-today-item ${featured ? "sentence-featured-item" : ""} ${understood ? "understood" : ""} ${spoken ? "spoken" : ""} ${allClear ? "all-clear" : ""}" data-sentence-card="${lesson.id}">
      <div class="sentence-today-top"><span>${featured ? "TODAY" : String(state.sentencePage * pageSize + index + 1).padStart(4, "0")}</span><em>${lesson.category}</em><div><button class="sentence-understand-toggle ${understood ? "active" : ""}" type="button" data-understand-sentence="${lesson.id}" aria-pressed="${understood}">${icon("check",13)} Meaning Clear</button><button class="sentence-save-toggle ${saved ? "active" : ""}" type="button" data-save-sentence="${lesson.id}" aria-pressed="${saved}" aria-label="문장 ${saved ? "저장 취소" : "저장"}">${icon("bookmark",17)}</button></div></div>
      <div class="sentence-today-title"><h4>${lesson.en}</h4><button type="button" data-speak="${lesson.en}" aria-label="영어 문장 듣기">${icon("volume",19)}</button></div><p>${lesson.ko}</p>
      <div class="sentence-pattern-box"><span>${icon("spark",15)}</span><div><b>${lesson.pattern}</b><p>${lesson.meaning}</p></div></div>
      <button class="sentence-speaking-clear ${spoken ? "active" : ""}" type="button" data-clear-sentence="${lesson.id}" aria-pressed="${spoken}">${icon("check",14)} Sentence Clear</button>
      <a href="${lesson.sourceUrl}" target="_blank" rel="noopener noreferrer">출처 안내 · ${lesson.source} ${icon("arrow",12)}</a>
    </article>`;
  };

  return `${header("매일 1문장")}<main class="sentence-dashboard-page">
    <div class="sentence-dashboard-layout">
      <section class="sentence-learning-panel">
        <div class="sentence-list-head"><div><h3>오늘 외울 대표 문장</h3><p>상단 문장 하나를 먼저 듣고, 뜻을 이해한 뒤 소리 내어 말해보세요.</p></div><b>${pageSentences.length} SENTENCES · <span data-sentence-clear-count>${allClearCount}</span> ALL CLEAR</b></div>
        <div class="sentence-featured-list">${representativeSentence ? sentenceCard(representativeSentence, 0, true) : ""}</div>
        <div class="sentence-library-head"><h3>문장 목록</h3><p>대표 문장 학습 후 다양한 패턴의 문장을 이어서 익혀보세요.</p></div>
        <div class="sentence-today-list sentence-library-list">${additionalSentences.map((lesson, index) => sentenceCard(lesson, index + 1)).join("")}</div>
        <nav class="sentence-page-navigation" aria-label="TOEIC 문장 목록 페이지 이동"><button class="sentence-page-edge" type="button" data-sentence-target="0" ${state.sentencePage === 0 ? "disabled" : ""} aria-label="첫 페이지로 이동">&laquo;</button><button class="sentence-page-edge" type="button" data-sentence-target="${Math.max(0, state.sentencePage - 1)}" ${state.sentencePage === 0 ? "disabled" : ""} aria-label="이전 페이지로 이동">&lsaquo;</button><span class="sentence-page-numbers">${visiblePages.map(pageIndex => `<button class="${pageIndex === state.sentencePage ? "active" : ""}" type="button" data-sentence-target="${pageIndex}" ${pageIndex === state.sentencePage ? 'aria-current="page"' : ""}>${pageIndex + 1}</button>`).join("")}</span><button class="sentence-page-edge" type="button" data-sentence-target="${Math.min(pageCount - 1, state.sentencePage + 1)}" ${state.sentencePage === pageCount - 1 ? "disabled" : ""} aria-label="다음 페이지로 이동">&rsaquo;</button><button class="sentence-page-edge" type="button" data-sentence-target="${pageCount - 1}" ${state.sentencePage === pageCount - 1 ? "disabled" : ""} aria-label="마지막 페이지로 이동">&raquo;</button><small>${state.sentencePage + 1} / ${pageCount} 페이지</small></nav>
      </section>
      <aside class="sentence-dashboard-side">
        <section class="sentence-status-card"><span class="sentence-side-icon">${icon("calendar",18)}</span><div><h3>학습 상태</h3><b class="sentence-status-badge ${isDone ? "done" : "todo"}">${isDone ? icon("check",12) : ""}${isDone ? "완료됨" : "진행 전"}</b><p>${sentenceMeta.lastStudiedAt ? `최근 학습 · ${sentenceMeta.lastStudiedAt}` : "최근 학습 기록 없음"}</p></div></section>
        <section class="sentence-saved-summary"><span class="sentence-side-icon">${icon("bookmark",18)}</span><div><h3>저장한 문장</h3><strong>${state.savedSentences.length}</strong><p>${savedSentenceItems.length ? savedSentenceItems.map(item => `<button type="button" data-speak="${item.en}" title="문장 듣기">#${item.rank} ${icon("volume",11)}</button>`).join("") : "북마크 버튼으로 중요한 문장을 저장해보세요."}</p></div></section>
        <section><span class="sentence-side-icon">${icon("message",18)}</span><div><h3>오늘의 학습 가이드</h3><p>문장을 듣고 뜻을 이해한 뒤, 화면을 덜 보며 자연스럽게 말할 수 있을 때 각각 Clear해보세요.</p></div></section>
        <section><span class="sentence-side-icon">${icon("check",18)}</span><div><h3>데이터 안내</h3><p>업무·일정·회의·고객 응대 중심의 TOEIC형 자체 제작 문장 1,000개가 200페이지에 저장되어 있습니다.</p></div></section>
        <section class="sentence-complete-box"><button class="primary ${isDone ? "done" : ""}" type="button" data-sentence-complete ${isDone ? "disabled" : ""}>${icon("check",17)} ${isDone ? "오늘 학습 완료됨" : "오늘 학습 완료"}</button><button class="secondary" type="button" data-sentence-undo ${!isDone ? "disabled" : ""}>완료 해제</button><p aria-live="polite">${isDone ? "완료 상태와 최근 학습 시간이 저장되었습니다." : "문장을 충분히 연습했다면 완료해주세요."}</p></section>
      </aside>
    </div>
  </main>`;
}

function placeholderPage() {
  const map={words:["나의 단어장","저장한 단어와 오늘의 핵심 어휘를 복습해요."],sentence:["매일 1문장","한 문장을 깊이 이해하고 내 표현으로 만들어요."],journal:["나만의 학습장","오늘 배운 것을 기록하고 체크해요."]};
  const [title]=map[state.page]; return `${header(title)}<main class="journal-page"><div class="placeholder-grid">${wordCard()}${checklist("2026-07-13")}</div></main>`;
}

const KIDS_BASE_WORDS = [
  { word:"apple", meaning:"사과", example:"I like apples.", emoji:"🍎", imageUrl:"https://loremflickr.com/640/420/red,apple,fruit?lock=11", imageType:"photo", imageReviewed:true },
  { word:"happy", meaning:"행복한", example:"I am happy today.", emoji:"😊", imageType:"illustration", imageReviewed:false },
  { word:"school", meaning:"학교", example:"I go to school.", emoji:"🏫", imageUrl:"https://loremflickr.com/640/420/school,building?lock=13", imageType:"photo", imageReviewed:true },
  { word:"rabbit", meaning:"토끼", example:"The rabbit can jump.", emoji:"🐰", imageUrl:"https://loremflickr.com/640/420/rabbit,animal?lock=14", imageType:"photo", imageReviewed:true },
  { word:"blue", meaning:"파란색", example:"The sky is blue.", emoji:"💙", imageType:"illustration", imageReviewed:false },
  { word:"family", meaning:"가족", example:"I love my family.", emoji:"👨‍👩‍👧", imageUrl:"https://loremflickr.com/640/420/family,people?lock=16", imageType:"photo", imageReviewed:true },
  { word:"book", meaning:"책", example:"This is my book.", emoji:"📘", imageUrl:"https://loremflickr.com/640/420/book,reading?lock=17", imageType:"photo", imageReviewed:true },
  { word:"friend", meaning:"친구", example:"You are my friend.", emoji:"🤝", imageUrl:"https://loremflickr.com/640/420/friends,children?lock=18", imageType:"photo", imageReviewed:true },
  { word:"water", meaning:"물", example:"I drink water.", emoji:"💧", imageUrl:"https://loremflickr.com/640/420/water,glass?lock=19", imageType:"photo", imageReviewed:true },
  { word:"star", meaning:"별", example:"I see a star.", emoji:"⭐", imageUrl:"https://loremflickr.com/640/420/stars,night,sky?lock=20", imageType:"photo", imageReviewed:true },
  { word:"run", meaning:"달리다", example:"I can run fast.", emoji:"🏃", imageType:"illustration", imageReviewed:false },
  { word:"music", meaning:"음악", example:"I like music.", emoji:"🎵", imageType:"illustration", imageReviewed:false },
];
const kidsPhotoAsset = (query, lock, category = "object") => ({
  imageUrl: `https://loremflickr.com/640/420/${query}?lock=${lock}`,
  imageType: "photo",
  imageReviewed: true,
  category,
});
const KIDS_CORE_PHOTO_IMAGES = {
  // MVP photo mapping rule: one clear object/animal/food/vehicle, simple background, child-recognizable.
  apple: kidsPhotoAsset("red,apple,fruit", 101, "fruit"),
  school: kidsPhotoAsset("school,building", 102, "place"),
  rabbit: kidsPhotoAsset("rabbit,animal", 103, "animal"),
  family: kidsPhotoAsset("family,people", 104, "people"),
  book: kidsPhotoAsset("book,reading", 105, "school"),
  friend: kidsPhotoAsset("friends,children", 106, "people"),
  water: kidsPhotoAsset("glass,water", 107, "food"),
  star: kidsPhotoAsset("stars,night,sky", 108),
  dog: kidsPhotoAsset("dog,animal", 109, "animal"),
  cat: kidsPhotoAsset("cat,animal", 110, "animal"),
  bird: kidsPhotoAsset("bird,animal", 111, "animal"),
  fish: kidsPhotoAsset("fish,animal", 112, "animal"),
  horse: kidsPhotoAsset("horse,animal", 113, "animal"),
  cow: kidsPhotoAsset("cow,animal", 114, "animal"),
  lion: kidsPhotoAsset("lion,animal", 115, "animal"),
  tiger: kidsPhotoAsset("tiger,animal", 116, "animal"),
  bear: kidsPhotoAsset("bear,animal", 117, "animal"),
  elephant: kidsPhotoAsset("elephant,animal", 118, "animal"),
  monkey: kidsPhotoAsset("monkey,animal", 119, "animal"),
  duck: kidsPhotoAsset("duck,bird", 120, "animal"),
  chicken: kidsPhotoAsset("chicken,bird", 121, "animal"),
  tree: kidsPhotoAsset("tree,nature", 122, "nature"),
  flower: kidsPhotoAsset("flower,plant", 123, "nature"),
  sun: kidsPhotoAsset("sun,sky", 124, "nature"),
  moon: kidsPhotoAsset("moon,night,sky", 125, "nature"),
  car: kidsPhotoAsset("car,vehicle", 126, "vehicle"),
  bus: kidsPhotoAsset("bus,vehicle", 127, "vehicle"),
  train: kidsPhotoAsset("train,vehicle", 128, "vehicle"),
  bicycle: kidsPhotoAsset("bicycle,vehicle", 129, "vehicle"),
  ball: kidsPhotoAsset("ball,toy", 130, "toy"),
  chair: kidsPhotoAsset("chair,furniture", 131, "furniture"),
  table: kidsPhotoAsset("table,furniture", 132, "furniture"),
  bed: kidsPhotoAsset("bed,furniture", 133, "furniture"),
  bag: kidsPhotoAsset("bag,school", 134, "school"),
  pencil: kidsPhotoAsset("pencil,stationery", 135, "school"),
  pen: kidsPhotoAsset("pen,stationery", 136, "school"),
  ruler: kidsPhotoAsset("ruler,stationery", 137, "school"),
  eraser: kidsPhotoAsset("eraser,stationery", 138, "school"),
  cup: kidsPhotoAsset("cup,object", 139, "object"),
  plate: kidsPhotoAsset("plate,dish", 140, "food"),
  spoon: kidsPhotoAsset("spoon,cutlery", 141, "food"),
  fork: kidsPhotoAsset("fork,cutlery", 142, "food"),
  banana: kidsPhotoAsset("banana,fruit", 143, "fruit"),
  orange: kidsPhotoAsset("orange,fruit", 144, "fruit"),
  bread: kidsPhotoAsset("bread,food", 145, "food"),
  milk: kidsPhotoAsset("milk,glass", 146, "food"),
  egg: kidsPhotoAsset("egg,food", 147, "food"),
  rice: kidsPhotoAsset("rice,food", 148, "food"),
  house: kidsPhotoAsset("house,home", 149, "place"),
  door: kidsPhotoAsset("door,house", 150, "object"),
  window: kidsPhotoAsset("window,house", 151, "object"),
  shoe: kidsPhotoAsset("shoe,object", 152, "clothing"),
  hat: kidsPhotoAsset("hat,clothing", 153, "clothing"),
  shirt: kidsPhotoAsset("shirt,clothing", 154, "clothing"),
  pants: kidsPhotoAsset("pants,clothing", 155, "clothing"),
  computer: kidsPhotoAsset("computer,object", 156, "object"),
  phone: kidsPhotoAsset("phone,object", 157, "object"),
  clock: kidsPhotoAsset("clock,object", 158, "object"),
};
const KIDS_IMAGE_CATEGORY_FALLBACKS = {
  animal: kidsPhotoAsset("animal,object", 501, "animal"),
  food: kidsPhotoAsset("food,object", 502, "food"),
  fruit: kidsPhotoAsset("fruit,object", 503, "fruit"),
  vehicle: kidsPhotoAsset("vehicle,object", 504, "vehicle"),
  school: kidsPhotoAsset("school,supplies", 505, "school"),
  furniture: kidsPhotoAsset("furniture,object", 506, "furniture"),
  object: kidsPhotoAsset("single,object,white,background", 507, "object"),
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
    type: card.imageUrl ? card.imageType || "photo" : fallback.imageType || "photo",
    reviewed: Boolean(card.imageUrl ? card.imageReviewed : fallback.imageReviewed),
    alt: `${card.meaning || card.word} 사진`,
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
  return `<section class="kids-word-grid">${todayWords.map((word, index) => { const flipped = kidsFlippedWords.includes(word.word) || wordProgress.words.includes(word.word) || wordProgress.completed; const done = wordProgress.words.includes(word.word); const photo = kidsWordPhoto(word); return `<article class="kids-word-card ${flipped ? "flipped" : ""} ${done ? "done" : ""}"><div class="kids-card-front">${photo}<b>${index + 1}번 카드</b><p>사진 속 단어를 맞혀보세요.</p><button type="button" data-kids-flip="${word.word}">카드 열기</button></div><div class="kids-card-back">${photo}<h3>${word.word}</h3><strong>${word.meaning}</strong><button type="button" data-speak="${word.word}">${icon("volume",15)} 듣기</button><p>${word.example}</p><button class="primary" type="button" data-kids-word-done="${word.word}" ${done ? "disabled" : ""}>${icon("check",14)} ${done ? "찾았어요!" : "알겠어요"}</button></div></article>`; }).join("")}</section>`;
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

function render() {
  const content=audienceMode==="kids"?kidsPage(state.page):state.page==="home"?homePage():state.page==="words"?vocabularyPage():state.page==="sentence"?sentencePage():state.page==="calendar"?calendarPage():state.page==="news"?newsPage():state.page==="blog"?blogPage():state.page==="drama"?dramaPage():state.page==="test"?dailyTestPage():state.page==="quiz"?quizPage():state.page==="ted"?tedStudyPage():placeholderPage();
  document.querySelector("#app").innerHTML=`<div class="app-shell">${sidebar()}<div class="content">${content}</div></div>`;
  bindEvents();
}

function saveHistory(){localStorage.setItem("worthy_life_history",JSON.stringify(state.history));}

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
  if (page === "news" && newsIndex !== null) return `news.html#article-${newsIndex}`;
  return entryFiles[page] || `index.html#${page}`;
}

function navigateTo(page, options = {}) {
  const newsIndex = page === "news" ? (options.newsIndex ?? null) : null;
  const tedLessonId = page === "ted" ? (options.tedLessonId ?? state.tedLessonId ?? null) : null;
  const isSameScreen = state.page === page && state.newsIndex === newsIndex && state.tedLessonId === tedLessonId;

  if (page === "ted" && tedLessonId !== state.tedLessonId) state.tedSentenceIndex = 0;

  state.page = page;
  state.newsIndex = newsIndex;
  state.tedLessonId = tedLessonId;
  state.translatedSentence = null;

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
  }).filter(question => question.question && question.choices.length >= 2);
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
}

function bindEvents(){
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
    if (selectedMode === audienceMode) return;
    applyAudienceMode(selectedMode);
    if (audienceMode === "kids" && !["home","words","sentence","news","ted","drama","test","calendar"].includes(state.page)) state.page = "home";
    render();
  }));
  document.querySelector("[data-kids-intro-complete]")?.addEventListener("click", () => {
    saveChildName(document.querySelector("[data-kids-name-input]")?.value);
    showKidsIntro = false;
    try { localStorage.setItem(KIDS_INTRO_STORAGE_KEY, "true"); } catch {}
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
  document.querySelectorAll("[data-page]").forEach(el=>el.addEventListener("click",()=>navigateTo(el.dataset.page)));
  document.querySelector("[data-open-ted]")?.addEventListener("click", event => {
    navigateTo("ted", { tedLessonId: event.currentTarget.dataset.openTed });
  });
  document.querySelector("[data-ted-back]")?.addEventListener("click", () => navigateTo("home"));
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
  document.querySelectorAll("[data-article-sentence]").forEach(el=>el.addEventListener("click",()=>{state.translatedSentence=Number(el.dataset.articleSentence);render();}));
  document.querySelector("[data-copy-article-title]")?.addEventListener("click",()=>{
    const article = articleLibrary[state.newsIndex] || articleData;
    copyArticleText(article.title,"제목이 복사되었습니다.");
  });
  document.querySelector("[data-copy-selected-sentence]")?.addEventListener("click",()=>{
    const article = articleLibrary[state.newsIndex] || articleData;
    const selected = article.sentences[state.translatedSentence];
    if (selected) copyArticleText(selected.en,"선택 문장이 복사되었습니다.");
    else {
      const status = document.querySelector("#article-copy-status");
      if (status) status.textContent = "먼저 문장을 선택해 주세요.";
    }
  });
  document.querySelectorAll("[data-save]").forEach(el=>el.addEventListener("click",e=>{const w=e.currentTarget.dataset.save;state.savedWords=state.savedWords.includes(w)?state.savedWords.filter(x=>x!==w):[...state.savedWords,w];localStorage.setItem("worthy_life_words",JSON.stringify(state.savedWords));render();}));
  document.querySelectorAll("[data-known-word]").forEach(button => button.addEventListener("click", event => {
    const word = event.currentTarget.dataset.knownWord;
    const known = state.knownWords.includes(word);
    state.knownWords = known ? state.knownWords.filter(item => item !== word) : [...state.knownWords, word];
    localStorage.setItem("value_time_known_words_v1", JSON.stringify(state.knownWords));

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
    localStorage.setItem("value_time_cleared_word_sentences_v1", JSON.stringify(state.clearedWordSentences));

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
  document.querySelectorAll("[data-speaking-expression-done]").forEach(button => button.addEventListener("click", event => {
    const key = event.currentTarget.dataset.speakingExpressionDone;
    const isDone = speakingExpressionDone.includes(key);
    speakingExpressionDone = isDone ? speakingExpressionDone.filter(item => item !== key) : [...speakingExpressionDone, key];
    try { localStorage.setItem(SPEAKING_EXPRESSION_STORAGE_KEY, JSON.stringify(speakingExpressionDone)); } catch {}
    event.currentTarget.classList.toggle("active", !isDone);
    event.currentTarget.setAttribute("aria-pressed", String(!isDone));
    event.currentTarget.innerHTML = `${icon("check",12)} ${!isDone ? "완료" : "말했어요"}`;
    event.currentTarget.closest(".ted-expression-panel article")?.classList.toggle("speaking-done", !isDone);
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
    localStorage.setItem("value_time_vocab_page", String(state.vocabPage));
    localStorage.setItem("value_time_vocab_page_date", localDateKey());
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
  document.querySelector("[data-vocab-complete]")?.addEventListener("click", () => {
    homeStudyState.checked.words = true;
    saveHomeStudyState("words");
    render();
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
    localStorage.setItem("value_time_saved_sentences_v1", JSON.stringify(state.savedSentences));
    render();
  }));
  document.querySelectorAll("[data-understand-sentence]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.understandSentence;
    state.understoodSentences = state.understoodSentences.includes(id)
      ? state.understoodSentences.filter(item => item !== id)
      : [...state.understoodSentences, id];
    localStorage.setItem("value_time_understood_sentences_v1", JSON.stringify(state.understoodSentences));
    render();
  }));
  document.querySelectorAll("[data-clear-sentence]").forEach(button => button.addEventListener("click", event => {
    const id = event.currentTarget.dataset.clearSentence;
    state.clearedSentences = state.clearedSentences.includes(id)
      ? state.clearedSentences.filter(item => item !== id)
      : [...state.clearedSentences, id];
    localStorage.setItem("value_time_cleared_sentences_v1", JSON.stringify(state.clearedSentences));
    render();
  }));
  document.querySelectorAll("[data-sentence-target]").forEach(button => button.addEventListener("click", event => {
    const scrollPosition = window.scrollY;
    state.sentencePage = Number(event.currentTarget.dataset.sentenceTarget);
    localStorage.setItem("value_time_sentence_page", String(state.sentencePage));
    localStorage.setItem("value_time_sentence_page_date", localDateKey());
    render();
    window.scrollTo(0, scrollPosition);
  }));
  document.querySelector("[data-sentence-complete]")?.addEventListener("click", () => {
    homeStudyState.checked.sentence = true;
    saveHomeStudyState("sentence");
    render();
  });
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
  document.querySelector("[data-drama-complete]")?.addEventListener("click", () => {
    homeStudyState.checked.drama = true;
    saveHomeStudyState("drama");
    render();
  });
  document.querySelector("[data-drama-undo]")?.addEventListener("click", () => {
    homeStudyState.checked.drama = false;
    saveHomeStudyState("drama");
    render();
  });
  document.querySelectorAll("[data-word-nav]").forEach(el=>el.addEventListener("click",()=>{state.wordIndex=(state.wordIndex+Number(el.dataset.wordNav)+words.length)%words.length;render();}));
  document.querySelectorAll("[data-jump-word]").forEach(el=>el.addEventListener("click",()=>{const index=words.findIndex(word=>word.word===el.dataset.jumpWord);if(index>=0){state.wordIndex=index;render();}}));
  document.querySelector(".mobile-menu")?.addEventListener("click",()=>document.querySelector(".sidebar").classList.toggle("open"));
  const dramaMemo = document.querySelector("#drama-memo");
  const dramaSaveButton = document.querySelector("#drama-save-memo");
  const dramaSaveStatus = document.querySelector("#drama-save-status");
  if (dramaMemo) {
    try { dramaMemo.value = localStorage.getItem(DRAMA_MEMO_STORAGE_KEY) || ""; }
    catch { dramaSaveStatus.textContent = "저장된 메모를 불러올 수 없습니다."; }
  }
  dramaSaveButton?.addEventListener("click", () => {
    try {
      localStorage.setItem(DRAMA_MEMO_STORAGE_KEY, dramaMemo.value);
      dramaSaveStatus.textContent = "메모가 저장되었습니다.";
    } catch {
      dramaSaveStatus.textContent = "메모를 저장하지 못했습니다.";
    }
    window.setTimeout(() => { if (dramaSaveStatus) dramaSaveStatus.textContent = ""; }, 3000);
  });
  document.querySelector("[data-quick-grade]")?.addEventListener("click", () => {
    const first = document.querySelector('input[name="quick-q1"]:checked');
    const second = document.querySelector('input[name="quick-q2"]:checked');
    const result = document.querySelector("[data-quick-result]");
    if (!first || !second) {
      result.className = "error";
      result.textContent = "두 문항에 모두 답해주세요.";
      return;
    }
    const questions = getDailyQuickTestQuestions();
    const selectedAnswers = [Number(first.value), Number(second.value)];
    dailyQuickTestState.score = selectedAnswers.reduce((score, selected, index) => score + Number(selected === questions[index].answer), 0);
    dailyQuickTestState.graded = true;
    syncHomeAppState("test", `${dailyQuickTestState.score} / 2`);
    result.className = dailyQuickTestState.score === 2 ? "perfect" : "";
    const wrongExplanations = questions.filter((question, index) => selectedAnswers[index] !== question.answer).map(question => question.explanation);
    result.textContent = `점수: ${dailyQuickTestState.score} / 2${wrongExplanations.length ? `\n${wrongExplanations.join("\n")}` : "\n오늘의 내용을 정확히 기억했어요!"}`;
    const scoreMeta = document.querySelector("[data-daily-score-meta]");
    if (scoreMeta) scoreMeta.textContent = `최근 점수 · ${dailyQuickTestState.score} / 2`;
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
    saveHomeStudyState("test", dailyQuickTestState.graded ? `${dailyQuickTestState.score} / 2` : undefined);
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
    try { localStorage.setItem(DAILY_TEST_HISTORY_KEY, JSON.stringify(history)); } catch {}
    render();
    const status = document.querySelector("#test-score-status");
    if (status) status.textContent = "점수가 초기화되었습니다.";
  });
  document.querySelectorAll("[data-wrong-filter]").forEach(el => el.addEventListener("click", () => {
    dailyTestState.wrongFilter = el.dataset.wrongFilter;
    render();
  }));
  document.querySelector("[data-wrong-clear]")?.addEventListener("click", () => {
    try { localStorage.removeItem(DAILY_TEST_WRONG_KEY); } catch {}
    render();
  });
  document.querySelectorAll("[data-history-filter]").forEach(el => el.addEventListener("click", () => {
    dailyTestState.historyFilter = el.dataset.historyFilter;
    render();
  }));
  document.querySelector("[data-history-clear]")?.addEventListener("click", () => {
    try { localStorage.removeItem(DAILY_TEST_HISTORY_KEY); } catch {}
    Object.assign(dailyTestState.scores, emptyTestScores());
    render();
  });
  const quizWrittenCheck = document.querySelector(".quiz-written-check");
  if (quizWrittenCheck) {
    const quizMeta = syncHomeAppState().items.quiz || {};
    const quizDone = Boolean(homeStudyState.checked.quiz);
    quizWrittenCheck.insertAdjacentHTML("beforebegin", `<section class="quiz-learning-status" aria-label="영어 문제 풀이 학습 상태"><div><b class="${quizDone ? "done" : "todo"}">${quizDone ? icon("check", 12) : ""}${quizDone ? "완료됨" : "진행 전"}</b><span>${quizMeta.lastStudiedAt ? `최근 학습 · ${quizMeta.lastStudiedAt}` : "최근 학습 기록 없음"}</span><span data-quiz-score-meta>${quizMeta.score !== null && quizMeta.score !== undefined ? `최근 점수 · ${quizMeta.score}` : "점수 기록 없음"}</span></div><button type="button" data-quiz-dashboard-undo ${!quizDone ? "disabled" : ""}>완료 해제</button></section>`);
  }
  document.querySelector("[data-written-grade]")?.addEventListener("click", () => {
    const first = document.querySelector('[data-written-answer="1"]');
    const second = document.querySelector('[data-written-answer="2"]');
    const result = document.querySelector("[data-written-result]");
    const answer1 = first.value.trim().toLowerCase();
    const answer2 = second.value.trim().replaceAll(" ", "");
    if (!answer1 || !answer2) {
      result.className = "error";
      result.textContent = "두 문항에 모두 답을 입력해주세요.";
      return;
    }
    const firstCorrect = answer1 === "studying";
    const secondCorrect = answer2 === "유지하다" || answer2 === "유지";
    quizQuickState.score = Number(firstCorrect) + Number(secondCorrect);
    quizQuickState.graded = true;
    quizQuickState.feedback = [firstCorrect ? "1번 정답" : "1번 오답 · 정답: studying", secondCorrect ? "2번 정답" : "2번 오답 · 정답: 유지하다"];
    first.classList.toggle("correct", firstCorrect);
    first.classList.toggle("wrong", !firstCorrect);
    second.classList.toggle("correct", secondCorrect);
    second.classList.toggle("wrong", !secondCorrect);
    first.disabled = true;
    second.disabled = true;
    result.className = quizQuickState.score === 2 ? "perfect" : "";
    result.innerHTML = `<b>점수: ${quizQuickState.score} / 2</b>${quizQuickState.feedback.map(item => `<span>${item}</span>`).join("")}`;
    syncHomeAppState("quiz", `${quizQuickState.score} / 2`);
    const scoreMeta = document.querySelector("[data-quiz-score-meta]");
    if (scoreMeta) scoreMeta.textContent = `최근 점수 · ${quizQuickState.score} / 2`;
    document.querySelector("[data-quiz-dashboard-complete]")?.removeAttribute("hidden");
  });
  document.querySelector("[data-quiz-dashboard-complete]")?.addEventListener("click", () => {
    if (!quizQuickState.graded && !homeStudyState.checked.quiz) return;
    homeStudyState.checked.quiz = true;
    saveHomeStudyState("quiz", quizQuickState.graded ? `${quizQuickState.score} / 2` : undefined);
    render();
  });
  document.querySelector("[data-quiz-dashboard-undo]")?.addEventListener("click", () => {
    homeStudyState.checked.quiz = false;
    saveHomeStudyState("quiz");
    render();
  });
  document.querySelectorAll("[data-quiz-choice]").forEach(button => button.addEventListener("click", () => {
    const filtered = getFilteredQuizIndexes();
    const realIndex = filtered[quizState.current];
    if (realIndex === undefined || quizState.solvedMap[realIndex]) return;
    const selected = Number(button.dataset.quizChoice);
    const correct = selected === Number(quizState.questions[realIndex].answer);
    quizState.solvedMap[realIndex] = { selected, correct, timestamp: Date.now() };
    quizState.solvedDates.push(quizTodayKey());
    quizState.wrongSet = correct ? quizState.wrongSet.filter(index => index !== realIndex) : [...new Set([...quizState.wrongSet, realIndex])];
    saveQuizState();
    const quizSolvedCount = Object.keys(quizState.solvedMap).length;
    const quizCorrectCount = Object.values(quizState.solvedMap).filter(result => result.correct).length;
    syncHomeAppState("quiz", `${quizCorrectCount} / ${quizSolvedCount}`);
    render();
  }));
  document.querySelector("[data-quiz-prev]")?.addEventListener("click", () => { if (quizState.current > 0) { quizState.current -= 1; quizState.answerVisible = false; render(); } });
  document.querySelector("[data-quiz-next]")?.addEventListener("click", () => { const length = getFilteredQuizIndexes().length; if (quizState.current < length - 1) { quizState.current += 1; quizState.answerVisible = false; render(); } });
  document.querySelector("[data-quiz-answer]")?.addEventListener("click", () => { quizState.answerVisible = true; render(); });
  document.querySelector("[data-quiz-mode]")?.addEventListener("click", () => { quizState.examMode = !quizState.examMode; saveQuizState(); render(); });
  document.querySelector("[data-quiz-dark]")?.addEventListener("click", () => { quizState.darkMode = !quizState.darkMode; saveQuizState(); render(); });
  document.querySelector("[data-quiz-retry]")?.addEventListener("click", () => { if (!quizState.wrongSet.length) { window.alert("오답 문제가 없습니다."); return; } quizState.search = ""; quizState.filter = "wrong"; quizState.current = 0; render(); });
  document.querySelector("[data-quiz-reset]")?.addEventListener("click", () => { if (!window.confirm("학습 기록을 초기화할까요?")) return; quizState.solvedMap = {}; quizState.wrongSet = []; quizState.solvedDates = []; quizState.current = 0; quizState.answerVisible = false; saveQuizState(); render(); });
  document.querySelector("[data-quiz-filter]")?.addEventListener("change", event => { quizState.filter = event.currentTarget.value; quizState.current = 0; quizState.answerVisible = false; render(); });
  document.querySelector("[data-quiz-search]")?.addEventListener("input", event => {
    quizState.search = event.currentTarget.value;
    quizState.current = 0;
    quizState.answerVisible = false;
    render();
    window.requestAnimationFrame(() => { const input = document.querySelector("[data-quiz-search]"); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } });
  });
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
      quizState.solvedDates = [];
      quizState.current = 0;
      quizState.search = "";
      quizState.filter = "all";
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
  };
  const entryFile = window.location.pathname.split("/").pop().toLowerCase();
  const hashPage = window.location.hash.replace(/^#/, "").split("/")[0];
  state.page = entryPageMap[entryFile] || (["calendar", "blog", "journal"].includes(hashPage) ? hashPage : "home");
  const articleMatch = state.page === "news" ? window.location.hash.match(/^#article-(\d+)$/) : null;
  state.newsIndex = articleMatch ? Number(articleMatch[1]) : null;
  window.history.replaceState(
    { worthyLife: true, page: state.page, newsIndex: state.newsIndex, tedLessonId: state.tedLessonId },
    ""
  );
}

render();
