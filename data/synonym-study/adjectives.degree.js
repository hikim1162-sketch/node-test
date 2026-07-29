import { defineSynonymEntry } from "./schema.js";

const make = (id, subcategory, baseExpression, baseWord, targetWord, meaningKo, nuance, exampleEn, exampleKo, additionalSynonyms, distractors, collocations, tags = []) => defineSynonymEntry({
  id, category: "adjective", subcategory, level: "basic", examFrequency: "high",
  baseExpression, baseWord, targetWord, pos: "adjective", meaningKo, nuance,
  exampleEn, exampleKo, additionalSynonyms, distractors, collocations,
  quizTypes: ["synonym_select", "blank", "context_match", "meaning_match"],
  tags: ["수능빈출", ...tags],
});

export const adjectiveDegreeData = [
  make("adj-degree-001", "degree", "very tired", "tired", "exhausted", "몹시 지친, 기진맥진한", "tired보다 훨씬 강한 피로 상태를 나타낸다.", "The hikers were exhausted after climbing all day.", "등산객들은 하루 종일 산을 오른 뒤 기진맥진했다.", ["drained", "weary", "fatigued"], ["relieved", "satisfied", "ashamed"], ["feel exhausted", "completely exhausted"], ["강도", "상태"]),
  make("adj-degree-002", "degree", "very hungry", "hungry", "starving", "몹시 배고픈", "hungry보다 배고픔의 정도가 훨씬 크다.", "By lunchtime, the children were starving.", "점심시간이 되자 아이들은 몹시 배가 고팠다.", ["famished", "ravenous"], ["sleepy", "thirsty", "busy"], ["absolutely starving", "feel starving"], ["강도", "상태"]),
  make("adj-degree-003", "temperature-status", "very cold", "cold", "freezing", "몹시 추운", "cold보다 훨씬 강한 추위를 강조한다.", "The explorers faced freezing temperatures at night.", "탐험가들은 밤에 혹독하게 추운 기온을 마주했다.", ["icy", "frigid"], ["warm", "gentle", "soft"], ["freezing weather", "freezing cold"], ["날씨", "강도"]),
  make("adj-degree-004", "temperature-status", "very hot", "hot", "boiling", "몹시 더운", "견디기 어려울 정도로 뜨거운 공간이나 날씨를 나타낸다.", "The room was boiling despite the open windows.", "창문을 열었는데도 방은 몹시 더웠다.", ["scorching", "sweltering"], ["chilly", "mild", "frozen"], ["boiling hot", "boiling room"], ["날씨", "강도"]),
  make("adj-degree-005", "quality", "very clean", "clean", "spotless", "티 없이 깨끗한", "얼룩이나 먼지가 전혀 보이지 않는 상태를 강조한다.", "The laboratory must remain spotless at all times.", "실험실은 항상 티 없이 깨끗하게 유지되어야 한다.", ["immaculate", "pristine"], ["filthy", "crowded", "damaged"], ["spotless room", "keep spotless"], ["상태", "품질"]),
];
