import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const dataUrl = new URL("../../data/toeic-part5-101-500.json", import.meta.url);
const questions = JSON.parse(await readFile(dataUrl, "utf8"));

test("TOEIC Part 5 dataset contains IDs 101 through 500", () => {
  assert.equal(questions.length, 400);
  assert.deepEqual(questions.map(item => item.id), Array.from({ length: 400 }, (_, index) => index + 101));
});

test("every TOEIC question has a valid answer and supported metadata", () => {
  questions.forEach(question => {
    assert.equal(question.part, 5);
    assert.ok(["grammar", "vocabulary"].includes(question.type));
    assert.ok(["easy", "medium"].includes(question.difficulty));
    assert.equal(question.choices.length, 4);
    assert.equal(new Set(question.choices).size, 4);
    assert.ok(question.choices.includes(question.answer));
    assert.ok(question.question.includes("______"));
    assert.ok(question.explanation.trim());
  });
});

test("dataset keeps the intended grammar and vocabulary balance", () => {
  assert.equal(questions.filter(item => item.type === "grammar").length, 240);
  assert.equal(questions.filter(item => item.type === "vocabulary").length, 160);
});
