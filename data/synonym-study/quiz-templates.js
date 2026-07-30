export function buildSynonymQuiz(entry, _type, index) {
  const answers = [...new Set([entry.targetWord, ...entry.additionalSynonyms])];
  const choices = [...answers, ...entry.distractors.slice(0, 3)]
    .map((choice, choiceIndex) => ({
      choice,
      order: (choiceIndex * 7 + index * 3) % (answers.length + 3),
    }))
    .sort((left, right) => left.order - right.order)
    .map(({ choice }) => choice);

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
