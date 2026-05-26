import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const entries = require("../node_modules/ecdict/data/dict.json");

const requiredWords = new Set([
  "abroad",
  "although",
  "because",
  "distract",
  "english",
  "hope",
  "improve",
  "information",
  "smartphone",
  "smartphones",
  "studies",
  "study",
  "teenager",
  "teenagers"
]);

const shouldKeep = (entry) => {
  const tags = String(entry.tag ?? "").split(/\s+/);
  const bnc = Number(entry.bnc || 0);
  const frq = Number(entry.frq || 0);
  const word = String(entry.word ?? "").toLowerCase();
  return (
    requiredWords.has(word) ||
    tags.includes("zk") ||
    tags.includes("gk") ||
    tags.includes("cet4") ||
    entry.oxford === "1" ||
    (bnc > 0 && bnc <= 10000) ||
    (frq > 0 && frq <= 10000)
  );
};

const compact = {};

for (const entry of entries) {
  if (!entry.word || !entry.translation || !shouldKeep(entry)) continue;
  const word = String(entry.word).toLowerCase();
  if (compact[word]) continue;
  compact[word] = {
    word: entry.word,
    phonetic: entry.phonetic || "",
    translation: entry.translation || "",
    definition: entry.definition || "",
    pos: entry.pos || "",
    tag: entry.tag || "",
    bnc: entry.bnc || "",
    frq: entry.frq || "",
    exchange: entry.exchange || "",
    oxford: entry.oxford || ""
  };
}

const source = `/* Auto-generated from ECDICT. Do not edit manually. */\n` +
  `export interface CompactDictionaryEntry {\n` +
  `  word: string;\n` +
  `  phonetic: string;\n` +
  `  translation: string;\n` +
  `  definition: string;\n` +
  `  pos: string;\n` +
  `  tag: string;\n` +
  `  bnc: string;\n` +
  `  frq: string;\n` +
  `  exchange: string;\n` +
  `  oxford: string;\n` +
  `}\n\n` +
  `export const compactDictionary: Record<string, CompactDictionaryEntry> = ${JSON.stringify(compact)};\n`;

writeFileSync(new URL("../src/data/generated/compactDictionary.ts", import.meta.url), source);
console.log(`Generated ${Object.keys(compact).length} dictionary entries.`);
