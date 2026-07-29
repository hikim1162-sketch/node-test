export const REVIEW_STORAGE_KEY = "value_time_review_progress_v1";

export function createReviewProgress(item, now = new Date()) {
  const savedAt = item.savedAt ? new Date(item.savedAt) : new Date(now.getTime() - 3 * 86400000);
  return { itemId: item.id, reviewStage: 1, nextReviewAt: new Date(savedAt.getTime() + 86400000).toISOString(), lastReviewedAt: null, memoryScore: 40, correctCount: 0, wrongCount: 0, status: "due" };
}

export function selectDueReviewItems(items, progressMap, now = new Date()) {
  return items.map(item => {
    const progress = progressMap[item.id] || createReviewProgress(item, now);
    const dueAt = new Date(progress.nextReviewAt).getTime();
    const overdueDays = Math.max(0, Math.floor((now.getTime() - dueAt) / 86400000));
    const priority = overdueDays >= 7 ? 4 : overdueDays >= 3 ? 3 : overdueDays >= 1 ? 2 : progress.wrongCount > progress.correctCount ? 1 : 0;
    return { item, progress, overdueDays, priority, due: dueAt <= now.getTime() || priority > 0 };
  }).filter(entry => entry.due).sort((a, b) => b.priority - a.priority || new Date(a.progress.nextReviewAt) - new Date(b.progress.nextReviewAt));
}

function stableHash(value) {
  return [...String(value)].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
}

function sentenceNearMisses(answer) {
  const value = String(answer || "").trim();
  const candidates = [];
  const add = (candidate) => {
    const normalized = String(candidate || "").trim();
    if (normalized && normalized !== value && !candidates.includes(normalized)) candidates.push(normalized);
  };
  const actorPattern = /^(.+?(?:에게|에))\s+(.+?기 전에)\s+(.+?(?:에게|에))\s+(.+)$/;
  const actors = value.match(actorPattern);
  if (actors) add(`${actors[3]} ${actors[2]} ${actors[1]} ${actors[4]}`);
  if (/(\S+)하기 전에/.test(value)) add(value.replace(/(\S+)하기 전에/, "$1한 후에"));
  else if (/(\S+) 전에/.test(value)) add(value.replace(/(\S+) 전에/, "$1 후에"));
  if (/(\S+)한 후에/.test(value)) add(value.replace(/(\S+)한 후에/, "$1하기 전에"));
  else if (/(\S+) 후에/.test(value)) add(value.replace(/(\S+) 후에/, "$1 전에"));

  [
    [" 먼저", " 나중에"],
    [" 증가", " 감소"],
    [" 감소", " 증가"],
    [" 동의", " 반대"],
    [" 가능", " 불가능"],
    [" 검토", " 승인"],
    [" 승인", " 검토"],
    [" 요청해 주세요", " 직접 처리해 주세요"],
    [" 확인해 주세요", " 확인하지 않아도 됩니다"],
    [" 해야 합니다", " 하지 않아도 됩니다"],
    [" 할 수 있습니다", " 할 수 없습니다"],
  ].forEach(([from, to]) => {
    if (value.includes(from)) add(value.replace(from, to));
  });
  return candidates;
}

function reviewDistractors(entry, allItems, answer) {
  const type = entry.item.type || "sentence";
  const sameType = allItems
    .filter((item) => (item.type || "sentence") === type && item.id !== entry.item.id)
    .map((item) => String(item.meaning || "").trim())
    .filter((value) => value && value !== answer)
    .filter((value) => type !== "sentence" || (
      value.length >= answer.length * 0.6 && value.length <= answer.length * 1.5
    ))
    .sort((a, b) => (
      Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length)
      || stableHash(`${entry.item.id}:${a}`) - stableHash(`${entry.item.id}:${b}`)
    ));
  const generated = type === "sentence" ? sentenceNearMisses(answer) : [];
  const wordFallbacks = ["유지하다", "확인하다", "변경하다", "요청하다"];
  const sentenceFallbacks = [
    "관련 부서에 내용을 먼저 확인한 뒤 담당자에게 전달해 주세요.",
    "담당자에게 연락하기 전에 변경된 일정을 다시 검토해 주세요.",
    "운영팀의 확인 없이 제안서를 바로 승인해 주세요.",
  ];
  return [...new Set([
    ...generated,
    ...sameType,
    ...(type === "word" ? wordFallbacks : sentenceFallbacks),
  ])].filter((value) => value !== answer).slice(0, 2);
}

