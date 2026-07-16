const fallbackChoices = {
  word: ["분석하다", "유지하다", "변화", "명확한", "효율적으로", "가능성"],
  sentence: ["업무가 곧 완료될 예정입니다.", "계획을 다시 확인해야 합니다.", "변화에 유연하게 대응해야 합니다.", "팀과 정보를 공유하는 것이 중요합니다."],
};

function stableHash(value) {
  return [...String(value)].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
}

function uniqueChoices(answer, candidates, seed) {
  const pool = [...new Set(candidates.filter(Boolean).map(String).filter(value => value !== answer))];
  const sorted = pool.sort((a, b) => stableHash(`${seed}:${a}`) - stableHash(`${seed}:${b}`));
  const choices = [answer, ...sorted.slice(0, 3)];
  while (choices.length < 4) choices.push(`다른 의미 ${choices.length}`);
  return choices.sort((a, b) => stableHash(`${seed}:choice:${a}`) - stableHash(`${seed}:choice:${b}`));
}

export function normalizeSavedLearningItems({ words = [], sentences = [], blogItems = [] } = {}) {
  const wordItems = words.map(item => ({ id: `word:${item.word}`, type: "word", text: item.word, meaning: item.meaning, example: item.example, savedAt: item.savedAt || "", sourceType: "vocabulary", sourceTitle: "저장 단어" }));
  const sentenceItems = sentences.map(item => ({ id: `sentence:${item.id}`, type: "sentence", text: item.en, meaning: item.ko, example: item.pattern || item.meaning || "", savedAt: item.savedAt || "", sourceType: "sentence", sourceTitle: "저장 문장" }));
  return [...wordItems, ...sentenceItems, ...blogItems.map(item => ({ ...item, type: item.type || "sentence" }))];
}

export function generateCustomTestFromSavedItems(items, options = {}, fallbackItems = []) {
  const config = { scope: "all", count: 5, difficulty: "normal", questionType: "multiple", ...options };
  const scoped = items.filter(item => config.scope === "all" || item.type === config.scope);
  const sourcePool = config.scope === "all" ? items : scoped;
  const pool = [...sourcePool];
  const fallbacks = fallbackItems.filter(item => config.scope === "all" || item.type === config.scope);
  let fallbackIndex = 0;
  while (pool.length < config.count && fallbacks.length) pool.push({ ...fallbacks[fallbackIndex++ % fallbacks.length], isFallback: true });
  if (!pool.length) return { testId: "", itemSourceIds: [], generatedQuestions: [], createdAt: new Date().toISOString(), config };

  const ordered = [...pool].sort((a, b) => stableHash(`${a.id}:${config.difficulty}`) - stableHash(`${b.id}:${config.difficulty}`));
  const questions = Array.from({ length: Math.min(config.count, Math.max(config.count, ordered.length)) }, (_, index) => {
    const item = ordered[index % ordered.length];
    const isWord = item.type === "word";
    const allMeanings = [...items, ...fallbackItems].filter(candidate => candidate.type === item.type).map(candidate => candidate.meaning);
    const answer = item.meaning || item.text;
    const choices = uniqueChoices(answer, [...allMeanings, ...fallbackChoices[isWord ? "word" : "sentence"]], `${item.id}:${index}`);
    return {
      id: `custom-q-${index}-${stableHash(item.id)}`,
      sourceId: item.id,
      sourceType: item.sourceType,
      sourceTitle: item.sourceTitle,
      sourceText: item.text,
      type: isWord ? "단어 뜻" : "문장 이해",
      prompt: isWord ? `‘${item.text}’의 뜻으로 가장 알맞은 것을 고르세요.` : `다음 문장의 의미로 가장 알맞은 것을 고르세요.\n${item.text}`,
      choices,
      answer: choices.indexOf(answer),
      explanation: isWord ? `‘${item.text}’은(는) ‘${answer}’라는 뜻입니다.` : `저장한 문장의 해석은 “${answer}”입니다.`,
      isFallback: Boolean(item.isFallback),
    };
  });
  return {
    testId: `custom-${Date.now()}`,
    itemSourceIds: [...new Set(questions.map(question => question.sourceId))],
    generatedQuestions: questions,
    createdAt: new Date().toISOString(),
    config,
  };
}
