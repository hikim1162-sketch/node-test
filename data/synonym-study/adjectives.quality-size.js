import { defineSynonymEntry } from "./schema.js";

const make = (id, subcategory, baseExpression, baseWord, targetWord, meaningKo, nuance, exampleEn, exampleKo, additionalSynonyms, distractors, collocations, tags = []) => defineSynonymEntry({
  id, category: "adjective", subcategory, level: "basic", examFrequency: "high",
  baseExpression, baseWord, targetWord, pos: "adjective", meaningKo, nuance,
  exampleEn, exampleKo, additionalSynonyms, distractors, collocations,
  quizTypes: ["synonym_select", "blank", "context_match"], tags: ["기초확장", ...tags],
});

export const adjectiveQualitySizeData = [
  make("adj-size-001", "size", "very big", "big", "huge", "아주 큰, 거대한", "big보다 훨씬 큰 크기나 양을 강조한다.", "The project requires a huge amount of time.", "그 프로젝트에는 엄청난 시간이 필요하다.", ["enormous", "massive", "gigantic"], ["tiny", "brief", "narrow"], ["huge impact", "huge amount"], ["크기", "수능빈출"]),
  make("adj-size-002", "size", "very small", "small", "tiny", "아주 작은", "small보다 훨씬 작은 크기를 강조한다.", "A tiny crack can cause a serious problem.", "아주 작은 균열도 심각한 문제를 일으킬 수 있다.", ["minute", "miniature"], ["massive", "broad", "thick"], ["tiny amount", "tiny detail"], ["크기", "수능빈출"]),
  make("adj-quality-001", "quality", "very good", "good", "excellent", "훌륭한, 탁월한", "good보다 훨씬 높은 수준의 긍정 평가를 나타낸다.", "The researcher presented an excellent analysis.", "그 연구자는 탁월한 분석을 제시했다.", ["outstanding", "superb", "exceptional"], ["ordinary", "unclear", "minor"], ["excellent performance", "excellent condition"], ["평가", "수능빈출"]),
  make("adj-quality-002", "quality", "very bad", "bad", "terrible", "끔찍한, 형편없는", "bad보다 더 강한 부정적 평가를 나타낸다.", "The policy had terrible consequences for local workers.", "그 정책은 지역 노동자들에게 끔찍한 결과를 초래했다.", ["awful", "horrible", "dreadful"], ["pleasant", "helpful", "gentle"], ["terrible mistake", "terrible consequence"], ["평가", "수능빈출"]),
  make("adj-appearance-001", "appearance", "very beautiful", "beautiful", "gorgeous", "매우 아름다운, 화려한", "시각적으로 화려하고 강한 매력을 주는 대상에 잘 어울린다.", "The valley offers a gorgeous view in autumn.", "그 계곡은 가을에 매우 아름다운 경관을 보여준다.", ["stunning", "magnificent"], ["plain", "ordinary", "awkward"], ["gorgeous view", "look gorgeous"], ["외형"]),
];
