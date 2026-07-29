import { defineSynonymEntry } from "./schema.js";

const make = (id, baseExpression, baseWord, targetWord, meaningKo, nuance, exampleEn, exampleKo, additionalSynonyms, distractors, collocations, tags = []) => defineSynonymEntry({
  id, category: "adjective", subcategory: "emotion", level: "basic", examFrequency: "high",
  baseExpression, baseWord, targetWord, pos: "adjective", meaningKo, nuance,
  exampleEn, exampleKo, additionalSynonyms, distractors, collocations,
  quizTypes: ["synonym_select", "context_match", "meaning_match"], tags: ["감정", "강도", ...tags],
});

export const adjectiveEmotionData = [
  make("adj-emotion-001", "very scared", "scared", "terrified", "몹시 겁먹은, 두려워하는", "scared보다 훨씬 강한 공포를 나타낸다.", "Residents were terrified by the sudden explosion.", "주민들은 갑작스러운 폭발에 겁에 질렸다.", ["frightened", "petrified"], ["delighted", "hopeful", "careless"], ["terrified of", "look terrified"], ["수능빈출"]),
  make("adj-emotion-002", "very funny", "funny", "hilarious", "아주 우스운", "크게 웃을 만큼 매우 재미있다는 뜻이다.", "The audience found his unexpected reply hilarious.", "청중은 그의 뜻밖의 대답을 아주 우습게 여겼다.", ["amusing", "comical"], ["tragic", "serious", "formal"], ["absolutely hilarious", "find hilarious"]),
  make("adj-emotion-003", "very angry", "angry", "furious", "격노한", "통제하기 어려울 정도의 강한 분노를 나타낸다.", "Citizens were furious about the unfair decision.", "시민들은 불공정한 결정에 격노했다.", ["outraged", "enraged"], ["calm", "grateful", "delighted"], ["furious about", "become furious"]),
  make("adj-emotion-004", "very surprised", "surprised", "astonished", "매우 놀란", "예상과 크게 다른 사실에 매우 놀란 상태를 나타낸다.", "Scientists were astonished by the unexpected result.", "과학자들은 예상치 못한 결과에 크게 놀랐다.", ["amazed", "stunned"], ["bored", "certain", "indifferent"], ["astonished by", "absolutely astonished"]),
  make("adj-emotion-005", "very sad", "sad", "devastated", "큰 충격과 슬픔에 빠진", "단순한 sad보다 충격과 깊은 슬픔이 함께 담긴다.", "The community was devastated by the loss.", "그 공동체는 그 상실로 큰 충격과 슬픔에 빠졌다.", ["heartbroken", "miserable"], ["cheerful", "relieved", "confident"], ["devastated by", "feel devastated"]),
];
