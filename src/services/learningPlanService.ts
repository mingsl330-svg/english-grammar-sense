import { getLearningVersionConfig } from "../data/learningVersions";
import type { LearningVersion, PlacementResult, ProgressState } from "../types/learning";

export type WeeklyDifficultyMode = "support" | "steady" | "stretch";

export interface DailyLearningPlan {
  dayNumber: number;
  weekNumber: number;
  sentenceTarget: number;
  wordTarget: number;
  difficultyMode: WeeklyDifficultyMode;
  placementFocus: string;
  missionTitle: string;
  missionDescription: string;
  challengeHint: string;
  nextDayFocus: string;
  weeklyAdjustment: string;
}

const baseSentenceTargetFor = (version: LearningVersion) => (version === "primary_junior" ? 3 : 5);

export const weekNumberForDay = (dayNumber: number) => Math.max(1, Math.ceil(Math.max(1, dayNumber) / 7));

export const sentenceTargetForWeek = (version: LearningVersion, weekNumber: number) => {
  const twoWeekBlocksCompleted = Math.floor((Math.max(1, weekNumber) - 1) / 2);
  return Math.min(10, baseSentenceTargetFor(version) + twoWeekBlocksCompleted);
};

export const sentenceTargetForDay = (version: LearningVersion, dayNumber: number) =>
  sentenceTargetForWeek(version, weekNumberForDay(dayNumber));

const placementFocusFor = (placement?: PlacementResult) => {
  if (!placement) return "use the first placement result to keep the daily task at the right starting point";
  if (placement.weakAreas.includes("场景含义理解")) return "read the speaker's real intention before trying to answer";
  if (placement.weakAreas.includes("表达自然度")) return "make Chinese-English answers sound like natural English";
  if (placement.weakAreas.includes("迁移表达")) return "reuse today's expression in your own real situation";
  return placement.strengths[0] ?? placement.recommendedStart;
};

const difficultyModeFor = (progress: ProgressState, sentenceTarget: number, wordTarget: number): WeeklyDifficultyMode => {
  const dayNumber = progress.longTermProgress.currentDay;
  const recentReports = progress.checkInReports.filter((report) => report.dayNumber >= dayNumber - 7);
  const activeUnknownWords = progress.unknownWords.filter((word) => !word.mastered).length;
  const recentMistakes = recentReports.flatMap((report) => report.mistakesEncountered ?? [report.mainMistake]);
  const averageScenes =
    recentReports.length > 0
      ? recentReports.reduce((sum, report) => sum + (report.scenarioCount ?? report.completedTasks.length), 0) /
        recentReports.length
      : sentenceTarget;
  const averageWords =
    recentReports.length > 0
      ? recentReports.reduce((sum, report) => sum + report.newWordsLearned.length, 0) / recentReports.length
      : wordTarget;

  if (
    activeUnknownWords >= wordTarget * 3 ||
    recentMistakes.length >= 8 ||
    (recentReports.length >= 3 && (averageScenes < sentenceTarget * 0.8 || averageWords < wordTarget * 0.7))
  ) {
    return "support";
  }

  if (
    recentReports.length >= 4 &&
    averageScenes >= sentenceTarget &&
    averageWords >= wordTarget &&
    activeUnknownWords <= wordTarget * 1.5 &&
    recentMistakes.length <= 4
  ) {
    return "stretch";
  }

  return "steady";
};

export const wordTargetFor = (version: LearningVersion, sentenceTarget: number) => {
  const config = getLearningVersionConfig(version);
  const minimum = version === "primary_junior" ? 3 : 5;
  return Math.min(config.wordTarget, Math.max(minimum, sentenceTarget));
};

export const getDailyLearningPlan = (
  progress: ProgressState,
  version: LearningVersion,
  placement?: PlacementResult
): DailyLearningPlan => {
  const dayNumber = Math.max(1, progress.longTermProgress.currentDay);
  const weekNumber = weekNumberForDay(dayNumber);
  const sentenceTarget = sentenceTargetForWeek(version, weekNumber);
  const wordTarget = wordTargetFor(version, sentenceTarget);
  const difficultyMode = difficultyModeFor(progress, sentenceTarget, wordTarget);
  const placementFocus = placementFocusFor(placement);
  const versionLabel = version === "primary_junior" ? "junior" : "high-school";
  const difficultyText: Record<WeeklyDifficultyMode, string> = {
    support: "keep the same amount, use clearer scenes, and recycle recent weak points",
    steady: "keep the planned amount and balance understanding, natural expression, and transfer",
    stretch: "keep the planned amount and add a little more transfer or sentence upgrading"
  };

  return {
    dayNumber,
    weekNumber,
    sentenceTarget,
    wordTarget,
    difficultyMode,
    placementFocus,
    missionTitle: `Complete ${sentenceTarget} real scenes and activate ${wordTarget} useful words`,
    missionDescription: `Week ${weekNumber} ${versionLabel} plan: ${difficultyText[difficultyMode]}. Focus from placement: ${placementFocus}.`,
    challengeHint: `The planned ${sentenceTarget} scenes are done, but useful words are still below today's target. Add one richer scene from the same ${versionLabel} range and keep the original word scope.`,
    nextDayFocus:
      difficultyMode === "support"
        ? `Tomorrow keeps ${sentenceTarget} scenes and starts from today's weak point: ${placementFocus}.`
        : difficultyMode === "stretch"
          ? `Tomorrow keeps ${sentenceTarget} scenes and asks for a slightly more natural transfer sentence.`
          : `Tomorrow keeps ${sentenceTarget} scenes and recycles today's words in a new situation.`,
    weeklyAdjustment:
      difficultyMode === "support"
        ? "This week should slow the difficulty curve, reuse recent words, and make each scene easier to finish without lowering the planned sentence count."
        : difficultyMode === "stretch"
          ? "This week can keep the planned sentence count and make output a little more open-ended."
          : "This week should follow the planned sentence count and adjust only from real completion, mistakes, and word activation."
  };
};
