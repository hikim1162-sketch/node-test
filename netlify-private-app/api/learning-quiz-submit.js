import { failure, send, success, visibleContents } from "./learning-catalog.js";

export default function handler(req, res) {
  if (req.method !== "POST") return send(res, failure("METHOD_NOT_ALLOWED", "POST 요청만 지원합니다.", 405));
  const { contentId, quizIndex, selectedAnswer } = req.body || {};
  if (!contentId || !Number.isInteger(quizIndex) || !Number.isInteger(selectedAnswer)) {
    return send(res, failure("VALIDATION_ERROR", "contentId, quizIndex, selectedAnswer를 확인해 주세요.", 422));
  }
  const content = [...visibleContents("daily_sentence"), ...visibleContents("ted_learning")].find((item) => item.id === contentId);
  if (!content) return send(res, failure("NOT_FOUND", "공개된 학습 콘텐츠를 찾을 수 없습니다.", 404));
  const quiz = content.quizzes?.[quizIndex];
  if (!quiz) return send(res, failure("NOT_FOUND", "퀴즈를 찾을 수 없습니다.", 404));
  const correct = selectedAnswer === quiz.correctAnswer;
  return send(res, success({ correct, correctAnswer: quiz.correctAnswer, explanation: quiz.explanation }));
}

