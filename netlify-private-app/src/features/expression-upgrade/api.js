async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error?.message || "표현 학습 데이터를 불러오지 못했습니다.");
    error.code = payload.error?.code || "REQUEST_FAILED";
    error.status = response.status;
    throw error;
  }
  return payload.data;
}

export const expressionUpgradeApi = {
  getTodaySet: () => request("/api/daily-set/today"),
  getSet: (setId) => request(`/api/sets/${encodeURIComponent(setId)}`),
  getQuiz: (setId) => request(`/api/sets/${encodeURIComponent(setId)}/quiz`),
  submitQuiz: (quizId, answers) => request("/api/quiz-submissions", {
    method: "POST",
    body: JSON.stringify({ quizId, answers }),
  }),
  saveExpression: (expressionId) => request(`/api/expressions/${encodeURIComponent(expressionId)}/save`, {
    method: "POST",
  }),
  getSavedExpressions: () => request("/api/me/saved-expressions"),
  getReviewQueue: (status = "pending") => request(`/api/me/review-queue?status=${encodeURIComponent(status)}`),
  completeReview: (reviewId) => request(`/api/me/review-queue/${encodeURIComponent(reviewId)}/complete`, {
    method: "POST",
  }),
  log: (event) => request("/api/logs", { method: "POST", body: JSON.stringify(event) }),
};
