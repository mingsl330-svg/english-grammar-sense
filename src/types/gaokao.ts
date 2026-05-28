import type { ScenarioSourceCategory } from "./learning";

export type GaokaoLearningPathStage =
  | "word_sense"
  | "sentence_builder"
  | "reading_examiner"
  | "guided_writing"
  | "independent_writing"
  | "exam_simulation";

export type GaokaoTopicId =
  | "chinese_culture"
  | "western_culture"
  | "technology_current"
  | "philosophical_thinking"
  | "campus_life"
  | "social_responsibility"
  | "eco_environment"
  | "youth_growth";

export type GaokaoAbilityDimension =
  | "vocabularyContext"
  | "grammarRecognition"
  | "grammarOutput"
  | "longSentenceUnderstanding"
  | "readingInference"
  | "discourseStructure"
  | "culturalExpression"
  | "technologyThemeUnderstanding"
  | "opinionExpression"
  | "writingOrganization"
  | "languageNaturalness"
  | "examTaskAdaptability";

export interface GrammarPointEntry {
  id: string;
  name: string;
  examFunction: string;
  sentenceUse: string;
  readingUse: string;
  writingUse: string;
  linkedTopicIds: GaokaoTopicId[];
  examples: string[];
}

export interface TopicClusterEntry {
  id: GaokaoTopicId;
  label: string;
  sourceCategory: ScenarioSourceCategory;
  monthlyUse: string;
  readingAngles: string[];
  writingAngles: string[];
}

export interface WordBankEntry {
  word: string;
  topicIds: GaokaoTopicId[];
  collocations: string[];
  examContext: string;
  writingTransfer: string;
  grammarLinks: string[];
}

export interface MonthlyExamTrend {
  monthKey: string;
  title: string;
  topicFocus: TopicClusterEntry[];
  grammarFocus: GrammarPointEntry[];
  questionTypes: string[];
  writingDirections: string[];
  wordFocus: WordBankEntry[];
  examinerNotes: string[];
}

export interface ExaminerReview {
  assessedAbility: string;
  examinerIntent: string;
  answerEvidence: string;
  distractorDesign: string;
  commonMistakes: string[];
  writingTransfer: string;
  nextTraining: string;
}

export interface GaokaoExamTask {
  id: string;
  stage: GaokaoLearningPathStage;
  topicId: GaokaoTopicId;
  title: string;
  prompt: string;
  sourceText?: string;
  options?: string[];
  correctAnswer?: string;
  targetWords: string[];
  grammarIds: string[];
  writingScaffold?: string[];
  examinerReview: ExaminerReview;
}

export interface AiGenerationRecord {
  id: string;
  createdAt: string;
  provider: string;
  prompt: string;
  input: {
    stage: GaokaoLearningPathStage;
    monthKey: string;
    topicId: GaokaoTopicId;
    studentAnswer?: string;
  };
  generatedTask: GaokaoExamTask;
  studentAnswer?: string;
  examinerReview: ExaminerReview;
  validation: {
    ok: boolean;
    errors: string[];
  };
}

export type StudentAbilityProfile = Record<GaokaoAbilityDimension, number>;
