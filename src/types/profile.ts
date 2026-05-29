import type { AICompanionStyle, LearningMode, LearningStage, PressureLevel, ThemeCategory } from "./learning";

export type UserLearningProfile = {
  userId: string;
  stage: LearningStage;
  mode: LearningMode;
  ageGroupLabel: string;
  learningGoal:
    | "build_language_sense"
    | "improve_school_english"
    | "prepare_gaokao"
    | "improve_writing"
    | "academic_expression";
  pressurePreference: PressureLevel;
  aiCompanionStyle: AICompanionStyle;
  showExamLabels: boolean;
  showScores: boolean;
  showGaokaoDirection: boolean;
  preferredThemes: ThemeCategory[];
  vocabularyLevel: number;
  sentenceComplexity: number;
  readingLength: number;
  grammarComplexity: number;
  writingIndependence: number;
  abstractThinkingLevel: number;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
};

const now = () => new Date().toISOString();

export const createDefaultSenseSpaceProfile = (): UserLearningProfile => ({
  userId: "local-user",
  stage: "middle",
  mode: "sense_space",
  ageGroupLabel: "小学到初中",
  learningGoal: "build_language_sense",
  pressurePreference: "low",
  aiCompanionStyle: "gentle_friend",
  showExamLabels: false,
  showScores: false,
  showGaokaoDirection: false,
  preferredThemes: ["daily_life", "school_life", "emotion", "nature"],
  vocabularyLevel: 2,
  sentenceComplexity: 2,
  readingLength: 150,
  grammarComplexity: 1,
  writingIndependence: 1,
  abstractThinkingLevel: 1,
  createdAt: now(),
  updatedAt: now()
});

export const createDefaultExamExpressionProfile = (): UserLearningProfile => ({
  userId: "local-user",
  stage: "high",
  mode: "exam_expression",
  ageGroupLabel: "高中到大学",
  learningGoal: "prepare_gaokao",
  pressurePreference: "medium",
  aiCompanionStyle: "examiner",
  showExamLabels: true,
  showScores: true,
  showGaokaoDirection: true,
  preferredThemes: ["chinese_culture", "technology", "environment", "personal_growth"],
  vocabularyLevel: 4,
  sentenceComplexity: 4,
  readingLength: 350,
  grammarComplexity: 4,
  writingIndependence: 3,
  abstractThinkingLevel: 3,
  createdAt: now(),
  updatedAt: now()
});
