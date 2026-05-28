import { lookupWord } from "./dictionaryService";
import type { LearningScenario, LearningVersion } from "../types/learning";

export interface DailyVocabularyTarget {
  word: string;
  normalized: string;
  meaning: string;
  phonetic?: string;
  example: string;
  sourceSentence: string;
  sourceTitle: string;
}

const normalize = (word: string) =>
  word
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/g, "")
    .replace(/'s$/, "");

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "by",
  "can",
  "do",
  "does",
  "for",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "my",
  "of",
  "on",
  "one",
  "or",
  "sb",
  "some",
  "someone",
  "something",
  "sth",
  "that",
  "the",
  "this",
  "those",
  "these",
  "to",
  "what",
  "when",
  "where",
  "why",
  "with",
  "you",
  "your"
]);

const isReviewBridgeScenario = (scenario: LearningScenario) =>
  scenario.id.includes("review-bridge") || scenario.title.toLowerCase().includes("yesterday comes back");

export const collectDailyVocabularySeeds = (scenarios: LearningScenario[], limit: number) => {
  const seeds: Array<{ word: string; sourceSentence: string; sourceTitle: string }> = [];
  const seen = new Set<string>();
  const orderedScenarios = [
    ...scenarios.filter((scenario) => !isReviewBridgeScenario(scenario)),
    ...scenarios.filter(isReviewBridgeScenario)
  ];

  for (const scenario of orderedScenarios) {
    const words = [
      ...scenario.vocabularyFocus,
      ...scenario.targetExpressions.flatMap((expression) => expression.match(/[A-Za-z']+/g) ?? [])
    ];
    for (const word of words) {
      const normalized = normalize(word);
      if (!normalized || normalized.length < 3 || stopWords.has(normalized) || seen.has(normalized)) continue;
      seen.add(normalized);
      seeds.push({
        word: normalized,
        sourceSentence: scenario.languageInput,
        sourceTitle: scenario.title
      });
      if (seeds.length >= limit) return seeds;
    }
  }

  return seeds;
};

export const buildDailyVocabularyTargets = async (
  scenarios: LearningScenario[],
  version: LearningVersion,
  limit: number
): Promise<DailyVocabularyTarget[]> => {
  const seeds = collectDailyVocabularySeeds(scenarios, limit);
  const targets = await Promise.all(
    seeds.map(async (seed) => {
      const entry = await lookupWord(seed.word, version);
      return {
        word: entry.word,
        normalized: normalize(entry.word || seed.word),
        meaning: entry.meaning,
        phonetic: entry.phonetic,
        example: entry.example || seed.sourceSentence,
        sourceSentence: seed.sourceSentence,
        sourceTitle: seed.sourceTitle
      };
    })
  );

  return targets;
};
