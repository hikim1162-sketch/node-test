import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  synonymStudySets,
  synonymContentSources,
  getSynonymStudyInitialState,
  normalizeSynonymStudyState,
  synonymStudyData,
  synonymExpansionTotal,
  dailySynonymThemes30,
  getTodaySynonymTheme,
} from "../../data/synonym-study/index.js";

test("MVP contains four published sets and twenty curated words", () => {
  assert.equal(synonymStudySets.length, 4);
  assert.equal(synonymStudySets.flatMap((set) => set.words).length, 20);
  assert.ok(synonymStudySets.every((set) => set.status === "published"));
});

test("each set has five cards and three CSAT-style quiz items", () => {
  const allowedTypes = new Set(["synonym_select", "blank", "context_match", "meaning_match"]);
  for (const set of synonymStudySets) {
    assert.equal(set.words.length, 5);
    assert.equal(set.quiz.length, 3);
    assert.ok(set.quiz.every((item) => allowedTypes.has(item.type)));
    assert.ok(new Set(set.quiz.map((item) => item.type)).size >= 2);
  }
});

test("every card has the required learning fields", () => {
  for (const word of synonymStudySets.flatMap((set) => set.words)) {
    assert.ok(word.baseExpression);
    assert.ok(word.baseWord);
    assert.ok(word.targetWord);
    assert.ok(word.meaningKo);
    assert.ok(word.exampleEn);
    assert.ok(word.exampleKo);
    assert.ok(word.nuance);
    assert.ok(word.additionalSynonyms.length >= 1 && word.additionalSynonyms.length <= 3);
    assert.ok(word.distractors.length >= 3);
    assert.ok(word.collocations.length >= 1);
    assert.ok(word.quizTypes.length >= 2);
    assert.deepEqual(word.sourcePriority, ["site", "espresso", "naver"]);
  }
});

test("every quiz has distinct choices and one correct answer", () => {
  for (const question of synonymStudySets.flatMap((set) => set.quiz)) {
    assert.equal(question.choices.length, 4);
    assert.equal(new Set(question.choices).size, 4);
    assert.equal(question.choices.filter((choice) => choice === question.answer).length, 1);
  }
});

test("source data stays separate and follows the requested priority", () => {
  assert.equal(synonymContentSources.site.priority, 1);
  assert.equal(synonymContentSources.espresso.priority, 2);
  assert.equal(synonymContentSources.naver.priority, 3);
});

test("canonical dataset has unique targets and a 500-entry expansion plan", () => {
  assert.equal(new Set(synonymStudyData.map((word) => word.targetWord)).size, synonymStudyData.length);
  assert.equal(synonymExpansionTotal, 500);
});

test("stored state normalization preserves scalable arrays", () => {
  const state = normalizeSynonymStudyState({ ...getSynonymStudyInitialState(), wrongWordIds: null });
  assert.deepEqual(state.wrongWordIds, []);
  assert.deepEqual(state.dailyThemeAnswers, {});
});

test("daily theme calendar has thirty valid days", () => {
  assert.equal(dailySynonymThemes30.length, 30);
  assert.deepEqual(dailySynonymThemes30.map((theme) => theme.day), Array.from({ length: 30 }, (_, index) => index + 1));
  for (const theme of dailySynonymThemes30) {
    assert.equal(theme.items.length, 3);
    assert.equal(theme.quiz.options.length, 4);
    assert.equal(new Set(theme.quiz.options).size, 4);
    assert.equal(theme.quiz.options.filter((option) => option === theme.quiz.answer).length, 1);
    assert.match(theme.source.url, /^https:\/\/www\.espressoenglish\.net\//);
  }
});

test("today theme advances daily and cycles after day thirty", () => {
  const first = getTodaySynonymTheme(new Date(2026, 0, 1));
  const second = getTodaySynonymTheme(new Date(2026, 0, 2));
  const cycle = getTodaySynonymTheme(new Date(2026, 0, 31));
  assert.equal(first.day, 1);
  assert.equal(second.day, 2);
  assert.equal(cycle.day, 1);
});

test("synonym UI exposes only vocabulary, test, and wrong-answer review menus", () => {
  const appSource = readFileSync(new URL("../../src/app.js", import.meta.url), "utf8");
  const tabs = appSource.match(/const tabs = `<nav class="synonym-tabs"[\s\S]*?<\/nav>`;/)?.[0] || "";
  assert.match(tabs, />유의어 어휘<\/button>/);
  assert.match(tabs, />테스트<\/button>/);
  assert.match(tabs, />오답 복습 /);
  assert.doesNotMatch(tabs, /학습 세트|학습·문제/);
  assert.match(appSource, /const vocabulary = synonymStudySets\.flatMap/);
});
