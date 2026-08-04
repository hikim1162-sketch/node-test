import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const cssPath = new URL("../../styles/app.css", import.meta.url);

test("일반모드 단어장의 발음기호를 13px로 표시한다", async () => {
  const css = await readFile(cssPath, "utf8");

  assert.match(css, /\.vocab-phonetic\{[^}]*font-size:13px!important/);
});

test("일반모드 단어장의 메인 단어를 26px로 표시한다", async () => {
  const css = await readFile(cssPath, "utf8");

  assert.match(css, /\.vocab-today-top h4\{[^}]*font-size:26px/);
});
