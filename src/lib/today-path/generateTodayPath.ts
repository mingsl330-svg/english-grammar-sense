import { createFallbackExamExpressionTodayPath, createFallbackSenseSpaceTodayPath } from "../../data/fallbackTodayPaths";
import type { UserLearningProfile } from "../../types/profile";
import type { TodayPath } from "../../types/today-path";

export async function generateTodayPath(profile: UserLearningProfile): Promise<TodayPath> {
  const path =
    profile.mode === "sense_space"
      ? createFallbackSenseSpaceTodayPath(profile.userId)
      : createFallbackExamExpressionTodayPath(profile.userId);

  return {
    ...path,
    pressureLevel: profile.pressurePreference,
    userId: profile.userId
  };
}
