import type { CompactDictionaryEntry } from "../data/generated/compactDictionary";
import { supplementalDictionary } from "../data/supplementalDictionary";
import type { LearningVersion } from "../types/learning";

type LookupLevel =
  | "小学初中核心"
  | "初中拓展"
  | "超出小初"
  | "基础"
  | "高中核心"
  | "高中进阶"
  | "拓展"
  | "大学及以上"
  | "词库缺项";

export interface LookupEntry {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  meaning: string;
  contextMeaning: string;
  collocation: string;
  example: string;
  level: LookupLevel;
  source: "ecdict" | "supplemental" | "compound-fallback" | "local-missing";
  isOutOfSyllabus?: boolean;
  syllabusNote?: string;
}

const normalize = (word: string) => word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");

let dictionaryCache: Record<string, CompactDictionaryEntry> | undefined;
let exchangeIndexCache: Map<string, string> | undefined;

async function loadDictionary() {
  if (dictionaryCache && exchangeIndexCache) {
    return { dictionary: dictionaryCache, exchangeIndex: exchangeIndexCache };
  }

  const module = await import("../data/generated/compactDictionary");
  const exchangeIndex = new Map<string, string>();
  for (const [baseWord, entry] of Object.entries(module.compactDictionary)) {
    const exchangeParts = entry.exchange.split("/");
    for (const part of exchangeParts) {
      const [, form] = part.split(":");
      if (form && !exchangeIndex.has(form.toLowerCase())) {
        exchangeIndex.set(form.toLowerCase(), baseWord);
      }
    }
  }

  dictionaryCache = module.compactDictionary;
  exchangeIndexCache = exchangeIndex;
  return { dictionary: dictionaryCache, exchangeIndex };
}

const candidatesFor = (rawWord: string, exchangeIndex: Map<string, string>) => {
  const word = normalize(rawWord);
  const candidates = new Set([word]);

  const exchangeBase = exchangeIndex.get(word);
  if (exchangeBase) candidates.add(exchangeBase);

  if (word.endsWith("ies") && word.length > 4) candidates.add(`${word.slice(0, -3)}y`);
  if (word.endsWith("es") && word.length > 3) candidates.add(word.slice(0, -2));
  if (word.endsWith("s") && word.length > 3) candidates.add(word.slice(0, -1));
  if (word.endsWith("ing") && word.length > 5) {
    candidates.add(word.slice(0, -3));
    candidates.add(`${word.slice(0, -3)}e`);
  }
  if (word.endsWith("ed") && word.length > 4) {
    candidates.add(word.slice(0, -2));
    candidates.add(`${word.slice(0, -1)}`);
  }

  return [...candidates].filter(Boolean);
};

