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
import { buildSynonymQuiz } from "../../data/synonym-study/quiz-templates.js";
import { getSynonymPhonetic } from "../../data/synonym-study/phonetics.js";

test("published curriculum contains one hundred curated words", () => {
  assert.equal(synonymStudySets.length, 12);
  assert.equal(synonymStudySets.flatMap((set) => set.words).length, 100);
  assert.ok(synonymStudySets.every((set) => set.status === "published"));
});

test("each set has learning cards and three CSAT-style quiz items", () => {
  for (const set of synonymStudySets) {
    assert.ok(set.words.length >= 5);
    assert.equal(set.quiz.length, 3);
    assert.ok(set.quiz.every((item) => item.type === "synonym_select_all"));
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

test("every main synonym and related synonym has an IPA transcription", () => {
  for (const word of synonymStudySets.flatMap((set) => set.words)) {
    assert.match(getSynonymPhonetic(word.targetWord), /^\/.+\/$/);
    assert.notEqual(getSynonymPhonetic(word.targetWord), "/—/");
    for (const relatedWord of word.additionalSynonyms) {
      assert.match(getSynonymPhonetic(relatedWord), /^\/.+\/$/);
      assert.notEqual(getSynonymPhonetic(relatedWord), "/—/");
    }
  }
});

test("every quiz asks learners to select every synonym", () => {
  for (const question of synonymStudySets.flatMap((set) => set.quiz)) {
    assert.match(question.prompt, /유의어를 모두 고르시오/);
    assert.ok(question.answers.length >= 2);
    assert.equal(new Set(question.choices).size, question.choices.length);
    assert.ok(question.answers.every((answer) => question.choices.includes(answer)));
    assert.ok(question.choices.some((choice) => !question.answers.includes(choice)));
  }
});

test("quiz choices are shuffled instead of keeping answer-first order", () => {
  const entry = synonymStudySets[0].words[0];
  const orders = new Set(
    Array.from({ length: 12 }, (_, index) => buildSynonymQuiz(entry, "synonym_select_all", index).choices.join("|")),
  );
  assert.ok(orders.size > 1);
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
  assert.deepEqual(state.dailyQuizWordIds, []);
  assert.deepEqual(state.quizSelections, {});
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
  assert.match(appSource, /const meaningsComplete = dailyVocabulary\.length > 0/);
  assert.match(appSource, /const relatedExpressionsComplete = dailyVocabulary\.every/);
  assert.match(appSource, /if \(!meaningsComplete \|\| !relatedExpressionsComplete\) return false/);
  assert.match(appSource, /Clear all related expressions before moving to the next day\./);
  assert.match(appSource, /data-synonym-submit/);
  assert.match(appSource, /data-synonym-typing-form/);
  assert.match(appSource, /dailyQuizWordIds = dailyVocabulary\.map/);
  assert.match(appSource, /data-synonym-retry/);
  assert.match(appSource, /const answerMeanings = question\.answers/);
  assert.match(appSource, /getSynonymPhonetic\(word\.targetWord\)/);
  assert.match(appSource, /getSynonymPhonetic\(item\)/);
  assert.match(appSource, /fetch\(`\/api\/naver-dictionary\?word=/);
  assert.match(appSource, /bindSynonymPhonetics\(\)/);
  assert.doesNotMatch(appSource, /<p class="nav-label space">TRUST<\/p>/);
  assert.match(appSource, /class="suneung-copyright"/);
  assert.match(appSource, /Copyright &amp; Source Policy/);
  assert.doesNotMatch(appSource, /30-DAY SYNONYM COURSE|하루 3~4개씩 정확하게|100개를 한꺼번에 외우지 않고/);
  assert.match(appSource, /class="synonym-course-compact-head"/);
});
