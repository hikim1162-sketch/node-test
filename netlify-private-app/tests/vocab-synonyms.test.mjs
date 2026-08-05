import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseNaverSynonyms } from "../netlify/functions/naver-dictionary.js";

test("네이버 사전의 유의어 문자열을 중복 없는 링크 목록으로 변환한다", () => {
  assert.deepEqual(
    parseNaverSynonyms("enhance^https://en.dict.naver.com/#/search?query=enhance|reform^https://en.dict.naver.com/#/search?query=reform|enhance^https://en.dict.naver.com/#/search?query=enhance"),
    [
      { word: "enhance", url: "https://en.dict.naver.com/#/search?query=enhance" },
      { word: "reform", url: "https://en.dict.naver.com/#/search?query=reform" },
    ],
  );
});

test("일반모드 단어장 카드가 네이버 유의어 영역을 표시하고 조회한다", async () => {
  const appSource = await readFile(new URL("../../src/app.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../../styles/app.css", import.meta.url), "utf8");

  assert.match(appSource, /container\.className = "vocab-synonyms loading"/);
  assert.match(appSource, /container\.dataset\.vocabSynonyms = word/);
  assert.match(appSource, /function bindVocabularySynonyms\(\)/);
  assert.match(appSource, /result\.synonyms/);
  assert.match(appSource, /네이버 영어사전/);
  assert.match(css, /\.vocab-synonyms\{/);
});
