function blankTarget(example, targetWord) {
  const pattern = new RegExp(`\\b${targetWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return example.replace(pattern, "______");
}

export function buildSynonymQuiz(entry, type, index) {
  const choices = [entry.targetWord, ...entry.distractors.slice(0, 3)];
  if (type === "blank") return {
    id: `${entry.id}-quiz-${index + 1}`, wordId: entry.id, type,
    prompt: "빈칸에 들어갈 가장 적절한 어휘는?",
    context: blankTarget(entry.exampleEn, entry.targetWord),
    choices, answer: entry.targetWord, explanation: entry.nuance,
  };
  if (type === "meaning_match") return {
    id: `${entry.id}-quiz-${index + 1}`, wordId: entry.id, type,
    prompt: `“${entry.meaningKo}”의 의미를 가지는 어휘는?`,
    context: entry.exampleEn, choices, answer: entry.targetWord, explanation: entry.nuance,
  };
  if (type === "context_match") return {
    id: `${entry.id}-quiz-${index + 1}`, wordId: entry.id, type,
    prompt: `문맥에서 “${entry.baseExpression}”를 가장 정확하게 바꿀 수 있는 어휘는?`,
    context: entry.exampleEn, choices, answer: entry.targetWord, explanation: entry.nuance,
  };
  return {
    id: `${entry.id}-quiz-${index + 1}`, wordId: entry.id, type: "synonym_select",
    prompt: `“${entry.baseExpression}”와 의미가 가장 가까운 고급 어휘는?`,
    context: entry.exampleEn, choices, answer: entry.targetWord, explanation: entry.nuance,
  };
}

export function buildSetQuiz(words) {
  return words.slice(0, 3).map((entry, index) => buildSynonymQuiz(entry, entry.quizTypes[index % entry.quizTypes.length], index));
}