const cleanTranslation = (translation: string) =>
  translation
    .replace(/\\n/g, "；")
    .replace(/\[网络\].*$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const levelFor = (
  entry: { tag: string; oxford: string; bnc: string; frq: string },
  version: LearningVersion
): LookupEntry["level"] => {
  const tags = entry.tag.split(/\s+/);
  const bnc = Number(entry.bnc || 0);
  const frq = Number(entry.frq || 0);
  if (version === "primary_junior") {
    if (tags.includes("zk") || entry.oxford === "1" || (frq > 0 && frq <= 2500) || (bnc > 0 && bnc <= 2500)) {
      return "小学初中核心";
    }
    if ((frq > 0 && frq <= 5000) || (bnc > 0 && bnc <= 5000)) return "初中拓展";
    return "超出小初";
  }
  if (tags.includes("zk") || entry.oxford === "1" || (frq > 0 && frq <= 2000) || (bnc > 0 && bnc <= 2000)) {
    return "基础";
  }
  if (tags.includes("gk") || tags.includes("cet4") || (frq > 0 && frq <= 5000) || (bnc > 0 && bnc <= 5000)) {
    return "高中核心";
  }
  if ((frq > 0 && frq <= 10000) || (bnc > 0 && bnc <= 10000)) return "高中进阶";
  return "拓展";
};

const withSyllabusStatus = (entry: LookupEntry, version: LearningVersion): LookupEntry => {
  const isOutOfSyllabus =
    version === "primary_junior"
      ? entry.level === "超出小初" ||
        entry.level === "大学及以上" ||
        entry.level === "词库缺项" ||
        entry.source === "compound-fallback" ||
        entry.source === "local-missing"
      : entry.level === "拓展" ||
        entry.level === "大学及以上" ||
        entry.level === "词库缺项" ||
        entry.source === "compound-fallback" ||
        entry.source === "local-missing";
  return {
    ...entry,
    level: isOutOfSyllabus && entry.level === "词库缺项" ? "大学及以上" : entry.level,
    isOutOfSyllabus,
    syllabusNote: isOutOfSyllabus
      ? version === "primary_junior"
        ? "Beyond the primary-junior required range. Optional learning only; it will not trigger required vocabulary review."
        : "Beyond the high-school core list. Optional learning only; it will not trigger required vocabulary review."
      : version === "primary_junior"
        ? "Within the primary-junior learning range; lookup counts as an activated new word."
        : "Within the current high-school learning range; lookup counts as an activated new word."
  };
};

export async function lookupWord(rawWord: string, version: LearningVersion = "high_school"): Promise<LookupEntry> {
  const { dictionary, exchangeIndex } = await loadDictionary();
  const normalizedWord = normalize(rawWord);

  for (const candidate of candidatesFor(rawWord, exchangeIndex)) {
    const supplemental = supplementalDictionary[candidate];
    if (!supplemental) continue;
    return withSyllabusStatus({
      ...supplemental,
      source: "supplemental"
    }, version);
  }

  for (const candidate of candidatesFor(rawWord, exchangeIndex)) {
    const entry = dictionary[candidate];
    if (!entry) continue;
    const translation = cleanTranslation(entry.translation);
    return withSyllabusStatus({
      word: entry.word,
      phonetic: entry.phonetic,
      partOfSpeech: entry.pos || inferPartOfSpeech(translation),
      meaning: translation || "本地词库暂无中文释义",
      contextMeaning: summarizeContextMeaning(translation),
      collocation: summarizeTags(entry.tag),
      example: entry.definition ? entry.definition.split("\\n")[0] : `${entry.word} appears in this sentence.`,
      level: levelFor(entry, version),
      source: "ecdict"
    }, version);
  }

  const compound = buildCompoundFallback(normalizedWord, dictionary);
  if (compound) return withSyllabusStatus(compound, version);

  return withSyllabusStatus({
    word: rawWord,
    partOfSpeech: "未收录",
    meaning: "超纲词：本地高中/大学前词库暂无可靠中文释义，需由动态句子生成器同步补充 glossary。",
    contextMeaning: "This word is outside the current local dictionary range. Treat it as optional unless the lesson provider adds a verified meaning.",
    collocation: "Out-of-syllabus queue: keep separate from required new-word review.",
    example: rawWord,
    level: "大学及以上",
    source: "local-missing"
  }, version);
}

function buildCompoundFallback(word: string, dictionary: Record<string, CompactDictionaryEntry>): LookupEntry | undefined {
  const parts = splitLikelyCompound(word, dictionary);
  if (!parts) return undefined;
  const [left, right] = parts;
  const leftEntry = dictionary[left];
  const rightEntry = dictionary[right];
  if (!leftEntry || !rightEntry) return undefined;
  const leftMeaning = cleanTranslation(leftEntry.translation).split("；")[0] || left;
  const rightMeaning = cleanTranslation(rightEntry.translation).split("；")[0] || right;
  return {
    word,
    partOfSpeech: "compound word",
    meaning: `${leftMeaning} + ${rightMeaning}（复合词，结合上下文理解）`,
    contextMeaning: `This looks like a compound word made from "${left}" and "${right}". Use the sentence context to decide the exact meaning.`,
    collocation: `compound fallback: ${left} + ${right}`,
    example: `${word} appears in the current sentence as a compound expression.`,
    level: "大学及以上",
    source: "compound-fallback"
  };
}

function splitLikelyCompound(word: string, dictionary: Record<string, CompactDictionaryEntry>) {
  const bases = new Set([word]);
  if (word.endsWith("s") && word.length > 5) bases.add(word.slice(0, -1));
  for (const base of bases) {
    for (let index = 3; index <= base.length - 3; index += 1) {
      const left = base.slice(0, index);
      const right = base.slice(index);
      const pluralRight = `${right}s`;
      if (dictionary[left] && dictionary[right]) return [left, right] as const;
      if (dictionary[left] && dictionary[pluralRight]) return [left, pluralRight] as const;
    }
  }
  return undefined;
}

function inferPartOfSpeech(translation: string) {
  const match = translation.match(/(^|；|\s)(n|v|vt|vi|adj|adv|prep|conj|pron|num|art)\./i);
  return match?.[2] ?? "词条";
}

function summarizeContextMeaning(translation: string) {
  const first = translation.split("；")[0]?.trim();
  return first ? `当前词条常见含义：${first}` : "查看中文释义并结合句子判断具体意思。";
}

function summarizeTags(tag: string) {
  const tags = tag.split(/\s+/).filter(Boolean);
  if (tags.length === 0) return "本地词库词条，暂无考试标签。";
  const labelMap: Record<string, string> = {
    zk: "中考",
    gk: "高考",
    cet4: "四级",
    cet6: "六级",
    ky: "考研",
    ielts: "雅思",
    toefl: "托福"
  };
  return `标签：${tags.map((item) => labelMap[item] ?? item).join(" / ")}`;
}
