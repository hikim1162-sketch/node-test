import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { seedLearningContents, validateLearningContent } from "../src/learning/contentStorage.js";
import { todayOrLatest, visibleContents } from "../api/learning-catalog.js";
import { vocabularyWords } from "../../data/vocabulary.js";
import { vocabularyPartOfSpeech } from "../../data/vocabulary-pos.js";
import { vocabularyExamples } from "../../data/vocabulary-examples.js";
import { vocabularyTestOverrides } from "../../data/vocabulary-test-overrides.js";

test("seed includes both independent learning modes", () => {
  assert.ok(seedLearningContents.some((item) => item.type === "daily_sentence"));
  assert.ok(seedLearningContents.some((item) => item.type === "ted_learning"));
});

test("only published, non-future content is visible", () => {
  const visible = visibleContents("daily_sentence", new Date("2026-07-29T12:00:00+09:00"));
  assert.ok(visible.length > 0);
  assert.ok(visible.every((item) => item.status === "published" && item.publishDate <= "2026-07-29"));
});

test("today content wins over older published content", () => {
  const content = todayOrLatest("ted_learning", new Date("2026-07-29T12:00:00+09:00"));
  assert.equal(content.publishDate, "2026-07-29");
});

test("type-specific required fields are validated", () => {
  const dailyErrors = validateLearningContent({ type: "daily_sentence", title: "a", publishDate: "2026-07-29", status: "draft" });
  assert.ok(dailyErrors.expressionEn);
  const tedErrors = validateLearningContent({ type: "ted_learning", title: "a", publishDate: "2026-07-29", status: "draft" });
  assert.ok(tedErrors.contextText);
});