export function createReviewQuestion(entry, allItems) {
  const answer = String(entry.item.meaning || "").trim();
  const distractors = reviewDistractors(entry, allItems, answer);
  const choices = [answer, ...distractors].sort((a, b) => `${entry.item.id}:${a}`.localeCompare(`${entry.item.id}:${b}`));
  return { id: `review:${entry.item.id}`, itemId: entry.item.id, prompt: `“${entry.item.text}”의 의미는 무엇일까요?`, choices, answer: choices.indexOf(answer), example: entry.item.example };
}

export function gradeReviewQuestion(question, itemId, selectedIndex) {
  if (!question || question.itemId !== itemId) {
    return { accepted: false, correct: false, reason: "QUESTION_ITEM_MISMATCH" };
  }
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= question.choices.length) {
    return { accepted: false, correct: false, reason: "INVALID_CHOICE" };
  }
  return {
    accepted: true,
    correct: selectedIndex === question.answer,
    selectedAnswer: question.choices[selectedIndex],
    correctAnswer: question.choices[question.answer],
  };
}

export function applyReviewAnswer(progress, correct, now = new Date()) {
  const nextStage = correct ? Math.min(4, progress.reviewStage + 1) : 1;
  const intervalDays = [0, 1, 3, 7, 14][nextStage];
  return { ...progress, reviewStage: nextStage, nextReviewAt: new Date(now.getTime() + intervalDays * 86400000).toISOString(), lastReviewedAt: now.toISOString(), memoryScore: Math.max(0, Math.min(100, progress.memoryScore + (correct ? 15 : -10))), correctCount: progress.correctCount + (correct ? 1 : 0), wrongCount: progress.wrongCount + (correct ? 0 : 1), status: correct ? "scheduled" : "wrong" };
}

export function detectUsedWords(text, words) {
  return words.filter(item => new RegExp(`(^|[^a-z])${String(item.text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i").test(text));
}

export function evaluateEmailReply(replyText, recommendedItems) {
  const text = String(replyText).trim();
  const usedWords = detectUsedWords(text, recommendedItems);
  const sentences = text.split(/[.!?]+/).map(value => value.trim()).filter(Boolean);
  const greeting = /^(dear|hello|hi)\b/i.test(text);
  const closing = /(regards|best|sincerely|thank you)[,!\s\n]*[^.!?]*$/i.test(text);
  const toneScore = Math.min(100, 55 + (greeting ? 20 : 0) + (closing ? 25 : 0));
  const clarityScore = Math.min(100, 45 + Math.min(4, sentences.length) * 12 + (text.length >= 80 ? 7 : 0));
  const vocabScore = Math.round(40 + (usedWords.length / Math.max(1, recommendedItems.length)) * 60);
  const overallScore = Math.round((toneScore + clarityScore + vocabScore) / 3);
  const feedback = [!greeting && "첫 줄에 Dear/Hello 인사를 추가해보세요.", !closing && "마지막에 Best regards 같은 맺음말을 넣어보세요.", sentences.length < 3 && "요청 확인, 대응 계획, 마감 시점을 각각 한 문장으로 작성해보세요.", usedWords.length < recommendedItems.length && "추천 표현을 한두 개 더 자연스럽게 활용해보세요."].filter(Boolean);
  return { replyText: text, usedWords: usedWords.map(item => item.id), toneScore, clarityScore, vocabScore, overallScore, feedback: feedback.length ? feedback : ["구조와 어조가 명확합니다. 다음 메일에서도 같은 흐름을 유지해보세요."] };
}

export function toNotebookItem(expression, article) {
  return { id: `news:${article.id}:${expression.id}`, type: expression.type || "sentence", text: expression.text, meaning: expression.meaning, example: expression.example, savedAt: new Date().toISOString(), sourceType: "news", sourceId: article.id, sourceTitle: article.title, sourceUrl: article.originalUrl, sourceSnippet: article.summary?.[0] || "" };
}
