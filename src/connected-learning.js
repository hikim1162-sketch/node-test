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

export function createReviewQuestion(entry, allItems) {
  const answer = entry.item.meaning;
  const distractors = [...new Set(allItems.map(item => item.meaning).filter(value => value && value !== answer))].slice(0, 2);
  const defaults = ["문맥에 따라 달라지는 표현", "일정을 앞당기다", "상대방에게 확인하다"];
  while (distractors.length < 2) distractors.push(defaults[distractors.length]);
  const choices = [answer, ...distractors].sort((a, b) => `${entry.item.id}:${a}`.localeCompare(`${entry.item.id}:${b}`));
  return { id: `review:${entry.item.id}`, itemId: entry.item.id, prompt: `“${entry.item.text}”의 의미는 무엇일까요?`, choices, answer: choices.indexOf(answer), example: entry.item.example };
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
