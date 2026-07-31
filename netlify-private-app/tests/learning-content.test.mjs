import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { seedLearningContents, validateLearningContent } from "../src/learning/contentStorage.js";
import { todayOrLatest, visibleContents } from "../api/learning-catalog.js";

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
  assert.match(appSource, /const grammarBank = \[/);
  assert.match(appSource, /grammarBank\[Math\.abs\(dateSeed\(dateKey\)\) % grammarBank\.length\]/);
  const grammarBankSource = appSource.slice(appSource.indexOf("const grammarBank = ["), appSource.indexOf("const grammar =", appSource.indexOf("const grammarBank = [")));
  assert.ok((grammarBankSource.match(/prompt:/g) || []).length >= 7);
});
