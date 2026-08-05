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
