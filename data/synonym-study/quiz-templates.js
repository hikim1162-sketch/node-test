function shuffled(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function buildSynonymQuiz(entry, _type, index) {
  const answers = [...new Set([entry.targetWord, ...entry.additionalSynonyms])];
  const choices = shuffled([...answers, ...entry.distractors.slice(0, 3)]);

  return {
    id: `${entry.id}-quiz-${index + 1}`,
    wordId: entry.id,
    type: "synonym_select_all",
    prompt: `"${entry.baseExpression}"의 유의어를 모두 고르시오.`,
    context: entry.exampleEn,
    choices,
    answers,
    answer: entry.targetWord,
    explanation: entry.nuance,
  };
}

export function buildSetQuiz(words) {
  return words.slice(0, 3).map((entry, index) => buildSynonymQuiz(entry, "synonym_select_all", index));
}
