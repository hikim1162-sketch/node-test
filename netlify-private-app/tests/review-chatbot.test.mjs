import test from "node:test";
import assert from "node:assert/strict";
import {
  createReviewProgress,
  createReviewQuestion,
  gradeReviewQuestion,
  selectDueReviewItems,
} from "../../src/connected-learning.js";

const desire = {
  id: "csat:desire",
  type: "word",
  text: "desire",
  meaning: "욕망, 욕구, 바라다",
  example: "She had a strong desire to succeed.",
  savedAt: "2026-07-20T00:00:00.000Z",
  sourceType: "csat-vocab",
};
const balance = {
  id: "csat:balance",
  type: "word",
  text: "balance",
  meaning: "균형, 은행 잔고, 균형을 이루다",
  savedAt: "2026-07-19T00:00:00.000Z",
  sourceType: "csat-vocab",
};
const follow = {
  id: "csat:follow",
  type: "word",
  text: "follow",
  meaning: "따라가다, 뒤따르다",
  savedAt: "2026-07-18T00:00:00.000Z",
  sourceType: "csat-vocab",
};

test("desire question keeps its own prompt, choices and answer after due order changes", () => {
  const items = [desire, balance, follow];
  const firstEntry = {
    item: desire,
    progress: createReviewProgress(desire, new Date("2026-07-29T00:00:00.000Z")),
    overdueDays: 8,
  };
  const sessionQuestion = createReviewQuestion(firstEntry, items);

  const reorderedProgress = {
    [desire.id]: { ...firstEntry.progress, nextReviewAt: "2026-08-01T00:00:00.000Z" },
    [balance.id]: { ...createReviewProgress(balance), nextReviewAt: "2026-07-01T00:00:00.000Z" },
    [follow.id]: { ...createReviewProgress(follow), nextReviewAt: "2026-07-02T00:00:00.000Z" },
  };
  const reordered = selectDueReviewItems(items, reorderedProgress, new Date("2026-07-29T00:00:00.000Z"));
  assert.equal(reordered[0].item.id, balance.id);

  assert.equal(sessionQuestion.itemId, desire.id);
  assert.match(sessionQuestion.prompt, /desire/);
  const grading = gradeReviewQuestion(sessionQuestion, desire.id, sessionQuestion.answer);
  assert.deepEqual(grading, {
    accepted: true,
    correct: true,
    selectedAnswer: desire.meaning,
    correctAnswer: desire.meaning,
  });
});

test("a frozen desire question cannot be graded as balance", () => {
  const question = createReviewQuestion(
    { item: desire, progress: createReviewProgress(desire), overdueDays: 0 },
    [desire, balance, follow],
  );
  assert.deepEqual(gradeReviewQuestion(question, balance.id, question.answer), {
    accepted: false,
    correct: false,
    reason: "QUESTION_ITEM_MISMATCH",
  });
});

test("review choices are three distinct non-empty answers with exactly one correct answer", () => {
  const question = createReviewQuestion(
    { item: desire, progress: createReviewProgress(desire), overdueDays: 0 },
    [desire, balance, follow],
  );
  assert.equal(question.choices.length, 3);
  assert.equal(new Set(question.choices).size, 3);
  assert.ok(question.choices.every(Boolean));
  assert.equal(question.choices.filter((choice) => choice === desire.meaning).length, 1);
});
