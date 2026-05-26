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

const normalize = (word: string) => word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "i",
  "is",
  "it",
  "my",
  "of",
  "the",
  "to",
  "you",
  "your"
]);

export const collectDailyVocabularySeeds = (scenarios: LearningScenario[], limit: number) => {
  const seeds: Array<{ word: string; sourceSentence: string; sourceTitle: string }> = [];
  const seen = new Set<string>();

  for (const scenario of scenarios) {
    const words = [
      ...scenario.vocabularyFocus,
      ...scenario.targetExpressions.flatMap((expression) => expression.match(/[A-Za-z']+/g) ?? [])
    ];
    for (const word of words) {
      const normalized = normalize(word);
      if (!normalized || normalized.length < 3 || stopWords.has(normalized) || seen.has(normalized)) continue;
      seen.add(normalized);
      seeds.push({
        word,
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
