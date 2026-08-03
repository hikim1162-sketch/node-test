import test from "node:test";
import assert from "node:assert/strict";
import {
  favoriteBlogSources,
  favoriteBlogHeroQuotes,
  vocabularyExpansionSourcePriority,
} from "../../data/favorite-blogs.js";

test("favorite blog directory contains the requested six clickable sources", () => {
  assert.deepEqual(favoriteBlogSources.map((source) => source.name), [
    "Espresso English",
    "Speak English With Vanessa",
    "FluentU English Blog",
    "Ellii Blog",
    "Oxford House Barcelona Blog",
    "마리의 공간",
  ]);
  assert.ok(favoriteBlogSources.every((source) => /^https:\/\//.test(source.url)));
  assert.equal(favoriteBlogSources.at(-1).url, "https://blog.naver.com/fdbdd");
});

test("favorite blog hero shows five linked sentences from learning blogs", () => {
  assert.equal(favoriteBlogHeroQuotes.length, 5);
  assert.ok(favoriteBlogHeroQuotes.every((quote) => quote.text && quote.source && /^https:\/\//.test(quote.url)));
});

test("Espresso English is first and marked as recommended", () => {
  assert.equal(favoriteBlogSources[0].id, "espresso-english");
  assert.equal(favoriteBlogSources[0].recommended, true);
  assert.match(favoriteBlogSources[0].url, /espressoenglish\.net\/category\/vocabulary/);
});

test("vocabulary expansion prioritizes internal content before Espresso English", () => {
  assert.deepEqual(vocabularyExpansionSourcePriority.map((source) => source.id), [
    "internal-content",
    "espresso-english",
  ]);
  assert.deepEqual(vocabularyExpansionSourcePriority.map((source) => source.priority), [1, 2]);
});
