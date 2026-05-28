import type { StudentAbilityProfile } from "../types/gaokao";
import type { ProgressState } from "../types/learning";

const clamp = (value: number) => Math.max(35, Math.min(95, Math.round(value)));

export const buildStudentAbilityProfile = (progress: ProgressState): StudentAbilityProfile => {
  const reports = progress.checkInReports;
  const recentWords = reports.slice(0, 7).reduce((sum, report) => sum + report.newWordsLearned.length, 0);
  const recentMistakes = reports.flatMap((report) => report.mistakesEncountered ?? [report.mainMistake]).length;
  const writingSignals = progress.records.filter((record) => record.type === "essay" || record.type === "paragraph").length;
  const stageReports = progress.stageAssessments.length;
  const base = 58 + Math.min(12, reports.length * 2);

  return {
    vocabularyContext: clamp(base + recentWords - recentMistakes),
    grammarRecognition: clamp(base + progress.trainedGrammarPoints.length * 2 - recentMistakes),
    grammarOutput: clamp(progress.imitationAccuracy - 4 + writingSignals * 2),
    longSentenceUnderstanding: clamp(progress.longSentenceAccuracy + stageReports * 3),
    readingInference: clamp(progress.paragraphSummaryQuality + reports.length),
    discourseStructure: clamp(progress.paragraphSummaryQuality + writingSignals * 4),
    culturalExpression: clamp(base + reports.filter((report) => report.nextDayFocus.includes("culture")).length * 5),
    technologyThemeUnderstanding: clamp(base + reports.filter((report) => report.nextDayFocus.toLowerCase().includes("ai")).length * 5),
    opinionExpression: clamp(progress.imitationAccuracy + writingSignals * 3),
    writingOrganization: clamp(progress.paragraphSummaryQuality + writingSignals * 4),
    languageNaturalness: clamp(progress.imitationAccuracy + reports.length),
    examTaskAdaptability: clamp(base + stageReports * 5 + reports.length - recentMistakes)
  };
};
