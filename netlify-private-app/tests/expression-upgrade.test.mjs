import test from "node:test";
import assert from "node:assert/strict";
import {
  expressionUpgradeSets,
  getExpressionUpgradeInitialState,
  addExpressionUpgradeReview,
} from "../../src/expression-upgrade.js";

test("seed has six published sets and thirty active expressions", () => {
  assert.equal(expressionUpgradeSets.length, 6);
  assert.equal(expressionUpgradeSets.flatMap((set) => set.expressions).length, 30);
  assert.ok(expressionUpgradeSets.every((set) => set.status === "published"));
  assert.ok(expressionUpgradeSets.flatMap((set) => set.expressions).every((item) => item.status === "active"));
});

test("every set has exactly five expressions and three quiz items", () => {
  for (const set of expressionUpgradeSets) {
    assert.equal(set.expressions.length, 5);
    assert.equal(set.quiz.items.length, 3);
    assert.equal(new Set(set.expressions.map((item) => item.id)).size, 5);
    assert.equal(new Set(set.quiz.items.map((item) => item.id)).size, 3);
  }
});

test("expression content satisfies MVP validation limits", () => {
  for (const expression of expressionUpgradeSets.flatMap((set) => set.expressions)) {
    assert.ok([1, 2, 3].includes(expression.difficultyLevel));
    assert.ok(expression.shortDescription.length > 0 && expression.shortDescription.length <= 60);
    assert.ok(expression.usageNote.length > 0 && expression.usageNote.length <= 80);
    assert.ok(expression.example.exampleText);
    assert.ok(expression.example.meaningText);
  }
});

test("quiz answers always contain the correct answer", () => {
  for (const set of expressionUpgradeSets) {
    for (const item of set.quiz.items) {
      assert.equal(item.choices.length, 3);
      assert.ok(item.choices.includes(item.correctAnswer));
    }
  }
});

test("review creation is idempotent for an existing pending source", () => {
  let state = getExpressionUpgradeInitialState();
  state = addExpressionUpgradeReview(state, "expression-1", "saved", "save-1");
  state = addExpressionUpgradeReview(state, "expression-1", "saved", "save-1");
  assert.equal(state.reviewQueue.length, 1);
});