test("daily quick test rotates grammar questions by date", () => {
  const appSource = readFileSync(new URL("../../src/app.js", import.meta.url), "utf8");
  assert.match(appSource, /selectedWords = seededShuffle\(todayWords, `\$\{dateKey\}-quick-words`\)\.slice\(0, 2\)/);
  assert.match(appSource, /const reverse = \(dateSeed\(dateKey\) \+ index\) % 2 !== 0/);
  assert.match(appSource, /sentenceQuestionBank[\s\S]*?sentence-types`\)\.slice\(0, 2\)/);
  assert.match(appSource, /const grammarBank = \[/);
  assert.match(appSource, /grammarBank\[Math\.abs\(dateSeed\(dateKey\)\) % grammarBank\.length\]/);
  assert.match(appSource, /data-quick-date="-1"/);
  assert.match(appSource, /data-quick-date="1"/);
  assert.match(appSource, /daily-quick-bottom-nav/);
  assert.match(appSource, /다음 날 문제/);
  assert.match(appSource, /dailyQuickTestState\.viewDate = offsetQuickTestDateKey/);
  const grammarBankSource = appSource.slice(appSource.indexOf("const grammarBank = ["), appSource.indexOf("const grammar =", appSource.indexOf("const grammarBank = [")));
  assert.ok((grammarBankSource.match(/prompt:/g) || []).length >= 7);
});

test("TOEIC RC questions live in the daily TOEIC area, not Daily Test tabs", () => {
  const appSource = readFileSync(new URL("../../src/app.js", import.meta.url), "utf8");
  assert.match(appSource, /function ensureDailyRcQuestionsInToeic\(\)/);
  assert.match(appSource, /category: "TOEIC RC"/);
  const dailyTestSource = appSource.slice(appSource.indexOf("function dailyTestPage()"), appSource.indexOf("function dailyTestScoreCard"));
  assert.doesNotMatch(dailyTestSource, /\["rc", "RC 문제"\]/);
  assert.match(dailyTestSource, /토익 RC 문제는 ‘매일 토익 풀기’에서 제공합니다/);
  assert.match(dailyTestSource, /class="test-question-nav"/);
  assert.match(dailyTestSource, /data-test-prev/);
  assert.match(dailyTestSource, /data-test-next/);
  assert.match(dailyTestSource, /class="test-question-prompt"/);
  assert.doesNotMatch(dailyTestSource, /<nav class="test-tabs"/);
  assert.doesNotMatch(dailyTestSource, /\$\{pageContent\}/);
});

test("hidden navigation items are also hidden from today's learning dashboard", () => {
  const appSource = readFileSync(new URL("../../src/app.js", import.meta.url), "utf8");
  assert.match(appSource, /hiddenHomeMenuIds = new Set\(loadUserSettings\(\)\.navigation\.hiddenMenuIds\)/);
  assert.match(appSource, /visibleHomeStudyItems = homeStudyItems\s*\.filter\(item => !hiddenHomeMenuIds\.has\(item\.id\)\)/);
  assert.match(appSource, /number: String\(index \+ 1\)\.padStart\(2, "0"\)/);
  assert.match(appSource, /silentHomeCoach\(homeAppState, completed, visibleHomeStudyItems\)/);
});

test("monthly vocabulary test immediately refreshes an incorrect question without a retry click", () => {
  const appSource = readFileSync(new URL("../../src/app.js", import.meta.url), "utf8");
  assert.match(appSource, /다른 보기를 바로 선택하세요\./);
  assert.match(appSource, /wrongSelection = \{ index: vocabMonthlyTestState\.index, choice: selectedAnswer \}/);
  assert.doesNotMatch(appSource, /data-vocab-test-question-retry/);
  assert.match(appSource, /correct && choiceIndex === question\.answer/);
});

test("월간 단어 시험의 영어 단어를 더블클릭하면 네이버 영어사전을 연다", () => {
  const appSource = readFileSync(new URL("../../src/app.js", import.meta.url), "utf8");

  assert.match(appSource, /testWordHeading\.dataset\.vocabTestDictionary = testWord/);
  assert.match(appSource, /querySelector\("\.vocab-test-modal > article h3"\)/);
  assert.match(appSource, /addEventListener\("dblclick"/);
  assert.match(appSource, /https:\/\/en\.dict\.naver\.com\/#\/search\?query=/);
});

test("monthly vocabulary test uses a meaning that matches the word part of speech", () => {
  const appSource = readFileSync(new URL("../../src/app.js", import.meta.url), "utf8");
  const vocabularySource = readFileSync(new URL("../../data/vocabulary.js", import.meta.url), "utf8");
  assert.match(appSource, /function vocabMonthlyTestMeaning\(word\)/);
  assert.match(appSource, /vocabularyExamples\[term\]\?\.meanings\?\.\[part\]/);
  assert.match(appSource, /monthlyPool\.map\(vocabMonthlyTestMeaning\)/);
  assert.match(vocabularySource, /"word": "predict"[\s\S]*?"meaning": "예측하다, 예언하다"/);
  assert.match(vocabularySource, /"word": "preceding"[\s\S]*?"meaning": "앞선, 이전의, 선행하는"/);
  assert.match(appSource, /function vocabPartLabel\(part\)/);
  assert.match(appSource, /vocabPartLabel\(question\.part\)/);
});

test("all one thousand monthly-test words have a reviewed part of speech and meaning", () => {
  const supportedParts = new Set(["noun", "verb", "adjective", "adverb", "preposition", "conjunction"]);
  assert.equal(vocabularyWords.length, 1000);
  for (const word of vocabularyWords) {
    const term = word.word.toLowerCase();
    const override = vocabularyTestOverrides[term];
    const parts = override?.part ? [override.part] : (vocabularyPartOfSpeech[term] || []);
    assert.ok(parts.some(part => supportedParts.has(part)), `${word.word}: 품사 없음`);
    const meaning = override?.meaning || parts
      .map(part => vocabularyExamples[term]?.meanings?.[part]?.[0])
      .find(Boolean) || word.meaning;
    assert.ok(typeof meaning === "string" && meaning.trim(), `${word.word}: 뜻 없음`);
  }
});
