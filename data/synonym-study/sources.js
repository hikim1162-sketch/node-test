export const synonymContentSources = {
  site: {
    id: "site",
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

export const defaultSourcePriority = ["site", "espresso", "naver"];
