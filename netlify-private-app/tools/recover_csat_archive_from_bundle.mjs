import fs from "node:fs";
import path from "node:path";

const assets = path.resolve("dist/assets");
const output = path.resolve("data/imported/csat-english-2021-2026.json");
const files = fs.readdirSync(assets).filter(name => name.endsWith(".js"));
let source = "";
let sourceName = "";

for (const name of files) {
  const content = fs.readFileSync(path.join(assets, name), "utf8");
  if (content.includes("schemaVersion:1") && content.includes("kice-csat-2024-english-31")) {
    source = content;
    sourceName = name;
    break;
  }
}

if (!source) throw new Error("수능 Import 데이터가 포함된 이전 번들을 찾지 못했습니다.");

const marker = "schemaVersion:1";
const markerIndex = source.indexOf(marker);
const start = source.lastIndexOf("{", markerIndex);
let depth = 0;
let quote = "";
let escaped = false;
let end = -1;

for (let index = start; index < source.length; index += 1) {
  const char = source[index];
  if (quote) {
    if (escaped) escaped = false;
    else if (char === "\\") escaped = true;
    else if (char === quote) quote = "";
    continue;
  }
  if (char === "\"" || char === "'" || char === "`") { quote = char; continue; }
  if (char === "{") depth += 1;
  if (char === "}") {
    depth -= 1;
    if (depth === 0) { end = index + 1; break; }
  }
}

if (end < 0) throw new Error("번들 안의 데이터 객체 범위를 찾지 못했습니다.");
const archive = Function(`"use strict";return (${source.slice(start, end)});`)();
if (!Array.isArray(archive.questions) || archive.questions.length < 100) throw new Error("복구 데이터 문항 수가 올바르지 않습니다.");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(archive, null, 2), "utf8");
console.log(`${sourceName}에서 ${archive.questions.length}문항을 복구했습니다.`);
