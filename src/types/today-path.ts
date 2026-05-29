import type { LearningMode, PressureLevel, TaskStatus, ThemeCategory } from "./learning";

export type WordSeed = {
  id: string;
  word: string;
  meaningZh: string;
  meaningEn?: string;
  phonetic?: string;
  themeCategory: ThemeCategory;
  collocations: string[];
  exampleSentence: string;
  writingTransferSentence?: string;
};

export type SentenceSeed = {
  id: string;
  sentence: string;
  translationZh: string;
  keyStructure?: string;
  gentleExplanation: string;
  upgradedVersion?: string;
};

export type ReadingSeed = {
  id: string;
  title: string;
  passage: string;
  wordCount: number;
  themeCategory: ThemeCategory;
  guidingQuestion: string;
  keyWords: string[];
  longSentence?: string;
  summaryZh: string;
};

export type ExpressionTask = {
  id: string;
  promptZh: string;
  promptEn?: string;
  expectedLength: "one_sentence" | "three_sentences" | "short_paragraph" | "full_writing";
  sentenceFrames?: string[];
};

export type ExamLensTask = {
  id: string;
  examFocus: "main_idea" | "detail" | "inference" | "author_attitude" | "grammar_filling" | "writing_transfer";
  question: string;
  options?: string[];
  answer?: string;
  examinerIntent: string;
};

export type TodayPathStep = {
  id: string;
  type: "word_seed" | "sentence_seed" | "reading_seed" | "expression_task" | "exam_lens";
  title: string;
  description: string;
  status: TaskStatus;
};

export type TodayPath = {
  id: string;
  date: string;
  userId: string;
  mode: LearningMode;
  theme: string;
  themeCategory: ThemeCategory;
  greeting: string;
  estimatedMinutes: 5 | 10 | 15 | 20 | 25;
  pressureLevel: PressureLevel;
  wordSeed: WordSeed;
  sentenceSeed: SentenceSeed;
  readingSeed: ReadingSeed;
  expressionTask: ExpressionTask;
  optionalExamLens?: ExamLensTask;
  steps: TodayPathStep[];
  finalCanSay: string[];
  createdAt: string;
};
