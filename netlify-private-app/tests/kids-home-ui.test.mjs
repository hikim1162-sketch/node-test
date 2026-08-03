import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const appPath = new URL("../../src/app.js", import.meta.url);
const cssPath = new URL("../../styles/app.css", import.meta.url);
const mascotPath = new URL("../public/characters/rabbit-duck-study-sticker.png", import.meta.url);

test("초등 홈은 기존 학습 라우트와 3개 필수 미션을 유지한다", async () => {
  const source = await readFile(appPath, "utf8");
  assert.match(source, /id: "words", page: "words"/);
  assert.match(source, /id: "sentence", page: "sentence"/);
  assert.match(source, /id: "test", page: "test"/);
  assert.match(source, /data-page="\$\{item\.page\}"/);
});

test("초등 홈에 필수·선택·가족 영역과 경량 캐릭터 자산이 연결된다", async () => {
  const source = await readFile(appPath, "utf8");
  await access(mascotPath);
  assert.match(source, /kids-home-required/);
  assert.match(source, /kids-more-missions kids-home-section/);
  assert.match(source, /kids-home-family/);
  assert.match(source, /rabbit-duck-study-sticker\.png/);
});

test("초등 홈 스타일은 반응형·다크모드·완료 상태를 포함한다", async () => {
  const css = await readFile(cssPath, "utf8");
  assert.match(css, /\.kids-home-page/);
  assert.match(css, /\.kids-home-page \.kids-mission-card\.done/);
  assert.match(css, /html\[data-theme="dark"\]\[data-audience="kids"\] \.kids-home-hero/);
  assert.match(css, /@media\(max-width:650px\)\{\.kids-home-hero/);
});
