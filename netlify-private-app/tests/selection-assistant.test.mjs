import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { isDictionaryLookupText } from "../src/selectionAssistant/isDictionaryLookupText.js";
import { selectNaverEntries } from "../netlify/functions/naver-dictionary.js";

test("AI 문장 비서는 set out 같은 짧은 구동사를 사전 검색 대상으로 본다", () => {
  assert.equal(isDictionaryLookupText("set out"), true);
  assert.equal(isDictionaryLookupText("in an effort to"), true);
  assert.equal(isDictionaryLookupText("It is set out in a protocol."), false);
});

test("선택 분석과 네이버 사전 API가 같은 구동사 판별을 사용한다", async () => {
  const appSource = await readFile(new URL("../../src/app.js", import.meta.url), "utf8");
  const dictionarySource = await readFile(new URL("../netlify/functions/naver-dictionary.js", import.meta.url), "utf8");

  assert.match(appSource, /isDictionaryLookupText\(selectionAssistantState\.text\)/);
  assert.match(appSource, /isDictionaryLookupText\(word\)/);
  assert.match(dictionarySource, /isDictionaryLookupText\(word\)/);
});

test("set out 검색은 목적어가 포함된 네이버 구동사 항목도 함께 사용한다", () => {
  const items = [
    { handleEntry: "set out" },
    { handleEntry: "set something out" },
    { handleEntry: "set out on a journey" },
  ];

  assert.deepEqual(selectNaverEntries(items, "set out"), items.slice(0, 2));
});

test("AI 문장 비서는 뜻과 유사문장만 큰 글씨의 학습 카드로 표시한다", async () => {
  const appSource = await readFile(new URL("../../src/app.js", import.meta.url), "utf8");
  const aiSource = await readFile(new URL("../netlify/functions/ai-sentence-analysis.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/legacy-overrides.css", import.meta.url), "utf8");
  const analysisSource = appSource.slice(
    appSource.indexOf("function normalizeSentenceAssistantSections"),
    appSource.indexOf("function positionSelectionTrigger"),
  );

  assert.doesNotMatch(analysisSource, /title: "단어별 뜻"/);
  assert.doesNotMatch(analysisSource, /title: "자주 착각하는 문법"/);
  assert.match(analysisSource, /title: "뜻"/);
  assert.match(aiSource, /Use exactly two sections/);
  assert.doesNotMatch(aiSource, /exactly four sections/);
  assert.match(css, /#app \.selection-ai-learning-card > summary span \{[^}]*font-size: 22px;/s);
  assert.match(css, /#app \.selection-ai-learning-card > div \{[^}]*font-size: 20px;/s);
});
