import test from "node:test";
import assert from "node:assert/strict";
import {
  favoriteBlogSources,
  vocabularyExpansionSourcePriority,
} from "../../data/favorite-blogs.js";

test("favorite blog directory contains the requested five clickable sources", () => {
  assert.deepEqual(favoriteBlogSources.map((source) => source.name), [
    "Espresso English",
    "Speak English With Vanessa",
    "FluentU English Blog",
    "Ellii Blog",
    "Oxford House Barcelona Blog",
  ]);
  assert.ok(favoriteBlogSources.every((source) => /^https:\/\//.test(source.url)));
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
