import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { VOCAB_MODE_CONFIGS, getVocabModeConfig } from "../src/features/csat-vocab/modeConfig.js";
import { normalizeWord } from "../src/features/csat-vocab/normalizeWord.js";

const elementaryPath = new URL("../src/features/csat-vocab/data/elementary500.json", import.meta.url);

test("수능 설정은 기본값과 기존 3개 코스를 유지한다", () => {
  const config = getVocabModeConfig("unknown");
  assert.equal(config, VOCAB_MODE_CONFIGS.suneung);
  assert.deepEqual(config.seriesKeys, ["basic", "csat2000", "hyper1000"]);
  assert.deepEqual(config.questionTypes, ["word-to-meaning", "meaning-to-word"]);
});

test("초등 설정은 같은 5개 탭과 초등형 평가 문구를 사용한다", () => {
  const config = getVocabModeConfig("kids");
  assert.equal(config.labels.tabs.length, 5);
  assert.equal(config.labels.rating.known, "알아요");
  assert.equal(config.labels.rating.unknown, "몰라요");
  assert.equal(config.canonicalProgressSeries, "elementary500");
});

test("초등500 데이터는 20단어씩 25 Day로 구성된다", async () => {
  const words = JSON.parse(await readFile(elementaryPath, "utf8"));
  assert.equal(words.length, 500);
  const counts = new Map();
  words.forEach((word) => counts.set(Number(word.day), (counts.get(Number(word.day)) || 0) + 1));
  assert.equal(counts.size, 25);
  assert.ok([...counts.values()].every((count) => count === 20));
  assert.equal(new Set(words.map((word) => word.id)).size, 500);
});

test("레거시 단어 필드는 공통 단어 계약으로 정규화된다", () => {
  const word = normalizeWord({
    id: "elementary500-1",
    series: "elementary500",
    day: 1,
    order: 1,
    word_display: "apple",
    meaning_display: "사과",
    example: "This is an apple.",
    exampleMeaning: "이것은 사과입니다.",
  }, { key: "elementary500", mode: "kids" });
  assert.equal(word.mode, "kids");
  assert.equal(word.course, "elementary500");
  assert.equal(word.word, "apple");
  assert.equal(word.meaningKo, "사과");
  assert.equal(word.exampleEn, "This is an apple.");
  assert.equal(word.imageUrl, null);
});
