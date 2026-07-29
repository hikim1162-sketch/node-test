import test from "node:test";
import assert from "node:assert/strict";
import {
  synonymStudySets,
  synonymContentSources,
  getSynonymStudyInitialState,
  normalizeSynonymStudyState,
} from "../../data/synonym-study.js";

test("MVP contains four published sets and twenty curated words", () => {
  assert.equal(synonymStudySets.length, 4);
  assert.equal(synonymStudySets.flatMap((set) => set.words).length, 20);
  assert.ok(synonymStudySets.every((set) => set.status === "published"));
});

test("each set has five cards and three CSAT-style quiz items", () => {
  for (const set of synonymStudySets) {
    assert.equal(set.words.length, 5);
    assert.equal(set.quiz.length, 3);
    assert.deepEqual(set.quiz.map((item) => item.type), [
      "context_synonym",
      "underlined_synonym",
      "advanced_match",
    ]);
  }
});

test("every card has the required learning fields", () => {
  for (const word of synonymStudySets.flatMap((set) => set.words)) {
    assert.ok(word.base);
    assert.ok(word.target);
    assert.ok(word.meaning);
    assert.ok(word.example);
    assert.ok(word.nuance);
    assert.ok(word.synonyms.length >= 1 && word.synonyms.length <= 3);
    assert.deepEqual(word.sourceIds, ["internal", "espresso"]);
  }
});

test("every quiz has distinct choices and one correct answer", () => {
  for (const question of synonymStudySets.flatMap((set) => set.quiz)) {
    assert.equal(question.choices.length, 3);
    assert.equal(new Set(question.choices).size, 3);
    assert.equal(question.choices.filter((choice) => choice === question.answer).length, 1);
  }
});

test("source data stays separate and follows the requested priority", () => {
  assert.equal(synonymContentSources.internal.priority, 1);
  assert.equal(synonymContentSources.espresso.priority, 2);
  assert.equal(synonymContentSources.naver.priority, 3);
});

test("stored state normalization preserves scalable arrays", () => {
  const state = normalizeSynonymStudyState({ ...getSynonymStudyInitialState(), wrongWordIds: null });
  assert.deepEqual(state.wrongWordIds, []);
});
